# Caveats y límites de los datos

Este observatorio organiza datos abiertos de contratación colombiana (ventana **2022–2026**) y los muestra tal cual: **describe, no juzga**. Para leer las cifras con honestidad hace falta saber qué **no** miden, dónde tienen huecos y qué supuestos hay detrás. Esta página reúne **todas** las limitaciones conocidas, sin esconder ninguna.

Regla general: **ningún número de este dashboard es acusatorio**. Una cifra alta, una concentración o una coincidencia entre listados es un **hecho estadístico descriptivo**, no una conclusión sobre legalidad o conducta. Ver [Metodología](03-Metodologia.md).

## Resumen rápido

| Tema | Límite en una frase |
|---|---|
| Gasto público | El valor total **subestima** el gasto real (sin SECOP I ni adiciones). |
| Mapa | **~5 %** de los contratos no tienen departamento mapeable. |
| 2026 | Año **parcial**, se completa con el tiempo. |
| 2022 (1.er semestre) | **Baja cobertura** en SECOP II. |
| Procesos | No traen número de oferentes → **competencia no disponible**. |
| Ejecución | La tabla de facturas está **vacía**; se calcula desde columnas de contratos. |
| PAA (planeación) | Solo **2024–2026**. |
| BPIN (inversión) | Es **presupuesto vigente 2025–2026**, no ejecución histórica. |
| Electoral | Solo ciclos **2022–2023**. |
| Valores extremos | Hay **outliers** que pueden ser errores de la fuente → se muestra la mediana. |
| Cruces por NIT | Coincidencia **exacta y conservadora** de identificador. |

## 1. El valor total subestima el gasto público

El total mostrado (**~$583,8 billones COP** sobre **3.969.440** contratos) es **valor de contratos publicados en SECOP II**, no el gasto público total del Estado. Quedan fuera, entre otros:

- **SECOP I:** no se ingiere. La contratación reportada solo en SECOP I no aparece.
- **Adiciones y prórrogas:** el valor base no suma los mayores valores agregados después de la firma.
- **Regímenes especiales** y entidades que no publican en SECOP II.

Por eso el total es un **piso**, no el gasto público completo. Trátese como "valor de lo publicado en SECOP II", nunca como "lo que gastó el Estado". Más detalle en la [Auditoría de datos](06-Auditoria-De-Datos.md).

## 2. ~5 % de contratos sin departamento mapeable

La sección **¿Dónde?** ubica los contratos en un mapa coroplético por departamento usando `entidad_departamento`, normalizado a código **DANE** (insensible a tildes y mayúsculas). Aun así, **alrededor del 5 %** de los contratos traen un departamento ausente, ambiguo o no reconocible y **no se mapean**.

Consecuencia: los totales del mapa son **algo menores** que el total nacional. Esto no se reparte ni se imputa: lo no mapeable se deja fuera del mapa, no se inventa una ubicación.

## 3. 2026 es un año parcial

La ventana llega hasta la **fecha de corte** del snapshot. El año **2026 está incompleto** y se va llenando a medida que se publican contratos. Cualquier comparación de 2026 contra años cerrados (2022–2025) es **injusta por construcción**: 2026 tendrá menos contratos y menos valor solo por ser parcial.

## 4. 2022 (primer semestre) tiene baja cobertura

La adopción de SECOP II no fue uniforme en el tiempo. El **primer semestre de 2022** tiene **cobertura baja**: hay meses con muy pocos registros frente a meses posteriores. Las series temporales que arrancan en 2022 deben leerse con esa salvedad; el "crecimiento" inicial refleja en parte **mayor reporte**, no necesariamente más contratación.

## 5. Procesos: sin número de oferentes (competencia no disponible)

La sección **¿Cómo contrata?** incluye procesos (con un **44 % adjudicado**), pero el dataset de procesos **no trae el número de oferentes** por proceso. Por tanto **no se puede medir la competencia** (cuántos proponentes se presentaron). No mostramos indicadores de competencia porque el dato simplemente no está en la fuente.

## 6. Ejecución: la tabla de facturas está vacía

La sección **¿Se ejecuta?** describe la cadena **contratado ($584,8 B) → facturado ($190,7 B) → pagado ($154,5 B)**. La tabla de **facturas** del origen llegó **vacía**, así que la ejecución **no** se calcula desde facturas individuales: se deriva de **columnas de valor presentes en la tabla de contratos**. Es la mejor aproximación disponible, pero es una **aproximación**, no un libro contable de pagos verificado factura por factura.

## 7. PAA (planeación): solo 2024–2026

La sección **¿Qué se planea?** usa el **Plan Anual de Adquisiciones (PAA)**, con **$58,6 B** planeados. Este dato solo está disponible para **2024, 2025 y 2026**. No hay PAA para 2022–2023, así que la planeación **no es comparable** con toda la ventana de contratos.

## 8. BPIN (inversión): es presupuesto vigente, no ejecución histórica

La sección **¿En qué se invierte?** usa **BPIN** del DNP: **$424,8 B de presupuesto vigente**, **34 % ejecutado**. Dos matices:

- Es **presupuesto vigente 2025–2026**, no una serie histórica de inversión.
- Es **presupuesto**, no contratos: vive en un universo distinto al de SECOP II y **no debe sumarse** con el valor de contratos.

## 9. Electoral: solo ciclos 2022–2023

La financiación de campaña proviene de **Cuentas Claras (CNE)** y cubre solo los **ciclos electorales 2022–2023** (**$1,34 B** en aportes). Fuera de esos ciclos no hay datos, así que cualquier lectura electoral está acotada a esas elecciones.

## 10. Valores extremos (posibles errores de la fuente)

Existen **outliers de valor** muy grandes que pueden ser **errores de digitación de la fuente** (por ejemplo, montos imposibles para el objeto contratado). No se borran ni se corrigen: alterar el dato crudo iría contra la transparencia.

En su lugar, se reporta la **mediana (~$20 M)** junto al total. La mediana es **robusta** a los extremos y describe mucho mejor el **contrato típico** que el promedio. Cuando una cifra dependa del total, recuérdese que es **sensible a esos extremos**. Detalle en la [Auditoría de datos](06-Auditoria-De-Datos.md).

## 11. Cruces por NIT: coincidencia exacta y conservadora

La sección **¿Se cruzan los datos?** une listados por **NIT exacto**:

- **Donante ↔ contratista:** **27.488 NITs** por **$28,6 B** en contratos.
- **Sancionado ↔ contratista:** **1.560 NITs** por **$6,8 B** en contratos.

La unión es **exacta**: solo coincide cuando el NIT es **idéntico** en ambas fuentes. Es deliberadamente **conservadora**:

- **Subestima** los cruces: NITs mal escritos, con dígito de verificación distinto, personas naturales o registros sin NIT **no cruzan** aunque correspondan a la misma entidad.
- **No infiere identidad** por nombre, parentesco ni red. No hay coincidencia difusa.
- Una coincidencia **no implica irregularidad**: que un NIT esté en dos listados es un **hecho factual**, no un juicio. Que alguien done a una campaña o haya sido sancionado y además contrate con el Estado **puede ser perfectamente legal**.

## Cómo leer todo esto

- Los números son **agregados descriptivos** de datos abiertos, no auditorías ni denuncias.
- Cada límite anterior **acota** lo que una cifra puede afirmar; no la invalida.
- Todo es **reproducible**: las consultas viven en [`data/queries/`](../data/queries) y la limpieza en [`data/materialize_public.py`](../data/materialize_public.py). Cualquiera puede regenerar el snapshot y verificar (ver [Hacer un fork](04-Hacer-Un-Fork.md)).

Más contexto en [Fuentes](01-Fuentes.md), [Datos y materialización](02-Datos-y-Materializacion.md), [Metodología](03-Metodologia.md) y [FAQ](05-FAQ.md).
