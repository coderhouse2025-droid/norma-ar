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
const MAX_SYSTEM_LENGTH = 12000; // caracteres máximos del system prompt

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
  // Programas de examen: "características de los programas de examen" (6 palabras) se trataba como
  // seguimiento de la pregunta anterior y la respuesta salía de la AR 4.8.1 en lugar de la AR 3.8.1 / Guía AR 10.
  { siempre: true, patron: /programas?\s+de\s+examen/i, agregar: "programa de examen, características de los programas de examen, Norma AR 3.8.1 Guía AR 10" },
  // Informe de seguridad: pregunta de 10 palabras que antes se trataba como seguimiento de la anterior
  // y la búsqueda traía licenciamiento/permisos en lugar del contenido del informe.
  { siempre: true, patron: /informe\s+(preliminar\s+|final\s+)?de\s+seguridad/i, agregar: "contenido del Informe Preliminar de Seguridad e Informe Final de Seguridad de la instalación, Norma AR 4.9.2 Norma AR 4.9.1 Norma AR 3.9.1" },
  // Límites de dosis: se aplica SIEMPRE (aunque la pregunta sea larga). Sin esto, la búsqueda traía el
  // criterio de optimización de la AR 10.1.1 ("5 mSv / 0,1 mSv") en lugar de la sección de límites.
  { siempre: true, patron: /l[ií]mites?\s+(de\s+)?dosis|dosis\s+(m[aá]xim|permitid|l[ií]mite)|l[ií]mites?\s+(anual|para\s+trabajadores|ocupacional)/i, agregar: "Norma AR 10.1.1 D.1.7.1 Exposición ocupacional. Límites de dosis para trabajadores: dosis efectiva de 20 mSv por año como promedio en 5 años consecutivos, dosis equivalente en cristalino, piel o extremidades; límites de dosis para miembros del público" },
  { patron: /\bcnea\b|comisi[oó]n nacional de energ[ií]a at[oó]mica/i, agregar: "Comisión Nacional de Energía Atómica CNEA institución argentina organismo descentralizado misión funciones historia" },
  { patron: /\binvap\b/i, agregar: "INVAP empresa argentina diseño construcción y exportación de reactores nucleares" },
  { patron: /dosis|l[ií]mites?|exposici[oó]n|radiaci[oó]n/i, agregar: "límites de dosis para trabajadores y miembros del público, exposición ocupacional, Norma AR 10.1.1 Norma Básica de Seguridad Radiológica", salvo: /colectiv|efectiv|equivalent|comprometid|absorbid|definici/i, agregarSalvo: "Norma AR 10.1.1 Norma Básica de Seguridad Radiológica definiciones; D.1.7.1 límites de dosis para trabajadores" },
  { patron: /residuos?|desechos?/i, agregar: "gestión de residuos radiactivos, Norma AR 10.12.1" },
  { patron: /licenc|permiso|habilitaci|autorizaci/i, agregar: "licenciamiento de instalaciones Clase I, Clase II y Clase III: licencia de construcción, puesta en marcha, operación y retiro de servicio, registro, permisos individuales" },
  { patron: /transporte|traslado/i, agregar: "transporte de materiales radiactivos, Norma AR 10.16.1" },
  { patron: /salvaguardia|no proliferaci|tnp|tlatelolco|abacc|oiea/i, agregar: "salvaguardias, no proliferación, acuerdos internacionales" },
  { patron: /protecci[oó]n f[ií]sica|seguridad f[ií]sica/i, agregar: "protección física de materiales e instalaciones nucleares, Norma AR 10.13.1" },
];

// Devuelve la(s) consulta(s) de búsqueda. La pregunta actual SIEMPRE se busca sola; si parece un
// seguimiento ("¿Y para el público?"), se agrega una segunda consulta combinada con la pregunta
// anterior y los resultados se unen. Así una pregunta nueva nunca queda desviada por la anterior.
function construirConsultasBusqueda(messages) {
  const preguntas = messages.filter((m) => m.role === "user").map((m) => m.content);
  const ultima = (preguntas[preguntas.length - 1] || "").trim();
  const previa = (preguntas[preguntas.length - 2] || "").trim();
  const palabras = ultima.split(/\s+/).filter(Boolean).length;

  const conGlosario = (consulta) => {
    const extras = GLOSARIO_BUSQUEDA.filter((g) => (palabras <= 10 || g.siempre) && g.patron.test(consulta)).map((g) =>
      g.salvo && g.salvo.test(consulta) ? g.agregarSalvo : g.agregar
    );
    return (extras.length > 0 ? `${consulta} ${extras.slice(0, 2).join(" ")}` : consulta).slice(0, 600);
  };

  const consultas = [conGlosario(ultima)];
  const esSeguimiento =
    previa && (palabras <= 4 || /^[¿\s]*(y|e|o|entonces|tambi[eé]n|eso|esto|ese|esa)\b/i.test(ultima));
  if (esSeguimiento) consultas.push(conGlosario(`${previa} ${ultima}`));
  return consultas;
}

// Busca una consulta en Pinecone y devuelve los hits ({source, text, score}).
async function buscarEnPinecone(consulta, topK = TOP_K) {
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
        query: { inputs: { text: consulta }, top_k: topK },
        // El índice solo guarda "text" y "source" como metadata — no hay número
        // de página. Si en algún momento se agrega esa metadata al pipeline de
        // indexación, sumar el campo acá (ej. "page" o "pagina") vuelve a habilitar
        // las citas con página en el prompt de más abajo.
        fields: ["text", "source"],
      }),
    }
  );
  if (!pineconeRes.ok) {
    const errText = await pineconeRes.text().catch(() => "");
    console.error("Pinecone respondió con error:", pineconeRes.status, errText);
    return [];
  }
  const data = await pineconeRes.json();
  return (data.result?.hits || []).map((r) => ({
    source: r.fields?.source,
    text: r.fields?.text || "",
    score: typeof r._score === "number" ? r._score : null,
  }));
}

// Los fragmentos indexados traen como "source" el nombre del archivo (ej. "3-8-1_r1.pdf",
// "ar_10-16-1_r04.pdf"). Se convierte a la forma en que se cita la norma ("Norma AR 3.8.1 rev 1")
// antes de pasarlo al modelo, para que no cite nombres de archivo. Si ya viene con formato
// legible (Ley, Guía, Tratado, etc.) se deja igual.
function etiquetaFuente(source) {
  const s = String(source || "doc").trim();
  // Nombres de archivo: "3-8-1_r1.pdf", "ar_10-16-1_r04.pdf", "10-12-1r3" (con o sin "_" antes de la r).
  const m = s.match(/^(?:ar[_-])?(\d{1,2})-(\d{1,2})-(\d{1,2})[_-]?r(\d+)(?:_\d+)?(?:\.pdf)?$/i);
  if (m) return `Norma AR ${m[1]}.${m[2]}.${m[3]} rev ${parseInt(m[4], 10)}`;
  // Las guías se citan siempre como "Guía AR N" (en el índice algunas vienen como "GUÍA AR N").
  return s.replace(/\.pdf$/i, "").replace(/^gu[íi]a\b/i, "Guía");
}

// Cantidad mínima de guías que se intenta incluir entre los fragmentos (si hay guías pertinentes).
const MIN_GUIAS = 2;
const SOBREPEDIDO = 2;
const esGuia = (h) => /^gu[íi]a\b/i.test(etiquetaFuente(h.source));

// Une los resultados de varias consultas: sin repetidos, ordenados por puntaje, hasta TOP_K.
// Se buscan más candidatos de los que se usan (ver SOBREPEDIDO) para que las guías no queden
// afuera cuando las normas ocupan todos los lugares: si entre los candidatos hay guías con un
// puntaje cercano al mejor, reemplazan a los fragmentos de norma de menor puntaje.
function unirResultados(listas) {
  const vistos = new Set();
  const todos = [];
  for (const hit of listas.flat()) {
    const clave = `${hit.source}|${hit.text.slice(0, 80)}`;
    if (vistos.has(clave)) continue;
    vistos.add(clave);
    todos.push(hit);
  }
  todos.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const elegidos = todos.slice(0, TOP_K);
  const mejor = todos.length ? todos[0].score : null;
  const cercano = (h) => mejor === null || h.score === null || h.score >= mejor * 0.7;
  let guias = elegidos.filter(esGuia).length;
  const candidatas = todos.slice(TOP_K).filter((h) => esGuia(h) && cercano(h));
  while (guias < MIN_GUIAS && candidatas.length > 0) {
    let k = elegidos.length - 1;
    while (k >= 0 && esGuia(elegidos[k])) k--;
    if (k < 0) break;
    elegidos.splice(k, 1, candidatas.shift());
    guias++;
  }
  const final = elegidos.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  final.candidatos = todos.map((h) => `${etiquetaFuente(h.source)} (${h.score === null ? "s/p" : h.score.toFixed(2)})`);
  return final;
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
    const consultasBusqueda = construirConsultasBusqueda(messages);

    // ── 1. Buscar contexto relevante en Pinecone (ver construirConsultasBusqueda) ─────────────────────
    let fragmentos = [];
    let busquedaDebil = false;
    try {
      // Búsqueda general + búsqueda dirigida a guías (la consulta con "Guía AR" al final, de la que solo
      // se conservan las guías): las normas suelen ocupar todos los primeros lugares y las guías,
      // que son más cortas y orientativas, quedaban sin aparecer en las referencias.
      const generales = consultasBusqueda.map((c) => buscarEnPinecone(c, TOP_K * SOBREPEDIDO));
      const dirigidas = consultasBusqueda.map((c) =>
        buscarEnPinecone(`${c} Guía AR guía regulatoria`.slice(0, 600), TOP_K * SOBREPEDIDO).then((hs) => hs.filter(esGuia))
      );
      const listas = await Promise.all([...generales, ...dirigidas]);
      const hits = unirResultados(listas);
      fragmentos = hits.map((h) => `[${etiquetaFuente(h.source)}]\n${h.text}`);
      // Aviso de búsqueda débil: solo si se define RAG_SCORE_MIN (el puntaje depende del índice;
      // los puntajes de cada consulta quedan en el log de Vercel para calibrar el valor).
      const mejor = hits.length ? hits[0].score : null;
      console.log("RAG", JSON.stringify({ consultas: consultasBusqueda.length, mejorPuntaje: mejor, fuentes: hits.map((h) => etiquetaFuente(h.source)), candidatos: hits.candidatos }));
      const minimo = Number(process.env.RAG_SCORE_MIN);
      if (minimo > 0 && mejor !== null && mejor < minimo) busquedaDebil = true;
    } catch (pineconeErr) {
      // Si Pinecone falla, seguimos sin contexto documental en vez de
      // romper toda la respuesta.
      console.error("Fallo al consultar Pinecone:", pineconeErr);
    }

    // Instrucción breve sobre los fragmentos. Las reglas de cita y de guías ya están
    // en el prompt del sistema (reglas 7 y 14), por eso aquí no se repiten.
    const INSTRUCCION_FRAGMENTOS =
      'Usá estos fragmentos como base de la respuesta. Los que empiezan con "Guía" son guías orientativas de la ARN, no la norma: aclaralo, explicá primero lo que establece la norma y después lo que recomienda la guía, y citá cada una en su propio corchete final. No indiques número de página. Reglas de precisión: (1) citá códigos y títulos de normas tal cual figuran en los fragmentos, sin inventar ni reformular títulos; (2) si la consulta pide valores o límites y no figuran en los fragmentos, decilo y no los completes con cifras "internacionales" ni de memoria; (3) no atribuyas a una norma o guía lo que dice otra, ni apliques valores de una guía a un caso distinto del que la guía describe; (4) si la consulta es muy general o ambigua, respondé solo lo que sí figura en los fragmentos e indicá qué precisión necesitás; (5) si los fragmentos no responden la pregunta (o solo en parte), decí explícitamente que no figura en la documentación consultada: no completes con datos de memoria sobre instalaciones, ubicaciones, potencias, cargos, comités, decretos, fechas ni límites de dosis; (6) cada afirmación debe poder rastrearse a un fragmento: ante la duda, omitila; (7) no presentes como "límite de dosis" un valor que en el fragmento aparece como criterio de optimización, restricción de dosis, nivel de referencia, nivel de exención o dosis colectiva por unidad de energía: los límites de dosis son solo los que el texto llama "límites de dosis" (en la AR 10.1.1, sección D.1.7.1 para trabajadores); si un fragmento aparece cortado y no se ve la condición a la que pertenece un valor, no lo uses como regla general; (8) en la AR 10.1.1, una frase del tipo "ningún trabajador puede recibir una dosis efectiva superior a X mSv en un año y ningún miembro del público superior a Y mSv … no es necesario demostrar que los sistemas están optimizados" es un criterio para NO exigir la demostración de optimización: no es un límite de dosis y no debe presentarse como tal. Los límites de dosis son los que el texto llama "límites de dosis" (para trabajadores, sección D.1.7.1); si esa sección no está en los fragmentos recibidos, decí que el valor debe consultarse en la AR 10.1.1 en lugar de dar un número.';

    const INSTRUCCION_AUSENCIA =
      ' Cuando los fragmentos no cubran la consulta, no afirmes que la normativa no lo establece ni que "no se detalla": decí que no lo encontraste entre los textos recuperados para esta consulta, sugerí reformular con el nombre de la norma o el término exacto (por ejemplo "Norma AR 4.9.2") y recordá verificar en el texto oficial de la ARN.';
    const INSTRUCCION_GUIAS =
      ' Si entre los fragmentos hay guías ("Guía AR N") que traten el tema, mencionalas en la respuesta como orientativas y citá cada una en su propio corchete al final, con el nombre exacto del fragmento, por ejemplo [Guía AR 3].';
    const AVISO_BUSQUEDA_DEBIL =
      ' ATENCIÓN: la búsqueda devolvió fragmentos de baja relevancia para esta consulta. Respondé solo lo que figure explícitamente en ellos e indicá que la cobertura puede ser incompleta.';

    const armarSistema = (frags) =>
      frags.length > 0
        ? `${system}\n\n## Fragmentos relevantes de la documentación oficial:\n\n${frags.join("\n\n---\n\n")}\n\n${INSTRUCCION_FRAGMENTOS}${INSTRUCCION_AUSENCIA}${frags.some((f) => /^\[Gu[íi]a\b/i.test(f)) ? INSTRUCCION_GUIAS : ""}${busquedaDebil ? AVISO_BUSQUEDA_DEBIL : ""}`
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

    console.log(`Búsqueda: "${consultasBusqueda[consultasBusqueda.length - 1].slice(0, 200)}" (top_k ${TOP_K}, ${fragmentos.length} fragmentos)`);

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
