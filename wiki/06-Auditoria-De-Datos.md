# Auditoría de datos (veracidad)

Un observatorio de datos públicos solo vale si los números son **verídicos**. Esta página documenta, sin atajos, la auditoría de calidad que se hizo al snapshot 2022–2026: qué se revisó, qué problemas se encontraron en la fuente, cómo se corrigieron y —sobre todo— el **blindaje permanente** que impide que un número inventado o roto vuelva a publicarse. Todo es **reproducible** con el script [`data/verify_snapshot.py`](../data/verify_snapshot.py).

El principio que gobierna esta página es el mismo que el del proyecto entero: **describe, no juzga**. La auditoría no busca acusar a nadie; busca que cada cifra del dashboard reconcilie exactamente con la fuente y que ninguna esté maquillada.

---

## 1. Resumen ejecutivo

Se auditó la integridad de los datos en seis frentes: **duplicados**, **valores atípicos**, **cobertura de campos**, **mapeo geográfico**, **fragmentación de etiquetas** y **consistencia entre secciones** (incluyendo los cruces entre fuentes). Cada problema encontrado se corrigió en la capa de materialización (SQL + Python), nunca alterando el dato crudo. Tras las correcciones, el snapshot publicado **reconcilia exactamente** con la fuente deduplicada.

| Dimensión auditada | Resultado |
|---|---|
| Duplicados por `id` de contrato | ✅ Corregido (deduplicación por versión más reciente) |
| Cobertura del mapa (geografía) | ✅ ~58 % → **~95 %** del valor (recuperó ~42 % por tildes) |
| Sensibilidad a valores atípicos | ✅ Mitigada (se publica la **mediana** junto al total) |
| Etiqueta "sector" | ✅ Corregida a **"categoría de objeto"** |
| Nombre de entidad por NIT | ✅ Nombre **más frecuente** (no uno regional arbitrario) |
| Partidos políticos fragmentados | ✅ Normalizados (clave sin acentos, una fila por colectividad) |
| PAA: modalidad faltante | ✅ Rotulada **"No especificada"** (no "Otras") |
| Fan-out en cruces entre fuentes | ✅ Bloqueado (guardia de sentido: ninguna señal supera el universo) |
| Reconciliación JSON ↔ BigQuery | ✅ **Exacta** (86 verificaciones independientes) |
| Fuente del núcleo de contratación | ✅ 100 % SECOP II |

> **Lectura clave:** las correcciones no cambian "qué dice la fuente", cambian "cómo se agrega y se etiqueta la fuente" para que el resultado sea fiel. El dato crudo de SECOP II, BPIN, SIRI, CNE y el PAA se respeta tal cual.

---

## 2. Cifras de cobertura (ventana 2022–2026)

La ventana de análisis es `fecha_firma BETWEEN '2022-01-01' AND '2026-12-31'` con `valor > 0`. Estas son las magnitudes del universo auditado, leídas del snapshot publicado:

| Métrica | Valor |
|---|---|
| Contratos publicados (deduplicados, valor > 0) | **3.969.440** |
| Valor total contratado | **~$583,8 billones COP** (`583.796.373.548.818`) |
| Valor mediano de contrato | **~$20,06 millones COP** (`20.057.022`) |
| Entidades únicas (por NIT) | **~4.690** |
| Contratistas únicos (por NIT) | **~954.767** |
| Contratación directa (por nº de contratos) | **78,3 %** |
| Contratación directa (por valor) | **45,3 %** |
| Concentración top-10 contratistas (por valor) | **7,0 %** |

**Cobertura de campos** (no nulos en la ventana): `objeto_clasificado` ≈ 97 %, `modalidad` ≈ 100 %, nivel de gobierno (orden) ≈ 83 %, `departamento` ≈ 96 %. No hay fechas de firma nulas dentro de la ventana; los ~1,2 millones de contratos anteriores a 2022 quedan **fuera** de la ventana de forma intencional (correcto: la serie arranca en 2022).

**Otras fuentes del snapshot** (no SECOP II — cada una con su propia tabla y deduplicación):

| Fuente | Magnitud publicada |
|---|---|
| PAA — Plan Anual de Adquisiciones | **$58,6 billones** planeados (155.353 ítems, 644 entidades) |
| BPIN — inversión pública (DNP) | **$424,8 billones** vigentes · **34 %** ejecutado (104.695 proyectos) |
| Sanciones — SIRI (Procuraduría) | **13.441** sancionados |
| Aportes a campañas — Cuentas Claras (CNE) | **$1,34 billones** aportados |
| Ejecución (factura/pago SECOP) | **$190,7 B** facturado · **$154,5 B** pagado (**26,5 %** pagado) |

---

## 3. Historia de calidad: problemas encontrados y corregidos

Cada uno de estos hallazgos es un caso real detectado al comparar el snapshot contra la fuente cruda. Se documenta el síntoma, la causa raíz y la corrección exacta. **Ningún dato de la fuente fue alterado ni borrado**: las correcciones viven en las consultas de agregación.

### 3.1 Duplicados por identificador de contrato

**Síntoma.** `COUNT(*)` y `SUM(valor)` contaban algunos contratos dos veces. La fuente trae filas con el mismo `id` repetido (del orden de ~0,3 % de las filas crudas), por contratos ingeridos o versionados más de una vez.

**Causa.** SECOP II versiona registros: la misma `id` puede aparecer con varias `ultima_actualizacion`.

**Corrección.** Toda agregación parte de una **base deduplicada por `id`**, conservando la versión más reciente:

```sql
QUALIFY ROW_NUMBER() OVER (
  PARTITION BY id ORDER BY ultima_actualizacion DESC
) = 1
```

El conteo final (`3.969.440`) coincide **exactamente** con los `id` únicos de la fuente cruda — esa igualdad es una de las verificaciones independientes (ver §5).

### 3.2 El mapa perdía ~42 % del valor por una tilde

**Síntoma.** El mayor valor crudo de `entidad_departamento` —**"Distrito Capital de Bogotá"**, del orden de **$224 billones** y cerca de un millón de contratos— **no aparecía en el mapa**. La cobertura geográfica se quedaba en ~58 % del valor.

**Causa.** La normalización a código DANE comparaba contra la cadena `'distrito capital de bogota'` (sin tilde), pero el dato traía **"Bogotá" con tilde**. La comparación fallaba y el departamento quedaba sin código.

**Corrección.** La normalización ahora **quita acentos y unifica mayúsculas** antes de comparar, usando descomposición Unicode:

```sql
REGEXP_REPLACE(NORMALIZE(UPPER(TRIM(entidad_departamento)), NFD), r'[\pM.]', '')
```

`NORMALIZE(..., NFD)` separa la letra de su tilde y `\pM` (marcas de combinación) elimina la tilde; así "Bogotá" y "BOGOTA" colapsan a la misma clave. Se añadieron además variantes de escritura. **Resultado: cobertura del mapa ~58 % → ~95 % del valor**, con Bogotá incluida. Recuperó del orden del **42 % del valor** que antes se perdía.

### 3.3 Valores atípicos extremos (posibles errores de la fuente)

**Síntoma.** El contrato de mayor valor declara del orden de **$5,5 billones COP** por "apoyo técnico"; aparecen casos imposibles (una Personería municipal por billones, una cancha de fútbol por cifras absurdas). Un puñado de contratos de cuantía extrema concentra una fracción desproporcionada del valor total, y algunos son claramente errores de digitación de la fuente.

**Decisión (veracidad por encima de estética).** **No se altera ni se borra** ningún dato de la fuente — borrar sería editar la realidad declarada. En cambio:

1. Se publica el **valor mediano** (~$20,06 M), **robusto** a los extremos, junto al total.
2. El "tamaño típico de contrato" se reporta con **cuantiles** (p25 / mediana / p75), exigiendo `N ≥ 20` por grupo para que sean estables.
3. Se incluye una **nota explícita** en la app:

   > *"El valor total es sensible a unos pocos contratos de cuantía extrema (que pueden incluir errores de digitación en la fuente); por eso se muestra también el valor mediano, robusto a esos casos."*

4. El cálculo de **crecimiento por sector** descarta alzas falsas: solo entran sectores cuyo mayor contrato del año pesa **< 50 %** del valor del sector (ver §3.8).

### 3.4 "Sector" era en realidad "categoría de objeto"

**Síntoma.** El dashboard mostraba `objeto_clasificado` (la categoría de lo contratado: SALUD, CONSULTORÍA…) bajo la etiqueta "sector". Existe además una columna `sector` institucional, distinta y peor poblada.

**Corrección.** Se renombró la etiqueta a **"categoría de objeto"** para que sea fiel a lo que mide. Se conserva `objeto_clasificado` por su mejor cobertura. La etiqueta legible (`objeto_label`) normaliza el primer segmento del texto a categorías canónicas; la cola cae a un `INITCAP` limpio. Una verificación mide cuánto **valor** queda fuera de las ~33 categorías canónicas y alerta si supera el 8 %.

### 3.5 El nombre de la entidad por NIT era arbitrario (caso ICBF)

**Síntoma.** Una entidad nacional (ICBF, INVÍAS…) firma bajo **un solo NIT** pero con decenas de nombres regionales. Al agrupar por NIT, el nombre mostrado podía ser uno cualquiera — p. ej. *"ICBF Regional Caquetá"* representando a todo el ICBF.

**Corrección.** Se muestra el nombre **más frecuente** por NIT con `APPROX_TOP_COUNT`, no uno arbitrario:

```sql
APPROX_TOP_COUNT(entidad_nombre, 1)[OFFSET(0)].value AS nombre
```

Así "ICBF Sede Nacional" (el nombre más usado) representa al NIT consolidado, y el ranking de "quién contrata" no fragmenta ni desfigura a las entidades nacionales.

### 3.6 Partidos políticos fragmentados (Cuentas Claras / CNE)

**Síntoma.** El campo `partido` llega muy sucio: la misma colectividad aparece en varias grafías ("PARTIDO CENTRO DEMOCRÁTICO" vs "PARTIDO CENTRO DEMOCRATICO"), con tildes inconsistentes, bytes corruptos y sufijos de lista o cámara. El mismo partido se **fragmentaba** en varias barras del gráfico, repartiendo su monto.

**Corrección.** Se construye una **clave normalizada** (mayúsculas, sin acentos vía `NORMALIZE NFD`, sin bytes no-ASCII) que colapsa las variantes a una sola colectividad. La etiqueta visible es la variante cruda **más representativa**, elegida de forma determinística:

```sql
ORDER BY CONTAINS_SUBSTR(partido_raw, '<corrupto>'),  -- 1º sin carácter corrupto
         CONTAINS_SUBSTR(partido_raw, ' - '),         -- 2º sin sufijo de lista/cámara
         COUNT(*) DESC,                                -- 3º la más frecuente
         partido_raw                                   -- 4º alfabético (determinístico)
```

Resultado: **una fila por partido**, con su monto total consolidado y sin duplicados.

### 3.7 PAA: "Otras" → "No especificada"

**Síntoma.** En el Plan Anual de Adquisiciones, el grueso de los ítems **no declara modalidad** (del orden del 39 % del valor). Etiquetar ese vacío como "Otras" inducía a leerlo como si fuera una modalidad real residual.

**Corrección.** Cuando la modalidad es nula o vacía en el PAA, se rotula **"No especificada"** (no "Otras"), dejando claro que es un **dato faltante**, no una categoría de selección:

```sql
WHEN modalidad IS NULL OR TRIM(modalidad) = '' THEN 'No especificada'
```

### 3.8 Fan-out de cruces que daba valores mayores al universo

**Síntoma.** Algunos cruces entre fuentes (donantes×contratos, sancionados×contratos, redes de relaciones) producían, por un `JOIN` mal acotado, **sumas de valor superiores al valor total contratado** — un imposible aritmético, síntoma clásico de *fan-out* (un registro se multiplica al unirse con varias filas).

**Corrección.** Se reformularon los cruces para contar cada contrato una sola vez, y se añadió una **guardia de sentido permanente**: ningún valor de una señal cruzada puede superar el universo total contratado. Si lo hiciera, la verificación falla (ver §4 y §5).

---

## 4. El blindaje: `verify_snapshot.py`

El script [`data/verify_snapshot.py`](../data/verify_snapshot.py) es la pieza central del rigor. No es un test que repite las consultas del materializador (eso solo probaría que el código es consistente consigo mismo). **Re-deriva cada número de forma independiente** —con formulaciones distintas o leyendo la tabla cruda— y lo compara contra `public/data/*.json`. Si el snapshot tuviera un número inventado o mal agregado, el script lo cazaría.

### 4.1 Cómo funciona

1. **Construye una base de verificación slim** (12 columnas) deduplicada por `id` con una formulación propia, **independiente** del materializador.
2. **Re-deriva los KPIs** desde esa base o desde la tabla cruda y los compara contra el JSON con tolerancias explícitas (`_close`: relativa `1e-6`, absoluta configurable; conteos con tolerancia 0).
3. **Corre chequeos de coherencia interna** del snapshot **sin tocar BigQuery** (sumas, monotonías, rangos).
4. **Aplica guardias estructurales** anti-fragmentación y de sentido.
5. **Borra la base de verificación** al final (`DROP TABLE`) para no dejar costo ni residuo.

El reporte final imprime una tabla `MÉTRICA | SNAPSHOT | BIGQUERY | ESTADO` y termina en **`✅ TODO RECONCILIA`** o **`⚠️ N DESAJUSTE(S)`**, con código de salida `0`/`1` apto para CI.

### 4.2 Las ~86 reconciliaciones independientes

El script ejecuta del orden de **86 verificaciones**, agrupadas así:

| Bloque | Qué re-deriva de forma independiente |
|---|---|
| **Integridad de dedup** | Filas crudas, `id` únicos y duplicados eliminados (sobre la tabla cruda) |
| **Panorama** | `contratos`, `valor_total`, `valor_mediano`, `entidades`, `contratistas` — y que `contratos == ids únicos crudos` |
| **Cómo (modalidad)** | `pct_directa` re-calculado vía `LIKE '%DIRECTA%'`; Σ contratos por modalidad == panorama; Σ porcentajes ≈ 100 |
| **Ejecución** | `contratado`, `facturado`, `pagado`, `% facturado`, `% pagado` |
| **PYME** | `% contratos pyme`, `% valor pyme`, `valor total pyme` |
| **Financiación** | Bolsas `pgn`, `propios`, `sgp`, `regalías` desde la base |
| **Concentración** | top-10 % del valor y nº de contratistas (re-rankeado desde cero) |
| **Género** | `% contratos mujer`, `% valor mujer` (desde la tabla cruda) |
| **Señales** | Adiciones (contratos y valor) y monopolio municipal (municipios) |
| **Coherencia interna** | Σ por año == KPI; Σ bolsas ≈ valor con fuente; percentiles monótonos; `donante.nits ≤ total_contratistas`; `p25 ≤ mediana ≤ p75 ≤ p90`; **todos los campos `*pct` en [0,100]** (excepto `var_pct`, que es una variación) |
| **`--full`** | KPIs de inversión, planeación, sanciones, electoral y procesos re-ejecutando la query real; las 11 señales cruzadas; vigencias BPIN; valor en categorías no canónicas |

### 4.3 Guardias estructurales (blindaje permanente)

Más allá de comparar números, el script impone **invariantes** que cualquier snapshot futuro debe cumplir. Son la defensa contra los errores del §3 que *vuelvan a ocurrir*:

- **Anti-fragmentación.** Ningún array de una sola dimensión categórica puede tener **etiquetas repetidas**. Esta es la red de seguridad directa contra el caso "partidos" sin normalizar: si una colectividad volviera a fragmentarse en dos filas, la verificación falla. Recorre `panorama`, `quien`, `como`, `donde`, `procesos`, `planeacion`, `inversion`, `ejecucion`, `sanciones`, `electoral`, `cruces` y `kpis_extra`.

- **Guardia de sentido (anti fan-out).** Ningún valor de una señal cruzada puede superar el **universo total contratado**. Esta es la red contra el §3.8: si un `JOIN` volviera a multiplicar valor, el chequeo `senal.<x>.valor ≤ universo` falla. (`brechas_bpin` se exime por ser de otra fuente.)

- **Coherencias obligatorias de negocio.** `facturado ≤ contratado` y `pagado ≤ contratado`; en inversión `pagado ≤ vigente` y `pct_ejecucion ∈ [0,1]`; top de entidades en orden descendente; Σ modalidades del PAA y de "Cómo" ≈ 100 %.

> Estas guardias convierten la auditoría en algo **vivo**: no es un informe que se firmó una vez, es un portón que se cruza en cada regeneración del snapshot.

---

## 5. Reconciliación

Tras las correcciones, el snapshot publicado coincide **exactamente** con la fuente deduplicada. Ejemplos de igualdades exactas que el script comprueba:

- `panorama.contratos` = `COUNT` de la base deduplicada = **3.969.440** = `ids` únicos crudos.
- `panorama.valor_total` = `SUM(valor)` de la base = **$583.796.373.548.818** (≈ $583,8 billones).
- `Σ panorama.por_anio.contratos` = total nacional (consistencia interna). ✅
- `pct_directa` coincide entre las secciones *Cómo* y *Señales* (78,3 % por nº de contratos). ✅
- Cruces: `donante.nits ≤ total_contratistas` (27.488 ≤ 954.767). ✅

---

## 6. ¿Los números reflejan la realidad?

- **Sí, con transparencia.** El dashboard mide **valor de contratos firmados de SECOP II**, no el gasto público total: no incluye SECOP I, ni adiciones, ni ejecución, ni regímenes que no publican en SECOP II. Por eso el total **subestima** el gasto público real, y así se documenta en *Acerca* y en [Caveats y límites](09-Caveats-Y-Limites.md).
- La **mediana (~$20,06 M)** y los **percentiles** describen mejor el contrato típico que el promedio, sesgado por los outliers.
- La **concentración** (top-10 = 7,0 % del valor) y el **% de contratación directa** (78,3 % por contratos, 45,3 % por valor) son **hechos estadísticos descriptivos**, sin juicio.
- Las **cifras de otras fuentes** (PAA $58,6 B, BPIN $424,8 B / 34 % ejecutado, SIRI 13.441 sancionados, CNE $1,34 B) provienen de tablas distintas, cada una deduplicada por su propia clave; los **cruces** entre ellas se publican como conteos neutrales, nunca como acusaciones.

---

## 7. KPIs nuevos y su control de calidad

El snapshot fue ampliado con indicadores adicionales; cada uno hereda las mismas reglas de auditoría (dedup, robustez a outliers, guardias):

| KPI nuevo | Qué describe | Salvaguarda de calidad |
|---|---|---|
| **Cadena BPIN (4 estados)** | Vigente → comprometido → obligado → pagado por vigencia | Monotonía y exención de la guardia de sentido (otra fuente) |
| **Tamaño típico de contrato** | p25 / mediana / p75 del valor por dimensión | `N ≥ 20` por grupo; robusto a extremos |
| **Distribución de pago** | % facturado / % pagado y cobertura de factura/pago | `facturado ≤ contratado`, `pagado ≤ contratado` |
| **HHI por sector** | Concentración de proveedores (0–10.000, estándar de competencia) | Solo sectores con **≥ 50 proveedores** |
| **Antigüedad del contratista** | Madurez del proveedor al firmar (vía RUES) | Solo registros con fecha de constitución válida |
| **Multas SECOP** | Panorama factual de multas y cruce neutral por NIT | Conteos puros, sin scoring |
| **Per cápita por departamento** | Valor y contratos por habitante (catálogo DANE 2023 embebido) | Catálogo de población estático y trazable |
| **Reincidencia / puerta giratoria / redes** | Señales cruzadas entre fuentes | **Guardia de sentido** (valor ≤ universo) |
| **Fidelidad PAA** | Qué tanto el plan anticipa lo contratado | Misma deduplicación de dos pasos que el PAA |

El número de **sectores comparables** en la sección de crecimiento es **30** (sectores con ≥ 300 contratos en 2023 y 2025, y cuyo mayor contrato pesa < 50 % del valor del sector).

---

## 8. Caveats que se mantienen (documentados en la app)

La honestidad incluye lo que **no** se puede arreglar limpiando datos:

- **2026 es parcial** (hasta el corte de datos, jun-2026).
- **2022 (primer semestre)** tiene cobertura baja en SECOP II frente al resto de la serie.
- **~5 % de contratos** no tienen departamento reconocible y no se mapean.
- El **valor total** es sensible a contratos de cuantía extrema que pueden incluir errores de digitación de la fuente (por eso se publica la mediana).
- Las cifras son **nominales** (no ajustadas por inflación); el crecimiento por sector también.

Ver el detalle completo en [Caveats y límites](09-Caveats-Y-Limites.md).

---

## 9. Validación en tiempo de ejecución (Zod)

Además de la auditoría en BigQuery, el frontend valida la **forma** de cada JSON al cargarlo, con esquemas [Zod](https://zod.dev) en [`src/lib/schemas.ts`](../src/lib/schemas.ts). Si un archivo del snapshot llegara con un campo faltante, un tipo equivocado o un `null` donde no toca, la app lo detecta en runtime en vez de renderizar un número roto. Es la última línea de defensa, complementaria a `verify_snapshot.py` (que valida los **valores**) y a las guardias estructurales (que validan la **coherencia**).

---

## 10. Reproducir esta auditoría

Cualquiera con acceso a una tabla `contratos` equivalente puede regenerar el snapshot y verificar los números:

```bash
# 1) Regenerar el snapshot desde BigQuery
python data/materialize_public.py

# 2) Reconciliar el snapshot contra BigQuery (86 verificaciones independientes)
python data/verify_snapshot.py          # núcleo de contratación
python data/verify_snapshot.py --full   # + otras fuentes y 11 señales cruzadas
```

- Las **45 consultas de agregación** están en [`data/queries/`](../data/queries) (una por panel/KPI, comentadas).
- La **lógica de limpieza** (deduplicación, normalización DANE, etiquetas) vive en [`data/materialize_public.py`](../data/materialize_public.py).
- El **blindaje** vive en [`data/verify_snapshot.py`](../data/verify_snapshot.py).

Ver también [Hacer un fork](04-Hacer-Un-Fork.md), [Datos y materialización](02-Datos-y-Materializacion.md) y [Cómo se calcula todo](13-Como-Se-Calcula-Todo.md).
