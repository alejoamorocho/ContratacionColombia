# Guía de despliegue

VECTORVI es un **dashboard 100 % estático**: React 19 + Vite que lee archivos JSON pre-materializados desde `public/data/`. **No hay backend, ni Cloud Functions, ni base de datos en el repositorio público.** El navegador solo descarga HTML, CSS, JavaScript y los JSON del snapshot; nunca llama a una API en tiempo de ejecución. Eso significa que desplegarlo es, en esencia, **compilar el código y subir una carpeta de archivos** (`dist/`) a cualquier hosting estático del mundo.

Esa simplicidad arquitectónica es deliberada y tiene consecuencias prácticas excelentes:

- **Cero costo de servidor.** No hay proceso corriendo: solo archivos servidos por CDN. El hosting cuesta centavos o es gratis.
- **Cero superficie de ataque dinámica.** Sin endpoints que explotar, sin SQL injection posible, sin secretos en el frontend. La seguridad se reduce a cabeceras HTTP correctas (ver [sección de cabeceras](#cabeceras-de-seguridad-de-firebasejson)).
- **Portabilidad total.** Funciona igual en Firebase Hosting, Netlify, Vercel, GitHub Pages, Cloudflare Pages, un bucket de S3 o incluso un `python -m http.server` en local.
- **Reproducibilidad.** Cualquiera puede clonar, compilar y obtener exactamente el mismo sitio, porque los datos viajan dentro del repo.

Esta página cubre, de principio a fin, todo lo necesario para publicar el observatorio:

1. [Requisitos previos](#requisitos-previos)
2. [Compilar el sitio](#1-compilar-el-sitio) — `npm install` + `npm run build` → `dist/`.
3. [Desplegar `dist/` en Firebase Hosting](#2-desplegar-dist-en-firebase-hosting) — canales **preview** (no destructivos) vs **producción**.
4. [Desplegar en cualquier otro host estático](#3-desplegar-en-cualquier-otro-host-estatico) — Netlify, Vercel, GitHub Pages, Cloudflare, S3.
5. [Cabeceras de seguridad de `firebase.json`](#cabeceras-de-seguridad-de-firebasejson) — CSP, HSTS, X-Frame-Options, caché.
6. [Regenerar el snapshot de datos](#4-regenerar-el-snapshot-de-datos) — opcional, requiere credenciales propias de BigQuery.
7. [Publicar la Wiki de GitHub](#5-publicar-la-wiki-de-github) — `scripts/publish_wiki.py`.
8. [Checklist y solución de problemas](#checklist-antes-de-desplegar).

> Si solo quieres tu propia versión modificada del dashboard, lee también [Hacer un fork](04-Hacer-Un-Fork.md). Para entender qué hay dentro de cada JSON antes de tocarlo, [Datos y materialización](02-Datos-y-Materializacion.md).

---

## Requisitos previos

El snapshot ya viene incluido en `public/data/`, así que **para compilar y desplegar el sitio NO necesitas credenciales de nada**: ni BigQuery, ni Google Cloud, ni claves de API. Solo Node.

| Herramienta | Para qué | Versión sugerida |
|---|---|---|
| **Node.js + npm** | Compilar el dashboard (obligatorio) | Node 20 LTS o superior |
| **Git** | Clonar el repositorio | cualquiera reciente |
| **Firebase CLI** | *(Solo para Firebase Hosting)* `npm i -g firebase-tools` | reciente |
| **Python 3.9+** | *(Solo si regeneras datos o publicas la Wiki)* | 3.9 o superior |
| **gcloud + acceso a BigQuery** | *(Solo si regeneras datos)* credenciales propias | — |

El stack exacto (de `package.json`): React 19.2, Vite 8, TypeScript 6, React Router 7, Recharts 3, `react-simple-maps` + `d3-geo` para el mapa coroplético, y **Zod 4** para validar los JSON en tiempo de ejecución (ver [Arquitectura](11-Arquitectura.md)).

---

## 1. Compilar el sitio

```bash
git clone https://github.com/alejoamorocho/ContratacionColombia.git
cd ContratacionColombia
npm install
npm run build
```

El script `build` está definido en `package.json` como:

```json
"build": "tsc -b && vite build"
```

Es decir, ejecuta **dos pasos en orden**:

1. **`tsc -b`** — TypeScript compila en modo *build* y valida todos los tipos del proyecto. Si hay un error de tipos, el build se detiene aquí: nunca se publica código que no tipa. Esto incluye los esquemas de datos en `src/lib/types.ts`.
2. **`vite build`** — Vite empaqueta, minifica y aplica *tree-shaking*, copiando además todo `public/` (incluidos los JSON de `public/data/`) a la salida.

El resultado es la carpeta **`dist/`**, lista para subir a cualquier hosting. Contiene `index.html`, los *bundles* JS/CSS con hash en el nombre, los assets y la carpeta `data/` con el snapshot.

### Validación en runtime con Zod

Además de la verificación de tipos en compilación (`tsc`), el sitio valida los JSON **al cargarlos en el navegador** con esquemas Zod 4. Si un snapshot está malformado o tiene una forma inesperada, la app falla de manera explícita y temprana en lugar de renderizar cifras corruptas en silencio. Esto importa al desplegar: si regeneraste datos y cambiaste su forma sin actualizar los tipos/esquemas, lo notarás de inmediato.

### Probar localmente antes de desplegar

```bash
npm run dev       # servidor de desarrollo con HMR (http://localhost:5173)
npm run preview   # sirve dist/ TAL COMO saldrá en producción
npm run test      # corre la suite de Vitest
npm run lint      # ESLint sobre todo el repo
```

`npm run preview` es la prueba más fiel: levanta un servidor estático que sirve exactamente el `dist/` compilado, así que ves el sitio en condiciones idénticas a producción (rutas, assets con hash, JSON reales). Úsalo siempre antes de un `firebase deploy`.

> **Nota sobre `npm install` y React 19:** el repo incluye un `.npmrc` con `legacy-peer-deps=true`. **Mantenlo.** Evita conflictos de *peer dependencies* con React 19 (varias librerías declaran rangos de peer aún apuntando a React 18). Si clonas y `npm install` falla por dependencias, lo primero a verificar es que ese archivo siga presente en la raíz.

---

## 2. Desplegar `dist/` en Firebase Hosting

Firebase Hosting es el host del proyecto. El repositorio ya trae un `firebase.json` completamente configurado: carpeta `public: "dist"`, *rewrite* SPA, redirección de `/admin`, cabeceras de seguridad y políticas de caché. **No necesitas tocar `firebase.json` para un despliegue estándar.**

### Configuración inicial (una sola vez)

```bash
npm i -g firebase-tools     # una sola vez, global
firebase login

# Apunta a TU proyecto de Firebase:
cp .firebaserc.example .firebaserc
# edita .firebaserc y reemplaza "TU_PROJECT_ID_DE_FIREBASE" por tu Project ID
```

El archivo `.firebaserc.example` contiene la plantilla mínima:

```json
{
  "projects": {
    "default": "TU_PROJECT_ID_DE_FIREBASE"
  }
}
```

> **¿Por qué una plantilla y no el archivo real?** `.firebaserc` está en `.gitignore` porque es **específico de cada despliegue** (cada quien apunta a su propio proyecto de Firebase). El repo trae `.firebaserc.example` como plantilla: cópialo, pon tu Project ID y listo. Así nadie sube por error el Project ID de otro al control de versiones.

### Despliegue a producción

```bash
npm run build
firebase deploy --only hosting
```

`--only hosting` limita el despliegue a Hosting (el repo público no tiene Functions, Firestore ni otras superficies, así que en la práctica es Hosting de todas formas, pero el flag es buena higiene). Tras unos segundos, Firebase devuelve la URL pública del sitio.

### Canales de previsualización (preview) — NO destructivos

Antes de pisar producción, **Firebase Hosting ofrece canales de previsualización**: despliegues a una URL temporal y aislada, sin afectar el sitio en vivo. Es la forma correcta de revisar un cambio (de código o de datos) antes de publicarlo.

```bash
# Crea/actualiza un canal preview llamado "revision" (URL temporal aislada):
firebase hosting:channel:deploy revision

# Con caducidad explícita (p. ej. 7 días):
firebase hosting:channel:deploy revision --expires 7d
```

Esto genera una URL del estilo `https://TU_PROYECTO--revision-XXXXXX.web.app` que sirve tu `dist/` actual **sin tocar el canal `live`** (producción). Puedes compartirla, revisarla, iterar, y cuando estés conforme:

```bash
# Promueve el canal preview a producción (sin recompilar):
firebase hosting:clone TU_PROYECTO:revision TU_PROYECTO:live
```

…o simplemente corre `firebase deploy --only hosting` con el `dist/` ya validado.

Gestión de canales:

```bash
firebase hosting:channel:list                # lista canales activos y sus URLs
firebase hosting:channel:delete revision     # borra un canal preview
```

| Acción | Comando | Afecta producción |
|---|---|---|
| Desplegar a producción | `firebase deploy --only hosting` | **Sí** (canal `live`) |
| Desplegar a preview | `firebase hosting:channel:deploy <nombre>` | No (URL temporal) |
| Promover preview → producción | `firebase hosting:clone PROY:<canal> PROY:live` | **Sí** |
| Listar canales | `firebase hosting:channel:list` | No |
| Borrar preview | `firebase hosting:channel:delete <nombre>` | No |

> **Regla de oro de Firebase:** trabaja en un canal preview, valida la URL temporal, y solo entonces promueve o despliega a `live`. Los canales preview caducan solos (por defecto a los 7 días) y nunca pisan el sitio en vivo: son no destructivos por diseño.

### La redirección de `/admin`

El `firebase.json` incluye una redirección 302 de `/admin` hacia `https://vectorvi-admin.web.app`. Es un detalle del despliegue del proyecto original (separa la zona privada de administración del observatorio público). **En un fork puedes eliminar ese bloque** de `firebase.json` si no tienes un sitio admin propio:

```json
"redirects": [
  { "source": "/admin", "destination": "https://vectorvi-admin.web.app", "type": 302 }
]
```

---

## 3. Desplegar en cualquier otro host estático

`dist/` es una **SPA estática** convencional. Sirve igual en cualquier hosting. La **única** configuración indispensable, sea cual sea el host, es un *rewrite* de todas las rutas a `index.html` — para que el enrutamiento del lado del cliente (React Router) funcione al recargar la página o entrar directo a una sección por URL. Sin él, recargar en `/donde` o `/quien` da un 404 del servidor.

### Netlify

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Rewrite SPA:** crea `public/_redirects` con una sola línea:
  ```
  /* /index.html 200
  ```
  (Netlify copia `public/` durante el build, así que el archivo termina en la raíz publicada.) Alternativamente, configúralo en `netlify.toml`.

### Vercel

Vercel **detecta Vite automáticamente** y aplica el rewrite SPA por defecto. Si necesitas configurarlo a mano:

- **Build command:** `npm run build`
- **Output directory:** `dist`
- En la mayoría de los casos no hace falta configuración extra de rewrites para una SPA de Vite.

### GitHub Pages

1. Compila: `npm run build`.
2. Publica el contenido de `dist/` en la rama/carpeta que GitHub Pages sirva (con una GitHub Action o la rama `gh-pages`).
3. **Subdirectorio:** si el sitio se sirve **bajo un subdirectorio** (p. ej. `usuario.github.io/ContratacionColombia/`), añade `base: '/ContratacionColombia/'` en `vite.config.ts` y **recompila**, para que las rutas a los assets sean correctas:
   ```ts
   export default defineConfig({
     base: '/ContratacionColombia/',
     plugins: [react()],
     // ...
   })
   ```
   Si usas un dominio propio o `usuario.github.io` en la raíz, **no** hace falta `base`.
4. **404 en recarga:** GitHub Pages no permite rewrites de servidor reales. El truco habitual es copiar `index.html` a `404.html` dentro de `dist/` (GitHub Pages sirve `404.html` para rutas no encontradas, y la SPA toma el control desde ahí).

### Cloudflare Pages

- **Build command:** `npm run build`
- **Output directory:** `dist`
- Rewrite SPA: añade un archivo `public/_redirects` con `/* /index.html 200` (mismo formato que Netlify).

### Bucket estático (S3, GCS, etc.)

- Sube el contenido de `dist/` al bucket.
- Configura el *index document* como `index.html` y el *error document* también como `index.html` (eso emula el rewrite SPA).
- Pon un CDN delante (CloudFront, Cloud CDN) si quieres caché y HTTPS.
- **Importante:** en un bucket no tienes las cabeceras de seguridad de `firebase.json` automáticamente. Replícalas en la capa de CDN/edge (ver siguiente sección).

> **Regla de oro universal:** sea cual sea el hosting, asegúrate de que **todas las rutas se reescriban a `/index.html`**. Es lo único que una SPA estática necesita para no dar 404 al recargar dentro de una sección.

---

## Cabeceras de seguridad de `firebase.json`

El `firebase.json` del repo no solo configura el hosting: aplica un conjunto de **cabeceras de seguridad HTTP** a cada respuesta y políticas de caché afinadas. Como el sitio es 100 % estático, la seguridad se juega casi por completo en estas cabeceras. Si despliegas en otro host, **replica estas cabeceras** en la capa de CDN/edge para no perder esa protección.

### Cabeceras aplicadas a todas las respuestas (`source: "**"`)

| Cabecera | Valor | Qué hace |
|---|---|---|
| `X-Frame-Options` | `DENY` | Impide que el sitio se incruste en un `<iframe>` de otro dominio (anti-*clickjacking*). |
| `X-Content-Type-Options` | `nosniff` | Impide que el navegador "adivine" el MIME type y ejecute como script algo que no lo es. |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limita qué información de referente se envía al navegar a otros sitios. |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Desactiva por completo cámara, micrófono y geolocalización (el dashboard no los usa). |
| `Strict-Transport-Security` (HSTS) | `max-age=63072000; includeSubDomains; preload` | Fuerza HTTPS durante 2 años, incluidos subdominios, y habilita inclusión en la lista *preload* de los navegadores. |
| `Content-Security-Policy` (CSP) | *(ver abajo)* | Restringe de qué orígenes se pueden cargar scripts, estilos, fuentes, imágenes y conexiones. |

### La Content-Security-Policy en detalle

```
default-src 'self';
img-src 'self' data:;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
connect-src 'self';
frame-ancestors 'none'
```

| Directiva | Permite | Por qué |
|---|---|---|
| `default-src 'self'` | Solo recursos del propio origen | Base restrictiva: todo lo no especificado debe venir del sitio. |
| `img-src 'self' data:` | Imágenes propias + *data URIs* | Permite iconos/SVG embebidos en línea como `data:`. |
| `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com` | CSS propio, estilos en línea y Google Fonts | `unsafe-inline` es necesario para estilos en línea de React/Recharts; Google Fonts sirve las hojas de estilo de las fuentes. |
| `font-src 'self' https://fonts.gstatic.com` | Fuentes propias + Google Fonts | Los `.woff2` de las fuentes web se descargan de `fonts.gstatic.com`. |
| `connect-src 'self'` | Solo fetch/XHR al propio origen | **Clave:** el sitio solo busca sus propios JSON. No hay ninguna API externa permitida — coherente con "100 % estático, sin llamadas a servicios". |
| `frame-ancestors 'none'` | Ningún sitio puede incrustarlo | Refuerza `X-Frame-Options: DENY` a nivel de CSP. |

> El hecho de que `connect-src` sea `'self'` es la prueba técnica, a nivel de navegador, de que el dashboard **no se comunica con ningún servidor en tiempo de ejecución**: si algún código intentara llamar a una API externa, el navegador lo bloquearía. Es seguridad *y* documentación viva del principio "describe, no juzga, y no llama a nadie".

### Políticas de caché

| Patrón de archivo | `Cache-Control` | Razonamiento |
|---|---|---|
| `**/*.@(js\|css\|svg\|png\|jpg\|jpeg\|webp\|woff2\|woff\|json)` | `public, max-age=3600` | Assets y JSON se cachean 1 hora. (Los bundles JS/CSS llevan hash en el nombre, así que un cambio invalida la caché por sí solo.) |
| `**/*.html` | `no-cache` | El HTML nunca se cachea agresivamente, para que un despliegue nuevo se vea de inmediato (el `index.html` referencia los bundles con hash actualizados). |

`firebase.json` también declara `ignore` para no subir basura: `["firebase.json", "**/.*", "**/node_modules/**"]` — excluye el propio `firebase.json`, los archivos ocultos (dotfiles) y `node_modules`.

---

## 4. Regenerar el snapshot de datos

> **Opcional.** El repositorio ya incluye un snapshot completo y verificado en `public/data/`. Solo necesitas regenerarlo si quieres datos más recientes, otra ventana de años u otra fuente. Esto **requiere credenciales propias de BigQuery** y acceso a un dataset con la tabla `contratos`.

El snapshot incluido refleja el estado actual del observatorio. Las cifras de cabecera, leídas del propio snapshot, son:

| Magnitud | Valor |
|---|---|
| Contratos (deduplicados por `id`) | **3.969.440** |
| Valor contratado total | **$583,8 billones** |
| Valor mediano por contrato | **$20,06 M** |
| Entidades contratantes | **4.690** |
| Contratistas | **954.767** |
| Concentración top-10 contratistas | **7,0 %** del valor |
| Contratación directa — por nº de contratos | **78,3 %** |
| Contratación directa — por valor | **45,3 %** |
| PAA (Plan Anual de Adquisiciones) | **$58,6 B** |
| BPIN (inversión pública) — presupuesto vigente | **$424,8 B** (34 % ejecutado) |
| Sanciones SIRI | **13.441** |
| Aportes electorales | **$1,34 B** |
| Facturado / pagado (SECOP) | **$190,7 B** / **$154,5 B** (26,5 % pagado) |

> Estas cifras son las **verificadas** del snapshot vigente. No las copies como números "eternos": cambian cada vez que se regenera el snapshot. Lo estable es el **método**, no el número.

El pipeline vive en `data/`:

- **`data/materialize_public.py`** — lee BigQuery, deduplica por `id`, normaliza, aplica las transformaciones `shape_*` y escribe los JSON en `public/data/`.
- **`data/queries/*.sql`** — una consulta por agregado. El repo tiene **45 archivos `.sql`** (`panorama_kpis.sql`, `quien_entidades.sql`, `como_modalidad.sql`, `donde_departamento.sql`, etc.). Ver el desglose completo en [Cómo se calcula todo](13-Como-Se-Calcula-Todo.md).
- **`data/verify_snapshot.py`** — reconciliación **independiente** del snapshot contra BigQuery (re-deriva los números con formulaciones distintas y los compara con los JSON, además de chequeos de coherencia interna). Es la red de seguridad anti-cifras-inventadas.

### Pasos

```bash
cd data
pip install -r requirements.txt          # solo google-cloud-bigquery
gcloud auth application-default login     # credenciales propias (ADC)

# Configura proyecto, dataset y ventana de años (ver tabla abajo):
export GCP_PROJECT=tu-proyecto BQ_DATASET=tu-dataset YEAR_FROM=2022 YEAR_TO=2026

python materialize_public.py
```

> En **PowerShell (Windows)**, usa `$env:` en vez de `export`:
> ```powershell
> $env:GCP_PROJECT="tu-proyecto"; $env:BQ_DATASET="tu-dataset"; $env:YEAR_FROM="2022"; $env:YEAR_TO="2026"
> python materialize_public.py
> ```

El script escribe los JSON en `public/data/`. Después, **recompila y vuelve a desplegar** (`npm run build` + el deploy de tu hosting) para que el sitio sirva los datos nuevos. Recuerda que Vite copia `public/` durante el build: sin recompilar, `dist/` seguiría con el snapshot viejo.

### Verificar el snapshot antes de publicar

```bash
python data/verify_snapshot.py            # requiere ADC de BigQuery
```

`verify_snapshot.py` no reutiliza las consultas del materializador: re-deriva cada número desde la tabla cruda con otra formulación y lo compara con el JSON correspondiente, y además corre **guards anti-fragmentación** y chequeos de coherencia interna (sumas de partes contra totales, percentiles monótonos, etc.). Si algo no reconcilia, falla. Es el paso recomendado tras cualquier regeneración antes de desplegar a producción.

### Variables de entorno

Todas tienen valor por defecto; el script funciona sin configurar nada contra el proyecto original.

| Variable | Por defecto | Qué controla |
|---|---|---|
| `GCP_PROJECT` | `vectorvi` | Proyecto de Google Cloud / BigQuery |
| `BQ_DATASET` | `vectorvi` | Dataset que contiene la tabla `contratos` |
| `YEAR_FROM` | `2022` | Primer año de la ventana (inclusive) |
| `YEAR_TO` | `2026` | Último año de la ventana (inclusive) |

`YEAR_FROM` y `YEAR_TO` definen la ventana temporal: el materializador filtra `fecha_firma BETWEEN '{YEAR_FROM}-01-01' AND '{YEAR_TO}-12-31'` (además de `valor > 0` y deduplicación por `id`). Cambiarlas mueve toda la serie del dashboard.

> **Adaptar a otro esquema o fuente:** las consultas en `data/queries/*.sql` asumen el esquema del proyecto original. Las funciones `shape_*` de `materialize_public.py` son **puras** (transforman filas dict al formato de `src/lib/types.ts` sin tocar BigQuery), así que puedes reemplazar la capa de consulta por otra fuente y conservar la escritura de JSON. Si cambias la *forma* de los datos, actualiza también `src/lib/types.ts` y sus esquemas Zod. Más detalle en [Hacer un fork](04-Hacer-Un-Fork.md) y en [Datos y materialización](02-Datos-y-Materializacion.md).

---

## 5. Publicar la Wiki de GitHub

Esta documentación vive en `wiki/*.md` dentro del repo, pero también se publica en la **Wiki de GitHub** (un repositorio Git aparte, `<repo>.wiki.git`). El script `scripts/publish_wiki.py` sincroniza una con la otra.

### Un clic manual, una sola vez

GitHub **exige crear la PRIMERA página de la Wiki manualmente** desde la web antes de permitir el `push` por git:

1. Ve a `https://github.com/alejoamorocho/ContratacionColombia/wiki`.
2. Clic en **«Create the first page»**.
3. Clic en **«Save Page»** (el contenido da igual; el script lo sobrescribe).

Hecho ese clic una sola vez, ya puedes publicar por script todas las veces que quieras.

### Ejecutar el script

```bash
python scripts/publish_wiki.py
```

### Qué hace exactamente

1. **Clona** `https://github.com/alejoamorocho/ContratacionColombia.wiki.git` a un directorio temporal. Si el clon falla (porque aún no creaste la primera página), el script imprime instrucciones claras y se detiene con código de error.
2. **Limpia** el contenido anterior de la Wiki (borra los `.md`, preserva `.git`).
3. **Copia** cada archivo de `wiki/*.md` aplicando una transformación de enlaces:
   - **Enlaces entre páginas** (`[texto](07-Las-Secciones.md)`) → quita la extensión `.md`, porque la Wiki de GitHub usa el *slug* del archivo como ruta (`[texto](07-Las-Secciones)`). Conserva los anclas `#seccion`.
   - **Referencias a archivos del repo** (`[texto](../data/materialize_public.py)`) → las convierte a URL absoluta en GitHub (`https://github.com/alejoamorocho/ContratacionColombia/blob/main/data/materialize_public.py`).
4. **Genera la navegación**:
   - `_Sidebar.md` — barra lateral con las 16 entradas en orden curado (de *Inicio* a *FAQ*), definido en la lista `ORDEN` del script.
   - `_Footer.md` — pie con licencia (Apache 2.0), autores y enlace al repositorio.
5. **Commit y push** a la Wiki. Si el push tiene éxito, imprime la URL final: `https://github.com/alejoamorocho/ContratacionColombia/wiki`.
6. **Limpia** el directorio temporal.

### Implicaciones prácticas

- **Los enlaces internos de esta wiki deben escribirse con `.md`** (`[Despliegue](12-Despliegue.md)`). El script se encarga de quitar la extensión para la Wiki de GitHub. No escribas los enlaces sin `.md`: romperías la navegación local del repo.
- **El orden de la barra lateral es curado**, no alfabético. Si añades una página nueva, agrégala a la lista `ORDEN` en `scripts/publish_wiki.py` para que aparezca en el sidebar.
- El script es **idempotente**: cada ejecución reemplaza por completo el contenido de la Wiki con el estado actual de `wiki/`. La Wiki es siempre un reflejo fiel del repo.

---

## Checklist antes de desplegar

- [ ] `npm install` sin errores (con `.npmrc` con `legacy-peer-deps=true` presente)
- [ ] `npm run build` genera `dist/` sin fallos de TypeScript (`tsc -b`)
- [ ] `npm run test` y `npm run lint` pasan
- [ ] `npm run preview` muestra el sitio correctamente en local
- [ ] El hosting reescribe **todas las rutas a `/index.html`** (SPA)
- [ ] Las cabeceras de seguridad (CSP, HSTS, X-Frame-Options) están aplicadas — `firebase.json` ya las trae; en otro host, replícalas
- [ ] (Firebase) Probaste primero en un **canal preview** antes de promover a `live`
- [ ] (Firebase) `.firebaserc` apunta a TU Project ID, no al placeholder
- [ ] Si regeneraste datos: corriste `verify_snapshot.py` y **recompilaste después** de `materialize_public.py`
- [ ] El sitio sigue siendo **100 % estático** — no llama a ninguna API ni función (lo confirma `connect-src 'self'` en la CSP)

---

## Solución de problemas

| Síntoma | Causa probable | Solución |
|---|---|---|
| 404 al recargar dentro de una sección | Falta el rewrite SPA | Reescribe todas las rutas a `/index.html` (Firebase ya lo hace; otros hosts, ver arriba) |
| Assets (JS/CSS) no cargan en GitHub Pages bajo subdirectorio | Falta `base` en Vite | Añade `base: '/ContratacionColombia/'` en `vite.config.ts` y recompila |
| `npm install` falla por *peer dependencies* | Falta `legacy-peer-deps` | Verifica que `.npmrc` exista con `legacy-peer-deps=true` |
| `firebase deploy` no encuentra el proyecto | `.firebaserc` ausente o con placeholder | Copia `.firebaserc.example` y pon tu Project ID |
| El sitio desplegado muestra datos viejos | No recompilaste tras regenerar JSON | `npm run build` copia `public/data/` a `dist/`; recompila y vuelve a desplegar |
| Fuentes o estilos bloqueados en consola | CSP demasiado restrictiva tras editar `firebase.json` | Revisa `style-src`/`font-src`; Google Fonts requiere `fonts.googleapis.com` y `fonts.gstatic.com` |
| La app falla al cargar con error de validación | Snapshot malformado tras cambiar su forma | Zod detecta JSON con forma inesperada; alinea `public/data/*.json` con `src/lib/types.ts` |
| El materializador no autentica | Sin credenciales de BigQuery | Corre `gcloud auth application-default login` |
| `publish_wiki.py` no puede clonar la Wiki | Falta crear la primera página | Crea la primera página desde la web una vez (ver [sección 5](#5-publicar-la-wiki-de-github)) |

---

## Páginas relacionadas

- [¿Qué es VECTORVI?](00-Que-Es.md) — visión general del proyecto.
- [Arquitectura](11-Arquitectura.md) — cómo está construido el frontend estático y la validación Zod.
- [Datos y materialización](02-Datos-y-Materializacion.md) — cómo se construye el snapshot.
- [Cómo se calcula todo](13-Como-Se-Calcula-Todo.md) — los 45 SQL y cada KPI.
- [Hacer un fork](04-Hacer-Un-Fork.md) — personalizar y publicar tu propia versión.
- [Auditoría de datos](06-Auditoria-De-Datos.md) — cómo `verify_snapshot.py` reconcilia las cifras.
