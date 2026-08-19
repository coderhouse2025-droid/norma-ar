// api/chat.js
// RAG pipeline: Pinecone (contexto) + Groq/LLaMA 3.3 70B (generación), con streaming.

// ── Rate limiting (best-effort, en memoria) ─────────────────────────────
// En serverless cada instancia tiene su propia memoria: esto frena abuso
// dentro de una misma instancia "caliente", pero NO es un límite global
// garantizado entre instancias. Para eso, reemplazar por Upstash Redis /
// Vercel KV (INCR con TTL) usando la misma función isRateLimited().
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minuto
const RATE_LIMIT_MAX_REQUESTS = 15; // solicitudes por IP por minuto
const rateLimitStore = new Map(); // ip -> [timestamps]

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
    let contexto = "";
    try {
      const pineconeRes = await fetch(
        "https://normativa-nuclear-ku9bass.svc.aped-4627-b74a.pinecone.io/records/namespaces/default/search",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Api-Key": process.env.PINECONE_API_KEY,
            "X-Pinecone-API-Version": "2025-10",
          },
          body: JSON.stringify({
            query: { inputs: { text: ultimaPregunta }, top_k: 5 },
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
        if (resultados.length > 0) {
          contexto = resultados
            .map((r) => `[${r.fields?.source || "doc"}]\n${r.fields?.text || ""}`)
            .join("\n\n---\n\n");
        }
      } else {
        const errText = await pineconeRes.text().catch(() => "");
        console.error("Pinecone respondió con error:", pineconeRes.status, errText);
      }
    } catch (pineconeErr) {
      // Si Pinecone falla, seguimos sin contexto documental en vez de
      // romper toda la respuesta.
      console.error("Fallo al consultar Pinecone:", pineconeErr);
    }

    const systemConContexto = contexto
      ? `${system}\n\n## Fragmentos relevantes de la documentación oficial:\n\n${contexto}\n\nUsá estos fragmentos como base para tu respuesta cuando sean pertinentes. Al final de la respuesta, indicá la fuente entre corchetes con el formato [Nombre de la norma o ley]. NO incluyas número de página — el contexto documental no trae esa información, así que cualquier número de página sería inventado. Si usaste más de una fuente, citá cada una en su propio corchete, una debajo de la otra.`
      : system;

    // ── 2. Llamar a Groq con streaming ─────────────────────────────────
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        max_tokens: 1500,
        temperature: 0.7,
        stream: true,
        messages: [{ role: "system", content: systemConContexto }, ...messages],
      }),
    });

    if (!groqRes.ok || !groqRes.body) {
      const errBody = await groqRes.json().catch(() => ({}));
      console.error("Groq respondió con error:", groqRes.status, errBody);
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
