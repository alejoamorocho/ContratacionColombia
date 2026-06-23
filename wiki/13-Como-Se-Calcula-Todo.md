# Cómo se calcula todo

Esta es la **referencia completa de cálculos** del observatorio: el *diccionario de datos*. Para **cada** indicador del dashboard —KPIs de portada, secciones, los 6 análisis y las 11 señales— documenta **qué mide**, **la fórmula exacta**, **de qué tabla y columnas sale**, **el umbral** (si lo hay) y **su salvedad**. Si una cifra aparece en el sitio, aquí está explicada.

Es la página más técnica de la wiki. Si solo quieres el panorama, lee primero [Las secciones](07-Las-Secciones.md) y [Metodología](03-Metodologia.md). Si quieres reproducir o auditar un número, esta es tu página: cada cálculo remite al archivo `.sql` o a la función de [`data/materialize_public.py`](../data/materialize_public.py) donde vive.

> **Una promesa de transparencia.** Todo lo que sigue es código abierto. No hay fórmulas secretas, ni pesos ocultos, ni "scores" propietarios. Cada número del dashboard se obtiene de una consulta SQL que puedes leer, correr y cambiar en un [fork](04-Hacer-Un-Fork.md).

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

Las consultas en `data/queries/*.sql` escriben ``` `{p}.{d}.contratos` ```; el materializador (`_sql()`) **redirige** esa referencia a `_contratos_pub`. Así, cada consulta hereda automáticamente la ventana, el `valor>0`, la dedup y las columnas normalizadas.

> **Excepción deliberada.** Unas pocas consultas necesitan columnas que la base no materializa (p. ej. `fecha_inicio`/`fecha_fin` para duración, `genero_representante_legal` para género). Esas leen la tabla **cruda** usando la forma con backtick partido ``` `{p}`.`{d}`.contratos ``` o ``` `{p}.{d}`.contratos ```, que **evita** el redirect. Se documenta caso por caso abajo. En esas, la dedup no es crítica porque calculan cuantiles o porcentajes, no conteos exactos.

### 1.2 Las dos normalizaciones canónicas

**Modalidad → 7 categorías (`modalidad_norm`).** El texto crudo de la modalidad trae decenas de variantes ("Contratación Directa", "CONTRATACION DIRECTA (...)", etc.). Se normaliza quitando tildes y mayúsculas (`NORMALIZE … NFD`) y se mapea a 7 categorías canónicas:

`Contratación directa` · `Régimen especial` · `Mínima cuantía` · `Selección abreviada` (incluye menor cuantía y subasta) · `Licitación pública` · `Concurso de méritos` · `Otras`.

**Código de objeto → etiqueta legible (`objeto_label`).** El campo `objeto_clasificado` viene en MAYÚSCULAS_CON_GUION (p. ej. `CONSTRUCCION`, `MEDIO_AMBIENTE`). Se mapea a etiquetas en español con tildes (`Construcción`, `Medio ambiente`). Los nulos se rotulan `Sin clasificar`; cualquier código sin mapa explícito cae a `INITCAP(REPLACE(_, ' '))`.

**Departamento → código DANE (mapa).** En `donde_departamento.sql`, el nombre del departamento se normaliza sin tildes ni mayúsculas (`REGEXP_REPLACE(NORMALIZE(LOWER(TRIM(x)), NFD), r'\pM', '')`) y se cruza con un diccionario a código DANE de 2 dígitos. Esto recuperó a Bogotá ("Distrito Capital de Bogotá"), que antes se perdía por la tilde. Ver [Auditoría de datos](06-Auditoria-De-Datos.md).

### 1.3 Suma vs. mediana vs. percentiles

- **Suma (`SUM(valor)`)** — el agregado natural, pero **sensible a outliers**: unos pocos contratos de cuantía extrema (que pueden incluir errores de digitación en la fuente) inflan el total. Por eso el total es una **cota inferior con ruido al alza**, no una cifra exacta del gasto.
- **Mediana (`APPROX_QUANTILES(valor, 100)[OFFSET(50)]`)** — el contrato "típico". Robusta a outliers: da igual que un contrato valga $5 billones, la mediana no se mueve. Por eso el dashboard **siempre** muestra mediana junto a la suma.
- **Percentiles (p10…p99)** — describen la **forma** de la distribución. Un p90 alto solo dice que 1 de cada 10 contratos supera ese valor; no implica nada más.

`APPROX_QUANTILES` es el cuantil aproximado de BigQuery (error < 1 % a esta escala), elegido por rendimiento sobre cientos de millones de filas.

### 1.4 Qué NO se calcula

No hay **score ponderado**, ni **ranking de riesgo**, ni **semáforo**, ni **modelo** que "prediga" corrupción. El observatorio cuenta y describe; no juzga ni infiere intención. Ver [Metodología](03-Metodologia.md). Las señales (sección 4) son **conteos de coincidencias factuales**, nunca acusaciones.

---

## 2. Las secciones base

Las 10 secciones-pregunta del dashboard. Cada una indica su **fuente**, las **consultas** que la alimentan y la **fórmula** de cada KPI.

### 2.1 Panorama (Inicio)

**Fuente:** `_contratos_pub`. **Consulta:** `panorama_kpis.sql`, `panorama_anio.sql`, `panorama_sectores.sql`.

| KPI | Fórmula |
|---|---|
| Contratos | `COUNT(*)` |
| Valor total | `SUM(valor)` |
| Valor mediano | `APPROX_QUANTILES(valor, 100)[OFFSET(50)]` |
| Entidades | `COUNT(DISTINCT entidad_nit)` |
| Contratistas | `COUNT(DISTINCT contratista_nit)` |

`por_anio` agrupa contratos y valor por `EXTRACT(YEAR FROM fecha_firma)`; `top_sectores`, por `objeto_label`. **Caveat:** el total subestima el gasto real (sin SECOP I ni adiciones) y 2026 es parcial.

### 2.2 ¿Quién contrata?

**Fuente:** `_contratos_pub`. **Consulta:** `quien_entidades.sql`, `quien_nivel.sql`, `quien_sector.sql`.

- **Top entidades:** `SUM(valor)`, `COUNT(*)` agrupado por `entidad_nit`/`entidad_nombre`, ordenado por valor.
- **Por nivel** (`orden`): nacional / territorial, suma y conteo.
- **Por sector** (`objeto_label`): `SUM(valor)`, `COUNT(*)`, con `HAVING contratos >= 20`, top 12 por valor.

**Caveat:** se cuenta por `contratista_nit`/`entidad_nit`; un NIT mal reportado en la fuente puede fragmentar o inflar conteos.

### 2.3 ¿Cómo contrata?

**Fuente:** `_contratos_pub` (modalidad) + tabla `procesos`. **Consulta:** `como_modalidad.sql`, `como_modalidad_anio.sql`, `procesos_kpis.sql`, `procesos_modalidad.sql`.

- **Por modalidad:** `COUNT(*)`, `SUM(valor)` y `pct = COUNT(*) / SUM(COUNT(*)) OVER ()` agrupado por `modalidad_norm`.
- **`pct_directa`** (derivado en `shape_como`): suma del `pct` de las modalidades cuyo nombre contiene "DIRECTA"; `pct_competitiva = 100 − pct_directa`.
- **Procesos:** `pct_adjudicado` = % de procesos en estado *Seleccionado*; `pct_cancelado` = % en estado *Cancelado*.

**Caveat:** la tabla `procesos` **no trae número de oferentes** (~0 % poblado), así que la competencia efectiva no se puede medir.

### 2.4 ¿Qué se planea? (PAA)

**Fuente:** tabla `paa` (Plan Anual de Adquisiciones, SECOP II). **Consulta:** `planeacion_*.sql`. **Solo 2024–2026.**

`items` = `COUNT(*)`; `valor_planeado` = `SUM(valor_total_esperado)`; `entidades` = `COUNT(DISTINCT entidad_nit)`. Desgloses por año, categoría y modalidad. **Caveat:** el PAA es **intención**, no ejecución; y solo cubre 2024–2026.

### 2.5 ¿En qué se invierte? (BPIN)

**Fuente:** tabla `bpin_ejecucion` (DNP). **Consulta:** `inversion_*.sql`. **Vigencias 2025–2026.**

`valor_vigente`, `valor_pagado` (sumas), `pct_ejecucion = pagado / vigente`. **Caveat:** es **presupuesto vigente**, en universo y unidades distintas a los contratos de SECOP II — no son directamente comparables.

### 2.6 ¿Se ejecuta?

**Fuente:** `_contratos_pub` (columnas `valor_facturado`, `valor_pagado`). **Consulta:** `ejecucion_kpis.sql`, `ejecucion_anio.sql`.

| KPI | Fórmula |
|---|---|
| Contratado | `SUM(valor)` |
| Facturado | `SUM(valor_facturado)` |
| Pagado | `SUM(valor_pagado)` |
| % facturado | `SUM(valor_facturado) / NULLIF(SUM(valor), 0)` |
| % pagado | `SUM(valor_pagado) / NULLIF(SUM(valor), 0)` |

**Caveat:** la tabla `facturas` está vacía; la ejecución se aproxima desde las columnas del propio contrato. `valor_facturado`/`valor_pagado` son **NULL en parte** de los contratos; `SUM` los ignora, así que los porcentajes son **cotas inferiores**.

### 2.7 ¿Dónde?

**Fuente:** `_contratos_pub`. **Consulta:** `donde_departamento.sql`. Suma y conteo por departamento, normalizado a código DANE. **Caveat:** ~5 % de contratos sin departamento mapeable quedan fuera del mapa; el valor refleja la **ubicación de la entidad**, no dónde se ejecuta.

### 2.8 Sanciones (SIRI)

**Fuente:** tabla `sanciones` (Procuraduría). **Consulta:** `sanciones_*.sql`. Registro **agregado y sin nombres**: total, inhabilidades vigentes, inhabilidad promedio (meses), desgloses por tipo, año y gravedad. **Caveat:** es un registro factual; una sanción tiene tipo, alcance y vigencia que solo la fuente primaria precisa.

### 2.9 Electoral (Cuentas Claras, CNE)

**Fuente:** tabla `campanas` (CNE). **Consulta:** `electoral_*.sql`. Aportes, monto total, candidatos, desglose por año/partido/departamento. **Caveat:** solo ciclos **2022–2023**; agregado, sin cruzar con contratos (eso vive en señales).

### 2.10 Concentración y percentiles (Señales base)

**Fuente:** `_contratos_pub`. **Consulta:** `senales_concentracion.sql`, `senales_percentiles.sql`.

- **Top-10 % del valor:** se suma el valor por `contratista_nit`, se ordena con `ROW_NUMBER() … DESC`, y `top10_pct_valor = Σ(valor de rn≤10) / Σ(valor total)`.
- **% directa nacional:** `COUNTIF(UPPER(modalidad) LIKE '%DIRECTA%') / COUNT(*)`.
- **Percentiles del valor:** `APPROX_QUANTILES(valor, 100)`, extrayendo p10, p25, p50, p75, p90, p99.

**Caveat:** la concentración del top-10 es **estadística descriptiva**; no implica irregularidad. Una concentración baja es esperable en un mercado con casi un millón de contratistas.

---

## 3. Los 6 análisis ("datos valiosos")

Secciones analíticas accesibles en `/analisis/:key`. Config en [`src/lib/analisis.ts`](../src/lib/analisis.ts); datos en `public/data/analisis.json`. Cada una: pregunta, fórmula exacta, fuente y caveat.

### 3.1 Género de quien firma · `genero`

**Pregunta:** ¿quién firma —mujeres u hombres— y reciben lo mismo? **Fuente:** tabla **cruda** `contratos`, columna `genero_representante_legal` (no `contratista_genero`, que está vacía). Cobertura ~98 %. **Consulta:** `genero_kpis.sql`, `genero_anio.sql`.

Se clasifica el género (`F/MUJER/FEMENINO` → Mujer; `M/HOMBRE/MASCULINO` → Hombre; resto → Otro/Sin dato) y los **porcentajes se calculan sobre la base Mujer+Hombre** (se excluyen Otro/Sin dato):

| KPI | Fórmula |
|---|---|
| % contratos mujer | `COUNTIF(genero='Mujer') / COUNT(*)` sobre base M+H |
| % valor mujer | `SUM(IF(Mujer, valor, 0)) / SUM(valor)` sobre base M+H |
| Mediana valor mujer | `APPROX_QUANTILES(IF(Mujer, valor, NULL), 100)[OFFSET(50)]` |
| Mediana valor hombre | igual, para Hombre |

**Hallazgo:** las mujeres firman ~53 % de los contratos pero reciben ~41 % del valor. **Caveat:** es el género del **representante legal**, no de la propiedad de la empresa. La mediana evita el sesgo de cuantías extremas.

### 3.2 PYMEs · `pyme`

**Pregunta:** ¿cuánta contratación llega a pequeñas y medianas empresas? **Fuente:** `es_pyme` (autodeclarado). **Consulta:** `pyme_kpis.sql`, `pyme_modalidad.sql`.

`es_pyme` tiene **doble codificación textual**: `'si'/'true'` = PYME. Por eso se usa `LOWER(es_pyme) IN ('si','true')`.

| KPI | Fórmula |
|---|---|
| % contratos PYME | `COUNTIF(es_pyme∈{si,true}) / COUNT(*)` |
| % valor PYME | `SUM(IF(pyme, valor, 0)) / SUM(valor)` |
| Valor total PYME | `SUM(IF(pyme, valor, 0))` |

El desglose por modalidad (`pyme_modalidad.sql`) usa `modalidad_norm` y da el % PYME **dentro de cada modalidad**. **Hallazgo:** ~1 de cada 8 contratos es PYME (~12,8 %) pero captan ~1 de cada 5 pesos; pesan más en valor que en número, y dominan en las modalidades competitivas de menor cuantía. **Caveat:** autodeclarado, no auditado.

### 3.3 Duración · `duracion`

**Pregunta:** ¿cuánto duran los contratos? **Fuente:** tabla **cruda** `contratos`, `fecha_inicio`/`fecha_fin`. **Consulta:** `duracion_kpis.sql`, `duracion_modalidad.sql`.

Plazo **contratado** = `DATE_DIFF(fecha_fin, fecha_inicio, DAY)`. **No** se usa la columna `duracion_dias` (viene rota en la fuente). Se acota a **[1, 3650] días** (1 día a 10 años) para descartar fechas invertidas y plazos absurdos (~0,4 % de filas fuera de rango). KPIs: mediana (`[OFFSET(50)]`), p25, p75, p90 vía `APPROX_QUANTILES`.

**Hallazgo:** la mitad se pacta a ≤151 días (~5 meses); 1 de cada 10 supera 333 días. **Caveat:** es plazo **contratado**, no ejecución real.

### 3.4 Estacionalidad · `estacionalidad`

**Pregunta:** ¿en qué meses se mueve la contratación? **Fuente:** `contratos`, mes de `fecha_firma`. **Consulta:** `estacionalidad_kpis.sql`, `estacionalidad_mes.sql`. **Solo años completos 2022–2025** (excluye 2026 parcial).

| KPI | Fórmula |
|---|---|
| % contratos enero | `Σ(contratos mes=1) / Σ(contratos)` |
| % valor diciembre | `Σ(valor mes=12) / Σ(valor)` |
| Ratio enero vs. promedio | `contratos(enero) / (Σ(contratos) / 12)` |
| % contratos Q1 | `Σ(contratos mes≤3) / Σ(contratos)` |

**Hallazgo:** enero concentra ~19,4 % de los contratos (2,3× un mes promedio) por las firmas de inicio de vigencia (prestación de servicios); diciembre firma pocos contratos pero el mayor **valor** del año. **Caveat:** es un fenómeno administrativo del calendario presupuestal, no una señal en sí.

### 3.5 Financiación · `financiacion`

**Pregunta:** ¿con qué dinero se contrata? **Fuente:** columnas `recursos_pgn`, `recursos_propios`, `recursos_sgp`, `recursos_regalias`. **Consulta:** `financiacion_kpis.sql`, `financiacion_fuente.sql`.

Suma por bolsa (con `SAFE_CAST … FLOAT64` por robustez). `valor_con_fuente` suma las 4 bolsas con `COALESCE(…, 0)` **por término** (para que un NULL en una columna no anule la fila). `pct_con_fuente = valor_con_fuente / SUM(valor)`.

**Cobertura clave:** las 4 bolsas suman ~$367 billones ≈ **63 %** del valor total (~$585 B). El resto no trae fuente atribuida. **La sección opera sobre el monto con fuente, no sobre el total.** **Caveat:** las bolsas no son excluyentes — un contrato puede combinar varias.

### 3.6 ¿En qué creció? · `crecimiento`

**Pregunta:** ¿en qué creció y se redujo la contratación 2023→2025? **Fuente:** `_contratos_pub`. **Consulta:** `crecimiento_kpis.sql`, `crecimiento_sector.sql`. **Compara 2023 con 2025** (omite 2022 por baja cobertura y 2026 por parcial).

`var_pct = (valor_2025 − valor_2023) / valor_2023 × 100` (variación **nominal**, sin ajuste por inflación). **Filtros de elegibilidad anti-distorsión:**

1. **`n_2023 ≥ 300` y `n_2025 ≥ 300`** — solo sectores con volumen real en ambos años.
2. **`max_top1_share < 0.5`** — el mayor contrato del sector debe pesar menos del 50 % del valor del sector; descarta "alzas" falsas causadas por **un único contrato** de cuantía extrema.

La serie muestra los 8 sectores de mayor alza y los 4 de mayor caída (gráfico divergente). **Hallazgo:** de ~31 sectores comparables, 6 se redujeron; Aseo fue la mayor alza (+140 %), Arrendamiento la mayor caída (−31 %). **Caveat:** variación nominal; no implica irregularidad.

---

## 4. Las 11 señales (cruces neutrales)

Las señales son **conteos de coincidencias factuales** entre registros públicos, servidos como **agregados nacionales** (sin nombres, sin NITs, sin perfiles) en `/senal/:key`. Lógica en `_build_senales_extra()` de [`data/materialize_public.py`](../data/materialize_public.py); textos en [`src/lib/senales.ts`](../src/lib/senales.ts).

> **Ninguna señal es acusatoria.** Cada una mide una coincidencia que **merece verificación caso por caso** y tiene explicaciones legítimas. Una coincidencia **no** es una irregularidad. Lee [Los cruces](08-Los-Cruces.md) para el porqué.

Las señales usan la tabla **cruda** `contratos` (necesitan columnas fuera de la base, como `fecha_prorroga`, `doc_supervisor`, `entidad_municipio`); el ~0,3 % de duplicados es marginal para estos agregados. Ventana común 2022–2026, `valor > 0`.

### Grupo ¿Cómo? — magnitud de figuras contractuales

| Señal | Qué cuenta | Lógica y umbral | Fuente |
|---|---|---|---|
| **`adiciones`** | Contratos con prórroga y su valor | `fecha_prorroga IS NOT NULL`. Sin umbral. | `contratos` |
| **`contratos_no_planeados`** | Entidades-año que contrataron > 20 % sobre su PAA | Suma PAA por entidad-año (`valor_total_esperado`) vs. suma contratado; casos con `contratado > 1.2 × planeado` | `paa` + `contratos` |
| **`brechas_bpin`** | Proyectos de inversión poco ejecutados | BPIN con `valor_vigente ≥ $1.000M` y `pagado/vigente < 0.30`; brecha = `vigente − pagado` | `bpin_ejecucion` |

**Notas.** `contratos_no_planeados` **requiere PAA publicado** (solo 2024–2026): una entidad sin PAA **no** aparece (no se asume incumplimiento). `brechas_bpin` es presupuesto **vigente**; una ejecución baja a mitad de vigencia es esperable.

### Grupo ¿Hay señales? — coincidencias que merecen mirada

| Señal | Qué cuenta | Lógica y umbral | Fuente |
|---|---|---|---|
| **`prorroga_sin_ejecucion`** | Contratos prorrogados con pago bajo | `fecha_prorroga IS NOT NULL` **y** `valor_pagado/valor < 0.30` **y** firmado hace `≥ 12 meses` | `contratos` |
| **`monopolio_municipal`** | Municipios con un contratista dominante | Por municipio-contratista: `share ≥ 50 %` del valor **y** el municipio tiene entre **30 y 5.000** contratos | `contratos` |
| **`supervisor_contratista`** | Personas que supervisan y contratan con la misma entidad | `doc_supervisor` (≥2 contratos) **=** `contratista_nit` (≥2) **en la misma entidad** | `contratos` |
| **`puerta_giratoria`** | Servidores SIGEP que contratan con su entidad | `sigep_servidores.numero_documento = contratista_nit` **y** entidad normalizada coincide | `sigep_servidores` + `contratos` |
| **`redes_relaciones`** | Empresas que comparten representante legal | Contratistas cuyo NIT está en una relación `REPRESENTANTE_COMPARTIDO` | `relaciones` + `contratos` |
| **`sancionado_otro_depto`** | Sancionados que contratan en otro departamento | `sanciones.sancionado_nit = contratista_nit` **y** depto. entidad **≠** depto. sanción **y** contrato **posterior** a la sanción | `sanciones` + `contratos` |
| **`donante_post_eleccion`** | Donantes que contratan tras la elección | `campanas.nit_aportante = contratista_nit` **y** `fecha_firma > 1-ene del año siguiente` a la elección | `campanas` + `contratos` |
| **`cluster_electoral`** | Campañas con varios aportantes que contratan | Por candidato: `≥ 3` aportantes distintos **y** `≥ 2` de ellos también contratistas. Cuenta campañas y aportantes (no valor) | `campanas` + `contratos` |

**Por qué cada umbral.** Los umbrales existen para **reducir ruido**, no para señalar culpables:
- *Monopolio:* el rango 30–5.000 contratos excluye municipios diminutos (donde un proveedor único es trivial) y los enormes (donde el 50 % sería improbable sin ser noticia conocida).
- *Supervisor/contratista:* exigir ≥2 de cada rol evita coincidencias de un solo contrato (más propensas a homonimia o error).
- *Sancionado/donante:* la condición **temporal** (contrato posterior a la sanción / posterior a la elección) hace el cruce más conservador que un simple "aparece en ambas listas".
- *Cluster electoral:* **no muestra valor** para evitar doble conteo entre campañas; no nombra candidatos ni partidos.

**Caveat común a todas:** son **coincidencias exactas de identificador** (NIT o documento). No verifican identidad real, simultaneidad temporal fina, ni descartan homónimos. Describen, no prueban. Ver [Los cruces](08-Los-Cruces.md) y [Caveats](09-Caveats-Y-Limites.md).

---

## 5. Tabla maestra de umbrales

Todos los números "mágicos" del proyecto, en un solo lugar. Si cambias uno en tu [fork](04-Hacer-Un-Fork.md), aquí sabes qué afecta.

| Umbral | Valor | Dónde aplica |
|---|---|---|
| Ventana temporal | 2022-01-01 → 2026-12-31 | Toda la base |
| Valor mínimo | `valor > 0` | Toda la base |
| Dedup | última versión por `id` | Toda la base |
| Plazo de duración válido | [1, 3650] días | `duracion` |
| Sobre-ejecución del PAA | contratado > 1,2 × planeado | `contratos_no_planeados` |
| Brecha BPIN | vigente ≥ $1.000M y pagado/vigente < 30 % | `brechas_bpin` |
| Pago bajo (prórroga) | pagado/valor < 30 % y ≥ 12 meses | `prorroga_sin_ejecucion` |
| Dominancia municipal | share ≥ 50 %, municipio 30–5.000 contratos | `monopolio_municipal` |
| Rol doble (supervisor) | ≥ 2 contratos en cada rol, misma entidad | `supervisor_contratista` |
| Cluster electoral | ≥ 3 aportantes, ≥ 2 contratan | `cluster_electoral` |
| Crecimiento: volumen | ≥ 300 contratos en 2023 y 2025 | `crecimiento` |
| Crecimiento: anti-outlier | mayor contrato < 50 % del valor del sector | `crecimiento` |
| N mínimo por sector (¿Quién?) | ≥ 20 contratos | `quien_sector` |

---

## 6. Cómo verificar o reproducir un número

1. **Identifica la consulta.** Cada KPI de arriba cita su `.sql` o la función de `materialize_public.py`.
2. **Léela.** Está en [`data/queries/`](../data/queries) o en [`data/materialize_public.py`](../data/materialize_public.py). El SQL es legible y comentado.
3. **Córrela.** Con credenciales de BigQuery: `python data/materialize_public.py` regenera todos los JSON. Sin credenciales, los tests puros (`shape_*`) corren con fixtures: `npm run test` en `data/`.
4. **Compara.** El snapshot vive versionado en `public/data/*.json`. Puedes abrir el JSON y ver el número exacto que pinta el dashboard.
5. **Cámbialo.** Ajusta un umbral, regenera, redespliega. Es un [fork](04-Hacer-Un-Fork.md) de un comando.

> **Reproducibilidad total.** Mismo código + mismo snapshot = mismos números. No hay aleatoriedad ni estado oculto. Si un número no te cuadra, el SQL te dice exactamente por qué da lo que da.

---

## Para seguir

- **[Metodología](03-Metodologia.md)** — la filosofía: qué calculamos y qué NO.
- **[Los cruces](08-Los-Cruces.md)** — por qué las señales no son acusatorias.
- **[Auditoría de datos](06-Auditoria-De-Datos.md)** — el control de calidad de las cifras.
- **[Caveats](09-Caveats-Y-Limites.md)** — los límites reales, sin letra pequeña.
- **[Las fuentes](01-Fuentes.md)** — de dónde sale cada tabla.
