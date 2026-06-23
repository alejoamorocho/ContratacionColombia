# Arquitectura técnica

Esta página describe, a fondo, cómo está construido el observatorio público: el flujo que va de la fuente de datos al navegador, por qué la decisión central es ser **estático**, cómo se valida la forma de los datos en tiempo de ejecución, cómo se organiza el código (secciones dirigidas por configuración, materializador modular) y qué garantías de seguridad —y qué postura ética— se derivan de todo ello.

El resumen en una línea: **BigQuery → `materialize_public.py` → `public/data/*.json` → SPA estática**. El sitio público nunca toca BigQuery: solo lee archivos JSON ya calculados, valida su forma y los pinta.

Principio rector de todo el proyecto, también a nivel de arquitectura: **describe, no juzga**. No hay scoring, ni semáforos, ni cómputo en línea que "decida" nada sobre nadie. El sitio sirve estadística descriptiva neutral y agregada.

---

## Visión general en una frase

| Capa | Tecnología | ¿Se despliega? | Rol |
|---|---|---|---|
| Fuente | BigQuery (privado) | No | Datos crudos de las 6+ fuentes |
| Materialización | Python + 45 `.sql` | No | Consulta, deduplica, normaliza, agrega y escribe el snapshot |
| Snapshot | JSON (`public/data/`) | Sí | La "base de datos" del sitio: el contrato entre lo privado y lo público |
| Presentación | React 19 + TypeScript + Vite | Sí | SPA estática que valida (Zod) y pinta el snapshot |

La frontera importante es el **snapshot JSON**: todo lo costoso y sensible (credenciales, acceso a la fuente, lógica de consulta) vive *antes* de generar el JSON y **nunca** se despliega. Lo que llega al CDN son agregados nacionales sin identidad de personas.

---

## El flujo, paso a paso

```
  ┌───────────────┐   data/materialize_public.py     ┌──────────────────┐   build (Vite)   ┌──────────────────┐
  │   BigQuery     │   + data/queries/*.sql (45)      │  public/data/     │  ───────────▶    │   Sitio estático │
  │  (privado)     │  ─────────────────────────────▶  │  *.json           │                  │  React 19 + Vite  │
  │                │                                  │  (snapshot         │                  │  (SPA en CDN)    │
  │  contratos,    │   1) tabla base limpia            │   versionado)      │   ◀── fetch ───  │  validación Zod  │
  │  procesos,     │      (dedup por id, valor>0)      │                    │   (solo lectura) │  en runtime      │
  │  PAA, BPIN,    │   2) normaliza (DANE, modalidad,  │                    │                  │  gráficas + mapa │
  │  SIRI, CNE,    │      objeto, partidos)            │                    │                  │                  │
  │  RUES…         │   3) un JSON por sección          │                    │                  │                  │
  └───────────────┘                                   └──────────────────┘                  └──────────────────┘
     lee la fuente          se corre A MANO                snapshot agregado                   cero backend:
     (requiere acceso)      cuando se refresca             commiteado al repo                  solo sirve archivos
```

Hay tres etapas claramente separadas, con responsabilidades que no se solapan:

1. **Materialización (fuera de línea, privada).** Quien tenga acceso a BigQuery ejecuta `python data/materialize_public.py`. El script crea una **tabla base limpia** (`_contratos_pub`: ventana 2022–2026, `valor > 0`, **deduplicada por `id`**), corre las consultas de `data/queries/*.sql` y los *builders* en Python sobre ella, **normaliza** valores (códigos DANE, modalidades, etiquetas de objeto, partidos), coacciona todo a tipos JSON-safe y escribe **un archivo JSON agregado por sección** en `public/data/`. Este paso es **manual** y ocurre solo cuando los mantenedores quieren refrescar el snapshot. Detalle en **[Materialización](02-Datos-y-Materializacion.md)**.

2. **Build (compilación).** `npm run build` ejecuta `tsc -b && vite build`: TypeScript verifica tipos en todo el proyecto y Vite compila la SPA de React, copiando `public/data/*.json` al directorio `dist/`. El resultado es un paquete de archivos estáticos: HTML, JS, CSS, fuentes y los JSON del snapshot.

3. **Servir (en línea, pública).** Cualquier hosting de archivos sirve `dist/`. En el navegador, cada sección hace un único `fetch('data/<seccion>.json')`, **valida el JSON contra su esquema Zod** y pinta las gráficas. No hay servidor de aplicación, ni base de datos, ni funciones en tiempo de ejecución.

---

## Por qué estático: la decisión central

La decisión de arquitectura más relevante es que el sitio público **no tiene backend**. Esto no es una limitación accidental: es el diseño, y tiene tres justificaciones —costo, seguridad, portabilidad— y una cuarta, **ética**.

### Costo

- Servir archivos estáticos desde un CDN cuesta casi nada y escala sin esfuerzo: el mismo bundle responde a 10 o a 10.000 visitantes simultáneos.
- No hay cómputo por petición, ni base de datos encendida, ni funciones que facturen invocaciones. El gasto recurrente del sitio público tiende a cero.
- Refrescar los datos es **commitear archivos JSON nuevos**, no desplegar infraestructura.

### Seguridad

- **Sin backend no hay superficie de ataque de backend.** No hay endpoint que inyectar, ni consulta que abusar, ni autenticación que romper, porque no existen en el sitio público.
- Los datos servidos ya son **agregados** en su forma de presentación: el visitante recibe totales, percentiles, rankings y conteos nacionales —nunca la tabla cruda, ni credenciales, ni queries.
- El acceso a BigQuery (la parte cara y sensible) queda **del lado de los mantenedores**, detrás de la materialización manual. Un fork puede correr el dashboard completo **sin tener jamás acceso a la fuente original**, usando el snapshot incluido en el repo.

### Portabilidad

- Al ser estático, se despliega en **cualquier** hosting de archivos: Firebase Hosting, Netlify, Vercel, Cloudflare Pages o GitHub Pages. No hay dependencia de proveedor.
- Hacer un fork no requiere aprovisionar nada: `git clone`, `npm install`, `npm run dev` y funciona con el snapshot incluido. Ver **[Hacer un fork](04-Hacer-Un-Fork.md)**.

### Por qué estático *es* una postura ética

Ser estático no es solo eficiente: refuerza el principio **"describe, no juzga"** a nivel de infraestructura.

- **No hay cómputo que "decida" sobre una persona en línea.** El sitio no puede generar un perfil bajo demanda, ni puntuar a un contratista, ni responder "¿es corrupto X?": solo sirve agregados pre-calculados. La ausencia de backend hace **imposible** —no solo desaconsejable— el uso individualizado y acusatorio.
- **No se publica identidad de personas.** Las "señales" se sirven como **agregados nacionales** (conteos y valores), sin nombres, NITs ni perfiles. La sección de cruces y la página genérica de señal (`Senal.tsx`) muestran *cuántos* y *cuánto*, nunca *quién*. Esa decisión está cableada en los datos (los `shape_*` y *builders* nunca emiten un NIT) y en la UI (no hay vista de detalle por individuo).
- **El dato es verificable y reproducible.** Cualquiera puede leer las 45 consultas SQL, correr `verify_snapshot.py` y reconciliar cada cifra contra la fuente. No hay caja negra.

---

## Estructura de carpetas

```
vectorvi-public/
├── data/                       # Pipeline (Python) — NO se despliega
│   ├── materialize_public.py   # Orquestador: tabla base, shape_*, builders, escribe JSON
│   ├── queries/                # 45 archivos .sql, uno o varios por sección
│   ├── test_materialize.py     # Prueba las shape_* puras sin tocar BigQuery
│   ├── verify_snapshot.py      # Reconcilia el snapshot contra BigQuery + guards
│   └── requirements.txt
│
├── public/
│   └── data/                   # Snapshot JSON versionado (la "BD" del sitio)
│       ├── meta.json           # Ventana, corte por fuente, fuentes, notas
│       ├── panorama.json       # KPIs macro + por año + top sectores (Inicio)
│       ├── quien.json          # Entidades (por NIT), niveles de gobierno, sectores
│       ├── como.json           # Modalidades + cuota directa (por nº y por valor)
│       ├── planeacion.json     # PAA (planeación)
│       ├── inversion.json      # BPIN (inversión)
│       ├── ejecucion.json      # Contratado → facturado → pagado
│       ├── donde.json          # Agregados por departamento (DANE)
│       ├── procesos.json       # Embudo de procesos
│       ├── senales.json        # Concentración, percentiles
│       ├── senales_extra.json  # 11 señales/cruces agregados y neutrales
│       ├── sanciones.json      # Sanciones SIRI
│       ├── electoral.json      # Aportes de campaña (CNE)
│       ├── cruces.json          # Donante↔contratista, sancionado↔contratista
│       ├── analisis.json       # 6 secciones analíticas (género, PYME, duración…)
│       └── kpis_extra.json     # KPIs nuevos (cadena BPIN, HHI, per cápita, multas…)
│
├── src/                        # SPA (React 19 + TypeScript) — se compila a dist/
│   ├── App.tsx                 # Router: rutas → páginas (lazy-loaded)
│   ├── main.tsx                # Punto de entrada
│   ├── pages/                  # Una página por sección + páginas GENÉRICAS (Senal, Analisis)
│   ├── components/             # Shell narrativo, layout, mapa, badges, notas
│   │   ├── charts/             # KPICard, VBarChart, VLineChart, VPieChart, ChartFootnote
│   │   └── ui/                 # Primitivas (Card)
│   ├── hooks/                  # usePublicData — fetch + validación Zod del JSON
│   ├── lib/                    # schemas (Zod), types, senales, analisis, config, formatters, chartTheme
│   └── styles/                # tokens.css, globals.css, tones.css, badges.css
│
├── scripts/publish_wiki.py     # Publica esta wiki
├── firebase.json               # Hosting: rewrites SPA + redirect /admin + headers de seguridad
├── firestore.rules             # deny-all (defensa en profundidad)
└── vite.config.ts              # Build + entorno de test (vitest)
```

Regla mental para orientarse:

| Carpeta | Lenguaje | ¿Se despliega? | Rol |
|---|---|---|---|
| `data/` | Python + SQL | **No** | Genera y verifica el snapshot desde la fuente |
| `public/data/` | JSON | Sí (copiado a `dist/`) | El dato que lee el sitio |
| `src/` | TypeScript + React | Sí (compilado) | La presentación |

---

## La SPA: React 19 + TypeScript + Vite

El frontend es una **Single Page Application** moderna y deliberadamente austera:

- **Vite** como bundler y servidor de desarrollo (HMR instantáneo). El build es `tsc -b && vite build`.
- **React 19** + **TypeScript** (estricto), con verificación de tipos en el build.
- **`react-router-dom` v7** para el enrutado **en cliente**: el router vive en `src/App.tsx` y cada página se carga de forma **lazy** (`React.lazy` + `Suspense`), de modo que el bundle inicial es pequeño y cada sección se descarga solo cuando se visita.
- **Recharts** + **react-simple-maps** / **d3-geo** para las gráficas y el mapa coroplético de Colombia.
- **Zod** para validar el snapshot en tiempo de ejecución (ver más abajo).

### Cero cómputo: qué NO hay

El sitio público mantiene cuatro invariantes "cero". Son **invariantes del proyecto**: cualquier fork que quiera seguir siendo "el observatorio público" debe conservarlas. Si las rompes, dejas de tener un sitio estático.

| Invariante | Qué significa |
|---|---|
| **Cero funciones** | No hay Cloud Functions, API routes ni serverless. El sitio solo sirve archivos. |
| **Cero base de datos** | No hay Firestore, SQL ni KV en tiempo de ejecución. La "base de datos" es el conjunto de JSON estáticos en `public/data/`. |
| **Cero autenticación** | No hay login, sesiones ni tokens. Todo es público de lectura por diseño. |
| **Cero llamadas a terceros** | El único `fetch` del navegador es a los JSON del propio origen. No se llama a BigQuery ni a ninguna API externa en runtime. |

### El enrutado y las páginas genéricas

`App.tsx` define las rutas dentro de un `DashboardLayout` compartido. Conviven dos tipos de ruta:

- **Rutas de sección fijas** — `/`, `/quien`, `/como`, `/planea`, `/invierte`, `/ejecuta`, `/donde`, `/senales`, `/cruces`, `/acerca` —, cada una con su componente dedicado en `src/pages/`.
- **Rutas genéricas dirigidas por parámetro**:
  - `/senal/:key` → componente `Senal.tsx`
  - `/analisis/:key` → componente `Analisis.tsx`

Estas dos páginas genéricas son la pieza clave de la **arquitectura config-driven**: en lugar de escribir una página por cada señal o cada análisis, hay **una sola** página por familia, que lee el `:key` de la URL, busca su configuración en un catálogo (`senales.ts` / `analisis.ts`) y se renderiza a partir de ella. Cualquier ruta desconocida redirige a `/` (`<Navigate to="/" replace />`), y `/admin` redirige al sitio administrativo.

---

## Secciones dirigidas por configuración

Buena parte del valor del dashboard vive en dos catálogos declarativos. Añadir una nueva "señal" o un nuevo "análisis" no requiere escribir un componente: basta con (1) agregar la consulta/builder en la materialización y (2) declarar una entrada de configuración. La página genérica hace el resto.

### `src/lib/senales.ts` — el catálogo de señales

`SENALES` es un `Record<string, SenalConfig>` con **11 entradas** (adiciones, contratos no planeados, brechas de inversión, prórroga sin ejecución, monopolio municipal, supervisor-contratista, puerta giratoria, redes de relaciones, sancionado en otro depto., donante post-elección, cluster electoral). Cada entrada declara:

```ts
interface SenalConfig {
  label: string;        // etiqueta corta (sidebar / título)
  tone: Tone;           // color del módulo
  pregunta: string;     // título-pregunta ciudadana
  contexto: string;     // qué muestra la señal
  callout: string;      // encuadre NEUTRAL (no acusatorio)
  kpis: SenalKpi[];     // qué claves de senales_extra.json mostrar
  nota: string;         // metodología + caveat
}
```

El tono neutral es **estructural**: hay una constante `NEUTRAL` reutilizada en todos los `callout` ("Es un dato descriptivo sobre registros públicos; no implica irregularidad y merece verificación caso por caso"). La página `Senal.tsx` lee la entrada por `:key`, toma los agregados de `senales_extra.json`, pinta los KPIs y dibuja una **barra de proporción** que dimensiona la señal frente al universo nacional (qué % de los 3.969.440 contratos o del valor total representa). Si la `:key` no existe, redirige a `/`.

### `src/lib/analisis.ts` — el catálogo de análisis

`ANALISIS` es un `Record<string, AnalisisConfig>` con **6 secciones analíticas**: género de quien firma, PYMEs, duración, estacionalidad, financiación y crecimiento. Cada una declara KPIs, un `chart` (tipo de gráfica, ejes, series, layout) y una nota metodológica. La página `Analisis.tsx` lee la entrada por `:key`, toma `data.items[key]` de `analisis.json` y compone KPIs + gráfica + metodología de forma uniforme.

> Nota de exactitud: en la sección **crecimiento** la cifra de mercado verificada es **30 sectores comparables** (el copy histórico que decía "31" está pendiente de actualizar en `analisis.ts`).

### Por qué config-driven

| Beneficio | Cómo lo logra |
|---|---|
| **Consistencia** | Todas las señales/análisis comparten la misma estructura visual y el mismo tono neutral. |
| **Bajo costo de extensión** | Una señal nueva = 1 entrada de config + 1 query, sin un componente nuevo. |
| **Una sola fuente del copy** | El texto (pregunta, contexto, callout, nota) vive en un único archivo, fácil de auditar. |
| **Tono garantizado** | La constante `NEUTRAL` y la estructura "callout + nota" impiden que se cuele lenguaje acusatorio. |

---

## El shell de storytelling

Todas las secciones —fijas y genéricas— comparten un mismo marco narrativo, **`PageShell`** (`src/components/PageShell.tsx`), que impone el orden de lectura:

```
pregunta → contexto → (callout opcional) → datos → metodología → disclaimer
```

Esto da coherencia y refuerza el "describe, no juzga": cada sección abre planteando una **pregunta ciudadana** y explicando qué muestra, antes de presentar cualquier cifra, y cierra siempre con un **disclaimer** (`DisclaimerFooter`) y, cuando aplica, una nota de **[Metodología](03-Metodologia.md)** (`MethodologyNote`).

### El sistema de tonos

Cada sección declara un **tono** de color mediante el atributo `data-tone`. El shell expone ocho tonos, definidos en `src/styles/tones.css`:

| Tono | Sección | Color |
|---|---|---|
| `who` | ¿Quién contrata? | Azul `#58a6ff` |
| `how` | ¿Cómo contrata? | Violeta `#bc8cff` |
| `plan` | ¿Qué se planea? | Teal `#2dd4bf` |
| `invest` | ¿En qué se invierte? | Dorado `#e3b341` |
| `exec` | ¿Se ejecuta? | Celeste `#79c0ff` |
| `where` | ¿Dónde? | Verde `#3fb950` |
| `signal` | ¿Hay señales? | Ámbar `#f0883e` |
| `context` | Contexto / neutral (fallback) | Gris `#8b949e` |

El tono se hereda vía la variable CSS `--shell-tone` y colorea el sobretítulo, el callout narrativo, los bordes de acento y las gráficas. El estilo base (paleta oscura tipo GitHub/Vercel, radios de 6px, espaciado en múltiplos de 4px, sin sombras) vive en `tokens.css` y `globals.css`. Las secciones y su contenido se documentan en **[Las secciones](07-Las-Secciones.md)**.

### Cómo una página obtiene sus datos

Cada página es un componente en `src/pages/`, cargado de forma **lazy** desde `App.tsx`, que lee su JSON con el hook **`usePublicData`**:

```ts
const { data, loading, error } = usePublicData<PanoramaData>('panorama');
```

El hook hace un único `fetch('data/<seccion>.json')` relativo al `BASE_URL` del despliegue (definido en `src/lib/config.ts` como `import.meta.env.BASE_URL`, lo que permite servir bajo un subpath, p. ej. en GitHub Pages). No hay estado global, ni store, ni cliente de datos: cada sección es independiente y se hidrata con su propio archivo.

---

## Validación Zod en runtime: una sola fuente de tipos

Una pieza central de robustez es que **la forma de los datos se define una sola vez** y se valida **en el navegador, al cargar**.

### `src/lib/schemas.ts` es la única fuente de verdad

Los esquemas **Zod** de `schemas.ts` describen exactamente la estructura de cada JSON del snapshot. A partir de ellos:

- **Los tipos de TypeScript se derivan** con `z.infer` (`export type PanoramaData = z.infer<typeof panoramaSchema>`). `types.ts` solo **re-exporta** esos tipos: no hay una definición de tipos duplicada que pueda divergir del esquema.
- **El hook valida en runtime.** `usePublicData` busca el esquema de la sección en el registro `SCHEMAS` y, si existe, ejecuta `schema.safeParse(json)`. Si el JSON llega **malformado o desactualizado**, la app **falla de forma clara y controlada** —con un mensaje que indica la ruta del campo y el problema— en lugar de pintar `undefined` o romperse de manera silenciosa:

```ts
const res = schema.safeParse(j);
if (!res.success) {
  const issue = res.error.issues[0];
  throw new Error(`Datos de '${seccion}' inválidos: ${issue?.path.join('.')} — ${issue?.message}`);
}
```

### Por qué validar en el borde

Para datos estáticos **regenerados a mano**, validar al cargar es la defensa correcta:

- El snapshot lo produce un script que se corre manualmente; un cambio de forma en la materialización que no se refleje en el frontend se detecta **de inmediato** al cargar, no como un bug visual sutil.
- El registro `SCHEMAS` cubre las 16 secciones (`meta`, `panorama`, `quien`, `como`, `donde`, `senales`, `procesos`, `planeacion`, `inversion`, `ejecucion`, `sanciones`, `electoral`, `cruces`, `senales_extra`, `analisis`, `kpis_extra`). El esquema `kpisExtraSchema` describe con detalle los KPIs nuevos (cadena BPIN de cuatro estados, tamaño típico por dimensión, distribución de pago en tramos, HHI por sector, antigüedad del contratista, multas SECOP, per cápita por depto, reincidencia, fidelidad del PAA).

---

## El materializador modular

`data/materialize_public.py` está diseñado para ser **testeable y auditable**, separando con rigor la lógica pura del acceso a la nube.

### `shape_*`: funciones puras

Las funciones `shape_panorama`, `shape_quien`, `shape_como`, `shape_donde`, `shape_senales`, `shape_meta`, `shape_procesos`, `shape_planeacion`, `shape_inversion`, `shape_ejecucion`, `shape_cruces`, `shape_sanciones`, `shape_electoral`, `shape_genero`, `shape_pyme`, `shape_duracion`, `shape_estacionalidad`, `shape_financiacion` y `shape_crecimiento` son **puras**: reciben filas como `list[dict]` y devuelven el `dict` con **exactamente la forma del esquema Zod** correspondiente. No tocan BigQuery, así que se prueban sin credenciales (`data/test_materialize.py`). Toda coerción a tipos JSON-safe se centraliza en tres helpers (`_i` entero, `_f` flotante que acepta `Decimal` de BQ, `_s` string).

### `_build_*`: builders sobre la nube

Tres builders construyen las secciones más ricas ejecutando consultas directamente y dando forma a sus resultados:

- **`_build_analisis`** — las 6 secciones analíticas (género, PYME, duración, estacionalidad, financiación, crecimiento).
- **`_build_senales_extra`** — las **11 señales/cruces** agregadas y neutrales, con queries que cruzan contratos contra sanciones, campañas, SIGEP, RUES y la red de relaciones. Llevan **guards anti fan-out** explícitos: como un NIT puede aparecer en varias filas de la tabla cruzada (varias campañas, varias relaciones, sanciones en varios deptos.), un `JOIN` directo multiplicaría el valor del mismo contrato; por eso se deduplica el lado cruzado con `DISTINCT`/`EXISTS` para sumar cada contrato **una sola vez**.
- **`_build_kpis_extra`** — los KPIs nuevos: cadena BPIN (vigente→comprometido→obligado→pagado), composición del PAA por origen, mezcla competitiva/directa por nivel, tamaño típico (p25/mediana/p75) por nivel/modalidad/objeto, distribución del pago en tramos, **HHI** de concentración por sector, multas SECOP (panorama + cruce por NIT), antigüedad del contratista al firmar (RUES), contratación per cápita por departamento (catálogo DANE 2023 embebido), reincidencia entidad-contratista y fidelidad del PAA.

### La tabla base limpia

Antes de cualquier agregado, `run()` crea **`_contratos_pub`**: una `CREATE OR REPLACE TABLE` que aplica la ventana 2022–2026, `valor > 0` y, sobre todo, **deduplica por `id`** conservando la última versión por `ultima_actualizacion` (la fuente trae ~0,3 % de ids repetidos por reingestas/versiones). Todos los agregados leen de aquí —`_sql()` reescribe las referencias a `contratos` para apuntar a la base limpia— de modo que **ningún contrato se cuenta ni se suma dos veces**. La tabla se elimina al final (`_drop_base`).

### Normalizaciones centralizadas

La limpieza vive **una sola vez**, en la tabla base, en lugar de repetir el mismo `CASE` en cada `.sql` (principio DRY):

- **`modalidad_norm`** colapsa las variantes de modalidad a 7 etiquetas canónicas (insensible a mayúsculas/acentos vía `NORMALIZE(... NFD)`).
- **`objeto_label`** toma el primer segmento del objeto clasificado, lo normaliza y lo mapea a ~33 categorías canónicas (la cola cae a `INITCAP` limpio), evitando que una misma idea se fragmente en docenas de etiquetas casi iguales.
- **Entidades por NIT con nombre más frecuente.** `quien_entidades.sql` agrupa por `entidad_nit` y muestra el nombre **más frecuente** vía `APPROX_TOP_COUNT(entidad_nombre, 1)`, para que una entidad nacional no aparezca, p. ej., como "ICBF Regional Caquetá" sino como **"ICBF Sede Nacional"** representando a todo el NIT.
- **PAA: "No especificada", no "Otras".** En el PAA el grueso de los ítems no declara modalidad; se rotula **`No especificada`** (dato faltante) en vez de `Otras` (categoría residual), para no inducir a leerlo como una modalidad real.
- **Partidos normalizados** en la sección electoral, para que cada array categórico no se fragmente en variantes del mismo nombre.

### Hay 45 archivos `.sql`

`data/queries/` contiene **45 archivos `.sql`**, uno o varios por sección (por convención `<seccion>_kpis.sql` para los indicadores y `<seccion>_<dimension>.sql` para los desgloses). Cada uno embebe literalmente el filtro común y usa placeholders `{p}`/`{d}` para proyecto/dataset, que `_sql()` sustituye en ejecución.

### Reconciliación y guards: `verify_snapshot.py`

`data/verify_snapshot.py` es una **reconciliación independiente**: no reutiliza las consultas del materializador, sino que **re-deriva** cada número con formulaciones distintas (o desde la tabla cruda) y los compara con `public/data/*.json`. Objetivo: probar que **ningún número está inventado** y que todo reconcilia con la fuente. Incluye además:

- **Chequeos de coherencia interna** sin BigQuery: percentiles monótonos crecientes, sumas de desgloses que cuadran con los totales, todo `*pct` en `[0,100]`, `facturado ≤ contratado`, `pagado ≤ vigente`, etc.
- **Guard anti-fragmentación**: detecta arrays categóricos con **etiquetas duplicadas** (el síntoma de "partidos" sin normalizar) en las secciones de una sola dimensión.
- **Guardia de sentido (anti fan-out)**: ninguna señal (suma de valores de contratos) puede superar el universo total contratado; si lo supera, hay un `JOIN` multiplicando filas.

---

## Seguridad y defensa en profundidad

Aunque el sitio no usa funciones, base de datos ni auth, la configuración refuerza la frontera por si acaso.

### Cabeceras de seguridad (`firebase.json`)

Todas las respuestas llevan cabeceras estrictas:

| Cabecera | Valor | Efecto |
|---|---|---|
| `Content-Security-Policy` | `default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self'; frame-ancestors 'none'` | Solo recursos del propio origen; **`connect-src 'self'`** prohíbe cualquier llamada de red fuera del origen; no embebible. |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Fuerza HTTPS (HSTS) por 2 años, subdominios incluidos, apto para preload. |
| `X-Frame-Options` | `DENY` | No se puede embeber en un iframe (anti-clickjacking). |
| `X-Content-Type-Options` | `nosniff` | El navegador no adivina tipos MIME. |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limita la fuga de URL al navegar a otros orígenes. |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Desactiva cámara, micrófono y geolocalización. |

El hosting además define `rewrites` `** → /index.html` (enrutado SPA), un `redirect` `/admin` (302) al sitio administrativo, y `Cache-Control` diferenciado: activos versionados cacheables 1 h, HTML `no-cache` para que un deploy nuevo se vea de inmediato.

### `firestore.rules` es deny-all

El sitio no usa Firestore, pero la regla es **deny-all** como defensa en profundidad: si por error se asociara una base Firestore al proyecto, **nadie podría leer ni escribir nada**.

```
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} { allow read, write: if false; }
  }
}
```

### Sin secretos, sin PII de personas

- **El acceso a la fuente vive solo en `data/`**, que no se despliega. Las credenciales de BigQuery (vía ADC / cuenta de servicio) nunca entran al bundle.
- **No hay secretos en el frontend.** No hay claves de API, tokens ni endpoints privados en `src/`.
- **No hay PII de personas en el snapshot.** Los `shape_*` y *builders* emiten **agregados**; las señales que cruzan personas (supervisor-contratista, puerta giratoria, redes, donante post-elección) publican solo **conteos y valores**, nunca documentos ni nombres. Las únicas entidades nombradas son **organizaciones públicas** (entidades por NIT) y **partidos**, no individuos.

### El test que protege la frontera

Mantener el sitio estático es verificable. El checklist de un fork (ver **[Hacer un fork](04-Hacer-Un-Fork.md)**) incluye comprobar que **el sitio no llama a ninguna API ni función**. Regla práctica: si añades código que necesita un backend para funcionar, has salido del modelo de este proyecto.

---

## En resumen

- El sitio público es un **paquete de archivos estáticos**: HTML, JS, CSS y JSON. Nada más. **Cero** funciones, base de datos, autenticación y llamadas a terceros.
- La SPA es **React 19 + TypeScript + Vite**, con páginas lazy-loaded y dos páginas **genéricas dirigidas por configuración** (`Senal`, `Analisis`) que renderizan 11 señales y 6 análisis desde los catálogos `senales.ts` / `analisis.ts`.
- La forma de los datos se define **una sola vez** en `schemas.ts` (Zod): TypeScript deriva los tipos con `z.infer` y `usePublicData` **valida cada JSON en runtime**, fallando claro si el snapshot está malformado.
- El **materializador** separa funciones puras (`shape_*`, testeables) de los builders sobre BigQuery, trabaja sobre una **tabla base limpia y deduplicada**, centraliza normalizaciones (DANE, modalidad, objeto, entidades por NIT, partidos) y se reconcilia con `verify_snapshot.py`, que incluye **guards anti-fragmentación y anti fan-out**. Hay **45 archivos `.sql`**.
- Ser estático no es solo barato y seguro: es una **postura ética**. Sin cómputo en línea, el sitio no puede perfilar ni puntuar a nadie; solo describe, en agregado, lo que dicen los registros públicos.

Para seguir: **[Materialización](02-Datos-y-Materializacion.md)** (cómo se generan los JSON), **[Metodología](03-Metodologia.md)** (cómo se calculan las cifras), **[Hacer un fork](04-Hacer-Un-Fork.md)** (cómo correrlo y desplegarlo) y **[Caveats](09-Caveats-Y-Limites.md)** (los límites reales de los datos).
