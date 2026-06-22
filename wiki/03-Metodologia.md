# Metodología

Esta página explica **qué calcula** el observatorio y, con la misma importancia, **qué decide no calcular**. El método se resume en una frase que gobierna todo el proyecto: **describe, no juzga**.

> **En una línea:** mostramos estadística descriptiva sobre datos públicos —conteos, sumas, medianas, distribuciones, concentración y coincidencias por NIT— para que cada quien formule sus propias preguntas. No producimos puntajes, ni rankings de "peores", ni juicios sobre personas o entidades.

## El principio rector: describe, no juzga

Un dato no es una acusación. Que una entidad contrate mucho, que un sector concentre valor, que un NIT aparezca en dos listas públicas o que una modalidad domine son **hechos aritméticos** sobre fuentes abiertas. Interpretarlos —decidir si algo está bien, mal, es legal o irregular— excede lo que el dato permite afirmar y corresponde a quien consulte la **fuente primaria**, caso por caso.

De ese principio se derivan tres compromisos prácticos:

1. **Neutralidad de las cifras.** Cada número describe una realidad medible (cuántos contratos, cuánto valor, qué porcentaje), nunca una valoración.
2. **Neutralidad del lenguaje.** Las etiquetas son fieles a lo que miden ("categoría de objeto", no "sector"; "señales", no "alertas de corrupción").
3. **Verificabilidad antes que conclusión.** El dashboard señala **dónde mirar**; no concluye por el lector.

## Qué calculamos

Todas las cifras del observatorio son **estadística descriptiva**. Estas son las operaciones que usamos y nada más:

| Operación | Qué responde | Dónde aparece |
|---|---|---|
| **Conteos** | ¿Cuántos contratos, entidades, contratistas, procesos, NITs? | Todas las secciones |
| **Sumas** | ¿Cuánto valor total, planeado, presupuestado, ejecutado? | Inicio, ¿Qué se planea?, ¿En qué se invierte?, ¿Se ejecuta? |
| **Medianas y percentiles** | ¿Cuánto vale el contrato *típico*? (p10…p90) | Inicio, ¿Hay señales? |
| **Distribuciones** | ¿Cómo se reparte por año, modalidad, categoría de objeto, nivel de gobierno, departamento? | ¿Quién contrata?, ¿Cómo contrata?, ¿Dónde? |
| **Tasas y porcentajes** | ¿Qué fracción es contratación directa? ¿Qué % se ejecutó? | ¿Cómo contrata?, ¿Se ejecuta?, ¿En qué se invierte? |
| **Concentración** | ¿Qué % del valor se lleva el top‑10 de contratistas? | ¿Hay señales? |
| **Cruces por coincidencia exacta de NIT** | ¿Cuántos NITs aparecen en dos listas públicas a la vez? | ¿Se cruzan los datos? |

Algunas precisiones metodológicas que aplican de forma transversal:

- **Mediana antes que promedio.** La distribución de valores está fuertemente sesgada por contratos de cuantía extrema (algunos son errores de la fuente). El promedio sería engañoso; por eso reportamos la **mediana (~$20 M)** y los **percentiles**, robustos a esos casos. Ver [Auditoría de datos](06-Auditoria-De-Datos.md).
- **Deduplicación por `id`.** Todos los agregados leen de una tabla base **deduplicada por identificador de contrato** (se conserva la última versión). Sin esto, conteos y sumas se inflarían. Ver [Materialización](02-Datos-y-Materializacion.md).
- **Ventana fija 2022–2026** y `valor > 0` en los agregados de contratos, de forma consistente entre secciones.
- **Concentración como hecho, no como veredicto.** "El top‑10 concentra el 7 % del valor" es un descriptor del mercado. Una concentración alta o baja puede tener explicaciones legítimas; el número no las juzga.

## Qué NO hacemos

Esta lista es tan importante como la anterior. Son operaciones que el proyecto **deliberadamente evita**:

- ❌ **No hay scoring.** No existe un "puntaje de riesgo" ni un "índice de corrupción" de 0 a 100. No ponderamos variables para producir una nota.
- ❌ **No hay rankings de "peores".** No ordenamos entidades, contratistas ni territorios por sospecha. Los "top" que mostramos son por **magnitud descriptiva** (más valor, más contratos), nunca por mérito moral ni por riesgo.
- ❌ **No emitimos juicios.** El dashboard no afirma que algo sea irregular, ilegal o indebido. No señala culpables.
- ❌ **No inferimos irregularidades a partir de los cruces.** Una coincidencia de NIT entre donantes/sancionados y contratistas es un hecho aritmético, no una infracción. Ver [Los cruces](08-Los-Cruces.md).
- ❌ **No inferimos relaciones sutiles.** Los cruces usan **igualdad exacta de NIT**; no usamos nombres parecidos, parentescos, redes societarias, beneficiarios finales ni "probabilidades de ser la misma persona". Esto evita falsos positivos por homonimia, a costa de no detectar vínculos indirectos.
- ❌ **No establecemos causalidad ni temporalidad.** El cruce no demuestra que un contrato sea consecuencia de una donación o que debió impedirse por una sanción. **Correlación no es causalidad.**
- ❌ **No interpretamos intenciones** detrás de los números.

## La sección "¿Hay señales?": señales, no alertas

La sección de señales muestra indicadores como la **concentración del top‑10 (7 % del valor)**, el **% de contratación directa (78,4 %)**, las **sanciones SIRI registradas (13.441)** y la **financiación electoral ($1,34 billones)**. Son **hechos estadísticos descriptivos**.

Una concentración alta, mucha contratación directa o la presencia de un registro sancionatorio **no implican** irregularidad: pueden tener explicaciones legítimas (mercados pequeños, urgencias amparadas en la ley, sanciones vencidas o de alcance limitado). Por eso la sección lleva siempre una **nota metodológica visible** y se llama "señales" —algo que invita a mirar— y no "alertas" —algo que afirma un problema.

## Los cruces, en una frase metodológica

Los cruces de la sección **¿Se cruzan los datos?** juntan dos conjuntos públicos por un identificador común (el NIT) y **cuentan** las coincidencias:

| Cruce | NITs que coinciden | Valor contratado de esos NITs |
|---|---|---|
| Donante ↔ contratista | 27.488 | $28,6 billones |
| Sancionado ↔ contratista | 1.560 | $6,8 billones |

El valor mostrado es **lo contratado** por el NIT coincidente, no el monto donado ni el sancionado. El método es coincidencia exacta de NIT, sin inferencia y sin ponderación. El tratamiento completo —incluido por qué **no es acusatorio**— está en [Los cruces](08-Los-Cruces.md).

## Reproducibilidad

El método no es una caja negra: **todo el cálculo es público y auditable**.

- Las consultas SQL están en [`data/queries/`](../data/queries) (una por sección/dominio, con la ventana 2022–2026 y los filtros explícitos).
- La transformación está en [`data/materialize_public.py`](../data/materialize_public.py): consulta BigQuery, **deduplica por `id`**, normaliza (código DANE insensible a tildes, modalidades a 7 categorías, categorías de objeto a etiquetas legibles) y escribe `public/data/*.json`.
- Las funciones de forma (`shape_*`) están separadas de la consulta para poder **probarlas sin BigQuery** (ver `data/test_materialize.py`).

Cualquiera con acceso a una tabla `contratos` equivalente puede **regenerar el snapshot a mano** y verificar que cada número del dashboard reconcilia con la fuente. La [Auditoría de datos](06-Auditoria-De-Datos.md) documenta esa reconciliación y los cuatro problemas encontrados y corregidos.

## Si quieres otra metodología

El proyecto está diseñado para ser **forkeable**: reemplaza las consultas y las transformaciones con tu propio enfoque —otra ventana temporal, otras fuentes, otros agregados, incluso un scoring si así lo decides— y vuelve a materializar. El observatorio te da la base transparente; el método que construyas encima es tuyo. Ver [Hacer un fork](04-Hacer-Un-Fork.md).

---

Más sobre el origen de las cifras en [Fuentes](01-Fuentes.md), sobre cómo se limpian en [Materialización](02-Datos-y-Materializacion.md), sobre su veracidad en [Auditoría de datos](06-Auditoria-De-Datos.md), y sobre sus límites en [Caveats](09-Caveats-Y-Limites.md).
