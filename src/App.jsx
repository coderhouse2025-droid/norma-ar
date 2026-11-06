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
    .replace(/\b(?:del|al)\s+fragmentos?\b/gi, (m) => (m.toLowerCase().startsWith("del") ? "de la" : "a la") + " documentación consultada")
    .replace(/\b(?:los|las|estos|esos)\s+fragmentos(?:\s+(?:recibidos|consultados|recuperados|proporcionados|disponibles))?/gi, "la documentación consultada")
    .replace(/\b(?:el|este|ese)\s+fragmento(?:\s+(?:recibido|consultado|recuperado|proporcionado))?/gi, "la documentación consultada")
    .replace(/\bfragmentos?\b/gi, "documentación consultada")
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
function renderAssistant(raw) {
  const citations = extractCitations(raw);
  const html = md2html(cleanAssistantText(raw));
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
    .replace(/\[[^\]\n]{2,120}\]/g, "")
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

function PlantIcon({ x, y, label, animated, delay }) {
  return (
    <g transform={`translate(${x} ${y}) scale(1.35)`}>
      <circle r="9" fill="none" stroke="#4dd4f0" strokeWidth=".9" className={animated ? "lg-pulse" : undefined} style={{ animationDelay: `${delay}s` }} />
      <circle r="2.6" fill="#4dd4f0" />
      <g transform="translate(-9 -23)" fill="rgba(20,50,110,.95)" stroke="#7fd6ff" strokeWidth=".9">
        <path d="M0 14 C1.5 9 2 6 1.5 2 L1.5 0 H7 V2 C6.5 6 7 9 8.5 14 Z" />
        <path d="M10 14 L10 8 C10 4 14 2 18 6 V14 Z" />
      </g>
      <text y="19" textAnchor="middle" fontSize="9" fontWeight="700" fill="#bfe9ff" style={{ fontFamily: "'DM Sans', sans-serif", paintOrder: "stroke", stroke: "rgba(7,15,36,.85)", strokeWidth: 2.4 }}>{label}</text>
    </g>
  );
}

function ArgentinaMap({ animated }) {
  return (
    <div className="lg-map" aria-hidden="true">
      <svg viewBox="0 0 300 640" preserveAspectRatio="xMidYMid meet" style={{ height: "100%", width: "auto", maxWidth: "100%", display: "block", overflow: "visible" }}>
        <defs>
          <linearGradient id="lgMapFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3f7fe0" stopOpacity=".34" /><stop offset="1" stopColor="#2a5fc0" stopOpacity=".1" /></linearGradient>
        </defs>
        <g fill="url(#lgMapFill)" stroke="rgba(130,205,255,.62)" strokeWidth=".8" strokeLinejoin="round">
          {AR_MAP.p.map((d, i) => <path key={i} d={d} transform={i === AR_MAP.m ? "translate(-68 0)" : undefined} />)}
        </g>
        <PlantIcon x={AR_MAP.e[0]} y={AR_MAP.e[1]} label="Embalse" animated={animated} delay={0} />
        <PlantIcon x={AR_MAP.a[0]} y={AR_MAP.a[1]} label="Atucha" animated={animated} delay={1.2} />
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

function LoginScene({ animated }) {
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
    <svg viewBox="0 0 480 176" width="100%" style={{ display: "block", maxWidth: 364, margin: "0 auto" }} aria-hidden="true">
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
  const [forgot, setForgot] = useState(false);
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
  const par = (kx, ky) => ({ transform: `translate(calc(var(--px, 0) * ${kx}px), calc(var(--py, 0) * ${ky}px))`, transition: "transform .3s ease-out" });
  const d = (s) => ({ animationDelay: `${s}s` });

  return (
    <div ref={rootRef} onPointerMove={onMove} style={{ minHeight: "100dvh", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", fontFamily: "'DM Sans', sans-serif", color: "#eef4f8", background: "radial-gradient(ellipse 760px 460px at 50% 0%, rgba(40,100,220,.32), transparent 65%), linear-gradient(180deg, #0a1736 0%, #070f24 100%)" }}>
      <GridFloor />
      <Stars />
      <ArgentinaMap animated={!reduced} />

      <aside className="lg-info" aria-label="Acerca de norma-ar">
        <div className="lg-in" style={d(0.55)}>
          <img src={PORTADA_IMG} alt="Ilustración técnica de una instalación nuclear rodeada de paneles de datos" width="560" height="420" style={{ display: "block", width: "100%", height: "auto", filter: "drop-shadow(0 0 16px rgba(80,160,255,.32))" }} />
          <p style={{ margin: "14px 0 0", fontStyle: "italic", fontSize: ".9rem", lineHeight: 1.6, color: "rgba(228,238,255,.9)" }}>
            norma-ar es una herramienta basada en inteligencia artificial para la consulta, búsqueda y análisis del marco regulatorio nuclear argentino. Integra normas regulatorias de la Autoridad Regulatoria Nuclear (ARN), guías regulatorias, legislación nacional y tratados internacionales en una base de conocimiento unificada, permitiendo realizar consultas en lenguaje natural y obtener respuestas respaldadas por fuentes documentales oficiales y trazables.
          </p>
          <div className="lg-sep" style={{ height: 1, margin: "16px 0", background: "linear-gradient(90deg, rgba(77,212,240,.75), rgba(77,212,240,0))" }} />
          <p style={{ margin: 0, fontStyle: "italic", fontSize: ".9rem", lineHeight: 1.6, color: "rgba(228,238,255,.9)" }}>
            Está orientada a profesionales de la seguridad nuclear y radiológica, organismos reguladores, titulares y operadores de instalaciones nucleares y radiactivas, establecimientos de salud, consultores, docentes, investigadores y estudiantes. Su objetivo es facilitar el acceso a los requisitos regulatorios aplicables, optimizar la localización de información normativa relevante y fortalecer la trazabilidad y verificación de las fuentes que sustentan cada respuesta.
          </p>
        </div>
      </aside>

      <main style={{ position: "relative", zIndex: 1, boxSizing: "border-box", width: "100%", maxWidth: 440, padding: "36px 20px 0", textAlign: "center", flex: 1 }}>
        <div className="lg-in" style={d(0.05)}>
          <div style={{ display: "flex", justifyContent: "center", ...par(12, 8) }}><LoginAtom animated={!reduced} /></div>
        </div>
        <div className="lg-in" style={{ fontSize: "3rem", fontWeight: 700, letterSpacing: "-.03em", lineHeight: 1.05, marginTop: 4, ...d(0.18) }}>
          norma<span style={{ color: "#5cc8ff" }}>-ar</span>
        </div>
        <h1 className="lg-in" style={{ fontSize: "1.55rem", fontWeight: 600, lineHeight: 1.25, margin: "24px 0 12px", ...d(0.3) }}>
          Tu asistente en normativa<br /><span style={{ color: "#4dd4f0" }}>nuclear argentina</span>
        </h1>
        <p className="lg-in" style={{ fontSize: ".98rem", lineHeight: 1.55, color: "rgba(238,244,248,.82)", margin: "0 auto 24px", maxWidth: 360, ...d(0.42) }}>
          <RotatingLine animated={!reduced} />
        </p>

        <form className={"lg-in lg-card" + (shake ? " lg-shake" : "")} onSubmit={submit} noValidate style={{ textAlign: "left", background: "rgba(255,255,255,.05)", border: "1px solid rgba(110,160,255,.24)", borderRadius: 18, padding: 18, boxShadow: "0 14px 44px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,255,255,.06)", ...d(0.54) }}>
          {field("user",
            <input value={user} onChange={(e) => setUser(e.target.value)} placeholder="Usuario" aria-label="Usuario" autoComplete="username" autoFocus style={inputStyle} />
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

        <div className="lg-in" style={{ marginTop: 14, fontSize: ".92rem", ...d(0.66) }}>
          <button type="button" onClick={() => setForgot((v) => !v)} style={{ background: "transparent", border: "none", color: "#4dd4f0", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: ".92rem", padding: 4 }}>
            ¿Olvidaste tu contraseña?
          </button>
          {forgot && (
            <p style={{ margin: "8px auto 0", maxWidth: 340, color: "rgba(238,244,248,.75)", lineHeight: 1.5, fontSize: ".86rem" }}>
              Contactá al administrador del proyecto para recuperar tus datos de acceso.
            </p>
          )}
        </div>

      </main>

      <div className="lg-in" style={{ position: "relative", zIndex: 1, boxSizing: "border-box", width: "100%", maxWidth: 520, padding: "18px 12px 0", ...d(0.9) }}>
        <div style={par(-9, 0)}><LoginScene animated={!reduced} /></div>
      </div>
      <footer style={{ position: "relative", zIndex: 1, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 12, width: "100%", maxWidth: 440, padding: "6px 20px 22px", fontSize: ".78rem", color: "rgba(238,244,248,.7)" }}>
        <span style={{ flex: 1, height: 1, background: "rgba(110,160,255,.25)" }} />
        <span style={{ textAlign: "center" }}>norma-ar &bull; Asistente de Normativa Nuclear Argentina</span>
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
        .lg-star { opacity: .25; animation: lgTwinkle 4.5s ease-in-out infinite; }
        .lg-steam { transform-box: fill-box; transform-origin: center; animation: lgSteam 6s ease-out infinite; }
        .lg-halo { animation: lgHalo 4s ease-in-out infinite; }
        .lg-map { position: absolute; top: 25%; bottom: 14%; left: 0; right: 0; display: flex; justify-content: center; pointer-events: none; opacity: .95; }
        .lg-info { display: none; position: absolute; z-index: 1; left: 3.5vw; top: 50%; width: min(27vw, 430px); text-align: left; }
        @media (min-width: 1100px) {
          .lg-map { top: 0; bottom: auto; left: auto; right: 0; width: 29vw; height: 100dvh; padding: 9vh 3vw 9vh 1vw; box-sizing: border-box; align-items: center; }
          .lg-info { display: block; transform: translateY(-50%); }
        }
        @media (min-width: 1100px) and (max-height: 820px) {
          .lg-info img { width: 74% !important; margin: 0 auto; }
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

// Imagen del panel informativo de la pantalla de ingreso (WebP 560x420 con transparencia, embebida; solo se usa en pantallas anchas).
const PORTADA_IMG = "data:image/webp;base64,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";
