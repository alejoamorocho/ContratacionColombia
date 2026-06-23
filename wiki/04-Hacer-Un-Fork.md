# Hacer un fork

Este proyecto está diseñado para que saques **tu propia versión**: otra ventana de años, otras secciones, otra paleta, otra fuente de datos —otro país, incluso—. Todo es **estático y open source** (Apache 2.0), así que forkearlo es legítimo, sencillo y barato.

Esta guía es el camino completo, **paso a paso**, con comandos exactos para Windows (PowerShell), macOS y Linux (bash), y una sección de [solución de problemas](#9-solución-de-problemas-troubleshooting) al final.

> **Lo más importante primero:** el repositorio ya trae un **snapshot de datos commiteado** en `public/data/*.json`. Eso significa que puedes clonar, instalar y ver el sitio funcionando **sin tocar BigQuery, sin credenciales y sin Python**. Regenerar los datos es opcional y solo lo necesitas si quieres cambiar la fuente o la ventana temporal.

---

## Tabla de contenido

1. [Prerrequisitos](#1-prerrequisitos)
2. [Clonar e instalar](#2-clonar-e-instalar)
3. [Correr en desarrollo (con el snapshot incluido)](#3-correr-en-desarrollo-con-el-snapshot-incluido)
4. [Estructura de carpetas](#4-estructura-de-carpetas)
5. [Personalizar la presentación](#5-personalizar-la-presentación)
6. [Regenerar los datos con tu BigQuery (opcional)](#6-regenerar-los-datos-con-tu-bigquery-opcional)
7. [Verificar antes de publicar](#7-verificar-antes-de-publicar)
8. [Desplegar tu fork](#8-desplegar-tu-fork)
9. [Solución de problemas (troubleshooting)](#9-solución-de-problemas-troubleshooting)
10. [Licencia y atribución](#10-licencia-y-atribución)
11. [Checklist final](#11-checklist-antes-de-publicar-tu-fork)

---

## 1. Prerrequisitos

### Obligatorios (para ver y modificar el sitio)

| Herramienta | Versión recomendada | Para qué |
|-------------|---------------------|----------|
| **Node.js** | 20 LTS o superior | Ejecutar Vite, el bundler del frontend |
| **npm** | 10+ (viene con Node) | Instalar dependencias y correr los scripts |
| **Git** | cualquiera reciente | Clonar el repositorio y manejar tu fork |

Verifica que los tienes:

```bash
node --version    # p. ej. v20.18.0  (debe ser >= 20)
npm --version     # p. ej. 10.8.0
git --version
```

El frontend es **React 19 + TypeScript + Vite 8**, con [Recharts](https://recharts.org/) para gráficas, [react-simple-maps](https://www.react-simple-maps.io/) para el mapa y [Zod](https://zod.dev/) para validar el snapshot en runtime. No hay backend, ni base de datos, ni funciones: todo se resuelve leyendo JSON estáticos.

> **Nota sobre dependencias:** el repo trae un `.npmrc` con `legacy-peer-deps=true`. Esto evita conflictos de peer-dependencies entre React 19 y algunas librerías de gráficas/mapas. Déjalo como está; `npm install` lo respeta automáticamente.

### Opcionales (solo para regenerar los datos)

Necesarios **únicamente** si vas a re-materializar el snapshot desde tu propia tabla en BigQuery (ver [sección 6](#6-regenerar-los-datos-con-tu-bigquery-opcional)):

| Herramienta | Para qué |
|-------------|----------|
| **Python 3.10+** | Ejecutar `data/materialize_public.py` |
| **gcloud CLI** | Autenticación a Google Cloud (ADC) |
| **Proyecto de Google Cloud con BigQuery** | Una tabla `contratos` con el esquema esperado |
| `google-cloud-bigquery>=3.0` | Cliente de BigQuery (en `data/requirements.txt`) |

Si solo quieres **ver, rediseñar o redesplegar** el sitio con los datos actuales, **ignora todo lo opcional**.

---

## 2. Clonar e instalar

```bash
git clone https://github.com/alejoamorocho/ContratacionColombia.git
cd ContratacionColombia
npm install
```

`npm install` descarga las dependencias del frontend (React, Recharts, react-simple-maps, Zod, etc.) y prepara los scripts. Tarda uno o dos minutos la primera vez.

> Si vas a publicar **tu propia** versión, primero pulsa **Fork** en GitHub y clona tu fork en lugar del repositorio original. Así puedes hacer `git push` a tu copia.

---

## 3. Correr en desarrollo (con el snapshot incluido)

```bash
npm run dev
```

Vite levanta un servidor de desarrollo (por defecto en `http://localhost:5173`) con recarga en caliente. **Funciona de inmediato** leyendo el snapshot ya commiteado en `public/data/`. No necesitas credenciales de nada para empezar.

Lo que verás es el dashboard real, con las cifras reales del corte vigente: por ejemplo **3.969.440 contratos**, **$583,8 billones** de valor contratado total, **valor mediano de $20,06 M**, **4.690 entidades** y **954.767 contratistas** (cifras de `public/data/panorama.json`; cambiarán cada vez que se regenere el snapshot).

### Scripts disponibles

Todos los scripts viven en `package.json`:

| Comando | Qué hace |
|---------|----------|
| `npm run dev` | Servidor de desarrollo con HMR (recarga en caliente) |
| `npm run build` | Compila TypeScript (`tsc -b`) y genera el sitio estático en `dist/` |
| `npm run preview` | Sirve localmente el `dist/` ya construido (para revisar el build) |
| `npm run lint` | Corre ESLint sobre todo el proyecto |
| `npm test` | Corre los tests con Vitest (hooks, smoke de páginas, materializador) |

---

## 4. Estructura de carpetas

```text
ContratacionColombia/
├─ public/
│  └─ data/               ← EL SNAPSHOT: los JSON que lee el sitio (panorama, quien,
│                            como, donde, planeacion, inversion, ejecucion, sanciones,
│                            electoral, cruces, senales, senales_extra, analisis,
│                            kpis_extra, procesos, meta). Esto es lo que el frontend consume.
├─ src/
│  ├─ App.tsx             ← Rutas (React Router): cada sección = una Route
│  ├─ main.tsx            ← Punto de entrada
│  ├─ pages/              ← Una página por sección (Inicio, Quien, Como, Planea,
│  │                         Invierte, Ejecuta, Donde, Senales, Cruces, Senal,
│  │                         Analisis, Acerca)
│  ├─ components/
│  │  ├─ Sidebar.tsx      ← Menú lateral (define la navegación y los "tonos" por grupo)
│  │  ├─ DashboardLayout.tsx, PageShell.tsx, SectionHeader.tsx …
│  │  ├─ MapaColombia.tsx ← Mapa coroplético por departamento
│  │  ├─ charts/          ← Gráficas reutilizables: VBarChart, VLineChart,
│  │  │                      VPieChart, KPICard, ChartFootnote
│  │  └─ ui/              ← Primitivos (Card, …)
│  ├─ hooks/
│  │  └─ usePublicData.ts ← Hook que hace fetch del JSON y lo VALIDA con Zod
│  ├─ lib/
│  │  ├─ schemas.ts       ← Esquemas Zod: ÚNICA fuente de verdad de la forma de los datos
│  │  ├─ types.ts         ← Tipos TypeScript (derivados de los esquemas con z.infer)
│  │  ├─ config.ts        ← BASE (base path del deploy) y ADMIN_URL
│  │  ├─ formatters.ts    ← Formato de pesos, porcentajes, números cortos
│  │  ├─ analisis.ts, senales.ts  ← Catálogos de páginas /analisis/:key y /senal/:key
│  │  └─ chartTheme.ts    ← Colores y estilos de las gráficas
│  └─ styles/
│     ├─ tokens.css       ← Tokens de diseño (colores base, espaciados, radios)
│     ├─ globals.css      ← Estilos globales
│     ├─ tones.css        ← "Tonos" de color por sección (azul=quién, violeta=cómo, …)
│     └─ badges.css
├─ data/                  ← El MATERIALIZADOR (Python). Opcional; solo para regenerar datos.
│  ├─ materialize_public.py  ← Lee BigQuery y escribe public/data/*.json
│  ├─ verify_snapshot.py     ← Reconcilia el snapshot contra BigQuery (auditoría)
│  ├─ test_materialize.py    ← Tests de las funciones shape_* (sin BigQuery)
│  ├─ requirements.txt       ← google-cloud-bigquery>=3.0
│  └─ queries/               ← 45 archivos .sql, uno por agregado (auditables)
├─ scripts/
│  └─ publish_wiki.py     ← Publica esta wiki en GitHub
├─ wiki/                  ← Esta documentación
├─ firebase.json          ← Config de Firebase Hosting (headers, cache, CSP, redirects)
├─ .firebaserc.example    ← Plantilla: copia a .firebaserc con tu project id
├─ package.json           ← Dependencias y scripts npm
├─ vite.config.ts         ← Config de Vite + Vitest
├─ LICENSE / NOTICE       ← Apache 2.0 y atribución
└─ README.md
```

**El flujo de datos en una frase:** `BigQuery → materialize_public.py → public/data/*.json → usePublicData (fetch + validación Zod) → páginas → gráficas`. El frontend **nunca** habla con BigQuery; solo lee JSON estáticos. Por eso el sitio es barato y seguro.

> Detalles del materializador y de cada cálculo en [Datos y materialización](02-Datos-y-Materializacion.md) y [Cómo se calcula todo](13-Como-Se-Calcula-Todo.md). Las fuentes están en [Fuentes](01-Fuentes.md) y la arquitectura completa en [Arquitectura](11-Arquitectura.md).

---

## 5. Personalizar la presentación

Aquí puedes trabajar **sin tocar Python ni BigQuery**: todo lo visual vive en `src/`.

### 5.1 Cambiar los colores y el estilo

El diseño está centralizado en tokens CSS, así que un cambio se propaga a todo el sitio:

- `src/styles/tokens.css` — colores base, espaciados, radios de borde (tema oscuro tipo GitHub).
- `src/styles/globals.css` — estilos globales, tipografía, layout.
- `src/styles/tones.css` — los **tonos por sección**. Cada grupo de la navegación tiene su color de acento (overlines, callouts, bordes, gráficas):

  | Tono | Sección | Color por defecto |
  |------|---------|-------------------|
  | `who` | ¿Quién contrata? | azul `#58a6ff` |
  | `how` | ¿Cómo contrata? | violeta `#bc8cff` |
  | `plan` | ¿Qué se planea? | teal `#2dd4bf` |
  | `invest` | ¿En qué se invierte? | dorado `#e3b341` |
  | `exec` | ¿Se ejecuta? | celeste `#79c0ff` |
  | `where` | ¿Dónde? | verde `#3fb950` |
  | `signal` | ¿Hay señales? | ámbar `#f0883e` |
  | `context` | contexto/neutral | gris `#8b949e` |

  Cambia esos valores y todo el sitio se reviste de tu paleta.

> **Cuidado** (documentado en el propio `tones.css`): no añadas un selector catch-all `[data-tone] { --shell-tone: … }`. Tendría la misma especificidad que las reglas por tono y, al ir después, las anularía todas (poniendo el sitio gris). El default vive en `:root` y se hereda.

### 5.2 Cambiar la navegación

El menú lateral se define en un único array `NAV` dentro de `src/components/Sidebar.tsx`. Cada entrada es un `link` (una sola página) o un `group` (con sub-ítems). Allí decides el orden, los íconos ([lucide-react](https://lucide.dev/)), las etiquetas y el `tone` de cada grupo.

### 5.3 Editar o añadir una sección

**Una sección = una página en `src/pages/` que lee su JSON.** El patrón es siempre el mismo:

```tsx
// src/pages/MiSeccion.tsx
import { usePublicData } from '../hooks/usePublicData';
import type { PanoramaData } from '../lib/types';

export default function MiSeccion() {
  const { data, loading, error } = usePublicData<PanoramaData>('panorama'); // lee public/data/panorama.json
  if (loading) return <p>Cargando…</p>;
  if (error) return <p>Error: {error.message}</p>;
  // …renderiza gráficas con data
}
```

`usePublicData('<seccion>')` hace `fetch` de `public/data/<seccion>.json` y, **si existe un esquema Zod** para esa sección en `src/lib/schemas.ts`, lo **valida en runtime**. Si el JSON llega malformado o desactualizado, la app falla de forma clara y controlada en lugar de pintar `undefined`. Validar en el borde es la defensa correcta para datos estáticos que se regeneran a mano.

**Para añadir una sección nueva (de principio a fin):**

1. **Crea el JSON** en `public/data/mi-seccion.json` (a mano para empezar, o regenerándolo desde BigQuery más adelante).
2. **Declara su forma** en `src/lib/schemas.ts` con un esquema Zod, y deriva el tipo en `src/lib/types.ts` con `z.infer<typeof miSeccionSchema>`. (Esquema = fuente de verdad; el tipo se deriva, no se escribe a mano.)
3. **Registra el esquema** en el mapa `SCHEMAS` (en `schemas.ts`) bajo la clave `'mi-seccion'`, para que `usePublicData` lo valide automáticamente.
4. **Crea la página** `src/pages/MiSeccion.tsx` siguiendo el patrón de arriba.
5. **Añade la ruta** en `src/App.tsx` (importa la página con `lazy(() => import('./pages/MiSeccion'))` y agrega su `<Route>`).
6. **Enlázala** en la navegación, en el array `NAV` de `src/components/Sidebar.tsx`.

Las páginas `/analisis/:key` y `/senal/:key` son genéricas: en lugar de una página por tema, hay **catálogos** en `src/lib/analisis.ts` y `src/lib/senales.ts` que mapean cada `key` a su JSON y su descripción. Para añadir un análisis o una señal, muchas veces basta con agregar una entrada al catálogo correspondiente.

### 5.4 Reutilizar las gráficas

En `src/components/charts/` tienes piezas listas: `VBarChart` (barras), `VLineChart` (líneas), `VPieChart` (dona), `KPICard` (tarjeta de cifra) y `ChartFootnote`. El mapa coroplético está en `src/components/MapaColombia.tsx`. Todas heredan los tonos y el tema, así que encajan visualmente sin configuración extra.

---

## 6. Regenerar los datos con tu BigQuery (opcional)

Esta sección **solo aplica** si quieres cambiar la fuente, la ventana de años o el país. El snapshot lo genera `data/materialize_public.py` leyendo una tabla `contratos` en BigQuery y escribiendo los JSON en `public/data/`.

> Si no tienes BigQuery, **omite esta sección**: el sitio ya funciona con el snapshot commiteado.

### 6.1 Cómo funciona el materializador

`materialize_public.py` está diseñado para ser **auditable y testeable**:

- **Configuración por variables de entorno:** `GCP_PROJECT`, `BQ_DATASET`, `YEAR_FROM` (default `2022`), `YEAR_TO` (default `2026`). El default de proyecto y dataset es `vectorvi`.
- **Tabla base limpia:** antes de cualquier agregado crea `_contratos_pub`, una tabla derivada de `contratos` que (a) filtra la ventana de años, (b) descarta `valor` nulo o `<= 0`, (c) **deduplica por `id`** conservando la última versión por `ultima_actualizacion` —SECOP trae ~0,3 % de ids repetidos—, y (d) precalcula las columnas normalizadas `modalidad_norm` y `objeto_label`. Todas las consultas leen de esta tabla, así ningún contrato se cuenta ni se suma dos veces. Al terminar, la tabla base se borra.
- **Consultas separadas:** las **45 consultas** viven en `data/queries/*.sql`, una por agregado. Puedes leerlas, auditarlas y editarlas para tu esquema. El helper `_sql()` reapunta la referencia `` `{p}.{d}.contratos` `` a la tabla base limpia y sustituye los placeholders `{p}` (proyecto) y `{d}` (dataset).
- **Funciones `shape_*` puras:** transforman las filas de BigQuery (dicts) al formato exacto de `src/lib/types.ts`. No tocan BigQuery, así que se testean sin credenciales (ver `data/test_materialize.py`). **Si cambias la forma de un JSON, actualiza también `src/lib/schemas.ts` y `types.ts`** o la validación Zod del frontend lo rechazará.
- **Escritura:** `_write()` vuelca cada JSON con `indent=2` y `ensure_ascii=False` (tildes legibles) en `public/data/`.

### 6.2 Instalar y autenticar

```bash
cd data
pip install -r requirements.txt          # instala google-cloud-bigquery
gcloud auth application-default login     # ADC: abre el navegador para autenticar
```

`gcloud auth application-default login` configura las **Application Default Credentials (ADC)**: el cliente de BigQuery las toma automáticamente, sin claves en el código. Como alternativa, puedes apuntar `GOOGLE_APPLICATION_CREDENTIALS` a un JSON de cuenta de servicio con permiso de lectura/job en BigQuery.

### 6.3 Configurar y ejecutar

**bash (macOS / Linux):**

```bash
export GCP_PROJECT=tu-proyecto
export BQ_DATASET=tu-dataset
export YEAR_FROM=2022
export YEAR_TO=2026
python materialize_public.py
```

**PowerShell (Windows):**

```powershell
$env:GCP_PROJECT = "tu-proyecto"
$env:BQ_DATASET  = "tu-dataset"
$env:YEAR_FROM   = "2022"
$env:YEAR_TO     = "2026"
python materialize_public.py
```

El script imprime su avance (`Creando tabla base limpia…`, `Snapshot generado en …`) y reescribe **todos** los JSON de `public/data/`. Vuelve a `npm run dev` y verás tus datos.

### 6.4 Esquema esperado de la tabla `contratos`

Las columnas que el materializador lee de la tabla base son, como mínimo:

```text
id, valor, valor_facturado, valor_pagado, fecha_firma, entidad_nit,
entidad_nombre, contratista_nit, modalidad, objeto_clasificado, orden,
entidad_departamento, es_pyme,
recursos_pgn, recursos_sgp, recursos_regalias, recursos_propios,
ultima_actualizacion   (para deduplicar por id)
```

Las fuentes adicionales (procesos/PAA, BPIN, sanciones SIRI, aportes electorales, cruces) viven en **tablas propias** referenciadas dentro de sus `.sql`; solo la referencia a `contratos` se reapunta a la base limpia. Si tu esquema difiere, edita los `.sql` y, si cambia la forma de salida, actualiza `shape_*`, `schemas.ts` y `types.ts`.

### 6.5 Otra fuente que no es BigQuery

Si tus datos no están en BigQuery, **conserva las funciones `shape_*` y la escritura de JSON** y reemplaza solo la capa de consulta (`_client`, `_q`, `_ensure_base`, los `.sql`): lee tu CSV/Parquet/Postgres/lo-que-sea, conviértelo a listas de dicts con las mismas claves que esperan los `shape_*`, y deja que el resto del pipeline produzca los mismos JSON. El frontend no notará la diferencia.

### 6.6 Auditar tu snapshot

`data/verify_snapshot.py` reconcilia **de forma independiente** el snapshot contra BigQuery: re-deriva los números con formulaciones distintas (o desde la tabla cruda) y los compara con `public/data/*.json`, además de correr chequeos de **coherencia interna** (incluyendo *guards* anti-fragmentación, p. ej. que las categorías de objeto no se atomicen en docenas de etiquetas casi iguales). Es la prueba de que ningún número está inventado.

```bash
python data/verify_snapshot.py   # requiere ADC de BigQuery
```

Más sobre esto en [Auditoría de datos](06-Auditoria-De-Datos.md).

---

## 7. Verificar antes de publicar

Antes de desplegar, corre la batería completa:

```bash
npx tsc --noEmit     # type-check estricto, sin emitir archivos
npm run lint         # ESLint
npm test             # Vitest: hooks, smoke de páginas, shape_* del materializador
npm run build        # build de producción a dist/
npm run preview      # revisa el dist/ servido localmente
```

- `tsc --noEmit` y `build` deben pasar **sin errores**.
- Confirma en el navegador (`preview`) que ninguna sección muestra el error de validación de Zod (eso indicaría un JSON con forma incorrecta).
- Verifica que el sitio **no llama a ninguna API ni función**: debe ser 100 % estático. Cualquier `fetch` debe ir solo a archivos dentro de `public/data/`.

---

## 8. Desplegar tu fork

El resultado de `npm run build` es la carpeta `dist/`: HTML, CSS, JS y los JSON. Es **estático**, así que cualquier hosting de archivos sirve.

```bash
npm run build
```

### 8.1 Firebase Hosting (configuración incluida)

El repo ya trae `firebase.json` con headers de seguridad sensatos (CSP estricta, `X-Frame-Options: DENY`, HSTS, `nosniff`), política de caché por tipo de archivo y un rewrite SPA (`** → /index.html`).

```bash
# 1) crea tu .firebaserc a partir de la plantilla y pon tu project id
cp .firebaserc.example .firebaserc      # PowerShell: Copy-Item .firebaserc.example .firebaserc
#    edita .firebaserc → "default": "TU_PROJECT_ID_DE_FIREBASE"

# 2) despliega
firebase deploy --only hosting
```

> `.firebaserc` está en `.gitignore` a propósito (es específico de tu proyecto); por eso se versiona solo `.firebaserc.example`.

**Sobre la ruta `/admin`:** tanto `firebase.json` como `src/lib/config.ts` (`ADMIN_URL`) y `App.tsx` apuntan `/admin` a un sitio administrador externo (`https://vectorvi-admin.web.app`), heredado del proyecto original. En tu fork **público no necesitas nada de eso**: puedes borrar el redirect de `firebase.json`, la ruta `/admin` de `App.tsx` y `ADMIN_URL` de `config.ts` sin afectar el dashboard.

### 8.2 Netlify / Vercel / Cloudflare Pages / GitHub Pages

Cualquiera de estos sirve el `dist/`:

| Plataforma | Build command | Publish dir | Nota |
|------------|---------------|-------------|------|
| Netlify | `npm run build` | `dist` | Añade un redirect SPA: `/* → /index.html 200` |
| Vercel | `npm run build` | `dist` | Framework: Vite |
| Cloudflare Pages | `npm run build` | `dist` | Build de Vite/React |
| GitHub Pages | `npm run build` | `dist` | Si publicas en un subdirectorio, ajusta el **base path** (ver abajo) |

**Base path (importante para subdirectorios):** el frontend lee la base con `import.meta.env.BASE_URL` (en `src/lib/config.ts` como `BASE`), y `usePublicData` la antepone a las rutas de los JSON. Si despliegas en la raíz de un dominio (`https://tudominio.com/`), no tienes que hacer nada. Si despliegas bajo un subpath (p. ej. GitHub Pages en `https://usuario.github.io/mi-repo/`), define el `base` de Vite a `'/mi-repo/'` (vía `--base` en el build o en `vite.config.ts`) para que tanto los assets como los JSON resuelvan bien.

Más detalle y matices de despliegue en [Despliegue](12-Despliegue.md).

---

## 9. Solución de problemas (troubleshooting)

| Síntoma | Causa probable | Solución |
|---------|----------------|----------|
| `npm install` falla por peer-deps (React 19) | Conflicto de versiones de d3/react | El `.npmrc` ya trae `legacy-peer-deps=true`; verifica que no lo borraste. Si persiste: `npm install --legacy-peer-deps`. |
| Las gráficas o el sitio salen **grises** | Añadiste un catch-all `[data-tone]` en CSS | Quítalo: rompe la especificidad de los tonos (ver el aviso en `tones.css`). |
| Una sección muestra **"Datos de '…' inválidos: …"** | El JSON no cumple su esquema Zod | Ajusta el JSON, o sincroniza `schemas.ts`/`types.ts` con la nueva forma. El mensaje indica el campo exacto que falla. |
| El sitio carga pero las páginas quedan **vacías / 404 de JSON** | Base path mal configurado en subdirectorio | Configura el `base` de Vite al subpath del deploy (ver [8.2](#82-netlify--vercel--cloudflare-pages--github-pages)). |
| Recargar una ruta profunda (p. ej. `/donde`) da **404** | Falta el rewrite SPA del hosting | Añade `** → /index.html` (Firebase ya lo trae; en Netlify usa `/* /index.html 200`). |
| `python materialize_public.py`: *Could not automatically determine credentials* | No hay ADC | Corre `gcloud auth application-default login` o exporta `GOOGLE_APPLICATION_CREDENTIALS`. |
| El materializador corre pero **lee la tabla equivocada** | `GCP_PROJECT`/`BQ_DATASET` sin definir | Defaultean a `vectorvi`; exporta los tuyos antes de ejecutar. |
| `Table not found: …contratos` | Tu tabla no se llama `contratos` o falta una columna | Renombra/edita los `.sql` y revisa el esquema esperado ([6.4](#64-esquema-esperado-de-la-tabla-contratos)). |
| Cifras "raras" tras regenerar | Cambiaste `shape_*` sin tocar el frontend | Sincroniza `schemas.ts` y `types.ts`, y vuelve a correr `npm test`. |

---

## 10. Licencia y atribución

El proyecto es **[Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0)**. Puedes usarlo, modificarlo, redistribuirlo y comercializarlo. Las únicas obligaciones son:

- conservar el aviso de copyright y la licencia (`LICENSE` y `NOTICE`);
- mantener la atribución a los creadores originales — **Alejandro Amorocho** y **Juan José Amorocho** (ver `NOTICE`);
- si modificas archivos con cabecera de licencia, indicar los cambios significativos.

En el espíritu del proyecto: documenta **tu fuente** y **tu ventana de datos** en la sección **Acerca** de tu fork, y mantén el principio editorial: **describe, no juzga** (estadística descriptiva neutral, sin scoring ni señalamientos). Ver [Metodología](03-Metodologia.md).

---

## 11. Checklist antes de publicar tu fork

- [ ] `npx tsc --noEmit` sin errores
- [ ] `npm run lint` limpio
- [ ] `npm test` en verde
- [ ] `npm run build` ok y `npm run preview` se ve correcto
- [ ] El sitio **no** llama a ninguna API/función (100 % estático; los únicos `fetch` van a `public/data/`)
- [ ] Ninguna sección muestra el error de validación de Zod
- [ ] Si regeneraste datos: corriste `verify_snapshot.py` y reconcilia
- [ ] Documentaste tu **fuente** y tu **ventana de datos** en la sección **Acerca**
- [ ] Conservaste `LICENSE` y `NOTICE` (atribución a los creadores)
- [ ] Quitaste lo que no uses (la ruta `/admin`, el redirect admin de `firebase.json`)

---

**Siguientes lecturas:** [Despliegue](12-Despliegue.md) · [Datos y materialización](02-Datos-y-Materializacion.md) · [Cómo se calcula todo](13-Como-Se-Calcula-Todo.md) · [Arquitectura](11-Arquitectura.md) · [FAQ](05-FAQ.md). Vuelve al [índice de la Wiki](Home.md).
