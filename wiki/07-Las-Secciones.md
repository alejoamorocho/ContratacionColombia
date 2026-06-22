# Guía de las secciones

El observatorio se navega **por preguntas**, no por menús técnicos. Cada sección plantea una pregunta sobre la contratación pública colombiana y la responde con datos abiertos agregados de la ventana **2022–2026**. Cada sección tiene su propio color de tono, pero todas comparten el mismo principio: **describe, no juzga** (ver [Metodología](03-Metodologia.md)).

Esta página recorre las diez secciones una por una: qué pregunta responde, qué datos muestra, cómo leerla y su salvedad (*caveat*) principal.

> **Antes de empezar.** Todas las cifras se calculan sobre una base deduplicada por `id` de contrato (ver [Auditoría de datos](06-Auditoria-De-Datos.md)). El **valor total subestima el gasto público real**: no incluye SECOP I ni adiciones. Por eso, junto a las sumas, conviene mirar siempre la **mediana** y los **percentiles**.

## Resumen de las diez secciones

| # | Sección | Pregunta | Fuente principal |
|---|---------|----------|------------------|
| 1 | Inicio | ¿Qué hay aquí? | Editorial (panorama) |
| 2 | ¿Quién contrata? | Entidades y contratistas | SECOP II — contratos |
| 3 | ¿Cómo contrata? | Modalidades y procesos | SECOP II — contratos + procesos |
| 4 | ¿Qué se planea? | Planes Anuales de Adquisiciones | SECOP II — PAA |
| 5 | ¿En qué se invierte? | Presupuesto por proyecto | BPIN (DNP) |
| 6 | ¿Se ejecuta? | Contratado → facturado → pagado | SECOP II — contratos |
| 7 | ¿Dónde? | Distribución geográfica | SECOP II — contratos |
| 8 | ¿Hay señales? | Indicadores descriptivos | SECOP II + SIRI + CNE |
| 9 | ¿Se cruzan los datos? | Coincidencias entre fuentes | SECOP II + CNE + SIRI |
| 10 | Acerca | Cómo se hizo y sus límites | Documentación |

---

## 1. Inicio

**Pregunta que responde:** ¿qué es este observatorio y qué muestra el panorama general?

**Qué datos muestra.** Es la portada **editorial**. Resume el panorama de la ventana 2022–2026: **3.969.440 contratos**, **$583,8 billones COP** en valor total, **mediana de $20 millones**, **4.690 entidades** y **954.767 contratistas**. También adelanta que **78,4 %** de la contratación es directa.

**Cómo leerla.** Es el punto de partida. Las cifras grandes (total, número de contratos) dan escala; la **mediana de $20 M** describe mejor el contrato típico que el promedio, que está sesgado por valores extremos.

**Caveat principal.** El total **subestima el gasto público**: faltan SECOP I y las adiciones. Tómalo como piso, no como cifra completa.

## 2. ¿Quién contrata?

**Pregunta que responde:** ¿qué entidades públicas contratan y a qué contratistas?

**Qué datos muestra.** Las dos puntas de la relación contractual: **entidades contratantes** (4.690 únicas) y **contratistas** (954.767 únicos), con sus valores y conteos agregados.

**Cómo leerla.** Permite ver el tamaño relativo de los actores. Un valor alto para una entidad o un contratista refleja **volumen de contratación reportada**, no un juicio: una entidad nacional grande naturalmente contrata más que un municipio pequeño.

**Caveat principal.** Los contratistas se cuentan por `contratista_nit`. Un NIT mal reportado en la fuente puede inflar o fragmentar conteos; mostramos lo que la fuente publica.

## 3. ¿Cómo contrata?

**Pregunta que responde:** ¿por qué mecanismos se adjudican los contratos?

**Qué datos muestra.** La distribución por **modalidad** (normalizada a 7 categorías legibles) y el estado de los **procesos** de contratación: **44 % adjudicado**.

**Cómo leerla.** El dato más visible es que **78,4 % de los contratos son contratación directa**. Es un **hecho estadístico**: la contratación directa es un mecanismo legal con causales definidas y **no implica** irregularidad por sí misma.

**Caveat principal.** La tabla de **procesos no trae el número de oferentes**, así que **la competencia efectiva no está disponible** en esta sección: no podemos decir cuántas empresas se presentaron a cada proceso.

## 4. ¿Qué se planea?

**Pregunta que responde:** ¿qué piensan comprar las entidades antes de contratar?

**Qué datos muestra.** Los **Planes Anuales de Adquisiciones (PAA)** publicados en SECOP II: lo que las entidades **proyectan** adquirir. El total planeado asciende a **$58,6 billones COP**.

**Cómo leerla.** El PAA es **intención de compra**, no ejecución. Sirve para comparar lo planeado con lo efectivamente contratado, pero un plan elevado no equivale a gasto realizado.

**Caveat principal.** El PAA solo cubre **2024–2026**. No hay planes anteriores en el snapshot, así que esta sección no es comparable con todo el rango histórico de las demás.

## 5. ¿En qué se invierte?

**Pregunta que responde:** ¿en qué proyectos de inversión se asigna el presupuesto público?

**Qué datos muestra.** Datos de **BPIN** (Banco de Proyectos de Inversión Nacional, DNP): **$424,8 billones** de presupuesto vigente, con **34 % ejecutado**.

**Cómo leerla.** Es la mirada **presupuestal por proyecto**, complementaria a los contratos. El porcentaje ejecutado indica avance del gasto programado.

**Caveat principal.** BPIN refleja **presupuesto vigente 2025–2026**, no toda la ventana 2022–2026. Las cifras de inversión **no son comparables directamente** con el valor de los contratos de SECOP II: son universos y unidades distintas.

## 6. ¿Se ejecuta?

**Pregunta que responde:** ¿cuánto de lo contratado se factura y se paga realmente?

**Qué datos muestra.** El embudo de ejecución: **contratado $584,8 B → facturado $190,7 B → pagado $154,5 B**.

**Cómo leerla.** Muestra que entre **firmar** un contrato y **pagarlo** hay caídas naturales: contratos en curso, pagos por etapas, vigencias futuras. Una brecha entre contratado y pagado **no implica** incumplimiento; mucha contratación está simplemente en ejecución.

**Caveat principal.** La tabla de **facturas está vacía** en la fuente, así que la ejecución **se calcula desde columnas del propio contrato** (montos facturado/pagado reportados), no desde un registro independiente de facturas. Es una aproximación basada en lo que reporta cada entidad.

## 7. ¿Dónde?

**Pregunta que responde:** ¿cómo se distribuye geográficamente la contratación?

**Qué datos muestra.** Un **mapa coroplético por departamento**: el valor y el número de contratos de cada uno, con la normalización a código DANE (insensible a tildes y mayúsculas).

**Cómo leerla.** Bogotá y los departamentos con entidades nacionales concentran montos altos por la **ubicación de la entidad contratante**, no necesariamente del lugar donde se ejecuta la obra o el servicio.

**Caveat principal.** **~5 % de los contratos no tienen departamento mapeable** y quedan fuera del mapa. La corrección de tildes (ver [Auditoría de datos](06-Auditoria-De-Datos.md)) ya recuperó a Bogotá, que antes se perdía; aun así, un pequeño residuo no es geolocalizable.

## 8. ¿Hay señales?

**Pregunta que responde:** ¿hay indicadores estadísticos que valga la pena observar?

**Qué datos muestra.** Indicadores **descriptivos**, combinando varias fuentes:

- **Concentración:** el **top-10 de contratistas = 7 %** del valor total.
- **Sanciones SIRI** (Procuraduría): **13.441** registros.
- **Financiación electoral** (Cuentas Claras, CNE): **$1,34 billones** en aportes de campaña.

**Cómo leerla.** Son **hechos estadísticos**, nunca acusaciones. Una concentración del 7 % o la existencia de sanciones SIRI son **observaciones**; no señalan culpables ni infieren irregularidad. Cada indicador lleva su nota metodológica.

**Caveat principal.** Estos números **describen, no juzgan**. La presencia de un dato (una sanción, un aporte, una concentración) no establece relación causal con ningún contrato. Ver [Metodología](03-Metodologia.md).

## 9. ¿Se cruzan los datos?

**Pregunta que responde:** ¿qué identificadores (NIT) aparecen en más de una fuente a la vez?

**Qué datos muestra.** Coincidencias de NIT entre conjuntos de datos públicos:

- **Donante ↔ contratista:** **27.488 NITs** coinciden, asociados a **$28,6 billones** en contratos.
- **Sancionado ↔ contratista:** **1.560 NITs** coinciden, asociados a **$6,8 billones**.

**Cómo leerla.** Que un NIT aparezca en dos listas es una **coincidencia de identificador**, **no** prueba de irregularidad ni de causalidad. Una empresa puede ser donante de campaña *y* contratar con el Estado de forma perfectamente legal, y una sanción puede ser ajena a sus contratos.

**Caveat principal.** Los datos **electorales solo cubren los ciclos 2022–2023**. El cruce es estructural (mismo NIT en dos fuentes) y debe leerse con la cautela máxima: **describe coincidencias, no conductas**.

## 10. Acerca

**Pregunta que responde:** ¿cómo se construyó esto y cuáles son sus límites?

**Qué datos muestra.** La ficha del proyecto: fuentes (SECOP II, BPIN, Sanciones SIRI, Aportes Cuentas Claras), licencia **Apache 2.0**, autores (Alejandro y Juan José Amorocho), arquitectura estática y la lista completa de *caveats*.

**Cómo leerla.** Es la lectura obligada antes de citar cualquier cifra. Resume por qué el total subestima el gasto, por qué 2026 es parcial y por qué se prioriza la mediana.

**Caveat principal.** Es la sección que **declara todos los caveats**: ningún dato del observatorio debe interpretarse sin leer esta página y la [Metodología](03-Metodologia.md).

---

## Caveats transversales

Algunas salvedades aplican a varias secciones a la vez. Vale la pena tenerlas presentes en todo el recorrido:

| Caveat | Afecta sobre todo a |
|--------|---------------------|
| El valor total subestima el gasto (sin SECOP I ni adiciones) | Inicio, ¿Quién?, ¿Dónde? |
| 2026 es parcial; 2022-H1 tiene baja cobertura | Todas las series temporales |
| ~5 % de contratos sin departamento mapeable | ¿Dónde? |
| Procesos no trae nº de oferentes (sin competencia) | ¿Cómo contrata? |
| Tabla de facturas vacía → ejecución desde contratos | ¿Se ejecuta? |
| PAA solo 2024–2026 | ¿Qué se planea? |
| BPIN es presupuesto vigente 2025–2026 | ¿En qué se invierte? |
| Electoral solo ciclos 2022–2023 | ¿Hay señales?, ¿Se cruzan? |
| Outliers de valor extremos (posibles errores de fuente) | Inicio, ¿Quién?, ¿Dónde? — por eso se muestra la mediana |

## Para profundizar

- **[De dónde vienen los datos](01-Fuentes.md)** — las fuentes y el esquema.
- **[Cómo se limpian y agregan](02-Datos-y-Materializacion.md)** — el materializador y las consultas.
- **[Metodología](03-Metodologia.md)** — qué calculamos y qué NO.
- **[Auditoría de datos](06-Auditoria-De-Datos.md)** — control de calidad y veracidad de las cifras.
- **[FAQ](05-FAQ.md)** — preguntas frecuentes.
