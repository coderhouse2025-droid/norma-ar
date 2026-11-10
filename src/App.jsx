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
11. Basá la respuesta únicamente en la documentación recibida. Si la documentación no cubre la consulta o la cubre solo en parte, decilo de forma explícita ("esto no figura en las normas y documentos consultados") y respondé solo con lo que sí figura. No completes con conocimiento general o de memoria: ni datos de instalaciones, ni ubicaciones, ni potencias, ni fechas, ni cargos, ni estructuras orgánicas, ni nombres de organismos, comités o decretos, ni el "estado actual" de una instalación. Una respuesta breve y correcta es mejor que una completa con datos no respaldados. Pero antes de decir que algo no figura, revisá todos los fragmentos recibidos: si alguno trata el tema (por ejemplo, la información institucional de la CNEA, de INVAP o de la ARN, o una ley), usalo y citá esa fuente. Decí "no figura" solo sobre lo que realmente no aparece, nunca sobre el tema completo cuando hay fragmentos que lo describen.
12. Números de artículo, párrafo o tabla: citalos solo si aparecen textualmente en la documentación recibida y corresponden a lo que afirmás. Si no estás seguro de qué artículo establece algo, describí el contenido sin numerarlo. Nunca completes con artículos de memoria.
13. En los tratados, distinguí el cuerpo del tratado de sus protocolos y anexos, y aclará de cuál proviene cada dato. Ejemplo: en el Tratado de Tlatelolco, la expresión «estatuto de desnuclearización para fines bélicos» y la remisión a los «art. 1, 3, 5 y 13» figuran en los Protocolos Adicionales, no en el cuerpo del Tratado; las obligaciones de las Partes del Tratado están en su Art. 1 (utilizar el material nuclear solo con fines pacíficos y prohibir e impedir el ensayo, uso, fabricación, producción, adquisición, recibo, almacenamiento, instalación y posesión de armas nucleares). Los Protocolos Adicionales obligan a los Estados que los firman (el I, a los Estados con responsabilidad internacional sobre territorios dentro de la zona; el II, a las potencias nucleares) y tienen la misma duración que el Tratado. No asignes un número de artículo a un contenido si ese número no figura en el texto recibido junto a ese contenido. Si un dato no está en el texto recibido (por ejemplo, qué Estados poseen armas nucleares), aclaralo en lugar de agregarlo de memoria.
14. Las guías regulatorias son de carácter orientativo: al presentar sus valores usá "la guía recomienda / no debería superarse", no "es obligatorio / máximo permitido", y indicá a qué punto o condición se aplica cada valor, tal como figura en el texto. No incluyas marcas de cita (como 【…】) dentro del cuerpo de la respuesta: las fuentes van solo al final, según la regla 7.
15. Límites de dosis: nunca los des de memoria ni los traslades de un contexto a otro. Citá únicamente los que aparezcan en la documentación recibida, indicando a quién se aplican (trabajadores, público, grupo crítico) y en qué norma. Si el fragmento recibido no los incluye, decilo y remití a la norma AR 10.1.1.
16. Organismos internacionales: el OIEA es el Organismo Internacional de Energía Atómica. No es un regulador: sus normas de seguridad son estándares no vinculantes que cada Estado incorpora a su regulación; no existe un regulador nuclear internacional. En Argentina el regulador es la ARN. Usá siempre el nombre exacto del organismo tal como figura en la documentación. Sobre el OIEA y otros organismos, no des año de creación, cantidad de miembros ni listas de funciones salvo que figuren en la documentación recibida; limitate a lo que ella dice.
17. No uses los nombres de las áreas de conocimiento de este prompt como si fueran datos: que un tema esté listado no significa que tengas información sobre él. Si la consulta es sobre instalaciones concretas (por ejemplo, reactores de investigación), describí solo lo que establecen las normas y guías recibidas y aclará que los datos específicos de cada instalación (ubicación, potencia, estado) no forman parte de la documentación consultada.
18. No confundas conceptos de protección radiológica que se parecen: (a) límite de dosis (obligatorio, aplica a trabajadores o público); (b) restricción de dosis (valor de diseño u optimización, por debajo del límite); (c) nivel de referencia o de intervención; (d) criterio para no tener que demostrar optimización o para eximir una práctica; (e) criterio de dosis colectiva por unidad de energía generada (propio del diseño de reactores). Llamá "límite de dosis" solo a lo que la documentación recibida llama así, indicando la norma y el apartado. Si un valor aparece en el texto como condición o criterio y no como límite, presentalo con ese carácter. Si un fragmento está cortado y no se ve la condición a la que pertenece un valor, no lo uses como regla general. La dosis colectiva no tiene límite propio salvo que la documentación lo establezca para un caso concreto: en ese caso citá la norma y el caso.
19. Formato: nunca menciones "fragmento", números de fragmento ni nombres de archivo (como "0-11-1_r3.pdf") en el cuerpo de la respuesta; las fuentes van solo al final, entre corchetes. Nunca indiques números de página ("p. 1") ni identificadores internos de archivo (como "4-7-2 r0"): nombrá las normas como "Norma AR 4.7.2". No agregues una columna de "Comentario" que solo repita qué documento menciona cada cosa. Si usás una tabla, que todas sus filas tengan todas las columnas completas y no dejes columnas vacías: si una columna no tiene datos para todas las filas, quitala. Si la consulta es ambigua (por ejemplo, "tipos de licencia" puede referirse a licencias de instalación o a permisos individuales), respondé lo que figura distinguiendo ambos casos y no los mezcles.
20. Licenciamiento: la Licencia de Operación es una licencia puntual y no cubre varias etapas. Si la documentación recibida enumera licencias distintas por etapa (por ejemplo construcción, puesta en marcha, operación, retiro de servicio), presentalas como licencias separadas, indicando a qué clase de instalación corresponde cada una según el texto. Distinguí siempre licencias de instalación, licencias individuales, permisos individuales y registro, y no atribuyas a una clase de instalación lo que el texto asigna a otra.
21. Fechas y normas legales: no unas en una sola frase datos que la documentación presenta por separado. Si el texto dice que una institución existe "desde" un año y, aparte, que su régimen legal lo estableció un decreto o una ley, indicá ambos hechos por separado (por ejemplo, "funciona desde 1950; su régimen legal fue establecido por el Decreto-Ley X") y no escribas que fue "creada mediante" ese decreto salvo que el texto lo diga así. Una fecha y un instrumento legal solo se relacionan si el texto los relaciona; si las fechas parecen contradictorias, usá solo lo que el texto afirma de forma directa.`;

// Formulario de comentarios de los visitantes (Google Forms, enlace público).
const FEEDBACK_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfmvKUQme021P1qJSCxi0fiV1LCKb5JZv7JdmVJwPtWn4SXnw/viewform";

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
  speaker: "M4 9v6h4l5 4V5L8 9H4zM16.5 9a4 4 0 0 1 0 6M19 6.5a8 8 0 0 1 0 11",
  speakerOff: "M4 9v6h4l5 4V5L8 9H4zM17 9.5l5 5M22 9.5l-5 5",
  mic: "M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3M9 21h6",
  trash: "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20c0-3.5 3.6-6 8-6s8 2.5 8 6",
  lock: "M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3",
  eye: "M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  eyeOff: "M3 3l18 18M10.6 6.1A10 10 0 0 1 12 6c6.4 0 10 6 10 6a17 17 0 0 1-3.2 3.8M6.5 7.6A17 17 0 0 0 2 12s3.6 6 10 6c1.6 0 3-.3 4.3-.9M9.9 9.9a3 3 0 0 0 4.2 4.2",
  login: "M14 4h5v16h-5M10 8l4 4-4 4M14 12H4",
  comment: "M4 5h16v11H9l-5 4V5zM8 9h8M8 12h5",
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
    // Cada fila se ajusta a la cantidad de columnas del encabezado (el modelo a veces omite una celda).
    const bodyRows = lines.slice(2).map(splitTableRow).map((r) =>
      r.length < headerCells.length ? [...r, ...Array(headerCells.length - r.length).fill("")] : r.slice(0, headerCells.length)
    );
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
    .replace(/<\/li>\n(?=<li>)/g, "</li>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>");
  t = t.replace(/<br><\/ul>/g, "</ul>").replace(/<\/ul><br>/g, "</ul>");
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
  const regex = /\[([^[\]\n]{2,300})\]/g;
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
    .replace(/\[([^[\]\n]{2,300})\]/g, "")
    .replace(/\s*【[^】\n]{1,120}】/g, "") // marcas de cita tipo 【AR 10.12.1】 que a veces emite el modelo
    .replace(/[ \t]{2,}/g, " ")
    .replace(/[ \t]+([.,;:])/g, "$1"); // al sacar una cita queda " ." suelto
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
// Red de seguridad: el prompt prohíbe nombrar "fragmentos" o archivos internos, pero el modelo
// a veces lo hace. Se reemplaza por una expresión neutra para que el usuario no vea el mecanismo interno.
function hideInternalRefs(text) {
  return text
    // Líneas que solo contienen asteriscos (negritas mal cerradas) se verían como "**" sueltos.
    .replace(/^[ \t]*\*{2,}[ \t]*$/gm, "")
    // Una cita en bloque vacía (">" solo en una línea) se vería como un recuadro vacío.
    .replace(/^[ \t]*>[ \t]*$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\s*\((?:ver\s+)?fragmentos?\s+\d+[^)]*\)/gi, "")
    // Páginas: el índice no tiene número de página, así que cualquier "(p. 1 …)" es inventado.
    .replace(/\s*\(\s*pp?\.\s*\d+[^)]*\)/gi, "")
    // Identificadores de archivo del índice (4-7-2 r0) → nombre de la norma (AR 4.7.2, rev. 0).
    .replace(/\b(\d{1,2})[‐-–-](\d{1,2})[‐-–-](\d{1,2})\s*_?r(\d+)(?:\.pdf)?\b/gi, "AR $1.$2.$3 (rev. $4)")
    // "fragmento(s)" es un término interno: se reemplaza por "documento(s) consultado(s)", que mantiene
    // la concordancia con el verbo ("los documentos consultados tratan…") y respeta la mayúscula inicial.
    .replace(/\b(?:del|al)\s+fragmentos?\b/gi, (m) => (/^[A-ZÁÉÍÓÚ]/.test(m) ? (m.toLowerCase().startsWith("del") ? "Del" : "Al") : (m.toLowerCase().startsWith("del") ? "del" : "al")) + " documento consultado")
    .replace(/\b(?:los|las|estos|esos)\s+fragmentos(?:\s+(?:recibidos|consultados|recuperados|proporcionados|disponibles))?/gi,
      (m) => (/^[A-ZÁÉÍÓÚ]/.test(m) ? "Los" : "los") + " documentos consultados")
    .replace(/\b(?:el|este|ese)\s+fragmento(?:\s+(?:recibido|consultado|recuperado|proporcionado))?/gi,
      (m) => (/^[A-ZÁÉÍÓÚ]/.test(m) ? "El" : "el") + " documento consultado")
    .replace(/\bfragmentos?\b/gi, (m) => (/s$/i.test(m) ? "documentos" : "documento"))
    // CNEA: el texto fuente dice que el Decreto-Ley 22.498/56 estableció su régimen legal (la CNEA
    // existe desde 1950); el modelo a veces lo reformula como "fue creada mediante" ese decreto.
    .replace(/\b([Ff])ue creada (?:mediante|por|a través d[eo]l?)\s*(?:el\s+)?decreto[\s\u2010-\u2013-]*ley\s+(22\.498\/56)/gi,
      (_, f, n) => f === "F" ? `Su régimen legal fue establecido por el Decreto-Ley ${n}` : `tiene su régimen legal establecido por el Decreto-Ley ${n}`)
    // El OIEA es un "Organismo", no una "Organización" (error recurrente del modelo).
    .replace(/\b([Ll])a Organizaci[oó]n Internacional de Energ[ií]a At[oó]mica\b/g, (_, l) => `${l === "L" ? "El" : "el"} Organismo Internacional de Energía Atómica`)
    .replace(/\bOrganizaci[oó]n Internacional de Energ[ií]a At[oó]mica\b/g, "Organismo Internacional de Energía Atómica")
    .replace(/\b([Dd])e el Organismo Internacional/g, "$1el Organismo Internacional")
    .replace(/\b([Aa]) el Organismo Internacional/g, "$1l Organismo Internacional");
}

function cleanAssistantText(raw) {
  return hideInternalRefs(stripTrailingSourcesLabel(stripCitations(raw)));
}

// Tope de seguridad al guardar en el historial: incluso sin citas, una respuesta muy larga
// no debería tirar abajo el próximo mensaje del usuario por superar MAX_MESSAGE_LENGTH.
function capForHistory(text) {
  if (text.length <= MAX_MESSAGE_LENGTH) return text;
  return text.slice(0, MAX_MESSAGE_LENGTH - 20) + "… (recortado)";
}

// Combina el parseo de citas con la conversión a HTML, para usar en cada actualización del mensaje.
// Respuestas que abren diciendo que no se encontró información: las referencias del pie no
// respaldan nada (son solo los textos que se consultaron), así que no se muestran.
const OPENS_WITH_NOT_FOUND = /^[\s#*>_-]*(?:en la documentaci[oó]n consultada,?\s+)?(?:no\s+(?:se\s+)?(?:encontr|encuentr|incluy|detall|mencion|figur|aparec|hall)\w*|no\s+(?:hay|existe|cuento)\b)/i;
// También cuando la respuesta empieza describiendo lo que sí hay y enseguida aclara que no incluye lo consultado
// ("…pero no incluye disposiciones específicas…", "…no se encuentran los requisitos…").
const SAYS_NOT_FOUND_EARLY = /\b(?:pero\s+)?no\s+(?:se\s+)?(?:incluy|encuentr|encontr|hall|figur)\w*\s+(?:\w+\s+){0,3}?(?:disposiciones|requisitos|informaci[oó]n|definici[oó]n|normativa|criterios)\b/i;

function renderAssistant(raw) {
  const limpio = cleanAssistantText(raw);
  const citations = OPENS_WITH_NOT_FOUND.test(limpio.slice(0, 200)) || SAYS_NOT_FOUND_EARLY.test(limpio.slice(0, 450)) ? [] : extractCitations(raw);
  const html = md2html(limpio);
  return { html, citations };
}

function getTime() {
  return new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

// Lectura en voz alta (speechSynthesis del navegador).
function plainForSpeech(raw) {
  return (raw || "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/^\s*\|?[\s:|-]{3,}\|?\s*$/gm, "")
    .replace(/\|/g, ", ")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/\*\*|__|\*|`/g, "")
    .replace(/^\s*[-•]\s+/gm, "")
    .replace(/\[[^\]\n]{2,300}\]/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{2,}/g, ". ")
    .replace(/\n/g, " ")
    .trim();
}

function speakText(raw) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const text = plainForSpeech(raw);
  if (!text) return;
  // Se parte en frases cortas: Chrome corta las lecturas largas de una sola vez.
  const parts = text.match(/[^.!?;:]+[.!?;:]*\s*/g) || [text];
  const chunks = [];
  let cur = "";
  for (const p of parts) {
    if ((cur + p).length > 180 && cur) { chunks.push(cur); cur = p; } else { cur += p; }
  }
  if (cur.trim()) chunks.push(cur);
  const voices = synth.getVoices();
  const voice = voices.find(v => /^es[-_]AR/i.test(v.lang)) || voices.find(v => /^es/i.test(v.lang));
  chunks.forEach(c => {
    const u = new SpeechSynthesisUtterance(c.trim());
    u.lang = voice ? voice.lang : "es-AR";
    if (voice) u.voice = voice;
    u.rate = 1;
    synth.speak(u);
  });
}

function Asistente({ onLogout }) {
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [view, setView] = useState("asistente");
  const [topicQuery, setTopicQuery] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const recRef = useRef(null);
  const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window;
  const [readAloud, setReadAloud] = useState(() => {
    try { return localStorage.getItem("norma-ar-leer") === "1"; } catch { return false; }
  });
  const [speaking, setSpeaking] = useState(false);
  const readAloudRef = useRef(readAloud);
  useEffect(() => { readAloudRef.current = readAloud; }, [readAloud]);
  useEffect(() => {
    if (!canSpeak) return;
    const id = setInterval(() => setSpeaking(window.speechSynthesis.speaking || window.speechSynthesis.pending), 400);
    return () => { clearInterval(id); window.speechSynthesis.cancel(); };
  }, [canSpeak]);
  const stopSpeaking = () => { if (canSpeak) { window.speechSynthesis.cancel(); setSpeaking(false); } };
  const toggleReadAloud = () => {
    const next = !readAloud;
    setReadAloud(next);
    try { localStorage.setItem("norma-ar-leer", next ? "1" : "0"); } catch { /* sin almacenamiento */ }
    if (!next) stopSpeaking();
  };
  const SpeechRec = typeof window !== "undefined" ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
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
    // Sin mensajes (pantalla de bienvenida) no se desplaza: en celulares tapaba el saludo.
    if (messages.length > 0 && msgsRef.current && isNearBottomRef.current) {
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

    stopListening();
    stopSpeaking();
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
      if (readAloudRef.current && assistantText) speakText(cleanAssistantText(assistantText));
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

  // Dictado por voz (Web Speech API del navegador). No requiere cambios en el backend.
  const stopListening = () => {
    try { recRef.current?.stop(); } catch { /* ya detenido */ }
  };

  const toggleListening = () => {
    if (!SpeechRec) return;
    if (listening) { stopListening(); return; }
    setVoiceError("");
    const rec = new SpeechRec();
    rec.lang = "es-AR";
    rec.interimResults = true;
    rec.continuous = false;
    const base = input && !/\s$/.test(input) ? input + " " : input;
    rec.onresult = (e) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
      setInput((base + text).slice(0, MAX_MESSAGE_LENGTH));
    };
    rec.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setVoiceError("El navegador no tiene permiso para usar el micrófono. Habilitalo en la configuración del sitio.");
      } else if (e.error === "no-speech") {
        setVoiceError("No se escuchó nada. Probá de nuevo.");
      } else if (e.error !== "aborted") {
        setVoiceError("No se pudo usar el dictado por voz en este momento.");
      }
    };
    rec.onend = () => { setListening(false); recRef.current = null; setTimeout(() => inpRef.current?.focus(), 50); };
    recRef.current = rec;
    try { rec.start(); setListening(true); } catch { setListening(false); }
  };

  useEffect(() => () => { try { recRef.current?.abort(); } catch { /* noop */ } }, []);

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
    stopSpeaking();
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
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "1.9rem", fontWeight: 700, letterSpacing: "-.02em", lineHeight: 1, whiteSpace: "nowrap" }}>
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
        <div className="hdr-right" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
          <div className="status-pill" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".82rem", color: "rgba(238,244,248,.85)" }}>
            <span style={{ width: 8, height: 8, background: "#2ee6a6", borderRadius: "50%", display: "inline-block", animation: "blink 2s infinite" }} />
            Base documental disponible
          </div>
          <div style={{ position: "relative" }}>
            <button className="hdr-btn" onClick={() => setHelpOpen(v => !v)} aria-expanded={helpOpen} style={{ display: "flex", alignItems: "center", gap: 8, background: "transparent", border: "1px solid rgba(0,200,232,.45)", borderRadius: 22, color: "#00c8e8", padding: "8px 18px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: ".85rem", fontWeight: 500 }}>
              <Icon name="help" size={18} />
              <span className="help-label">Ayuda</span>
            </button>
            {helpOpen && (
              <div role="dialog" aria-label="Ayuda" style={{ position: "absolute", right: 0, top: 48, width: 300, background: "#0f1e36", border: "1px solid rgba(0,200,232,.25)", borderRadius: 10, padding: "14px 16px", fontSize: ".8rem", lineHeight: 1.65, color: "rgba(238,244,248,.75)", boxShadow: "0 12px 32px rgba(0,0,0,.45)", zIndex: 20 }}>
                <div style={{ fontWeight: 500, color: "#eef4f8", marginBottom: 6 }}>Cómo usar norma-ar</div>
                Escribí tu consulta, dictala con el micrófono o elegí un tema del menú. Con el parlante activado, las respuestas se leen en voz alta. Las respuestas indican los documentos fuente (normas en dorado, guías en celeste).
                <br /><br />
                Es una herramienta de apoyo: verificá siempre la norma oficial antes de tomar decisiones.
                <br /><br />
                <a href={FEEDBACK_URL} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 7, color: "#00c8e8", textDecoration: "none", fontWeight: 500 }}>
                  <Icon name="comment" size={16} /> Dejar un comentario
                </a>
              </div>
            )}
          </div>
          <button className="hdr-btn" onClick={onLogout} aria-label="Cerrar sesión" title="Cerrar sesión" style={{ display: "flex", alignItems: "center", gap: 7, background: "transparent", border: "1px solid rgba(238,244,248,.2)", borderRadius: 22, color: "rgba(238,244,248,.75)", padding: "8px 14px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: ".85rem", fontWeight: 500 }}>
            <Icon name="login" size={16} />
            <span className="help-label">Salir</span>
          </button>
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
            className="msgs" style={{ flex: 1, overflowY: "auto", padding: "2rem 2.25rem 1rem", display: "flex", flexDirection: "column", gap: "1.4rem", scrollBehavior: "smooth" }}
          >
            {/* WELCOME */}
            {showWelcome && (
              <div style={{ width: "100%", maxWidth: 1120, margin: "0 auto" }}>
                <div className="hero" style={{ textAlign: "center", margin: "1.6rem 0 1.8rem" }}>
                  <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "clamp(1.7rem, 3.4vw, 2.4rem)", fontWeight: 700, letterSpacing: "-.02em", lineHeight: 1.15, margin: 0, color: "#eef4f8" }}>
                    ¿Qué querés <span style={{ color: "#00c8e8" }}>consultar</span> hoy?
                  </h1>
                  <p style={{ fontSize: "1.02rem", color: "rgba(238,244,248,.72)", margin: ".8rem auto 0", maxWidth: 560, fontWeight: 400, lineHeight: 1.5 }}>
                    Elegí un tema o escribí tu pregunta abajo. Cada respuesta indica la norma de donde sale.
                  </p>
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
              <div key={i} className="msg-row" style={{ display: "flex", gap: 10, flexDirection: msg.role === "user" ? "row-reverse" : "row", animation: "fadeUp .28s ease" }}>
                <div className="msg-avatar" style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: msg.role === "user" ? ".67rem" : ".6rem", fontWeight: 500, marginTop: 2, background: msg.role === "user" ? "#1c3056" : "#0090ab", border: msg.role === "user" ? "1px solid rgba(0,200,232,.18)" : "none", color: "#eef4f8", letterSpacing: msg.role === "assistant" ? ".03em" : 0 }}>
                  {msg.role === "user" ? "Vos" : <AtomIcon size={28} />}
                </div>
                <div className="msg-col" style={{ flex: 1, minWidth: 0, maxWidth: 860, display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                  {msg.isError ? (
                    <div style={{
                      maxWidth: "100%", background: "rgba(255,90,90,.07)", border: "1px solid rgba(255,90,90,.28)",
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
                  <div className="bubble" style={{ maxWidth: msg.role === "user" ? "88%" : "100%", overflowWrap: "anywhere", padding: "11px 15px", borderRadius: 10, fontSize: ".87rem", lineHeight: 1.72, background: msg.role === "user" ? "#1c3056" : "#152540", border: msg.role === "user" ? "1px solid rgba(0,200,232,.18)" : "1px solid rgba(238,244,248,.07)", borderTopRightRadius: msg.role === "user" ? 3 : 10, borderTopLeftRadius: msg.role === "assistant" ? 3 : 10, color: msg.role === "user" ? "#eef4f8" : "rgba(238,244,248,.65)", whiteSpace: msg.role === "user" ? "pre-wrap" : undefined }}>
                    {msg.role === "user"
                      ? msg.text
                      : (msg.streaming && !msg.html)
                        ? <span style={{ color: "rgba(238,244,248,.6)", fontSize: ".85rem" }}>
                            Buscando en las normas y preparando la respuesta
                            <span className="wait-dots" aria-hidden="true"><i>.</i><i>.</i><i>.</i></span>
                          </span>
                        : <span dangerouslySetInnerHTML={{ __html: msg.html }} />}
                    {msg.streaming && msg.html && (
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
                  <div style={{ display: "flex", alignItems: "center", justifyContent: msg.role === "user" ? "flex-end" : "space-between", gap: 8, marginTop: 3, width: "100%" }}>
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
          <div className="dock" style={{ padding: ".6rem 2.25rem 1rem", background: "transparent" }}>
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
                  {canSpeak && (
                    <button
                      onClick={speaking ? stopSpeaking : toggleReadAloud}
                      title={speaking ? "Detener lectura" : readAloud ? "Lectura en voz alta activada (tocá para desactivar)" : "Activar lectura en voz alta de las respuestas"}
                      aria-label={speaking ? "Detener lectura" : readAloud ? "Desactivar lectura en voz alta" : "Activar lectura en voz alta"}
                      aria-pressed={readAloud}
                      style={{ width: 42, height: 42, background: readAloud ? "rgba(0,200,232,.16)" : "transparent", border: readAloud ? "1px solid rgba(0,200,232,.7)" : "1px solid rgba(0,200,232,.3)", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, alignSelf: "flex-end", color: "#4cc9e8", transition: "all .18s" }}>
                      <Icon name={readAloud ? "speaker" : "speakerOff"} size={20} />
                    </button>
                  )}
                  {SpeechRec && (
                    <button
                      onClick={toggleListening}
                      className={listening ? "mic-on" : ""}
                      title={listening ? "Detener dictado" : "Dictar consulta por voz"}
                      aria-label={listening ? "Detener dictado" : "Dictar consulta por voz"}
                      aria-pressed={listening}
                      style={{ width: 42, height: 42, background: listening ? "rgba(255,90,90,.18)" : "transparent", border: listening ? "1px solid rgba(255,120,120,.6)" : "1px solid rgba(0,200,232,.3)", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, alignSelf: "flex-end", color: listening ? "#ff9090" : "#4cc9e8", transition: "all .18s" }}>
                      <Icon name="mic" size={20} />
                    </button>
                  )}
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
                  <span style={{ color: voiceError ? "#ff9090" : listening ? "#ff9090" : speaking ? "#4cc9e8" : undefined }}>{voiceError ? voiceError : listening ? "● Escuchando… hablá y tocá el micrófono para terminar" : speaking ? "🔊 Leyendo la respuesta… tocá el parlante para detener" : <>Enter para enviar &nbsp;·&nbsp; Shift + Enter para nueva línea{busy ? " · Generando…" : ""}</>}</span>
                  <span style={{ color: input.length > MAX_MESSAGE_LENGTH * 0.9 ? "#ff9090" : "rgba(238,244,248,.45)", flexShrink: 0, marginLeft: 10 }}>
                    {input.length}/{MAX_MESSAGE_LENGTH}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 12, fontSize: ".72rem", color: "rgba(238,244,248,.5)", textAlign: "center" }}>
                <Icon name="shield" size={16} color="#4cc9e8" />
                <span>Las respuestas identifican los documentos fuente; las citas no reemplazan la lectura del original.{" "}
                  <a href={FEEDBACK_URL} target="_blank" rel="noopener noreferrer" style={{ color: "#4cc9e8", textDecoration: "underline", whiteSpace: "nowrap" }}>Dejar un comentario</a>
                </span>
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
          <div style={{ flex: 1, overflowY: "auto", padding: "2.2rem 2.25rem" }} className="about">
            <div style={{ maxWidth: 860, margin: "0 auto", lineHeight: 1.75, color: "rgba(238,244,248,.78)" }}>
              <h2 style={{ fontSize: "1.8rem", fontWeight: 700, margin: "0 0 .5rem", color: "#eef4f8", letterSpacing: "-.01em" }}>
                Acerca de <span style={{ color: "#00c8e8" }}>norma-ar</span>
              </h2>
              <p style={{ fontSize: "1.02rem", margin: "0 0 1.6rem" }}>
                Asistente de consulta sobre la normativa nuclear argentina. Responde en lenguaje natural a partir de documentos oficiales y muestra de dónde sale cada dato, para que pueda verificarse.
              </p>

              <div style={sectionLabel}>El problema</div>
              <p style={{ margin: "0 0 1.6rem" }}>
                La normativa nuclear está repartida en leyes, decretos, normas y guías de la ARN y tratados internacionales. Encontrar qué exige cada documento, y en qué revisión, lleva tiempo. norma-ar acerca esa información con respuestas que indican su fuente.
              </p>

              <div style={sectionLabel}>Cómo funciona</div>
              <div className="about-steps" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12, marginBottom: "1.6rem" }}>
                {[
                  ["1. Preguntás", "Escribís o dictás tu consulta en lenguaje natural."],
                  ["2. Busca en las fuentes", "El sistema recupera los fragmentos más relacionados de los documentos oficiales indexados."],
                  ["3. Responde y cita", "Un modelo de lenguaje redacta la respuesta usando solo esos fragmentos e indica los documentos usados."],
                ].map(([t, d]) => (
                  <div key={t} style={{ background: "#0f1e36", border: "1px solid rgba(0,200,232,.2)", borderRadius: 12, padding: "14px 16px" }}>
                    <div style={{ color: "#eef4f8", fontWeight: 500, marginBottom: 4 }}>{t}</div>
                    <div style={{ fontSize: ".86rem", lineHeight: 1.55 }}>{d}</div>
                  </div>
                ))}
              </div>

              <div style={sectionLabel}>La base documental</div>
              <div className="about-stats" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: ".6rem" }}>
                {[["64", "normas de la ARN"], ["10", "guías regulatorias"], ["83", "documentos en total"], ["2.067", "fragmentos indexados"]].map(([n, l]) => (
                  <div key={l} style={{ background: "#0f1e36", border: "1px solid rgba(238,244,248,.1)", borderRadius: 12, padding: "14px 16px" }}>
                    <div style={{ fontSize: "1.7rem", fontWeight: 700, color: "#00c8e8", lineHeight: 1.1 }}>{n}</div>
                    <div style={{ fontSize: ".82rem", marginTop: 4 }}>{l}</div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: ".84rem", margin: "0 0 1.6rem", color: "rgba(238,244,248,.6)" }}>
                Además incluye leyes y decretos, tratados y acuerdos internacionales e información institucional de la CNEA e INVAP. Las 64 normas coinciden con las vigentes en la página oficial de la ARN (verificado el 22/10/2026). El detalle está en "Fuentes normativas".
              </p>

              <div style={sectionLabel}>Cómo leer las respuestas</div>
              <ul style={{ margin: "0 0 1.6rem", paddingLeft: "1.2rem" }}>
                <li>Las etiquetas <span style={{ color: "#e8c84a" }}>doradas</span> indican normas, leyes y tratados; las <span style={{ color: "#00c8e8" }}>celestes</span>, guías regulatorias.</li>
                <li>Las guías son orientativas: recomiendan, no obligan. La norma prevalece sobre la guía.</li>
                <li>Si un dato no está en la documentación, el asistente debe decirlo y no inventarlo.</li>
                <li>Las respuestas no indican número de página: para verificar, buscá la cita en el documento original.</li>
              </ul>

              <div style={sectionLabel}>Límites</div>
              <p style={{ margin: "0 0 1.6rem", color: "#e8c84a" }}>
                Es una herramienta de apoyo. Puede equivocarse o completar una respuesta con conocimiento general, y la normativa cambia. No reemplaza la lectura de la norma oficial ni el criterio profesional, ni constituye asesoramiento regulatorio. Verificá siempre el documento oficial antes de tomar decisiones.
              </p>

              <div style={sectionLabel}>Tecnología</div>
              <p style={{ margin: "0 0 1.6rem" }}>
                Arquitectura RAG (búsqueda semántica más generación de texto): React y Vite en el frontend, Vercel para el despliegue, Pinecone como base vectorial y el modelo GPT-OSS 120B ejecutado en Groq. El dictado y la lectura en voz alta usan las funciones del propio navegador.
              </p>

              <div style={sectionLabel}>Autor y contexto</div>
              <p style={{ margin: 0 }}>
                Desarrollado por Juan Manuel Orellana como Trabajo Final Integrador de la Especialización en Seguridad Nuclear. Versión de la base documental: octubre de 2026.
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        @media (max-width: 700px) { .hdr-right { gap: 8px !important } .hdr-btn { padding: 8px 10px !important } }
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
        @keyframes micpulse { 0%,100%{box-shadow:0 0 0 0 rgba(255,120,120,.45)} 50%{box-shadow:0 0 0 7px rgba(255,120,120,0)} }
        @keyframes dotpulse { 0%,80%,100%{opacity:.2} 40%{opacity:1} }
        .wait-dots i { font-style: normal; animation: dotpulse 1.4s infinite; }
        .wait-dots i:nth-child(2) { animation-delay: .2s; }
        .wait-dots i:nth-child(3) { animation-delay: .4s; }
        .bubble h3:first-child { margin-top: 0 !important; }
        .bubble table { display: block; max-width: 100%; overflow-x: auto; }
        .bubble img, .bubble pre { max-width: 100%; }
        .mic-on { animation: micpulse 1.3s infinite; }
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
          .msgs { padding: 1rem .7rem .6rem !important; gap: 1rem !important; }
          .msg-avatar { display: none !important; }
          .msg-col { max-width: 100% !important; }
          .bubble { padding: 10px 12px !important; line-height: 1.6 !important; }
          .dock { padding: .4rem .6rem .7rem !important; }
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

// ── Pantalla de ingreso ─────────────────────────────────────────────────
// ETAPA DE PRUEBA: las credenciales se validan en el navegador, así que NO son una medida de
// seguridad real (cualquiera que lea el código de la página las ve, y el endpoint /api/chat
// sigue siendo público). Sirven como pantalla de acceso del prototipo. Para un control real,
// habría que validar en el servidor (por ejemplo, con un token que /api/chat exija).
const ACCESS_USER = "1234";
const ACCESS_PASS = "1234";
const SESSION_KEY = "norma-ar-sesion";

function readSession() {
  try { return sessionStorage.getItem(SESSION_KEY) === "ok"; } catch { return false; }
}
function writeSession(on) {
  try { on ? sessionStorage.setItem(SESSION_KEY, "ok") : sessionStorage.removeItem(SESSION_KEY); } catch { /* sin almacenamiento */ }
}

// ── Elementos visuales de la pantalla de ingreso ────────────────────────
function LoginAtom({ size = 124, animated }) {
  const orbit = "M-46 0 A46 17 0 1 1 46 0 A46 17 0 1 1 -46 0 Z";
  const orbits = [
    { a: -35, c: "#4dd4f0", op: 0.75, dur: 7, col: "#5cc8ff" },
    { a: 35, c: "#4dd4f0", op: 0.75, dur: 9, col: "#5cc8ff" },
    { a: 0, c: "#e8c84a", op: 0.55, dur: 11, col: "#e8c84a" },
  ];
  return (
    <svg width={size} height={size} viewBox="-60 -60 120 120" aria-hidden="true" style={{ overflow: "visible", filter: "drop-shadow(0 0 14px rgba(77,212,240,.35))" }}>
      <defs>
        <radialGradient id="lgNuc" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#bdf0ff" />
          <stop offset="55%" stopColor="#4dd4f0" />
          <stop offset="100%" stopColor="#2a8fd0" />
        </radialGradient>
      </defs>
      {orbits.map((o, i) => (
        <g key={i} transform={`rotate(${o.a})`}>
          <ellipse rx="46" ry="17" fill="none" stroke={o.c} strokeWidth="1.5" opacity={o.op} />
          <circle r={i === 2 ? 4.2 : 3.6} fill={o.col}>
            {animated && <animateMotion dur={`${o.dur}s`} repeatCount="indefinite" path={orbit} begin={`-${i * 2}s`} />}
          </circle>
        </g>
      ))}
      <circle r="13" fill="#4dd4f0" opacity="0.18">
        {animated && <animate attributeName="r" values="11;19;11" dur="3.2s" repeatCount="indefinite" />}
        {animated && <animate attributeName="opacity" values="0.28;0.04;0.28" dur="3.2s" repeatCount="indefinite" />}
      </circle>
      <circle r="9.5" fill="url(#lgNuc)" />
    </svg>
  );
}

const AR_MAP = {"p":["M227.5 177.7L228.3 188.0L227.4 188.7L224.2 188.9L224.5 192.2L223.1 194.1L222.5 198.8L224.1 204.0L221.2 205.1L215.6 201.4L212.8 200.8L212.2 199.5L210.4 199.8L208.6 198.4L207.4 198.8L205.0 197.6L193.9 188.2L190.7 179.7L192.3 171.3L191.5 168.9L192.5 165.9L192.7 165.2L195.8 164.7L199.4 160.8L205.8 150.6L207.2 146.3L206.6 142.4L210.5 141.9L212.6 142.5L216.0 140.2L217.8 140.5L221.4 139.3L226.6 140.6L229.4 143.8L230.4 146.6L233.1 149.2L233.3 150.3L233.1 151.9L231.6 152.5L232.4 154.4L231.7 157.4L229.3 161.3L230.6 162.7L230.5 164.2L229.5 167.0L227.5 168.4L228.3 170.5L227.7 172.8L229.0 174.9L227.5 177.7Z","M97.5 37.8L98.0 36.2L106.2 43.5L108.7 44.1L110.4 42.6L110.9 41.0L111.1 36.1L110.1 32.9L110.5 30.9L112.2 30.9L116.0 33.1L115.9 39.5L119.4 41.6L119.5 43.1L121.9 46.8L126.3 48.2L127.9 47.5L131.3 49.8L132.7 47.5L135.8 50.0L137.3 47.9L140.3 46.7L142.0 44.1L141.9 33.0L139.3 32.7L138.3 34.4L135.1 31.9L132.0 32.5L130.9 29.6L129.6 28.8L130.0 25.3L127.0 24.0L126.1 20.6L126.4 19.2L125.3 18.4L127.5 10.8L135.1 12.0L136.6 13.2L136.3 14.6L138.4 17.7L138.0 19.2L139.4 20.9L139.9 22.8L140.9 17.6L145.5 9.3L148.2 10.1L149.7 9.2L161.6 9.3L161.9 11.3L164.2 13.1L164.2 14.0L168.3 16.6L168.4 46.7L153.1 66.5L145.6 66.4L141.8 65.3L137.6 75.5L133.5 75.3L131.0 76.3L126.6 74.7L125.7 73.2L123.9 73.9L120.7 73.1L119.9 76.7L115.1 76.0L112.9 74.6L110.1 78.1L108.3 76.1L104.2 69.0L104.3 67.7L105.2 66.8L107.7 66.7L108.8 65.7L109.2 63.7L107.9 60.4L90.1 60.6L80.2 58.6L82.0 58.0L80.5 54.6L79.0 53.1L80.2 49.8L80.8 50.3L81.6 48.2L82.6 48.2L83.8 46.4L96.4 40.9L97.5 37.8Z","M98.0 36.2L101.4 24.8L98.8 22.0L101.2 19.2L101.1 17.4L104.7 15.9L105.4 12.8L111.5 10.5L112.7 6.0L114.6 6.7L115.2 8.0L116.9 8.4L119.1 10.9L127.5 10.8L125.3 18.4L126.4 19.2L126.1 20.6L127.0 24.0L130.0 25.3L129.6 28.7L130.9 29.6L131.9 32.4L135.1 31.9L138.3 34.4L139.3 32.7L141.8 32.8L142.2 43.5L140.3 46.7L138.7 47.1L135.7 50.0L132.7 47.5L131.3 49.8L127.9 47.5L126.3 48.2L122.1 46.9L119.5 43.1L119.4 41.6L115.9 39.5L116.0 33.1L111.0 30.5L110.1 32.9L111.1 36.1L110.9 41.0L110.4 42.6L108.7 44.1L106.2 43.5L100.5 37.8L98.0 36.2Z","M168.3 16.6L169.7 17.6L169.5 18.6L170.4 19.0L170.4 20.2L173.8 25.3L176.4 27.3L177.0 28.6L180.1 30.1L180.3 31.1L185.9 34.2L185.7 35.2L187.8 37.6L192.7 38.7L196.9 40.6L201.3 40.5L209.4 45.9L211.2 48.0L218.8 52.6L223.6 53.8L225.6 56.0L227.2 55.2L233.7 58.8L236.7 63.1L236.4 65.0L233.6 67.2L234.1 67.5L232.9 68.4L233.2 69.3L232.2 70.0L232.5 70.5L231.7 71.5L232.2 72.1L229.1 74.0L228.6 75.2L228.2 74.8L228.9 75.8L227.9 76.3L227.3 78.6L227.8 82.3L227.0 82.3L226.8 84.1L225.3 85.2L225.9 85.9L225.3 86.1L223.8 85.3L222.2 83.0L213.9 76.7L211.1 77.4L210.1 74.9L206.6 74.1L206.4 72.2L201.2 67.1L199.2 66.6L198.3 63.9L194.6 59.4L192.5 58.7L186.4 54.4L184.5 50.8L181.1 50.2L176.3 45.7L168.3 42.3L168.3 16.6Z","M279.0 66.4L279.0 65.2L279.6 65.1L281.2 67.0L281.9 65.3L284.9 65.3L284.5 64.5L286.0 63.9L286.2 65.5L286.4 64.8L287.6 65.2L288.1 66.4L289.1 66.2L290.0 71.4L292.4 76.1L291.5 77.9L290.8 83.4L291.7 86.4L290.0 90.5L289.3 89.9L288.9 90.6L288.1 90.4L286.3 92.5L285.1 91.9L283.5 94.8L282.6 94.3L282.3 95.3L281.2 94.5L280.9 95.5L279.2 95.2L278.5 96.4L278.0 96.1L277.6 96.8L275.9 96.6L275.5 97.8L274.7 98.0L274.5 99.8L273.5 100.6L272.1 100.5L272.9 101.7L271.9 101.5L271.6 102.1L270.8 101.7L268.8 102.7L267.0 105.3L264.4 106.4L262.7 105.1L261.4 102.7L261.0 100.1L258.7 94.7L259.1 93.6L260.2 93.2L262.5 95.1L264.8 93.2L264.7 90.6L265.7 89.5L266.7 89.5L267.4 87.6L269.3 86.9L271.3 87.2L271.5 85.7L273.6 84.5L274.4 82.7L276.3 82.2L276.3 80.4L277.6 78.8L278.5 75.1L278.1 71.6L278.9 71.1L279.2 68.9L278.4 66.6L279.0 66.4Z","M225.3 86.1L223.6 86.9L223.1 88.9L222.6 88.6L222.3 89.8L221.0 90.5L221.7 93.0L217.7 95.6L218.7 99.5L218.0 104.1L177.3 104.1L177.3 74.3L176.7 66.6L153.1 66.5L168.4 46.7L168.3 42.3L176.3 45.7L181.1 50.2L184.5 50.8L186.4 54.4L192.5 58.7L194.6 59.4L196.8 62.7L198.3 63.9L199.2 66.6L201.2 67.1L206.4 72.2L206.6 74.1L210.1 74.9L211.1 77.4L213.9 76.7L216.7 78.4L225.3 86.1Z","M227.0 92.1L231.2 92.4L237.3 94.6L239.9 94.5L242.1 95.8L246.0 94.7L248.0 96.1L251.2 95.3L253.3 97.4L254.7 95.7L255.0 94.2L256.8 93.0L259.5 93.3L258.7 95.2L260.8 99.5L261.3 102.6L262.7 105.1L264.4 106.4L262.2 107.8L263.6 109.0L263.6 110.1L263.2 110.7L261.2 109.7L260.3 110.2L260.4 111.6L258.8 112.1L258.4 114.0L254.9 116.8L254.7 118.4L253.4 119.6L252.9 121.5L250.2 123.0L249.3 125.5L247.3 128.0L243.1 132.9L240.5 133.7L240.0 136.5L237.4 139.2L235.5 140.0L235.3 142.2L231.9 145.9L233.1 149.2L230.6 146.8L229.4 143.8L227.1 141.0L222.0 139.3L217.8 140.5L216.0 140.2L212.6 142.5L210.5 141.9L206.6 142.4L207.5 137.6L206.4 134.3L207.6 130.4L207.7 126.5L208.7 123.8L213.2 120.7L214.8 114.3L214.8 106.9L217.6 105.2L218.3 102.7L218.7 99.5L217.7 95.6L223.1 92.4L227.0 92.1Z","M82.5 88.7L82.9 86.3L78.8 79.2L79.1 76.8L81.4 74.2L78.6 63.6L80.2 58.6L90.1 60.6L107.9 60.4L109.2 63.7L108.8 65.7L107.7 66.7L105.4 66.8L104.5 67.5L104.4 69.7L110.0 78.1L112.7 74.7L113.7 74.7L115.1 76.0L113.7 80.3L117.9 83.3L117.8 86.3L113.1 93.1L116.2 94.3L116.9 98.5L118.0 100.5L120.2 101.1L122.0 104.9L125.2 101.9L127.8 102.6L129.2 111.0L127.6 114.0L128.9 115.8L129.7 125.1L131.9 129.5L130.8 130.4L131.0 134.8L128.2 137.8L124.5 139.1L119.8 128.6L118.9 124.4L114.2 119.9L110.7 118.0L111.1 116.0L109.3 114.3L108.8 112.2L107.5 110.6L101.9 108.4L98.9 109.9L91.5 109.6L89.8 110.3L88.5 108.1L88.3 106.1L86.0 106.6L81.0 104.1L81.0 99.9L75.1 100.7L71.1 100.4L72.7 95.3L74.0 94.3L75.6 89.9L77.0 89.7L78.9 90.6L79.9 89.2L82.5 88.7Z","M67.0 107.5L68.6 104.1L70.3 103.3L71.1 100.4L75.1 100.7L81.0 99.9L81.0 104.1L86.0 106.6L88.3 106.1L88.5 108.1L89.8 110.3L91.5 109.6L98.9 109.9L101.9 108.4L107.5 110.6L108.8 112.2L109.3 114.3L111.1 116.0L110.7 118.0L114.2 119.9L118.9 124.4L119.8 128.6L124.5 139.1L119.2 155.0L119.3 168.2L115.1 168.0L112.8 168.9L108.7 168.8L105.5 168.1L103.9 165.9L103.7 164.0L101.0 162.3L100.1 159.3L100.7 154.8L100.0 154.0L100.4 151.6L98.8 148.6L93.5 143.1L92.5 140.9L82.5 131.6L77.3 130.2L72.7 130.4L73.8 125.4L73.0 124.2L73.0 122.3L74.2 120.4L71.5 116.7L70.3 113.7L66.2 111.0L63.6 110.6L66.0 107.3L67.0 107.5Z","M59.3 138.3L59.9 133.6L58.1 125.2L59.9 122.7L61.5 122.0L61.5 119.4L62.5 117.0L62.2 115.0L63.3 113.4L63.6 110.6L68.2 111.9L70.7 114.2L71.5 116.7L74.3 120.6L73.0 122.3L73.0 124.2L73.8 125.4L72.7 130.4L77.3 130.2L82.5 131.6L92.5 140.9L93.5 143.1L98.8 148.6L100.4 151.6L100.0 154.0L100.7 154.8L100.1 159.3L100.9 162.2L102.4 163.7L103.6 164.0L103.9 165.9L105.1 167.1L105.5 168.1L96.3 167.8L96.0 174.6L94.5 173.8L89.7 174.2L86.5 171.3L81.7 172.7L77.4 175.8L74.6 175.9L74.1 171.5L72.4 171.4L70.5 169.4L68.8 171.1L66.6 171.1L64.3 172.2L63.5 174.5L58.9 175.3L54.2 175.0L53.1 170.9L54.6 171.0L55.2 169.2L51.9 167.1L50.2 162.9L50.5 158.5L51.8 155.0L52.8 155.9L53.8 154.1L54.9 154.0L53.8 152.4L55.6 145.3L56.6 144.1L56.2 142.8L59.2 143.0L61.0 139.5L60.4 138.4L59.3 138.3Z","M58.5 192.3L57.1 190.0L57.1 187.8L58.1 187.0L58.7 185.0L56.4 182.7L56.1 180.5L56.7 179.8L55.0 175.5L63.5 174.5L64.3 172.2L66.6 171.1L68.8 171.1L70.5 169.4L72.4 171.4L74.1 171.5L74.6 175.9L77.4 175.8L81.7 172.7L86.5 171.3L89.7 174.2L94.9 173.9L96.0 174.6L98.8 183.1L98.4 185.7L99.4 194.5L102.6 201.5L103.8 202.5L105.2 205.4L105.0 207.5L104.2 208.3L104.3 211.0L105.3 215.0L108.1 220.4L108.7 225.9L107.1 239.2L83.3 239.6L83.7 267.1L81.2 266.7L80.0 265.1L77.6 264.7L76.5 263.7L73.2 263.6L72.1 261.3L70.8 260.3L68.7 259.7L65.4 260.2L62.9 259.0L61.3 257.0L61.7 254.6L60.0 253.4L57.7 250.1L56.3 249.6L55.0 245.8L53.4 245.5L53.5 242.8L52.5 241.5L53.2 240.1L52.7 236.9L53.6 236.0L51.9 228.3L52.5 227.9L50.4 226.2L50.9 225.3L53.1 224.6L54.7 218.1L54.1 217.2L57.7 211.5L57.9 209.3L59.9 209.2L61.1 208.3L59.9 200.4L60.7 199.6L60.4 196.7L61.7 193.6L60.5 191.4L59.5 191.3L58.5 192.3Z","M51.5 242.1L52.5 241.5L53.4 242.3L53.6 245.7L55.0 245.8L56.3 249.6L57.7 250.1L60.0 253.4L61.7 254.6L61.3 257.0L62.9 259.0L65.4 260.2L68.7 259.7L70.8 260.3L72.1 261.3L73.2 263.6L76.5 263.7L77.6 264.7L80.0 265.1L81.2 266.7L83.7 267.1L83.7 287.1L87.1 292.9L83.6 293.3L82.7 292.7L78.6 295.7L73.5 302.4L69.5 304.2L66.0 308.3L63.2 308.6L59.5 310.9L57.5 319.8L56.1 320.6L55.6 322.0L52.3 322.5L51.0 321.5L48.9 323.0L47.1 322.9L44.8 323.9L42.5 326.7L43.9 328.6L43.8 329.7L41.7 332.0L39.2 332.4L36.4 331.3L32.0 330.9L32.2 329.5L30.7 325.4L32.2 323.5L33.0 319.7L33.9 319.8L34.7 318.3L34.5 317.3L33.7 317.4L32.7 316.1L32.7 313.6L34.6 313.7L35.5 310.2L34.2 307.2L34.3 304.1L35.8 304.8L37.2 304.5L36.6 303.2L38.5 299.2L38.4 292.2L41.0 289.9L45.2 288.7L46.7 285.7L44.7 282.8L44.3 276.4L41.7 269.7L42.7 265.4L41.4 262.3L43.1 258.9L41.4 256.5L42.4 256.2L41.6 254.2L42.3 251.5L43.5 251.5L43.7 247.8L45.3 247.6L45.9 246.3L47.1 246.9L48.4 246.6L48.5 243.9L50.4 241.8L51.5 242.1Z","M31.1 353.2L33.6 351.8L33.4 349.8L128.4 349.8L129.4 350.0L130.6 352.3L132.3 353.6L137.6 354.7L135.9 358.0L138.2 358.5L143.0 358.1L143.8 357.0L143.5 355.0L139.7 354.4L147.8 351.3L150.4 356.4L150.5 361.3L149.2 365.4L143.0 367.0L140.9 364.8L141.6 362.1L138.3 359.6L134.2 360.5L133.0 361.8L131.0 362.5L130.0 364.0L130.3 365.0L135.3 367.8L138.3 368.8L140.0 368.3L140.2 368.9L138.1 370.6L133.6 372.1L131.0 373.9L129.8 375.1L129.7 377.0L125.5 382.3L126.3 388.2L126.9 388.5L126.8 389.5L127.5 389.7L126.8 390.6L127.1 391.7L125.8 392.9L127.1 396.3L125.5 398.2L126.2 399.3L124.9 399.3L125.1 400.6L123.6 400.5L120.4 403.2L119.8 405.9L121.4 406.8L122.8 407.6L120.3 410.3L119.5 409.5L118.5 409.8L118.2 409.1L116.8 410.0L115.7 409.1L113.0 408.9L111.9 410.2L110.9 409.9L108.8 410.8L108.4 411.7L109.4 412.0L109.1 412.4L107.5 411.8L108.4 413.4L102.6 414.2L96.8 421.5L96.4 425.0L95.1 425.8L93.3 429.4L35.1 429.4L35.4 428.1L33.5 426.3L32.9 424.1L33.4 420.7L34.2 419.9L37.4 419.1L37.1 417.3L38.8 416.5L39.8 414.4L35.9 408.6L29.0 407.0L28.8 404.6L29.4 404.1L32.1 404.8L33.5 404.1L35.3 404.6L37.3 403.8L40.1 404.9L41.0 403.9L41.0 401.7L42.6 399.5L41.4 397.5L32.6 397.0L32.1 396.5L32.9 395.2L32.1 391.1L33.5 390.2L34.9 387.5L33.5 385.5L33.6 384.4L32.6 384.2L34.2 382.7L34.1 381.1L31.9 379.8L31.9 378.3L30.7 377.9L31.5 375.5L33.6 375.0L33.7 373.0L32.0 371.8L29.3 371.3L27.9 369.2L28.4 366.6L28.0 360.6L29.5 359.1L28.1 355.4L29.9 352.2L31.1 353.2Z","M33.4 349.8L33.0 347.3L31.1 343.2L32.2 341.5L31.4 337.7L32.0 330.9L36.4 331.3L40.1 332.5L42.2 331.7L44.0 329.0L42.5 326.5L44.8 323.9L47.1 322.9L48.9 323.0L51.0 321.5L52.3 322.5L55.3 322.2L56.1 320.6L57.3 320.2L59.5 310.9L63.2 308.6L66.0 308.3L69.5 304.2L73.5 302.4L78.6 295.7L82.7 292.7L83.6 293.3L87.1 292.9L83.7 287.1L83.7 267.1L89.4 267.8L90.9 269.1L91.2 271.8L89.5 273.4L89.1 275.2L89.5 276.1L91.1 276.5L93.7 279.8L99.1 279.1L100.6 282.5L106.6 285.2L107.9 287.9L116.5 288.6L120.3 290.0L122.2 289.2L125.0 290.4L130.6 289.7L137.8 290.7L144.4 293.4L151.4 299.0L153.3 299.4L153.3 325.2L157.4 326.1L160.8 329.5L161.7 331.5L157.4 333.7L147.7 333.7L143.6 331.5L143.6 330.7L142.0 330.9L135.3 327.8L131.5 327.4L132.1 326.8L133.7 327.0L133.1 326.2L133.5 325.7L130.5 325.5L131.3 325.6L131.5 326.4L130.1 326.3L128.5 327.6L127.7 330.1L128.7 337.0L130.3 340.7L129.4 350.0L33.4 349.8Z","M31.3 455.1L32.0 454.3L31.9 453.2L30.0 451.5L31.3 450.2L30.5 449.1L30.8 446.3L32.4 445.8L34.6 443.1L33.4 434.5L31.3 432.4L33.3 431.8L35.1 429.4L93.3 429.4L92.7 432.8L93.9 437.7L95.5 441.2L99.7 444.1L104.7 450.4L106.9 451.3L113.0 452.1L116.2 451.6L119.6 454.5L119.7 461.0L118.1 465.9L115.4 465.8L112.0 468.4L110.3 468.5L111.6 468.7L115.6 466.5L117.3 466.5L118.0 468.8L119.3 469.5L118.8 470.0L119.3 470.3L118.2 470.6L117.3 469.9L116.7 470.6L116.4 472.4L117.4 473.4L114.4 474.0L111.4 477.1L111.0 479.0L109.5 478.9L108.7 480.3L106.6 480.7L103.6 483.2L103.5 484.1L100.0 485.9L98.8 489.0L95.8 490.9L93.6 493.3L92.5 495.8L92.9 496.9L91.1 499.0L91.4 499.9L89.7 501.3L91.2 501.5L92.1 498.8L92.9 498.8L91.1 510.2L89.7 514.0L86.2 517.0L82.4 517.6L77.9 509.6L76.7 509.0L77.8 509.9L79.0 513.4L77.6 514.3L74.8 514.2L72.8 515.4L78.9 514.4L79.4 515.0L82.1 518.8L74.8 522.4L71.9 527.6L70.8 531.7L71.0 535.3L67.1 539.4L70.6 537.0L73.5 550.3L71.3 551.4L67.6 550.3L64.2 551.8L68.6 551.1L70.7 552.0L70.1 553.2L72.6 551.6L73.4 551.7L77.5 560.6L82.1 567.6L81.3 569.5L80.8 567.5L75.6 566.2L69.9 563.7L66.0 563.6L59.4 560.7L30.6 559.8L30.3 556.9L28.0 554.5L25.8 553.4L25.3 551.2L23.6 550.2L25.0 548.4L25.5 544.6L26.4 543.1L24.3 540.4L26.3 536.6L26.3 533.8L25.1 531.7L25.7 529.6L22.8 528.5L20.6 530.0L19.2 528.8L15.0 532.0L13.2 531.8L13.0 529.4L12.0 527.5L11.7 522.5L10.8 520.5L8.2 518.2L8.9 515.2L7.6 513.5L9.1 509.7L12.9 508.0L14.9 505.2L14.1 501.6L14.4 498.8L13.4 498.6L13.1 497.7L14.6 494.3L16.2 492.2L18.9 491.5L21.2 489.1L21.8 481.1L25.8 478.5L25.2 472.9L22.3 469.6L25.1 462.9L25.5 460.7L24.9 459.7L27.6 458.8L29.5 456.3L29.6 454.4L31.3 455.1Z","M78.1 627.3L78.3 575.5L82.8 581.9L84.1 586.4L83.3 584.4L82.3 584.4L79.8 586.9L79.4 589.7L80.8 591.1L84.6 591.5L85.7 592.2L87.5 598.4L91.5 602.6L91.5 603.3L93.6 604.1L93.4 605.8L99.6 611.1L104.9 614.2L109.0 619.5L118.1 623.9L128.0 623.8L126.7 628.2L125.1 630.9L123.6 629.8L123.1 631.0L121.4 631.1L120.6 632.0L119.9 630.4L116.4 630.3L116.0 632.0L111.4 632.6L109.5 634.0L106.9 633.5L104.4 631.3L101.2 630.3L88.3 629.3L83.0 627.5L82.6 628.8L79.8 629.0L78.1 627.3ZM146.1 626.0L147.2 626.0L145.0 628.1L144.8 626.7L141.0 628.6L140.9 627.2L140.1 627.2L138.2 628.8L137.3 628.4L135.8 630.2L134.6 630.0L135.0 629.4L133.7 628.1L134.7 627.0L135.9 627.7L137.0 627.3L136.8 625.6L137.4 626.5L138.7 626.3L139.0 627.3L139.3 625.4L141.8 626.4L142.3 625.6L143.2 625.6L143.6 626.5L146.1 626.0Z","M249.4 252.3L249.2 255.7L243.9 264.5L237.7 272.0L236.7 277.3L225.9 283.9L215.2 287.7L204.7 290.4L185.4 293.4L175.4 293.0L172.2 291.9L170.9 289.9L167.7 289.7L167.8 291.5L168.3 291.5L168.6 292.6L169.2 292.5L168.0 295.2L168.3 296.9L169.5 298.1L168.5 298.1L170.7 298.6L172.8 300.1L172.3 301.0L170.4 299.1L169.1 299.1L170.9 301.2L172.3 301.7L171.5 308.6L170.8 309.3L168.8 308.4L168.0 315.5L166.1 317.7L167.2 320.6L169.4 322.2L169.3 323.8L168.2 323.1L168.4 324.5L170.5 323.7L168.3 328.3L162.7 331.5L161.7 331.5L160.0 328.7L157.1 325.9L153.3 325.2L153.4 214.3L154.0 210.9L177.3 210.8L188.0 198.7L188.7 196.8L192.1 197.0L193.6 198.1L194.9 197.8L196.9 193.1L197.8 192.4L197.5 191.5L206.9 198.6L208.6 198.4L210.4 199.8L212.2 199.5L212.8 200.8L215.6 201.4L221.2 205.1L224.0 204.4L224.7 204.8L225.0 207.6L223.8 209.0L222.2 209.3L223.9 210.6L223.1 211.8L223.6 213.3L222.7 214.1L222.6 216.6L224.0 217.7L225.9 215.7L230.9 218.6L232.2 218.7L237.2 221.9L241.1 226.0L242.8 229.4L239.6 234.4L239.1 236.8L239.4 239.0L241.1 242.3L245.6 245.5L245.5 246.1L248.4 244.8L249.4 252.3Z","M188.2 559.3L186.8 559.1L185.3 556.9L187.4 555.3L187.9 555.6L188.2 556.2L187.1 557.5L189.0 556.3L189.2 555.0L189.6 555.4L188.8 558.2L189.4 558.2L189.2 558.8L188.2 559.3ZM207.0 554.5L203.4 559.5L201.8 560.4L200.8 559.1L200.4 560.5L198.7 560.6L199.0 559.8L197.8 560.4L197.9 562.4L196.4 564.2L195.3 564.4L193.9 563.1L194.7 564.9L193.3 566.0L192.0 565.0L192.6 565.0L191.5 563.6L191.9 563.0L190.1 562.9L191.4 564.6L190.4 564.5L187.1 561.8L187.0 561.0L188.9 561.2L189.5 562.0L189.3 561.2L191.1 560.7L189.7 559.5L194.1 560.5L196.0 558.4L194.4 559.1L193.1 558.8L194.9 558.5L195.7 555.2L196.4 555.2L195.9 555.8L196.6 555.7L196.3 556.7L196.9 557.2L197.7 554.7L198.5 555.5L199.2 553.7L196.9 553.8L196.5 554.6L193.9 555.6L192.8 554.2L192.8 552.9L195.1 553.6L198.6 552.5L200.6 553.4L197.2 550.6L194.6 549.4L194.5 548.5L196.2 548.6L195.3 547.6L192.8 546.9L192.5 545.5L193.1 545.4L199.6 548.7L201.9 548.2L200.6 547.7L201.5 546.1L201.8 547.0L203.6 546.2L203.4 546.6L205.2 547.1L204.2 547.3L204.6 547.7L209.1 546.5L207.7 547.6L208.3 547.9L210.4 547.4L209.7 546.7L210.1 545.2L212.4 546.4L213.0 547.0L212.1 547.0L212.1 547.7L212.7 547.7L210.7 548.8L210.5 551.0L209.7 551.8L209.5 551.0L208.6 551.7L207.0 554.5ZM199.3 546.5L197.6 546.3L198.1 545.5L200.2 545.7L197.4 543.6L198.8 544.4L200.7 544.4L201.1 545.4L200.1 546.8L199.3 546.5ZM233.0 553.4L234.2 553.4L230.5 554.7L226.6 554.8L228.3 555.6L225.3 556.4L227.7 556.1L224.4 558.0L219.5 558.0L216.9 555.8L216.5 557.1L218.7 558.5L218.8 559.4L221.3 559.8L221.7 560.5L220.7 561.3L221.2 563.0L219.1 561.2L218.1 561.4L217.1 562.9L216.1 561.2L214.1 560.1L213.2 560.7L212.2 560.3L211.8 560.9L213.2 561.0L213.5 562.0L214.5 562.0L214.0 562.6L215.0 562.8L213.9 563.9L215.5 563.7L214.7 564.6L215.4 565.5L214.8 565.9L212.9 565.3L210.8 563.2L210.3 564.1L209.5 563.8L209.9 565.6L211.0 566.1L211.2 568.5L207.8 565.9L208.1 565.2L207.2 565.1L205.8 563.3L205.9 562.7L206.9 563.2L206.9 562.5L207.8 562.2L207.0 560.9L208.1 560.9L207.8 560.0L208.6 559.6L207.4 558.7L209.1 559.0L208.6 557.8L209.3 557.5L209.1 556.9L210.7 556.6L211.0 555.3L212.0 555.5L211.7 554.7L213.1 553.7L215.3 553.2L215.5 556.3L216.2 555.9L215.7 553.4L216.2 552.3L213.7 550.6L214.5 549.0L215.6 550.9L215.9 550.3L215.5 549.2L216.2 549.1L214.3 548.0L214.6 546.9L216.0 547.0L218.0 545.7L216.7 543.2L221.4 545.4L222.1 544.5L224.6 544.9L225.6 547.3L224.2 547.8L223.1 546.5L222.5 547.4L223.0 547.4L222.9 548.7L224.3 548.4L224.3 550.1L226.0 550.3L227.1 552.5L227.0 551.1L227.9 551.5L226.9 550.3L227.3 549.5L226.4 549.6L226.0 548.5L225.2 549.1L226.2 547.2L227.1 546.5L231.7 546.1L233.7 548.8L233.5 549.9L229.9 549.0L230.0 549.8L228.3 549.9L229.6 550.9L233.5 551.7L233.4 552.5L231.8 552.9L233.0 553.4ZM205.4 544.0L204.5 543.5L205.1 543.0L207.8 543.4L208.2 544.1L209.2 543.6L209.7 544.9L208.1 545.2L207.0 544.1L205.4 544.0ZM205.1 568.1L206.2 567.6L205.4 568.9L206.9 569.1L206.1 570.0L204.8 569.4L204.3 568.9L205.1 568.1ZM205.4 545.0L207.5 545.9L206.1 546.8L204.2 545.5L205.4 545.0Z","M207.5 104.1L218.0 104.1L217.2 105.6L215.2 106.2L214.8 106.9L214.8 114.3L213.2 120.7L208.7 123.8L207.7 126.5L207.6 130.4L206.4 134.3L207.5 137.6L206.5 141.7L207.3 144.5L206.6 149.0L199.4 160.8L195.8 164.7L192.5 165.4L191.5 168.9L192.3 171.3L190.8 180.0L193.9 188.2L196.3 190.3L197.8 192.4L196.9 193.1L194.9 197.8L193.6 198.1L192.1 197.0L188.7 196.8L188.0 198.7L177.3 210.8L160.9 210.9L174.3 189.1L176.5 187.1L176.9 183.9L175.5 181.6L174.6 181.3L175.1 180.1L174.4 178.0L172.9 176.7L172.0 174.3L170.0 172.5L170.5 169.5L169.7 165.6L171.4 163.6L175.2 148.9L171.2 143.7L177.3 104.1L207.5 104.1Z","M120.8 73.1L123.9 73.9L125.7 73.2L126.6 74.7L131.0 76.3L133.5 75.3L137.6 75.5L137.4 82.8L136.2 82.8L135.6 84.6L134.9 84.8L131.9 92.9L129.3 95.5L130.6 96.2L129.2 97.6L130.2 100.5L129.1 102.4L126.4 102.6L125.2 101.9L122.0 104.9L120.2 101.1L118.0 100.5L116.9 98.5L116.2 94.3L113.1 93.1L117.6 87.0L118.0 84.0L117.7 83.1L113.7 80.5L114.5 77.1L115.1 76.0L120.0 76.7L120.8 73.1Z","M153.1 66.5L176.7 66.6L177.1 67.9L177.3 104.1L171.9 139.4L169.0 133.1L153.3 133.0L152.2 131.1L147.3 131.0L144.1 129.3L143.8 128.1L140.9 127.3L131.9 129.5L129.7 125.1L128.9 115.8L127.6 114.6L129.2 111.0L128.2 102.4L129.2 102.3L130.2 100.5L129.2 97.6L130.6 96.2L129.3 95.5L131.9 92.9L134.9 84.8L135.6 84.6L136.2 82.8L137.4 82.8L137.0 79.1L137.7 74.9L141.5 65.7L145.6 66.4L153.1 66.5Z","M129.0 221.7L129.0 239.2L107.0 239.2L108.5 230.3L108.7 223.8L107.7 219.1L105.3 215.0L104.3 211.0L104.2 208.3L105.0 207.5L105.2 205.4L103.8 202.5L102.6 201.5L99.4 194.5L98.4 185.7L98.8 183.1L96.0 175.3L96.0 168.5L96.7 167.6L110.6 169.1L115.1 168.0L120.6 168.3L125.8 171.2L126.7 172.3L127.5 175.7L131.3 175.2L131.9 180.7L129.7 189.0L128.3 190.7L129.0 221.7Z","M128.8 239.3L129.0 221.7L153.3 221.7L153.3 299.4L151.4 299.0L144.4 293.4L137.8 290.7L130.6 289.7L125.0 290.4L122.2 289.2L120.3 290.0L116.5 288.6L107.9 287.9L106.6 285.2L100.6 282.5L99.1 279.1L93.1 279.6L91.5 276.9L89.5 276.1L89.1 275.2L89.5 273.4L91.2 271.8L90.9 269.1L89.4 267.8L83.7 267.1L83.3 239.6L128.8 239.3Z","M171.9 139.4L171.2 144.1L175.2 148.9L171.4 163.6L169.8 165.5L170.5 169.5L170.0 172.5L172.0 174.3L172.9 176.7L174.4 178.0L175.1 180.1L174.6 181.3L175.5 181.6L176.9 183.9L176.5 187.1L174.3 189.1L160.9 210.9L154.0 210.9L153.5 211.5L153.3 221.7L129.0 221.7L128.3 190.7L129.7 189.0L130.7 184.0L132.0 179.6L131.3 175.2L127.5 175.7L126.7 172.3L125.8 171.2L121.0 168.4L119.3 168.2L119.2 155.0L124.5 139.1L128.2 137.8L131.2 134.5L130.9 129.8L140.9 127.3L143.8 128.1L144.1 129.3L147.3 131.0L152.2 131.1L153.3 133.0L169.0 133.1L171.9 139.4Z"],"m":17,"e":[138.4,173.9],"a":[213.2,203.8]};

function InfoEmblem() {
  const doc = (x, y, rot, label, k) => (
    <g key={k} transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect width="74" height="98" rx="7" fill="rgba(18,44,100,.72)" stroke="#7fd6ff" strokeWidth="1.1" />
      <path d="M58 0 V16 H74" fill="none" stroke="rgba(127,214,255,.7)" strokeWidth="1" />
      <text x="37" y="30" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#cfeeff" style={{ fontFamily: "'DM Sans', sans-serif" }}>{label}</text>
      {[44, 54, 64, 74, 84].map((yy, i) => <line key={yy} x1="10" x2={i % 2 ? 54 : 64} y1={yy} y2={yy} stroke="rgba(160,210,255,.45)" strokeWidth="2" strokeLinecap="round" />)}
    </g>
  );
  return (
    <svg viewBox="0 0 360 236" width="100%" role="img" aria-label="Documentos normativos verificados: normas ARN, guías y leyes" style={{ display: "block", overflow: "visible" }}>
      <defs>
        <radialGradient id="lgEmGlow" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#4dd4f0" stopOpacity=".38" /><stop offset="1" stopColor="#4dd4f0" stopOpacity="0" /></radialGradient>
        <linearGradient id="lgShield" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5aa8ff" /><stop offset="1" stopColor="#1f4aa8" /></linearGradient>
      </defs>
      <g fill="none" stroke="rgba(110,170,255,.38)" strokeWidth="1">
        <ellipse cx="180" cy="200" rx="160" ry="26" />
        <ellipse cx="180" cy="200" rx="118" ry="18" strokeDasharray="3 5" />
        <ellipse cx="180" cy="200" rx="74" ry="11" />
      </g>
      <circle cx="180" cy="128" r="92" fill="url(#lgEmGlow)" />
      <g fill="none" stroke="rgba(127,214,255,.5)" strokeWidth="1" strokeDasharray="3 4">
        <path d="M112 120 H140" /><path d="M248 120 H220" /><path d="M180 112 V92" />
      </g>
      {[[112, 120], [248, 120], [180, 92]].map(([cx, cy]) => <circle key={`${cx}${cy}`} cx={cx} cy={cy} r="3" fill="#4dd4f0" />)}
      {doc(38, 70, -7, "Norma ARN", "a")}
      {doc(248, 70, 7, "Ley 24.804", "b")}
      {doc(143, 6, 0, "Guía AR", "c")}
      <path d="M180 70 L228 87 V124 C228 152 208 170 180 181 C152 170 132 152 132 124 V87 Z" fill="url(#lgShield)" stroke="#bfe9ff" strokeWidth="1.6" />
      <path d="M180 78 L220 92 V124 C220 146 204 162 180 172" fill="none" stroke="rgba(255,255,255,.22)" strokeWidth="1.2" />
      <path d="M158 126 L173 141 L203 108" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Rasgo({ d, titulo, texto }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <span style={{ flex: "0 0 auto", width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(77,212,240,.12)", border: "1px solid rgba(77,212,240,.35)" }}>
        <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="#6fdcf5" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
      </span>
      <div>
        <div style={{ fontWeight: 600, fontSize: ".92rem", color: "#eef6ff", lineHeight: 1.3 }}>{titulo}</div>
        <div style={{ fontSize: ".84rem", lineHeight: 1.45, color: "rgba(226,236,252,.82)", marginTop: 2 }}>{texto}</div>
      </div>
    </div>
  );
}

function PlantIcon({ x, y, label, sub, animated, delay, activo, onToggle, nombre }) {
  return (
    <g transform={`translate(${x} ${y}) scale(1.35)`} role="button" tabIndex={0} aria-label={nombre} aria-pressed={activo} onMouseEnter={() => onToggle(true)} onMouseLeave={() => onToggle(false)} onClick={() => onToggle()} onFocus={() => onToggle(true)} onBlur={() => onToggle(false)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(); } }} style={{ cursor: "pointer", pointerEvents: "auto", outline: "none" }}>
      <circle r="16" fill="transparent" />
      <circle r="9" fill="none" stroke="#4dd4f0" strokeWidth=".9" className={animated ? "lg-pulse" : undefined} style={{ animationDelay: `${delay}s` }} />
      <circle r={activo ? 3.4 : 2.6} fill={activo ? "#fff" : "#4dd4f0"} />
      <g transform="translate(-9 -23)" fill="rgba(20,50,110,.95)" stroke={activo ? "#fff" : "#7fd6ff"} strokeWidth=".9">
        <path d="M0 14 C1.5 9 2 6 1.5 2 L1.5 0 H7 V2 C6.5 6 7 9 8.5 14 Z" />
        <path d="M10 14 L10 8 C10 4 14 2 18 6 V14 Z" />
      </g>
      <text y="19" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#d6f1ff" style={{ fontFamily: "'DM Sans', sans-serif", paintOrder: "stroke", stroke: "rgba(7,15,36,.9)", strokeWidth: 2.4 }}>{label}</text>
      {sub && <text y="31" textAnchor="middle" fontSize="9.5" fontWeight="600" fill="#9fdcff" style={{ fontFamily: "'DM Sans', sans-serif", paintOrder: "stroke", stroke: "rgba(7,15,36,.9)", strokeWidth: 2.2 }}>{sub}</text>}
    </g>
  );
}

const PLANTAS = [
  { k: "e", label: "Embalse", nombre: "Central Nuclear Embalse", detalle: "Río Tercero, Córdoba" },
  { k: "a", label: "Atucha", sub: "I y II", nombre: "Complejo Nuclear Atucha (I y II)", detalle: "Lima, Zárate, Buenos Aires" },
];

function ArgentinaMap({ animated }) {
  const [sel, setSel] = useState(null);
  const toggle = (k) => (v) => setSel((cur) => (v === undefined ? (cur === k ? null : k) : (v ? k : (cur === k ? null : cur))));
  const tip = sel ? PLANTAS.find((p) => p.k === sel) : null;
  const pos = tip ? AR_MAP[tip.k] : null;
  return (
    <div className="lg-map">
      <svg viewBox="0 0 300 640" preserveAspectRatio="xMidYMid meet" role="group" aria-label="Mapa de Argentina con las centrales nucleares de potencia" style={{ height: "100%", width: "auto", maxWidth: "100%", display: "block", overflow: "visible" }}>
        <defs>
          <linearGradient id="lgMapFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3f7fe0" stopOpacity=".34" /><stop offset="1" stopColor="#2a5fc0" stopOpacity=".1" /></linearGradient>
        </defs>
        <g fill="url(#lgMapFill)" stroke="rgba(130,205,255,.62)" strokeWidth=".8" strokeLinejoin="round" aria-hidden="true">
          {AR_MAP.p.map((d, i) => <path key={i} d={d} transform={i === AR_MAP.m ? "translate(-68 0)" : undefined} />)}
        </g>
        {PLANTAS.map((p, i) => (
          <PlantIcon key={p.k} x={AR_MAP[p.k][0]} y={AR_MAP[p.k][1]} label={p.label} sub={p.sub} nombre={`${p.nombre}, ${p.detalle}`} animated={animated} delay={i * 1.2} activo={sel === p.k} onToggle={toggle(p.k)} />
        ))}
        {tip && (
          <g transform={`translate(${Math.min(Math.max(pos[0] - 98, 4), 100)} ${pos[1] - 66})`} style={{ pointerEvents: "none" }}>
            <rect width="196" height="38" rx="8" fill="rgba(8,20,48,.96)" stroke="rgba(127,214,255,.8)" strokeWidth="1" />
            <text x="10" y="16" fontSize="11" fontWeight="700" fill="#fff" style={{ fontFamily: "'DM Sans', sans-serif" }}>{tip.nombre}</text>
            <text x="10" y="31" fontSize="10" fill="#aee4ff" style={{ fontFamily: "'DM Sans', sans-serif" }}>{tip.detalle}</text>
          </g>
        )}
        <g className="lg-cap" fill="rgba(190,225,255,.85)" style={{ fontFamily: "'DM Sans', sans-serif" }} aria-hidden="true">
          <text x="2" y="14" fontSize="10.5" fontWeight="600">Centrales</text>
          <text x="2" y="27" fontSize="10.5" fontWeight="600">nucleares</text>
          <text x="2" y="40" fontSize="10.5" fontWeight="600">de potencia</text>
        </g>
      </svg>
    </div>
  );
}

function GridFloor() {
  const v = Array.from({ length: 15 }, (_, i) => i - 7);
  const hz = [0, 0.08, 0.2, 0.38, 0.62, 1];
  return (
    <svg aria-hidden="true" viewBox="0 0 400 100" preserveAspectRatio="none" style={{ position: "absolute", left: 0, right: 0, bottom: 0, width: "100%", height: 230, pointerEvents: "none", WebkitMaskImage: "linear-gradient(to top, #000 10%, transparent 95%)", maskImage: "linear-gradient(to top, #000 10%, transparent 95%)" }}>
      <g stroke="rgba(90,160,255,.28)" strokeWidth=".35" fill="none">
        {v.map((i) => <line key={i} x1={200 + i * 70} y1="100" x2={200 + i * 8} y2="0" />)}
        {hz.map((t, i) => <line key={i} x1="0" x2="400" y1={t * 100} y2={t * 100} />)}
      </g>
    </svg>
  );
}

const STAR_POS = [[6, 9], [14, 24], [22, 6], [31, 17], [43, 5], [57, 12], [66, 4], [74, 21], [83, 8], [91, 18], [96, 5], [11, 38], [88, 36], [50, 28]];
function Stars() {
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {STAR_POS.map(([x, y], i) => (
        <span key={i} className="lg-star" style={{ position: "absolute", left: `${x}%`, top: `${y}%`, width: i % 3 === 0 ? 3 : 2, height: i % 3 === 0 ? 3 : 2, borderRadius: "50%", background: "#bfe6ff", animationDelay: `${(i * 0.7) % 5}s` }} />
      ))}
    </div>
  );
}

function LoginScene({ animated, compact }) {
  const tree = (x, y, r, k) => (
    <g key={k}>
      <circle cx={x} cy={y} r={r} fill="#0c2252" stroke="rgba(90,160,255,.35)" strokeWidth=".8" />
      <circle cx={x + r * 0.75} cy={y + r * 0.3} r={r * 0.78} fill="#0a1d47" stroke="rgba(90,160,255,.3)" strokeWidth=".8" />
      <rect x={x + r * 0.2} y={y + r * 0.9} width="1.6" height={r * 0.9} fill="#16336a" />
    </g>
  );
  const win = (x, y, w, i) => <rect key={`${x}-${y}`} className={animated ? "lg-win" : undefined} x={x} y={y} width={w} height="5" rx="1" fill="#8fdcff" opacity=".8" style={{ animationDelay: `${i * 0.9}s` }} />;
  const CX = 240, BY = 108, RX = 90, RY = 70;
  const ribs = [0.28, 0.55, 0.82].map((k) => RX * k);
  const lats = [0.2, 0.4, 0.6, 0.8].map((t) => ({ y: BY - RY * t, hw: RX * Math.sqrt(1 - t * t) }));
  const edge = "rgba(110,170,255,.5)";
  return (
    <svg viewBox="0 0 480 176" width="100%" style={{ display: "block", maxWidth: compact ? 300 : 364, margin: "0 auto" }} aria-hidden="true">
      <defs>
        <linearGradient id="lgHillFar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1d3f7e" stopOpacity=".7" /><stop offset="1" stopColor="#0b1a3d" stopOpacity="0" /></linearGradient>
        <linearGradient id="lgHillNear" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#10265a" /><stop offset="1" stopColor="#070f24" /></linearGradient>
        <linearGradient id="lgTower" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#2f5aa0" /><stop offset=".5" stopColor="#193568" /><stop offset="1" stopColor="#0c1f47" /></linearGradient>
        <radialGradient id="lgDome" cx="40%" cy="95%" r="95%"><stop offset="0" stopColor="#6aa6f0" /><stop offset=".55" stopColor="#2f68be" /><stop offset="1" stopColor="#12306a" /></radialGradient>
        <radialGradient id="lgGlow" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#4dd4f0" stopOpacity=".5" /><stop offset="1" stopColor="#4dd4f0" stopOpacity="0" /></radialGradient>
        <filter id="lgBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" /></filter>
        <clipPath id="lgDomeClip"><path d={`M${CX - RX} ${BY} A${RX} ${RY} 0 0 1 ${CX + RX} ${BY} Z`} /></clipPath>
      </defs>
      <path d="M0 142 C60 120 120 130 180 124 S300 114 360 126 S440 122 480 130 L480 176 L0 176 Z" fill="url(#lgHillFar)" />
      {/* edificios laterales escalonados */}
      <rect x="64" y="124" width="52" height="30" fill="url(#lgTower)" stroke={edge} strokeWidth="1" />
      <rect x="84" y="70" width="16" height="54" fill="url(#lgTower)" stroke={edge} strokeWidth="1" />
      <rect x="81" y="66" width="22" height="5" fill="#12306a" stroke={edge} strokeWidth=".9" />
      {win(70, 134, 10, 0)}{win(90, 134, 10, 1)}{win(88, 84, 8, 2)}{win(88, 100, 8, 3)}
      <rect x="112" y="92" width="48" height="62" fill="url(#lgTower)" stroke={edge} strokeWidth="1" />
      <path d="M108 92 H164" stroke="rgba(130,190,255,.6)" strokeWidth="1.2" />
      {win(118, 102, 12, 4)}{win(136, 102, 12, 5)}{win(118, 118, 12, 6)}{win(136, 118, 12, 7)}
      <rect x="320" y="92" width="48" height="62" fill="url(#lgTower)" stroke={edge} strokeWidth="1" />
      <path d="M316 92 H372" stroke="rgba(130,190,255,.6)" strokeWidth="1.2" />
      {win(326, 102, 12, 1)}{win(344, 102, 12, 2)}{win(326, 118, 12, 3)}{win(344, 118, 12, 4)}
      <rect x="368" y="122" width="62" height="32" fill="url(#lgTower)" stroke={edge} strokeWidth="1" />
      {win(374, 132, 10, 0)}{win(394, 132, 10, 5)}{win(412, 132, 10, 2)}
      <rect x="406" y="104" width="5" height="18" fill="#193568" stroke={edge} strokeWidth=".8" />
      {[0, 1, 2].map((i) => (
        <circle key={i} className={animated ? "lg-steam" : undefined} cx={408.5 + (i - 1) * 3} cy="100" r={6 + i * 1.5} fill="rgba(190,215,255,.45)" filter="url(#lgBlur)" style={{ animationDelay: `${i * 1.6}s`, opacity: animated ? 0 : 0.25 }} />
      ))}
      {/* Atucha I: cúpula con nervaduras sobre base vidriada */}
      <circle cx={CX} cy={BY - 10} r="92" fill="url(#lgGlow)" className={animated ? "lg-halo" : undefined} />
      <path d={`M${CX - RX} ${BY} A${RX} ${RY} 0 0 1 ${CX + RX} ${BY} Z`} fill="url(#lgDome)" stroke="rgba(160,210,255,.75)" strokeWidth="1.2" />
      <g clipPath="url(#lgDomeClip)" fill="none" stroke="rgba(200,230,255,.42)" strokeWidth=".7">
        <line x1={CX} y1={BY} x2={CX} y2={BY - RY} />
        {ribs.map((rx, i) => <path key={i} d={`M${CX - rx} ${BY} A${rx} ${RY} 0 0 1 ${CX + rx} ${BY}`} />)}
        {lats.map((l, i) => <path key={i} d={`M${CX - l.hw} ${l.y} Q${CX} ${l.y + 6} ${CX + l.hw} ${l.y}`} />)}
      </g>
      <ellipse cx={CX - 34} cy={BY - 50} rx="18" ry="6" fill="rgba(255,255,255,.14)" transform={`rotate(-32 ${CX - 34} ${BY - 50})`} />
      <rect x="150" y={BY} width="180" height="46" fill="url(#lgTower)" stroke={edge} strokeWidth="1" />
      <g stroke="rgba(150,205,255,.38)" strokeWidth=".7">
        {Array.from({ length: 14 }, (_, i) => <line key={i} x1={150 + 12.86 * (i + 1)} y1={BY} x2={150 + 12.86 * (i + 1)} y2={BY + 46} />)}
        <line x1="150" y1={BY + 15} x2="330" y2={BY + 15} />
        <line x1="150" y1={BY + 30} x2="330" y2={BY + 30} />
      </g>
      <rect x="146" y={BY - 2} width="188" height="4" fill="#12306a" stroke="rgba(130,190,255,.6)" strokeWidth=".9" />
      <rect x="140" y="152" width="200" height="4" fill="#0f2656" stroke={edge} strokeWidth=".8" />
      <rect x="222" y="136" width="36" height="16" fill="#0b1a3d" stroke="rgba(150,205,255,.6)" strokeWidth=".9" />
      <path d="M218 136 H262" stroke="rgba(190,225,255,.7)" strokeWidth="1.4" />
      {/* costa y río */}
      <path d="M0 160 Q120 142 240 152 T480 150 L480 176 L0 176 Z" fill="url(#lgHillNear)" />
      <path d="M0 166 Q120 160 240 165 T480 163 L480 176 L0 176 Z" fill="#0d2a5c" />
      <path className={animated ? "lg-river" : undefined} d="M18 170 H70 M110 172 H190 M230 169 H300 M340 172 H430" stroke="rgba(130,200,255,.45)" strokeWidth="1" strokeDasharray="14 10" fill="none" />
      {tree(26, 148, 9, "t1")}{tree(46, 150, 7, "t2")}{tree(448, 150, 8, "t3")}{tree(466, 152, 6, "t4")}
    </svg>
  );
}

function RotatingLine({ animated }) {
  const verbs = ["Consultá", "interpretá", "verificá"];
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!animated) return undefined;
    const t = setInterval(() => setI((v) => (v + 1) % verbs.length), 2200);
    return () => clearInterval(t);
  }, [animated]);
  const w = (k) => (
    <span key={k} style={{ transition: "color .45s, text-shadow .45s", color: animated && i === k ? "#4dd4f0" : "inherit", fontWeight: animated && i === k ? 600 : 400, textShadow: animated && i === k ? "0 0 14px rgba(77,212,240,.45)" : "none" }}>{verbs[k]}</span>
  );
  return <>{w(0)}, {w(1)} y {w(2)} la normativa vigente en seguridad nuclear y radiológica.</>;
}

function LoginScreen({ onSuccess }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [compact] = useState(() => { try { return window.innerHeight < 960; } catch { return false; } });
  const [shake, setShake] = useState(false);
  const [caps, setCaps] = useState(false);
  const [reduced] = useState(() => { try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; } });
  const [coarse] = useState(() => { try { return window.matchMedia("(pointer: coarse)").matches; } catch { return false; } });
  const rootRef = useRef(null);
  const rafRef = useRef(0);

  const onMove = (e) => {
    if (reduced || coarse) return;
    const x = e.clientX, y = e.clientY;
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      const el = rootRef.current;
      if (!el) return;
      el.style.setProperty("--px", String(((x / window.innerWidth) - 0.5) * 2));
      el.style.setProperty("--py", String(((y / window.innerHeight) - 0.5) * 2));
    });
  };

  const submit = (e) => {
    e.preventDefault();
    if (user.trim() === ACCESS_USER && pass === ACCESS_PASS) {
      setError("");
      onSuccess();
    } else {
      setError("Usuario o contraseña incorrectos.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const field = (iconName, input, extra) => (
    <label className="lg-field" style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(10,24,52,.38)", border: "1px solid rgba(110,160,255,.32)", borderRadius: 12, padding: "0 14px", marginBottom: 14 }}>
      <Icon name={iconName} size={22} color="#5cc8ff" />
      <span style={{ width: 1, alignSelf: "stretch", margin: "10px 0", background: "rgba(110,160,255,.25)" }} />
      {input}
      {extra}
    </label>
  );
  const inputStyle = { flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none", color: "#eef4f8", fontFamily: "'DM Sans', sans-serif", fontSize: "1rem", padding: "15px 0" };
  const par = () => ({});
  const d = (s) => ({ animationDelay: `${s}s` });

  return (
    <div ref={rootRef} style={{ minHeight: "100dvh", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", fontFamily: "'DM Sans', sans-serif", color: "#eef4f8", background: "radial-gradient(ellipse 760px 460px at 50% 0%, rgba(40,100,220,.32), transparent 65%), linear-gradient(180deg, #0a1736 0%, #070f24 100%)" }}>
      <GridFloor />
      <Stars />
      <ArgentinaMap animated={!reduced} />

      <aside className="lg-info" aria-label="Acerca de norma-ar">
        <div className="lg-in" style={d(0.55)}>
          <div style={{ maxWidth: 340, margin: "0 auto" }}><InfoEmblem /></div>
          <p style={{ margin: "14px 0 16px", fontSize: ".92rem", lineHeight: 1.6, color: "rgba(232,241,255,.92)" }}>
            Herramienta basada en inteligencia artificial para consultar, buscar y analizar el marco regulatorio nuclear argentino, en una base de conocimiento unificada.
          </p>
          <div style={{ display: "grid", gap: 13 }}>
            <Rasgo d="M4 5h16v11H9l-5 4V5z" titulo="Consultas en lenguaje natural" texto="Preguntá como lo harías a un colega." />
            <Rasgo d="M7 3h8l4 4v14H7z M14 3v5h5 M10 14l2 2 3-4" titulo="Fuentes oficiales" texto="Normas de la ARN, guías regulatorias, legislación nacional y tratados internacionales." />
            <Rasgo d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1 M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" titulo="Respuestas trazables" texto="Cada respuesta indica el documento que la respalda." />
          </div>
          <div className="lg-sep" style={{ height: 1, margin: "16px 0 12px", background: "linear-gradient(90deg, rgba(77,212,240,.75), rgba(77,212,240,0))" }} />
          <p style={{ margin: 0, fontSize: ".8rem", lineHeight: 1.5, color: "rgba(214,228,250,.78)" }}>
            Para profesionales de la seguridad nuclear y radiológica, organismos reguladores, operadores, establecimientos de salud, docentes, investigadores y estudiantes.
          </p>
        </div>
      </aside>

      <main style={{ position: "relative", zIndex: 1, boxSizing: "border-box", width: "100%", maxWidth: 440, padding: compact ? "22px 20px 0" : "36px 20px 0", textAlign: "center", flex: 1 }}>
        <div className="lg-in" style={d(0.05)}>
          <div style={{ display: "flex", justifyContent: "center", ...par(12, 8) }}><LoginAtom size={compact ? 96 : 124} animated={!reduced} /></div>
        </div>
        <div className="lg-in" style={{ fontSize: "3rem", fontWeight: 700, letterSpacing: "-.03em", lineHeight: 1.05, marginTop: 4, ...d(0.18) }}>
          norma<span style={{ color: "#5cc8ff" }}>-ar</span>
        </div>
        <h1 className="lg-in" style={{ fontSize: "1.55rem", fontWeight: 600, lineHeight: 1.25, margin: compact ? "14px 0 8px" : "24px 0 12px", ...d(0.3) }}>
          Tu asistente en normativa<br /><span style={{ color: "#4dd4f0" }}>nuclear argentina</span>
        </h1>
        <p className="lg-in" style={{ fontSize: ".98rem", lineHeight: 1.55, color: "rgba(238,244,248,.82)", margin: compact ? "0 auto 14px" : "0 auto 24px", maxWidth: 360, ...d(0.42) }}>
          Consultá, <b style={{ color: "#4dd4f0", fontWeight: 600 }}>interpretá</b> y verificá la normativa vigente en seguridad nuclear y radiológica.
        </p>

        <form className={"lg-in lg-card" + (shake ? " lg-shake" : "")} onSubmit={submit} noValidate style={{ textAlign: "left", background: "rgba(255,255,255,.05)", border: "1px solid rgba(110,160,255,.24)", borderRadius: 18, padding: 18, boxShadow: "0 14px 44px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,255,255,.06)", ...d(0.54) }}>
          {field("user",
            <input value={user} onChange={(e) => setUser(e.target.value)} placeholder="Usuario" aria-label="Usuario" autoComplete="username" autoFocus={!coarse} style={inputStyle} />
          )}
          {field("lock",
            <input value={pass} onChange={(e) => setPass(e.target.value)} onKeyUp={(e) => setCaps(!!(e.getModifierState && e.getModifierState("CapsLock")))} onBlur={() => setCaps(false)} type={show ? "text" : "password"} placeholder="Contraseña" aria-label="Contraseña" autoComplete="current-password" style={inputStyle} />,
            <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4, display: "flex", color: "rgba(238,244,248,.6)" }}>
              <Icon name={show ? "eyeOff" : "eye"} size={22} color="currentColor" />
            </button>
          )}
          {caps && <div style={{ color: "#f5d26b", fontSize: ".84rem", margin: "-4px 2px 12px" }}>Bloq Mayús activado</div>}
          {error && <div role="alert" style={{ color: "#ff9a9a", fontSize: ".88rem", margin: "-2px 2px 12px" }}>{error}</div>}
          <button type="submit" className="lg-btn" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, border: "none", borderRadius: 12, padding: "15px 18px", cursor: "pointer", color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: "1.08rem", fontWeight: 600, background: "linear-gradient(90deg, #4a8bff 0%, #5aa0ff 100%)", boxShadow: "0 8px 22px rgba(60,120,255,.35)" }}>
            <Icon name="login" size={22} color="#fff" strokeWidth={1.8} /> Ingresar
          </button>
        </form>

        <div className="lg-in" style={{ marginTop: compact ? 10 : 14, ...d(0.66) }}>
          <p style={{ margin: "0 auto 6px", maxWidth: 360, display: "flex", gap: 8, alignItems: "flex-start", justifyContent: "center", textAlign: "left", fontSize: ".8rem", lineHeight: 1.45, color: "rgba(226,236,252,.82)" }}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#6fdcf5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "0 0 auto", marginTop: 1 }}><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z M8.5 12l2.5 2.5 4.5-5" /></svg>
            <span>Consulta orientativa: verificá siempre en el texto oficial de la ARN.</span>
          </p>
          <div style={{ fontSize: ".84rem", color: "rgba(226,236,252,.82)" }}>
            Acceso de prueba: usuario <b style={{ color: "#bfe9ff" }}>{ACCESS_USER}</b> &middot; contraseña <b style={{ color: "#bfe9ff" }}>{ACCESS_PASS}</b>
          </div>
        </div>

      </main>

      <div className="lg-in" style={{ position: "relative", zIndex: 1, boxSizing: "border-box", width: "100%", maxWidth: 520, padding: compact ? "6px 12px 0" : "18px 12px 0", ...d(0.9) }}>
        <div style={par(-9, 0)}><LoginScene animated={false} compact={compact} /></div>
      </div>
      <footer style={{ position: "relative", zIndex: 1, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 12, width: "100%", maxWidth: 440, padding: compact ? "4px 20px 12px" : "6px 20px 22px", fontSize: ".8rem", color: "rgba(238,244,248,.8)" }}>
        <span style={{ flex: 1, height: 1, background: "rgba(110,160,255,.25)" }} />
        <span style={{ textAlign: "center" }}>norma-ar &bull; Asistente de Normativa Nuclear Argentina<br /><span style={{ fontSize: ".74rem", opacity: .85 }}>TFI &bull; Especialización en Seguridad Nuclear</span></span>
        <span style={{ flex: 1, height: 1, background: "rgba(110,160,255,.25)" }} />
      </footer>

      <style>{`
        .lg-field:focus-within { border-color: rgba(92,200,255,.85) !important; box-shadow: 0 0 0 3px rgba(92,200,255,.15); }
        .lg-field input::placeholder { color: rgba(238,244,248,.45); }
        .lg-in { opacity: 0; animation: lgFadeUp .75s cubic-bezier(.2,.7,.2,1) forwards; }
        .lg-btn { position: relative; overflow: hidden; transition: transform .15s, filter .15s; }
        .lg-btn::after { content: ""; position: absolute; top: 0; left: -60%; width: 40%; height: 100%; background: linear-gradient(100deg, transparent, rgba(255,255,255,.38), transparent); transform: skewX(-20deg); transition: left .6s; }
        .lg-btn:hover { transform: translateY(-1px); filter: brightness(1.07); }
        .lg-btn:hover::after { left: 130%; }
        .lg-star { opacity: .3; }
        .lg-cap { display: none; }
        @media (min-width: 1100px) { .lg-cap { display: inline; } }
        .lg-steam { transform-box: fill-box; transform-origin: center; animation: lgSteam 6s ease-out infinite; }
        .lg-halo { animation: lgHalo 4s ease-in-out infinite; }
        .lg-map { position: absolute; top: 32%; bottom: 12%; left: 0; right: 0; display: none; justify-content: center; pointer-events: none; opacity: .95; }
        .lg-info { display: none; position: absolute; z-index: 1; left: 3.5vw; top: 50%; width: min(27vw, 430px); text-align: left; }
        @media (min-width: 1100px) {
          .lg-map { display: flex; top: 0; bottom: auto; left: auto; right: 0; width: 29vw; height: 100dvh; padding: 9vh 3vw 9vh 1vw; box-sizing: border-box; align-items: center; }
          .lg-info { display: block; transform: translateY(-50%); }
        }
        @media (min-width: 1100px) and (max-height: 820px) {
          .lg-info p { font-size: .8rem !important; line-height: 1.5 !important; }
          .lg-info .lg-sep { margin: 10px 0 !important; }
        }
        .lg-pulse { transform-box: fill-box; transform-origin: center; animation: lgPulse 2.4s ease-out infinite; }
        .lg-river { animation: lgRiver 5s linear infinite; }
        .lg-win { animation: lgWin 5s ease-in-out infinite; }
        .lg-shake { animation: lgShake .45s; }
        @keyframes lgFadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        @keyframes lgTwinkle { 0%, 100% { opacity: .15; } 50% { opacity: .85; } }
        @keyframes lgSteam { 0% { transform: translateY(0) scale(.6); opacity: 0; } 20% { opacity: .38; } 100% { transform: translateY(-48px) scale(1.9); opacity: 0; } }
        @keyframes lgPulse { 0% { transform: scale(.5); opacity: .9; } 100% { transform: scale(2.2); opacity: 0; } }
        @keyframes lgRiver { to { stroke-dashoffset: -48; } }
        @keyframes lgHalo { 0%, 100% { opacity: .45; } 50% { opacity: .9; } }
        @keyframes lgWin { 0%, 100% { opacity: .85; } 50% { opacity: .45; } }
        @keyframes lgShake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-8px); } 40% { transform: translateX(7px); } 60% { transform: translateX(-5px); } 80% { transform: translateX(3px); } }
        @media (prefers-reduced-motion: reduce) {
          .lg-in { opacity: 1; animation: none; }
          .lg-star, .lg-steam, .lg-halo, .lg-river, .lg-pulse, .lg-win, .lg-shake { animation: none; }
          .lg-btn::after { display: none; }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  const [auth, setAuth] = useState(readSession);

  // Estadísticas de visitas: Vercel Web Analytics (sin cookies). Solo funciona una vez activado en el
  // panel de Vercel (proyecto > Analytics > Enable); si no está activado, el script no existe y no pasa nada.
  useEffect(() => {
    try {
      if (window.__normaArAnalytics) return;
      window.__normaArAnalytics = true;
      window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
      const sc = document.createElement("script");
      sc.defer = true;
      sc.src = "/_vercel/insights/script.js";
      document.head.appendChild(sc);
    } catch { /* sin analítica */ }
  }, []);
  if (!auth) return <LoginScreen onSuccess={() => { writeSession(true); setAuth(true); }} />;
  return <Asistente onLogout={() => { writeSession(false); setAuth(false); }} />;
}
