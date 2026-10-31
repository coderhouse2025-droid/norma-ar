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

// ── Proveedores del modelo (configurables desde las variables de entorno de Vercel) ──
// Se pueden usar hasta dos proveedores del mismo modelo (gpt-oss-120b). El principal responde
// siempre; si falla por límite de uso (429) o error del servidor, se usa el otro como respaldo.
//   · Groq (muy rápido, pero con tope de tokens por minuto en el plan gratuito):
//       GROQ_API_KEY   (y opcional GROQ_MODEL)
//   · Alternativo compatible con la API de OpenAI (por ejemplo DeepInfra, sin tope por minuto):
//       LLM_BASE_URL = https://api.deepinfra.com/v1/openai/chat/completions
//       LLM_API_KEY  = (clave del proveedor)
//       LLM_MODEL    = openai/gpt-oss-120b
//   · Orden: LLM_PRIMARY = "groq" o "alt". Si no se define, el principal es el alternativo
//     (si está configurado) y Groq queda de respaldo.
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODELO_DEFECTO = "openai/gpt-oss-120b";

// Opcional: "low", "medium" o "high". Menos razonamiento = respuestas más rápidas y menos tokens.
// Por defecto "low". Para desactivarlo, definir LLM_REASONING_EFFORT = none.
const REASONING_EFFORT = (() => {
  const v = (process.env.LLM_REASONING_EFFORT || process.env.GROQ_REASONING_EFFORT || "low").toLowerCase();
  return v === "none" ? "" : v;
})();

// ── Presupuesto de tokens por consulta ───────────────────────────────────
// Groq (plan gratuito) admite 8.000 tokens por minuto (entrada + salida), por eso su
// presupuesto es chico. El proveedor alternativo no tiene ese tope, así que usa más contexto.
const CHARS_POR_TOKEN = 3.5; // estimación para español (conservadora)
const MAX_HISTORIAL = 3; // mensajes previos que se reenvían (pregunta, respuesta, pregunta)
const MAX_CHARS_RESPUESTA_HISTORIAL = 700; // las respuestas viejas se recortan
const MIN_FRAGMENTOS = 3; // mínimo de fragmentos si hay que recortar contexto

const PROVEEDOR_GROQ = process.env.GROQ_API_KEY
  ? {
      nombre: "groq",
      url: GROQ_URL,
      key: process.env.GROQ_API_KEY,
      modelo: process.env.GROQ_MODEL || MODELO_DEFECTO,
      maxTokens: 1500,
      presupuesto: 7000,
    }
  : null;
const PROVEEDOR_ALT =
  process.env.LLM_BASE_URL && process.env.LLM_API_KEY
    ? {
        nombre: "alt",
        url: process.env.LLM_BASE_URL,
        key: process.env.LLM_API_KEY,
        modelo: process.env.LLM_MODEL || MODELO_DEFECTO,
        maxTokens: Number(process.env.LLM_MAX_TOKENS) || 2000,
        presupuesto: Number(process.env.LLM_TOKEN_BUDGET) || 24000,
      }
    : null;
const PROVEEDORES = (
  (process.env.LLM_PRIMARY || "").toLowerCase() === "groq"
    ? [PROVEEDOR_GROQ, PROVEEDOR_ALT]
    : [PROVEEDOR_ALT, PROVEEDOR_GROQ]
).filter(Boolean);

// Con un proveedor sin tope por minuto se recuperan más fragmentos (mejor cobertura).
const TOP_K = Number(process.env.LLM_TOP_K) || (PROVEEDOR_ALT ? 8 : 6);

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

// Reintenta cuando el proveedor responde 429 (límite de uso). Espera el tiempo que indica el
// propio error, hasta un máximo corto para no pasarse del tiempo permitido por la función en
// Vercel. Si hay otro proveedor de respaldo, la espera máxima es menor (se prefiere cambiar).
async function fetchConReintento(url, init, { maxIntentos = 3, maxEsperaMs = 4000, nombre = "" } = {}) {
  for (let intento = 1; ; intento++) {
    const r = await fetch(url, init);
    if (r.status !== 429 || intento >= maxIntentos) return r;

    const body = await r.clone().json().catch(() => ({}));
    const msg = body?.error?.message || "";
    let esperaMs = 1000;
    const m = msg.match(/try again in ([\d.]+)\s*(ms|s)/i);
    if (m) esperaMs = parseFloat(m[1]) * (m[2].toLowerCase() === "ms" ? 1 : 1000) + 250;
    else if (r.headers.get("retry-after")) esperaMs = parseFloat(r.headers.get("retry-after")) * 1000;

    if (!(esperaMs <= maxEsperaMs)) return r; // espera demasiado larga: se cambia de proveedor o se informa
    console.warn(`${nombre} 429, reintento ${intento} en ${Math.round(esperaMs)} ms`);
    await new Promise((ok) => setTimeout(ok, esperaMs));
  }
}

// ── Construcción de la consulta de búsqueda ─────────────────────────────
// La búsqueda semántica falla con preguntas muy cortas o de seguimiento ("¿y para reactores
// de investigación?") porque, sin contexto, no tienen suficiente significado. Se mejoran dos cosas:
// 1) las preguntas de seguimiento se buscan junto con la pregunta anterior;
// 2) las preguntas cortas se amplían con términos de la normativa (glosario editable).
const GLOSARIO_BUSQUEDA = [
  { patron: /dosis|l[ií]mites?|exposici[oó]n|radiaci[oó]n/i, agregar: "límites de dosis para trabajadores y miembros del público, exposición ocupacional, Norma AR 10.1.1 Norma Básica de Seguridad Radiológica", salvo: /colectiv|efectiv|equivalent|comprometid|absorbid|definici/i, agregarSalvo: "Norma AR 10.1.1 Norma Básica de Seguridad Radiológica definiciones" },
  { patron: /residuos?|desechos?/i, agregar: "gestión de residuos radiactivos, Norma AR 10.12.1" },
  { patron: /licenc|permiso|habilitaci|autorizaci/i, agregar: "licenciamiento de instalaciones y personal, permisos individuales" },
  { patron: /transporte|traslado/i, agregar: "transporte de materiales radiactivos, Norma AR 10.16.1" },
  { patron: /salvaguardia|no proliferaci|tnp|tlatelolco|abacc|oiea/i, agregar: "salvaguardias, no proliferación, acuerdos internacionales" },
  { patron: /protecci[oó]n f[ií]sica|seguridad f[ií]sica/i, agregar: "protección física de materiales e instalaciones nucleares, Norma AR 10.13.1" },
];

function construirConsultaBusqueda(messages) {
  const preguntas = messages.filter((m) => m.role === "user").map((m) => m.content);
  const ultima = (preguntas[preguntas.length - 1] || "").trim();
  const previa = (preguntas[preguntas.length - 2] || "").trim();
  const palabras = ultima.split(/\s+/).filter(Boolean).length;

  let consulta = ultima;
  const esSeguimiento =
    previa && (palabras <= 10 || /^[¿\s]*(y|e|o|entonces|tambi[eé]n|eso|esto|ese|esa)\b/i.test(ultima));
  if (esSeguimiento) consulta = `${previa} ${ultima}`;

  if (palabras <= 10) {
    const extras = GLOSARIO_BUSQUEDA.filter((g) => g.patron.test(consulta)).map((g) =>
      g.salvo && g.salvo.test(consulta) ? g.agregarSalvo : g.agregar
    );
    if (extras.length > 0) consulta = `${consulta} ${extras.slice(0, 2).join(" ")}`;
  }
  return consulta.slice(0, 600);
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
    const consultaBusqueda = construirConsultaBusqueda(messages);

    // ── 1. Buscar contexto relevante en Pinecone (ver construirConsultaBusqueda) ──────────────────────
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
            query: { inputs: { text: consultaBusqueda }, top_k: TOP_K },
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
      'Usá estos fragmentos como base de la respuesta. Los que empiezan con "GUÍA" son guías orientativas de la ARN, no la norma: aclaralo, explicá primero lo que establece la norma y después lo que recomienda la guía, y citá cada una en su propio corchete final. No indiques número de página. Reglas de precisión: (1) citá códigos y títulos de normas tal cual figuran en los fragmentos, sin inventar ni reformular títulos; (2) si la consulta pide valores o límites y no figuran en los fragmentos, decilo y no los completes con cifras "internacionales" ni de memoria; (3) no atribuyas a una norma o guía lo que dice otra, ni apliques valores de una guía a un caso distinto del que la guía describe; (4) si la consulta es muy general o ambigua, respondé solo lo que sí figura en los fragmentos e indicá qué precisión necesitás.';

    const armarSistema = (frags) =>
      frags.length > 0
        ? `${system}\n\n## Fragmentos relevantes de la documentación oficial:\n\n${frags.join("\n\n---\n\n")}\n\n${INSTRUCCION_FRAGMENTOS}`
        : system;

    // Historial reducido: se recortan las respuestas anteriores, que son lo que más pesa.
    const historialBase = messages.slice(-MAX_HISTORIAL).map((m) =>
      m.role === "assistant" && m.content.length > MAX_CHARS_RESPUESTA_HISTORIAL
        ? { ...m, content: m.content.slice(0, MAX_CHARS_RESPUESTA_HISTORIAL) + "…" }
        : m
    );

    // Arma la consulta para un proveedor, respetando su presupuesto de tokens: si la consulta
    // estimada lo supera, se recorta primero el historial más viejo y luego los fragmentos
    // de menor relevancia (los últimos de la lista).
    const prepararConsulta = (prov) => {
      let hist = historialBase;
      let frags = fragmentos;
      const peso = () =>
        estimarTokens(armarSistema(frags)) +
        hist.reduce((acc, m) => acc + estimarTokens(m.content), 0) +
        prov.maxTokens;
      while (peso() > prov.presupuesto) {
        if (hist.length > 1) hist = hist.slice(1);
        else if (frags.length > MIN_FRAGMENTOS) frags = frags.slice(0, -1);
        else break;
      }
      return { system: armarSistema(frags), hist, nFrags: frags.length, peso: peso() };
    };

    const armarPedido = (prov, consulta) => ({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${prov.key}`,
      },
      body: JSON.stringify({
        model: prov.modelo,
        max_tokens: prov.maxTokens,
        temperature: 0.2,
        stream: true,
        ...(prov.url.includes("groq.com") ? {} : { stream_options: { include_usage: true } }),
        ...(REASONING_EFFORT ? { reasoning_effort: REASONING_EFFORT } : {}),
        messages: [{ role: "system", content: consulta.system }, ...consulta.hist],
      }),
    });

    if (PROVEEDORES.length === 0) {
      console.error("No hay proveedor de modelo configurado (GROQ_API_KEY o LLM_BASE_URL + LLM_API_KEY).");
      return res.status(500).json({ error: { message: "Ocurrió un error interno. Intentá de nuevo." } });
    }

    console.log(`Búsqueda: "${consultaBusqueda.slice(0, 200)}" (top_k ${TOP_K}, ${fragmentos.length} fragmentos)`);

    // ── 2. Llamar al modelo con streaming, con proveedor de respaldo ───────────────
    // Se prueba el proveedor principal; si responde 429 (límite) o falla, se pasa al siguiente.
    let groqRes = null;
    let usado = null;
    for (let i = 0; i < PROVEEDORES.length; i++) {
      const prov = PROVEEDORES[i];
      const esUltimo = i === PROVEEDORES.length - 1;
      const consulta = prepararConsulta(prov);
      console.log(
        `Proveedor ${prov.nombre} (${prov.modelo}): consulta estimada ~${consulta.peso} tokens, historial ${consulta.hist.length} mensajes, ${consulta.nFrags} fragmentos, razonamiento ${REASONING_EFFORT || "por defecto"}`
      );
      let r;
      try {
        r = await fetchConReintento(prov.url, armarPedido(prov, consulta), {
          maxIntentos: esUltimo ? 3 : 2,
          maxEsperaMs: esUltimo ? 4000 : 1000, // con respaldo disponible, no se espera: se cambia
          nombre: prov.nombre,
        });
        // Algunos proveedores no aceptan reasoning_effort: se reintenta sin ese parámetro.
        if ((r.status === 400 || r.status === 422) && REASONING_EFFORT) {
          const detalle = await r.clone().text().catch(() => "");
          if (/reasoning/i.test(detalle)) {
            console.warn(`${prov.nombre}: no acepta reasoning_effort, se reintenta sin ese parámetro`);
            const pedido = armarPedido(prov, consulta);
            const cuerpo = JSON.parse(pedido.body);
            delete cuerpo.reasoning_effort;
            pedido.body = JSON.stringify(cuerpo);
            r = await fetchConReintento(prov.url, pedido, { maxIntentos: 2, maxEsperaMs: 1000, nombre: prov.nombre });
          }
        }
      } catch (netErr) {
        console.error(`${prov.nombre}: fallo de red`, netErr);
        r = null;
      }

      if (r && r.ok && r.body) {
        groqRes = r;
        usado = prov;
        break;
      }
      if (r) {
        const errBody = await r.clone().json().catch(() => ({}));
        console.error(`${prov.nombre} respondió con error:`, r.status, errBody);
        groqRes = r; // se conserva el último error para informarlo
      }
      if (!esUltimo) console.warn(`Se pasa al proveedor de respaldo (${PROVEEDORES[i + 1].nombre})`);
    }

    if (!groqRes || !groqRes.ok || !groqRes.body) {
      if (groqRes && groqRes.status === 429) {
        return res.status(429).json({
          error: { message: "El servicio está con mucha demanda en este momento. Esperá unos segundos e intentá de nuevo." },
        });
      }
      return res.status(502).json({
        error: { message: "No se pudo generar la respuesta. Intentá de nuevo en unos segundos." },
      });
    }
    console.log(`Respuesta generada con el proveedor ${usado.nombre}`);

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
            if (uso) console.log(`Uso real de tokens (${usado.nombre}):`, JSON.stringify(uso));
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
