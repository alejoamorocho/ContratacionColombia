# De dónde vienen los datos

VECTORVI es un **laboratorio de datos abiertos**: no genera información propia, sino que lee, deduplica y normaliza datos publicados oficialmente por el Estado colombiano. Esta página describe cada fuente, qué aporta, hasta dónde llega en el tiempo y qué salvedades hay que tener en cuenta al leerla.

El principio es siempre el mismo: **describe, no juzga**. Ningún dato aquí es acusatorio; son agregados estadísticos sobre información ya pública.

## Resumen de fuentes

| Fuente | Entidad responsable | Qué aporta al dashboard | Cobertura temporal |
|--------|---------------------|-------------------------|--------------------|
| **SECOP II — Contratos** | Colombia Compra Eficiente | Contratos firmados: valor, entidad, contratista, modalidad, objeto, departamento, fechas | 2022–2026 (parcial 2026) |
| **SECOP II — Procesos** | Colombia Compra Eficiente | Procesos de selección y su estado (44% adjudicado) | 2022–2026 (parcial 2026) |
| **SECOP II — PAA** | Colombia Compra Eficiente | Plan Anual de Adquisiciones: lo que las entidades planean comprar ($58,6 B) | **Solo 2024–2026** |
| **BPIN** | DNP (Depto. Nacional de Planeación) | Presupuesto de inversión pública vigente ($424,8 B; 34% ejecutado) | **Presupuesto vigente 2025–2026** |
| **Sanciones SIRI** | Procuraduría General de la Nación | Sanciones disciplinarias e inhabilidades (13.441 registros) | Histórico acumulado |
| **Aportes de campaña — Cuentas Claras** | CNE (Consejo Nacional Electoral) | Financiación electoral declarada ($1,34 B) | **Solo ciclos 2022–2023** |

## SECOP II — el núcleo

El **SECOP II** (Sistema Electrónico de Contratación Pública) de Colombia Compra Eficiente es el registro oficial de la contratación del Estado colombiano, publicado como datos abiertos. Es la fuente principal del observatorio y de él se usan tres conjuntos: contratos, procesos y PAA.

### Contratos

El contrato firmado entre una entidad pública y un contratista. Es la columna vertebral del dashboard. Tras deduplicar por `id`, abarca:

- **3.969.440 contratos**
- **$583,8 B** en valor total
- **mediana de $20M** (se prefiere la mediana a la media porque hay outliers extremos)
- **4.690 entidades** contratantes
- **954.767 contratistas**
- **78,4%** corresponde a contratación directa

Columnas que se materializan de la tabla de contratos:

| Columna | Uso |
|---------|-----|
| `valor` / `valor_total` | Montos (suma, mediana, percentiles) |
| `fecha_firma` | Define el año del contrato |
| `entidad_nit`, `entidad_nombre` | Entidad contratante |
| `contratista_nit` | Contratista (únicos, concentración) |
| `modalidad` | Modalidad (se normaliza a 7 categorías) |
| `objeto_clasificado` | Categoría de objeto (etiquetas legibles) |
| `orden` | Nivel de gobierno |
| `entidad_departamento` | Departamento (se normaliza a código DANE) |
| columnas de ejecución | Facturado / pagado, para la sección «¿Se ejecuta?» |

### Procesos

Los procesos de selección (la etapa previa a la firma del contrato) y su estado. De aquí sale el indicador de que **el 44% de los procesos termina adjudicado**, en la sección «¿Cómo contrata?». Importante: los procesos **no traen el número de oferentes**, por lo que la competencia real (cuántos se presentaron a cada proceso) no está disponible.

### PAA — Plan Anual de Adquisiciones

Lo que cada entidad **planea** comprar durante el año, antes de contratar. Alimenta la sección «¿Qué se planea?» con un total planeado de **$58,6 B**. Solo cubre **2024–2026**.

## BPIN — inversión pública

El **BPIN** (Banco de Proyectos de Inversión Nacional) del **DNP** registra los proyectos de inversión pública y su presupuesto. Alimenta la sección «¿En qué se invierte?»:

- **$424,8 B** de presupuesto vigente
- **34% ejecutado**

Es una foto del **presupuesto vigente 2025–2026**, no una serie histórica de inversión.

## Sanciones SIRI — Procuraduría

El **SIRI** (Sistema de Información de Registro de Sanciones e Inhabilidades) de la **Procuraduría General de la Nación** registra sanciones disciplinarias e inhabilidades. Aporta **13.441 registros** a la sección «¿Hay señales?» y permite el cruce sancionado↔contratista (1.560 NITs, $6,8 B), descrito en **[Los cruces](08-Los-Cruces.md)**.

## Aportes de campaña — Cuentas Claras (CNE)

La plataforma **Cuentas Claras** del **Consejo Nacional Electoral** publica los aportes declarados a campañas electorales. Aporta **$1,34 B** de financiación electoral a la sección «¿Hay señales?» y habilita el cruce donante↔contratista (27.488 NITs, $28,6 B), descrito en **[Los cruces](08-Los-Cruces.md)**. Solo cubre los **ciclos electorales 2022–2023**.

## La ventana 2022–2026

Todas las cifras del observatorio se enmarcan en **2022–2026**. Esta ventana se eligió por equilibrio entre **cobertura** y **vigencia**:

- Antes de 2022, la cobertura de SECOP II es irregular y SECOP I (la versión anterior) **no se ingesta**, por lo que mezclar periodos distorsionaría las comparaciones.
- 2022–2026 da cinco años para detectar tendencias sin arrastrar datos heterogéneos de épocas con reglas y plataformas distintas.

Salvedades dentro de la ventana:

- **2026 es parcial:** se va completando a medida que se publican más contratos del año en curso.
- **El primer semestre de 2022** tiene cobertura más baja en SECOP; las cifras de ese periodo deben leerse con esa salvedad.

## Caveats — qué NO miden estos datos

Estas advertencias son esenciales para leer el dashboard sin sobre-interpretarlo:

| Caveat | Implicación |
|--------|-------------|
| `valor_total` **subestima** el gasto público | No incluye SECOP I ni las adiciones a contratos: la cifra real de gasto es mayor que la mostrada. |
| **~5% de contratos sin departamento mapeable** | El mapa de «¿Dónde?» no cubre el 100% del valor; ese 5% queda sin asignar. |
| **2026 parcial** y **2022-H1 baja cobertura** | Los extremos de la serie temporal no son comparables uno a uno con los años completos. |
| **Procesos no trae número de oferentes** | No se puede medir la competencia real (cuántos se presentaron a cada proceso). |
| **Tabla de facturas vacía** | La ejecución (facturado/pagado) se calcula desde columnas de la propia tabla de contratos, no de una tabla de facturas independiente. |
| **PAA solo 2024–2026** | La planeación no cubre toda la ventana; los años 2022–2023 no tienen PAA. |
| **BPIN es presupuesto vigente 2025–2026** | No es una serie histórica de inversión; es una foto del presupuesto actual. |
| **Electoral solo ciclos 2022–2023** | Los aportes de campaña cubren esos ciclos electorales, no toda la ventana. |
| **Outliers de valor extremos** | Posibles errores de la fuente: por eso se muestra la **mediana** ($20M) y no el promedio. |

En general, los datos son **tan buenos como la fuente**: si una entidad reporta tarde o con errores, eso se refleja en el dashboard. El observatorio muestra **agregados**, no contratos individuales, y **no infiere irregularidades**.

## Cómo se procesan

El pipeline (`data/materialize_public.py` + `data/queries/*.sql`) lee BigQuery, **deduplica** por `id` (tabla base), **normaliza** (DANE insensible a tildes, modalidades a 7 categorías, categorías de objeto a etiquetas legibles) y escribe los JSON pre-materializados en `public/data/*.json`. Es regenerable a mano. El detalle del tratamiento está en **[Datos y materialización](02-Datos-y-Materializacion.md)**.

---

Para entender cómo se transforman estos datos en cifras y por qué el observatorio describe sin juzgar, ver **[Metodología](03-Metodologia.md)**. Para los cruces entre fuentes, ver **[Los cruces](08-Los-Cruces.md)**.
