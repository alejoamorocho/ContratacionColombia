# Caveats y límites de los datos

Este observatorio organiza datos abiertos de contratación colombiana (ventana **2022–2026**) y los muestra tal cual: **describe, no juzga**. Para leer las cifras con honestidad hace falta saber qué **no** miden, dónde tienen huecos y qué supuestos hay detrás de cada agregado. Esta página reúne **todas** las limitaciones conocidas, sin esconder ninguna. Es deliberadamente exhaustiva: preferimos un lector incómodo por exceso de salvedades a uno engañado por la falta de ellas.

**Regla general:** ningún número de este dashboard es acusatorio. Una cifra alta, una concentración de mercado o una coincidencia entre dos listados públicos es un **hecho estadístico descriptivo**, no una conclusión sobre legalidad, mérito o conducta. La interpretación causal (si algo es bueno, malo, legal o ilegal) requiere contexto que estos datos agregados no contienen y que el observatorio no aporta. Ver [Metodología](03-Metodologia.md) y [Cómo se calcula todo](13-Como-Se-Calcula-Todo.md).

Todas las cifras de esta página se leyeron directamente del snapshot publicado en `public/data/*.json` (corte de datos **2026-06-03**, snapshot generado el **2026-06-23**). Donde un número puede cambiar al regenerar el snapshot, lo señalamos y priorizamos el **método** (estable) sobre el **valor** (volátil).

---

## Resumen rápido

| # | Tema | Límite en una frase |
|---|---|---|
| 1 | Gasto público | El valor total (**$583,8 billones**) **subestima** el gasto real: sin SECOP I ni adiciones. |
| 2 | Mapa | **~5 %** de los contratos no tienen departamento mapeable. |
| 3 | 2026 | Año **parcial** (corte jun-2026), se completa con el tiempo. |
| 4 | 2022 (1.er semestre) | **Baja cobertura** en SECOP II; el "crecimiento" inicial es en parte mayor reporte. |
| 5 | Competencia | Los procesos **no traen nº de oferentes** → la competencia no se puede medir. |
| 6 | Ejecución | El facturado/pagado se deriva de **columnas de contratos**, no de un libro de facturas. |
| 7 | Sector / objeto | `objeto_clasificado` es una etiqueta **derivada**, no un campo oficial. |
| 8 | PYME | `es_pyme` es **autodeclarado** por el proveedor. |
| 9 | Género | Es el género del **representante legal**, no de la propiedad de la empresa. |
| 10 | Pago | `valor_pagado` está **subreportado**: un 0 % puede ser "no pagado" o "no reportado". |
| 11 | PAA (planeación) | Solo **2024–2026**; la modalidad faltante se rotula **"No especificada"**. |
| 12 | BPIN (inversión) | Es **presupuesto vigente 2025–2026**, no ejecución histórica ni contratos. |
| 13 | Electoral | Solo ciclos **2022–2023**. |
| 14 | Cruces por NIT | Coincidencia **exacta y conservadora**; subestima, no infiere identidad. |
| 15 | Per cápita | Usa la población **de la entidad que firma**, no de dónde se ejecuta. |
| 16 | Antigüedad / madurez | Solo **41,5 %** de cobertura (empresas con matrícula RUES cruzable). |
| 17 | Valores extremos | Hay **outliers** que pueden ser errores de la fuente → se muestra la mediana. |
| 18 | Multas SECOP | Histórico **2010–2026** (no la ventana 2022–2026); fechas basura acotadas. |
| 19 | Nombres de entidad | Se muestra el **más frecuente** por NIT (`APPROX_TOP_COUNT`), no uno oficial. |

Las secciones siguientes desarrollan cada punto.

---

## 1. El valor total subestima el gasto público

El total mostrado —**$583,8 billones COP** (`valor_total = 583.796.373.548.818`) sobre **3.969.440** contratos— es **valor de contratos publicados en SECOP II**, no el gasto público total del Estado colombiano. Quedan fuera, entre otros:

- **SECOP I:** no se ingiere. La contratación reportada únicamente en SECOP I (entidades o periodos que no migraron a SECOP II) **no aparece**.
- **Adiciones y prórrogas:** el valor base es el del contrato **firmado**; no suma los mayores valores agregados después de la firma. A modo de referencia interna, el snapshot identifica **311.567** contratos con prórroga por **~$60,4 B** de valor base asociado (sección *señales*), pero ese es el valor original de esos contratos, **no** el monto de las adiciones, que el dataset público no desglosa.
- **Regímenes especiales y entidades que no publican en SECOP II:** empresas industriales y comerciales del Estado, sociedades de economía mixta y otros sujetos con régimen propio reportan de forma desigual.

Por eso el total es un **piso**, no el gasto público completo. Trátese siempre como "valor de lo publicado en SECOP II" y nunca como "lo que gastó el Estado". Más detalle en la [Auditoría de datos](06-Auditoria-De-Datos.md).

---

## 2. ~5 % de contratos sin departamento mapeable

La sección **¿Dónde?** ubica los contratos en un mapa coroplético por departamento usando el campo `entidad_departamento`, normalizado a código **DANE** (insensible a tildes y mayúsculas: se aplica `NORMALIZE(... NFD)` y se elimina la marca diacrítica). Aun así, **alrededor del 5 %** de los contratos traen un departamento ausente, ambiguo o no reconocible y **no se mapean**.

Consecuencia práctica:

- Los totales del mapa son **algo menores** que el total nacional. Lo no mapeable **se deja fuera del mapa**: no se reparte, no se imputa, no se inventa una ubicación.
- El mapa refleja el departamento de la **entidad contratante**, no necesariamente el lugar físico donde se ejecuta la obra o el servicio. Una entidad nacional con sede en Bogotá puede contratar obra que se ejecuta en otro departamento; el contrato cuenta en Bogotá.

Esto explica, por ejemplo, que Bogotá D.C. (DANE `11`) concentre **$223,97 B** sobre 990.538 contratos: muchas entidades del orden nacional firman desde la capital aunque su gasto se distribuya por el país.

---

## 3. 2026 es un año parcial

La ventana llega hasta la **fecha de corte** del snapshot (`corte_datos = 2026-06-03`). El año **2026 está incompleto** y se va llenando a medida que se publican contratos. En el snapshot actual, 2026 muestra **552.600** contratos por **$58,36 B**, frente a años cerrados como 2025 (**1.009.543** contratos, **$172,66 B**).

Cualquier comparación de 2026 contra años completos (2022–2025) es **injusta por construcción**: 2026 tendrá menos contratos y menos valor solo por ser parcial. Esto afecta a toda serie temporal que incluya 2026 —ejecución, modalidades por año, género, sanciones, etc.— y debe leerse con esa salvedad. La nota correspondiente viaja en el propio snapshot (`meta.notas`).

---

## 4. 2022 (primer semestre) tiene baja cobertura

La adopción de SECOP II no fue uniforme en el tiempo. El **primer semestre de 2022** tiene **cobertura baja**: hay meses con muy pocos registros frente a meses posteriores. Las series temporales que arrancan en 2022 deben leerse con esa salvedad: el "crecimiento" inicial refleja en parte **mayor reporte** (más entidades publicando), no necesariamente más contratación real.

Esto tiene un efecto concreto en las métricas de **crecimiento sectorial**, que por eso se calculan **2023 → 2025** (no desde 2022) para no medir un alza artificial causada por la curva de adopción. Sobre esa base comparable de **30 sectores**, el snapshot reporta el mayor avance nominal en *Aseo* (**+140,4 %**) y **6** sectores que cayeron. El año base 2022, por su cobertura parcial, queda fuera de ese cálculo a propósito.

---

## 5. Procesos: sin número de oferentes (competencia no disponible)

La sección **¿Cómo contrata?** incluye procesos de selección (**450.977** procesos en el snapshot, con **44,1 %** adjudicado y **0,7 %** cancelado), pero el dataset de procesos **no trae el número de oferentes** por proceso. Por tanto **no se puede medir la competencia** (cuántos proponentes se presentaron a cada proceso).

No mostramos indicadores de competencia —ni "promedio de oferentes", ni "procesos con un solo proponente"— porque el dato simplemente **no está en la fuente**. El materializador documenta explícitamente que la competencia "está vacía en la fuente (~0 %)" y por eso se omite, en lugar de publicar un cero engañoso.

> **Nota sobre `pct_adjudicado` por modalidad:** los porcentajes de adjudicación varían mucho entre modalidades (p. ej. *Contratación directa* 98,6 % vs. *Régimen especial* 15,6 %) porque cada modalidad transita un flujo de estados distinto en SECOP II. Es un dato descriptivo del **estado del proceso**, no una medida de eficiencia o de calidad de la selección.

---

## 6. Ejecución: derivada de columnas de contratos, no de un libro de facturas

La sección **¿Se ejecuta?** describe la cadena **contratado → facturado → pagado**:

| Eslabón | Valor | % del contratado |
|---|---|---|
| Contratado | $583,80 B | 100 % |
| Facturado | $190,67 B | 32,7 % |
| Pagado | $154,55 B | 26,5 % |

La tabla de **facturas** del origen llegó **vacía**, así que la ejecución **no** se calcula factura por factura: se deriva de las columnas de valor `valor_facturado` y `valor_pagado` presentes en la propia tabla de **contratos**. Es la mejor aproximación disponible, pero es una **aproximación**, no un libro contable de pagos verificado. Implicaciones:

- Los porcentajes globales (32,7 % facturado, 26,5 % pagado) son **bajos** en parte porque incluyen contratos recientes que aún no se ejecutan, y en parte por **subreporte** del campo (ver caveat 10).
- La **cobertura** del campo es alta pero no total: `cobertura_factura = 91,7 %` y `cobertura_pago = 90,6 %` (proporción de contratos que traen el dato). El ~9 % restante no reporta, y eso arrastra los agregados hacia abajo.
- El año 2026, parcial, distorsiona fuerte: contratado $58,36 B pero solo $0,40 B pagado, simplemente porque casi nada se ha ejecutado todavía.

---

## 7. Sector / objeto: `objeto_clasificado` es una etiqueta derivada

Las secciones que agrupan por "sector" u "objeto" (panorama, ¿Quién?, tamaño típico de contrato, HHI, crecimiento) usan el campo `objeto_clasificado`, que **no es un campo oficial de SECOP II** sino una **clasificación derivada** del texto del objeto contractual. El materializador la normaliza así:

- Toma el **primer segmento** del objeto (antes de la primera coma), le quita tildes y punto final y lo lleva a mayúsculas.
- Colapsa variantes sucias del mismo concepto —`CONSULTORÍA`, `CONSULTORÍA.`, `CONSULTORIA, APOYO, GESTION`— a una sola clave `CONSULTORIA`, evitando que una categoría se fragmente en docenas de etiquetas casi iguales.
- Mapea **33 categorías canónicas** (Salud, Construcción, Consultoría, Educación…) a etiquetas legibles; lo que no cae en una de ellas pasa por `INITCAP` y aparece como cola de etiquetas menores.

Por eso en algunos desgloses largos (p. ej. el HHI por sector) conviven etiquetas canónicas con variantes residuales de baja frecuencia (`Comunicacion` vs. `Comunicaciones`, `Deportes` vs. `Deporte`, `Servicios Publicos` vs. `Servicios públicos`). El verificador del snapshot mide cuánto **valor** queda fuera de las 33 categorías canónicas y marca para revisión si supera el 8 %. La clasificación es **útil para orientar**, pero no debe leerse como una taxonomía oficial ni como un código presupuestal.

---

## 8. PYME: `es_pyme` es autodeclarado

La sección de participación PYME usa el campo `es_pyme`, que es **autodeclarado por el proveedor** al registrarse o contratar, no verificado contra un registro oficial de tamaño empresarial. El snapshot reporta:

- **12,8 %** de los contratos y **20,7 %** del valor (**$120,86 B**) corresponden a proveedores marcados como PYME.
- La participación PYME varía mucho por modalidad: alta en *Selección abreviada* (75,1 %) y *Mínima cuantía* (74,8 %), baja en *Contratación directa* (6,9 %).

Como el dato es autodeclarado, puede haber empresas mal clasificadas en ambos sentidos. Léase como "proveedores que se **declaran** PYME", no como una medición auditada del tejido empresarial.

---

## 9. Género: del representante legal, no de la propiedad

La sección de género se calcula sobre el campo `genero_representante_legal`, con cobertura ~98 %. El snapshot muestra **53,0 %** de los contratos y **40,6 %** del valor asociados a representantes legales mujer. Caveats:

- Es el género de la **persona que representa legalmente** a la empresa contratista, **no** un indicador de propiedad femenina del negocio, ni de control efectivo, ni de equidad interna. Una empresa con representante legal mujer puede ser propiedad de cualquiera.
- Para personas naturales contratistas, el campo describe a la persona; para empresas, a su representante. Son dos universos distintos sumados en un mismo agregado.
- La brecha entre **% de contratos** (53,0 %) y **% de valor** (40,6 %) es en sí un hecho descriptivo: las mujeres representan más de la mitad de los contratos pero una menor proporción del valor, lo que es consistente con su mayor presencia en contratos de menor cuantía. No afirmamos causa.

---

## 10. `valor_pagado` está subreportado

El campo `valor_pagado` es la base de la sección de ejecución y de la **distribución de pago** por contrato. Pero un valor de pago **0** es ambiguo: puede significar "no se ha pagado" o "no se reportó el pago". El snapshot expone esa heterogeneidad en lugar de esconderla en un promedio:

| Tramo de pago (pagado/contratado) | Contratos | % |
|---|---|---|
| 0 % | 1.685.727 | 46,9 % |
| 1–30 % | 124.704 | 3,5 % |
| 30–70 % | 171.368 | 4,8 % |
| 70–99 % | 352.373 | 9,8 % |
| ≥ 100 % | 1.261.809 | 35,1 % |

La **mediana** del ratio de pago es **25,0 %**. La bimodalidad (mucha masa en 0 % y en ≥100 %) revela que el dato mezcla contratos efectivamente sin pagar, contratos cerrados y pagados por completo, y contratos cuyo pago simplemente no se reportó. Por eso el agregado `SUM(pagado)/SUM(contratado)` debe leerse como un **piso de ejecución reportada**, no como la tasa real de pago del Estado.

---

## 11. PAA (planeación): solo 2024–2026 y "No especificada"

La sección **¿Qué se planea?** usa el **Plan Anual de Adquisiciones (PAA)**, con **155.353** ítems por **$58,65 B** planeados (644 entidades). Caveats:

- Solo está disponible para **2024, 2025 y 2026**. No hay PAA para 2022–2023, así que la planeación **no es comparable** con toda la ventana de contratos. La distribución por año está además sesgada por cobertura: 2025 concentra el grueso ($32,75 B).
- El PAA se **deduplica** por encabezado y se conserva la **última versión** de cada plan; sin esto el "planeado" se inflaría ~30 % por versiones superadas.
- La modalidad que el plan no especifica **ya no se rotula "Otras"**: se rotula **"No especificada"** y es de hecho la categoría de mayor valor planeado ($22,90 B sobre 16.143 ítems). Es un vacío del dato, no una modalidad real.
- La **fidelidad del PAA** (ítems planeados que ya tienen un proceso enlazado) cae con el año: 49,6 % (2024), 30,1 % (2025), 20,7 % (2026). Esa caída es esperable —los planes recientes aún no se han ejecutado— y **no** mide incumplimiento.

---

## 12. BPIN (inversión): presupuesto vigente, no ejecución histórica ni contratos

La sección **¿En qué se invierte?** usa **BPIN** del DNP: **104.695** proyectos, **$424,85 B** de presupuesto vigente y **34 %** ejecutado (`pct_ejecucion = 0,3402`). Tres matices fundamentales:

- Es **presupuesto vigente de las vigencias 2025–2026**, no una serie histórica de inversión. Las vigencias anteriores no están en la tabla (sus `valor_vigente` son ~0), por eso el filtro acota a 2025–2026.
- Es **presupuesto, no contratos**: vive en un universo distinto al de SECOP II y **no debe sumarse** con el valor de contratos. Sumar BPIN + SECOP sería doble conteo conceptual.
- La nueva **cadena de ejecución BPIN** (4 estados: vigente → comprometido → obligado → pagado) muestra la mecánica presupuestal por año, no solo un porcentaje. En 2025: vigente $204,50 B, comprometido $156,70 B, obligado $120,55 B, pagado $122,35 B. En 2026 (en curso): vigente $220,35 B con ejecución todavía baja. El "pagado" puede superar al "obligado" en algún corte por desfases de registro entre estados; es ruido de la fuente, no un error de cálculo.

---

## 13. Electoral: solo ciclos 2022–2023

La financiación de campaña proviene de **Cuentas Claras (CNE)** y cubre solo los **ciclos electorales 2022–2023**: **350.566** aportes por **$1,34 B** (`monto_total = 1.337.157.474.339,86`) a **115.036** candidatos. Caveats:

- Fuera de esos ciclos no hay datos, así que cualquier lectura electoral está **acotada a esas elecciones** (presidenciales/Congreso 2022 y regionales 2023).
- Los **partidos están normalizados** para evitar la fragmentación que producían las variantes de nombre de una misma colectividad (coaliciones, denominaciones largas, comillas). Aun así, los nombres reflejan cómo cada campaña se registró ante el CNE, no una taxonomía partidista oficial.
- El monto es el **declarado** en Cuentas Claras; no es auditoría de financiación ni incluye aportes no reportados.

---

## 14. Cruces por NIT: coincidencia exacta y conservadora

La sección **¿Se cruzan los datos?** une listados públicos por **NIT exacto**:

| Cruce | NITs | Contratos | Valor |
|---|---|---|---|
| Donante ↔ contratista | 27.488 | 120.229 | $28,60 B |
| Sancionado ↔ contratista | 1.560 | 8.970 | $6,79 B |

La unión es **exacta**: solo coincide cuando el NIT es **idéntico** en ambas fuentes. Es deliberadamente **conservadora**:

- **Subestima** los cruces. NITs mal escritos, con dígito de verificación distinto, personas naturales sin NIT empresarial o registros sin identificador **no cruzan**, aunque correspondan a la misma entidad real.
- **No infiere identidad** por nombre, parentesco ni red. No hay coincidencia difusa (*fuzzy matching*).
- Una coincidencia **no implica irregularidad**: que un NIT aparezca en dos listados es un **hecho factual**, no un juicio. Donar a una campaña, haber sido sancionado y además contratar con el Estado **puede ser perfectamente legal**.

> **Guardas anti-fan-out.** Algunos cruces (donante, sancionado en otro departamento, redes de representante compartido) tocan tablas donde un mismo NIT aparece en varias filas. Un `JOIN` directo multiplicaría el valor del **mismo contrato** una vez por cada coincidencia —en una versión temprana, `donante_post_eleccion` llegó a sumar $820 B, por encima del universo total de $584 B—. El materializador deduplica el lado cruzado (`DISTINCT`/`EXISTS`) para contar cada contrato **una sola vez**, y el verificador incluye una *guardia de sentido* que falla si el valor de cualquier señal supera el universo contratado total. Las señales cruzadas adicionales (monopolio municipal, supervisor-contratista, puerta giratoria, etc.) viven en `senales_extra` y son **igualmente neutrales**: coincidencias que ameritan verificación caso por caso, nunca acusaciones.

---

## 15. Per cápita: población de la entidad, no del territorio servido

La métrica de **contratación per cápita por departamento** divide el valor contratado del departamento (de la entidad que firma) entre su **población** (catálogo DANE 2023, proyección post-CNPV 2018, embebido en el materializador como referencia estática). Caveats:

- El numerador usa el departamento **de la entidad contratante**, no el lugar de ejecución (mismo sesgo del caveat 2). Por eso Bogotá D.C. encabeza con **$27,9 M por habitante**: agrega gasto de entidades nacionales con sede en la capital pero alcance nacional. No significa que cada bogotano "reciba" esa cifra.
- La población es un **catálogo de referencia aproximado al millar**, no un dato del proyecto; cualquier fork puede afinarlo. Los departamentos sin entrada en el catálogo se **omiten** del ranking per cápita (no se imputan a cero).
- La métrica es una **normalización descriptiva** para comparar departamentos de distinto tamaño, no una medida de inversión recibida por persona.

---

## 16. Antigüedad y madurez del contratista: cobertura parcial (41,5 %)

La métrica de **antigüedad del contratista al firmar** (años desde la matrícula RUES hasta la fecha de firma) solo cubre proveedores con **matrícula RUES cruzable por NIT exacto**. Cobertura: **41,5 %** de los contratos (mediana **6,3 años**). Caveats:

- El **58,5 % restante** no cruza (personas naturales, NITs no presentes en el corte de RUES, identificadores no coincidentes) y queda fuera del cálculo. La distribución por tramos describe **solo** la fracción cubierta.
- Misma lógica conservadora del cruce por NIT exacto: subestima, no infiere.
- Es la antigüedad **registral** de la empresa, no de su experiencia contratando con el Estado ni de su capacidad operativa.

El mismo límite de cobertura aplica a cualquier indicador que dependa de cruzar SECOP con RUES o Supersociedades: el alcance de esos cruces está acotado por la coincidencia exacta de NIT y por el corte temporal de cada fuente externa.

---

## 17. Valores extremos (posibles errores de la fuente)

Existen **outliers de valor** muy grandes que pueden ser **errores de digitación de la fuente** (montos imposibles para el objeto contratado, ceros de más, unidades equivocadas). **No se borran ni se corrigen:** alterar el dato crudo iría contra la transparencia y la reproducibilidad.

En su lugar, se reporta la **mediana** junto al total. El valor **mediano** de contrato es **$20,06 M** (`valor_mediano = 20.057.022`), frente a un promedio que los extremos inflarían. La mediana es **robusta** a los valores atípicos y describe mucho mejor el **contrato típico**. La distribución completa de percentiles lo confirma:

| Percentil | Valor por contrato |
|---|---|
| p10 | $5,52 M |
| p25 | $10,29 M |
| p50 (mediana) | $20,04 M |
| p75 | $40,50 M |
| p90 | $83,70 M |
| p99 | $1.696,32 M |

El salto enorme entre p90 y p99 muestra dónde viven los extremos. Cuando una cifra dependa del **total** (no de la mediana), recuérdese que es **sensible a esos pocos contratos de cuantía extrema**. Detalle en la [Auditoría de datos](06-Auditoria-De-Datos.md).

---

## 18. Multas SECOP: histórico 2010–2026, no la ventana 2022–2026

El panorama de **multas SECOP** (distinto de las sanciones SIRI) es **histórico**, no se limita a la ventana 2022–2026: cubre **2010–2026** (`anio_min = 2010`, `anio_max = 2026`), con **1.866** multas. Caveats:

- La fuente trae **fechas basura** (registros con año 2027/2028); el materializador las acota al rango 2010–2026 para no publicar años imposibles, y la serie por año se reporta desde 2015.
- El cruce de NITs multados con contratistas (**270** NITs, $12,31 B en contratos asociados) es, una vez más, **factual y neutral**: una multa previa y un contrato posterior coinciden por NIT, sin que ello implique relación causal ni irregularidad.
- No debe confundirse con las **sanciones SIRI** de la Procuraduría (**13.441** sanciones, inhabilidad mediana **120 meses**), que son otra fuente, otro universo y otra naturaleza jurídica.

---

## 19. Nombres de entidad: el más frecuente por NIT, no uno oficial

En **¿Quién contrata?** las entidades se agrupan por **NIT**, no por nombre. Una entidad nacional (ICBF, INVÍAS, SENA…) firma bajo **un solo NIT** pero con decenas de nombres regionales ("ICBF Regional Caquetá", "SENA Regional Valle…"). Para consolidar toda la entidad bajo su NIT, el nombre mostrado es el **más frecuente** (`APPROX_TOP_COUNT`), no uno arbitrario ni uno oficial.

Por eso en la tabla de top entidades pueden verse nombres con ruido residual de la fuente (`ICBF SEDE NACIONAL`, `DEPARTAMENTO DE ANTIOQUIA//`, `SENA REGIONAL VALLE Grupo de Apoyo Administrativo Mixto`): son la etiqueta dominante de ese NIT en SECOP II, no una denominación normalizada. La **agregación por NIT es correcta**; el **nombre es solo una etiqueta representativa**.

---

## Cómo se mantiene la honestidad de las cifras

El snapshot no se publica a ciegas. Tres mecanismos protegen la integridad de los números frente a estas limitaciones:

- **Deduplicación por identificador.** La fuente SECOP trae ~0,3 % de `id` repetidos (mismo contrato versionado o reingerido). El materializador conserva la **última versión por `id`** antes de agregar, para no contar ni sumar dos veces el mismo contrato.
- **Validación Zod en runtime.** Los esquemas de `src/lib/schemas.ts` son la única fuente de verdad de la forma de los datos; el hook `usePublicData` valida cada JSON contra su esquema **al cargarlo**. Si un archivo del snapshot llega malformado o desactualizado, la app falla de forma **clara y controlada** en lugar de pintar `undefined`.
- **Guardas anti-fragmentación y de sentido en `verify_snapshot.py`.** Un verificador independiente re-deriva los números desde BigQuery con consultas distintas y, sin tocar BigQuery, comprueba coherencias internas: que no existan etiquetas categóricas **duplicadas** (el síntoma del caso "partidos" sin normalizar), que los porcentajes vivan en `[0, 100]`, que los percentiles sean monótonos, que facturado/pagado ≤ contratado, y que **ningún valor de señal supere el universo total** contratado (detector de fan-out de `JOIN`).

---

## Cómo leer todo esto

- Los números son **agregados descriptivos** de datos abiertos, no auditorías, calificaciones ni denuncias.
- Cada límite anterior **acota** lo que una cifra puede afirmar; no la invalida. Una cifra con caveat sigue siendo informativa, solo que dentro de su alcance declarado.
- **No hay scoring.** El observatorio no pondera variables en un índice 0–100 ni ordena actores por "riesgo". Muestra hechos y distribuciones; la valoración la pone quien lee.
- Todo es **reproducible**: las **45** consultas viven en [`data/queries/`](../data/queries) y la limpieza y materialización en [`data/materialize_public.py`](../data/materialize_public.py), con su reconciliación independiente en [`data/verify_snapshot.py`](../data/verify_snapshot.py). Cualquiera puede regenerar el snapshot y verificar (ver [Hacer un fork](04-Hacer-Un-Fork.md)).

Más contexto en [Fuentes](01-Fuentes.md), [Datos y materialización](02-Datos-y-Materializacion.md), [Metodología](03-Metodologia.md), [Auditoría de datos](06-Auditoria-De-Datos.md), [Los cruces](08-Los-Cruces.md), [Cómo se calcula todo](13-Como-Se-Calcula-Todo.md) y [FAQ](05-FAQ.md).
