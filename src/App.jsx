import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `Sos un asistente especializado en el marco normativo nuclear argentino. Respondés consultas con precisión técnica y jurídica en español rioplatense.

Tus áreas de conocimiento incluyen:
- Ley 24804 "Ley Nacional de la Actividad Nuclear" y sus decretos reglamentarios
- La Autoridad Regulatoria Nuclear (ARN): funciones, estructura orgánica, competencias regulatorias
- Normas ARN (serie de regulaciones técnicas emitidas por la ARN en distintas áreas)
- Seguridad radiológica: límites de dosis para trabajadores y público, zonas de exclusión
- Licencias y habilitaciones para instalaciones nucleares, radiactivas y para personal
- Gestión, tratamiento y disposición de residuos radiactivos
- Instalaciones nucleares: reactores Atucha I, Atucha II, Embalse, reactores de investigación
- Transporte de materiales radiactivos (normativa ARN, regulaciones OIEA/TS-R-1)
- Salvaguardias nucleares: ABACC, OIEA, Acuerdo Cuadripartito
- Tratados internacionales: TNP, Tratado de Tlatelolco, CTBT, NPT
- CNEA (Comisión Nacional de Energía Atómica): rol histórico, misión, proyectos
- INVAP: diseño, construcción y exportación de reactores nucleares
- Seguridad nuclear, física y radiológica
- Planes de emergencia nuclear y radiológica

Reglas:
1. Siempre respondé en español rioplatense
2. Citá números de ley, decreto o norma ARN cuando los conozcas con certeza. Las normas ARN se numeran siempre con tres niveles (ej. AR 10.1.1, AR 10.6.1, AR 10.12.1) — nunca uses solo dos niveles (ej. "AR 10.1"). Si conocés los dos primeros niveles pero no estás seguro del tercero, no completes con un número inventado: mencioná la norma de forma general (ej. "la serie AR 10.1") en vez de un número de tres niveles incompleto o aproximado
3. Si un dato es incierto o podría haber cambiado, indicalo explícitamente
4. Estructurá respuestas largas con subtítulos usando ###
5. Para respuestas cortas no uses estructura de títulos innecesaria
6. Sé preciso pero accesible; explicá términos técnicos cuando aparezcan
7. Al final de cada respuesta, indicá la fuente entre corchetes con el formato [Nombre de la norma o ley, p. X], usando el número de página cuando esté disponible en el contexto documental. Citá cada norma o documento UNA sola vez — nunca desgloses una misma norma en varios corchetes por artículo o rango de artículos (ej. NO hagas "[Ley 24804, art. 1]", "[Ley 24804, art. 2]", etc.; usá un único "[Ley 24804]"). Si usaste más de un documento distinto, poné cada uno en su propio corchete, una debajo de la otra. No repitas la cita en medio del texto: solo al final.`;

const TOPICS = [
  { label: "Marco legal", sub: "Leyes y Decretos principales", q: "¿Cuáles son las principales leyes que regulan la actividad nuclear en Argentina?" },
  { label: "Institución", sub: "Rol y funciones de la ARN", q: "¿Qué es la ARN, cuáles son sus funciones y cómo está estructurada?" },
  { label: "Licencias", sub: "Licencias y habilitaciones", q: "¿Cuáles son los requisitos para obtener una licencia nuclear en Argentina?" },
  { label: "Residuos", sub: "Gestión de residuos radiactivos", q: "¿Cómo se clasifican y gestionan los residuos radiactivos según la normativa argentina?" },
  { label: "Protección", sub: "Protección radiológica", q: "¿Qué establece la normativa sobre protección radiológica en Argentina?" },
  { label: "Instalaciones", sub: "Instalaciones nucleares", q: "¿Cuáles son las normas aplicables a instalaciones nucleares en Argentina?" },
  { label: "Internacional", sub: "Tratados y salvaguardias", q: "¿Qué tratados internacionales sobre no proliferación nuclear ha suscripto Argentina?" },
  { label: "Transporte", sub: "Transporte de material radiactivo", q: "¿Cómo se regula el transporte de materiales radiactivos en Argentina?" },
];

const CHIPS = [
  { text: "Ley 24804", q: "¿Qué establece la Ley 24804 de Actividad Nuclear?" },
  { text: "Límites de dosis", q: "¿Cuáles son los límites de dosis de radiación permitidos en Argentina?" },
  { text: "CNEA e INVAP", q: "¿Qué es la CNEA y cuál es su relación con la ARN?" },
  { text: "Tlatelolco", q: "¿Qué es el Tratado de Tlatelolco y cómo afecta a Argentina?" },
  { text: "Salvaguardias OIEA", q: "¿Cómo funciona el sistema de salvaguardias nucleares en Argentina con el OIEA?" },
];

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

function md2html(raw) {
  let t = raw
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
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
  const regex = /\[([^[\]\n]{2,80})\]/g;
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
  return raw.replace(/\[([^[\]\n]{2,80})\]/g, "").replace(/[ \t]{2,}/g, " ");
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
  const html = md2html(stripCitations(raw));
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
        setHistory(prev => [...prev, { role: "assistant", content: capForHistory(stripCitations(assistantText)) }]);
      }
      setMessages(prev => {
        const next = [...prev];
        if (next[assistantIndex]) {
          next[assistantIndex] = { ...next[assistantIndex], streaming: false };
        }
        return next;
      });
    } catch (e) {
      if (e.name === "AbortError") {
        // el usuario detuvo la generación: conservamos lo que llegó hasta ahora
        setMessages(prev => {
          const next = [...prev];
          if (next[assistantIndex]) {
            next[assistantIndex] = { ...next[assistantIndex], streaming: false };
          }
          return next;
        });
        if (assistantText) {
          setHistory(prev => [...prev, { role: "assistant", content: capForHistory(stripCitations(assistantText)) }]);
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

  const clearChat = () => {
    setMessages([]);
    setHistory([]);
    setSidebarOpen(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); }
  };

  const showWelcome = messages.length === 0;

  return (
    <div className="app-shell" style={{
      background: "radial-gradient(ellipse 900px 500px at 50% -5%, rgba(0,200,232,.05), transparent 60%), #080f1e",
      color: "#eef4f8", fontFamily: "'DM Sans', sans-serif",
      fontWeight: 300, display: "flex", flexDirection: "column",
      fontSize: 15,
    }}>
      {/* HEADER */}
      <header style={{
        background: "#0f1e36", borderBottom: "1px solid rgba(0,200,232,.18)",
        padding: "0 1.75rem", height: 68, display: "flex", alignItems: "center",
        gap: "1rem", flexShrink: 0, position: "sticky", top: 0, zIndex: 10,
      }}>
        <AtomIcon animated={!reducedMotion} />
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "1.2rem", fontWeight: 700, letterSpacing: "-.01em", lineHeight: 1.2 }}>
          <span style={{ color: "#eef4f8" }}>norma</span>
          <span style={{ color: "#eef4f8", fontSize: "50%" }}>-</span>
          <span style={{ color: "#00c8e8" }}>ar</span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, background: "rgba(0,200,232,.08)", border: "1px solid rgba(0,200,232,.18)", borderRadius: 20, padding: "4px 12px", fontSize: ".7rem", color: "#00c8e8", letterSpacing: ".05em" }}>
          <span style={{ width: 7, height: 7, background: "#00c8e8", borderRadius: "50%", display: "inline-block", animation: "blink 2s infinite" }} />
          IA Activa
        </div>
        {/* Mobile sidebar toggle */}
        <button onClick={() => setSidebarOpen(v => !v)} aria-label={sidebarOpen ? "Cerrar menú" : "Abrir menú"} aria-expanded={sidebarOpen} style={{ display: "none", background: "transparent", border: "1px solid rgba(0,200,232,.18)", borderRadius: 6, color: "#00c8e8", padding: "6px 10px", cursor: "pointer", fontSize: ".7rem", marginLeft: 8 }} className="mob-menu">
          ☰
        </button>
      </header>

      {/* LAYOUT */}
      <div className="app-body" style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Backdrop para cerrar el sidebar en mobile */}
        {sidebarOpen && (
          <div
            className="sidebar-backdrop"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
        {/* SIDEBAR */}
        <aside className={`sidebar${sidebarOpen ? " sidebar-open" : ""}`} style={{
          width: 250, flexShrink: 0, background: "#0f1e36",
          borderRight: "1px solid rgba(238,244,248,.07)",
          overflowY: "auto", display: "flex", flexDirection: "column",
        }}>
          <div style={{ padding: "1.1rem 1rem", borderBottom: "1px solid rgba(238,244,248,.07)" }}>
            <div style={{ fontSize: ".62rem", letterSpacing: ".13em", textTransform: "uppercase", color: "#0090ab", marginBottom: ".7rem", fontWeight: 500 }}>
              Temas frecuentes
            </div>
            {TOPICS.map((t) => (
              <button key={t.label} onClick={() => sendMsg(t.q)} style={{
                width: "100%", background: "transparent", border: "1px solid rgba(238,244,248,.07)",
                borderRadius: 6, color: "rgba(238,244,248,.65)", fontFamily: "'DM Sans', sans-serif",
                fontSize: ".79rem", fontWeight: 300, padding: "8px 10px", textAlign: "left",
                cursor: "pointer", marginBottom: 5, lineHeight: 1.35, transition: "all .18s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,200,232,.07)"; e.currentTarget.style.borderColor = "#0090ab"; e.currentTarget.style.color = "#eef4f8"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(238,244,248,.07)"; e.currentTarget.style.color = "rgba(238,244,248,.65)"; }}
              >
                <small style={{ display: "block", fontSize: ".61rem", color: "#00c8e8", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 2, fontWeight: 500 }}>{t.label}</small>
                {t.sub}
              </button>
            ))}
          </div>

          <div style={{ padding: "1.1rem 1rem", borderBottom: "1px solid rgba(238,244,248,.07)" }}>
            <div style={{ fontSize: ".62rem", letterSpacing: ".13em", textTransform: "uppercase", color: "#0090ab", marginBottom: ".7rem", fontWeight: 500 }}>
              Fuente documental
            </div>
            <div style={{ background: "rgba(232,200,74,.07)", border: "1px solid rgba(232,200,74,.2)", borderRadius: 6, padding: "10px 11px", fontSize: ".75rem", color: "rgba(238,244,248,.65)", lineHeight: 1.6 }}>
              Documentación oficial:
              <div style={{ display: "flex", flexDirection: "column", gap: 5, margin: "7px 0 9px" }}>
                {SOURCE_LINKS.map(s => (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "#e8c84a", textDecoration: "none", fontWeight: 500 }}
                  >
                    {s.label} ↗
                  </a>
                ))}
              </div>
              El asistente responde sobre el marco regulatorio de la ARN, legislación nuclear y normas técnicas vigentes en Argentina.
            </div>
          </div>

          <div style={{ padding: "1.1rem 1rem" }}>
            <div style={{ fontSize: ".62rem", letterSpacing: ".13em", textTransform: "uppercase", color: "#0090ab", marginBottom: ".7rem", fontWeight: 500 }}>
              Acciones
            </div>
            <button onClick={clearChat} style={{ width: "100%", background: "transparent", border: "1px solid rgba(238,244,248,.07)", borderRadius: 6, color: "rgba(238,244,248,.65)", fontFamily: "'DM Sans', sans-serif", fontSize: ".79rem", fontWeight: 300, padding: "8px 10px", textAlign: "left", cursor: "pointer", transition: "all .18s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,200,232,.07)"; e.currentTarget.style.color = "#eef4f8"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(238,244,248,.65)"; }}>
              🗑 &nbsp;Limpiar conversación
            </button>
          </div>
        </aside>

        {/* CHAT */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
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
              <div style={{ maxWidth: 580, margin: "0.5rem auto", textAlign: "center" }}>
                <div style={{ margin: "0 auto 1.25rem", width: 70, height: 70 }}>
                  <svg viewBox="0 0 70 70" fill="none" width="70" height="70">
                    <circle cx="35" cy="35" r="7" fill="#00c8e8" />
                    <ellipse cx="35" cy="35" rx="31" ry="12" stroke="#00c8e8" strokeWidth="1.4" fill="none" transform="rotate(-40 35 35)" opacity=".38" />
                    <ellipse cx="35" cy="35" rx="31" ry="12" stroke="#00c8e8" strokeWidth="1.4" fill="none" transform="rotate(40 35 35)" opacity=".38" />
                    <ellipse cx="35" cy="35" rx="31" ry="12" stroke="#e8c84a" strokeWidth="1.3" fill="none" opacity=".28" />
                    {reducedMotion && (
                      <>
                        <circle cx="35" cy="23" r="4" fill="#e8c84a" opacity=".9" />
                        <circle cx="52" cy="42" r="4" fill="#00c8e8" opacity=".9" />
                        <circle cx="18" cy="42" r="4" fill="#00c8e8" opacity=".9" />
                      </>
                    )}
                    {!reducedMotion && (
                      <>
                        <circle r="4" fill="#e8c84a" opacity=".9">
                          <animateMotion dur="5.5s" repeatCount="indefinite" path="M 66,35 A 31,12 0 1,1 4,35 A 31,12 0 1,1 66,35" />
                        </circle>
                        <g transform="rotate(-40 35 35)">
                          <circle r="4" fill="#00c8e8" opacity=".9">
                            <animateMotion dur="5s" begin="-2.2s" repeatCount="indefinite" path="M 66,35 A 31,12 0 1,1 4,35 A 31,12 0 1,1 66,35" />
                          </circle>
                        </g>
                        <g transform="rotate(40 35 35)">
                          <circle r="4" fill="#00c8e8" opacity=".9">
                            <animateMotion dur="6s" begin="-1s" repeatCount="indefinite" path="M 66,35 A 31,12 0 1,1 4,35 A 31,12 0 1,1 66,35" />
                          </circle>
                        </g>
                      </>
                    )}
                  </svg>
                </div>
                <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "2.3rem", fontWeight: 700, letterSpacing: "-.01em", lineHeight: 1.15, marginBottom: ".65rem" }}>
                  <span style={{ color: "#eef4f8" }}>norma</span>
                  <span style={{ color: "#eef4f8", fontSize: "50%" }}>-</span>
                  <span style={{ color: "#00c8e8" }}>ar</span>
                </h2>
                <p style={{ fontSize: ".85rem", color: "rgba(238,244,248,.65)", lineHeight: 1.75, marginBottom: "1.4rem" }}>
                  Hacé preguntas sobre legislación nuclear, normas ARN,<br />protección radiológica, licencias, residuos y tratados internacionales.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7, justifyContent: "center" }}>
                  {CHIPS.map(c => (
                    <button key={c.text} onClick={() => sendMsg(c.q)} style={{ background: "rgba(238,244,248,.1)", border: "1px solid rgba(0,200,232,.18)", borderRadius: 20, padding: "5px 14px", fontSize: ".76rem", color: "rgba(238,244,248,.65)", cursor: "pointer", transition: "all .18s", fontFamily: "'DM Sans', sans-serif" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,200,232,.07)"; e.currentTarget.style.borderColor = "#00c8e8"; e.currentTarget.style.color = "#eef4f8"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(238,244,248,.1)"; e.currentTarget.style.borderColor = "rgba(0,200,232,.18)"; e.currentTarget.style.color = "rgba(238,244,248,.65)"; }}>
                      {c.text}
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
                          fontSize: ".68rem", color: "#e8c84a", background: "rgba(232,200,74,.08)",
                          border: "1px solid rgba(232,200,74,.25)", borderRadius: 20, padding: "2px 11px",
                          letterSpacing: ".01em", fontFamily: "'DM Sans', sans-serif",
                        }}>
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                  <div style={{ fontSize: ".63rem", color: "rgba(238,244,248,.28)", marginTop: 3, textAlign: msg.role === "user" ? "right" : "left" }}>
                    {msg.time}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* INPUT */}
          <div style={{ padding: ".9rem 2.25rem 1.25rem", background: "#080f1e", borderTop: "1px solid rgba(238,244,248,.07)" }}>
            <div style={{ display: "flex", gap: 8, background: "#152540", border: "1px solid rgba(0,200,232,.18)", borderRadius: 10, padding: "7px 7px 7px 15px" }}>
              <textarea
                ref={inpRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Consultá sobre normativa nuclear argentina..."
                rows={1}
                aria-label="Escribí tu consulta"
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#eef4f8", fontFamily: "'DM Sans', sans-serif", fontSize: ".87rem", fontWeight: 300, resize: "none", height: 42, maxHeight: MAX_TEXTAREA_HEIGHT, overflowY: "auto", lineHeight: 1.5, padding: "6px 0" }}
              />
              {busy ? (
                <button
                  onClick={stopGeneration}
                  title="Detener generación"
                  aria-label="Detener generación"
                  style={{ width: 38, height: 38, background: "rgba(255,144,144,.15)", border: "1px solid rgba(255,144,144,.35)", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, alignSelf: "flex-end", transition: "all .18s" }}>
                  <span style={{ width: 11, height: 11, background: "#ff9090", borderRadius: 2, display: "inline-block" }} />
                </button>
              ) : (
                <button
                  onClick={() => sendMsg()}
                  disabled={!input.trim()}
                  aria-label="Enviar mensaje"
                  style={{ width: 38, height: 38, background: !input.trim() ? "rgba(0,200,232,.2)" : "#00c8e8", border: "none", borderRadius: 6, cursor: !input.trim() ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, alignSelf: "flex-end", transition: "all .18s" }}>
                  <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                    <path d="M15.5 8.5L1.5 1.5l3.2 7-3.2 7 14-7z" fill="#08101e" stroke="#08101e" strokeWidth=".5" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
            </div>
            <div style={{ fontSize: ".66rem", color: "rgba(238,244,248,.22)", textAlign: "center", marginTop: 5 }}>
              Enter para enviar &nbsp;·&nbsp; Shift+Enter para nueva línea{busy ? " · Generando…" : ""}
            </div>
          </div>
        </div>
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

        /* ── FOCO DE TECLADO ── */
        button:focus-visible, a:focus-visible, textarea:focus-visible {
          outline: 2px solid #00c8e8;
          outline-offset: 2px;
          border-radius: 4px;
        }

        /* ── MOBILE ── */
        @media (max-width: 640px) {
          .mob-menu { display: flex !important; }
          .sidebar {
            position: fixed !important;
            top: 68px; left: 0; bottom: 0;
            z-index: 100;
            transform: translateX(-100%);
            transition: transform .25s ease;
            width: 80vw !important;
            max-width: 300px;
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
