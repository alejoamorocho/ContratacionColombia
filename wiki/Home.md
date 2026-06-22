# Wiki — VECTORVI público

**VECTORVI — Observatorio público de contratación colombiana** es un dashboard **estático** (React + Vite) que lee archivos JSON pre-materializados a partir de datos abiertos de la contratación pública colombiana, ventana **2022–2026**. No tiene backend, ni base de datos, ni funciones en el sitio público: solo archivos servidos por CDN. Su principio rector es **"describe, no juzga"** — es un laboratorio de datos, y ningún dato se presenta como acusatorio. Esta wiki documenta de dónde vienen los datos, cómo se transforman, qué metodología se aplica y cómo hacer tu propia versión.

## Páginas

### Empezar
- **[Qué es](00-Que-Es.md)** — qué hace el proyecto, para quién, y qué NO es.
- **[Las secciones](07-Las-Secciones.md)** — las 10 preguntas que organizan el dashboard.

### Datos
- **[Fuentes](01-Fuentes.md)** — SECOP II, BPIN, Sanciones SIRI, Aportes de campaña.
- **[Materialización](02-Datos-y-Materializacion.md)** — el pipeline que va de BigQuery a JSON.
- **[Auditoría](06-Auditoria-De-Datos.md)** — control de calidad y veracidad de las cifras.
- **[Caveats](09-Caveats-Y-Limites.md)** — los límites reales de los datos, sin letra pequeña.

### Entender
- **[Metodología](03-Metodologia.md)** — qué calculamos y qué NO (sin scoring, sin juicios).
- **[Los cruces](08-Los-Cruces.md)** — cómo se relacionan donantes, sancionados y contratistas.
- **[Glosario](10-Glosario.md)** — términos de contratación pública en lenguaje claro.

### Técnico
- **[Arquitectura](11-Arquitectura.md)** — el stack y por qué es estático.
- **[Hacer un fork](04-Hacer-Un-Fork.md)** — clona, cambia, despliega lo tuyo.
- **[Despliegue](12-Despliegue.md)** — publicar en cualquier hosting estático.

### Ayuda
- **[FAQ](05-FAQ.md)** — preguntas frecuentes.

## En una frase

Tomamos datos públicos de contratación (SECOP II, BPIN, Sanciones SIRI, Aportes de campaña), los agregamos y deduplicamos en BigQuery, exportamos un snapshot en JSON y lo mostramos en un dashboard estático con gráficas y mapa. Sin backend público, sin opiniones: solo datos organizados.

## El flujo, de un vistazo

```
   BigQuery                data/                  public/data/            Sitio estático
 ┌──────────┐        ┌──────────────────┐      ┌──────────────┐        ┌────────────────┐
 │ contratos│        │ queries/*.sql    │      │ panorama.json│        │  React + Vite  │
 │ procesos │  ───▶  │ materialize_     │ ───▶ │ donde.json   │  ───▶  │  (SPA en CDN)  │
 │ PAA/BPIN │        │   public.py      │      │ senales.json │        │  10 secciones  │
 │ SIRI/CNE │        │ (dedup, normaliza│      │ cruces.json  │        │  gráficas+mapa │
 └──────────┘        │  DANE, etiquetas)│      │ …            │        └────────────────┘
                     └──────────────────┘      └──────────────┘
   lee la fuente      deduplica por id          snapshot JSON          solo lee JSON,
   (privado)          y normaliza               versionado en repo     cero backend
```

El paso de BigQuery a JSON se ejecuta **a mano** cuando los mantenedores quieren refrescar el snapshot; el sitio público nunca toca BigQuery. Detalle en **[Materialización](02-Datos-y-Materializacion.md)**.

## Cifras del snapshot (2022–2026, deduplicado)

| Indicador | Valor |
|---|---|
| Contratos | 3.969.440 |
| Valor total | $583,8 billones COP |
| Valor mediano | $20 millones COP |
| Entidades | 4.690 |
| Contratistas | 954.767 |
| Contratación directa | 78,4 % |

El **valor total subestima** el gasto público real (no incluye SECOP I ni adiciones) y es sensible a outliers; por eso se muestra también la mediana. Ver **[Caveats](09-Caveats-Y-Limites.md)** y **[Auditoría](06-Auditoria-De-Datos.md)**.

## Empezar rápido

¿Quieres tu propia versión? Clona, corre con el snapshot incluido y despliega: **[Hacer un fork](04-Hacer-Un-Fork.md)**. El proyecto es **Apache 2.0**, creado por Alejandro y Juan José Amorocho.
