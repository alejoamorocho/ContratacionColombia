# Wiki — VECTORVI público

**VECTORVI — Observatorio público de contratación colombiana** es un dashboard **estático** (React 19 + Vite) que muestra, con gráficas claras y tono neutral, cómo se movió la contratación pública colombiana entre **2022 y 2026**. Lee únicamente archivos **JSON pre-calculados** (un *snapshot* versionado en el repositorio) derivados de los datos abiertos de **SECOP II** y de cinco fuentes complementarias. El sitio **no tiene backend, ni base de datos, ni funciones, ni autenticación**: su única superficie pública son archivos estáticos servidos por una CDN. Eso lo hace barato, seguro de operar y trivial de forkear.

Su principio rector, innegociable, es **"describe, no juzga"**. Es un laboratorio de datos, no un tribunal: ningún número se presenta como acusatorio, no hay *scoring* ni rankings de "los peores", y todo se expresa como estadística descriptiva (conteos, medianas, percentiles, participaciones). Las coincidencias entre fuentes —por ejemplo, que un mismo NIT aparezca como donante de campaña y como contratista— se reportan como hechos verificables, sin inferir intención. Esta wiki documenta de dónde vienen los datos, cómo se transforman, qué metodología se aplica, cómo se calcula cada cifra y cómo hacer tu propia versión.

---

## El flujo de datos, de un vistazo

El recorrido va de un almacén privado (BigQuery, al que el público nunca accede) a un *snapshot* JSON versionado en el repo, que el sitio estático sirve por CDN.

```
   BigQuery (privado)        data/                    public/data/             Sitio estático (público)
 ┌───────────────────┐   ┌────────────────────┐   ┌────────────────────┐   ┌──────────────────────┐
 │ contratos (SECOP) │   │ queries/*.sql      │   │ panorama.json      │   │  React 19 + Vite     │
 │ procesos          │   │  (45 agregados)    │   │ quien / como.json  │   │  (SPA servida en CDN)│
 │ PAA / BPIN        │──▶│ materialize_       │──▶│ donde / senales    │──▶│  10 secciones        │
 │ Sanciones (SIRI)  │   │   public.py        │   │ kpis_extra.json    │   │  gráficas + mapa     │
 │ Aportes (CNE)     │   │  (dedup, normaliza │   │ meta.json …        │   │  validación Zod en   │
 │ RUES (cruces)     │   │   DANE, etiquetas) │   │ (16 archivos)      │   │  runtime             │
 └───────────────────┘   └────────────────────┘   └────────────────────┘   └──────────────────────┘
   lee la fuente           deduplica por id          snapshot JSON            solo lee JSON:
   (con credenciales)      y normaliza una vez        versionado en Git        cero backend, cero llaves
                                  │                          ▲
                                  └──── verify_snapshot.py ──┘
                                   valida cifras + guards estructurales
                                   (anti-fragmentación) antes de publicar
```

**Tres ideas clave del flujo:**

1. **La separación es total.** BigQuery vive en el proyecto privado de los mantenedores; el repositorio público solo contiene el *snapshot* JSON ya agregado y anónimo a nivel de cifra. No hay credenciales, conexiones ni endpoints en el sitio.
2. **El paso BigQuery → JSON se ejecuta a mano**, cuando los mantenedores deciden refrescar el *snapshot* (no es un *cron* en producción). El sitio público nunca toca BigQuery. Detalle en **[Materialización](02-Datos-y-Materializacion.md)**.
3. **Todo se valida antes de publicar.** `verify_snapshot.py` comprueba las cifras y aplica *guards* estructurales permanentes —como el anti-fragmentación, que evita que una misma categoría aparezca partida en etiquetas duplicadas— para que ningún error de forma llegue al sitio. Detalle en **[Auditoría](06-Auditoria-De-Datos.md)**.

---

## Cifras del snapshot

Cifras agregadas de SECOP II, ventana **2022–2026**, **deduplicadas por identificador de contrato** y filtradas a `valor > 0`. Snapshot generado el **2026-06-23** con corte de datos al **2026-06-03** (ver `public/data/meta.json` y `panorama.json`).

| Indicador | Valor | Fuente en el repo |
|---|---|---|
| Contratos | 3.969.440 | `panorama.json → kpis.contratos` |
| Valor total (firmado) | $583,8 billones COP | `panorama.json → kpis.valor_total` |
| Valor mediano por contrato | $20,06 millones COP | `panorama.json → kpis.valor_mediano` |
| Entidades contratantes | 4.690 | `panorama.json → kpis.entidades` |
| Contratistas | 954.767 | `panorama.json → kpis.contratistas` |
| Contratación directa (por nº de contratos) | 78,3 % | `como.json → pct_directa` |
| Contratación competitiva (por nº de contratos) | 21,7 % | `como.json → pct_competitiva` |
| Contratación directa (por valor) | 45,3 % | `como.json → pct_directa_valor` |

> **El valor total subestima el gasto público real.** No incluye SECOP I ni las adiciones posteriores a la firma, y es sensible a un puñado de contratos de cuantía extrema (que pueden incluir errores de digitación en la fuente). Por eso siempre se acompaña de la **mediana**, robusta a esos casos. Ver **[Caveats](09-Caveats-Y-Limites.md)** y **[Auditoría](06-Auditoria-De-Datos.md)**.

> **2026 es un año parcial:** solo cuenta los contratos firmados hasta el corte de datos. Además, el primer semestre de **2022** tiene cobertura baja en SECOP II frente al resto de la serie. No interpretes las "caídas" en los extremos de la línea de tiempo como una baja real de la actividad.

---

## Índice de la wiki

### Empezar

| Página | De qué trata |
|---|---|
| **[Qué es](00-Que-Es.md)** | Qué hace el proyecto, para quién es, y —tan importante— qué **NO** es. |
| **[La historia del proyecto](14-La-Historia.md)** | El relato completo: de dónde viene, por qué existe y a dónde va. |
| **[Las secciones](07-Las-Secciones.md)** | Las 10 preguntas ciudadanas que organizan el dashboard, una por una. |

### Datos

| Página | De qué trata |
|---|---|
| **[Fuentes](01-Fuentes.md)** | Las seis fuentes: SECOP II (contratos y procesos), PAA, BPIN, Sanciones SIRI y Aportes de campaña (CNE), con periodos y cortes. |
| **[Materialización](02-Datos-y-Materializacion.md)** | El pipeline `queries/*.sql` + `materialize_public.py`: cómo se va de BigQuery a los 16 JSON. |
| **[Auditoría de datos](06-Auditoria-De-Datos.md)** | Control de calidad y veracidad: `verify_snapshot.py`, los *guards* anti-fragmentación y las correcciones recientes. |
| **[Caveats y límites](09-Caveats-Y-Limites.md)** | Los límites reales de los datos, sin letra pequeña: cobertura, subestimación de valor, años parciales. |

### Entender

| Página | De qué trata |
|---|---|
| **[Metodología](03-Metodologia.md)** | Qué calculamos y qué **NO**: sin *score* ponderado, sin juicios, solo estadística descriptiva. |
| **[Cómo se calcula todo](13-Como-Se-Calcula-Todo.md)** | La referencia completa: la fórmula exacta de cada KPI, análisis y señal (cadena BPIN, tamaño típico de contrato, distribución de pago, HHI por sector, antigüedad del contratista, multas SECOP, per cápita por departamento, reincidencia, fidelidad del PAA). |
| **[Los cruces](08-Los-Cruces.md)** | Cómo se relacionan donantes, sancionados y contratistas: coincidencias factuales por NIT, sin inferir intención. |
| **[Glosario](10-Glosario.md)** | Términos de contratación pública en lenguaje claro (NIT, BPIN, PAA, modalidad, HHI, SIRI…). |

### Técnico

| Página | De qué trata |
|---|---|
| **[Arquitectura](11-Arquitectura.md)** | El stack (React 19 + Vite, validación Zod en runtime) y por qué el sitio es 100 % estático. |
| **[Hacer un fork](04-Hacer-Un-Fork.md)** | Clona, corre con el *snapshot* incluido, cambia y despliega tu propia versión. |
| **[Despliegue](12-Despliegue.md)** | Publicar en cualquier hosting estático (Firebase Hosting, GitHub Pages, Netlify, Vercel…). |

### Ayuda

| Página | De qué trata |
|---|---|
| **[FAQ](05-FAQ.md)** | Preguntas frecuentes sobre datos, metodología, alcance y uso. |

---

## Las 10 secciones del dashboard

Cada sección responde una pregunta ciudadana y se alimenta de uno o varios JSON del *snapshot*. Detalle en **[Las secciones](07-Las-Secciones.md)**.

| Sección | Pregunta | Qué muestra |
|---|---|---|
| **Inicio** | — | Resumen nacional + navegación editorial. |
| **Quién contrata** | ¿Quién? | Top entidades y contratistas, nivel de gobierno, categoría de objeto. |
| **Cómo contrata** | ¿Cómo? | Modalidades, % directa y % de procesos adjudicados. |
| **Qué se planea** | ¿Qué se planea? | Plan Anual de Adquisiciones (PAA) y su fidelidad con lo contratado. |
| **En qué se invierte** | ¿En qué? | Presupuesto de inversión pública (BPIN) y la cadena vigente→comprometido→obligado→pagado. |
| **Se ejecuta** | ¿Se ejecuta? | Contratado → facturado → pagado, y la distribución de avance de pago. |
| **Dónde** | ¿Dónde? | Mapa coroplético de Colombia por departamento (normalizado a código DANE), con per cápita. |
| **Hay señales** | ¿Hay señales? | Concentración de proveedores (HHI), sanciones (SIRI) y financiación electoral. |
| **Se cruzan los datos** | ¿Se cruzan? | Coincidencias factuales: donante↔contratista y sancionado↔contratista. |
| **Acerca** | — | Metodología, fuentes y límites. |

---

## En una frase

Tomamos datos públicos de contratación (SECOP II, PAA, BPIN, Sanciones SIRI y Aportes de campaña), los **agregamos y deduplicamos en BigQuery**, exportamos un *snapshot* en JSON validado y lo mostramos en un **dashboard estático** con gráficas y mapa. Sin backend público, sin opiniones: **solo datos organizados**.

## Empezar rápido

¿Quieres tu propia versión? Clona, corre con el *snapshot* incluido y despliega: **[Hacer un fork](04-Hacer-Un-Fork.md)**. El proyecto es **Apache 2.0**, creado por Alejandro y Juan José Amorocho.
