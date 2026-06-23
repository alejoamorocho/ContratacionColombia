# Cómo se calcula todo

Esta es la **referencia completa de cálculos** del observatorio: el *diccionario de datos*. Para **cada** indicador del dashboard —KPIs de portada, las 10 secciones-pregunta, los 6 análisis ("datos valiosos"), las 11 señales y los KPIs analíticos avanzados— documenta **qué mide**, **la fórmula exacta**, **de qué tabla y columnas sale**, **el umbral** (si lo hay) y **su salvedad**. Si una cifra aparece en el sitio, aquí está explicada y aquí dice cómo reproducirla.

Es la página más técnica de la wiki. Si solo quieres el panorama, lee primero [Las secciones](07-Las-Secciones.md) y [Metodología](03-Metodologia.md). Si quieres reproducir o auditar un número, esta es tu página: cada cálculo remite al archivo `.sql` de [`data/queries/`](../data/queries) o a la función de [`data/materialize_public.py`](../data/materialize_public.py) donde vive.

> **Una promesa de transparencia.** Todo lo que sigue es código abierto. No hay fórmulas secretas, ni pesos ocultos, ni "scores" propietarios. Cada número del dashboard se obtiene de una consulta SQL que puedes leer, correr y cambiar en un [fork](04-Hacer-Un-Fork.md).

> **Sobre las cifras de esta página.** Documentamos el **método** (estable) y, cuando ayuda, citamos cifras del **snapshot actual** (`public/data/*.json`, corte de datos: contratos firmados hasta el 3 de junio de 2026). Los números volátiles cambian en cada regeneración; el método no. Cualquier cifra citada aquí es reproducible: abre el JSON correspondiente y la verás.

---

## 1. Principios de cálculo (transversales)

Antes de los indicadores, las reglas que rigen **todos** los cálculos. Si entiendes esta sección, entiendes el 80 % de la metodología.

### 1.1 La tabla base limpia (`_contratos_pub`)

Casi todos los agregados de contratos **no** leen la tabla cruda `contratos`, sino una **tabla base limpia** que el materializador construye una vez por snapshot. Se define en `_ensure_base()` y aplica, de golpe, las cuatro reglas que hacen comparables todas las cifras:

```sql
CREATE OR REPLACE TABLE _contratos_pub AS
SELECT <columnas base>,
       <modalidad_norm>,    -- modalidad normalizada a 7 categorías
       <objeto_label>       -- código de objeto → etiqueta legible con tildes
FROM contratos
WHERE fecha_firma BETWEEN '2022-01-01' AND '2026-12-31'
  AND valor IS NOT NULL AND valor > 0
QUALIFY ROW_NUMBER() OVER (
  PARTITION BY id ORDER BY ultima_actualizacion DESC
) = 1;
```

| Regla | Qué hace | Por qué |
|---|---|---|
| **Ventana 2022–2026** | `fecha_firma BETWEEN '2022-01-01' AND '2026-12-31'` | Los 5 años de mejor cobertura de SECOP II. |
| **`valor > 0`** | Descarta contratos sin valor o con valor nulo/cero | Un contrato sin valor no aporta a sumas, medianas ni percentiles. |
| **Deduplicación por `id`** | `QUALIFY ROW_NUMBER() … = 1`, conserva la **última versión** por `ultima_actualizacion` | SECOP reingiere ~0,3 % de `id` repetidos (mismo contrato versionado). Sin esto, se contarían y sumarían dos veces. |
| **Normalización centralizada** | Calcula `modalidad_norm` y `objeto_label` una sola vez | DRY: ninguna consulta repite el `CASE`; todas leen la columna ya limpia. |

Las **columnas materializadas** en la base (constante `_BASE_COLS`) son exactamente: `id`, `valor`, `valor_facturado`, `valor_pagado`, `fecha_firma`, `entidad_nit`, `entidad_nombre`, `contratista_nit`, `modalidad`, `objeto_clasificado`, `orden`, `entidad_departamento`, `es_pyme`, `recursos_pgn`, `recursos_sgp`, `recursos_regalias`, `recursos_propios` — más las dos derivadas `modalidad_norm` y `objeto_label`.

Las consultas en `data/queries/*.sql` escriben ``` `{p}.{d}.contratos` ```; el materializador (`_sql()`) **redirige** esa referencia exacta a `_contratos_pub`. Así, cada consulta hereda automáticamente la ventana, el `valor>0`, la dedup y las columnas normalizadas, sin repetir una línea.

> **Excepción deliberada.** Unas pocas consultas necesitan columnas que la base no materializa (p. ej. `fecha_inicio`/`fecha_fin` para duración, `genero_representante_legal` para género, `fecha_prorroga` o `entidad_municipio` para señales). Esas leen la tabla **cruda** usando una forma de backtick distinta (``` `{p}`.`{d}`.contratos ```) que **evita** el redirect. Se documenta caso por caso abajo. En esas, la dedup no es crítica porque calculan cuantiles o porcentajes, no conteos exactos.

### 1.2 Las tres normalizaciones canónicas

**Modalidad → 7 categorías (`modalidad_norm`).** El texto crudo de la modalidad trae decenas de variantes ("Contratación Directa", "CONTRATACION DIRECTA (...)", etc.). Se normaliza quitando tildes y mayúsculas (`NORMALIZE … NFD`) y se mapea a 7 categorías canónicas:

`Contratación directa` · `Régimen especial` · `Mínima cuantía` · `Selección abreviada` (incluye menor cuantía y subasta) · `Licitación pública` · `Concurso de méritos` · `Otras`.

**Código de objeto → etiqueta legible (`objeto_label`).** El campo `objeto_clasificado` viene sucio: MAYÚSCULAS_CON_GUION (`CONSTRUCCION`), pero también con tildes (`CONSULTORÍA`), punto final (`SALUD.`) y formas compuestas (`CONSULTORIA, APOYO, GESTION`). Para no fragmentar una misma categoría en decenas de variantes, se normaliza una **clave canónica** (`_OBJ_KEY`): se toma el **primer segmento** (antes de la primera coma), se pasa a mayúsculas, se quitan **tildes y punto final** (`NORMALIZE … NFD` + `r'[\pM.]'`), y sobre esa clave limpia se mapea a una de **~33 categorías temáticas** en español con tildes (`Construcción`, `Consultoría`, `Minas y energía`, …). El valor se reparte en tres cubos: la mayor parte en una categoría temática canónica, una fracción en `Sin clasificar` (los nulos de `objeto_clasificado`), y una **cola pequeña** de claves sin mapa explícito que cae a `INITCAP(REPLACE(clave, '_', ' '))`. Un guardia de verificación mide cuánto valor queda en esa cola no canónica y exige que sea bajo.

> **`objeto_clasificado` es una clasificación DERIVADA**, no un campo nativo de SECOP II: una etiqueta temática inferida aguas arriba. Por eso `Sin clasificar` no es un "sector" sino **ausencia de clasificación**, y su tamaño depende de la cobertura del clasificador, no de la realidad del mercado. Se **excluye de los rankings de sector** (Panorama, ¿Quién contrata?, ¿En qué creció?, HHI, tamaño típico por objeto) para que no compita como si fuera una categoría real. Todas esas vistas usan la misma columna, así que muestran etiquetas idénticas.

**Departamento → código DANE (mapa).** En `donde_departamento.sql`, el nombre del departamento se normaliza sin tildes ni mayúsculas (`REGEXP_REPLACE(NORMALIZE(LOWER(TRIM(x)), NFD), r'\pM', '')`) y se cruza con un diccionario a código DANE de 2 dígitos. Esto recuperó a Bogotá ("Distrito Capital de Bogotá"), que antes se perdía por la tilde. Ver [Auditoría de datos](06-Auditoria-De-Datos.md).

> **Una cuarta normalización, en `electoral_partido.sql`.** El campo `partido` llega con la misma colectividad en varias grafías, tildes inconsistentes y hasta caracteres corruptos (mojibake `U+FFFD`). Se construye una **clave normalizada** (mayúsculas, sin acentos vía `NORMALIZE NFD`, sin bytes no-ASCII, espacios colapsados, sin prefijo `COALICION ` ni sufijo de lista `- SENADO/CAMARA…`) y se agrega por esa clave; la **etiqueta mostrada** es la variante cruda más frecuente que NO contenga el carácter corrupto, elegida de forma determinística. Así un mismo partido no se fragmenta en varias barras del gráfico. Ver §2.9.

### 1.3 Identidad de entidad: el nombre más frecuente por NIT

Una entidad nacional (ICBF, INVÍAS, SENA…) firma bajo **un solo NIT** pero con decenas de nombres regionales ("ICBF Regional Caquetá", "ICBF Sede Nacional", …). Al agrupar **por NIT** consolidamos toda la entidad en una sola fila; pero el nombre que mostramos no puede ser arbitrario. En `quien_entidades.sql` se usa `APPROX_TOP_COUNT(entidad_nombre, 1)[OFFSET(0)].value` para mostrar el **nombre más frecuente** de ese NIT, de modo que el ICBF no aparezca representado por su regional más pequeña. La consolidación es por `entidad_nit`; el nombre es solo la etiqueta legible.

### 1.4 Suma vs. mediana vs. percentiles

- **Suma (`SUM(valor)`)** — el agregado natural, pero **sensible a outliers**: unos pocos contratos de cuantía extrema (que pueden incluir errores de digitación en la fuente) inflan el total. Por eso el total es una **cota inferior con ruido al alza**, no una cifra exacta del gasto.
- **Mediana (`APPROX_QUANTILES(valor, 100)[OFFSET(50)]`)** — el contrato "típico". Robusta a outliers: da igual que un contrato valga $5 billones, la mediana no se mueve. Por eso el dashboard **siempre** muestra mediana junto a la suma.
- **Percentiles (p10…p99)** — describen la **forma** de la distribución. Un p90 alto solo dice que 1 de cada 10 contratos supera ese valor; no implica nada más. Para "tamaño típico" se publican el trío `p25 / mediana / p75` por dimensión (ver §5).

`APPROX_QUANTILES` es el cuantil aproximado de BigQuery (error < 1 % a esta escala), elegido por rendimiento sobre cientos de millones de filas. Cuando un grupo es pequeño, los cuantiles son inestables: por eso varios indicadores exigen un **N mínimo** por grupo (`N ≥ 20` para tamaño típico, `≥ 50` proveedores para el HHI).

### 1.5 Qué NO se calcula

No hay **score ponderado**, ni **ranking de riesgo**, ni **semáforo**, ni **modelo** que "prediga" corrupción. El observatorio cuenta y describe; no juzga ni infiere intención. Ver [Metodología](03-Metodologia.md). Las señales (§4) son **conteos de coincidencias factuales**, nunca acusaciones.

### 1.6 Validación en runtime y guardias de coherencia

Dos capas blindan los números antes de que lleguen al usuario:

- **Validación Zod en el frontend.** Al cargar cada JSON, el dashboard lo valida contra un esquema en runtime: si un campo falta o tiene el tipo equivocado, la app lo detecta en vez de pintar basura silenciosamente.
- **`verify_snapshot.py` — reconciliación independiente.** No reutiliza las consultas del materializador: **re-deriva** cada número con una formulación distinta (o desde la tabla cruda) y lo compara con `public/data/*.json`. Además corre chequeos de coherencia interna sin tocar BigQuery: percentiles monótonos crecientes, `Σ por_anio.contratos == total`, `pagado ≤ contratado`, todos los campos `*pct` en `[0,100]` (excepto `var_pct`, que es una variación), y **guardias anti-fragmentación**: ningún array de una sola categoría puede tener etiquetas repetidas (el síntoma del caso "partidos" sin normalizar). Una **guardia de sentido** exige que ningún valor de señal supere el universo total contratado del país (detecta el fan-out de los JOINs). Si algo no reconcilia, el script termina con código de error.

---

## 2. Las secciones base

Las 10 secciones-pregunta del dashboard. Cada una indica su **fuente**, las **consultas** que la alimentan y la **fórmula** de cada KPI. Cifras de portada del snapshot actual: **3.969.440 contratos**, **$583,8 billones** de valor total, **4.690 entidades** y **954.767 contratistas** (`panorama.json`).

### 2.1 Panorama (Inicio)

**Fuente:** `_contratos_pub`. **Consulta:** `panorama_kpis.sql`, `panorama_anio.sql`, `panorama_sectores.sql`. **Función de forma:** `shape_panorama()`.

| KPI | Fórmula |
|---|---|
| Contratos | `COUNT(*)` |
| Valor total | `SUM(valor)` |
| Valor mediano | `APPROX_QUANTILES(valor, 100)[OFFSET(50)]` |
| Entidades | `COUNT(DISTINCT entidad_nit)` |
| Contratistas | `COUNT(DISTINCT contratista_nit)` |

`por_anio` agrupa contratos y valor por `EXTRACT(YEAR FROM fecha_firma)`; `top_sectores`, por `objeto_label`. **Caveat:** el total subestima el gasto real (sin SECOP I ni adiciones) y 2026 es parcial.

### 2.2 ¿Quién contrata?

**Fuente:** `_contratos_pub` / cruda según consulta. **Consulta:** `quien_entidades.sql`, `quien_nivel.sql`, `quien_sector.sql`. **Función:** `shape_quien()`.

- **Top entidades:** `SUM(valor)`, `COUNT(*)` agrupado por `entidad_nit`, ordenado por valor, top 15. El **nombre** mostrado es `APPROX_TOP_COUNT(entidad_nombre, 1)` (el más frecuente por NIT — ver §1.3), no uno arbitrario.
- **Por nivel** (`orden`): nacional / territorial, suma y conteo.
- **Por sector** (`objeto_label`): `SUM(valor)`, `COUNT(*)`, con `HAVING contratos >= 20`, top 12 por valor.

**Caveat:** se cuenta por `contratista_nit`/`entidad_nit`; un NIT mal reportado en la fuente puede fragmentar o inflar conteos.

### 2.3 ¿Cómo contrata?

**Fuente:** `_contratos_pub` (modalidad) + tabla `procesos`. **Consulta:** `como_modalidad.sql`, `como_modalidad_anio.sql`, `procesos_kpis.sql`, `procesos_modalidad.sql`. **Función:** `shape_como()`, `shape_procesos()`.

- **Por modalidad:** `COUNT(*)`, `SUM(valor)` y `pct = COUNT(*) / SUM(COUNT(*)) OVER ()` agrupado por `modalidad_norm`.
- **`pct_directa`** (derivado en `shape_como` sumando el `pct` de las modalidades "directa"): cuota de la contratación directa **por NÚMERO de contratos** (~78,3 % en el snapshot). **`pct_directa_valor`**: la misma cuota **por VALOR** (~45,3 %). Son muy distintas porque la directa son contratos numerosos pero de baja cuantía; el dashboard muestra **ambas** y nunca dice "de cada peso… %" usando la cuota por conteo. `pct_competitiva = round(100 − pct_directa, 1)` (~21,7 %). La sección ¿Hay señales? usa exactamente la misma definición (`modalidad_norm`), no un método aparte.
- **Procesos:** `pct_adjudicado` = % de procesos en estado *Seleccionado*; `pct_cancelado` = % en estado *Cancelado* (el campo interno se llama `pct_desierto`).

**Caveat:** la tabla `procesos` **no trae número de oferentes** (~0 % poblado), así que la competencia efectiva no se puede medir; por eso se omite.

### 2.4 ¿Qué se planea? (PAA)

**Fuente:** tabla `paa` (Plan Anual de Adquisiciones, SECOP II). **Consulta:** `planeacion_*.sql`. **Función:** `shape_planeacion()`. **Solo 2024–2026.**

`items` = `COUNT(*)`; `valor_planeado` = `SUM(valor_total_esperado)`; `entidades` = `COUNT(DISTINCT entidad_nit)`. Desgloses por año, categoría y modalidad.

> **Dedup del PAA (importante).** El PAA se versiona: cada plan tiene `paa_encabezado_id` y `version_paa`. Sumar todas las versiones infla el "planeado" ~30 %. Las consultas que tocan PAA toman **la última versión por encabezado** (`MAX(version_paa)` tras deduplicar por `id` con `ROW_NUMBER() … ORDER BY fecha_ingesta DESC`). Esta misma lógica se usa en `contratos_no_planeados`, `paa_origen` y `fidelidad_paa` para que todas las cifras del PAA sean coherentes entre sí.

**Caveat:** el PAA es **intención**, no ejecución; y solo cubre 2024–2026.

### 2.5 ¿En qué se invierte? (BPIN)

**Fuente:** tabla `bpin_ejecucion` (DNP). **Consulta:** `inversion_*.sql`. **Función:** `shape_inversion()`. **Vigencias 2025–2026.**

`valor_vigente`, `valor_pagado` (sumas), `pct_ejecucion = pagado / vigente`. La cadena de ejecución completa (vigente → comprometido → obligado → pagado) vive en el KPI avanzado `bpin_cadena` (§5.1). **Caveat:** es **presupuesto vigente**, en universo y unidades distintas a los contratos de SECOP II — no son directamente comparables.

### 2.6 ¿Se ejecuta?

**Fuente:** `_contratos_pub` (columnas `valor_facturado`, `valor_pagado`). **Consulta:** `ejecucion_kpis.sql`, `ejecucion_anio.sql`. **Función:** `shape_ejecucion()`.

| KPI | Fórmula | Snapshot |
|---|---|---|
| Contratado | `SUM(valor)` | — |
| Facturado | `SUM(valor_facturado)` | — |
| Pagado | `SUM(valor_pagado)` | — |
| % facturado | `SUM(valor_facturado) / NULLIF(SUM(valor), 0)` | ~32,7 % |
| % pagado | `SUM(valor_pagado) / NULLIF(SUM(valor), 0)` | ~26,5 % |

Se publica además `cobertura_factura` / `cobertura_pago` = % de contratos con el campo **no nulo** (~91,7 % / ~90,6 %), que separa "cobertura del dato" de "nivel de ejecución". **Caveat:** la tabla `facturas` está vacía; la ejecución se aproxima desde las columnas del propio contrato. La cobertura del dato es alta, así que el `% pagado` bajo **no** es subreporte masivo sino una mezcla de no-ejecución real, baja cuantía y contratos recientes que aún no completan su ciclo de pago. El `% pagado` es un ratio ponderado por valor; el indicador `pago_tramos` (§5.4) muestra la heterogeneidad que ese promedio oculta.

### 2.7 ¿Dónde?

**Fuente:** `_contratos_pub`. **Consulta:** `donde_departamento.sql`. **Función:** `shape_donde()`. Suma y conteo por departamento, normalizado a código DANE. **Caveat:** ~5 % de contratos sin departamento mapeable quedan fuera del mapa; el valor refleja la **ubicación de la entidad**, no dónde se ejecuta. La vista per cápita (§5.6) usa esta misma consulta con un catálogo de población.

### 2.8 Sanciones (SIRI)

**Fuente:** tabla `sanciones` (Procuraduría). **Consulta:** `sanciones_*.sql`. **Función:** `shape_sanciones()`. Registro **agregado y sin nombres**.

| KPI | Fórmula | Salvedad |
|---|---|---|
| `total` | `COUNT(*)` con `fecha_inicio` en 2022–2026 | sanciones **iniciadas** en la ventana (para la serie temporal) |
| `inhabilidad_vigente` | `COUNTIF(UPPER(estado)='VIGENTE' AND inhabilidad_meses > 0)`, **sin filtro de fecha** | inhabilidades **activas a la fecha**, de cualquier año: una inhabilidad de 10 años impuesta en 2018 sigue vigente hoy, por eso NO se filtra por `fecha_inicio` |
| `inhabilidad_mediana_meses` | `APPROX_QUANTILES(IF(inhabilidad_meses>0, …))[OFFSET(50)]` | **mediana**, robusta a la fuerte asimetría (muchas cortas, pocas de 20 años) |
| `inhabilidad_promedio_meses` | `AVG(CASE WHEN inhabilidad_meses>0 …)` | se reporta junto a la mediana, por la regla mediana-sobre-media del proyecto |

> Que `inhabilidad_vigente` supere a `total` no es un error: cuentan universos distintos. `total` son sanciones *iniciadas en 2022–2026*; `inhabilidad_vigente` son inhabilidades *activas hoy de cualquier año*, que incluye muchas anteriores a 2022.

El campo "por_gravedad" es en realidad la **calidad del sancionado** (servidor público, fuerza pública…), no la gravedad de la falta — así se rotula en la UI. La tabla no tiene `id` repetidos, no se deduplica. **Caveat:** una sanción tiene tipo, alcance y vigencia que solo la fuente primaria precisa.

### 2.9 Electoral (Cuentas Claras, CNE)

**Fuente:** tabla `campanas` (CNE). **Consulta:** `electoral_*.sql`. **Función:** `shape_electoral()`. Aportes, monto total, candidatos, desglose por año/partido/departamento. El **top de partidos** aplica la normalización de clave descrita en §1.2 (cuarta normalización) para no fragmentar la misma colectividad. **Caveat:** solo ciclos **2022–2023**; agregado, sin cruzar con contratos (eso vive en señales).

### 2.10 Concentración y percentiles (Señales base)

**Fuente:** `_contratos_pub`. **Consulta:** `senales_concentracion.sql`, `senales_percentiles.sql`. **Función:** `shape_senales()`.

- **Top-10 % del valor:** se suma el valor por `contratista_nit`, se ordena con `ROW_NUMBER() … DESC`, y `top10_pct_valor = Σ(valor de rn≤10) / Σ(valor total)` (~7,0 % en el snapshot, con 954.767 contratistas).
- **% directa nacional:** `COUNTIF(UPPER(modalidad) LIKE '%DIRECTA%') / COUNT(*)` (~78,3 %).
- **Percentiles del valor:** `APPROX_QUANTILES(valor, 100)`, extrayendo p10, p25, p50, p75, p90, p99.

**Caveat:** la concentración del top-10 es **estadística descriptiva**; no implica irregularidad. Una concentración baja es esperable en un mercado con casi un millón de contratistas.

---

## 3. Los 6 análisis ("datos valiosos")

Secciones analíticas accesibles en `/analisis/:key`. Config (textos, KPIs, gráficos) en [`src/lib/analisis.ts`](../src/lib/analisis.ts); datos en `public/data/analisis.json`, ensamblados por `_build_analisis()`. Cada una: pregunta, fórmula exacta, fuente y caveat.

### 3.1 Género de quien firma · `genero`

**Pregunta:** ¿quién firma —mujeres u hombres— y reciben lo mismo? **Fuente:** tabla **cruda** `contratos`, columna `genero_representante_legal` (no `contratista_genero`, que está vacía). Cobertura ~98 %. **Consulta:** `genero_kpis.sql`, `genero_anio.sql`. **Función:** `shape_genero()`.

Se clasifica el género (`F/MUJER/FEMENINO` → Mujer; `M/HOMBRE/MASCULINO` → Hombre; resto → Otro/Sin dato) y los **porcentajes se calculan sobre la base Mujer+Hombre** (se excluyen Otro/Sin dato):

| KPI | Fórmula |
|---|---|
| % contratos mujer | `COUNTIF(genero='Mujer') / COUNT(*)` sobre base M+H |
| % valor mujer | `SUM(IF(Mujer, valor, 0)) / SUM(valor)` sobre base M+H |
| Mediana valor mujer | `APPROX_QUANTILES(IF(Mujer, valor, NULL), 100)[OFFSET(50)]` |
| Mediana valor hombre | igual, para Hombre |

**Hallazgo:** las mujeres firman ~53 % de los contratos pero reciben ~41 % del valor. **Caveat:** es el género del **representante legal**, no de la propiedad de la empresa. La mediana evita el sesgo de cuantías extremas.

### 3.2 PYMEs · `pyme`

**Pregunta:** ¿cuánta contratación llega a pequeñas y medianas empresas? **Fuente:** `es_pyme` (autodeclarado). **Consulta:** `pyme_kpis.sql`, `pyme_modalidad.sql`. **Función:** `shape_pyme()`.

`es_pyme` tiene **doble codificación textual**: `'si'/'true'` = PYME. Por eso se usa `LOWER(es_pyme) IN ('si','true')`.

| KPI | Fórmula |
|---|---|
| % contratos PYME | `COUNTIF(es_pyme∈{si,true}) / COUNT(*)` |
| % valor PYME | `SUM(IF(pyme, valor, 0)) / SUM(valor)` |
| Valor total PYME | `SUM(IF(pyme, valor, 0))` |

El desglose por modalidad (`pyme_modalidad.sql`) usa `modalidad_norm` y da el % PYME **dentro de cada modalidad**. **Hallazgo:** ~12,8 % de los contratos son PYME pero captan algo más de 1 de cada 5 pesos; pesan más en valor que en número y dominan en las modalidades competitivas de menor cuantía. **Caveat:** autodeclarado, no auditado. El 12,8 % nacional **mezcla universos**: el denominador incluye la contratación directa (~78 % del total, dominada por personas naturales donde "PYME" casi no aplica), lo que diluye la cifra; el indicador informativo es la participación PYME *dentro* de las modalidades competitivas.

### 3.3 Duración · `duracion`

**Pregunta:** ¿cuánto duran los contratos? **Fuente:** tabla **cruda** `contratos`, `fecha_inicio`/`fecha_fin`. **Consulta:** `duracion_kpis.sql`, `duracion_modalidad.sql`. **Función:** `shape_duracion()`.

Plazo **contratado** = `DATE_DIFF(fecha_fin, fecha_inicio, DAY)`. **No** se usa la columna `duracion_dias` (viene rota en la fuente). Se acota a **[1, 3650] días** (1 día a 10 años) para descartar fechas invertidas y plazos absurdos. KPIs: mediana (`[OFFSET(50)]`), p25, p75, p90 vía `APPROX_QUANTILES`.

**Hallazgo:** la mitad se pacta a ≤151 días (~5 meses); 1 de cada 10 supera 333 días. **Caveat:** es plazo **contratado**, no ejecución real. (`verify_snapshot.py` exige `p25 ≤ mediana ≤ p75 ≤ p90`.)

### 3.4 Estacionalidad · `estacionalidad`

**Pregunta:** ¿en qué meses se mueve la contratación? **Fuente:** `contratos`, mes de `fecha_firma`. **Consulta:** `estacionalidad_kpis.sql`, `estacionalidad_mes.sql`. **Función:** `shape_estacionalidad()`. **Solo años completos 2023–2025** (excluye 2026 parcial y 2022, cuyo primer semestre tuvo cobertura severamente baja que inflaba enero).

| KPI | Fórmula |
|---|---|
| % contratos enero | `Σ(contratos mes=1) / Σ(contratos)` |
| % valor diciembre | `Σ(valor mes=12) / Σ(valor)` |
| Ratio enero vs. promedio | `contratos(enero) / (Σ(contratos) / 12)` |
| % contratos Q1 | `Σ(contratos mes≤3) / Σ(contratos)` |

**Hallazgo:** enero concentra ~13,6 % de los contratos (~1,6× un mes promedio) por las firmas de inicio de vigencia (prestación de servicios); diciembre firma pocos contratos pero el mayor **valor** del año (~17,3 %), muy influido por unos pocos contratos de cuantía extrema. **Caveat:** es un fenómeno administrativo del calendario presupuestal, no una señal en sí.

### 3.5 Financiación · `financiacion`

**Pregunta:** ¿con qué dinero se contrata? **Fuente:** columnas `recursos_pgn`, `recursos_propios`, `recursos_sgp`, `recursos_regalias`. **Consulta:** `financiacion_kpis.sql`, `financiacion_fuente.sql`. **Función:** `shape_financiacion()`.

Suma por bolsa (con `SAFE_CAST … FLOAT64` por robustez). `valor_con_fuente` suma las 4 bolsas con `COALESCE(…, 0)` **por término** (para que un NULL en una columna no anule la fila). `pct_con_fuente = valor_con_fuente / SUM(valor)`.

**Cobertura clave:** las 4 bolsas suman ~**63 %** del valor total. El resto no trae fuente atribuida. **La sección opera sobre el monto con fuente, no sobre el total.** El PGN es la mayor bolsa, seguido de los recursos propios. **Caveat:** las bolsas no son excluyentes — un contrato puede combinar varias. (`verify_snapshot.py` comprueba `Σbolsas ≈ valor_con_fuente` y `pct_con_fuente ≈ vcf/total`.)

### 3.6 ¿En qué creció? · `crecimiento`

**Pregunta:** ¿en qué creció y se redujo la contratación 2023→2025? **Fuente:** `_contratos_pub`. **Consulta:** `crecimiento_kpis.sql`, `crecimiento_sector.sql`. **Función:** `shape_crecimiento()`. **Compara 2023 con 2025** (omite 2022 por baja cobertura y 2026 por parcial).

`var_pct = (valor_2025 − valor_2023) / valor_2023 × 100` (variación **nominal**, sin ajuste por inflación). **Filtros de elegibilidad anti-distorsión:**

1. **`n_2023 ≥ 300` y `n_2025 ≥ 300`** — solo sectores con volumen real en ambos años.
2. **`max_top1_share < 0.5`** — el mayor contrato del sector debe pesar menos del 50 % del valor del sector; descarta "alzas" falsas causadas por **un único contrato** de cuantía extrema.

La serie muestra los sectores de mayor alza y de mayor caída (gráfico divergente). **Hallazgo:** de ~31 sectores comparables, 6 se redujeron; Aseo fue la mayor alza (+140 %), Arrendamiento la mayor caída (−31 %). **Caveat:** variación nominal; no implica irregularidad. (`var_pct` es la única clave `*pct` que puede ser negativa o >100; el guardia `[0,100]` la exceptúa.)

---

## 4. Las 11 señales (cruces neutrales)

Las señales son **conteos de coincidencias factuales** entre registros públicos, servidos como **agregados nacionales** (sin nombres, sin NITs, sin perfiles) en `/senal/:key`. Lógica en `_build_senales_extra()` de [`data/materialize_public.py`](../data/materialize_public.py); textos en [`src/lib/senales.ts`](../src/lib/senales.ts); datos en `public/data/senales_extra.json`.

> **Ninguna señal es acusatoria.** Cada una mide una coincidencia que **merece verificación caso por caso** y tiene explicaciones legítimas. Una coincidencia **no** es una irregularidad. Lee [Los cruces](08-Los-Cruces.md) para el porqué.

Las señales usan la tabla **cruda** `contratos` (necesitan columnas fuera de la base, como `fecha_prorroga`, `doc_supervisor`, `entidad_municipio`); el ~0,3 % de duplicados es marginal para estos agregados. Ventana común 2022–2026, `valor > 0`.

> **Anti doble-conteo (fan-out).** Tres señales (`donante_post_eleccion`, `redes_relaciones`, `sancionado_otro_depto`) cruzan contratos con una tabla donde un mismo NIT puede aparecer en **varias filas** (varias campañas, varias relaciones, sanciones en varios departamentos). Un `JOIN` directo sumaría el valor del **mismo contrato una vez por cada coincidencia**, inflando el total (`donante_post_eleccion` llegó a ~$820 B > universo ~$584 B antes del fix). Por eso el lado cruzado se **deduplica** (`DISTINCT` / `EXISTS`) antes de sumar: cada contrato cuenta **una sola vez**. Los conteos de personas/empresas ya eran exactos (`COUNT(DISTINCT …)`). La guardia de sentido de `verify_snapshot.py` comprueba que **ningún valor de señal supere el total contratado del país** (excepto `brechas_bpin`, que es de otra fuente).

### Grupo ¿Cómo? — magnitud de figuras contractuales

| Señal | Qué cuenta | Lógica y umbral | Fuente |
|---|---|---|---|
| **`adiciones`** | Contratos con prórroga y su valor | `fecha_prorroga IS NOT NULL`. Sin umbral. | `contratos` |
| **`contratos_no_planeados`** | Entidades-año que contrataron > 20 % sobre su PAA | PAA deduplicado (última versión) sumado por entidad-año vs. suma contratado; casos con `contratado > 1.2 × planeado` | `paa` + `contratos` |
| **`brechas_bpin`** | Proyectos de inversión poco ejecutados | BPIN (vigencia 2025–2026) con `valor_vigente ≥ $1.000M` y `pagado/vigente < 0.30`; brecha = `vigente − pagado` | `bpin_ejecucion` |

**Notas.** `contratos_no_planeados` **requiere PAA publicado** (solo 2024–2026): una entidad sin PAA **no** aparece (no se asume incumplimiento). El "planeado" usa la **última versión** del PAA (la misma dedup de §2.4); sin ella el planeado se inflaría ~30 % y el umbral 1,2× quedaría incoherente con la sección Planeación. `brechas_bpin` es presupuesto **vigente**; una ejecución baja a mitad de vigencia es esperable.

### Grupo ¿Hay señales? — coincidencias que merecen mirada

| Señal | Qué cuenta | Lógica y umbral | Fuente |
|---|---|---|---|
| **`prorroga_sin_ejecucion`** | Contratos prorrogados con pago bajo | `fecha_prorroga IS NOT NULL` **y** `valor_pagado/valor < 0.30` **y** firmado hace `≥ 12 meses` | `contratos` |
| **`monopolio_municipal`** | Municipios con un contratista dominante | Por municipio-contratista: `share ≥ 50 %` del valor **y** el municipio tiene entre **30 y 5.000** contratos | `contratos` |
| **`supervisor_contratista`** | Personas que supervisan y contratan con la misma entidad | `doc_supervisor` (≥2 contratos) **=** `contratista_nit` (≥2) **en la misma entidad** | `contratos` |
| **`puerta_giratoria`** | Servidores SIGEP que contratan con su entidad | `sigep_servidores.numero_documento = contratista_nit` **y** entidad normalizada coincide | `sigep_servidores` + `contratos` |
| **`redes_relaciones`** | Empresas que comparten representante legal | Contratistas cuyo NIT está en una relación `REPRESENTANTE_COMPARTIDO` (lado cruzado deduplicado) | `relaciones` + `contratos` |
| **`sancionado_otro_depto`** | Sancionados que contratan en otro departamento | `sanciones.sancionado_nit = contratista_nit` **y** depto. entidad **≠** depto. sanción **y** contrato **posterior** a la sanción (vía `EXISTS`) | `sanciones` + `contratos` |
| **`donante_post_eleccion`** | Donantes que contratan tras la elección | `campanas.nit_aportante = contratista_nit` **y** `fecha_firma > 1-ene del año siguiente` a la elección (donante deduplicado por NIT) | `campanas` + `contratos` |
| **`cluster_electoral`** | Campañas con varios aportantes que contratan | Por candidato: `≥ 3` aportantes distintos **y** `≥ 2` de ellos también contratistas. Cuenta campañas y aportantes (no valor) | `campanas` + `contratos` |

**Por qué cada umbral.** Los umbrales existen para **reducir ruido**, no para señalar culpables:
- *Monopolio:* el rango 30–5.000 contratos excluye municipios diminutos (donde un proveedor único es trivial) y los enormes (donde el 50 % sería improbable sin ser noticia conocida).
- *Supervisor/contratista:* exigir ≥2 de cada rol evita coincidencias de un solo contrato (más propensas a homonimia o error).
- *Sancionado/donante:* la condición **temporal** (contrato posterior a la sanción / posterior a la elección) hace el cruce más conservador que un simple "aparece en ambas listas".
- *Cluster electoral:* **no muestra valor** para evitar doble conteo entre campañas; no nombra candidatos ni partidos.

**Caveat común a todas:** son **coincidencias exactas de identificador** (NIT o documento). No verifican identidad real, simultaneidad temporal fina, ni descartan homónimos. Describen, no prueban. Ver [Los cruces](08-Los-Cruces.md) y [Caveats](09-Caveats-Y-Limites.md).

---

## 5. Los KPIs analíticos avanzados (`kpis_extra`)

Una capa de indicadores avanzados, ensamblada por `_build_kpis_extra()` y servida desde `public/data/kpis_extra.json`. Todos son **agregados nacionales neutrales** (describe, no juzga), sobre la base limpia salvo que se indique otra fuente. Comparten las salvedades de §1.4 (suma vs. mediana) y de cobertura por cruce de NIT.

### 5.1 Cadena de ejecución BPIN · `bpin_cadena`

**Fuente:** `bpin_ejecucion` (DNP), deduplicada por `id` (última `fecha_ingesta`), vigencias **2025–2026**. Suma los **4 estados** de la cadena presupuestal por año: `valor_vigente` → `valor_comprometido` → `valor_obligado` → `valor_pagado`. Muestra cuánto avanza el presupuesto de inversión por cada eslabón. **Caveat:** es presupuesto vigente; una vigencia en curso (2026) tiene la cadena naturalmente menos avanzada que una más madura (2025).

### 5.2 PAA por origen de recursos · `paa_origen`

**Fuente:** `paa` (última versión por encabezado, 2024–2026). Agrupa el `valor_total_esperado` planeado por `origen_recursos`. Los valores en blanco se etiquetan **"Sin especificar"** (`COALESCE(NULLIF(TRIM(origen_recursos), ''), 'Sin especificar')`) — *no* "Otras". **Caveat:** es planeación (intención), no ejecución.

### 5.3 Mezcla por nivel de gobierno · `mezcla_nivel`

**Fuente:** base limpia (`orden` + `modalidad_norm`). Para cada nivel de gobierno (`orden`: Nacional, Territorial, Corporación Autónoma, No clasificado) cruza **conteo Y valor** en tres grupos: `Directa` (Contratación directa), `Régimen especial`, y `Competitiva` (todo lo demás). Permite ver que un nivel puede contratar muchísimo *por número* vía directa pero concentrar el valor en lo competitivo. **Caveat:** `No clasificado` es ausencia de `orden`, no un nivel real.

### 5.4 Tamaño típico de contrato · `tamano_nivel` / `tamano_modalidad` / `tamano_objeto`

**Fuente:** base limpia. Helper `quant(dim)`: `APPROX_QUANTILES(valor, 100)` por dimensión y extrae **p25, mediana (p50), p75** y `n`. Exige **`n ≥ 20`** por grupo (cuantiles inestables con pocos datos). Tres cortes:

| Indicador | Dimensión | Orden / límite |
|---|---|---|
| `tamano_nivel` | `orden` (nivel de gobierno) | por mediana desc |
| `tamano_modalidad` | `modalidad_norm` | por mediana desc |
| `tamano_objeto` | `objeto_label` (excluye `Sin clasificar`) | por `n` desc, **top 12** |

**Lectura:** la mediana es el contrato "típico" de cada grupo; el rango p25–p75 describe su dispersión. **Caveat:** describe la distribución, no calidad ni eficiencia.

### 5.5 Distribución del nivel de pago · `pago_tramos` + `pago_mediana_ratio`

**Fuente:** base limpia, entre los contratos que reportan `valor_pagado` (no nulo, `valor > 0`). Reparte `ratio = valor_pagado / valor` en **5 tramos**: `0%`, `1-30%`, `30-70%`, `70-99%`, `≥100%`, con conteo y `pct`. `pago_mediana_ratio` es la **mediana** del ratio de pago (×100). **Por qué importa:** el `% pagado` agregado de §2.6 (~26,5 %) es un promedio ponderado por valor que **oculta una distribución muy bimodal** — en el snapshot, una gran masa de contratos en `0%` y otra gran masa en `≥100%`. Esa heterogeneidad es la que `pago_tramos` revela. **Caveat:** `valor_pagado` viene de SECOP II y está parcialmente subreportado.

### 5.6 Per cápita por departamento · `percapita`

**Fuente:** `donde_departamento.sql` (suma y conteo por DANE) cruzada con un **catálogo estático de población** embebido (`POBLACION_DANE`, proyección DANE 2023 post-CNPV 2018, redondeada al millar). Calcula `valor_per_capita = valor / población` y `contratos_per_capita = contratos / población`, ordenado por valor per cápita desc.

> **El catálogo de población NO es un dato del proyecto**, sino una referencia estática del DANE para normalizar. Cualquier fork puede afinarlo. Solo se incluyen departamentos con población en el catálogo; el resto se omite.

**Caveat:** el valor refleja la ubicación de la **entidad** (§2.7), no dónde se ejecuta; departamentos con muchas entidades nacionales (como Bogotá) salen altos por sede, no necesariamente por gasto local.

### 5.7 HHI de concentración por sector · `hhi_sector`

**Fuente:** base limpia. Índice **Herfindahl-Hirschman** (estándar de competencia, 0–10.000): por `objeto_label` (excluye `Sin clasificar`), suma valor por contratista, calcula la cuota de cada uno y `HHI = Σ(cuota²) × 10.000`. Solo sectores con **`≥ 50` proveedores** (evita inflar el HHI por escasez de datos), ordenado por HHI desc. **Interpretación de referencia:** HHI < 1.500 ≈ mercado poco concentrado; 1.500–2.500 ≈ moderado; > 2.500 ≈ concentrado. **Caveat:** la concentración alta puede ser natural en sectores muy especializados (pocos proveedores capaces); es descripción de estructura, no juicio.

### 5.8 Multas SECOP + cruce · `multas`

**Fuente:** tabla `multas_secop`. Panorama factual: `total` de multas, `valor_multas` (suma), `nits` distintos sancionados, rango de años (`anio_min`/`anio_max`) y serie `por_anio`.

> **Acotado por fecha de la fuente:** `fecha_sancion` trae registros con años basura (2027/2028); el panorama se limita a `BETWEEN 2010 AND 2026` y la serie a `2015–2026`.

`cruce_nits` / `cruce_valor` es el cruce **neutral** por NIT con la base de contratistas: cuántos NITs multados también contratan y el valor de esos contratos (lado de multas deduplicado con `DISTINCT`). **Caveat:** coincidencia exacta de NIT; una multa pasada no inhabilita necesariamente para contratar.

### 5.9 Antigüedad del contratista · `antiguedad`

**Fuente:** `rues_empresas` (fecha de matrícula, deduplicada por NIT con la matrícula más antigua) cruzada con la base por NIT exacto. Calcula la antigüedad al firmar = `DATE_DIFF(fecha_firma, fecha_matricula) / 365.25`, acotada a `[0, 36500]` días. Publica `mediana_anios`, `cobertura_pct` (qué % de la base tiene RUES cruzable), `n`, y la distribución en **5 tramos**: `<1 año`, `1-3`, `3-5`, `5-10`, `10+`.

> **Cobertura parcial (~41,5 % en el snapshot):** solo empresas con matrícula RUES cruzable por NIT exacto; las personas naturales y los NITs no encontrados quedan fuera. La mediana y los tramos describen **el subconjunto cubierto**, no toda la contratación.

**Caveat:** mide madurez registral del proveedor, nada más; una empresa joven no es señal de nada.

### 5.10 Reincidencia entidad-contratista · `reincidencia`

**Fuente:** base limpia. Por cada **par (entidad, contratista)** cuenta cuántos contratos comparten; clasifica el par en **4 tramos** según ese número (`1`, `2-4`, `5-9`, `10+`) y suma contratos y valor por tramo, con `pct_contratos` y `pct_valor`. Describe la **estabilidad vs. rotación** de las relaciones: cuánta contratación es de una sola vez frente a relaciones recurrentes. **Caveat:** la recurrencia es esperable y legítima (proveedores especializados, contratos de tracto sucesivo); describe estructura, no irregularidad.

### 5.11 Fidelidad del PAA · `fidelidad_paa`

**Fuente:** `paa` (última versión por encabezado, 2024–2026). Por año, mide el **% de ítems planeados que ya tienen un proceso enlazado** (`procesos_relacionados` no vacío). Es una proxy de cuánto del plan se materializó en un proceso de compra. **Caveat:** años recientes tienen naturalmente menos enlaces (los procesos aún no se publican); la cifra cae conforme el año es más reciente (lectura de madurez, no de incumplimiento).

> **Una nota sobre el SGR.** Se evaluó publicar "regalías por año" desde `sgr_gastos`, pero esa tabla trae **snapshots mensuales** y sumar la apropiación a través de periodos multiplica el grano (daba cifras implausibles frente a las regalías reales). Sin certeza del grano (incremental vs. acumulado), se **omitió** antes que publicar un número falso. Es un ejemplo del principio "ante la duda, no publicar".

---

## 6. Tabla maestra de umbrales

Todos los números "mágicos" del proyecto, en un solo lugar. Si cambias uno en tu [fork](04-Hacer-Un-Fork.md), aquí sabes qué afecta.

| Umbral | Valor | Dónde aplica |
|---|---|---|
| Ventana temporal | 2022-01-01 → 2026-12-31 | Toda la base |
| Valor mínimo | `valor > 0` | Toda la base |
| Dedup contratos | última versión por `id` (`ultima_actualizacion`) | Toda la base |
| Dedup PAA | última versión por `paa_encabezado_id` | PAA, `contratos_no_planeados`, `paa_origen`, `fidelidad_paa` |
| Plazo de duración válido | [1, 3650] días | `duracion` |
| Antigüedad válida (RUES) | [0, 36500] días | `antiguedad` |
| Sobre-ejecución del PAA | contratado > 1,2 × planeado | `contratos_no_planeados` |
| Brecha BPIN | vigente ≥ $1.000M y pagado/vigente < 30 % | `brechas_bpin` |
| Cadena/brecha BPIN: vigencias | 2025–2026 | `brechas_bpin`, `bpin_cadena`, inversión |
| Pago bajo (prórroga) | pagado/valor < 30 % y ≥ 12 meses | `prorroga_sin_ejecucion` |
| Dominancia municipal | share ≥ 50 %, municipio 30–5.000 contratos | `monopolio_municipal` |
| Rol doble (supervisor) | ≥ 2 contratos en cada rol, misma entidad | `supervisor_contratista` |
| Cluster electoral | ≥ 3 aportantes, ≥ 2 contratan | `cluster_electoral` |
| Crecimiento: volumen | ≥ 300 contratos en 2023 y 2025 | `crecimiento` |
| Crecimiento: anti-outlier | mayor contrato < 50 % del valor del sector | `crecimiento` |
| N mínimo por sector (¿Quién?) | ≥ 20 contratos | `quien_sector` |
| N mínimo para cuantiles | ≥ 20 por grupo | `tamano_nivel/modalidad/objeto` |
| N mínimo proveedores (HHI) | ≥ 50 por sector | `hhi_sector` |
| Multas: ventana de la fuente | panorama 2010–2026; serie 2015–2026 | `multas` |
| Inhabilidad vigente | `estado='VIGENTE'` y meses > 0, **sin filtro de fecha** | `sanciones` |
| Top categorías partido | top 12 por monto, clave normalizada | `electoral` |

---

## 7. Cómo verificar o reproducir un número

1. **Identifica la consulta.** Cada KPI de arriba cita su `.sql` o la función de `materialize_public.py`.
2. **Léela.** Está en [`data/queries/`](../data/queries) o en [`data/materialize_public.py`](../data/materialize_public.py). El SQL es legible y comentado.
3. **Córrela.** Con credenciales de BigQuery: `python data/materialize_public.py` regenera todos los JSON. Sin credenciales, los tests puros (`shape_*`) corren con fixtures (ver `data/test_materialize.py`).
4. **Compara.** El snapshot vive versionado en `public/data/*.json`. Puedes abrir el JSON y ver el número exacto que pinta el dashboard.
5. **Reconcilia.** `python data/verify_snapshot.py` re-deriva cada cifra de forma independiente contra BigQuery y reporta `✅ TODO RECONCILIA` o los desajustes. Con `--full` añade las fuentes no-contratos y las 11 señales cruzadas.
6. **Cámbialo.** Ajusta un umbral, regenera, redespliega. Es un [fork](04-Hacer-Un-Fork.md) de un comando.

> **Reproducibilidad total.** Mismo código + mismo snapshot = mismos números. No hay aleatoriedad ni estado oculto. Si un número no te cuadra, el SQL te dice exactamente por qué da lo que da, y `verify_snapshot.py` lo confirma con una formulación distinta.

---

## Para seguir

- **[Metodología](03-Metodologia.md)** — la filosofía: qué calculamos y qué NO.
- **[Las secciones](07-Las-Secciones.md)** — el panorama de las 10 secciones-pregunta.
- **[Los cruces](08-Los-Cruces.md)** — por qué las señales no son acusatorias.
- **[Auditoría de datos](06-Auditoria-De-Datos.md)** — el control de calidad de las cifras.
- **[Caveats](09-Caveats-Y-Limites.md)** — los límites reales, sin letra pequeña.
- **[Las fuentes](01-Fuentes.md)** — de dónde sale cada tabla.
