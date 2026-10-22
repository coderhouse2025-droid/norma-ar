## norma-ar

Asistente inteligente basado en arquitectura RAG para la consulta y trazabilidad de la normativa nuclear argentina

<img width="1672" height="940" alt="Banner" src="https://github.com/user-attachments/assets/5ef22f81-cf0f-4ff8-a1ec-3f856981b5ba" />


[![Demo en vivo](https://img.shields.io/badge/Demo-Live-brightgreen?style=for-the-badge)](https://norma-ar.vercel.app)
[![RAG](https://img.shields.io/badge/Arquitectura-RAG-blueviolet?style=for-the-badge)](#️-arquitectura-rag)
[![GPT-OSS 120B](https://img.shields.io/badge/LLM-GPT--OSS_120B-orange?style=for-the-badge)](#3-openai-gpt-oss-120b-vía-groq--no-gpt-4-no-claude)

> Consultá legislación, normas y guías regulatorias de la ARN, protección radiológica y tratados internacionales en lenguaje natural, con la fuente a la vista.

🔗 **Demo:** https://norma-ar.vercel.app

🎬 **Video de presentación:** https://youtu.be/PnOKb8TFxds

**Proyecto integrador** — Especialización en Seguridad Nuclear
**Autor:** Juan Manuel Orellana · **Tutor:** _(a completar)_
**Versión:** `v1.0-tfi` (versión congelada para el trabajo integrador, 17/10/2026; conteos de documentos actualizados el 22/10/2026)

---

## 📋 Índice

- [Proyecto integrador](#-proyecto-integrador)
  - [Título](#título)
  - [Tema, problemática y contexto](#tema-problemática-y-contexto)
  - [Usuarios](#usuarios)
  - [Objetivos](#objetivos)
  - [Metodología](#metodología)
  - [Resultados esperados](#resultados-esperados)
  - [Integración de conocimientos](#integración-de-conocimientos)
- [Descripción del producto](#-descripción-del-producto)
- [Base de conocimiento](#-base-de-conocimiento)
- [Decisiones técnicas y su justificación](#-decisiones-técnicas-y-su-justificación)
- [Arquitectura RAG](#️-arquitectura-rag)
- [Pipeline de datos](#-pipeline-de-datos-de-documentos-oficiales-a-base-de-conocimiento-indexada)
- [Evaluación preliminar](#-evaluación-preliminar)
- [Limitaciones y riesgos](#️-limitaciones-y-riesgos)
- [¿Por qué este camino y no otro?](#-por-qué-este-camino-y-no-otro)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Variables de entorno](#️-variables-de-entorno)
- [Instalación local](#️-instalación-local)
- [Implementado recientemente](#-implementado-recientemente)
- [Roadmap](#-roadmap)
- [Bibliografía](#-bibliografía)

---

## 🎓 Proyecto integrador

### Título

**Desarrollo de un asistente inteligente basado en arquitectura RAG para la consulta y trazabilidad de la normativa nuclear argentina como herramienta de apoyo a la gestión de la Seguridad Nuclear.**

### Tema, problemática y contexto

La normativa nuclear argentina está compuesta por leyes, decretos, normas regulatorias de la Autoridad Regulatoria Nuclear (ARN), guías regulatorias y tratados internacionales. Toda es pública, pero está dispersa en documentos extensos y heterogéneos, con nomenclatura propia (AR X.X.X) y relaciones entre sí que no siempre son evidentes: por ejemplo, cada guía regulatoria se vincula a una norma determinada. Localizar el requisito aplicable a un caso concreto, y saber de qué documento surge, insume tiempo y exige conocer la estructura del marco regulatorio.

En paralelo, la inteligencia artificial generativa se está explorando como apoyo a la actividad regulatoria y a la gestión de la seguridad, pero los modelos de lenguaje usados solos pueden producir respuestas que suenan correctas y no lo son. En un dominio donde la fuente importa, el problema no es solo responder, sino **responder con trazabilidad**: indicar de qué documento surge lo que se afirma, para que el usuario pueda verificarlo.

Este proyecto propone un prototipo que combina un modelo de lenguaje con búsqueda semántica sobre documentos oficiales (RAG), y estudia hasta qué punto esa combinación sirve como herramienta de apoyo para consultar la normativa — y cuáles son sus límites.

### Usuarios

- Operadores de instalaciones nucleares y radiactivas.
- Personal técnico y responsables de protección radiológica.
- Establecimientos de salud que utilizan radiaciones ionizantes.
- Transportistas y gestores de residuos radiactivos.
- Organismos de regulación y control.
- Universidades, docentes y estudiantes.
- Consultoras y auditoras del sector.

### Objetivos

**Objetivo general:** desarrollar y evaluar un prototipo de asistente basado en arquitectura RAG que permita consultar en lenguaje natural la normativa nuclear argentina, identificando en cada respuesta los documentos fuente, como herramienta de apoyo a la gestión de la Seguridad Nuclear.

**Objetivos específicos:**

1. Relevar el estado de uso de la inteligencia artificial en organismos reguladores nucleares de otros países.
2. Identificar y organizar las fuentes normativas oficiales aplicables.
3. Construir una base de conocimiento a partir de esas fuentes.
4. Implementar un asistente RAG que responda con identificación de las fuentes utilizadas.
5. Evaluar la calidad, relevancia y trazabilidad de las respuestas.
6. Analizar las limitaciones y riesgos del enfoque, y la necesidad de verificar siempre la fuente original.

> Estado de cada objetivo: ver la sección [Evaluación preliminar](#-evaluación-preliminar) y el [Roadmap](#-roadmap). El relevamiento internacional (objetivo 1) se desarrolla en el documento del proyecto integrador y se apoya en las referencias de la [Bibliografía](#-bibliografía).

### Metodología

1. **Relevamiento** del uso de IA en reguladores nucleares y de la arquitectura RAG.
2. **Identificación de fuentes** oficiales (ARN, normativa nacional, tratados) y de la relación entre normas y guías.
3. **Preparación de los documentos**: extracción de texto, OCR cuando el PDF es una imagen, limpieza y fragmentación.
4. **Indexación** en una base de datos vectorial, conservando el nombre del documento de origen.
5. **Implementación** del asistente: recuperación de fragmentos relevantes, generación de la respuesta con un modelo de lenguaje y presentación de las fuentes.
6. **Evaluación** con un cuestionario de preguntas representativas, revisando cada respuesta contra el documento original.
7. **Análisis** de limitaciones, riesgos y mejoras.

### Resultados esperados

- Un **prototipo funcional** accesible en línea ([norma-ar.vercel.app](https://norma-ar.vercel.app)).
- Un **análisis de su desempeño y limitaciones** (secciones [Evaluación preliminar](#-evaluación-preliminar) y [Limitaciones y riesgos](#️-limitaciones-y-riesgos)).

El asistente es una **herramienta de apoyo a la consulta**. No reemplaza a la norma original ni al criterio profesional, y toda respuesta debe contrastarse con el documento oficial antes de usarse para una decisión técnica o legal.

### Integración de conocimientos

El proyecto integra conocimientos del marco regulatorio nuclear (la Ley 24.804, las normas y guías de la ARN y los instrumentos internacionales), de la gestión de la seguridad y de la protección radiológica, con herramientas de ciencia de datos e inteligencia artificial (procesamiento de documentos, embeddings, búsqueda semántica y modelos de lenguaje). La parte regulatoria define qué se debe responder y con qué fuente; la parte técnica define cómo se recupera y se presenta.

---

## 📊 Descripción del producto

Este chatbot responde consultas técnicas y jurídicas sobre la normativa nuclear argentina: legislación vigente, normas y guías regulatorias de la ARN, protección radiológica, licencias, residuos radiactivos y tratados internacionales.

Las respuestas se generan combinando un modelo de lenguaje (GPT-OSS 120B, corriendo en la infraestructura de Groq) con búsqueda semántica sobre documentos oficiales indexados — una arquitectura conocida como **RAG (Retrieval-Augmented Generation)**. Cada respuesta cita los documentos en los que se basó, mostrados como etiquetas separadas debajo del texto: **doradas** para normas y leyes, **celestes** para guías regulatorias.

<img width="1024" height="1536" alt="ChatGPT Image 22 ago 2026, 01_28_32 p m" src="https://github.com/user-attachments/assets/0355da97-d466-44f8-a539-afe032ef6c6d" />

### Normas y guías: una distinción que el asistente respeta

Las **guías regulatorias** de la ARN son documentos de carácter orientativo que contienen recomendaciones para cumplir con los requisitos de las normas regulatorias vinculadas ([fuente oficial](https://www.argentina.gob.ar/node/116802)). No son la norma. Por eso el asistente:

- explica primero el requisito de la norma y después, si corresponde, lo que recomienda la guía;
- aclara que la guía es orientativa;
- cita ambos documentos en las etiquetas finales y no atribuye a la norma lo que dice la guía.

Cada fragmento de guía se indexa con un encabezado que la vincula a su norma (por ejemplo, la guía AR 10 con la norma AR 0.11.1), para que la recuperación encuentre la guía cuando la consulta es sobre la norma.

---

## 🔐 Base de conocimiento

La base de conocimiento se cuenta en tres niveles, que no deben confundirse:

- **2.067 registros** (fragmentos) en el índice vectorial.
- **87 entradas de fuente** (`source`) distintas en el índice. Algunas guías y documentos están cargados en varias entradas (por ejemplo, la guía AR 1 en secciones y la Tabla 1 de la AR 6 como entrada propia).
- **83 documentos fuente** originales (PDF), sin contar esas entradas adicionales.

Cifras según el inventario de fuentes (`inventario_fuentes.py`) del 22/10/2026, tras cargar la revisión 2 de la norma AR 10.13.1 y la selección de la Tabla 1 de la guía AR 6 (5 fragmentos). Para el número exacto en otro momento, volver a correr el inventario.

| Categoría | Documentos fuente | Registros |
|-----------|------------------:|----------:|
| Normas regulatorias de la ARN | 64 | 1.654 |
| Guías regulatorias de la ARN | 10 (14 entradas) | 154 |
| Leyes y decretos | 2 | 105 |
| Tratados y acuerdos internacionales | 4 | 82 |
| Artículo del Boletín del OIEA (3/1994) | 1 | 15 |
| Información institucional (CNEA, INVAP) | 2 | 57 |
| **Total** | **83** | **2.067** |

Los dos documentos institucionales (CNEA e INVAP) contienen información básica sobre cada organismo, tomada del sitio oficial www.argentina.gob.ar. Son contexto general, no normativa.

**Cobertura de normas:** las 64 normas vigentes que lista la página oficial de la ARN coinciden una a una (número y revisión) con las 64 normas cargadas. La coincidencia se verificó por número y revisión de cada documento, no comparando su texto. Las guías y los demás documentos no están cubiertos por esa lista.

| Origen | Contenido |
|--------|-----------|
| Normativa nacional | Ley 24.804 y decretos reglamentarios, normas regulatorias de la ARN (cargadas en la primera etapa). La norma AR 10.13.1 está en su revisión 2, aprobada por la Resolución ARN 89/26 (Boletín Oficial del 17/04/2026), cargada como actualización |
| Guías regulatorias de la ARN | 10 guías: AR 1, 3, 4, 5, 6, 7, 8, 10, 13 y 14, más secciones específicas de la AR 1 y una selección de la Tabla 1 de la AR 6 (ver abajo) |
| Tratados y acuerdos internacionales | TNP (Tratado sobre la No Proliferación de las Armas Nucleares), Tratado de Tlatelolco, acuerdos de salvaguardias con el OIEA (INFCIRC/435), acuerdo bilateral Argentina-Brasil (ABACC) y un artículo del Boletín del OIEA (3/1994) |

**Guías incorporadas y norma a la que se asocian** (según la página oficial de la ARN):

| Guía | Revisión | Norma asociada |
|------|----------|----------------|
| AR 1 | 2 | AR 10.1.1 rev. 4 |
| AR 3 | 0 | AR 0.11.2 rev. 2 |
| AR 4 | 0 | AR 4.2.2 rev. 1 |
| AR 5 | 1 | AR 7.11.1 rev. 4 |
| AR 6 | 1 | AR 10.1.1 rev. 4 |
| AR 7 | 0 | AR 4.2.1 rev. 1 |
| AR 8 | 1 | AR 10.1.1 rev. 4 |
| AR 10 | 0 | AR 0.11.1 rev. 3 |
| AR 13 | 0 | AR 10.12.1 rev. 3 |
| AR 14 | 0 | AR 10.1.1 rev. 4 |

**Cómo se indexó lo que se agregó después de la primera etapa**

- **Tratados, indexados por artículo.** Cada artículo (o cada protocolo) es un fragmento con un encabezado que dice a qué documento pertenece. Para los protocolos adicionales se agrega una nota que aclara que obligan a quienes los firman y no son obligaciones de las Partes del Tratado. Esto permite que el asistente cite el artículo correcto y no mezcle tratado con protocolo.
- **Guía AR 1, secciones específicas.** Solo se indexaron las secciones C.3 a C.5 (niveles guía en alimentos, agua potable, etc.), divididas en tres documentos con títulos explícitos para que un fragmento no mezcle, por ejemplo, el Cs-137 en agua con el Cs-137 en alimentos. Las más de 140 páginas de tablas de coeficientes de dosis de esa guía **no están indexadas**.
- **Guía AR 6, Anexo E, Tabla 1 (selección).** La Tabla 1 (niveles genéricos de exención) viene en el PDF como imágenes, sin texto. Se transcribió una **selección de 63 radionucleidos de uso frecuente**, y la transcripción fue verificada fila por fila contra el original por el autor. No se usó OCR para los valores, porque lee mal los exponentes. El documento indexado aclara que es una selección y remite a la tabla completa para cualquier otro radionucleido. El resto de la tabla **no está disponible** en el asistente.

Todos los registros están en un único *namespace* (`normativa-nuclear`) del índice `normativa-nuclear`.

Para temas que no están en el índice, el asistente puede responder con conocimiento general del modelo, pero el prompt le indica que lo señale como tal y que no cite ninguna fuente que no haya recibido.

> **Cobertura pendiente:** el CTBT (Tratado de Prohibición Completa de los Ensayos Nucleares) no está indexado. Tampoco se verificó una por una que todas las normas de la serie estén en su última revisión.

---

## 🧠 Decisiones técnicas y su justificación

### 1. React + Vite — no Next.js, no CRA

**¿Por qué React?**

El frontend de un chatbot es una SPA con un único estado central: el historial de mensajes. React es la elección natural para manejar ese estado reactivo y renderizar la lista de mensajes a medida que llegan. La alternativa más cercana sería Vue 3, igualmente válida; React se eligió por su ecosistema más amplio y la familiaridad del equipo.

**¿Por qué Vite y no Create React App?**

CRA fue deprecado oficialmente por el equipo de React en 2023. Vite es el estándar actual para nuevos proyectos: el servidor de desarrollo arranca rápido, el HMR es prácticamente instantáneo, y el build de producción usa Rollup. Para un proyecto que se despliega en Vercel, la velocidad del build impacta directamente en los tiempos de CI/CD.

**¿Por qué no Next.js?**

Next.js hubiera sido la elección correcta si la app necesitara SSR para SEO, rutas múltiples, o middleware de autenticación. Un chatbot de consulta técnica no tiene páginas que indexar en Google (el contenido es dinámico, generado en runtime). Next.js hubiera añadido complejidad sin valor para este caso.

---

### 2. Pinecone — no Chroma, no pgvector, no Weaviate

**¿Por qué una base de datos vectorial?**

La búsqueda semántica es el corazón de la arquitectura RAG. Cuando el usuario pregunta "¿qué dice la norma sobre dosis máxima en trabajadores?", el sistema necesita encontrar los fragmentos de texto más *semánticamente similares* a esa pregunta, no los que contienen exactamente esas palabras. Eso requiere comparar vectores de alta dimensión (embeddings) de forma eficiente — lo que hace una base de datos vectorial.

**¿Por qué Pinecone específicamente?**

| Opción | Tipo | Pros | Contras para este caso |
|--------|------|------|----------------------|
| **Pinecone** | Cloud managed | Sin infra, alta disponibilidad, plan gratuito, embeddings integrados | Vendor externo |
| Chroma | Local / self-hosted | Open source, sin costo | Requiere servidor propio para producción |
| pgvector | Extensión PostgreSQL | Integra con BD existente | Necesita servidor PostgreSQL, más setup |
| Weaviate | Cloud / self-hosted | Muy potente, multimodal | Más complejo de configurar para este scope |

Para un proyecto desplegado en Vercel (serverless, sin estado persistente entre invocaciones), Pinecone es la única opción de las anteriores que no requiere gestionar una conexión a servidor propio. Las funciones serverless son stateless por definición — Pinecone resuelve el problema de persistencia de los vectores de forma nativa.

**Plan gratuito (Starter):** según el panel de Pinecone del proyecto, ofrece 2 GB de almacenamiento, 1 M de *read units* y 2 M de *write units* por mes. Con 2.067 registros el almacenamiento no es una restricción; el límite que sí se encontró en la práctica es el de *embeddings por minuto* (ver [Pipeline de datos](#-pipeline-de-datos-de-documentos-oficiales-a-base-de-conocimiento-indexada)). Los límites del plan pueden cambiar; conviene consultar el panel.

---

### 3. OpenAI GPT-OSS 120B vía Groq — no GPT-4, no Claude

> **Nota de mantenimiento (agosto 2026):** este proyecto usaba originalmente **LLaMA 3.3 70B**. Groq anunció la baja de ese modelo (junto con LLaMA 3.1 8B Instant) en junio de 2026 y recomendó migrar a `openai/gpt-oss-120b` o `qwen/qwen3.6-27b`. Si en algún momento el chatbot empieza a responder "No se pudo generar la respuesta" en producción, lo primero que hay que revisar son los **Logs** del proyecto en Vercel: si ahí aparece un error 404 de Groq mencionando el modelo, es señal de que volvió a pasar lo mismo y hay que actualizar el nombre del modelo en `api/chat.js`.

**¿Por qué un LLM open-weights?**

GPT-OSS 120B es un modelo de lenguaje de pesos abiertos publicado por OpenAI, disponible vía la API de Groq. Esto significa que puede ejecutarse en infraestructura de terceros sin depender de un único proveedor cerrado. Para un sistema de consulta sobre documentación oficial del Estado argentino, la independencia de proveedor sigue siendo un criterio técnico relevante.

**¿Por qué Groq como proveedor de inferencia?**

Groq utiliza hardware especializado (LPU — Language Processing Unit) optimizado para inferencia de LLMs. La velocidad es la base que permite que las respuestas lleguen en **streaming** (el texto aparece progresivamente en pantalla). Además, Groq ofrece un plan gratuito con límites diarios y por minuto, suficiente para un prototipo.

**¿Por qué no GPT-4 o Claude directamente?**

Ambos podrían entregar respuestas de calidad igual o mayor en muchos casos. La decisión es de arquitectura y costo: con RAG, cada consulta envía al modelo los fragmentos recuperados + la pregunta + el historial, lo que puede sumar miles de tokens por request. A escala de uso real sin financiamiento, ese costo sería más difícil de sostener que el plan gratuito de Groq.

**Un detalle operativo:** GPT-OSS es un modelo con razonamiento, y los tokens de razonamiento cuentan dentro del límite de salida. Con un límite bajo, la respuesta puede cortarse antes de terminar (ocurrió durante las pruebas). El límite actual es `max_tokens: 2000` (se bajó desde 3000 para no superar el tope de tokens por minuto de Groq, ver [Limitaciones](#️-limitaciones-y-riesgos)), la temperatura es 0,2 para respuestas más estables, y el prompt pide respuestas concisas (alrededor de 350 palabras).

---

### 4. llama-text-embed-v2 (NVIDIA Research) — embeddings alojados en Pinecone

**¿Qué son los embeddings y por qué importa el modelo?**

Un embedding es una representación numérica (vector) del significado semántico de un texto. El mismo modelo debe usarse para vectorizar los documentos al indexar Y para vectorizar la pregunta del usuario al buscar — de lo contrario, los vectores no son comparables.

**¿Cómo se usa en este proyecto?**

Se usa la *inferencia integrada* de Pinecone: el índice está asociado al modelo `llama-text-embed-v2`, y Pinecone genera los embeddings tanto al cargar los textos como al recibir la consulta (`inputs.text`). La aplicación no llama a ningún servicio de embeddings aparte, ni lo hace a través de Groq.

Según la documentación de Pinecone, es un modelo desarrollado por NVIDIA Research, basado en Llama 3.2 1B, con entrada máxima de 2.048 tokens y dimensiones configurables (1024, 2048, 768, 512 o 384), compatible con métricas coseno y producto punto. Con fragmentos de ~550 tokens, el límite de entrada no trunca ningún chunk.

---

### 5. Vercel — no Netlify, no Railway, no VPS

**¿Por qué Vercel?**

El frontend es React y el backend es una función serverless en `/api/chat.js`. Vercel integra bien este patrón: se despliegan ambas capas desde el mismo repositorio en un solo `git push`. Las funciones en `/api` se convierten automáticamente en Serverless Functions con las variables de entorno disponibles en runtime, sin gestionar un servidor Express ni un contenedor.

> **Nota práctica:** la conexión entre el repo de GitHub y el proyecto de Vercel es lo que dispara el deploy automático en cada `git push`. Si un commit no genera un deploy nuevo, conviene revisar Settings → Git en Vercel — esa conexión se puede romper (por ejemplo, si se revocan permisos de la GitHub App).

> **Nota práctica 2:** al cambiar una variable de entorno en Vercel hay que **redeployar** para que tome efecto. Si el chat falla con 401, revisar en los Logs si el error viene de Pinecone o de Groq: son dos keys distintas.

---

### 6. Rate limiting y validación de entrada — por qué son necesarios en un endpoint público

**¿Por qué no dejar `/api/chat` abierto sin más?**

El endpoint le pega a dos APIs (Groq y Pinecone). Sin ningún control, cualquiera con la URL puede mandar tráfico ilimitado y consumir la cuota gratuita.

**¿Qué se implementó?**

Un límite de solicitudes por IP (en memoria, dentro de la función serverless) y validación del contenido de cada request: cantidad máxima de mensajes en el historial, longitud máxima por mensaje y formato esperado. Los errores internos se registran en los logs del servidor, pero al usuario le llega un mensaje genérico, para no exponer detalles internos.

**Limitación conocida:** como el rate limiting vive en la memoria de cada instancia serverless, no es un límite garantizado a nivel global. Si hubiera abuso real, la solución de fondo es un almacenamiento compartido como Upstash Redis o Vercel KV.

---

## 🏗️ Arquitectura RAG

RAG (Retrieval-Augmented Generation) es el patrón que permite que el LLM responda con información específica que no estaba en su entrenamiento (Lewis et al., 2020). El flujo completo:

```
┌─────────────────────────────────────────────────────────────────┐
│  FASE DE INDEXACIÓN (offline)                                   │
│                                                                 │
│  Documentos PDF oficiales (normas, guías, leyes, tratados)      │
│       ↓                                                         │
│  Extracción de texto (+ OCR si el PDF es una imagen)            │
│       ↓                                                         │
│  Limpieza y chunking (fragmentos con overlap)                   │
│       ↓                                                         │
│  Pinecone genera los embeddings (llama-text-embed-v2)           │
│       ↓                                                         │
│  Registros en Pinecone: { source, text }                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  FASE DE CONSULTA (en tiempo real, por cada pregunta)           │
│                                                                 │
│  Pregunta del usuario                                           │
│       ↓                                                         │
│  Búsqueda semántica en Pinecone (top_k = 6 fragmentos)          │
│       ↓                                                         │
│  Construcción del prompt:                                       │
│  [Sistema] + [Fragmentos] + [Últimos 4 mensajes] + [Pregunta]│
│       ↓                                                         │
│  GPT-OSS 120B vía Groq genera la respuesta, en streaming        │
│       ↓                                                         │
│  Respuesta con fuentes citadas, mostradas como etiquetas        │
└─────────────────────────────────────────────────────────────────┘
```

**¿Por qué RAG y no fine-tuning?**

El fine-tuning consiste en reentrenar el modelo con la documentación. Es costoso, lento de iterar y hay que repetirlo cada vez que cambia la normativa. Con RAG se actualiza el conocimiento modificando solo la base vectorial: agregar un documento es indexarlo. Esto se comprobó al incorporar las guías regulatorias, sin tocar el modelo. Además, RAG permite mostrar de dónde sale cada respuesta, requisito central para este dominio.

**Reglas del prompt del sistema**

El prompt (en `src/App.jsx`) fija el comportamiento del asistente. Las reglas más relevantes para la trazabilidad:

- Citar al final, entre corchetes, solo los documentos efectivamente recibidos; sin número de página (no existe en el índice).
- No inventar el tercer nivel de numeración de una norma ARN si no se tiene certeza.
- **No dar valores numéricos que no estén en los documentos recibidos**: si no aparecen, decir que no figuran en la documentación consultada y remitir a la norma o guía.
- No usar ejemplos "de memoria"; distinguir lo que sale de los documentos de lo que es conocimiento general.
- No afirmar fechas, siglas ni nombres de organismos sin certeza.
- Distinguir norma de guía (ver [arriba](#normas-y-guías-una-distinción-que-el-asistente-respeta)).
- Sin fórmulas en LaTeX (la interfaz no las renderiza): fórmulas en texto plano.

El backend, además, agrega al contexto recuperado una instrucción que refuerza la regla de normas y guías.

**Sobre las citas de fuente**

El formato de cita es reconocido por la interfaz, que lo convierte en etiqueta visual. Esto es más frágil de lo que parece: un modelo puede citar con seguridad un número de norma que no recuerda bien. Las reglas anteriores reducen ese riesgo, pero no lo eliminan; las citas orientan la verificación y no la reemplazan.

---

## 🔄 Pipeline de datos: de documentos oficiales a base de conocimiento indexada

Es el proceso que más impacta la calidad de las respuestas.

### El dataset fuente: documentos oficiales con problemas reales

Los documentos provienen de fuentes oficiales (argentina.gob.ar, ARN) y presentan problemas de calidad.

---

#### Problema 1: PDFs escaneados sin texto seleccionable

Algunas normas están publicadas como imágenes escaneadas, sin texto.

**Transformación aplicada:** OCR previo a la indexación. En la etapa de normas se hizo con revisión manual de los fragmentos más densos (fórmulas, tablas de dosis); en la etapa de guías el script aplica OCR (Tesseract) solo a las páginas con poco texto, según un umbral configurable.

**¿Por qué importa la revisión?** El OCR en documentos técnicos comete errores específicos: confunde `0` con `O` y `1` con `l`, y puede alterar siglas (`CNEA`, `OIEA`, `ARN`) o, peor, **cifras de una tabla**. Un número mal reconocido es un error silencioso; por eso lo extraído por OCR debe revisarse contra el PDF.

---

#### Problema 2: Estructura de los PDFs que no respeta secciones lógicas

Un extractor ingenuo mezcla columnas, tablas y notas al pie.

```
❌ Texto extraído sin procesamiento:
"Artículo 3 — Los titulares de licencia 2.3 Dosis equivalente
deberán mantener registros de 20 mSv anuales promediados
las dosis recibidas por..."    en 5 años consecutivos"

✅ Texto después de limpieza estructural:
"Artículo 3 — Los titulares de licencia deberán mantener
registros de las dosis recibidas por..."
```

**Transformación aplicada:** detección y corrección de columnas entrelazadas por posición de los bloques de texto.

**Tablas numéricas (guías):** las páginas que son casi puras tablas generan fragmentos de poco valor semántico. El script de guías puede descartarlas (`--descartar-tablas`, criterio: proporción de letras sobre caracteres no blancos menor a 0,45). El costo es real: **se descartan también tablas con valores que el usuario puede necesitar** (ver [Evaluación preliminar](#-evaluación-preliminar)). Aparte, hay tablas que ni siquiera tienen texto porque el PDF las trae como imágenes (caso de la Tabla 1 de la guía AR 6); ahí el filtro no interviene y el problema se resolvió de otra forma (Problema 7).

---

#### Problema 3: Chunking — el trade-off entre contexto y precisión

**¿Por qué no indexar el documento completo?** Un documento de 50 páginas comprimido en un vector captura el tema general, pero no recupera con precisión una cláusula específica.

**¿Por qué no indexar por oración?** Una oración aislada pierde el contexto. "El límite es de 20 mSv" sin saber a quién aplica es incompleto y potencialmente peligroso de citar.

**Estrategia:** fragmentos de ~500 tokens con solapamiento. En la primera etapa (normas) el solapamiento fue de 100 tokens. En la etapa de guías se usaron fragmentos de ~2.300 caracteres (≈550 tokens) con 400 caracteres de solapamiento, cortando en límites de oración, y con un **encabezado en cada fragmento** que identifica la guía y la norma a la que se asocia.

```
Documento:  [===Chunk1===][===Chunk2===][===Chunk3===]
Con overlap: [==Chunk1==][Chunk1|Chunk2][==Chunk2==][Chunk2|Chunk3][==Chunk3==]
```

---

#### Problema 4: Metadata — hacer el vector trazable

Hoy cada registro guarda solo dos campos:

```json
{
  "source": "GUÍA AR 10 rev 0 - <título corto>",
  "text": "Guía Regulatoria AR 10 (revisión 0): <título>. Esta Guía Regulatoria contiene información asociada a la Norma Regulatoria AR 0.11.1 (revisión 3). ...(fragmento)..."
}
```

En la primera etapa, `source` es el nombre del archivo (por ejemplo `18.2. TRATADO DE TLATELOLCO.pdf`); en las guías, un rótulo que empieza con `GUÍA AR n rev r`. La interfaz usa ese prefijo para pintar la etiqueta celeste.

**¿Por qué es crítica la metadata?** Sin ella, el chatbot podría dar una respuesta correcta sin poder decir de dónde viene. En contexto regulatorio, una respuesta sin fuente no tiene valor profesional.

**Limitación conocida: no hay número de página.** El esquema planeado incluía `titulo`, `seccion`, `pagina` y `fecha_vigencia`, pero el índice solo guarda `source` y `text` (confirmado en el dashboard de Pinecone). Las citas indican el documento, **nunca la página**, y el prompt le indica al modelo que no la incluya. Agregarla requiere reconstruir el pipeline de indexación.

---

#### Problema 5: Normalización terminológica

| Variante encontrada | Término normalizado |
|--------------------|---------------------|
| `O.I.E.A.` / `OIEA` / `AIEA` | `OIEA` |
| `A.R.N.` / `ARN` / `Autoridad Regulatoria` | `ARN` |
| `C.N.E.A.` / `CNEA` | `CNEA` |
| `mSv` / `mSievert` / `milisievert` | `mSv` |
| `Bq` / `Becquerel` / `becquerel` | `Bq` |

**Transformación aplicada:** diccionario de normalización en el pre-procesamiento, para que búsquedas con cualquier variante encuentren los mismos fragmentos.

---

#### Problema 6: Cómo agregar documentos sin romper lo existente (incorporación de las guías)

Las guías se sumaron con un script propio (`indexar_guias.py`) con estas propiedades:

- **Aditivo:** no borra ni modifica los registros anteriores.
- **IDs determinísticos** (`guia-ar-<n>#chunk<k>`): volver a correrlo reemplaza los mismos registros en lugar de duplicarlos. Atención: pasar de una corrida con filtro de tablas a una sin filtro reemplaza los IDs existentes y agrega los nuevos; en el sentido inverso quedan fragmentos viejos sin reemplazar.
- **Modo `--dry-run`** que muestra cuántos fragmentos generaría y de qué guía, sin tocar Pinecone.
- **Carga con control de ritmo:** el índice rechazó una primera carga con error 429 (*RESOURCE_EXHAUSTED*) por superar el límite de tokens de embedding por minuto (250.000 para `llama-text-embed-v2`, compartido por todo el proyecto de Pinecone). Se resolvió con lotes chicos, un tope de tokens por minuto y reintentos con espera.
- **Prueba final** de búsqueda que verifica que una consulta devuelva fragmentos con fuente `GUÍA...`.

Resultado de esa primera carga: 1.963 → 2.103 registros (+140). Luego se hicieron más cargas, en parte reemplazando documentos (ver Problemas 7 y 8), y el total actual es de 2.067 (ver Problemas 7, 8 y 9).

**Incidente que conviene documentar:** tras la carga, el sitio no usaba las guías. Había dos causas: (1) `api/chat.js` consultaba el *namespace* `default` mientras los datos estaban en `normativa-nuclear`; (2) las API keys de Pinecone y Groq en Vercel habían quedado inválidas (errores 401 en los Logs). Corregido el namespace y reemplazadas las keys, el asistente empezó a citar las guías. Lección: **tras una carga, probar siempre con una pregunta que solo se pueda responder con el documento nuevo.**

---

#### Problema 7: Tablas que son imágenes (Tabla 1 de la guía AR 6)

El anexo con los niveles genéricos de exención de la guía AR 6 son 13 páginas de tablas escaneadas, sin capa de texto. Para el asistente era una tabla invisible: ante la pregunta por el Co-60 respondía, correctamente, que no tenía el valor.

**Por qué no se usó OCR:** el OCR confunde los exponentes (`1 × 10⁴` puede leerse como `1 × 10` más un `4` suelto), y un valor de exención mal leído es un error silencioso y potencialmente peligroso.

**Decisión adoptada:** transcribir una **selección acotada de 63 radionucleidos** de uso frecuente (a partir de la imagen), generar un PDF con texto real y hacer que el autor verificara **todas las filas** contra el original antes de cargarlo. El documento indexado dice explícitamente que es una selección y remite a la tabla completa. Se prefirió una cobertura parcial y verificada antes que una completa y sin verificar.

**Verificación posterior a la carga:** Co-60 (1 × 10¹ Bq/g; 1 × 10⁵ Bq) y Cs-137 (1 × 10¹ Bq/g; 1 × 10⁴ Bq) respondidos correctamente con la guía citada; Ge-68, que no está en la selección, no recibió un número inventado y se remitió a la tabla completa.

#### Problema 8: Un fragmento no debe mezclar temas parecidos

Una sección de la guía AR 1 se había indexado como un solo documento. Un mismo fragmento contenía la tabla de Cs-137 en agua (10 Bq/l) y la de alimentos, y el modelo podía confundirlas. Se la dividió en tres documentos con títulos explícitos (agua potable, alimentos, etc.) y se borró el documento original. Los tratados siguieron el mismo criterio: un artículo, un fragmento.

**Para quitar o reemplazar documentos** se usó un script de borrado por prefijo de ID que muestra primero qué se eliminaría y exige escribir el prefijo exacto para confirmar.

#### Problema 9: Reemplazar una norma por su revisión vigente (AR 10.13.1 rev. 2)

La ARN aprobó en 2026 la revisión 2 de la norma AR 10.13.1, *Protección Física de Materiales e Instalaciones Nucleares* (Resolución ARN 89/26, Boletín Oficial 17/04/2026). El procedimiento seguido sirve como modelo para cualquier actualización:

1. **Inventario** para ver qué versión estaba cargada (el archivo figuraba por su nombre, `10-13-1_r2_.pdf`).
2. **Ensayo** (`--dry-run`) con el archivo nuevo, y revisión del ejemplo que muestra.
3. **Borrado seguro** de la versión anterior (muestra primero qué se eliminaría y pide escribir el prefijo exacto).
4. **Carga** de la versión nueva (14 fragmentos) con una etiqueta legible ("Norma AR 10.13.1 rev 2").
5. **Prueba** con una pregunta propia de esa norma y comparación contra el PDF.

**Error cometido y corregido:** en el primer intento se omitió el ensayo y se cargó con el texto de ejemplo del título en lugar del título real, que quedó en el encabezado de los 14 fragmentos. Como los identificadores son determinísticos (`ar-10-13-1-r2#chunk0`…), una segunda carga con el título correcto reemplazó los registros equivocados. Lección: **ejecutar siempre primero el ensayo y mirar el ejemplo antes de cargar.**

---

## 🧪 Evaluación preliminar

La evaluación se hizo en varias rondas: un cuestionario inicial de 6 preguntas representativas y rondas posteriores sobre los puntos que habían fallado, revisando cada respuesta contra el documento original. **Es una evaluación cualitativa y chica**: no permite estimar tasas de acierto, solo identificar patrones de falla y verificar que los arreglos funcionan.

**Qué anduvo bien**

- Ante niveles de exención (AR 6) que el índice no tenía, el asistente **dijo que los valores no figuraban** en lugar de inventarlos. Tras cargar la selección de la Tabla 1, Co-60 y Cs-137 salieron correctos y con la guía citada. Para un radionucleido fuera de la selección (Ge-68) no dio ningún número.
- Respuestas sobre las guías AR 14, AR 3 y AR 13 correctas en lo central y con la guía citada. Los valores de AR 13 (10 µSv/h; 4 y 0,4 Bq/cm²) se contrastaron con el PDF.
- Valores de la guía AR 1 (Cs-137: 1.000 Bq/kg en alimentos, Tabla 24; 10 Bq/l en agua potable, Tabla 25) recuperados correctamente tras indexar esas secciones.
- Tras cargar la revisión 2 de la norma AR 10.13.1, una pregunta sobre qué exige la norma de protección física devolvió una respuesta bien estructurada (objetivo, niveles de protección 1 a 3 según la categoría del material, transporte, plan de protección física) y con la norma correcta citada. Los datos finos (por ejemplo, plazos de notificación y medidas por categoría) se contrastan contra el PDF, y hay una página del documento que se leyó con OCR y requiere revisión de cifras.
- En las últimas rondas sobre el TNP y Tlatelolco, no hubo errores en el número de artículo, y la diferencia entre tratado y protocolo fue aceptable.

**Qué falló y cómo se resolvió**

- Primera prueba, antes de corregir el namespace y las keys: el asistente **inventó niveles genéricos** (NGE-1/NGE-2). Se corrigió la causa técnica y se agregaron reglas anti-invención al prompt.
- Errores factuales sobre Tlatelolco (por ejemplo, una fecha de firma que venía de un encabezado equivocado en el PDF): se acotó el texto indexado a lo que corresponde.
- Guía AR 13 atribuida a la norma: se agregó al backend la instrucción de que, si se usa un fragmento de guía, esa guía debe figurar en las etiquetas.
- Respuesta truncada por el límite de tokens de salida (ver Limitaciones).
- Errores 413 de Groq por exceder el límite de tokens por minuto: se redujeron el historial enviado, `top_k` y `max_tokens`.

**Qué sigue fallando**

- En una pregunta final sobre qué dice la Norma AR 10.1.1 sobre exención de prácticas, el asistente **mezcló la guía con la norma** (atribuyó a la norma que los niveles genéricos "aparecen en la Tabla 1 de la Guía AR 6"), no citó ningún artículo y afirmó que la ARN puede eximir aun cuando se superen los niveles genéricos, algo que **no se pudo verificar contra el texto de la norma** (puede provenir del conocimiento previo del modelo). Es un ejemplo real de la limitación central del enfoque: el modelo puede combinar lo recuperado con lo que "sabe".

**Trazabilidad:** a nivel de documento es buena (siempre hay etiqueta de fuente); a nivel de página es nula (no hay metadata). Que una etiqueta aparezca no garantiza que la afirmación sea correcta.

---

## ⚠️ Limitaciones y riesgos

1. **Alucinaciones.** El modelo puede afirmar algo que no está en los documentos, o citar una norma que no corresponde. Las reglas del prompt reducen el riesgo, no lo eliminan.
2. **Cobertura.** Solo responde con base documental sobre lo indexado; no hay un inventario verificado de la cobertura ni control de que cada documento esté en su última revisión. La normativa cambia.
3. **Sin número de página.** La verificación exige buscar en el documento.
4. **Recuperación imperfecta.** Con `top_k = 6` puede quedar afuera el fragmento clave; las tablas descartadas, en imágenes o mal extraídas por OCR no se pueden responder o se responden mal. En particular, de la Tabla 1 de la guía AR 6 solo está una selección de 63 radionucleidos, y de la guía AR 1 solo las secciones de niveles guía en alimentos y agua.
5. **Guías vs. normas.** Una guía es orientativa; el riesgo es que el usuario la lea como requisito. El asistente lo aclara, pero el modelo puede equivocarse.
6. **Tratados y normas internacionales.** Los datos finos (fechas, partes, artículos) deben verificarse siempre contra el texto oficial.
7. **Sin evaluación sistemática.** La evaluación es cualitativa y de pocas preguntas.
8. **Límite de tokens por minuto del modelo.** En el plan gratuito de Groq, `openai/gpt-oss-120b` admite 8.000 tokens por minuto. Las consultas que recuperan fragmentos densos (tablas) pueden pesar entre 6.000 y 7.500, por lo que varias preguntas seguidas en menos de un minuto pueden demorar o fallar con error 413. Mitigaciones aplicadas: últimos 4 mensajes de historial, `top_k = 6` y `max_tokens = 2000`. La solución de fondo es un plan de pago o un modelo con mayor límite.
9. **Mezcla de memoria del modelo con fuentes.** Aun con reglas en el prompt, el modelo puede completar una respuesta con conocimiento propio sin avisarlo (ver ejemplo de la Norma AR 10.1.1 en la evaluación).
10. **Seguridad y operación.** Rate limiting en memoria por instancia; dependencia de tres servicios externos (Groq, Pinecone, Vercel) con planes gratuitos y límites que pueden cambiar; las API keys deben rotarse si se exponen.
11. **Uso profesional.** El asistente **no reemplaza la norma original ni el criterio profesional**. Toda respuesta debe verificarse en el documento oficial antes de decidir.

### Espacio reservado para el trabajo integrador

> _Este apartado queda en blanco a propósito: aquí se completan las limitaciones que se vayan a desarrollar en el documento del trabajo integrador (análisis, alcance, riesgos y recomendaciones de uso)._
>
> - _(a completar)_
> - _(a completar)_
> - _(a completar)_

---

## 🤔 ¿Por qué este camino y no otro?

### Alternativa descartada: fine-tuning del modelo

Reentrenar un LLM con la normativa produciría un modelo que "conoce" la documentación, pero con alto costo de cómputo, y debería repetirse con cada norma nueva. Además, no daría trazabilidad por documento. Con RAG, agregar un documento es indexarlo.

### Alternativa descartada: búsqueda por palabras clave (BM25 / Elasticsearch)

Un buscador textual encuentra documentos que *contienen* las palabras de la consulta. Si el usuario pregunta "¿qué pasa si supero el límite de exposición anual?", no encontraría fragmentos sobre "incumplimiento de dosis máxima" porque no comparten vocabulario. La búsqueda semántica captura similitud de *significado*. (Una búsqueda híbrida es una mejora posible; ver Roadmap.)

### Alternativa descartada: todo el corpus en el contexto del LLM

Incluir todos los documentos en el prompt es inviable en costo y latencia. RAG recupera solo los fragmentos relevantes.

### Alternativa descartada: LangChain / LlamaIndex

Se descartaron por su complejidad de debugging: cuando algo falla en la recuperación o generación, las abstracciones dificultan ver en qué capa está el problema. La implementación directa de las llamadas a Pinecone y Groq es más código, pero transparente. Esa transparencia sirvió en la práctica para diagnosticar el error de *namespace*.

---

## 📁 Estructura del proyecto

```
/
├── api/
│   └── chat.js            # Función serverless: pipeline RAG completo
│                          # 1. Busca contexto relevante en Pinecone
│                          #    (namespace normativa-nuclear, top_k 6)
│                          # 2. Arma el prompt con ese contexto
│                          # 3. Llama a Groq (GPT-OSS 120B) con streaming
│                          # 4. Aplica rate limiting y validación de entrada
│
├── src/
│   ├── App.jsx             # Componente principal: UI del chat y prompt del sistema
│   └── main.jsx            # Punto de entrada de React
│
├── index.html
├── vite.config.js
├── package.json
├── LICENSE.txt
└── README.md
```

Los scripts de mantenimiento del índice se corren localmente y no forman parte del despliegue: `indexar_guias.py` (carga de guías), `indexar_documentos.py` (carga de tratados y otros documentos, por artículo o por secciones), `inventario_fuentes.py` (lista de documentos y fragmentos del índice), `borrar_documento.py` (borrado seguro por prefijo) y `probar_busqueda.py` (prueba de recuperación con la misma consulta que usa el sitio).

**¿Por qué toda la lógica RAG en una serverless function?** Mantiene las API keys del lado del servidor, sin exponerlas en el bundle del cliente.

**Nota honesta:** en un proyecto más grande valdría la pena separar `App.jsx` en componentes más chicos. Hoy toda la interfaz vive en un solo archivo por simplicidad.

---

## ⚙️ Variables de entorno

```env
GROQ_API_KEY=          # API key de Groq (inferencia GPT-OSS 120B)
PINECONE_API_KEY=      # API key de Pinecone (búsqueda; los embeddings los genera Pinecone)
```

Deben configurarse en Vercel (Settings → Environment Variables, entorno **Production**, y luego redeployar) y en un `.env.local` para desarrollo local. **Nunca deben commitearse ni pegarse en chats o capturas.** Si una key se expone, borrarla en el panel del proveedor y crear otra.

Para correr los scripts de indexación, la key de Pinecone se carga en la sesión del terminal, no en el código.

---

## 🛠️ Instalación local

```bash
git clone https://github.com/coderhouse2025-droid/norma-ar.git
cd norma-ar
npm install
```

Las funciones de `/api` no las sirve `vite dev` por sí solo; lo más directo es usar el CLI de Vercel:

```bash
npm i -g vercel
vercel dev
```

---

## ✅ Implementado recientemente

- **Guías regulatorias de la ARN** (10 guías, 140 registros) con encabezado que las vincula a su norma, etiqueta celeste y regla de "norma primero, guía después".
- **Corrección del namespace** de búsqueda y rotación de API keys.
- **Tratados indexados por artículo** (TNP, Tlatelolco, salvaguardias, acuerdo bilateral y artículo del OIEA), con aclaración de la diferencia entre tratado y protocolos.
- **Secciones de la guía AR 1** (alimentos y agua potable) y **selección de 63 radionucleidos** de la Tabla 1 de la guía AR 6, verificada fila por fila.
- **Scripts de inventario, borrado seguro y prueba de búsqueda** para mantener el índice.
- **Actualización de la norma AR 10.13.1 a su revisión 2** (Resolución ARN 89/26), con procedimiento de reemplazo documentado.
- **Reglas anti-invención** en el prompt (valores numéricos, fechas, siglas, números de artículo, no usar marcas de cita tipo 【】), temperatura 0,2 y ajuste de límites (`max_tokens` 2000, `top_k` 6, historial de 4 mensajes) para el tope de tokens por minuto de Groq.
- **Botón de copiar respuesta**, **exportar conversación** a `.txt`, **contador de caracteres**, **tablas markdown** y **meta tags Open Graph / Twitter Card**.

---

## 🧩 Roadmap

| Prioridad | Mejora | Justificación |
|-----------|--------|---------------|
| Alta | 🧪 Evaluación sistemática con un conjunto más grande de preguntas y respuestas de referencia | Hoy la evaluación es cualitativa y de pocas preguntas |
| Alta | 📊 Completar la Tabla 1 de la guía AR 6 (y las tablas de coeficientes de dosis de la AR 1) | Hoy solo hay una selección de 63 radionucleidos y secciones de la AR 1 |
| Alta | ⏱️ Resolver el tope de tokens por minuto de Groq (plan de pago, otro modelo o prompt más corto) | Hoy varias consultas seguidas pueden fallar |
| Alta | 📄 Archivo `.env.example` | Facilita saber qué variables se necesitan |
| Media | 📎 Agregar `pagina` al pipeline de indexación | El índice actual no la tiene; hoy las citas no muestran página |
| Media | 🏷️ Mostrar el nombre normalizado de cada norma en las etiquetas (por ejemplo, "Norma AR 10.1.1 rev. 4" en vez del nombre del archivo) | Mejora la lectura de las fuentes |
| Media | 📜 Indexar el CTBT y revisar las normas de la serie en su última revisión | Cobertura de tratados y vigencia |
| Media | 🔎 Revisar la recuperación (`top_k`, búsqueda híbrida, reranking) | Mejorar que el fragmento clave llegue al modelo |
| Media | 🔒 Rate limiting con almacenamiento persistente (Upstash / Vercel KV) | El límite actual es por instancia |
| Media | 🌐 Soporte multilingüe (inglés / portugués) | OIEA y ABACC operan en inglés |
| Baja | 🧱 Separar `App.jsx` en componentes | Mantenimiento |
| Baja | ✅ Tests automatizados de `/api/chat` | Evitar romper el pipeline sin notarlo |
| Baja | 🔐 Panel de administración para indexar documentos | Agregar normas sin tocar código |

---

## 📚 Bibliografía

- Lewis, P. et al. (2020). *Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks.* Advances in Neural Information Processing Systems 33 (NeurIPS 2020).
- OIEA (2016). *Governmental, Legal and Regulatory Framework for Safety.* General Safety Requirements Part 1 (Rev. 1), GSR Part 1 (Rev. 1).
- U.S. Nuclear Regulatory Commission (2023). NUREG-2261, sobre el uso de inteligencia artificial en la actividad regulatoria. _(verificar título completo antes de la entrega)_
- República Argentina. Ley 24.804, Ley Nacional de la Actividad Nuclear, y Decreto 1390/98.
- Autoridad Regulatoria Nuclear (ARN). Normas regulatorias y Guías regulatorias. https://www.argentina.gob.ar/arn/instalaciones-practicas-y-personal-regulado/marco-regulatorio/normas — descripción de las guías: https://www.argentina.gob.ar/node/116802
- Tratado sobre la No Proliferación de las Armas Nucleares (TNP); Tratado de Tlatelolco; acuerdos de salvaguardias con el OIEA y la ABACC.
- Pinecone. *llama-text-embed-v2* (documentación del modelo). https://docs.pinecone.io/models/llama-text-embed-v2

---

## 👨‍💻 Autor

**Juan Manuel Orellana** — Proyecto integrador, Especialización en Seguridad Nuclear.
**Tutor:** _(a completar)_

---

## 📄 Licencia

Proyecto de uso académico e investigación. Documentación fuente disponible en https://www.argentina.gob.ar/arn/instalaciones-practicas-y-personal-regulado/marco-regulatorio/normas
