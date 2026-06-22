# Guía de despliegue

VECTORVI es un **dashboard estático**: React + Vite que lee JSON pre-materializados desde `public/data/`. No hay backend, ni funciones, ni base de datos en el repositorio público. Eso significa que desplegarlo es, en esencia, **compilar y subir una carpeta de archivos** (`dist/`) a cualquier hosting estático.

Esta página cubre tres cosas:

1. [Compilar el sitio](#1-compilar-el-sitio) — `npm install` + `npm run build`.
2. [Desplegar `dist/`](#2-desplegar-dist) — Firebase Hosting, Netlify, Vercel o GitHub Pages.
3. [Regenerar el snapshot de datos](#3-regenerar-el-snapshot-de-datos) — opcional, requiere credenciales propias de BigQuery.

> Si solo quieres tu propia versión modificada, lee también [Hacer un fork](04-Hacer-Un-Fork.md).

---

## Requisitos previos

| Herramienta | Para qué | Versión sugerida |
|---|---|---|
| **Node.js + npm** | Compilar el dashboard | Node 20 LTS o superior |
| **Git** | Clonar el repositorio | cualquiera reciente |
| **Python** | *(Solo si regeneras datos)* correr el materializador | 3.9 o superior |
| **Firebase CLI** | *(Solo para Firebase Hosting)* `npm i -g firebase-tools` | reciente |

El sitio funciona de inmediato con el snapshot incluido en `public/data/`. **No necesitas credenciales de nada para compilar y desplegar.**

---

## 1. Compilar el sitio

```bash
git clone https://github.com/alejoamorocho/ContratacionColombia.git
cd ContratacionColombia
npm install
npm run build
```

`npm run build` ejecuta `tsc -b && vite build` (definido en `package.json`): primero valida tipos con TypeScript y luego compila con Vite. El resultado es la carpeta **`dist/`**, lista para subir a cualquier hosting.

### Probar localmente antes de desplegar

```bash
npm run dev       # servidor de desarrollo (http://localhost:5173)
npm run preview   # sirve dist/ tal como saldrá en producción
```

> **Nota sobre `npm install`:** el repo incluye un `.npmrc` con `legacy-peer-deps=true`. Mantenlo: evita conflictos de *peer dependencies* con React 19. Si clonas y `npm install` falla por dependencias, verifica que ese archivo siga presente.

---

## 2. Desplegar `dist/`

`dist/` es una **SPA estática**. Cualquiera de las opciones siguientes funciona. La única configuración que necesita cualquier hosting es un *rewrite* de todas las rutas a `index.html` (para que el enrutamiento del lado del cliente funcione al recargar o entrar directo a una sección).

### Opción A — Firebase Hosting (la del proyecto)

El repositorio ya trae un `firebase.json` configurado (carpeta `public: "dist"`, rewrite SPA, cabeceras de seguridad y caché).

```bash
npm i -g firebase-tools     # una sola vez
firebase login

# Apunta a TU proyecto de Firebase:
cp .firebaserc.example .firebaserc
# edita .firebaserc y reemplaza "TU_PROJECT_ID_DE_FIREBASE" por tu Project ID

npm run build
firebase deploy --only hosting
```

> `.firebaserc` está en `.gitignore` (es específico de cada despliegue). Por eso el repo trae `.firebaserc.example` como plantilla — cópialo y pon tu propio Project ID.

El `firebase.json` incluido ya define cabeceras de seguridad (CSP, HSTS, `X-Frame-Options`, etc.) y políticas de caché. No necesitas tocarlo para un despliegue estándar.

### Opción B — Netlify

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Rewrite SPA:** crea `public/_redirects` con la línea `/* /index.html 200`, o configúralo en `netlify.toml`.

### Opción C — Vercel

Vercel detecta Vite automáticamente. Si necesitas configurarlo a mano:

- **Build command:** `npm run build`
- **Output directory:** `dist`
- Vercel sirve SPAs de Vite sin configuración extra de rewrites en la mayoría de los casos.

### Opción D — GitHub Pages

1. Compila: `npm run build`.
2. Publica el contenido de `dist/` en la rama/carpeta que GitHub Pages sirva (p. ej. con una GitHub Action o la rama `gh-pages`).
3. Si el sitio se sirve **bajo un subdirectorio** (p. ej. `usuario.github.io/ContratacionColombia/`), añade `base: '/ContratacionColombia/'` en `vite.config.ts` y recompila, para que las rutas a los assets sean correctas. Si usas un dominio propio o `usuario.github.io` en la raíz, no hace falta.

> **Regla de oro:** sea cual sea el hosting, asegúrate de que **todas las rutas se reescriban a `/index.html`**. Es lo único que una SPA estática necesita para no dar 404 al recargar dentro de una sección.

---

## 3. Regenerar el snapshot de datos

> **Opcional.** El repositorio ya incluye un snapshot completo en `public/data/`. Solo necesitas regenerarlo si quieres datos más recientes, otra ventana de años, u otra fuente. Esto **requiere credenciales propias de BigQuery** y acceso a un dataset con la tabla `contratos`.

El pipeline vive en `data/`:

- `data/materialize_public.py` — lee BigQuery, deduplica por `id`, normaliza y escribe los JSON.
- `data/queries/*.sql` — una consulta por agregado (33 archivos: `panorama_kpis.sql`, `quien_entidades.sql`, `como_modalidad.sql`, `donde_departamento.sql`, etc.).

### Pasos

```bash
cd data
pip install -r requirements.txt          # solo google-cloud-bigquery
gcloud auth application-default login     # credenciales propias

# Configura proyecto, dataset y ventana de años (ver tabla abajo):
export GCP_PROJECT=tu-proyecto BQ_DATASET=tu-dataset YEAR_FROM=2022 YEAR_TO=2026

python materialize_public.py
```

> En **PowerShell (Windows)**, usa `$env:` en vez de `export`:
> ```powershell
> $env:GCP_PROJECT="tu-proyecto"; $env:BQ_DATASET="tu-dataset"; $env:YEAR_FROM="2022"; $env:YEAR_TO="2026"
> python materialize_public.py
> ```

El script escribe los JSON en `public/data/`. Después, **recompila y vuelve a desplegar** (`npm run build` + el deploy de tu hosting) para que el sitio sirva los datos nuevos.

### Variables de entorno

Todas tienen valor por defecto; el script funciona sin configurar nada contra el proyecto original.

| Variable | Por defecto | Qué controla |
|---|---|---|
| `GCP_PROJECT` | `vectorvi` | Proyecto de Google Cloud / BigQuery |
| `BQ_DATASET` | `vectorvi` | Dataset que contiene la tabla `contratos` |
| `YEAR_FROM` | `2022` | Primer año de la ventana (inclusive) |
| `YEAR_TO` | `2026` | Último año de la ventana (inclusive) |

`YEAR_FROM` y `YEAR_TO` definen la ventana temporal: el materializador filtra `fecha_firma BETWEEN '{YEAR_FROM}-01-01' AND '{YEAR_TO}-12-31'` (además de `valor > 0` y deduplicación por `id`). Cambiarlas mueve toda la serie del dashboard.

> **Adaptar a otro esquema o fuente:** las consultas en `data/queries/*.sql` asumen el esquema del proyecto original. Las funciones `shape_*` de `materialize_public.py` son **puras** (transforman filas dict al formato de `src/lib/types.ts` sin tocar BigQuery), así que puedes reemplazar la capa de consulta por otra fuente y conservar la escritura de JSON. Si cambias la *forma* de los datos, actualiza también `src/lib/types.ts`. Más detalle en [Hacer un fork](04-Hacer-Un-Fork.md) y en [Datos y materialización](02-Datos-y-Materializacion.md).

---

## Checklist antes de desplegar

- [ ] `npm install` sin errores (con `.npmrc` presente)
- [ ] `npm run build` genera `dist/` sin fallos de TypeScript
- [ ] `npm run preview` muestra el sitio correctamente en local
- [ ] El hosting reescribe **todas las rutas a `/index.html`** (SPA)
- [ ] Si regeneraste datos: recompilaste **después** de correr `materialize_public.py`
- [ ] El sitio sigue siendo **100 % estático** — no llama a ninguna API ni función

---

## Solución de problemas

| Síntoma | Causa probable | Solución |
|---|---|---|
| 404 al recargar dentro de una sección | Falta el rewrite SPA | Reescribe todas las rutas a `/index.html` (ver tu hosting arriba) |
| Assets (JS/CSS) no cargan en GitHub Pages bajo subdirectorio | Falta `base` en Vite | Añade `base: '/ContratacionColombia/'` en `vite.config.ts` y recompila |
| `npm install` falla por *peer dependencies* | Falta `legacy-peer-deps` | Verifica que `.npmrc` exista con `legacy-peer-deps=true` |
| `firebase deploy` no encuentra el proyecto | `.firebaserc` ausente o con placeholder | Copia `.firebaserc.example` y pon tu Project ID |
| El materializador no autentica | Sin credenciales de BigQuery | Corre `gcloud auth application-default login` |

---

## Páginas relacionadas

- [¿Qué es VECTORVI?](00-Que-Es.md) — visión general del proyecto.
- [Datos y materialización](02-Datos-y-Materializacion.md) — cómo se construye el snapshot.
- [Hacer un fork](04-Hacer-Un-Fork.md) — personalizar y publicar tu propia versión.
- [Fuentes de datos](01-Fuentes.md) — de dónde sale cada cifra.
