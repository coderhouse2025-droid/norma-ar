import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `Sos un asistente especializado en el marco normativo nuclear argentino. Respondés consultas con precisión técnica y jurídica en español rioplatense.

Tus áreas de conocimiento incluyen:
- Ley 24804 "Ley Nacional de la Actividad Nuclear" y sus decretos reglamentarios
- La Autoridad Regulatoria Nuclear (ARN): funciones, estructura orgánica, competencias regulatorias
- Normas ARN (serie de regulaciones técnicas emitidas por la ARN en distintas áreas)
- Guías regulatorias de la ARN (documentos orientativos que complementan las normas con recomendaciones para cumplirlas)
- Seguridad radiológica: límites de dosis para trabajadores y público, zonas de exclusión
- Licencias y habilitaciones para instalaciones nucleares, radiactivas y para personal
- Gestión, tratamiento y disposición de residuos radiactivos
- Instalaciones nucleares: reactores Atucha I, Atucha II, Embalse, reactores de investigación
- Transporte de materiales radiactivos (normativa ARN, regulaciones OIEA/TS-R-1)
- Salvaguardias nucleares: ABACC, OIEA, Acuerdo Cuadripartito
- Tratados y acuerdos internacionales: TNP, Tratado de Tlatelolco, Acuerdo bilateral Argentina–Brasil (1991) y Acuerdo de Salvaguardias cuatripartito (Argentina, Brasil, ABACC y OIEA)
- CNEA (Comisión Nacional de Energía Atómica): rol histórico, misión, proyectos
- INVAP: diseño, construcción y exportación de reactores nucleares
- Seguridad nuclear, física y radiológica
- Planes de emergencia nuclear y radiológica

Reglas:
1. Siempre respondé en español rioplatense
2. Citá números de ley, decreto o norma ARN cuando los conozcas con certeza. Las normas ARN se numeran siempre con tres niveles (ej. AR 10.1.1, AR 10.6.1, AR 10.12.1) — nunca escribas un número de dos niveles solo (ej. "AR 10.1" o "AR 10.6"), sin la palabra "serie": o completás los tres niveles con certeza, o aclarás explícitamente "la serie AR 10.1" cuando no estés seguro del tercer nivel
3. Si un dato es incierto o podría haber cambiado, indicalo explícitamente
4. Estructurá respuestas largas con subtítulos usando ###
5. Para respuestas cortas no uses estructura de títulos innecesaria
6. Sé preciso pero accesible; explicá términos técnicos cuando aparezcan
7. Al final de cada respuesta, indicá la fuente entre corchetes con el formato [Nombre de la norma o ley]. NO incluyas número de página — la documentación indexada no tiene esa información, así que cualquier página que menciones sería inventada. Citá cada norma o documento UNA sola vez — nunca desgloses una misma norma en varios corchetes por artículo o rango de artículos (ej. NO hagas "[Ley 24804, art. 1]", "[Ley 24804, art. 2]", etc.; usá un único "[Ley 24804]"). Si usaste más de un documento distinto, poné cada uno en su propio corchete, una debajo de la otra. No repitas la cita en medio del texto: solo al final. En el corchete final SOLO incluí normas de las que tengas el número completo de tres niveles o que vengan del contexto documental — si solo podés nombrar una norma de forma general (ej. "la serie AR 10.1", sin el tercer nivel), mencionala en el texto de la respuesta pero NO la pongas en un corchete al final. No agregues vos un encabezado como "Fuentes" ni una línea divisoria (---) antes de los corchetes — la interfaz ya los muestra por separado, de forma automática. Terminá el texto normal y agregá directamente los corchetes, sin título ni separador antes.
8. Nunca des valores numéricos (límites, actividades, concentraciones, plazos, fechas) que no estén textualmente en los fragmentos de documentación recibidos. Si el valor pedido no figura en la documentación consultada, decilo claramente (sin usar la palabra "fragmentos"), indicá en qué norma o guía debe consultarse y NO des ejemplos numéricos de memoria.
9. No uses LaTeX ni notación matemática especial: escribí las fórmulas en texto plano (por ejemplo: Xm = suma de f(i) × X(i)).
10. Sé conciso: salvo que la consulta lo requiera, no superes unas 350 palabras.
11. Si la consulta está cubierta por la documentación recibida, basá la respuesta solo en ella. Si sumás conocimiento general, aclará que no proviene de la documentación indexada, y no des fechas, siglas ni nombres de organismos si no tenés certeza de que son correctos.
12. Números de artículo, párrafo o tabla: citalos solo si aparecen textualmente en la documentación recibida y corresponden a lo que afirmás. Si no estás seguro de qué artículo establece algo, describí el contenido sin numerarlo. Nunca completes con artículos de memoria.
13. En los tratados, distinguí el cuerpo del tratado de sus protocolos y anexos, y aclará de cuál proviene cada dato. Ejemplo: en el Tratado de Tlatelolco, la expresión «estatuto de desnuclearización para fines bélicos» y la remisión a los «art. 1, 3, 5 y 13» figuran en los Protocolos Adicionales, no en el cuerpo del Tratado; las obligaciones de las Partes del Tratado están en su Art. 1 (utilizar el material nuclear solo con fines pacíficos y prohibir e impedir el ensayo, uso, fabricación, producción, adquisición, recibo, almacenamiento, instalación y posesión de armas nucleares). Los Protocolos Adicionales obligan a los Estados que los firman (el I, a los Estados con responsabilidad internacional sobre territorios dentro de la zona; el II, a las potencias nucleares) y tienen la misma duración que el Tratado. No asignes un número de artículo a un contenido si ese número no figura en el texto recibido junto a ese contenido. Si un dato no está en el texto recibido (por ejemplo, qué Estados poseen armas nucleares), aclaralo en lugar de agregarlo de memoria.
14. Las guías regulatorias son de carácter orientativo: al presentar sus valores usá "la guía recomienda / no debería superarse", no "es obligatorio / máximo permitido", y indicá a qué punto o condición se aplica cada valor, tal como figura en el texto. No incluyas marcas de cita (como 【…】) dentro del cuerpo de la respuesta: las fuentes van solo al final, según la regla 7.`;

const TOPICS = [
  { label: "Marco legal", sub: "Leyes, decretos y reglamentación", icon: "scale", kw: "ley decreto reglamentación 24804 institución", q: "¿Cuáles son las principales leyes que regulan la actividad nuclear en Argentina?" },
  { label: "Normas ARN", sub: "Regulaciones y guías", icon: "doc", kw: "autoridad regulatoria norma guía ar", q: "¿Qué es la ARN, cuáles son sus funciones y qué normas y guías regulatorias emite?" },
  { label: "Licencias", sub: "Autorizaciones y habilitaciones", icon: "shield", kw: "licencia permiso habilitación autorización personal", q: "¿Cuáles son los requisitos para obtener una licencia nuclear en Argentina?" },
  { label: "Protección radiológica", sub: "Personas y medio ambiente", icon: "radiation", kw: "dosis exposición radiación límites efluentes", q: "¿Qué establece la normativa sobre protección radiológica en Argentina?" },
  { label: "Residuos", sub: "Gestión y disposición final", icon: "recycle", kw: "residuos radiactivos gestión almacenamiento", q: "¿Cómo se clasifican y gestionan los residuos radiactivos según la normativa argentina?" },
  { label: "Instalaciones", sub: "Reactores y ciclos de combustible", icon: "factory", kw: "reactor instalación diseño operación", q: "¿Cuáles son las normas aplicables a instalaciones nucleares en Argentina?" },
  { label: "Salvaguardias y transporte", sub: "Control internacional y traslado", icon: "globe", kw: "salvaguardias tratado oiea abacc transporte no proliferación", q: "¿Qué establece la normativa sobre salvaguardias internacionales y sobre el transporte de materiales radiactivos en Argentina?" },
];

// Accesos rápidos de la pantalla de inicio.
const CARDS = [
  { title: "Ley 24.804", sub: "Marco regulatorio de la actividad nuclear.", icon: "doc", q: "¿Qué establece la Ley 24.804 de Actividad Nuclear?" },
  { title: "Límites de dosis", sub: "Valores y criterios de protección radiológica.", icon: "radiation", q: "¿Cuáles son los límites de dosis de radiación permitidos en Argentina?" },
  { title: "Licencias y habilitaciones", sub: "Requisitos y procedimientos de autorización.", icon: "shield", q: "¿Cuáles son los requisitos para obtener una licencia nuclear en Argentina?" },
  { title: "Salvaguardias internacionales", sub: "Tratados y compromisos internacionales.", icon: "globe", q: "¿Cómo funciona el sistema de salvaguardias nucleares en Argentina con el OIEA?" },
];

const PROMPT_STARTER = "¿Qué requisitos establece la normativa para ";

const MAX_MESSAGE_LENGTH = 4000; // debe coincidir con el límite del backend (api/chat.js)

// Fuentes oficiales que respaldan los distintos temas que cubre el asistente.
// El RAG solo indexa documentación de la ARN; el resto son links de referencia directa.
const SOURCE_LINKS = [
  { label: "Autoridad Regulatoria Nuclear", url: "https://www.argentina.gob.ar/arn" },
  { label: "Comisión Nacional de Energía Atómica", url: "https://www.argentina.gob.ar/cnea" },
  { label: "Ley 24804 – Actividad Nuclear", url: "https://www.argentina.gob.ar/normativa/nacional/norma-42924/texto" },
  { label: "INVAP", url: "https://www.invap.com.ar/" },
  { label: "Tratado de Tlatelolco", url: "https://www.argentina.gob.ar/normativa/nacional/ley-24272-670/texto" },
  { label: "Acuerdo Cuadripartito (ABACC / OIEA)", url: "https://www.argentina.gob.ar/normativa/nacional/512/texto" },
];

// Íconos de trazo para el menú, las tarjetas y los botones.
const trefoil = (() => {
  const wedge = (a, r = 8.6, ri = 2.7) => {
    const p = (ang, rad) => [(12 + rad * Math.cos(ang * Math.PI / 180)).toFixed(2), (12 - rad * Math.sin(ang * Math.PI / 180)).toFixed(2)];
    const [x1, y1] = p(a - 30, ri), [x2, y2] = p(a - 30, r), [x3, y3] = p(a + 30, r), [x4, y4] = p(a + 30, ri);
    return `M${x1} ${y1}L${x2} ${y2}A${r} ${r} 0 0 0 ${x3} ${y3}L${x4} ${y4}A${ri} ${ri} 0 0 1 ${x1} ${y1}Z`;
  };
  return [90, 210, 330].map(a => wedge(a)).join("");
})();

const ICON_PATHS = {
  scale: "M12 3v18M6 21h12M5 7h14M5 7l-3 7a3 3 0 0 0 6 0L5 7zM19 7l-3 7a3 3 0 0 0 6 0l-3-7z",
  doc: "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h6",
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2 2 4-4",
  radiation: trefoil,
  recycle: "M4 12a8 8 0 0 1 14-5M20 4v4h-4M20 12a8 8 0 0 1-14 5M4 20v-4h4",
  factory: "M3 21h18M5 21V9l5 3V9l5 3V5h4v16M8 17h2M13 17h2",
  globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4",
  info: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 11v5M12 8h.01",
  external: "M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5",
  chat: "M4 5h16v11H9l-5 4zM8 9h8M8 12h5",
  arrow: "M5 12h14M13 6l6 6-6 6",
  chevron: "M9 6l6 6-6 6",
  help: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1.9-1.1 1.8M12 17h.01",
  download: "M12 4v11M7 11l5 5 5-5M5 20h14",
  trash: "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
};

function Icon({ name, size = 20, color = "currentColor", strokeWidth = 1.5, fill = "none" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={name === "radiation" ? color : fill} stroke={name === "radiation" ? "none" : color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d={ICON_PATHS[name]} />
      {name === "radiation" && <circle cx="12" cy="12" r="1.7" />}
    </svg>
  );
}

function AtomIcon({ size = 38, animated = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 38 38" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="19" cy="19" r="4.5" fill="#00c8e8" />
      <ellipse cx="19" cy="19" rx="17" ry="6.5" stroke="#00c8e8" strokeWidth="1.2" fill="none" transform="rotate(-35 19 19)" opacity=".45" />
      <ellipse cx="19" cy="19" rx="17" ry="6.5" stroke="#00c8e8" strokeWidth="1.2" fill="none" transform="rotate(35 19 19)" opacity=".45" />
      <ellipse cx="19" cy="19" rx="17" ry="6.5" stroke="#e8c84a" strokeWidth="1.1" fill="none" opacity=".3" />
      {!animated && (
        <>
          <circle cx="19" cy="12" r="2.2" fill="#e8c84a" opacity=".95" />
          <circle cx="27.5" cy="24" r="2.2" fill="#00c8e8" opacity=".95" />
          <circle cx="10.5" cy="24" r="2.2" fill="#00c8e8" opacity=".95" />
        </>
      )}
      {animated && (
        <>
          <circle r="2.2" fill="#e8c84a" opacity=".95">
            <animateMotion dur="5s" repeatCount="indefinite" path="M 36,19 A 17,6.5 0 1,1 2,19 A 17,6.5 0 1,1 36,19" />
          </circle>
          <g transform="rotate(-35 19 19)">
            <circle r="2.2" fill="#00c8e8" opacity=".95">
              <animateMotion dur="4.5s" begin="-2s" repeatCount="indefinite" path="M 36,19 A 17,6.5 0 1,1 2,19 A 17,6.5 0 1,1 36,19" />
            </circle>
          </g>
          <g transform="rotate(35 19 19)">
            <circle r="2.2" fill="#00c8e8" opacity=".95">
              <animateMotion dur="5.5s" begin="-1s" repeatCount="indefinite" path="M 36,19 A 17,6.5 0 1,1 2,19 A 17,6.5 0 1,1 36,19" />
            </circle>
          </g>
        </>
      )}
    </svg>
  );
}

// Detecta si el usuario prefiere reducir animaciones, para respetar esa preferencia
// en el electrón animado del logo.
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

// Aplica formato inline (negrita, cursiva, código) — se reutiliza para el texto normal y para las celdas de tablas.
function mdInline(s) {
  return s
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, '<code style="background:rgba(0,200,232,.1);border:1px solid rgba(0,200,232,.2);border-radius:4px;padding:1px 5px;font-family:monospace;font-size:.82em;color:#00c8e8">$1</code>');
}

// Separa una fila de tabla markdown "| a | b |" en celdas ["a","b"], tolerando pipes de más/menos al borde.
function splitTableRow(line) {
  let l = line.trim();
  if (l.startsWith("|")) l = l.slice(1);
  if (l.endsWith("|")) l = l.slice(0, -1);
  return l.split("|").map(c => c.trim());
}

// Detecta bloques de tabla markdown (encabezado + fila separadora + filas de datos) y los convierte a <table> HTML.
function parseTables(text) {
  const tableRegex = /^\|.+\|[ \t]*\n\|[ \t:|-]+\|[ \t]*\n(?:\|.*\|[ \t]*\n?)+\n*/gm;
  return text.replace(tableRegex, (block) => {
    const lines = block.trim().split("\n");
    const headerCells = splitTableRow(lines[0]);
    const bodyRows = lines.slice(2).map(splitTableRow);
    let html = '<table style="width:100%;border-collapse:collapse;margin:.6rem 0;font-size:.83rem">';
    html += "<thead><tr>" + headerCells.map(h =>
      `<th style="text-align:left;padding:5px 9px;border-bottom:1px solid rgba(0,200,232,.35);color:#00c8e8;font-weight:500">${mdInline(h)}</th>`
    ).join("") + "</tr></thead>";
    html += "<tbody>" + bodyRows.map(row =>
      "<tr>" + row.map(c =>
        `<td style="padding:5px 9px;border-bottom:1px solid rgba(238,244,248,.08);color:rgba(238,244,248,.75)">${mdInline(c)}</td>`
      ).join("") + "</tr>"
    ).join("") + "</tbody>";
    html += "</table>";
    // Se normaliza el espacio después de la tabla a un doble salto de línea, sin importar
    // cuántos saltos había realmente — así el párrafo siguiente siempre queda bien separado.
    return html + "\n\n";
  });
}

function md2html(raw) {
  let t = raw
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  t = parseTables(t);
  t = t
    .replace(/^#{1,6}\s+(.+)$/gm, '<h3 style="color:#00c8e8;font-size:.78rem;font-weight:500;text-transform:uppercase;letter-spacing:.07em;margin:1rem 0 .35rem;font-family:DM Sans,sans-serif">$1</h3>')
    .replace(/^(?:---|\*\*\*|___)[ \t]*$/gm, '<hr style="border:none;border-top:1px solid rgba(238,244,248,.12);margin:.9rem 0">')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, '<code style="background:rgba(0,200,232,.1);border:1px solid rgba(0,200,232,.2);border-radius:4px;padding:1px 5px;font-family:monospace;font-size:.82em;color:#00c8e8">$1</code>')
    .replace(/^[-*•]\s+(.+)$/gm, "<li>$1</li>")
    .replace(/^\d+\.\s+(.+)$/gm, "<li>$1</li>")
    .replace(/((?:<li>[^\n]+\n?)+)/g, '<ul style="padding-left:1.25rem;margin:.45rem 0">$1</ul>')
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>");
  t = "<p>" + t + "</p>";
  t = t.replace(/<p>(<h3)/g, "$1").replace(/(<\/h3>)<\/p>/g, "$1");
  t = t.replace(/<p>(<hr)/g, "$1").replace(/(<hr[^>]*>)<\/p>/g, "$1");
  t = t.replace(/<p>(<table)/g, "$1").replace(/(<\/table>)<\/p>/g, "$1");
  t = t.replace(/<p>\s*<\/p>/g, "");
  return t;
}

// Extrae las citas de fuente que el modelo escribe entre corchetes, p.ej. "[Norma AR 3.1.3]",
// y las devuelve como lista sin duplicados. Filtra "citas" que en realidad son comentarios
// del modelo sobre la ausencia de fuente (ej. "[No se proporcionan fuentes...]"), por si la
// instrucción del system prompt no alcanza a evitarlo.
const NOT_A_CITATION = /no se (proporcion|aportan|encontr|especific|indica|brind)|sin fuente|no hay fuente|no se cuenta con|fuente no disponible/i;

function extractCitations(raw) {
  const found = [];
  const seen = new Set();
  const regex = /\[([^[\]\n]{2,120})\]/g;
  let m;
  while ((m = regex.exec(raw)) !== null) {
    const label = m[1].trim();
    if (label && !seen.has(label) && !NOT_A_CITATION.test(label)) {
      seen.add(label);
      found.push(label);
    }
  }
  return found;
}

// Saca los corchetes de citas del texto principal para que no queden incrustados en la prosa.
// También saca los "falsos corchetes" de ausencia de fuente, aunque no se muestren como chip.
function stripCitations(raw) {
  return raw
    .replace(/\[([^[\]\n]{2,120})\]/g, "")
    .replace(/\s*【[^】\n]{1,120}】/g, "") // marcas de cita tipo 【AR 10.12.1】 que a veces emite el modelo
    .replace(/[ \t]{2,}/g, " ");
}

// Saca un encabezado final tipo "Fuentes"/"Fuente" (con o sin ### o negrita, con o sin línea
// divisoria --- antes) que el modelo a veces agrega de más. La interfaz ya muestra las citas
// como chips separados, así que ese texto queda redundante y genera espacio de más.
function stripTrailingSourcesLabel(raw) {
  const trimmed = raw.trimEnd();
  return trimmed
    .replace(/(?:\n[ \t]*(?:---|\*\*\*|___)[ \t]*)?\n{0,3}[ \t]*(?:#{1,6}[ \t]*)?\*{0,2}Fuentes?:?\*{0,2}[ \t]*$/i, "")
    .trimEnd();
}

// Combina las dos limpiezas de arriba, en el orden correcto (primero saca las citas, después
// el encabezado "Fuentes" que suele quedar justo antes de donde estaban esas citas).
function cleanAssistantText(raw) {
  return stripTrailingSourcesLabel(stripCitations(raw));
}

// Tope de seguridad al guardar en el historial: incluso sin citas, una respuesta muy larga
// no debería tirar abajo el próximo mensaje del usuario por superar MAX_MESSAGE_LENGTH.
function capForHistory(text) {
  if (text.length <= MAX_MESSAGE_LENGTH) return text;
  return text.slice(0, MAX_MESSAGE_LENGTH - 20) + "… (recortado)";
}

// Combina el parseo de citas con la conversión a HTML, para usar en cada actualización del mensaje.
function renderAssistant(raw) {
  const citations = extractCitations(raw);
  const html = md2html(cleanAssistantText(raw));
  return { html, citations };
}

function getTime() {
  return new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

export default function App() {
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [view, setView] = useState("asistente");
  const [topicQuery, setTopicQuery] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);
  const msgsRef = useRef(null);
  const inpRef = useRef(null);
  const abortRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();
  const isNearBottomRef = useRef(true);

  const MAX_TEXTAREA_HEIGHT = 160; // ~6 líneas antes de scrollear dentro del textarea

  const autoResizeTextarea = () => {
    const el = inpRef.current;
    if (!el) return;
    el.style.height = "42px";
    el.style.height = Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT) + "px";
  };

  useEffect(() => {
    autoResizeTextarea();
  }, [input]);

  useEffect(() => {
    if (msgsRef.current && isNearBottomRef.current) {
      msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
    }
  }, [messages]);

  const handleMessagesScroll = () => {
    const el = msgsRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    isNearBottomRef.current = distanceFromBottom < 80;
  };

  const sendMsg = async (text) => {
    const t = (text || input).trim();
    if (!t || busy) return;

    if (t.length > MAX_MESSAGE_LENGTH) {
      setMessages(prev => [...prev, {
        role: "assistant",
        isError: true,
        errorTitle: "Mensaje demasiado largo",
        errorDetail: `El máximo permitido es ${MAX_MESSAGE_LENGTH} caracteres. Acortá la consulta e intentá de nuevo.`,
        time: getTime(),
      }]);
      return;
    }

    setInput("");

    const userMsg = { role: "user", text: t, time: getTime() };
    const newHistory = [...history, { role: "user", content: t }];
    setMessages(prev => [...prev.filter(m => m.id !== "welcome"), userMsg]);
    setHistory(newHistory);
    setBusy(true);

    const controller = new AbortController();
    abortRef.current = controller;

    let assistantIndex = -1;
    let assistantText = "";

    setMessages(prev => {
      const next = [...prev, { role: "assistant", html: "", time: getTime(), streaming: true }];
      assistantIndex = next.length - 1;
      return next;
    });

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: SYSTEM_PROMPT,
          messages: newHistory,
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          let evt;
          try {
            evt = JSON.parse(line);
          } catch {
            continue;
          }

          if (evt.type === "delta" && evt.text) {
            assistantText += evt.text;
            const { html, citations } = renderAssistant(assistantText);
            setMessages(prev => {
              const next = [...prev];
              if (next[assistantIndex]) {
                next[assistantIndex] = { ...next[assistantIndex], html, citations };
              }
              return next;
            });
          } else if (evt.type === "error") {
            throw new Error(evt.message || "Error en la generación.");
          }
        }
      }

      if (assistantText) {
        setHistory(prev => [...prev, { role: "assistant", content: capForHistory(cleanAssistantText(assistantText)) }]);
      }
      setMessages(prev => {
        const next = [...prev];
        if (next[assistantIndex]) {
          next[assistantIndex] = { ...next[assistantIndex], streaming: false, text: cleanAssistantText(assistantText) };
        }
        return next;
      });
    } catch (e) {
      if (e.name === "AbortError") {
        // el usuario detuvo la generación: conservamos lo que llegó hasta ahora
        setMessages(prev => {
          const next = [...prev];
          if (next[assistantIndex]) {
            next[assistantIndex] = { ...next[assistantIndex], streaming: false, text: cleanAssistantText(assistantText) };
          }
          return next;
        });
        if (assistantText) {
          setHistory(prev => [...prev, { role: "assistant", content: capForHistory(cleanAssistantText(assistantText)) }]);
        }
      } else {
        setHistory(prev => prev.slice(0, -1));
        const isNetworkError = e instanceof TypeError || !navigator.onLine;
        setMessages(prev => {
          const next = [...prev];
          next[assistantIndex] = {
            role: "assistant",
            isError: true,
            errorTitle: isNetworkError ? "Se perdió la conexión" : "No se pudo generar la respuesta",
            errorDetail: isNetworkError
              ? "Revisá tu conexión a internet e intentá de nuevo."
              : e.message,
            time: getTime(),
          };
          return next;
        });
      }
    } finally {
      setBusy(false);
      abortRef.current = null;
      setTimeout(() => inpRef.current?.focus(), 50);
    }
  };

  const stopGeneration = () => {
    abortRef.current?.abort();
  };

  const copyMessage = async (index, text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => {
        setCopiedIndex(prev => (prev === index ? null : prev));
      }, 1800);
    } catch (e) {
      console.error("No se pudo copiar el mensaje:", e);
    }
  };

  const exportConversation = () => {
    const answerable = messages.filter(m => !m.isError);
    if (answerable.length === 0) return;
    const lines = answerable.map(m => {
      const who = m.role === "user" ? "Vos" : "norma-ar";
      const body = m.role === "user" ? m.text : (m.text || "");
      return `[${m.time}] ${who}:\n${body}\n`;
    });
    const header = `Conversación exportada de norma-ar — ${new Date().toLocaleString("es-AR")}\n${"=".repeat(50)}\n\n`;
    const content = header + lines.join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `norma-ar-conversacion-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearChat = () => {
    setMessages([]);
    setHistory([]);
    setSidebarOpen(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); }
  };

  const showWelcome = messages.length === 0;

  const filteredTopics = TOPICS.filter(t => {
    const q = topicQuery.trim().toLowerCase();
    if (!q) return true;
    return (t.label + " " + t.sub + " " + t.kw).toLowerCase().includes(q);
  });

  const canExport = messages.filter(m => !m.isError).length > 0;

  const startPrompt = () => {
    setInput(PROMPT_STARTER);
    setTimeout(() => {
      const el = inpRef.current;
      if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
    }, 0);
  };

  const goView = (v) => { setView(v); setSidebarOpen(false); setHelpOpen(false); };

  const navBtn = (id, label) => (
    <button
      key={id}
      className="nav-btn"
      onClick={() => goView(id)}
      aria-current={view === id ? "page" : undefined}
      style={{
        background: "transparent", border: "none", cursor: "pointer", height: 68, padding: "0 1.1rem",
        fontFamily: "'DM Sans', sans-serif", fontSize: ".92rem", fontWeight: view === id ? 500 : 400,
        color: view === id ? "#eef4f8" : "rgba(238,244,248,.65)",
        borderBottom: view === id ? "2px solid #00c8e8" : "2px solid transparent", marginBottom: -1,
      }}
    >
      {label}
    </button>
  );

  const sectionLabel = { fontSize: ".66rem", letterSpacing: ".13em", textTransform: "uppercase", color: "#4fb8d0", marginBottom: ".7rem", fontWeight: 500 };
  const actionBtn = (enabled) => ({
    width: "100%", background: "transparent", border: "1px solid rgba(238,244,248,.07)", borderRadius: 8,
    color: enabled ? "rgba(238,244,248,.65)" : "rgba(238,244,248,.3)", fontFamily: "'DM Sans', sans-serif",
    fontSize: ".8rem", fontWeight: 300, padding: "9px 11px", textAlign: "left",
    cursor: enabled ? "pointer" : "not-allowed", marginBottom: 6, transition: "all .18s",
    display: "flex", alignItems: "center", gap: 9,
  });

  return (
    <div className="app-shell" style={{
      background: "radial-gradient(ellipse 900px 500px at 50% -5%, rgba(0,200,232,.05), transparent 60%), #080f1e",
      color: "#eef4f8", fontFamily: "'DM Sans', sans-serif",
      fontWeight: 300, display: "flex", flexDirection: "column",
      fontSize: 15,
    }}>
      {/* HEADER */}
      <header style={{
        background: "#0c1a30", borderBottom: "1px solid rgba(0,200,232,.18)",
        padding: "0 1.75rem", height: 68, display: "flex", alignItems: "center",
        gap: "1rem", flexShrink: 0, position: "sticky", top: 0, zIndex: 10,
      }}>
        <button onClick={() => goView("asistente")} aria-label="norma-ar, ir al asistente" style={{ display: "flex", alignItems: "center", gap: 12, background: "transparent", border: "none", cursor: "pointer", padding: 0, color: "inherit" }}>
          <AtomIcon size={42} animated={!reducedMotion} />
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "1.9rem", fontWeight: 700, letterSpacing: "-.02em", lineHeight: 1 }}>
            <span style={{ color: "#eef4f8" }}>norma</span>
            <span style={{ color: "#eef4f8", fontSize: "55%" }}>-</span>
            <span style={{ color: "#00c8e8" }}>ar</span>
          </div>
        </button>
        <nav className="main-nav" aria-label="Secciones" style={{ display: "flex", alignItems: "stretch", height: 68, marginLeft: "1.6rem", paddingLeft: "1.2rem", borderLeft: "1px solid rgba(238,244,248,.1)" }}>
          {navBtn("asistente", "Asistente")}
          {navBtn("fuentes", "Fuentes normativas")}
          {navBtn("acerca", "Acerca del proyecto")}
        </nav>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
          <div className="status-pill" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".82rem", color: "rgba(238,244,248,.85)" }}>
            <span style={{ width: 8, height: 8, background: "#2ee6a6", borderRadius: "50%", display: "inline-block", animation: "blink 2s infinite" }} />
            Base documental disponible
          </div>
          <div style={{ position: "relative" }}>
            <button onClick={() => setHelpOpen(v => !v)} aria-expanded={helpOpen} style={{ display: "flex", alignItems: "center", gap: 8, background: "transparent", border: "1px solid rgba(0,200,232,.45)", borderRadius: 22, color: "#00c8e8", padding: "8px 18px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: ".85rem", fontWeight: 500 }}>
              <Icon name="help" size={18} />
              <span className="help-label">Ayuda</span>
            </button>
            {helpOpen && (
              <div role="dialog" aria-label="Ayuda" style={{ position: "absolute", right: 0, top: 48, width: 300, background: "#0f1e36", border: "1px solid rgba(0,200,232,.25)", borderRadius: 10, padding: "14px 16px", fontSize: ".8rem", lineHeight: 1.65, color: "rgba(238,244,248,.75)", boxShadow: "0 12px 32px rgba(0,0,0,.45)", zIndex: 20 }}>
                <div style={{ fontWeight: 500, color: "#eef4f8", marginBottom: 6 }}>Cómo usar norma-ar</div>
                Escribí tu consulta o elegí un tema del menú. Las respuestas indican los documentos fuente (normas en dorado, guías en celeste).
                <br /><br />
                Es una herramienta de apoyo: verificá siempre la norma oficial antes de tomar decisiones.
              </div>
            )}
          </div>
          <button onClick={() => setSidebarOpen(v => !v)} aria-label={sidebarOpen ? "Cerrar menú" : "Abrir menú"} aria-expanded={sidebarOpen} style={{ display: "none", background: "transparent", border: "1px solid rgba(0,200,232,.18)", borderRadius: 6, color: "#00c8e8", padding: "6px 10px", cursor: "pointer", fontSize: ".8rem" }} className="mob-menu">
            ☰
          </button>
        </div>
      </header>

      {/* LAYOUT */}
      <div className="app-body" style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {sidebarOpen && (
          <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
        )}

        {/* SIDEBAR */}
        <aside className={`sidebar${sidebarOpen ? " sidebar-open" : ""}`} style={{
          width: 324, flexShrink: 0, background: "#0b1830",
          borderRight: "1px solid rgba(238,244,248,.07)",
          overflowY: "auto", display: "flex", flexDirection: "column", padding: "1.3rem 1.4rem",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#0f1e36", border: "1px solid rgba(0,200,232,.2)", borderRadius: 10, padding: "0 13px", marginBottom: "1.5rem" }}>
            <Icon name="search" size={18} color="#6fb6c8" />
            <input
              value={topicQuery}
              onChange={e => setTopicQuery(e.target.value)}
              placeholder="Buscar temas o palabras clave..."
              aria-label="Buscar temas"
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#eef4f8", fontFamily: "'DM Sans', sans-serif", fontSize: ".85rem", fontWeight: 300, padding: "13px 0", minWidth: 0 }}
            />
          </div>

          <div style={sectionLabel}>Temas principales</div>
          <div style={{ marginBottom: "1.6rem" }}>
            {filteredTopics.map((t) => (
              <button key={t.label} className="topic-btn" onClick={() => { setView("asistente"); sendMsg(t.q); setSidebarOpen(false); }} style={{
                width: "100%", background: "#0f1e36", border: "1px solid rgba(238,244,248,.08)",
                borderRadius: 10, color: "rgba(238,244,248,.65)", fontFamily: "'DM Sans', sans-serif",
                padding: "11px 13px", textAlign: "left", cursor: "pointer", marginBottom: 8,
                display: "flex", alignItems: "center", gap: 13, transition: "all .18s",
              }}>
                <span style={{ color: "#00c8e8", display: "flex" }}><Icon name={t.icon} size={26} strokeWidth={1.3} /></span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: ".9rem", fontWeight: 500, color: "#eef4f8", lineHeight: 1.3 }}>{t.label}</span>
                  <span style={{ display: "block", fontSize: ".74rem", color: "rgba(238,244,248,.6)", marginTop: 2, lineHeight: 1.35 }}>{t.sub}</span>
                </span>
                <span style={{ color: "rgba(238,244,248,.55)", display: "flex" }}><Icon name="chevron" size={16} /></span>
              </button>
            ))}
            {filteredTopics.length === 0 && (
              <div style={{ fontSize: ".78rem", color: "rgba(238,244,248,.5)", padding: "4px 2px" }}>No hay temas que coincidan. Probá escribir tu consulta directamente en el chat.</div>
            )}
          </div>

          <div style={sectionLabel}>Fuentes oficiales</div>
          <div style={{ background: "#0f1e36", border: "1px solid rgba(238,244,248,.1)", borderRadius: 10, padding: "4px 14px", marginBottom: "1.6rem" }}>
            {SOURCE_LINKS.map((sl, idx) => (
              <a key={sl.label} href={sl.url} target="_blank" rel="noreferrer" style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                color: "#e8c84a", textDecoration: "none", fontSize: ".85rem", padding: "11px 0",
                borderBottom: idx < SOURCE_LINKS.length - 1 ? "1px solid rgba(238,244,248,.07)" : "none",
              }}>
                <span>{sl.label}</span>
                <Icon name="external" size={16} />
              </a>
            ))}
          </div>

          <div style={sectionLabel}>Acciones</div>
          <button onClick={exportConversation} disabled={!canExport} className="act-btn" style={actionBtn(canExport)}>
            <Icon name="download" size={16} /> Exportar conversación
          </button>
          <button onClick={clearChat} className="act-btn" style={actionBtn(true)}>
            <Icon name="trash" size={16} /> Limpiar conversación
          </button>
        </aside>

        {/* MAIN */}
        {view === "asistente" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
          <div
            ref={msgsRef}
            onScroll={handleMessagesScroll}
            role="log"
            aria-live="polite"
            aria-label="Conversación"
            style={{ flex: 1, overflowY: "auto", padding: "2rem 2.25rem 1rem", display: "flex", flexDirection: "column", gap: "1.4rem", scrollBehavior: "smooth" }}
          >
            {/* WELCOME */}
            {showWelcome && (
              <div style={{ width: "100%", maxWidth: 1120, margin: "0 auto" }}>
                <div className="hero" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "2rem", margin: "1.2rem 0 1.8rem", flexWrap: "wrap" }}>
                  <AtomIcon size={104} animated={!reducedMotion} />
                  <div className="hero-divider" style={{ width: 1, alignSelf: "stretch", background: "rgba(238,244,248,.22)" }} />
                  <div style={{ maxWidth: 520 }}>
                    <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "clamp(1.8rem, 3.6vw, 2.6rem)", fontWeight: 700, letterSpacing: "-.02em", lineHeight: 1.12, margin: 0, color: "#eef4f8" }}>
                      Consultá la <span style={{ color: "#00c8e8" }}>normativa</span> nuclear argentina
                    </h1>
                    <p style={{ fontSize: "1.02rem", color: "rgba(238,244,248,.72)", margin: ".9rem 0 0", fontWeight: 400 }}>
                      Respuestas con fuentes para verificar cada requisito.
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(0,200,232,.07)", border: "1px solid rgba(0,200,232,.35)", borderRadius: 14, padding: "14px 20px", marginBottom: "1.4rem", color: "#cfeef6", fontSize: ".92rem", fontWeight: 400 }}>
                  <Icon name="info" size={22} color="#4cc9e8" />
                  Herramienta de apoyo. Verificá siempre la norma oficial antes de tomar decisiones.
                </div>

                <div className="cards" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14 }}>
                  {CARDS.map(c => (
                    <button key={c.title} className="card-btn" onClick={() => sendMsg(c.q)} style={{
                      background: "#0f1e36", border: "1px solid rgba(0,200,232,.2)", borderRadius: 14, padding: "20px 20px 18px",
                      textAlign: "left", cursor: "pointer", color: "inherit", fontFamily: "'DM Sans', sans-serif",
                      display: "flex", flexDirection: "column", gap: 12, transition: "all .18s", minHeight: 150,
                    }}>
                      <span style={{ color: "#4cc9e8", display: "flex" }}><Icon name={c.icon} size={36} strokeWidth={1.2} /></span>
                      <span style={{ fontSize: "1.08rem", fontWeight: 500, color: "#eef4f8", lineHeight: 1.25 }}>{c.title}</span>
                      <span style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10 }}>
                        <span style={{ fontSize: ".86rem", color: "rgba(238,244,248,.62)", lineHeight: 1.45 }}>{c.sub}</span>
                        <span style={{ color: "#4cc9e8", display: "flex" }}><Icon name="arrow" size={20} /></span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* MESSAGES */}
            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", gap: 10, flexDirection: msg.role === "user" ? "row-reverse" : "row", animation: "fadeUp .28s ease" }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: msg.role === "user" ? ".67rem" : ".6rem", fontWeight: 500, marginTop: 2, background: msg.role === "user" ? "#1c3056" : "#0090ab", border: msg.role === "user" ? "1px solid rgba(0,200,232,.18)" : "none", color: "#eef4f8", letterSpacing: msg.role === "assistant" ? ".03em" : 0 }}>
                  {msg.role === "user" ? "Vos" : <AtomIcon size={28} />}
                </div>
                <div>
                  {msg.isError ? (
                    <div style={{
                      maxWidth: "80%", background: "rgba(255,90,90,.07)", border: "1px solid rgba(255,90,90,.28)",
                      borderRadius: 10, borderTopLeftRadius: 3, padding: "11px 15px",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: ".78rem", fontWeight: 500, color: "#ff9090", marginBottom: 3 }}>
                        <span style={{ width: 6, height: 6, background: "#ff9090", borderRadius: "50%", display: "inline-block", flexShrink: 0 }} />
                        {msg.errorTitle || "Ocurrió un error"}
                      </div>
                      {msg.errorDetail && (
                        <div style={{ fontSize: ".8rem", color: "rgba(238,244,248,.55)", lineHeight: 1.6 }}>
                          {msg.errorDetail}
                        </div>
                      )}
                    </div>
                  ) : (
                  <div style={{ maxWidth: "80%", padding: "11px 15px", borderRadius: 10, fontSize: ".87rem", lineHeight: 1.72, background: msg.role === "user" ? "#1c3056" : "#152540", border: msg.role === "user" ? "1px solid rgba(0,200,232,.18)" : "1px solid rgba(238,244,248,.07)", borderTopRightRadius: msg.role === "user" ? 3 : 10, borderTopLeftRadius: msg.role === "assistant" ? 3 : 10, color: msg.role === "user" ? "#eef4f8" : "rgba(238,244,248,.65)", whiteSpace: msg.role === "user" ? "pre-wrap" : undefined }}>
                    {msg.role === "user"
                      ? msg.text
                      : <span dangerouslySetInnerHTML={{ __html: msg.html }} />}
                    {msg.streaming && (
                      <span style={{ display: "inline-block", width: 6, height: 13, background: "#00c8e8", marginLeft: 3, verticalAlign: "text-bottom", animation: "blink 1s infinite" }} />
                    )}
                  </div>
                  )}
                  {!msg.isError && msg.role === "assistant" && msg.citations && msg.citations.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 7 }}>
                      {msg.citations.map((c, ci) => (
                        <span key={ci} style={{
                          fontSize: ".68rem",
                          color: /^gu[ií]a/i.test(c) ? "#00c8e8" : "#e8c84a",
                          background: /^gu[ií]a/i.test(c) ? "rgba(0,200,232,.08)" : "rgba(232,200,74,.08)",
                          border: /^gu[ií]a/i.test(c) ? "1px solid rgba(0,200,232,.25)" : "1px solid rgba(232,200,74,.25)",
                          borderRadius: 20, padding: "2px 11px",
                          letterSpacing: ".01em", fontFamily: "'DM Sans', sans-serif",
                        }}>
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: msg.role === "user" ? "flex-end" : "space-between", gap: 8, marginTop: 3 }}>
                    <span style={{ fontSize: ".63rem", color: "rgba(238,244,248,.28)" }}>{msg.time}</span>
                    {!msg.isError && msg.role === "assistant" && !msg.streaming && msg.text && (
                      <button
                        onClick={() => copyMessage(i, msg.text)}
                        aria-label="Copiar respuesta"
                        title="Copiar respuesta"
                        style={{ background: "transparent", border: "none", cursor: "pointer", padding: 2, display: "flex", alignItems: "center", gap: 4, color: copiedIndex === i ? "#00c8e8" : "rgba(238,244,248,.28)", fontSize: ".63rem", fontFamily: "'DM Sans', sans-serif" }}
                      >
                        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                          <rect x="4.5" y="4.5" width="8" height="8" rx="1.3" stroke="currentColor" strokeWidth="1.1" />
                          <path d="M2.5 9.5V2.3A.8.8 0 0 1 3.3 1.5h7.2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                        </svg>
                        {copiedIndex === i ? "Copiado" : "Copiar"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* INPUT: "Empezá por una consulta" + caja de escritura en un solo panel */}
          <div style={{ padding: ".6rem 2.25rem 1rem", background: "transparent" }}>
            <div style={{ width: "100%", maxWidth: 1120, margin: "0 auto" }}>
              <div style={{ background: "#0d1b33", border: "1px solid rgba(0,200,232,.22)", borderRadius: 16, padding: showWelcome ? "16px 16px 12px" : "10px 12px" }}>
                {showWelcome && (
                  <div className="starter" style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#eef4f8", fontSize: "1rem", fontWeight: 500, margin: "2px 4px 12px" }}>
                      <span style={{ color: "#4cc9e8", display: "flex" }}><Icon name="search" size={22} /></span>
                      Empezá por una consulta
                    </div>
                    <button className="card-btn" onClick={startPrompt} style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 16, background: "#11244a", border: "1px solid rgba(0,200,232,.3)",
                      borderRadius: 12, padding: "14px 18px", cursor: "pointer", textAlign: "left", color: "inherit", fontFamily: "'DM Sans', sans-serif", transition: "all .18s",
                    }}>
                      <span style={{ width: 46, height: 46, borderRadius: 12, background: "rgba(0,200,232,.1)", border: "1px solid rgba(0,200,232,.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#4cc9e8", flexShrink: 0 }}>
                        <Icon name="chat" size={24} />
                      </span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: "block", fontSize: ".98rem", fontWeight: 500, color: "#eef4f8" }}>¿Qué requisitos establece la normativa para...?</span>
                        <span style={{ display: "block", fontSize: ".82rem", color: "rgba(238,244,248,.6)", marginTop: 3 }}>Podés preguntar por norma, actividad o instalación.</span>
                      </span>
                      <span style={{ color: "#4cc9e8", display: "flex" }}><Icon name="arrow" size={22} /></span>
                    </button>
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, background: "#0b1830", border: "1px solid rgba(0,200,232,.3)", borderRadius: 12, padding: "7px 7px 7px 15px" }}>
                  <textarea
                    ref={inpRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Escribí tu consulta..."
                    rows={1}
                    aria-label="Escribí tu consulta"
                    style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#eef4f8", fontFamily: "'DM Sans', sans-serif", fontSize: ".92rem", fontWeight: 300, resize: "none", height: 42, maxHeight: MAX_TEXTAREA_HEIGHT, overflowY: "auto", lineHeight: 1.5, padding: "6px 0" }}
                  />
                  {busy ? (
                    <button
                      onClick={stopGeneration}
                      title="Detener generación"
                      aria-label="Detener generación"
                      style={{ width: 46, height: 42, background: "rgba(255,144,144,.15)", border: "1px solid rgba(255,144,144,.35)", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, alignSelf: "flex-end", transition: "all .18s" }}>
                      <span style={{ width: 11, height: 11, background: "#ff9090", borderRadius: 2, display: "inline-block" }} />
                    </button>
                  ) : (
                    <button
                      onClick={() => sendMsg()}
                      disabled={!input.trim()}
                      aria-label="Enviar mensaje"
                      style={{ width: 46, height: 42, background: !input.trim() ? "rgba(0,200,232,.25)" : "#2ab8f0", border: "none", borderRadius: 8, cursor: !input.trim() ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, alignSelf: "flex-end", transition: "all .18s" }}>
                      <svg width="19" height="19" viewBox="0 0 17 17" fill="none">
                        <path d="M15.5 8.5L1.5 1.5l3.2 7-3.2 7 14-7z" fill="#08101e" stroke="#08101e" strokeWidth=".5" strokeLinejoin="round" />
                      </svg>
                    </button>
                  )}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, padding: "0 4px", fontSize: ".7rem", color: "rgba(238,244,248,.45)" }}>
                  <span>Enter para enviar &nbsp;·&nbsp; Shift + Enter para nueva línea{busy ? " · Generando…" : ""}</span>
                  <span style={{ color: input.length > MAX_MESSAGE_LENGTH * 0.9 ? "#ff9090" : "rgba(238,244,248,.45)", flexShrink: 0, marginLeft: 10 }}>
                    {input.length}/{MAX_MESSAGE_LENGTH}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 12, fontSize: ".72rem", color: "rgba(238,244,248,.5)", textAlign: "center" }}>
                <Icon name="shield" size={16} color="#4cc9e8" />
                Las respuestas identifican los documentos fuente; las citas no reemplazan la lectura del original.
              </div>
            </div>
          </div>
        </div>
        )}

        {view === "fuentes" && (
          <div style={{ flex: 1, overflowY: "auto", padding: "2.2rem 2.25rem" }}>
            <div style={{ maxWidth: 820, margin: "0 auto" }}>
              <h2 style={{ fontSize: "1.7rem", fontWeight: 700, margin: "0 0 .4rem", letterSpacing: "-.01em" }}>Fuentes normativas</h2>
              <p style={{ color: "rgba(238,244,248,.7)", lineHeight: 1.7, margin: "0 0 1.6rem" }}>
                El asistente responde a partir de documentos oficiales indexados. Para cada consulta, las fuentes utilizadas aparecen al pie de la respuesta.
              </p>
              <div style={sectionLabel}>Qué contiene la base documental</div>
              <div style={{ background: "#0f1e36", border: "1px solid rgba(238,244,248,.1)", borderRadius: 12, overflow: "hidden", marginBottom: "1.8rem" }}>
                {[
                  ["Normas regulatorias de la ARN", "Las 64 normas vigentes"],
                  ["Guías regulatorias de la ARN", "10 guías (orientativas, no obligatorias)"],
                  ["Leyes y decretos", "Ley 24.804 y su Decreto reglamentario 1390/98"],
                  ["Tratados y acuerdos internacionales", "Tlatelolco, TNP, Acuerdo Argentina-Brasil y Acuerdo Cuatripartito"],
                  ["Información institucional", "CNEA e INVAP (información básica)"],
                ].map(([a, b], idx, arr) => (
                  <div key={a} style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", padding: "13px 18px", borderBottom: idx < arr.length - 1 ? "1px solid rgba(238,244,248,.07)" : "none", fontSize: ".9rem" }}>
                    <span style={{ color: "#eef4f8", fontWeight: 500 }}>{a}</span>
                    <span style={{ color: "rgba(238,244,248,.65)" }}>{b}</span>
                  </div>
                ))}
              </div>
              <div style={sectionLabel}>Sitios oficiales</div>
              <div style={{ background: "#0f1e36", border: "1px solid rgba(238,244,248,.1)", borderRadius: 12, padding: "4px 18px" }}>
                {SOURCE_LINKS.map((sl, idx) => (
                  <a key={sl.label} href={sl.url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, color: "#e8c84a", textDecoration: "none", fontSize: ".92rem", padding: "13px 0", borderBottom: idx < SOURCE_LINKS.length - 1 ? "1px solid rgba(238,244,248,.07)" : "none" }}>
                    <span>{sl.label}</span><Icon name="external" size={17} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === "acerca" && (
          <div style={{ flex: 1, overflowY: "auto", padding: "2.2rem 2.25rem" }}>
            <div style={{ maxWidth: 820, margin: "0 auto", lineHeight: 1.75, color: "rgba(238,244,248,.78)" }}>
              <h2 style={{ fontSize: "1.7rem", fontWeight: 700, margin: "0 0 .8rem", color: "#eef4f8", letterSpacing: "-.01em" }}>Acerca del proyecto</h2>
              <p>norma-ar es un asistente de consulta sobre la normativa nuclear argentina. Busca en los documentos oficiales indexados (arquitectura RAG) y responde citando las fuentes, para que cada dato pueda verificarse.</p>
              <p>Se desarrolló como Trabajo Final Integrador de la Especialización en Seguridad Nuclear.</p>
              <p style={{ color: "#e8c84a" }}>Es una herramienta de apoyo: no reemplaza la lectura de la norma oficial ni constituye asesoramiento regulatorio. Las guías de la ARN son orientativas.</p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(7px)} to{opacity:1;transform:none} }
        * { box-sizing: border-box; }
        html, body, #root { height: 100%; margin: 0; padding: 0; }
        .app-shell {
          height: 100vh;
          height: 100dvh; /* viewport real en mobile: evita que el input quede oculto abajo */
        }
        .app-body {
          height: calc(100vh - 68px);
          height: calc(100dvh - 68px);
        }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: rgba(0,200,232,.18); border-radius: 3px; }
        textarea::placeholder { color: rgba(238,244,248,.28) !important; }
        p { margin-bottom: .55rem; }
        p:last-child { margin-bottom: 0; }
        strong { color: #eef4f8; font-weight: 500; }
        .sidebar-backdrop { display: none; }
        .topic-btn:hover, .card-btn:hover { background: rgba(0,200,232,.09) !important; border-color: rgba(0,200,232,.55) !important; }
        .act-btn:not(:disabled):hover { background: rgba(0,200,232,.07) !important; color: #eef4f8 !important; }
        input::placeholder { color: rgba(238,244,248,.4) !important; }
        @media (max-width: 1000px) { .status-pill { display: none !important; } }
        @media (max-width: 860px) { .main-nav { display: none !important; } }


        /* ── FOCO DE TECLADO ── */
        button:focus-visible, a:focus-visible, textarea:focus-visible {
          outline: 2px solid #00c8e8;
          outline-offset: 2px;
          border-radius: 4px;
        }

        /* ── MOBILE ── */
        @media (max-width: 640px) {
          .mob-menu { display: flex !important; }
          .help-label { display: none; }
          .starter { display: none; }
          .hero-divider { display: none; }
          .sidebar {
            position: fixed !important;
            top: 68px; left: 0; bottom: 0;
            z-index: 100;
            transform: translateX(-100%);
            transition: transform .25s ease;
            width: 86vw !important;
            max-width: 340px;
            box-shadow: 4px 0 24px rgba(0,0,0,.5);
          }
          .sidebar-open { transform: translateX(0) !important; }
          .sidebar-backdrop {
            position: fixed;
            top: 68px; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,.55);
            z-index: 99;
            animation: fadeUp .2s ease;
          }
        }
      `}</style>
    </div>
  );
}
