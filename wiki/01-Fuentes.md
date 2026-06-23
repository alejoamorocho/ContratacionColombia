# Fuentes de datos

VECTORVI es un **laboratorio de datos abiertos**: no genera información propia. Lee, deduplica, normaliza y agrega datos publicados oficialmente por el Estado colombiano, y los presenta como estadística descriptiva neutral. Esta página documenta —fuente por fuente— de dónde sale cada cifra del observatorio: qué tabla la origina, qué contiene, cuáles son sus campos clave, hasta dónde llega en el tiempo, cuándo se ingirió y qué rarezas hay que tener en cuenta al leerla.

El principio rector es siempre el mismo: **describe, no juzga**. Ningún dato aquí es acusatorio; son agregados estadísticos sobre información que ya es pública. Las coincidencias entre fuentes (por ejemplo, que un mismo NIT aparezca como donante de campaña y como contratista) se reportan como hechos verificables, sin inferir intención.

> **Cómo verificar lo que dice esta página.** Cada cifra proviene de `public/data/*.json` (el *snapshot* versionado en el repositorio) o de la lógica de `data/queries/*.sql` y `data/materialize_public.py`. El repositorio incluye **45 archivos `.sql`** en `data/queries/`, más las consultas embebidas en el materializador para las fuentes complementarias. Las cifras volátiles cambian cada vez que se regenera el *snapshot*; el **método** es estable. Snapshot de referencia: generado el **2026-06-23**, con corte de datos al **2026-06-03**.

---

## Resumen de fuentes

Cinco fuentes alimentan las secciones del dashboard de forma directa; dos más (RUES y Supersociedades) y otras tablas auxiliares (SIGEP, Multas SECOP, relaciones empresariales) se usan solo para **cruces** y señales adicionales. La lista canónica vive en la constante `FUENTES` de `materialize_public.py`.

| Fuente | Entidad responsable | Tabla BigQuery | Qué aporta al dashboard | Cobertura temporal |
|--------|---------------------|----------------|-------------------------|--------------------|
| **SECOP II — Contratos** | Colombia Compra Eficiente (CCE) | `contratos` | Contratos firmados: valor, entidad, contratista, modalidad, objeto, departamento, fechas, ejecución | 2022–2026 (2026 parcial) |
| **SECOP II — Procesos** | Colombia Compra Eficiente | `procesos` | Procesos de selección y su estado (44,1 % adjudicado) | 2022–2026 (2026 parcial) |
| **SECOP II — PAA** | Colombia Compra Eficiente | `paa` | Plan Anual de Adquisiciones: lo que las entidades **planean** comprar ($58,6 B) | **Solo 2024–2026** |
| **BPIN** | DNP (Depto. Nacional de Planeación) | `bpin_ejecucion` | Presupuesto de inversión pública vigente ($424,8 B; 34 % ejecutado) | **Vigencias 2025–2026** |
| **Sanciones SIRI** | Procuraduría General de la Nación | `sanciones` | Sanciones disciplinarias e inhabilidades (13.441 iniciadas en la ventana) | Histórico acumulado |
| **Aportes — Cuentas Claras** | CNE (Consejo Nacional Electoral) | `campanas` | Financiación electoral declarada ($1,34 B) | **Solo ciclos 2022–2023** |
| **RUES** | Confecámaras / Cámaras de Comercio | `rues_empresas` | Registro mercantil: antigüedad y madurez del contratista (cruces) | Hasta 2024–2026 |
| **SIGEP** | Función Pública (DAFP) | `sigep_servidores` | Servidores públicos (cruce "puerta giratoria") | Hasta 2026 |
| **Supersociedades** | Superintendencia de Sociedades | `supersociedades_situacion` | Situación financiera/jurídica de sociedades (cruces) | Hasta 2024–2026 |
| **Multas SECOP** | Colombia Compra Eficiente | `multas_secop` | Multas y sanciones contractuales registradas en SECOP (señal + cruce) | 2010–2026 (acotada) |

### Frescura por fuente

Cada fuente tiene su propio corte temporal y su propia fecha de ingesta. El bloque `FUENTES_DETALLE` de `materialize_public.py` (que el dashboard expone en la sección "Acerca" vía `meta.json → fuentes_detalle`) lo registra explícitamente:

| Fuente | Periodo que cubre | Corte | Última ingesta |
|--------|-------------------|-------|----------------|
| Contratos (SECOP II) | 2022–2026 | firmados hasta jun-2026 | jun-2026 |
| Procesos (SECOP II) | 2022–2026 | hasta jun-2026 | jun-2026 |
| PAA — planeación (SECOP II) | 2024–2026 | planes publicados | may-2026 |
| BPIN — inversión (DNP) | vigencias 2025–2026 | presupuesto vigente | abr-2026 |
| Sanciones (SIRI / Procuraduría) | 2022–2026 | iniciadas 2022–2026; inhabilidades vigentes a la fecha | 2026 |
| Aportes de campaña (CNE) | 2022–2023 | ciclos electorales | abr-2026 |
| RUES / Supersociedades (cruces) | hasta 2024–2026 | registro y finanzas | mar–may 2026 |

---

## SECOP II — el núcleo

El **SECOP II** (Sistema Electrónico de Contratación Pública), operado por **Colombia Compra Eficiente (CCE)**, es el registro oficial de la contratación del Estado colombiano, publicado como datos abiertos. Es la fuente principal del observatorio. Se usan tres conjuntos distintos: **contratos**, **procesos** y **PAA**.

> **SECOP I no se ingesta.** La versión anterior de la plataforma (SECOP I) queda fuera del alcance: sus datos son irregulares y mezclarlos distorsionaría las comparaciones. Por eso `valor_total` **subestima** el gasto público real (ver [Caveats y límites](09-Caveats-Y-Limites.md)).

### Contratos (`contratos`)

El contrato firmado entre una entidad pública y un contratista. Es la columna vertebral del dashboard: alimenta de forma directa o indirecta las secciones Inicio, Quién contrata, Cómo contrata, Dónde, Se ejecuta, Hay señales y Se cruzan los datos.

**Tratamiento previo.** Antes de cualquier agregado, el materializador construye una **tabla base limpia** (`_contratos_pub`) que aplica de una sola vez: la ventana `fecha_firma BETWEEN 2022-01-01 AND 2026-12-31`, el filtro `valor > 0`, la **deduplicación por `id`** (conservando la última versión según `ultima_actualizacion`) y las normalizaciones de modalidad y objeto. La fuente trae **~0,3 % de `id` repetidos** (mismo contrato versionado o reingerido más de una vez); sin la deduplicación, esos contratos se contarían y sumarían dos veces. Detalle en [Materialización](02-Datos-y-Materializacion.md).

**Cifras del snapshot** (`panorama.json` y `senales.json`):

| Indicador | Valor | Origen |
|-----------|-------|--------|
| Contratos (deduplicados) | **3.969.440** | `panorama.json → kpis.contratos` |
| Valor total (firmado) | **$583,8 billones COP** | `panorama.json → kpis.valor_total` |
| Valor mediano por contrato | **$20,06 millones COP** | `panorama.json → kpis.valor_mediano` |
| Entidades contratantes | **4.690** | `panorama.json → kpis.entidades` |
| Contratistas distintos | **954.767** | `panorama.json → kpis.contratistas` |
| Concentración top-10 (por valor) | **7,0 %** | `senales.json → concentracion.top10_pct_valor` |
| Contratación directa (por nº de contratos) | **78,3 %** | `senales.json → pct_directa_nacional` |
| Contratación directa (por valor) | **45,3 %** | `como.json → pct_directa_valor` |

> **Por qué la mediana y no el promedio.** El valor total es sensible a un puñado de contratos de cuantía extrema (que pueden incluir errores de digitación en la fuente). Por eso el observatorio reporta la **mediana** ($20,06 M) y los percentiles, robustos a esos casos, además de la suma. La distribución del valor por contrato (`senales.json → percentiles_valor`) es muy asimétrica: p10 ≈ $5,5 M, p50 ≈ $20,0 M, p90 ≈ $83,7 M y p99 ≈ $1.696 M.

**Columnas clave que se materializan** de la tabla `contratos`:

| Columna(s) | Uso en el dashboard |
|------------|---------------------|
| `valor`, `valor_facturado`, `valor_pagado` | Montos: suma, mediana, percentiles y la sección "Se ejecuta" |
| `fecha_firma` | Define el año del contrato; ancla la ventana 2022–2026 |
| `fecha_prorroga` | Señal de adiciones/prórrogas (señales adicionales) |
| `entidad_nit`, `entidad_nombre` | Entidad contratante (se agrupa por NIT) |
| `entidad_nombre_normalizado` | Cruce "puerta giratoria" con SIGEP |
| `contratista_nit` | Contratista: conteo de únicos, concentración, cruces |
| `modalidad` | Modalidad (se normaliza a 7 categorías; ver abajo) |
| `objeto_clasificado` | Categoría de objeto (se normaliza a etiqueta legible) |
| `orden` | Nivel de gobierno (Nacional, Territorial, Corporación Autónoma…) |
| `entidad_departamento`, `entidad_municipio` | Geografía (se normaliza a código DANE para el mapa) |
| `es_pyme` | Participación PYME (autodeclarada; `STRING`, se compara con `LOWER(...) IN ('si','true')`) |
| `genero_representante_legal` | Género del **representante legal** (no de la propiedad) |
| `recursos_pgn`, `recursos_sgp`, `recursos_regalias`, `recursos_propios` | Fuente del gasto (sección Financiación) |
| `doc_supervisor` | Señal supervisor↔contratista |
| `ultima_actualizacion` | Criterio de deduplicación (conserva la versión más reciente) |

**Normalizaciones aplicadas sobre `contratos`:**

- **Modalidad → 7 categorías.** El campo `modalidad` viene sucio (mayúsculas, tildes, variantes). Se normaliza con `NORMALIZE(...NFD)` + `REGEXP_REPLACE` y un `CASE` a: *Contratación directa, Régimen especial, Mínima cuantía, Selección abreviada, Licitación pública, Concurso de méritos* y *Otras*.
- **Objeto → etiqueta legible.** Se toma el primer segmento de `objeto_clasificado` (antes de la primera coma), sin tildes ni punto final, en mayúsculas, y se mapea a ~33 categorías canónicas (Salud, Construcción, Consultoría, Educación…). Esto colapsa variantes como `CONSULTORÍA`, `CONSULTORÍA.` y `CONSULTORIA, APOYO, GESTION` a una sola clave, evitando que la categoría se fragmente en docenas de etiquetas casi iguales.
- **Departamento → código DANE.** Insensible a tildes, para el mapa coroplético.

> **Entidades por NIT y nombre más frecuente.** Una entidad nacional (ICBF, INVÍAS…) firma bajo **un solo NIT** pero con decenas de nombres regionales. La sección "Quién contrata" agrupa por `entidad_nit` y muestra como nombre el **más frecuente** (`APPROX_TOP_COUNT(entidad_nombre, 1)`), no uno arbitrario, para que aparezca, por ejemplo, "ICBF Sede Nacional" y no "ICBF Regional Caquetá" representando a todo el ICBF.

### Procesos (`procesos`)

Los procesos de selección —la etapa **previa** a la firma del contrato— y su estado. Alimentan la sección "Cómo contrata".

- **450.977 procesos** (deduplicados por `id`, última versión según `fecha_ingesta`; ~0,08 % de `id` repetidos).
- **44,1 % adjudicado** (estado `Seleccionado`, terminal de adjudicación en SECOP II).
- **0,7 % cancelado** (estado `Cancelado`; la fuente no marca "desierto" explícitamente, por lo que `Cancelado` es el proxy más cercano de proceso no adjudicado).

Campos clave: `estado_proceso`, `fecha_publicacion`, `n_ofertas_recibidas`, `id`, `fecha_ingesta`.

> **Rareza crítica: la competencia real no se puede medir.** La columna `n_ofertas_recibidas` está **prácticamente sin poblar** en la fuente (>99,99 % en cero). Por eso el observatorio **no publica** cuántos oferentes se presentaron a cada proceso: el promedio describiría apenas unas decenas de procesos y no sería representativo del universo.

### PAA — Plan Anual de Adquisiciones (`paa`)

Lo que cada entidad **planea** comprar durante el año, antes de contratar. Alimenta la sección "Qué se planea".

- **155.353 ítems** planeados (deduplicados).
- **$58,6 billones** de valor total esperado.
- **644 entidades** con PAA publicado.
- Cobertura: **solo 2024–2026** (los años 2022–2023 no tienen PAA en la fuente).

Campos clave: `id`, `paa_encabezado_id`, `version_paa`, `entidad_nit`, `anio`, `valor_total_esperado`, `origen_recursos`, `procesos_relacionados`, `fecha_ingesta`.

> **Rareza crítica: deduplicación en dos pasos.** El PAA se publica **por versiones**: cada `paa_encabezado_id` (= una entidad en un año) acumula varias `version_paa`, y las versiones viejas **no se borran** de la fuente. El materializador (1) conserva una fila por `id` según `fecha_ingesta` y (2) conserva solo la **última versión** por encabezado. Sin esto, el "planeado" se infla ~30 %: solo con `id` quedaban 222.854 ítems / $92,1 B; con última-versión quedan los **155.353 ítems / $58,6 B** que reporta el observatorio. La misma lógica se reutiliza en `paa_origen`, `fidelidad_paa` y la señal `contratos_no_planeados` para mantener la coherencia.

La **fidelidad del PAA** (`kpis_extra.json → fidelidad_paa`) mide qué porcentaje de ítems planeados ya tiene un proceso enlazado (`procesos_relacionados` no vacío): 49,6 % en 2024, 30,1 % en 2025 y 20,7 % en 2026 (los años recientes tienen menos enlazado por ser más nuevos). La **modalidad "No especificada"** —antes etiquetada como "Otras"— concentra el mayor valor planeado por modalidad ($22,9 B), reflejando ítems sin modalidad declarada en el plan.

---

## BPIN — inversión pública (`bpin_ejecucion`)

El **BPIN** (Banco de Programas y Proyectos de Inversión Nacional), del **Departamento Nacional de Planeación (DNP)**, registra los proyectos de inversión pública y su ejecución presupuestal. Alimenta la sección "En qué se invierte".

- **104.695 proyectos** (vigencias 2025–2026).
- **$424,8 billones** de presupuesto vigente.
- **34 % ejecutado** (`pct_ejecucion` ≈ 0,340).

Campos clave: `id`, `vigencia`, `valor_vigente`, `valor_comprometido`, `valor_obligado`, `valor_pagado`, `sector`, `fuente`, `fecha_ingesta`.

> **Es presupuesto vigente, no serie histórica.** La tabla solo trae vigencias `>= 2025` (las vigencias 2027+ tienen `valor_vigente ≈ 0`). Es una **foto del presupuesto vigente 2025–2026**, no una línea histórica de inversión. El materializador acota explícitamente a `vigencia BETWEEN 2025 AND 2026` y deduplica por `id` (última versión por `fecha_ingesta`).

La **cadena de ejecución BPIN** (`kpis_extra.json → bpin_cadena`) muestra los cuatro estados del presupuesto —**vigente → comprometido → obligado → pagado**— por vigencia, exponiendo cuánto del presupuesto recorre cada etapa (por ejemplo, en 2025: $204,5 B vigente, $156,7 B comprometido, $122,4 B pagado).

---

## Sanciones SIRI — Procuraduría (`sanciones`)

El **SIRI** (Sistema de Información de Registro de Sanciones e Inhabilidades), de la **Procuraduría General de la Nación**, registra sanciones disciplinarias e inhabilidades. Aporta a la sección "Hay señales" y habilita el cruce sancionado↔contratista descrito en [Los cruces](08-Los-Cruces.md).

- **13.441 sanciones iniciadas** en la ventana 2022–2026 (`sanciones.json → kpis.total`).
- **24.939 inhabilidades vigentes** con periodo > 0 meses (sin ventana de fecha: una inhabilidad larga impuesta antes de 2022 sigue activa hoy y debe contarse).
- **Inhabilidad mediana: 120 meses** (promedio 132,3 meses). Se reporta la mediana por la fuerte asimetría: muchas inhabilidades cortas, pocas de 20 años.
- Por tipo: 13.418 disciplinarias, 23 contractuales. La tabla no tiene `id` repetidos, por lo que **no se deduplica**.

Campos clave: `sancionado_nit`, `fecha_inicio`, `estado`, `inhabilidad_meses`, `departamento`, `tipo`.

> **Cobertura temporal mixta.** Para la **serie** se cuentan las sanciones *iniciadas* en 2022–2026; para las **inhabilidades vigentes** se ignora la ventana de fecha, porque lo relevante es cuántas personas están inhabilitadas hoy. El cruce sancionado↔contratista cubre **1.560 NITs** con **$6,8 B** contratados (`cruces.json → sancionado`).

---

## Aportes de campaña — Cuentas Claras (`campanas`)

La plataforma **Cuentas Claras** del **Consejo Nacional Electoral (CNE)** publica los aportes declarados a campañas electorales. Aporta a la sección "Hay señales" y habilita el cruce donante↔contratista descrito en [Los cruces](08-Los-Cruces.md).

- **$1,34 billones** de financiación electoral declarada (`electoral.json → kpis.monto_total`).
- **350.566 aportes** de **115.036 candidatos** distintos.
- Cobertura: **solo ciclos electorales 2022–2023** (filtrado por `anio_eleccion BETWEEN 2022 AND 2026`, pero la fuente solo trae 2022 y 2023).

Campos clave: `nit_aportante`, `monto_aportado`, `anio_eleccion`, `identificacion_candidato`, `candidato`, `partido`, `departamento`.

> **Partidos normalizados.** Los nombres de partido se consolidan para que una misma colectividad no aparezca fragmentada en varias grafías. El conteo de candidatos usa `identificacion_candidato` (estable) con respaldo al nombre cuando la identificación viene vacía, para no inflar el conteo por variaciones de grafía. El cruce donante↔contratista cubre **27.488 NITs** con **$28,6 B** contratados (`cruces.json → donante`).

> **Tono sensible.** Esta fuente es transparencia factual de financiación política. En la sección agregada solo se muestran totales; el cruce aportante→contratista se presenta como coincidencia de NIT, **nunca** como inferencia de intención.

---

## RUES — registro mercantil (`rues_empresas`)

El **RUES** (Registro Único Empresarial y Social), administrado por **Confecámaras** y las Cámaras de Comercio, contiene el registro mercantil de las empresas colombianas. En el observatorio público se usa **solo para cruces**: estimar la **antigüedad del contratista** al momento de firmar.

- **Antigüedad mediana al firmar: 6,3 años** (`kpis_extra.json → antiguedad`).
- **Cobertura ~41,5 %** de los contratos: solo empresas con matrícula RUES cruzable por NIT exacto.
- Distribución por tramos: <1 año 9,2 %, 1–3 años 17,4 %, 3–5 años 15,3 %, 5–10 años 24,9 %, 10+ años 33,2 %.

Campos clave: `nit`, `fecha_matricula`.

> **Rarezas.** El `nit` en RUES es `INT64` y requiere `CAST` para cruzar con `contratista_nit` (`STRING`) de contratos. La `fecha_matricula` se parsea con `SAFE.PARSE_DATE` y se deduplica por NIT (primera matrícula). La cobertura es **parcial**: las personas naturales y las empresas sin matrícula cruzable no aparecen.

---

## SIGEP — servidores públicos (`sigep_servidores`)

El **SIGEP** (Sistema de Información y Gestión del Empleo Público), de la **Función Pública (DAFP)**, registra a los servidores públicos. En el observatorio público se usa **solo** para la señal "puerta giratoria": detectar personas que figuran como servidor de una entidad y, a la vez, como contratista de **esa misma** entidad.

- Señal `puerta_giratoria`: **2.628 personas**, $186,7 mil millones (`senales_extra.json`).

Campos clave: `numero_documento`, `entidad_normalizada`.

> **Cruce conservador.** El cruce exige coincidencia tanto de documento (`numero_documento` ↔ `contratista_nit`) como de entidad (`entidad_normalizada` ↔ `entidad_nombre_normalizado`). Es una coincidencia factual que merece verificación caso por caso; **no** implica irregularidad.

---

## Supersociedades — situación de sociedades (`supersociedades_situacion`)

La **Superintendencia de Sociedades** publica la situación financiera y jurídica de las sociedades sometidas a su vigilancia (procesos de reorganización, liquidación, situaciones de control). En el observatorio público se reserva como fuente de **cruces** (registro y finanzas de sociedades), junto con RUES, dentro del bloque "RUES / Supersociedades (cruces)" de `FUENTES_DETALLE`. Su ingesta es de **mar–may 2026**.

---

## Multas SECOP — sanciones contractuales (`multas_secop`)

Registro de **multas y sanciones contractuales** publicadas en SECOP por **Colombia Compra Eficiente**. Alimenta un panorama factual y un cruce por NIT con los contratistas (`kpis_extra.json → multas`).

- **1.866 multas** registradas, por **$1,06 billones**, sobre **1.233 NITs** sancionados.
- Cobertura acotada a **2010–2026** por código (la fuente trae fechas basura con años 2027/2028 que se descartan).
- **Cruce con contratistas: 270 NITs** coinciden, con **$12,3 B** contratados.

Campos clave: `nit_sancionado`, `valor_multa`, `fecha_sancion`.

> **Limpieza de fechas.** El panorama anual se acota a `EXTRACT(YEAR FROM fecha_sancion) BETWEEN 2010 AND 2026` (la serie por año, a 2015–2026) para evitar registros con fechas imposibles. Es un registro **factual**; el cruce describe coincidencias de NIT, sin juzgar.

---

## La ventana 2022–2026

Todas las cifras del observatorio se enmarcan en **2022–2026**, una ventana elegida por equilibrio entre **cobertura** y **vigencia**:

- Antes de 2022 la cobertura de SECOP II es irregular, y **SECOP I no se ingesta**, por lo que mezclar periodos distorsionaría las comparaciones.
- 2022–2026 ofrece cinco años para detectar tendencias sin arrastrar datos heterogéneos de épocas con reglas y plataformas distintas.

Salvedades dentro de la ventana:

- **2026 es parcial:** se va completando a medida que se publican más contratos del año en curso. El corte del snapshot de referencia es **2026-06-03**.
- **El primer semestre de 2022** tiene cobertura más baja en SECOP frente al resto de la serie; las cifras de ese periodo deben leerse con esa salvedad.

No interpretes las "caídas" en los extremos de la línea de tiempo (2022-H1 y 2026) como una baja real de la actividad: son artefactos de cobertura.

---

## Caveats — qué NO miden estos datos

Estas advertencias son esenciales para leer el dashboard sin sobre-interpretarlo (detalle completo en [Caveats y límites](09-Caveats-Y-Limites.md)):

| Caveat | Implicación |
|--------|-------------|
| `valor_total` **subestima** el gasto | No incluye SECOP I ni las adiciones a contratos: el gasto real es mayor que el mostrado. |
| **~5 % de contratos sin departamento mapeable** | El mapa de "¿Dónde?" no cubre el 100 % del valor; ese ~5 % queda sin asignar. |
| **2026 parcial** y **2022-H1 baja cobertura** | Los extremos de la serie no son comparables uno a uno con los años completos. |
| **Procesos no trae nº de oferentes** | `n_ofertas_recibidas` está vacía (>99,99 % en cero); no se puede medir la competencia real. |
| **Ejecución desde la propia tabla** | El facturado/pagado se calcula desde columnas de `contratos`, no de una tabla de facturas independiente. |
| **PAA solo 2024–2026** | La planeación no cubre toda la ventana; 2022–2023 no tienen PAA. |
| **BPIN es presupuesto vigente 2025–2026** | No es serie histórica de inversión; es una foto del presupuesto actual. |
| **Electoral solo ciclos 2022–2023** | Los aportes cubren esos ciclos, no toda la ventana. |
| **RUES/SIGEP cobertura parcial** | Los cruces de antigüedad (~41,5 %) y puerta giratoria solo cubren los NITs/documentos cruzables. |
| **Outliers de valor extremos** | Posibles errores de la fuente: por eso se muestra la **mediana** ($20,06 M) y no el promedio. |

En general, los datos son **tan buenos como la fuente**: si una entidad reporta tarde o con errores, eso se refleja en el dashboard. El observatorio muestra **agregados**, no contratos individuales, y **no infiere irregularidades**.

---

## Cómo se procesan estas fuentes

El pipeline (`data/queries/*.sql` + `data/materialize_public.py`) lee BigQuery, construye la tabla base limpia `_contratos_pub` (ventana + `valor > 0` + deduplicación por `id` + normalizaciones), ejecuta los 45 agregados `.sql` más las consultas embebidas de las fuentes complementarias, y escribe **16 archivos JSON** pre-materializados en `public/data/`. El sitio estático solo lee esos JSON; **nunca** toca BigQuery.

Antes de publicar, `data/verify_snapshot.py` **reconcilia** cada cifra contra BigQuery con consultas independientes (re-deriva los números desde la tabla cruda, con formulaciones distintas) y aplica **guards estructurales permanentes**, entre ellos el **anti-fragmentación** (ningún array de una sola categoría puede tener etiquetas duplicadas —el síntoma que motivó normalizar partidos y objetos—) y una **guardia de sentido** que verifica que ningún valor de señal supere el universo total contratado (detecta fan-out de JOINs). En *runtime*, el frontend valida además los JSON con **esquemas Zod** (`src/lib/schemas.ts`) antes de renderizar. El detalle del tratamiento está en [Materialización](02-Datos-y-Materializacion.md) y [Auditoría de datos](06-Auditoria-De-Datos.md).

---

Para entender cómo se transforman estas fuentes en cifras y por qué el observatorio describe sin juzgar, ver [Metodología](03-Metodologia.md) y [Cómo se calcula todo](13-Como-Se-Calcula-Todo.md). Para los cruces entre fuentes, ver [Los cruces](08-Los-Cruces.md).
