# Datos y materialización

Cómo se va de una tabla cruda en BigQuery a los archivos `public/data/*.json` que lee el sitio. Esta página documenta el **pipeline completo, paso a paso**, el **método** (estable) por encima de los **números** (volátiles), y las decisiones de ingeniería que garantizan que ningún contrato se cuente dos veces y que ninguna cifra esté inventada.

> **Principio rector, innegociable:** *describe, no juzga.* Todo en esta capa es estadística descriptiva neutral. No hay scoring, no hay acusaciones, no hay rankings de "riesgo". Las coincidencias factuales se publican como tales y merecen verificación caso por caso.

---

## 1. El flujo de extremo a extremo

```
┌─────────────────────────────────────────────────────────────────┐
│  BigQuery: vectorvi.vectorvi.contratos  (tabla CRUDA, ~millones) │
│  + tablas auxiliares: procesos, paa, bpin_ejecucion, sanciones,  │
│    campanas, rues_empresas, relaciones, multas_secop, sigep_*    │
└───────────────────────────────┬─────────────────────────────────┘
                                │  data/materialize_public.py
                                │  (lo corre quien tiene acceso a la fuente)
                                ▼
        ┌───────────────────────────────────────────────┐
        │  _contratos_pub  (tabla BASE LIMPIA, temporal) │
        │  ventana 2022–2026 · valor>0 · DEDUP por id    │
        │  + modalidad_norm + objeto_label               │
        └───────────────────────┬───────────────────────┘
                                │  queries SQL + funciones shape_*
                                ▼
              public/data/*.json   (snapshot agregado, commiteado)
                                │
                                ▼
                  SPA estática (React)  →  el navegador solo LEE el JSON
```

El sitio **nunca** consulta BigQuery. Solo lee JSON pre-calculado y validado. Por eso es **barato** (cero costo de cómputo en cada visita), **seguro** (no expone credenciales ni datos de fila) y **reproducible** (el snapshot es un artefacto versionado en Git).

La separación es deliberada: la **materialización** (cara, requiere credenciales, corre rara vez) está totalmente desacoplada del **consumo** (gratis, público, corre en cada carga de página).

---

## 2. La tabla base limpia: `_contratos_pub`

Antes de calcular **cualquier** agregado, el materializador construye una **tabla base limpia** de la que beben todas las consultas. Esto es el corazón de la integridad de los datos.

### 2.1 Cómo se construye

La crea la función `_ensure_base()` con un `CREATE OR REPLACE TABLE`:

```sql
CREATE OR REPLACE TABLE `vectorvi.vectorvi._contratos_pub` AS
SELECT
  id, valor, valor_facturado, valor_pagado, fecha_firma, entidad_nit,
  entidad_nombre, contratista_nit, modalidad, objeto_clasificado, orden,
  entidad_departamento, es_pyme,
  recursos_pgn, recursos_sgp, recursos_regalias, recursos_propios,
  <CASE de modalidad>     AS modalidad_norm,   -- normalización centralizada
  <CASE de objeto>        AS objeto_label
FROM `vectorvi.vectorvi.contratos`
WHERE fecha_firma BETWEEN '2022-01-01' AND '2026-12-31'
  AND valor IS NOT NULL AND valor > 0
QUALIFY ROW_NUMBER() OVER (
  PARTITION BY id ORDER BY ultima_actualizacion DESC
) = 1;
```

Tres garantías quedan **cocidas** en esta tabla, de una vez por todas:

| Garantía | Cláusula | Qué hace |
|----------|----------|----------|
| **Ventana temporal** | `fecha_firma BETWEEN '2022-01-01' AND '2026-12-31'` | Acota la serie a 2022–2026. Configurable por entorno (`YEAR_FROM`/`YEAR_TO`). |
| **Solo valor real** | `valor IS NOT NULL AND valor > 0` | Descarta filas sin valor o con valor cero/negativo, que distorsionarían sumas, medianas y conteos. |
| **Deduplicación por id** | `QUALIFY ROW_NUMBER() OVER (PARTITION BY id ORDER BY ultima_actualizacion DESC) = 1` | Conserva **una sola versión** por contrato: la más reciente según `ultima_actualizacion`. |

> **Por qué deduplicar.** La fuente SECOP trae una fracción de `id` repetidos (el mismo contrato ingerido o versionado más de una vez). Sin esta cláusula, esos contratos se contarían y sumarían dos veces, inflando KPIs. El `QUALIFY` resuelve el problema en la base, así que **ningún** agregado posterior puede equivocarse: todos heredan la deduplicación gratis. La verificación independiente (ver §8) comprueba que `panorama.contratos == COUNT(DISTINCT id)` sobre la tabla cruda — el conteo del snapshot es exactamente el número de identificadores únicos.

### 2.2 Columnas que expone

Solo se proyectan las **17 columnas base** que necesitan los agregados (`_BASE_COLS`), más **dos columnas normalizadas** calculadas en este mismo paso:

- **`modalidad_norm`** — la modalidad cruda colapsada a **7 categorías canónicas**.
- **`objeto_label`** — el objeto del contrato colapsado a una **etiqueta de sector** limpia.

Proyectar solo lo necesario reduce el costo de cada query posterior (menos bytes escaneados) y mantiene la base ligera.

### 2.3 Ciclo de vida: tabla temporal

`_contratos_pub` es **efímera**. `run()` la crea al inicio, ejecuta todos los agregados dentro de un `try`, y la borra en el `finally` con `_drop_base()` (un `DROP TABLE IF EXISTS`). Pase lo que pase, la tabla no queda residual en el dataset. No es un artefacto que se consulte en producción: es un andamiaje de cálculo que vive solo durante la corrida del materializador.

---

## 3. Normalizaciones centralizadas (DRY)

Las dos normalizaciones se definen **una sola vez** en `materialize_public.py` y se inyectan en la tabla base. Así, las decenas de archivos `.sql` consumen las columnas ya limpias en vez de repetir el mismo `CASE` en cada uno. Si la lógica cambia, se cambia en **un** lugar.

### 3.1 `modalidad_norm` — 7 categorías canónicas

La modalidad cruda llega con tildes, mayúsculas/minúsculas mezcladas y decenas de variantes textuales. Se normaliza quitando acentos (`NORMALIZE(..., NFD)` + `REGEXP_REPLACE(..., r'\pM', '')`), pasando a mayúsculas, y mapeando por `LIKE` a estas categorías:

| Categoría canónica | Coincide con (entre otros) |
|--------------------|----------------------------|
| **Contratación directa** | `%DIRECTA%` |
| **Régimen especial** | `%REGIMEN%ESPECIAL%` |
| **Mínima cuantía** | `%MINIMA%` |
| **Selección abreviada** | `%ABREVIAD%`, `%MENOR CUANTIA%`, `%SUBASTA%` |
| **Licitación pública** | `%LICITACION%` |
| **Concurso de méritos** | `%MERITOS%`, `%CONCURSO%` |
| **Otras** | cualquier otra (o `NULL`) |

### 3.2 `objeto_label` — etiqueta de sector limpia

El campo `objeto_clasificado` es texto de altísima cardinalidad (miles de variantes compuestas: `CONSULTORÍA`, `CONSULTORÍA.`, `CONSULTORIA, APOYO, GESTION`…). Para no fragmentar el mismo concepto en docenas de etiquetas casi iguales, se construye una **clave normalizada**:

1. Toma el **primer segmento** del objeto (antes de la primera coma): `SPLIT(..., ',')[OFFSET(0)]`.
2. Lo lleva a mayúsculas, sin tildes ni punto final: `REGEXP_REPLACE(NORMALIZE(UPPER(TRIM(...)), NFD), r'[\pM.]', '')`.
3. Mapea esa clave a una de **33 etiquetas canónicas** (Salud, Consultoría, Contratación de personal, Educación, Construcción, Tecnología, Infraestructura, Sin clasificar, etc.).
4. La cola que no cae en ninguna canónica se limpia con `INITCAP(REPLACE(clave, '_', ' '))`.

> **Control de calidad.** El verificador mide cuánto **valor** queda en categorías **no canónicas** (la cola `INITCAP`). Si supera el 8 % del valor total, marca `REVISAR`; por debajo, `INFO`. Es un guard contra que las etiquetas pierdan cobertura silenciosamente.

---

## 4. El patrón `_sql()`: redirección a la base limpia

Las consultas en `data/queries/*.sql` están escritas **como si** leyeran la tabla cruda — usan el placeholder `` `{p}.{d}.contratos` ``. Esto las hace legibles y portables. Pero en ejecución, la función `_sql()` las **redirige** a la tabla base limpia antes de correrlas:

```python
def _sql(name: str) -> str:
    raw = QUERIES_DIR.joinpath(name).read_text(encoding="utf-8")
    raw = raw.replace("`{p}.{d}.contratos`", f"`{BASE_TABLE}`")   # redirect
    return raw.replace("{p}", PROJECT).replace("{d}", DATASET)     # placeholders
```

El efecto es elegante: **toda** referencia a `contratos` en un `.sql` apunta de hecho a `_contratos_pub` (deduplicada, pre-filtrada, con `modalidad_norm` y `objeto_label` ya disponibles). El autor de la query no tiene que recordar filtrar por ventana, valor o duplicados — la base ya lo hizo. Y como la base proyecta `modalidad_norm`/`objeto_label`, queries como `como_modalidad.sql` simplemente hacen `GROUP BY modalidad_norm` sin repetir el `CASE`.

> **Importante:** el redirect solo aplica a referencias literales a `contratos`. Las queries de **otras fuentes** (BPIN, PAA, sanciones, campañas, RUES…) referencian sus propias tablas y no se ven afectadas.

### 4.1 Placeholders de proyecto/dataset

`{p}` y `{d}` se sustituyen por las variables de entorno `GCP_PROJECT` y `BQ_DATASET` (default `vectorvi`/`vectorvi`). Esto permite que un fork apunte el pipeline a su propio proyecto sin editar las queries.

---

## 5. Las funciones `shape_*`: transformación pura

El materializador separa estrictamente **dos mundos**:

- **Consulta** (`run()`, `_q()`, `_client()`, `_ensure_base()`…) — toca BigQuery, requiere credenciales.
- **Forma** (`shape_panorama`, `shape_quien`, `shape_como`…) — funciones **puras** que reciben filas-dict y devuelven el dict exacto del tipo de `src/lib/types.ts`.

Una función `shape_*` **no** sabe nada de BigQuery: recibe `list[dict]` y devuelve `dict`. Esto las hace **testeables sin credenciales** — `data/test_materialize.py` les pasa filas de ejemplo y verifica que las claves de salida calcen **exactamente** con `types.ts`. Si alguien rompe el contrato de forma, el test falla en CI, no en producción.

### 5.1 Coerción a tipos JSON-safe

BigQuery devuelve `int` para `COUNT`/`EXTRACT`, y `Decimal`/`float` para `SUM(NUMERIC)`. El frontend espera `number`. Tres helpers normalizan:

| Helper | Convierte a | `None` →  |
|--------|-------------|-----------|
| `_i(v)` | `int` | `0` |
| `_f(v)` | `float` (acepta `Decimal`) | `0.0` |
| `_s(v, default)` | `str` | `default` |

### 5.2 Lógica derivada en las `shape_*`

Algunas `shape_*` no solo copian campos: derivan métricas. Ejemplos relevantes:

- **`shape_como`** calcula `pct_directa` (cuota **por número** de contratos), `pct_competitiva` (complemento a 100) y, por separado, **`pct_directa_valor`** (cuota **por valor**). Son muy distintas: la directa pesa mucho en número de contratos pero poco en valor (son de baja cuantía), así que el frontend muestra ambas y nunca dice «de cada peso… %» usando la cuota por conteo.
- **`shape_senales`** desempaca los tres escalares de concentración (`top10_pct_valor`, `n_contratistas`, `pct_directa_nacional`) que vienen en una sola fila, y anexa las `notas_metodologicas` neutrales.
- **`shape_meta`** estampa la **fecha de generación** (`datetime.date.today()`) y el **corte de datos** (el `MAX(fecha_firma)` real de la base), además de las fuentes y notas.

---

## 6. Las consultas SQL: `data/queries/*.sql`

Cada agregado del snapshot tiene su(s) archivo(s) `.sql`. Son **legibles y comentados**: cada uno explica qué calcula y por qué. Patrones recurrentes:

- **Agrupar entidades por NIT, no por nombre.** `quien_entidades.sql` agrupa por `entidad_nit` y muestra el nombre **más frecuente** vía `APPROX_TOP_COUNT(entidad_nombre, 1)`. Así una entidad nacional con decenas de nombres regionales (p. ej. el ICBF) se consolida bajo un solo NIT y no aparece como "ICBF Regional Caquetá" representando a todo el ICBF.
- **Etiquetar nulos en vez de ocultarlos.** `quien_nivel.sql` mapea `orden` nulo o vacío a `'No reportado'` en vez de perderlo (los nulos no reportan el nivel de gobierno).
- **Normalizar dimensiones sucias.** `electoral_partido.sql` construye una clave normalizada (mayúsculas, sin acentos, sin mojibake `U+FFFD`, sin prefijo `COALICION` ni sufijo de lista/cámara) para **no fragmentar** la misma colectividad en varias barras; la etiqueta mostrada es la variante cruda más frecuente y sin caracteres corruptos, elegida de forma determinística.
- **Mediana robusta junto al total.** `panorama_kpis.sql` reporta `SUM(valor)` **y** `APPROX_QUANTILES(valor, 100)[OFFSET(50)]` (mediana), porque el total es sensible a unos pocos contratos de cuantía extrema.

### 6.1 Normalización geográfica (`donde_departamento.sql`)

La columna `entidad_departamento` llega **muy** heterogénea: código DANE de 2 o 5 dígitos, o el nombre con/sin tildes y en distintas grafías (`"Distrito Capital de Bogotá"`, `"Bogota D.C."`, `"11"`, `"Antioquia"`, `"05"`…). La query la normaliza a **código DANE de 2 dígitos** con un `CASE WHEN` extenso:

1. Si ya es un código DANE de 2 dígitos válido → se usa tal cual.
2. Si es un código de 5 dígitos (municipio) → se toman los 2 primeros (departamento).
3. Si es un nombre → se compara **sin acentos y en minúsculas** (`REGEXP_REPLACE(NORMALIZE(LOWER(TRIM(...)), NFD), r'\pM', '')`) contra un diccionario de grafías conocidas.

El **nombre mostrado** sale de un catálogo canónico DANE→nombre (33 departamentos), no del valor crudo. Esto es crítico: una versión previa que comparaba con tildes dejaba fuera ~42 % del valor (sobre todo Bogotá, por la tilde), rompiendo el mapa.

---

## 7. Los archivos generados

El materializador escribe **un JSON por sección** en `public/data/`. Los seis primeros son el núcleo histórico; el resto añade fuentes y análisis.

| Archivo | Función `shape_*` / builder | Contenido |
|---------|-----------------------------|-----------|
| `meta.json` | `shape_meta` | Ventana, fecha de generación, corte de datos, fuentes, `fuentes_detalle`, notas |
| `panorama.json` | `shape_panorama` | KPIs macro (contratos, valor total, valor mediano, entidades, contratistas) + serie por año + top sectores |
| `quien.json` | `shape_quien` | Top entidades (por NIT) + por nivel de gobierno + por sector |
| `como.json` | `shape_como` | Por modalidad + evolución por año + `pct_directa` / `pct_competitiva` / `pct_directa_valor` |
| `donde.json` | `shape_donde` | Agregados por departamento (código DANE) |
| `senales.json` | `shape_senales` | Concentración top-10, percentiles de valor, `pct_directa_nacional`, notas metodológicas |
| `procesos.json` | `shape_procesos` | Procesos SECOP: total, % adjudicado/cancelado, por modalidad |
| `planeacion.json` | `shape_planeacion` | PAA (Plan Anual de Adquisiciones): qué planea comprar el Estado (2024–2026) |
| `inversion.json` | `shape_inversion` | BPIN: presupuesto de inversión vigente vs pagado |
| `ejecucion.json` | `shape_ejecucion` | Contratado vs facturado vs pagado |
| `sanciones.json` | `shape_sanciones` | Registro factual del SIRI (agregado, sin nombres) |
| `electoral.json` | `shape_electoral` | Aportes a campañas (CNE), agregado |
| `cruces.json` | `shape_cruces` | Solapamientos factuales por NIT (donantes, sancionados) |
| `senales_extra.json` | `_build_senales_extra` | **Bundle** de señales/cruces nacionales adicionales |
| `analisis.json` | `_build_analisis` | **Bundle** de secciones analíticas (género, PYME, duración…) |
| `kpis_extra.json` | `_build_kpis_extra` | **Bundle** de KPIs analíticos nuevos (cadena BPIN, tamaño típico, HHI…) |

### 7.1 Los tres *bundles*

Tres archivos agrupan **varias** secciones bajo una clave `items` para evitar la proliferación de archivos pequeños. Sus builders viven en `materialize_public.py`:

**`analisis.json` → `_build_analisis()`** — seis secciones analíticas, agregados nacionales:

| Clave | Qué describe |
|-------|--------------|
| `genero` | Género del **representante legal** (no de la propiedad), ~98 % de cobertura |
| `pyme` | Participación PYME (autodeclarada), conteo y valor, por modalidad |
| `duracion` | Plazo **contratado** (`fecha_inicio`→`fecha_fin`), no ejecución real; mediana y cuartiles |
| `estacionalidad` | Distribución por mes (Ene…Dic), años completos |
| `financiacion` | Valor contratado por fuente del gasto (PGN, SGP, regalías, propios) |
| `crecimiento` | Variación nominal del valor por sector entre dos años |

**`senales_extra.json` → `_build_senales_extra()`** — cruces nacionales neutrales, cada uno con conteo y valor. **Ningún dato es acusatorio**: son coincidencias factuales por NIT que merecen verificación caso por caso. Incluye `adiciones`, `prorroga_sin_ejecucion`, `brechas_bpin`, `contratos_no_planeados`, `monopolio_municipal`, `supervisor_contratista`, `puerta_giratoria`, `redes_relaciones`, `sancionado_otro_depto`, `donante_post_eleccion`, `cluster_electoral`.

> **Anti fan-out.** Varias de estas señales cruzan contratos con tablas donde un NIT puede aparecer en muchas filas (varias campañas, varias relaciones, sanciones en varios departamentos). Un `JOIN` directo multiplicaría el valor del **mismo** contrato una vez por cada coincidencia. Por eso el lado cruzado se deduplica con `DISTINCT`/`EXISTS`, sumando cada contrato **una sola vez**. El verificador comprueba además que ninguna señal supere el universo total contratado (guard de sentido).

**`kpis_extra.json` → `_build_kpis_extra()`** — KPIs analíticos recientes, todos neutrales:

| Clave | Qué describe |
|-------|--------------|
| `bpin_cadena` | Cadena de ejecución BPIN (vigente → comprometido → obligado → pagado) por vigencia |
| `paa_origen` | Composición del PAA por origen de recursos (última versión; vacíos → "No especificada") |
| `mezcla_nivel` | Mezcla competitiva/directa/régimen especial por nivel de gobierno |
| `tamano_nivel` / `tamano_modalidad` / `tamano_objeto` | **Tamaño típico** de contrato (p25/mediana/p75) por dimensión, exigiendo N≥20 por grupo |
| `pago_tramos` / `pago_mediana_ratio` | **Distribución del nivel de pago** por contrato (tramos 0 %, 1-30 %, 30-70 %, 70-99 %, ≥100 %) |
| `hhi_sector` | **HHI** (índice de concentración 0–10 000) de proveedores por sector, solo sectores con ≥50 proveedores |
| `multas` | Panorama de **multas SECOP** (factual) + cruce por NIT con contratistas |
| `antiguedad` | **Antigüedad del contratista** al firmar (vía matrícula RUES), cobertura parcial |
| `percapita` | Contratación **per cápita** por departamento (catálogo DANE 2023 embebido) |
| `reincidencia` | **Reincidencia** entidad-contratista (tramos 1, 2-4, 5-9, 10+) |
| `fidelidad_paa` | % de ítems del PAA que ya tienen un proceso enlazado |

> Una métrica que se **descartó a propósito**: "SGR por año". La tabla `sgr_gastos` trae snapshots **mensuales** y sumar apropiaciones a través de periodos multiplicaba el grano (daba cifras implausibles). Sin certeza del grano (incremental vs acumulado), se omite antes que publicar un número falso. Es el `describe, no juzga` aplicado a la propia honestidad del dato.

### 7.2 Per cápita: catálogo DANE embebido

`POBLACION_DANE` es un diccionario **estático** de población por código DANE (Proyección DANE 2023, post-CNPV 2018, aproximada al millar). **No es un dato del proyecto**: es un catálogo de referencia para las métricas per cápita. Cualquier fork puede afinarlo. La fuente es el DANE.

---

## 8. Verificación: `data/verify_snapshot.py`

El snapshot no se publica a ciegas. `verify_snapshot.py` es una **reconciliación independiente** contra BigQuery: **no** reutiliza las queries del materializador, sino que **re-deriva** cada número con formulaciones distintas (o desde la tabla cruda) y los compara con el JSON ya escrito. El objetivo es probar que **ningún número está inventado** y que todo reconcilia con la fuente.

Hace dos clases de chequeo:

1. **Reconciliación contra BigQuery** (requiere ADC). Construye su **propia** base slim deduplicada (`_verify_pub`, 12 columnas) y re-calcula panorama, ejecución, PYME, financiación, concentración top-10, género, adiciones, monopolio municipal… comparando con tolerancias explícitas. Verifica incluso que `panorama.contratos == COUNT(DISTINCT id)` de la cruda.
2. **Coherencia interna** (sin BigQuery). Comprueba invariantes que **deben** cumplirse sí o sí:
   - Σ de los desgloses por año = el KPI total.
   - Percentiles **monótonos crecientes**.
   - `facturado ≤ contratado` y `pagado ≤ contratado`.
   - `pagado ≤ vigente` y `pct_ejecucion ∈ [0,1]`.
   - Σ de `por_modalidad.pct` ≈ 100.
   - Todos los campos `*pct*` en `[0,100]` (excepto `var_pct`, que es una variación y puede ser negativa o >100).

### 8.1 Guards anti-fragmentación (blindaje permanente)

Dos guards estructurales corren **sin** BigQuery y blindan el snapshot contra regresiones:

- **Anti-fragmentación.** Ningún array de **una sola** categoría puede tener etiquetas **repetidas**. Es exactamente el síntoma del bug histórico de "partidos" sin normalizar: si la misma colectividad apareciera en dos filas, este guard lo detecta. Recorre `panorama`, `quien`, `como`, `donde`, `procesos`, `planeacion`, `inversion`, `ejecucion`, `sanciones`, `electoral`, `cruces` y `kpis_extra`.
- **Guard de sentido (anti fan-out).** Ningún valor de señal cruzada puede superar el universo total contratado (`panorama.kpis.valor_total`). Detecta el fan-out de `JOIN`s que en su día llevó `donante_post_eleccion` a superar el universo. `brechas_bpin` está exenta porque es de otra fuente (BPIN).

El modo `--full` añade la reconciliación de fuentes no-contratos (inversión, planeación, sanciones, electoral, procesos) y de las 11 señales cruzadas, re-ejecutando las queries reales del materializador y comparándolas con el JSON.

> Hay además **validación Zod en runtime**: el frontend valida cada JSON contra su esquema (`src/lib/schemas.ts`) al cargarlo, de modo que un snapshot malformado se detecta en el navegador, no se renderiza basura silenciosamente.

---

## 9. Regenerar el snapshot

> Solo lo puede correr quien tenga acceso a la fuente BigQuery. El sitio público **no** lo necesita para funcionar: ya lleerá el JSON commiteado.

```bash
# 1. Dependencias
pip install -r data/requirements.txt

# 2. Credenciales de BigQuery (Application Default Credentials)
gcloud auth application-default login
#   (o exportar una cuenta de servicio con GOOGLE_APPLICATION_CREDENTIALS)

# 3. (Opcional) apuntar a otro proyecto/dataset o cambiar la ventana
export GCP_PROJECT=vectorvi BQ_DATASET=vectorvi
export YEAR_FROM=2022 YEAR_TO=2026

# 4. Generar los JSON en public/data/
python data/materialize_public.py

# 5. Verificar que todo reconcilia con la fuente
python data/verify_snapshot.py          # reconciliación + coherencia
python data/verify_snapshot.py --full    # + fuentes y 11 señales cruzadas
```

`run()` orquesta la corrida completa: crea `_contratos_pub`, ejecuta **todos** los agregados (`_run_aggregates`), y borra la tabla base en el `finally`. Al terminar, `public/data/*.json` está listo para commitear.

| Variable de entorno | Default | Para qué |
|---------------------|---------|----------|
| `GCP_PROJECT` | `vectorvi` | Proyecto GCP que aloja las tablas |
| `BQ_DATASET` | `vectorvi` | Dataset de BigQuery |
| `YEAR_FROM` / `YEAR_TO` | `2022` / `2026` | Ventana temporal de la serie |

Ver también **[Hacer un fork](04-Hacer-Un-Fork.md)** § "Cambia los datos" y **[Cómo se calcula todo](13-Como-Se-Calcula-Todo.md)** para el detalle métrica por métrica.

---

## 10. Resumen de garantías de integridad

| Riesgo | Mecanismo que lo previene |
|--------|---------------------------|
| Contar un contrato dos veces | `QUALIFY ROW_NUMBER()` en la tabla base |
| Sumar valores cero/nulos | `valor IS NOT NULL AND valor > 0` en la base |
| Repetir el mismo `CASE` con erratas distintas | `modalidad_norm` / `objeto_label` centralizados (DRY) |
| Olvidar filtrar la ventana en una query | El redirect `_sql()` apunta todo a `_contratos_pub` |
| Fragmentar una categoría sucia en varias barras | Claves normalizadas + guard anti-fragmentación |
| Inflar un cruce por fan-out de `JOIN` | `DISTINCT`/`EXISTS` + guard de sentido (≤ universo) |
| Publicar un número inventado | Reconciliación independiente en `verify_snapshot.py` |
| Romper el contrato de forma del JSON | Tests de `shape_*` + validación Zod en runtime |
| Perder cobertura de etiquetas en silencio | Chequeo de % de valor en categorías no canónicas |

---

### Páginas relacionadas

- **[Fuentes](01-Fuentes.md)** — de dónde sale cada tabla cruda.
- **[Metodología](03-Metodologia.md)** — el "describe, no juzga" en detalle.
- **[Cómo se calcula todo](13-Como-Se-Calcula-Todo.md)** — cada métrica, fórmula por fórmula.
- **[Las secciones](07-Las-Secciones.md)** — qué muestra cada JSON en la UI.
- **[Los cruces](08-Los-Cruces.md)** — el detalle neutral de las señales cruzadas.
- **[Auditoría de datos](06-Auditoria-De-Datos.md)** — el proceso de verificación.
- **[Hacer un fork](04-Hacer-Un-Fork.md)** — regenerar con tu propia fuente.
