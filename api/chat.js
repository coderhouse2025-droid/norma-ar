// api/chat.js
// RAG pipeline: Pinecone (contexto) + Groq/GPT-OSS 120B (generación), con streaming.

// ── Rate limiting (best-effort, en memoria) ─────────────────────────────
// En serverless cada instancia tiene su propia memoria: esto frena abuso
// dentro de una misma instancia "caliente", pero NO es un límite global
// garantizado entre instancias. Para eso, reemplazar por Upstash Redis /
// Vercel KV (INCR con TTL) usando la misma función isRateLimited().
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minuto
const RATE_LIMIT_MAX_REQUESTS = 15; // solicitudes por IP por minuto
const rateLimitStore = new Map(); // ip -> [timestamps]

// ── Modelos (configurables desde las variables de entorno de Vercel) ─────
const MODELO_PRINCIPAL = "openai/gpt-oss-120b";
// Opcional: modelo al que se recurre cuando el principal alcanzó su límite por minuto.
// Si no se define GROQ_FALLBACK_MODEL, no hay respaldo y se informa el error.
const MODELO_RESPALDO = process.env.GROQ_FALLBACK_MODEL || "";
// Opcional: "low", "medium" o "high". Menos razonamiento gasta menos tokens por consulta.
const REASONING_EFFORT = process.env.GROQ_REASONING_EFFORT || "";

// ── Presupuesto de tokens por consulta ───────────────────────────────────
// El plan gratuito de Groq admite 8.000 tokens por minuto (entrada + salida).
// Se reduce el peso de cada consulta para que entren más por minuto.
const MAX_TOKENS_SALIDA = 1500; // tope de la respuesta (incluye el razonamiento del modelo)
const PRESUPUESTO_TOKENS = 7000; // entrada estimada + salida máxima por consulta
const CHARS_POR_TOKEN = 3.5; // estimación para español (conservadora)
const MAX_HISTORIAL = 3; // mensajes previos que se reenvían (pregunta, respuesta, pregunta)
const MAX_CHARS_RESPUESTA_HISTORIAL = 700; // las respuestas viejas se recortan
const MIN_FRAGMENTOS = 3; // mínimo de fragmentos si hay que recortar contexto

const estimarTokens = (texto) => Math.ceil((texto || "").length / CHARS_POR_TOKEN);

const MAX_MESSAGES = 30; // turnos máximos en el historial enviado
const MAX_MESSAGE_LENGTH = 4000; // caracteres máximos por mensaje
const MAX_SYSTEM_LENGTH = 8000; // caracteres máximos del system prompt

function getClientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (fwd) return String(fwd).split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}

function isRateLimited(ip) {
  const now = Date.now();
  const timestamps = (rateLimitStore.get(ip) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  timestamps.push(now);
  rateLimitStore.set(ip, timestamps);

  // Limpieza ocasional para no crecer indefinidamente en memoria
  if (rateLimitStore.size > 5000) {
    for (const [key, arr] of rateLimitStore) {
      if (arr.every((t) => now - t > RATE_LIMIT_WINDOW_MS)) rateLimitStore.delete(key);
    }
  }

  return timestamps.length > RATE_LIMIT_MAX_REQUESTS;
}

function validateBody(body) {
  if (!body || typeof body !== "object") {
    return "Cuerpo de la solicitud inválido.";
  }
  const { messages, system } = body;

  if (typeof system !== "string" || system.length === 0) {
    return "Falta el system prompt.";
  }
  if (system.length > MAX_SYSTEM_LENGTH) {
    return "El system prompt supera el máximo permitido.";
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return "El historial de mensajes es inválido.";
  }
  if (messages.length > MAX_MESSAGES) {
    return `El historial supera el máximo permitido (${MAX_MESSAGES} mensajes). Iniciá una conversación nueva.`;
  }
  for (const m of messages) {
    if (
      !m ||
      typeof m.content !== "string" ||
      m.content.length === 0 ||
      !["user", "assistant"].includes(m.role)
    ) {
      return "Formato de mensaje inválido.";
    }
    if (m.content.length > MAX_MESSAGE_LENGTH) {
      return `Un mensaje supera el máximo de ${MAX_MESSAGE_LENGTH} caracteres.`;
    }
  }
  return null;
}

// Reintenta cuando Groq responde 429 (límite de tokens por minuto, TPM).
// Espera el tiempo que indica el propio error y reintenta; el máximo de espera es
// corto para no pasarse del tiempo permitido por la función en Vercel.
async function fetchGroqConReintento(url, init, maxIntentos = 3) {
  for (let intento = 1; ; intento++) {
    const r = await fetch(url, init);
    if (r.status !== 429 || intento >= maxIntentos) return r;

    const body = await r.clone().json().catch(() => ({}));
    const msg = body?.error?.message || "";
    let esperaMs = 1000;
    const m = msg.match(/try again in ([\d.]+)\s*(ms|s)/i);
    if (m) esperaMs = parseFloat(m[1]) * (m[2].toLowerCase() === "ms" ? 1 : 1000) + 250;
    else if (r.headers.get("retry-after")) esperaMs = parseFloat(r.headers.get("retry-after")) * 1000;

    if (!(esperaMs <= 4000)) return r; // espera demasiado larga: se informa el error
    console.warn(`Groq 429, reintento ${intento} en ${Math.round(esperaMs)} ms`);
    await new Promise((ok) => setTimeout(ok, esperaMs));
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: { message: "Method not allowed" } });
  }

  // ── Rate limiting ────────────────────────────────────────────────────
  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    return res.status(429).json({
      error: { message: "Demasiadas solicitudes. Esperá un momento antes de volver a intentar." },
    });
  }

  // ── Validación de entrada ───────────────────────────────────────────
  const validationError = validateBody(req.body);
  if (validationError) {
    return res.status(400).json({ error: { message: validationError } });
  }

  const { messages, system } = req.body;

  try {
    const ultimaPregunta = messages[messages.length - 1]?.content || "";

    // ── 1. Buscar contexto relevante en Pinecone ──────────────────────
    let fragmentos = [];
    try {
      const pineconeRes = await fetch(
        "https://normativa-nuclear-ku9bass.svc.aped-4627-b74a.pinecone.io/records/namespaces/normativa-nuclear/search",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Api-Key": process.env.PINECONE_API_KEY,
            "X-Pinecone-API-Version": "2025-10",
          },
          body: JSON.stringify({
            query: { inputs: { text: ultimaPregunta }, top_k: 6 },
            // El índice solo guarda "text" y "source" como metadata — no hay número
            // de página. Si en algún momento se agrega esa metadata al pipeline de
            // indexación, sumar el campo acá (ej. "page" o "pagina") vuelve a habilitar
            // las citas con página en el prompt de más abajo.
            fields: ["text", "source"],
          }),
        }
      );

      if (pineconeRes.ok) {
        const pineconeData = await pineconeRes.json();
        const resultados = pineconeData.result?.hits || [];
        fragmentos = resultados.map(
          (r) => `[${r.fields?.source || "doc"}]\n${r.fields?.text || ""}`
        );
      } else {
        const errText = await pineconeRes.text().catch(() => "");
        console.error("Pinecone respondió con error:", pineconeRes.status, errText);
      }
    } catch (pineconeErr) {
      // Si Pinecone falla, seguimos sin contexto documental en vez de
      // romper toda la respuesta.
      console.error("Fallo al consultar Pinecone:", pineconeErr);
    }

    // Instrucción breve sobre los fragmentos. Las reglas de cita y de guías ya están
    // en el prompt del sistema (reglas 7 y 14), por eso aquí no se repiten.
    const INSTRUCCION_FRAGMENTOS =
      'Usá estos fragmentos como base de la respuesta. Los que empiezan con "GUÍA" son guías orientativas de la ARN, no la norma: aclaralo, explicá primero lo que establece la norma y después lo que recomienda la guía, y citá cada una en su propio corchete final. No indiques número de página.';

    const armarSistema = (frags) =>
      frags.length > 0
        ? `${system}\n\n## Fragmentos relevantes de la documentación oficial:\n\n${frags.join("\n\n---\n\n")}\n\n${INSTRUCCION_FRAGMENTOS}`
        : system;

    // Historial reducido: se recortan las respuestas anteriores, que son lo que más pesa.
    let historial = messages.slice(-MAX_HISTORIAL).map((m) =>
      m.role === "assistant" && m.content.length > MAX_CHARS_RESPUESTA_HISTORIAL
        ? { ...m, content: m.content.slice(0, MAX_CHARS_RESPUESTA_HISTORIAL) + "…" }
        : m
    );

    // Control de admisión: si la consulta estimada supera el presupuesto, se recorta
    // primero el historial más viejo y luego los fragmentos de menor relevancia.
    const pesoConsulta = () =>
      estimarTokens(armarSistema(fragmentos)) +
      historial.reduce((acc, m) => acc + estimarTokens(m.content), 0) +
      MAX_TOKENS_SALIDA;
    while (pesoConsulta() > PRESUPUESTO_TOKENS) {
      if (historial.length > 1) historial = historial.slice(1);
      else if (fragmentos.length > MIN_FRAGMENTOS) fragmentos = fragmentos.slice(0, -1);
      else break;
    }
    const systemConContexto = armarSistema(fragmentos);
    console.log(
      `Consulta estimada: ~${pesoConsulta()} tokens (sistema+contexto ~${estimarTokens(systemConContexto)}, historial ${historial.length} mensajes, ${fragmentos.length} fragmentos)`
    );

    // ── 2. Llamar a Groq con streaming ─────────────────────────────────
    const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
    const armarPedido = (modelo) => ({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: modelo,
        max_tokens: MAX_TOKENS_SALIDA,
        temperature: 0.2,
        stream: true,
        ...(REASONING_EFFORT ? { reasoning_effort: REASONING_EFFORT } : {}),
        messages: [{ role: "system", content: systemConContexto }, ...historial],
      }),
    });

    let groqRes = await fetchGroqConReintento(GROQ_URL, armarPedido(MODELO_PRINCIPAL));

    // Si el modelo principal sigue limitado (espera larga), se prueba con el modelo
    // de respaldo, que tiene su propio cupo por minuto. Solo si está configurado.
    if (groqRes.status === 429 && MODELO_RESPALDO) {
      console.warn(`Groq 429 en ${MODELO_PRINCIPAL}: se usa el modelo de respaldo ${MODELO_RESPALDO}`);
      groqRes = await fetchGroqConReintento(GROQ_URL, armarPedido(MODELO_RESPALDO));
    }

    if (!groqRes.ok || !groqRes.body) {
      const errBody = await groqRes.json().catch(() => ({}));
      console.error("Groq respondió con error:", groqRes.status, errBody);
      if (groqRes.status === 429) {
        return res.status(429).json({
          error: { message: "El servicio está con mucha demanda en este momento. Esperá unos segundos e intentá de nuevo." },
        });
      }
      return res.status(502).json({
        error: { message: "No se pudo generar la respuesta. Intentá de nuevo en unos segundos." },
      });
    }

    // ── 3. Reenviar el stream al cliente en formato NDJSON ─────────────
    res.writeHead(200, {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Content-Type-Options": "nosniff",
    });

    const reader = groqRes.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;

          const payload = trimmed.slice(5).trim();
          if (payload === "[DONE]") continue;

          try {
            const parsed = JSON.parse(payload);
            const uso = parsed.usage || parsed.x_groq?.usage;
            if (uso) console.log("Uso real de tokens (Groq):", JSON.stringify(uso));
            const fin = parsed.choices?.[0]?.finish_reason;
            if (fin === "length") console.warn("Respuesta cortada por max_tokens (finish_reason=length)");
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              res.write(JSON.stringify({ type: "delta", text: delta }) + "\n");
            }
          } catch {
            // Línea parcial o no-JSON: se ignora, ya se completará en el próximo chunk.
          }
        }
      }
    } catch (streamErr) {
      console.error("Error leyendo el stream de Groq:", streamErr);
      res.write(JSON.stringify({ type: "error", message: "Se interrumpió la generación de la respuesta." }) + "\n");
    }

    res.write(JSON.stringify({ type: "done" }) + "\n");
    return res.end();
  } catch (e) {
    console.error("Error inesperado en /api/chat:", e);
    if (!res.headersSent) {
      return res.status(500).json({ error: { message: "Ocurrió un error interno. Intentá de nuevo." } });
    }
    return res.end();
  }
}
