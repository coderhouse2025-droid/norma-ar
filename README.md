## norma-ar

Asistente inteligente basado en arquitectura RAG para la consulta y trazabilidad de la normativa nuclear argentina

<img width="1672" height="940" alt="Banner" src="https://github.com/user-attachments/assets/5ef22f81-cf0f-4ff8-a1ec-3f856981b5ba" />


[![Demo en vivo](https://img.shields.io/badge/Demo-Live-brightgreen?style=for-the-badge)](https://norma-ar.vercel.app)
[![RAG](https://img.shields.io/badge/Arquitectura-RAG-blueviolet?style=for-the-badge)](#️-arquitectura-rag)
[![GPT-OSS 120B](https://img.shields.io/badge/LLM-GPT--OSS_120B-orange?style=for-the-badge)](#3-openai-gpt-oss-120b--no-gpt-4-no-claude)

> Consultá legislación, normas y guías regulatorias de la ARN, protección radiológica y tratados internacionales en lenguaje natural, con la fuente a la vista.

🔗 **Demo:** https://norma-ar.vercel.app

🎬 **Video de presentación:** https://youtu.be/PnOKb8TFxds

**Proyecto integrador** — Especialización en Seguridad Nuclear
**Autor:** Juan Manuel Orellana · **Tutor:** _(a completar)_

> **Estado del documento:** actualizado a noviembre de 2026. Las cifras del índice corresponden al último inventario disponible (17/10/2026) y las de evaluación al Formulario 3 (ejecuciones del 07 al 11/11/2026). Si el índice cambia, volver a correr `inventario_fuentes.py` y actualizar la sección [Base de conocimiento](#-base-de-conocimiento).

---

## 📋 Índice

- [Proyecto integrador](#-proyecto-integrador)
- [Descripción del producto](#-descripción-del-producto)
- [Base de conocimiento](#-base-de-conocimiento)
- [Decisiones técnicas y su justificación](#-decisiones-técnicas-y-su-justificación)
- [Arquitectura RAG](#️-arquitectura-rag)
- [Pipeline de datos](#-pipeline-de-datos-de-documentos-oficiales-a-base-de-conocimiento-indexada)
- [Evaluación](#-evaluación)
- [Limitaciones y riesgos](#️-limitaciones-y-riesgos)
- [¿Por qué este camino y no otro?](#-por-qué-este-camino-y-no-otro)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Variables de entorno](#️-variables-de-entorno)
- [Instalación local](#️-instalación-local)
- [Implementado](#-implementado)
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

> Estado de cada objetivo: ver las secciones [Evaluación](#-evaluación) y [Roadmap](#-roadmap). El relevamiento internacional (objetivo 1) se desarrolla en el documento del proyecto integrador y se apoya en la [Bibliografía](#-bibliografía).

### Metodología

1. **Relevamiento** del uso de IA en reguladores nucleares y de la arquitectura RAG.
2. **Identificación de fuentes** oficiales (ARN, normativa nacional, tratados) y de la relación entre normas y guías.
3. **Preparación de los documentos**: extracción de texto, OCR cuando el PDF es una imagen, limpieza y fragmentación.
4. **Indexación** en una base de datos vectorial, conservando el nombre del documento de origen.
5. **Implementación** del asistente: recuperación de fragmentos relevantes, generación de la respuesta con un modelo de lenguaje y presentación de las fuentes.
6. **Evaluación** con consultas propias documentadas: cada respuesta se contrasta con el documento original, se clasifica el error por tipo y gravedad, y se repite la prueba tras cada corrección (inspirada en Ragas y en el NIST AI RMF).
7. **Análisis** de limitaciones, riesgos y mejoras.

### Resultados esperados

- Un **prototipo funcional** accesible en línea ([norma-ar.vercel.app](https://norma-ar.vercel.app)).
- Un **análisis de su desempeño y limitaciones** (secciones [Evaluación](#-evaluación) y [Limitaciones y riesgos](#️-limitaciones-y-riesgos)).

El asistente es una **herramienta de apoyo a la consulta**. No reemplaza a la norma original ni al criterio profesional, y toda respuesta debe contrastarse con el documento oficial antes de usarse para una decisión técnica o legal.

### Integración de conocimientos

El proyecto integra conocimientos del marco regulatorio nuclear (la Ley 24.804, las normas y guías de la ARN y los instrumentos internacionales), de la gestión de la seguridad y de la protección radiológica, con herramientas de ciencia de datos e inteligencia artificial (procesamiento de documentos, embeddings, búsqueda semántica y modelos de lenguaje). La parte regulatoria define qué se debe responder y con qué fuente; la parte técnica define cómo se recupera y se presenta.

---

## 📊 Descripción del Asistente

Este herramienta responde consultas técnicas y jurídicas sobre la normativa nuclear argentina: legislación vigente, normas y guías regulatorias de la ARN, protección radiológica, licencias, residuos radiactivos y tratados internacionales.

Las respuestas se generan combinando un modelo de lenguaje (GPT-OSS 120B) con búsqueda semántica sobre documentos oficiales indexados — una arquitectura conocida como **RAG (Retrieval-Augmented Generation)**. Cada respuesta cita los documentos en los que se basó, mostrados como etiquetas separadas debajo del texto: **doradas** para normas y leyes, **celestes** para guías regulatorias. Si la respuesta empieza diciendo que no encontró información sobre el tema, las etiquetas no se muestran (no hay fuente que respaldar).

**Funciones de la interfaz:** accesos rápidos por tema, copiar respuesta, exportar la conversación a `.txt`, leer la respuesta en voz alta (con la voz del navegador), contador de caracteres, tablas en formato markdown y un enlace a un formulario de comentarios para los visitantes.

<img width="756" height="1344" alt="Banner" src="https://github.com/user-attachments/assets/afdc47ef-96d8-43fc-9107-610749e11d29" />


### Normas y guías: una distinción que el asistente respeta

Las **guías regulatorias** de la ARN son documentos de carácter orientativo que contienen recomendaciones para cumplir con los requisitos de las normas regulatorias vinculadas ([fuente oficial](https://www.argentina.gob.ar/node/116802)). No son la norma. Por eso el asistente:

- explica primero el requisito de la norma y después, si corresponde, lo que recomienda la guía;
- aclara que la guía es orientativa;
- cita ambos documentos en las etiquetas finales y no atribuye a la norma lo que dice la guía.

Cada fragmento de guía se indexa con un encabezado que la vincula a su norma (por ejemplo, la guía AR 10 con la norma AR 0.11.1), y la búsqueda reserva un mínimo de lugares para guías pertinentes, para que no queden desplazadas por las normas.

### Qué hace cuando no sabe

El asistente está diseñado para **abstenerse** antes que inventar:

- Si ningún fragmento recuperado trata el tema, responde «No encontré en la documentación consultada…» y remite a la fuente oficial.
- Si la consulta es sobre una norma o artículo inexistente (por ejemplo, «AR 99.9.9» o «artículo 150 de la Ley 24.804»), no inventa contenido.
- Si la consulta está fuera de alcance (otro país, otro tema) o intenta extraer el prompt o las claves, lo declina.
- Si la respuesta contiene cifras con unidad que no figuran en los textos recuperados, agrega un aviso: «no pude confirmar literalmente… estos valores».

---

## 🔐 Base de conocimiento

Según el último inventario del índice (17/10/2026, generado con `inventario_fuentes.py`), hay **2.087 fragmentos en 86 documentos**:

| Origen | Documentos | Fragmentos |
|--------|-----------:|-----------:|
| Normas regulatorias de la ARN (serie AR 0 a AR 10) | 64 | 1.676 |
| Guías regulatorias de la ARN | 13 (10 guías y 3 anexos de AR 1) | 149 |
| Ley 24.804 y Decreto reglamentario 1390/98 | 2 | 105 |
| Tratados y acuerdos internacionales | 5 | 100 |
| Documentos institucionales (CNEA, INVAP) | 2 | 57 |
| **Total** | **86** | **2.087** |

**Tratados y acuerdos indexados:** Tratado sobre la No Proliferación de las Armas Nucleares (TNP), Tratado de Tlatelolco, acuerdo bilateral Argentina–Brasil (ABACC, 1991), Acuerdo de Salvaguardias Cuatripartito (Argentina, Brasil, ABACC y OIEA) y un boletín del OIEA de 1994 sobre el acuerdo. **El CTBT no está indexado**: ante consultas sobre ese tratado el asistente aporta, como mucho, una definición general y aclara que la documentación consultada no lo incluye.

**Normas incluidas** (nombre de archivo = serie y revisión): AR 0.0.1; 0.11.1 a 0.11.4; 2.12.1; 3.1.1 a 3.1.3, 3.2.1, 3.2.3, 3.3.1 a 3.3.4, 3.4.1 a 3.4.3, 3.5.1, 3.7.1, 3.8.1, 3.9.1, 3.9.2, 3.10.1, 3.17.1; 4.1.1 a 4.1.3, 4.2.1 a 4.2.3, 4.5.1, 4.7.1, 4.7.2, 4.8.1, 4.8.2, 4.9.1, 4.9.2; 5.1.1, 5.7.1; 6.1.1, 6.1.2, 6.2.1, 6.7.1, 6.9.1; 7.9.1, 7.9.2, 7.11.1, 7.11.2; 8.2.1 a 8.2.4, 8.11.1 a 8.11.3; 10.1.1, 10.6.1, 10.10.1, 10.12.1, 10.13.1, 10.13.2, 10.14.1, 10.16.1. El listado completo, con la cantidad de fragmentos por documento, se obtiene del inventario.

> **Pendiente:** el inventario confirma qué documentos hay y cuántos fragmentos tiene cada uno, pero **no verifica que cada norma esté en su última revisión** ni que estén todas las normas vigentes de la serie. Esa comprobación contra la página oficial de la ARN sigue pendiente.

**Guías incorporadas y norma a la que se asocian** (según la página oficial de la ARN):

| Guía | Revisión | Norma asociada |
|------|----------|----------------|
| AR 1 (y anexos de agua, alimentos y radón) | 2 | AR 10.1.1 rev. 4 |
| AR 3 | 0 | AR 0.11.2 rev. 2 |
| AR 4 | 0 | AR 4.2.2 rev. 1 |
| AR 5 | 1 | AR 7.11.1 rev. 4 |
| AR 6 | 1 | AR 10.1.1 rev. 4 |
| AR 7 | 0 | AR 4.2.1 rev. 1 |
| AR 8 | 1 | AR 10.1.1 rev. 4 |
| AR 10 | 0 | AR 0.11.1 rev. 3 |
| AR 13 | 0 | AR 10.12.1 rev. 3 |
| AR 14 | 0 | AR 10.1.1 rev. 4 |

Todos los registros están en un único *namespace* (`normativa-nuclear`) del índice `normativa-nuclear`.

Para temas que no están en el índice, el prompt le indica al asistente que **no complete con conocimiento general o de memoria** y que diga que el dato no figura en la documentación consultada. La única excepción es una definición esencial muy breve de conceptos o tratados (por ejemplo, ALARA o el CTBT), siempre separada de lo que sí consta en los documentos.

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

**Plan gratuito (Starter):** según el panel de Pinecone del proyecto, ofrece 2 GB de almacenamiento, 1 M de *read units* y 2 M de *write units* por mes. Con ~2.100 registros el almacenamiento no es una restricción; el límite que sí se encontró en la práctica es el de *embeddings por minuto* (ver [Pipeline de datos](#-pipeline-de-datos-de-documentos-oficiales-a-base-de-conocimiento-indexada)). Como cada consulta del usuario dispara varias búsquedas (ver [Arquitectura RAG](#️-arquitectura-rag)), también conviene vigilar las *read units*. Los límites del plan pueden cambiar; conviene consultar el panel.

---

### 3. OpenAI GPT-OSS 120B — no GPT-4, no Claude

> **Nota de mantenimiento (agosto 2026):** este proyecto usaba originalmente **LLaMA 3.3 70B**. Groq anunció la baja de ese modelo en junio de 2026 y recomendó migrar a `openai/gpt-oss-120b`. Si en algún momento el chatbot empieza a responder "No se pudo generar la respuesta", lo primero que hay que revisar son los **Logs** del proyecto en Vercel: un error 404 de un proveedor mencionando el modelo indica que hay que actualizar el nombre del modelo (variable `GROQ_MODEL` / `LLM_MODEL`, o la constante `MODELO_DEFECTO` en `api/chat.js`).

**¿Por qué un LLM open-weights?**

GPT-OSS 120B es un modelo de lenguaje de pesos abiertos publicado por OpenAI. Esto significa que puede ejecutarse en infraestructura de terceros sin depender de un único proveedor cerrado: el mismo modelo se puede pedir a más de un proveedor. Para un sistema de consulta sobre documentación oficial del Estado argentino, la independencia de proveedor sigue siendo un criterio técnico relevante.

**Dos proveedores del mismo modelo, con respaldo automático**

`api/chat.js` admite hasta dos proveedores, ambos con `gpt-oss-120b`:

| Proveedor | Para qué | Límites que se manejan |
|-----------|----------|------------------------|
| **Groq** | Inferencia muy rápida (hardware LPU) | El plan gratuito tiene un tope de 8.000 tokens por minuto (entrada + salida): presupuesto de ~7.000 tokens por consulta, `max_tokens` 1.500 y `top_k` 6 |
| **Alternativo** compatible con la API de OpenAI (por ejemplo DeepInfra) | Sin tope por minuto: permite más contexto | Presupuesto configurable (24.000 tokens por defecto), `max_tokens` 2.000 y `top_k` 8 |

El orden se define con `LLM_PRIMARY`. Si el principal falla por límite de uso (429) o error del servidor, se usa el otro como respaldo; ante un 429 con espera corta, antes se reintenta. Con el alternativo como principal se recuperan más fragmentos, lo que mejora la cobertura.

**¿Por qué no GPT-4 o Claude directamente?**

Ambos podrían entregar respuestas de calidad igual o mayor en muchos casos. La decisión es de arquitectura y costo: con RAG, cada consulta envía al modelo los fragmentos recuperados + la pregunta + el historial, lo que puede sumar miles de tokens por request. A escala de uso real sin financiamiento, ese costo sería más difícil de sostener.

**Detalles operativos del modelo**

- GPT-OSS es un modelo con razonamiento, y los tokens de razonamiento cuentan dentro del límite de salida. Con un límite bajo la respuesta se puede cortar antes de terminar (ocurrió durante las pruebas). Se configura `reasoning_effort: low` (modificable con `LLM_REASONING_EFFORT`; `none` lo desactiva), lo que da respuestas más rápidas y con menos tokens. Si un proveedor no acepta ese parámetro, se reintenta sin él.
- Temperatura **0,2**, para respuestas lo más consistentes posible.
- El historial reenviado se limita a los últimos 3 mensajes y las respuestas viejas se recortan a 700 caracteres, para no gastar el presupuesto de tokens.
- El prompt pide respuestas concisas (alrededor de 350 palabras).

---

### 4. llama-text-embed-v2 (NVIDIA Research) — embeddings alojados en Pinecone

**¿Qué son los embeddings y por qué importa el modelo?**

Un embedding es una representación numérica (vector) del significado semántico de un texto. El mismo modelo debe usarse para vectorizar los documentos al indexar Y para vectorizar la pregunta del usuario al buscar — de lo contrario, los vectores no son comparables.

**¿Cómo se usa en este proyecto?**

Se usa la *inferencia integrada* de Pinecone: el índice está asociado al modelo `llama-text-embed-v2`, y Pinecone genera los embeddings tanto al cargar los textos como al recibir la consulta (`inputs.text`). La aplicación no llama a ningún servicio de embeddings aparte.

Según la documentación de Pinecone, es un modelo desarrollado por NVIDIA Research, basado en Llama 3.2 1B, con entrada máxima de 2.048 tokens y dimensiones configurables (1024, 2048, 768, 512 o 384), compatible con métricas coseno y producto punto. Con fragmentos de ~550 tokens, el límite de entrada no trunca ningún chunk.

---

### 5. Vercel — no Netlify, no Railway, no VPS

**¿Por qué Vercel?**

El frontend es React y el backend es una función serverless en `/api/chat.js`. Vercel integra bien este patrón: se despliegan ambas capas desde el mismo repositorio en un solo `git push`. Las funciones en `/api` se convierten automáticamente en Serverless Functions con las variables de entorno disponibles en runtime, sin gestionar un servidor Express ni un contenedor.

> **Nota práctica:** la conexión entre el repo de GitHub y el proyecto de Vercel es lo que dispara el deploy automático en cada `git push`. Si un commit no genera un deploy nuevo, conviene revisar Settings → Git en Vercel — esa conexión se puede romper (por ejemplo, si se revocan permisos de la GitHub App).

> **Nota práctica 2:** al cambiar una variable de entorno en Vercel hay que **redeployar** para que tome efecto. Si el chat falla con 401, revisar en los Logs si el error viene de Pinecone o de un proveedor del modelo: son keys distintas.

---

### 6. Rate limiting y validación de entrada — por qué son necesarios en un endpoint público

**¿Por qué no dejar `/api/chat` abierto sin más?**

El endpoint le pega a dos servicios externos (el modelo y Pinecone). Sin ningún control, cualquiera con la URL puede mandar tráfico ilimitado y consumir la cuota gratuita.

**¿Qué se implementó?**

- Un límite de **15 solicitudes por IP por minuto** (en memoria, dentro de la función serverless).
- Validación de cada request: máximo 30 mensajes en el historial, 4.000 caracteres por mensaje y 12.000 en el prompt del sistema, y formato esperado.
- Los errores internos se registran en los logs del servidor, pero al usuario le llega un mensaje genérico, para no exponer detalles internos.

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
│  Consulta de búsqueda: la pregunta actual SIEMPRE sola, +       │
│  ampliación con un glosario de términos; si parece un           │
│  seguimiento, se agrega una 2.ª consulta con la anterior        │
│       ↓                                                         │
│  Búsquedas en Pinecone: general + dirigida a guías + dirigida   │
│  a documentos concretos (p. ej. informe de seguridad)           │
│       ↓                                                         │
│  Unión sin repetidos, orden por puntaje, top_k 8 (6 con Groq),  │
│  con un mínimo de guías pertinentes                             │
│       ↓                                                         │
│  Prompt: [Sistema] + [Fragmentos] + [Instrucciones según la     │
│  pregunta] + [Historial] + [Pregunta]                           │
│       ↓                                                         │
│  GPT-OSS 120B (proveedor principal; respaldo si falla)          │
│       ↓                                                         │
│  Streaming de la respuesta + control de números                 │
│       ↓                                                         │
│  Interfaz: etiquetas de fuente y limpieza del texto             │
└─────────────────────────────────────────────────────────────────┘
```

**¿Por qué RAG y no fine-tuning?**

El fine-tuning consiste en reentrenar el modelo con la documentación. Es costoso, lento de iterar y hay que repetirlo cada vez que cambia la normativa. Con RAG se actualiza el conocimiento modificando solo la base vectorial: agregar un documento es indexarlo. Esto se comprobó al incorporar las guías, los tratados y los acuerdos, sin tocar el modelo. Además, RAG permite mostrar de dónde sale cada respuesta, requisito central para este dominio.

### Mejoras de recuperación (api/chat.js)

Las pruebas mostraron que la búsqueda semántica falla de formas concretas, y cada una se corrigió con un mecanismo:

| Problema observado | Mecanismo |
|--------------------|-----------|
| Una pregunta nueva y corta se trataba como seguimiento de la anterior y se desviaba | La consulta actual se busca **siempre sola**; solo si parece seguimiento se suma una segunda búsqueda combinada |
| Términos que la norma nombra distinto (ALARA ↔ «optimización de la protección»; ARN, CNEA, residuo, caracterización, programas de examen, sanciones, límites de dosis, TNP) no recuperaban el fragmento | **Glosario de búsqueda**: se agregan a la consulta los términos de la norma |
| Las guías quedaban desplazadas por las normas | Búsqueda dirigida a guías y **cupo mínimo** de 2 guías pertinentes (se reemplazan fragmentos de norma de menor puntaje, siempre que el puntaje de la guía sea cercano al mejor) |
| Para ciertos temas se sabe en qué documentos está la respuesta y la similitud no los trae (informe de seguridad: AR 4.9.2, AR 4.9.1, AR 3.9.1) | **Fuentes dirigidas**: búsqueda adicional filtrada por documento |
| Cada proveedor tiene un tope de tokens distinto | **Presupuesto de tokens**: si el contexto excede el presupuesto, se recortan fragmentos (hasta un mínimo de 3) |
| Búsqueda con baja relevancia | Si se define `RAG_SCORE_MIN`, se agrega un aviso de cobertura incompleta y no se fuerzan guías |

Cada consulta deja en los logs de Vercel una línea `RAG` con las fuentes recuperadas y sus puntajes, útil para diagnosticar errores de recuperación.

### Reglas del prompt

El comportamiento del asistente se fija en dos capas:

**1. Prompt del sistema (`src/App.jsx`, 21 reglas).** Las más relevantes para la trazabilidad y la fidelidad:

- Citar al final, entre corchetes, solo los documentos efectivamente recibidos, una sola vez cada uno y sin número de página (no existe en el índice).
- **No dar valores numéricos que no estén en los documentos recibidos** (límites, plazos, fechas); si no aparecen, decirlo y remitir a la norma o guía.
- Basarse únicamente en la documentación recibida; **no completar con conocimiento general** (instalaciones, cargos, decretos, estructuras).
- Citar números de artículo solo si figuran en los fragmentos; no inventar el tercer nivel de numeración de una norma ARN.
- Límites de dosis: nunca de memoria ni trasladados de un contexto a otro; indicar a quién se aplican.
- No confundir límite de dosis, restricción de dosis, nivel de referencia y criterios de exención.
- Distinguir norma de guía; en los tratados, distinguir el cuerpo de los protocolos y anexos.
- El OIEA no es un regulador; en Argentina el regulador es la ARN.
- No mencionar «fragmento», nombres de archivo ni números de página en el cuerpo; sin fórmulas LaTeX.

**2. Instrucciones del backend (`api/chat.js`), según la consulta.** Se agregan al contexto recuperado:

- **Siempre que hay fragmentos:** usar la frase «No encontré…» solo si ningún fragmento trata el tema; reglas de fidelidad (no completar con contenido «típico», no extender condiciones de trabajadores al público, no agregar ejemplos propios, citar artículos solo si figuran, y obligaciones de tratados solo para la situación de Argentina); y la instrucción de citar las guías.
- **Caso especial de ausencia:** ante «¿qué es / qué significa X?» sobre un concepto o tratado sin fragmentos, dar una definición esencial de 1–2 frases sin cifras ni afirmaciones sobre Argentina, aclarar que la documentación consultada no lo incluye y recomendar la fuente (para ALARA, la AR 10.1.1).
- **Según el tema de la pregunta:** *Categoría* (separar en dos secciones: protección física, AR 10.13.1, y bultos de transporte, AR 10.16.1), *sanciones* (listar las sanciones y, aparte, las demás facultades de la ARN), *responsabilidad civil* (empezar por la definición de daño nuclear) y *CNEA* (no confundir el decreto de creación con el decreto-ley posterior).

### Control de números

Después de generar la respuesta, el backend busca valores con unidad (mSv, Bq, años, %, etc.) que **no aparezcan en los textos recuperados** y, si los encuentra, agrega un aviso al final. Compara el par número + unidad, de modo que un «5» que aparece como «5 años» no respalda «5 mSv».

**Límite del control:** detecta cifras ausentes en los textos, pero **no detecta una cifra que sí está en los textos y se atribuye al concepto o al grupo equivocado** (por ejemplo, un criterio de optimización presentado como límite). Ese tipo de error se corrigió con instrucciones y glosario, y sigue requiriendo verificación.

### Sobre las citas de fuente

El formato de cita es reconocido por la interfaz, que lo convierte en etiqueta visual. Los nombres de archivo del índice (por ejemplo `10-12-1r3_.pdf`) se normalizan a «Norma AR 10.12.1 rev 3»; las guías se citan como «Guía AR N». Esto es más frágil de lo que parece: un modelo puede citar con seguridad un número de norma que no recuerda bien. Las reglas anteriores reducen ese riesgo, pero no lo eliminan; las citas orientan la verificación y no la reemplazan.

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

**Tablas numéricas (guías):** las páginas que son casi puras tablas generan fragmentos de poco valor semántico. El script de guías puede descartarlas (`--descartar-tablas`, criterio: proporción de letras sobre caracteres no blancos menor a 0,45). El costo es real: **se descartan también tablas con valores que el usuario puede necesitar**.

---

#### Problema 3: Chunking — el trade-off entre contexto y precisión

**¿Por qué no indexar el documento completo?** Un documento de 50 páginas comprimido en un vector captura el tema general, pero no recupera con precisión una cláusula específica.

**¿Por qué no indexar por oración?** Una oración aislada pierde el contexto. "El límite es de 20 mSv" sin saber a quién aplica es incompleto y potencialmente peligroso de citar.

**Estrategia:** fragmentos de ~500 tokens con solapamiento. En la primera etapa (normas) el solapamiento fue de 100 tokens. En las etapas posteriores (guías y documentos generales) se usaron fragmentos de ~2.300 caracteres (≈550 tokens) con 400 caracteres de solapamiento, cortando en límites de oración, y con un **encabezado en cada fragmento** que identifica el documento (y, en las guías, la norma a la que se asocia).

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

En la primera etapa, `source` es el nombre del archivo (por ejemplo `18.2. TRATADO DE TLATELOLCO.pdf` o `3-9-1_r1.pdf`); en las guías y los documentos generales, un rótulo que se muestra tal cual como etiqueta (por ejemplo `GUÍA AR 10 rev 0 …`). La interfaz usa el prefijo `GUÍA` para pintar la etiqueta celeste. Los IDs siguen el formato `<documento>#chunk<k>`.

**¿Por qué es crítica la metadata?** Sin ella, el chatbot podría dar una respuesta correcta sin poder decir de dónde viene. En contexto regulatorio, una respuesta sin fuente no tiene valor profesional.

**Limitación conocida: no hay número de página.** El esquema planeado incluía `titulo`, `seccion`, `pagina` y `fecha_vigencia`, pero el índice solo guarda `source` y `text`. Las citas indican el documento, **nunca la página**, y el prompt le indica al modelo que no la incluya. Agregarla requiere reconstruir el pipeline de indexación.

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

#### Problema 6: Cómo agregar y quitar documentos sin romper lo existente

El índice se mantiene con scripts propios que se corren localmente (no forman parte del despliegue):

| Script | Qué hace | ¿Modifica el índice? |
|--------|----------|----------------------|
| `indexar_guias.py` | Carga las guías regulatorias (OCR de páginas escaneadas, filtro opcional de tablas, encabezado con la norma asociada) | Solo agrega |
| `indexar_documentos.py` | Carga documentos generales (tratados, acuerdos, leyes) de a uno, con ID, cita y título propios | Solo agrega |
| `inventario_fuentes.py` | Lista los documentos del índice y cuántos fragmentos tiene cada uno (CSV) | No (solo lee) |
| `probar_busqueda.py` | Muestra qué fragmentos devuelve Pinecone para una pregunta, sin usar el modelo de lenguaje | No (solo lee) |
| `borrar_documento.py` | Borra todos los registros de un documento por prefijo de ID | **Sí, es la única que borra**: por defecto solo muestra qué borraría; para borrar exige `--borrar` y escribir el prefijo para confirmar |

Propiedades comunes de los scripts de carga:

- **Aditivos:** no borran ni modifican los registros anteriores.
- **IDs determinísticos** (`<id>#chunk<k>`): volver a correrlos reemplaza los mismos registros en lugar de duplicarlos. Atención: si una corrida genera menos fragmentos que otra anterior del mismo documento, los fragmentos viejos sobrantes quedan sin reemplazar; en ese caso conviene borrar el documento y volver a cargarlo.
- **Modo `--dry-run`** que muestra cuántos fragmentos generaría, sin tocar Pinecone.
- **Carga con control de ritmo:** el índice rechazó una primera carga con error 429 (*RESOURCE_EXHAUSTED*) por superar el límite de tokens de embedding por minuto (250.000 para `llama-text-embed-v2`, compartido por todo el proyecto de Pinecone). Se resolvió con lotes chicos, un tope de tokens por minuto y reintentos con espera.
- **Prueba final** de búsqueda que verifica que una consulta devuelva fragmentos del documento nuevo.

La key de Pinecone se carga en la sesión del terminal (`$env:PINECONE_API_KEY`), nunca en el código.

**Incidente que conviene documentar:** tras la carga de las guías, el sitio no las usaba. Había dos causas: (1) `api/chat.js` consultaba el *namespace* `default` mientras los datos estaban en `normativa-nuclear`; (2) las API keys de Pinecone y del modelo en Vercel habían quedado inválidas (errores 401 en los Logs). Corregido el namespace y reemplazadas las keys, el asistente empezó a citar las guías. Lección: **tras una carga, probar siempre con una pregunta que solo se pueda responder con el documento nuevo.**

---

## 🧪 Evaluación

### Método

La evaluación se hizo con **consultas propias documentadas**, registradas en el *Formulario 3 — Validación por el autor*. Es una **evaluación manual estructurada, inspirada en Ragas** (fidelidad al contexto, relevancia de la respuesta y calidad de la recuperación; Es et al., 2023) **y en el NIST AI RMF 1.0 / AI 600-1** (medición y gestión de riesgos). No se usaron las métricas automáticas de Ragas: el veredicto lo da una persona contrastando cada respuesta con el documento oficial.

Para cada ejecución se registra: consulta, tipo, respuesta de referencia y fuente, resultado (*Correcta*, *Parcialmente correcta*, *Incorrecta*, *Abstención adecuada* o *Abstención indebida*), si la cita es correcta, tipo de error y gravedad (crítico, mayor o menor). Un resultado es «Correcta» solo si la respuesta **y** la cita coinciden con la fuente oficial. Cuando se corrigió el código, se **conservaron los resultados de la versión inicial** y se repitieron las pruebas afectadas sobre la versión final.

**Muestra:** 175 ejecuciones del 07 al 11/11/2026 (59 consultas distintas, muchas repetidas tras cada corrección). Incluye consultas directas, de requisito específico, ambiguas, de varias condiciones, de identificación de norma, sin respaldo en el corpus y fuera de alcance o maliciosas.

### Resultados

| Indicador | Versiones iniciales / intermedias | Versión final | Total |
|-----------|----------------------------------:|--------------:|------:|
| Exactitud (correctas ÷ evaluadas) | 34/66 = **51,5 %** | 28/37 = **75,7 %** | 62/103 = 60,2 % |
| Precisión de las citas | 48/64 = **75,0 %** | 34/36 = **94,4 %** | 82/100 = 82,0 % |
| Abstención adecuada | 25/27 = 92,6 % | 11/14 = 78,6 % | 36/41 = 87,8 % |
| Respuestas incorrectas | — | **0** | — |

En la versión final hay 6 respuestas parcialmente correctas y 3 abstenciones indebidas, ninguna de gravedad crítica. Las cifras de citas son provisorias: se cuenta la cita principal de cada ejecución.

### Errores críticos detectados y corregidos

| Error | Corrección |
|-------|-----------|
| Límite de dosis para el público: respondía 0,1 mSv/año (criterio de optimización) en lugar de 1 mSv/año (AR 10.1.1) | Glosario de búsqueda + reglas de fidelidad; versión final correcta |
| Límite de dosis de trabajadores (consulta en inglés): respondía 5 mSv/año en lugar de 20 mSv (promedio de 5 años) y 50 mSv máximo en un año | Ampliación del glosario a consultas en inglés; versión final correcta |
| Transporte «Categoría II»: mezclaba requisitos de protección física (AR 10.13.1) con los de bultos de transporte (AR 10.16.1) | Instrucción específica: dos secciones separadas por significado; versión final correcta |

### Qué anduvo bien

- **Abstenciones y robustez:** las consultas sobre normas o artículos inexistentes (art. 150 de la Ley 24.804, AR 99.9.9), fuera de alcance (NRC de Estados Unidos, receta de cocina), sobre tecnología sin regulación (reactor de fusión) y los intentos de extraer el prompt y las claves se resolvieron con abstención adecuada en la versión final.
- **Sanciones y responsabilidad civil:** se separan las sanciones propiamente dichas de las demás facultades de la ARN, y la respuesta sobre responsabilidad civil empieza por la definición de daño nuclear.
- **Informe de seguridad:** la frecuencia de actualización y el momento de presentación se responden correctamente con la AR 4.9.2 y la AR 3.9.1; sobre el contenido, no inventa y lo declara.
- **Trazabilidad:** siempre hay etiqueta de fuente a nivel de documento, con la revisión.

### Hallazgos abiertos

- **Programas de examen:** la versión final responde «No encontré» (regresión). Requiere revisar el log `RAG` de esa consulta.
- **Cristalino para el público:** la respuesta se contradice con el límite del público de otra consulta. Pendiente.
- **TNP:** la respuesta omite el artículo III (salvaguardias) y describe el artículo V como de energía nuclear con fines pacíficos; parcialmente correcta. Pendiente.
- **Errata «Tlatelocmo»:** aparece a veces en respuestas sobre el Tratado de Tlatelolco (la interfaz ya corrige «Tlateloco»).
- **CTBT:** no está indexado; el asistente se abstiene del estado para Argentina. Sin verificar contra la fuente oficial lo que dice de la definición general.
- **24 ejecuciones de la etapa inicial** quedaron sin veredicto asignado y no entran en los indicadores.

### Lo que no se midió

| Medición | Estado |
|----------|--------|
| Latencia (media y P95) y costo por consulta | Pendiente |
| Recuperación documental (Precision@8, Recall@8, MRR) | Pendiente: cada ejecución tiene anotada la fuente de referencia, falta cruzarla con las fuentes del log `RAG` |
| Estabilidad sobre una versión congelada | **Parcial**: 41 de las 59 consultas se ejecutaron más de una vez, pero casi todas las repeticiones fueron entre versiones distintas |
| Consultas con código exacto (por ejemplo «AR 10.1.1») | **Parcial**: hay 18 ejecuciones que nombran una ley, norma o artículo, pero ninguna con un código AR existente |
| Vigencia y versión (normas derogadas o con varias revisiones) | Pendiente |
| Tarea comparativa con un profesional | Pendiente |
| Evaluación por especialistas del sector (Formularios 1 y 2) | Pendiente |

**Trazabilidad:** a nivel de documento es buena (siempre hay etiqueta de fuente); a nivel de página es nula (no hay metadata). Que una etiqueta aparezca no garantiza que la afirmación sea correcta.

---

## ⚠️ Limitaciones y riesgos

1. **Alucinaciones.** El modelo puede afirmar algo que no está en los documentos, o citar una norma que no corresponde. Las reglas del prompt y el control de números reducen el riesgo, no lo eliminan: en la versión final el 24,3 % de las respuestas evaluadas no fue plenamente correcto (6 parcialmente correctas y 3 abstenciones indebidas, de 37).
2. **Cifras mal atribuidas.** El control de números no detecta un valor real asignado al grupo o concepto equivocado. En seguridad radiológica, una respuesta parcial puede inducir a error.
3. **Cobertura.** Solo responde con base documental sobre lo indexado (86 documentos); no hay verificación de que cada norma esté en su última revisión. La normativa cambia. Hay temas sin documentos, como el CTBT.
4. **Sin número de página.** La verificación exige buscar en el documento.
5. **Recuperación imperfecta.** Con `top_k = 8` (6 con Groq) puede quedar afuera el fragmento clave; las tablas descartadas o mal extraídas por OCR no se pueden responder o se responden mal. La recuperación aún no se midió de forma sistemática.
6. **Guías vs. normas.** Una guía es orientativa; el riesgo es que el usuario la lea como requisito. El asistente lo aclara, pero el modelo puede equivocarse.
7. **Tratados y normas internacionales.** Los datos finos (fechas, partes, artículos) deben verificarse siempre contra el texto oficial.
8. **Evaluación limitada.** La muestra es pequeña y no independiente (175 ejecuciones de 59 consultas distintas, repetidas tras cada corrección); la valida el propio autor, sin revisión independiente; y no hay criterios de aceptación acordados con el tutor. Los porcentajes son descriptivos y no demuestran aptitud para uso operativo.
9. **No determinismo.** Aun con temperatura 0,2, la misma consulta puede dar respuestas distintas.
10. **Seguridad y operación.** Rate limiting en memoria por instancia; dependencia de servicios externos (Pinecone, Vercel y uno o dos proveedores del modelo) con planes gratuitos y límites que pueden cambiar; las API keys deben rotarse si se exponen.
11. **Uso profesional.** El asistente **no reemplaza la norma original ni el criterio profesional**. Toda respuesta debe verificarse en el documento oficial antes de decidir.

---

## 🤔 ¿Por qué este camino y no otro?

### Alternativa descartada: fine-tuning del modelo

Reentrenar un LLM con la normativa produciría un modelo que "conoce" la documentación, pero con alto costo de cómputo, y debería repetirse con cada norma nueva. Además, no daría trazabilidad por documento. Con RAG, agregar un documento es indexarlo.

### Alternativa descartada: búsqueda por palabras clave (BM25 / Elasticsearch)

Un buscador textual encuentra documentos que *contienen* las palabras de la consulta. Si el usuario pregunta "¿qué pasa si supero el límite de exposición anual?", no encontraría fragmentos sobre "incumplimiento de dosis máxima" porque no comparten vocabulario. La búsqueda semántica captura similitud de *significado*. Aun así, la búsqueda semántica falló con términos que la norma nombra de otra forma (por ejemplo, ALARA frente a «optimización de la protección»), y eso se resolvió con un glosario. Una búsqueda híbrida es una mejora posible; ver Roadmap.

### Alternativa descartada: todo el corpus en el contexto del LLM

Incluir todos los documentos en el prompt es inviable en costo y latencia. RAG recupera solo los fragmentos relevantes.

### Alternativa descartada: LangChain / LlamaIndex

Se descartaron por su complejidad de debugging: cuando algo falla en la recuperación o generación, las abstracciones dificultan ver en qué capa está el problema. La implementación directa de las llamadas a Pinecone y a los proveedores del modelo es más código, pero transparente. Esa transparencia sirvió en la práctica para diagnosticar el error de *namespace* y, más tarde, para agregar la búsqueda dirigida, el cupo de guías y el control de números.

---

## 📁 Estructura del proyecto

```
/
├── api/
│   └── chat.js            # Función serverless: pipeline RAG completo
│                          # 1. Arma las consultas de búsqueda (glosario, seguimientos)
│                          # 2. Busca en Pinecone (general, guías, fuentes dirigidas)
│                          # 3. Arma el prompt con el contexto y las instrucciones
│                          # 4. Llama al modelo (proveedor principal / respaldo), con streaming
│                          # 5. Control de números, rate limiting y validación de entrada
│
├── src/
│   ├── App.jsx             # Interfaz del chat, prompt del sistema y limpieza de la respuesta
│   └── main.jsx            # Punto de entrada de React
│
├── index.html
├── vite.config.js
├── package.json
├── LICENSE.txt
└── README.md
```

Los scripts de mantenimiento del índice (`indexar_guias.py`, `indexar_documentos.py`, `inventario_fuentes.py`, `probar_busqueda.py`, `borrar_documento.py`) se corren localmente y no forman parte del despliegue.

**¿Por qué toda la lógica RAG en una serverless function?** Mantiene las API keys del lado del servidor, sin exponerlas en el bundle del cliente.

**Respuesta en streaming:** la función envía la respuesta como líneas JSON (NDJSON) con fragmentos de texto, de modo que el texto aparece progresivamente. El aviso del control de números se envía al final del flujo.

**Nota honesta:** en un proyecto más grande valdría la pena separar `App.jsx` en componentes más chicos. Hoy toda la interfaz vive en un solo archivo por simplicidad.

---

## ⚙️ Variables de entorno

```env
# Obligatoria
PINECONE_API_KEY=       # Búsqueda en Pinecone (los embeddings los genera Pinecone)

# Proveedor del modelo: al menos uno de los dos
GROQ_API_KEY=           # Groq (gpt-oss-120b)
LLM_BASE_URL=           # Alternativo compatible con la API de OpenAI (URL de chat/completions)
LLM_API_KEY=            # Clave del proveedor alternativo

# Opcionales
GROQ_MODEL=             # Modelo de Groq (por defecto openai/gpt-oss-120b)
LLM_MODEL=              # Modelo del alternativo (por defecto openai/gpt-oss-120b)
LLM_PRIMARY=            # "groq" o "alt". Sin definir: el principal es el alternativo, si está configurado
LLM_MAX_TOKENS=         # Tope de salida del alternativo (por defecto 2000)
LLM_TOKEN_BUDGET=       # Presupuesto de tokens por consulta del alternativo (por defecto 24000)
LLM_TOP_K=              # Fragmentos recuperados (por defecto 8 con el alternativo, 6 solo con Groq)
LLM_REASONING_EFFORT=   # low | medium | high | none (por defecto low)
RAG_SCORE_MIN=          # Puntaje mínimo de relevancia; si el mejor está por debajo, se avisa cobertura incompleta
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

## ✅ Implementado

**Datos**
- Normativa y tratados (primera etapa), guías regulatorias de la ARN con encabezado que las vincula a su norma, y documentos generales (acuerdos, TNP, Tlatelolco, CNEA, INVAP) con `indexar_documentos.py`.
- Inventario de fuentes del índice (86 documentos, 2.087 fragmentos) y scripts de prueba de búsqueda y de borrado seguro.
- Corrección del *namespace* de búsqueda y rotación de API keys.

**Recuperación y generación**
- Dos proveedores del mismo modelo con respaldo automático y presupuesto de tokens por proveedor.
- Búsqueda de la pregunta actual siempre sola, glosario de términos, búsqueda dirigida a guías, fuentes dirigidas y cupo mínimo de guías.
- Instrucciones de fidelidad y de ausencia, instrucciones por tema (Categoría, sanciones, responsabilidad civil, CNEA) y control de números.
- Reglas anti-invención en el prompt (valores numéricos, fechas, siglas, artículos) y `reasoning_effort: low`.

**Interfaz**
- Etiquetas de fuente (doradas para normas, celestes para guías), ocultas cuando la respuesta no encontró información.
- Botón de copiar respuesta, exportar conversación a `.txt`, lectura en voz alta, contador de caracteres, tablas markdown, formulario de comentarios y meta tags Open Graph / Twitter Card.
- Limpieza del texto de la respuesta: citas sueltas, referencias internas a «fragmentos» y erratas frecuentes del modelo.

**Evaluación**
- Formulario 3 con 175 ejecuciones, comparación entre versión inicial y final, clasificación de errores y plan de mejora.

---

## 🧩 Roadmap

| Prioridad | Mejora | Justificación |
|-----------|--------|---------------|
| Alta | 🔎 Medir la recuperación documental (Precision@8, Recall@8) con el log `RAG` | Separar el error de búsqueda del error del modelo |
| Alta | 🐞 Resolver los hallazgos abiertos: programas de examen, cristalino del público, TNP (art. III y V), errata «Tlatelocmo» | Errores observados en la versión final |
| Alta | 🧪 Revisión independiente de una muestra por especialistas (Formularios 1 y 2) y criterios de aceptación acordados con el tutor | Hoy la valida el propio autor |
| Alta | 🔁 Repetir cada consulta sobre una versión congelada | Medir estabilidad y reproducibilidad |
| Alta | 📄 Archivo `.env.example` | Facilita saber qué variables se necesitan |
| Media | 🗂️ Verificar contra la página oficial de la ARN que cada norma esté en su última revisión | El inventario no lo comprueba |
| Media | 📜 Incorporar el CTBT si corresponde al alcance, y consultas sobre vigencia y normas derogadas | Cobertura y vigencia |
| Media | ⏱️ Medir latencia (media y P95) y costo por consulta | Viabilidad operativa |
| Media | 📊 Reindexar la guía AR 1 sin filtro de tablas (y revisar AR 6) | Hay valores numéricos que el asistente no puede encontrar |
| Media | 📎 Agregar `pagina` al pipeline de indexación | El índice actual no la tiene; las citas no muestran página |
| Media | 🔒 Rate limiting con almacenamiento persistente (Upstash / Vercel KV) | El límite actual es por instancia |
| Media | 🔎 Búsqueda híbrida y reranking | Mejorar que el fragmento clave llegue al modelo |
| Media | 🌐 Soporte multilingüe (inglés / portugués) | OIEA y ABACC operan en inglés |
| Baja | 🧱 Separar `App.jsx` en componentes | Mantenimiento |
| Baja | ✅ Tests automatizados de `/api/chat` con el banco de consultas | Evitar romper el pipeline sin notarlo |
| Baja | 🔐 Panel de administración para indexar documentos | Agregar normas sin tocar código |

---

## 📚 Bibliografía

- Es, S., James, J., Espinosa-Anke, L. y Schockaert, S. (2023). *RAGAS: Automated Evaluation of Retrieval Augmented Generation.* arXiv:2309.15217.
- Lewis, P. et al. (2020). *Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks.* Advances in Neural Information Processing Systems 33 (NeurIPS 2020).
- National Institute of Standards and Technology (2023). *Artificial Intelligence Risk Management Framework (AI RMF 1.0).* NIST AI 100-1.
- National Institute of Standards and Technology (2024). *Artificial Intelligence Risk Management Framework: Generative Artificial Intelligence Profile.* NIST AI 600-1.
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
