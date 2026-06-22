# Arquitectura técnica

Esta página describe cómo está construido el sitio público: el flujo que va de la fuente de datos al navegador, por qué es **estático**, cómo se organiza el código y qué garantías de seguridad ofrece esa decisión.

El resumen en una línea: **BigQuery → `materialize_public.py` → `public/data/*.json` → SPA**. El sitio público nunca toca BigQuery; solo lee archivos JSON ya calculados.

---

## El flujo, paso a paso

```
  ┌───────────────┐   data/materialize_public.py     ┌──────────────────┐   build (Vite)   ┌──────────────────┐
  │   BigQuery     │   + data/queries/*.sql           │  public/data/     │  ───────────▶    │   Sitio estático │
  │  (privado)     │  ─────────────────────────────▶  │  *.json           │                  │  React + Vite    │
  │                │                                  │  (snapshot         │                  │  (SPA en CDN)    │
  │  contratos,    │   • deduplica por id              │   versionado)      │   ◀── fetch ───  │  10 secciones    │
  │  procesos,     │   • normaliza (DANE, modalidades,  │                    │   (solo lectura) │  gráficas + mapa │
  │  PAA, BPIN,    │     etiquetas de objeto)           │                    │                  │                  │
  │  SIRI, CNE     │   • escribe un JSON por sección    │                    │                  │                  │
  └───────────────┘                                   └──────────────────┘                  └──────────────────┘
     lee la fuente          se corre A MANO                snapshot agregado                   cero backend:
     (requiere acceso)      cuando se refresca             commiteado al repo                  solo sirve archivos
```

Hay tres etapas claramente separadas:

1. **Materialización (fuera de línea, privada).** Quien tenga acceso a BigQuery ejecuta `data/materialize_public.py`. El script corre las consultas de `data/queries/*.sql`, deduplica la tabla base por `id`, normaliza valores y escribe un archivo JSON agregado por sección en `public/data/`. Este paso es **manual** y ocurre solo cuando los mantenedores quieren refrescar el snapshot. Detalle en **[Materialización](02-Datos-y-Materializacion.md)**.

2. **Build (compilación).** `npm run build` (`tsc -b && vite build`) compila la SPA de React y copia `public/data/*.json` al directorio `dist/`. El resultado es un paquete de archivos estáticos: HTML, JS, CSS, fuentes y los JSON.

3. **Servir (en línea, pública).** Cualquier hosting de archivos sirve `dist/`. En el navegador, cada sección hace `fetch('data/<seccion>.json')` y pinta las gráficas. No hay servidor de aplicación, ni base de datos, ni funciones en tiempo de ejecución.

La frontera importante: **el snapshot JSON es el contrato entre el mundo privado (BigQuery) y el público (la SPA)**. Todo lo sensible (credenciales, acceso a la fuente, lógica de consulta) vive antes de generar el JSON y nunca se despliega.

---

## Por qué estático

La decisión de arquitectura más relevante es que el sitio público **no tiene backend**. Esto no es una limitación accidental: es el diseño.

### Costo

- Servir archivos estáticos desde un CDN cuesta casi nada y escala sin esfuerzo: el mismo bundle responde a 10 o a 10.000 visitantes.
- No hay cómputo por petición, no hay base de datos que mantener encendida, no hay funciones que facturen invocaciones. El gasto recurrente del sitio público tiende a cero.
- Refrescar los datos es un commit de archivos JSON nuevos, no un despliegue de infraestructura.

### Seguridad

- **Sin backend no hay superficie de ataque de backend.** No hay endpoint que inyectar, ni consulta que abusar, ni autenticación que romper en el sitio público.
- Los datos servidos ya son **agregados y anónimos en su forma de presentación**: el visitante recibe totales, percentiles y rankings, no la tabla cruda con credenciales o queries.
- El acceso a BigQuery (la parte cara y sensible) queda **del lado de los mantenedores**, detrás de la materialización manual. Un fork puede correr el dashboard completo sin tener jamás acceso a la fuente original, usando el snapshot incluido.

### Portabilidad

- Al ser estático, se despliega en **cualquier** hosting de archivos: Firebase Hosting, Netlify, Vercel, Cloudflare Pages o GitHub Pages. No hay dependencia de proveedor.
- Hacer un fork no requiere aprovisionar nada: `git clone`, `npm install`, `npm run dev` y funciona con el snapshot incluido. Ver **[Hacer un fork](04-Hacer-Un-Fork.md)**.

---

## Estructura de carpetas

```
vectorvi-public/
├── data/                      # Pipeline (Python) — NO se despliega
│   ├── materialize_public.py  # Orquestador: consulta, transforma (shape_*), escribe JSON
│   ├── queries/               # 33 archivos .sql, uno o varios por sección
│   ├── test_materialize.py    # Prueba las shape_* sin tocar BigQuery
│   └── requirements.txt
│
├── public/
│   └── data/                  # Snapshot JSON versionado (la "BD" del sitio)
│       ├── meta.json          # Ventana, fecha de corte, fuentes, notas
│       ├── panorama.json      # KPIs macro + por año + top sectores (Inicio)
│       ├── quien.json         # Entidades, niveles de gobierno, sectores
│       ├── como.json          # Modalidades + procesos
│       ├── planeacion.json    # PAA
│       ├── inversion.json     # BPIN
│       ├── ejecucion.json     # Contratado → facturado → pagado
│       ├── donde.json         # Agregados por departamento (DANE)
│       ├── procesos.json      # Embudo de procesos
│       ├── senales.json       # Concentración, percentiles, sanciones
│       ├── sanciones.json     # Sanciones SIRI
│       ├── electoral.json     # Aportes de campaña
│       └── cruces.json        # Donante↔contratista, sancionado↔contratista
│
├── src/                       # SPA (React + TypeScript) — se compila a dist/
│   ├── App.tsx                # Router: rutas → páginas (lazy-loaded)
│   ├── main.tsx               # Punto de entrada
│   ├── pages/                 # Una página por sección (Inicio, Quien, Como, …, Acerca)
│   ├── components/            # Shell narrativo, layout, mapa, badges, notas
│   │   ├── charts/            # KPICard, VBarChart, VLineChart, VPieChart
│   │   └── ui/                # Primitivas (Card)
│   ├── hooks/                 # usePublicData — el fetch de los JSON
│   ├── lib/                   # types, config, formatters, chartTheme
│   └── styles/                # tokens.css, globals.css, tones.css, badges.css
│
├── firebase.json              # Config de hosting (rewrites SPA + headers de seguridad)
├── firestore.rules            # deny-all (defensa en profundidad)
└── vite.config.ts             # Build + entorno de test (vitest)
```

Regla mental para orientarse:

| Carpeta | Lenguaje | ¿Se despliega? | Rol |
|---|---|---|---|
| `data/` | Python + SQL | **No** | Genera el snapshot desde la fuente |
| `public/data/` | JSON | Sí (copiado a `dist/`) | El dato que lee el sitio |
| `src/` | TypeScript + React | Sí (compilado) | La presentación |

---

## El shell de storytelling

Todas las secciones comparten un mismo marco narrativo, **`PageShell`** (`src/components/PageShell.tsx`), que impone el orden de lectura de cada página:

```
pregunta → contexto → (callout opcional) → datos → metodología → disclaimer
```

Esto da coherencia y refuerza el tono **"describe, no juzga"**: cada sección abre planteando una pregunta ciudadana y explicando qué muestra, antes de presentar cualquier cifra, y cierra siempre con un **disclaimer** (`DisclaimerFooter`) y, cuando aplica, una nota de **[Metodología](03-Metodologia.md)**.

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

El tono se hereda vía la variable CSS `--shell-tone` y colorea el sobretítulo, el callout narrativo, los bordes de acento y las gráficas. Da identidad visual a cada pregunta sin recargar la interfaz. El estilo base (paleta oscura tipo GitHub/Vercel, radios, espaciado) vive en `tokens.css` y `globals.css`.

Las 10 secciones y su contenido se documentan en **[Las secciones](07-Las-Secciones.md)**.

### Cómo una página obtiene sus datos

Cada página es un componente en `src/pages/`, cargado de forma **lazy** desde `App.tsx`, que lee su JSON con el hook **`usePublicData`**:

```ts
const { data, loading, error } = usePublicData<TipoSeccion>('panorama');
```

El hook hace un único `fetch('data/<seccion>.json')` relativo al `BASE_URL` del despliegue (definido en `src/lib/config.ts`, lo que permite servir bajo un subpath como en GitHub Pages). No hay estado global, ni store, ni cliente de datos: cada sección es independiente y se hidrata con su propio archivo.

---

## Invariantes de seguridad

Estas propiedades son **invariantes del proyecto**: deben mantenerse en cualquier fork que quiera seguir siendo "el observatorio público". Si las rompes, dejas de tener un sitio estático.

### Cero en el sitio público

- **Cero funciones.** No hay Cloud Functions, ni API routes, ni serverless. El sitio solo sirve archivos.
- **Cero base de datos.** No hay Firestore, ni SQL, ni KV en tiempo de ejecución. La "base de datos" es el conjunto de JSON estáticos en `public/data/`.
- **Cero autenticación.** No hay login, ni sesiones, ni tokens. Todo es público de lectura por diseño.
- **Cero llamadas a terceros desde el navegador.** El único `fetch` es a los JSON del propio origen. No se llama a BigQuery, ni a ninguna API externa, en tiempo de ejecución.

### Defensa en profundidad

Aunque el sitio no usa nada de lo anterior, la configuración refuerza la frontera por si acaso:

- **`firestore.rules` es `deny-all`.** Si por error se asociara una base Firestore al proyecto, nadie podría leer ni escribir nada (`allow read, write: if false`).
- **Cabeceras de seguridad en `firebase.json`.** Se aplican `Content-Security-Policy` (con `connect-src 'self'`, que prohíbe llamadas de red fuera del propio origen), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, `Referrer-Policy` y `Permissions-Policy` que desactiva cámara, micrófono y geolocalización.
- **El acceso a la fuente vive solo en `data/`**, que no se despliega. Las credenciales de BigQuery nunca entran al bundle.

### El test que protege la frontera

Mantener el sitio estático es verificable. El checklist de un fork (ver **[Hacer un fork](04-Hacer-Un-Fork.md)**) incluye comprobar que **el sitio no llama a ninguna API ni función**. Una regla práctica: si añades código que necesita un backend para funcionar, has salido del modelo de este proyecto.

---

## En resumen

- El sitio público es un **paquete de archivos estáticos**: HTML, JS, CSS y JSON. Nada más.
- Todo lo costoso y sensible (BigQuery, credenciales, lógica de consulta) ocurre **antes**, en la materialización manual, y nunca se despliega.
- El **snapshot JSON** es la frontera entre lo privado y lo público, y el contrato que cualquier fork hereda.
- El **shell de storytelling** y el **sistema de tonos** dan una experiencia coherente que refuerza el principio **"describe, no juzga"**.

Para seguir: **[Materialización](02-Datos-y-Materializacion.md)** (cómo se generan los JSON), **[Hacer un fork](04-Hacer-Un-Fork.md)** (cómo correrlo y desplegarlo) y **[Caveats](09-Caveats-Y-Limites.md)** (los límites reales de los datos).
