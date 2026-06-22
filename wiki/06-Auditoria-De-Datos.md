# Auditoría de datos (veracidad)

Un observatorio de datos públicos solo vale si los números son **verídicos**. Esta página documenta la auditoría que se hizo al snapshot 2022–2026, con evidencia real consultada en BigQuery, los problemas encontrados y cómo se corrigieron. Es reproducible.

## Resumen

Se auditó integridad, duplicados, valores atípicos, cobertura de campos, mapeo geográfico y consistencia entre secciones. Se encontraron y corrigieron **cuatro problemas**; tras las correcciones, las cifras del dashboard **reconcilian exactamente** con la fuente deduplicada.

| Dimensión | Resultado |
|---|---|
| Duplicados por `id` | ✅ Corregido (deduplicación) |
| Cobertura del mapa | ✅ 58 % → **95 %** del valor |
| Sensibilidad a outliers | ✅ Mitigada (se añade la mediana) |
| Etiqueta "sector" | ✅ Corregida a "categoría de objeto" |
| Reconciliación JSON ↔ BigQuery | ✅ Exacta |
| Fuente | ✅ 100 % SECOP II |

## Cifras de cobertura (ventana 2022–2026)

- **Filas en la ventana:** 4.008.690 · **ids únicos:** 3.995.527.
- **Contratos publicados** (valor > 0, deduplicados): **3.969.440**.
- **Valor total:** ~$583,8 billones COP · **valor mediano:** ~$20 millones COP.
- **Entidades únicas:** ~4.690 · **contratistas únicos:** ~954.767.
- Cobertura de campos: `objeto_clasificado` 97,3 % · `modalidad` ≈100 % · `nivel de gobierno (orden)` 83,4 % · `departamento` 95,6 % no nulo.
- Cobertura temporal: 0 fechas nulas; 1.225.778 contratos anteriores a 2022 quedan **fuera** de la ventana (correcto).

## Hallazgos y correcciones

### 1. Duplicados por identificador de contrato
La fuente trae **13.144 filas con `id` repetido** (~0,33 %), por contratos ingeridos o versionados más de una vez. `COUNT(*)` y `SUM(valor)` los contaban dos veces.
**Corrección:** una tabla base deduplicada por `id` (se conserva la última versión según `ultima_actualizacion`); todos los agregados leen de ahí.

### 2. El mapa perdía el 42 % del valor (una tilde)
El mayor valor crudo de `entidad_departamento` era **"Distrito Capital de Bogotá"** ($224 B, ~990 mil contratos) y **no mapeaba**: la normalización comparaba contra `'distrito capital de bogota'` (sin tilde) y el dato traía "Bogotá" con tilde.
**Corrección:** la normalización a código DANE ahora **quita acentos y normaliza mayúsculas** antes de comparar (`REGEXP_REPLACE(NORMALIZE(..., NFD), r'\pM', '')`) y cubre más variantes. Cobertura del mapa: **58 % → 95 %** del valor (Bogotá incluida).

### 3. Valores atípicos extremos (posibles errores de la fuente)
El contrato de mayor valor es de **$5,5 billones COP** por "apoyo técnico"; aparecen casos imposibles (una Personería municipal con $2,1 billones; una cancha de fútbol con ~$1 billón). 385 contratos (>$100 mil M) concentran el **19,6 %** del valor total, e incluyen errores de digitación de la fuente.
**Decisión (veracidad):** **no** se alteran ni se borran datos de la fuente. En cambio se añade el **valor mediano** (~$20 M), robusto a esos casos, junto al total, y una **nota** explícita de que el total es sensible a valores extremos.

### 4. "Sector" era en realidad "categoría de objeto"
El dashboard mostraba `objeto_clasificado` (la categoría del objeto contratado: SALUD, CONSULTORÍA…) con la etiqueta "sector". Existe además una columna `sector` institucional distinta y peor poblada (8,8 % nula vs 2,7 %).
**Corrección:** se renombró la etiqueta a **"categoría de objeto"** para que sea fiel a lo que mide. Se conserva `objeto_clasificado` por su mejor cobertura.

## Reconciliación

Tras las correcciones, el snapshot publicado coincide **exactamente** con la fuente deduplicada:

- `panorama.contratos` = `COUNT` de la base deduplicada = **3.969.440**.
- `panorama.valor_total` = `SUM(valor)` de la base = **$583.796.373.548.818**.
- `suma(por_anio)` = total nacional (consistencia interna). ✅
- `pct_directa` coincide entre las secciones *Cómo* y *Señales*. ✅

## ¿Los números reflejan la realidad?

- **Sí, con transparencia.** El dashboard mide **valor de contratos firmados de SECOP II**, no el gasto público total: no incluye SECOP I, ni adiciones, ni ejecución, ni contratación de regímenes que no publican en SECOP II. Por eso el total **subestima** el gasto público real, y así se documenta en *Acerca*.
- La **mediana (~$20 M)** y los **percentiles** describen mejor el contrato típico que el promedio, sesgado por los outliers.
- La **concentración** (top-10 = 7 % del valor) y el **% de contratación directa** (78 %) son hechos estadísticos descriptivos, sin juicio.

## Caveats que se mantienen (documentados en la app)

- **2026 es parcial** (hasta la fecha de corte).
- **2022 (primer semestre)** tiene cobertura baja en SECOP II.
- **~5 % de contratos** no tienen departamento reconocible y no se mapean.
- El **valor total** es sensible a contratos de cuantía extrema que pueden incluir errores de la fuente.

## Reproducir esta auditoría

Las consultas de agregación están en [`data/queries/`](../data/queries) y la lógica de limpieza (deduplicación, normalización DANE) en [`data/materialize_public.py`](../data/materialize_public.py). Cualquiera con acceso a una tabla `contratos` equivalente puede regenerar el snapshot y verificar los números (ver [Hacer un fork](04-Hacer-Un-Fork.md)).
