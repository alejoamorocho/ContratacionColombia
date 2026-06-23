# Guía de las secciones

El observatorio se navega **por preguntas**, no por menús técnicos. Cada sección plantea una pregunta sobre la contratación pública colombiana y la responde con datos abiertos oficiales, agregados sobre la ventana **2022–2026**. Cada sección tiene su propio **tono de color** (un acento visual por familia de pregunta), pero todas comparten el mismo principio rector: **describe, no juzga** (ver [Metodología](03-Metodologia.md)). Aquí hay datos organizados, no acusaciones.

Esta página recorre el observatorio sección por sección y, dentro de cada una, **gráfica por gráfica y KPI por KPI**: qué pregunta responde, qué muestra exactamente, **cómo leerla** y su salvedad (*caveat*) principal. Es la referencia exhaustiva: si una cifra aparece en la interfaz, está explicada aquí.

> **Antes de empezar — tres reglas de lectura que aplican a todo.**
>
> 1. **Todo está deduplicado por `id` de contrato** (ver [Auditoría de datos](06-Auditoria-De-Datos.md)). Un mismo contrato no se cuenta dos veces.
> 2. **El valor total subestima el gasto público real:** no incluye SECOP I ni las adiciones a contratos. Tómalo como **piso**, no como cifra completa.
> 3. **Junto a las sumas, mira siempre la mediana y los percentiles.** El total es sensible a un puñado de contratos de cuantía extrema (que pueden incluir errores de digitación de la fuente); la **mediana** describe mucho mejor el contrato típico.

---

## Mapa de navegación

El observatorio organiza sus contenidos en **cinco familias de preguntas** más Inicio y Acerca. Algunas familias tienen una página principal y varias páginas analíticas hijas que profundizan en un aspecto. Esta es la estructura completa de la barra lateral:

| Familia (tono) | Página | Qué responde | Fuente principal |
|---|---|---|---|
| **Inicio** (contexto) | Inicio | ¿Qué es esto y cuál es el panorama? | Editorial + SECOP II |
| **¿Quién contrata?** (who) | Entidades y contratistas | ¿Quiénes reciben la contratación? | SECOP II — contratos |
| | Género | ¿Quién firma: hombres o mujeres? | SECOP II — contratos |
| | PYMEs | ¿Cuánto llega a pequeñas y medianas empresas? | SECOP II — contratos |
| **¿Cómo contrata?** (how) | Modalidades y procesos | ¿Por qué mecanismos contrata? | SECOP II — contratos + procesos |
| | Planeación (PAA) | ¿Qué planea comprar? | SECOP II — PAA |
| | Inversión (BPIN) | ¿En qué invierte el presupuesto? | BPIN (DNP) |
| | Ejecución y pagos | ¿Se ejecuta lo contratado? | SECOP II — contratos |
| | Duración / Estacionalidad / Financiación | Plazos, calendario y bolsas de recursos | SECOP II — contratos |
| **¿Dónde?** (where) | Mapa por departamento | ¿Cómo se reparte territorialmente? | SECOP II — contratos |
| | Crecimiento 2023–2025 | ¿Qué sectores subieron o bajaron? | SECOP II — contratos |
| **¿Hay señales?** (signal) | Concentración y registros | Indicadores descriptivos del mercado | SECOP II + SIRI + CNE |
| | Donantes y sancionados (Cruces) | Coincidencias de NIT entre fuentes | SECOP II + CNE + SIRI |
| **Acerca** (contexto) | Acerca | ¿Cómo se hizo y cuáles son sus límites? | Documentación |

> **Nota sobre los colores de tono.** `context` (Inicio/Acerca), `who` (¿Quién?), `how` (¿Cómo?), `where` (¿Dónde?) y `signal` (¿Señales?/Cruces) son etiquetas visuales que ayudan a ubicarte; no tienen significado estadístico.

---

## 1. Inicio

**Pregunta que responde:** ¿qué es este observatorio y qué dice el panorama general de la contratación pública 2022–2026?

**Qué muestra.** Es la **portada editorial**. Abre con una frase de encuadre — *«Describe, no juzga: aquí hay datos organizados, no acusaciones»* — y presenta cinco tarjetas-KPI con la escala nacional, seguidas de la serie de valor contratado por año y un panel de navegación con las ocho preguntas del sitio.

**Los cinco KPI nacionales:**

| KPI | Valor | Cómo leerlo |
|---|---|---|
| Contratos | **3.969.440** | Total de contratos firmados en la ventana, deduplicados por `id`. |
| Valor total | **$583,8 billones COP** | Suma del valor firmado. Es un **piso**: sin SECOP I ni adiciones. |
| Valor mediano | **$20,06 millones** | El contrato «normal». Describe mejor el típico que el promedio. |
| Entidades | **4.690** | Entidades contratantes únicas. |
| Contratistas | **954.767** | Contratistas únicos (por NIT). |

**La gráfica «Valor contratado por año».** Una línea con el valor firmado en cada vigencia: 2022 ($102,7 B), 2023 ($127,2 B), 2024 ($123,0 B), 2025 ($172,7 B) y 2026 ($58,4 B, parcial). El pie de gráfica advierte que **2026 es un año parcial**.

**Cómo leerla.** Es el punto de partida. Las cifras grandes (total, número de contratos) dan **escala**; la **mediana de $20,06 M** describe el contrato típico mucho mejor que el promedio, que está inflado por valores extremos. El salto de 2025 y la caída aparente de 2026 son, respectivamente, una vigencia completa de alta actividad y una vigencia que apenas arranca.

**Caveat principal.** El total **subestima el gasto público**: faltan SECOP I y las adiciones. Y **2026 es parcial** (solo contratos firmados hasta el corte de datos), así que su barra no es comparable con los años cerrados.

---

## 2. ¿Quién contrata?

> Página principal de la familia **who**. La acompañan dos páginas analíticas hijas: **Género** y **PYMEs** (más abajo).

**Pregunta que responde:** ¿quiénes reciben la contratación pública — qué entidades gastan más y qué contratistas captan más recursos?

**Qué muestra.** Las dos puntas de la relación contractual, por **valor contratado** (2022–2026). Suma el campo `valor` por entidad y por contratista, con contratos deduplicados y valor &gt; 0.

### Gráficas y KPIs

**a) Entidades que más contratan (por valor).** Barras horizontales con las 15 entidades de mayor valor. **Cada entidad se identifica por NIT y se etiqueta con su nombre más frecuente** (`APPROX_TOP_COUNT`): así, las múltiples grafías de una misma entidad en la fuente quedan bajo un solo nombre legible —por ejemplo, *«ICBF Sede Nacional»*— en vez de fragmentarse.

**b) Por nivel de gobierno.** El gasto agrupado por `orden` (Nacional, Territorial, Corporación Autónoma, etc.). Cerca del **17 % de los contratos no reporta nivel** y aparece como «Sin clasificar».

**c) Por categoría de objeto.** Las 15 mayores categorías temáticas (Construcción, Salud, Social, Educación…), por valor.

**d) Tamaño típico de contrato por modalidad** *(KPI nuevo).* Barras horizontales con tres marcas por modalidad: cuartil inferior (**p25**), **mediana (p50)** y cuartil superior (**p75**) del valor por contrato.

- **Cómo leerla.** La mediana describe el contrato «normal» de cada modalidad y es **robusta a cuantías extremas**. El contraste es nítido: la **licitación pública** tiene una mediana cercana a **$2.000 millones**, mientras la **contratación directa** ronda los **$20 millones**. Las modalidades competitivas mueven contratos mucho mayores que la directa.

**e) Antigüedad del contratista al firmar** *(KPI nuevo).* Distribución porcentual de los años entre la **matrícula mercantil (RUES)** y la firma del contrato, en cinco tramos (<1, 1–3, 3–5, 5–10, 10+ años).

- **Cómo leerla.** La empresa contratista **mediana tiene ~6,3 años** al firmar; un tercio (≈33 %) supera los 10 años. Es una lectura de **madurez del proveedor**, no de capacidad ni desempeño.
- **Caveat.** Solo cubre las empresas con matrícula RUES cruzable por NIT exacto (**~41,5 % de los contratos**); el resto son personas naturales u otros sin matrícula.

**f) Recurrencia de la relación entidad–contratista** *(KPI nuevo, «reincidencia»).* Para cada par único entidad–contratista cuenta cuántos contratos comparten, y reparte el universo en tramos (1, 2–4, 5–9, 10+) mostrando el **% de contratos** y el **% del valor** en cada tramo.

- **Cómo leerla.** La mayoría de la contratación ocurre en relaciones que **se repiten**: las relaciones de 2–9 contratos concentran la mayor parte de los contratos. Es una medida de **estabilidad/recurrencia** de proveedores, no de favoritismo.
- **Caveat.** Una relación recurrente es **frecuentísima y legítima** (servicios anuales, proveedor único, mercado pequeño). No insinúa nada.

**Caveat principal de la sección.** Un valor alto para una entidad o un contratista refleja **volumen de contratación reportada**, no un juicio: una entidad nacional grande naturalmente contrata más que un municipio pequeño. Los contratistas se cuentan por `contratista_nit`; un NIT mal reportado en la fuente puede inflar o fragmentar conteos —mostramos lo que la fuente publica.

### 2.1 Página hija · Género de quien firma

**Pregunta:** ¿quién firma los contratos, hombres o mujeres, y reciben lo mismo? **Qué muestra:** % de contratos firmados por mujeres vs. % del valor que reciben, más la mediana de valor por género y una serie anual. **Lectura:** las mujeres firman la mayoría de los contratos (~53 %), pero el valor adjudicado a contratistas con representante legal mujer (~41 %) queda **por debajo de su peso en número**. **Caveat:** el género corresponde al **representante legal**, no a la propiedad de la empresa (98 % de cobertura); los porcentajes se calculan sobre la base mujer+hombre.

### 2.2 Página hija · PYMEs

**Pregunta:** ¿cuánta contratación llega a pequeñas y medianas empresas? **Qué muestra:** peso PYME en número y en valor, y su participación **dentro de cada modalidad**. **Lectura:** las PYME firman cerca de **1 de cada 8 contratos** (~12,8 %) y captan algo más de **1 de cada 5 pesos**: pesan más en valor que en número. **Caveat clave:** `es_pyme` es **autodeclarado** por el contratista, no auditado; el 12,8 % nacional mezcla universos porque el denominador incluye la contratación directa (≈78 % del total, dominada por personas naturales donde el concepto PYME casi no aplica). El indicador informativo es la participación PYME **dentro de las modalidades competitivas**, mucho más alta.

---

## 3. ¿Cómo contrata?

> Página principal de la familia **how**. La acompañan las páginas Planeación (PAA), Inversión (BPIN), Ejecución y pagos, y las analíticas Duración, Estacionalidad y Financiación.

**Pregunta que responde:** ¿por qué mecanismos contrata el Estado, y cómo terminan los procesos?

**El dato de portada (callout).** **78,3 % de los *contratos*** se firman por contratación directa — pero como suelen ser de baja cuantía, concentran solo el **45,3 % del *valor***. Mirar número y peso juntos evita una lectura engañosa: la contratación directa es un mecanismo legal con causales definidas y **no implica** irregularidad por sí misma.

### KPIs de cabecera

| KPI | Valor | Significado |
|---|---|---|
| Directa · % de contratos | **78,3 %** | Peso de la directa por número de contratos. |
| Directa · % del valor | **45,3 %** | Peso de la directa por dinero. |
| Procesos publicados | **450.977** | Procesos de contratación abiertos. |
| % adjudicados | **44,1 %** | Procesos que llegaron a estado *Seleccionado*. |

### Gráficas

**a) Distribución por modalidad** (torta, por valor). Las 7 modalidades normalizadas: contratación directa, régimen especial, mínima cuantía, selección abreviada, licitación pública, concurso de méritos y «Otras».

**b) Evolución por modalidad y año** (líneas). Las 4 modalidades de mayor valor acumulado más una serie «Otras», año a año. El pie advierte que **2026 es parcial**.

**c) Resultado de los procesos por modalidad** (barras horizontales, % adjudicado). Revela un contraste fuerte: la contratación directa adjudica ~98,6 % de sus procesos, mientras el régimen especial adjudica ~15,6 % —porque su trámite y registro funcionan distinto.

**d) Mezcla de modalidades por nivel de gobierno** *(KPI nuevo).* Barras horizontales: para cada nivel (Nacional, Territorial, Corporación Autónoma, No clasificado) muestra el **% del número de contratos** que es Directa, Competitiva o Régimen especial.

- **Cómo leerla.** La **composición difiere** entre el nivel nacional y el territorial. Describe el *mix* de cada nivel; la contratación directa es legal en numerosos supuestos, así que esto no juzga.

**Caveat principal.** «Adjudicado» = estado **Seleccionado** en SECOP II; los procesos desiertos, cancelados o en trámite no cuentan como adjudicados. **El número de oferentes (la competencia efectiva) NO se publica:** la fuente abierta trae ese campo prácticamente vacío (>99 % de registros sin dato), por lo que **no es posible** reportar cuántas empresas se presentaron a cada proceso.

### 3.1 Página hija · Duración

**Pregunta:** ¿cuánto duran los contratos? **Qué muestra:** percentiles del plazo contratado (p25, mediana, p75, p90) y la mediana por modalidad. **Lectura:** la mitad se pactan a **151 días o menos** (~5 meses); 1 de cada 10 supera los 333 días. **Caveat:** es plazo **contratado** (fecha_inicio → fecha_fin), no ejecución real; se excluyen plazos fuera de [1, 3650] días.

### 3.2 Página hija · Estacionalidad

**Pregunta:** ¿en qué meses se mueve la contratación? **Qué muestra:** contratos por mes de firma, agregando 2023–2025 (años bien cubiertos). **Lectura:** **enero concentra ~13,6 %** de los contratos (1,6× un mes promedio): es el arranque de vigencia. Diciembre firma pocos contratos pero el mayor valor del año (~17,3 %), muy influido por unos pocos contratos de cuantía extrema. **Caveat:** se excluyen 2022 (1.er semestre subreportado, inflaba enero) y 2026 (parcial).

### 3.3 Página hija · Financiación

**Pregunta:** ¿con qué dinero se contrata? **Qué muestra:** valor contratado por bolsa pública (PGN, recursos propios, SGP, regalías). **Lectura:** el **PGN financia ~$204 billones** —más que las otras tres juntas—, seguido por recursos propios (~$119 B). **Caveat:** solo **~63 %** del valor total tiene fuente reportada; las bolsas no son excluyentes (un contrato puede combinar varias).

---

## 4. ¿Qué se planea?  ·  Planeación (PAA)

**Pregunta que responde:** ¿qué planea comprar el Estado antes de contratar?

**Qué muestra.** Los **Planes Anuales de Adquisiciones (PAA)** de SECOP II: lo que las entidades **declaran** que piensan contratar, deduplicado a la última versión por entidad-año.

**El dato de portada.** **644 entidades** han publicado su PAA, con **155.353 ítems** que suman **$58,6 billones COP** en intenciones de compra. Es una declaración previa, **no un compromiso** de contratación.

### KPIs y gráficas

| KPI | Valor |
|---|---|
| Ítems planeados | **155.353** |
| Valor planeado | **$58,6 billones COP** |
| Entidades con PAA | **644** |

**a) Valor planeado por año** (barras): 2024 (~$14,2 B), 2025 (~$32,7 B), 2026 (~$11,7 B).

**b) Top categorías (UNSPSC)** (barras horizontales): las 12 mayores categorías derivadas del segmento UNSPSC del ítem.

**c) Por modalidad prevista** (torta). Aquí la modalidad antes llamada «Otras» se etiqueta como **«No especificada»**: reúne los ítems que **NO declaran modalidad** en el plan (cerca del 39 % del valor). **Es dato faltante, no una modalidad real**, y es frecuente en la planeación temprana.

**d) Por origen de los recursos** *(KPI nuevo).* Barras horizontales con la bolsa pública prevista (recursos propios, presupuesto nacional, regalías, SGP, crédito, sin especificar).

- **Cómo leerla.** Es el lado «planeado» de la financiación. **Regalías concentra mucho valor en pocos ítems** (alto valor unitario). «Sin especificar» = ítems sin origen declarado.

**e) Fidelidad del plan: ítems con un proceso ya enlazado** *(KPI nuevo).* % de ítems del PAA que ya traen enlazado un proceso de contratación real (`procesos_relacionados`), por año: 2024 (~49,6 %), 2025 (~30,1 %), 2026 (~20,7 %).

- **Cómo leerla.** **Baja con la cercanía del año**: los planes más antiguos han tenido más tiempo de materializarse, por eso 2026 sale bajo. Es un **proxy de materialización**, no prueba de ejecución.
- **Caveat.** Un ítem sin enlace puede deberse a rezago al diligenciar, no a incumplimiento.

**Caveat principal.** El PAA es **intención de compra**, no ejecución, y **solo cubre 2024–2026**. No es comparable con todo el rango histórico de las demás secciones.

---

## 5. ¿En qué se invierte?  ·  Inversión (BPIN)

**Pregunta que responde:** ¿en qué proyectos de inversión se asigna el presupuesto público?

**Qué muestra.** Datos de **BPIN** (Banco de Proyectos de Inversión, DNP), deduplicados por id de proyecto. Es **presupuesto vigente/programado** (vigencias 2025–2026), no ejecución histórica.

**El dato de portada.** De **$424,8 billones** de presupuesto vigente se han pagado ~$144,5 B — el **34 % del total programado** a la fecha.

### KPIs y gráficas

| KPI | Valor |
|---|---|
| Proyectos | **104.695** |
| Presupuesto vigente | **$424,8 billones COP** |
| Pagado | **~$144,5 billones COP** |
| % ejecución | **~34 %** |

**a) Cadena de ejecución presupuestal** *(KPI nuevo).* Barras agrupadas por vigencia (2025, 2026) con los **cuatro estados** que recorre el presupuesto: **vigente → comprometido → obligado → pagado**.

- **Cómo leerla.** El presupuesto no se gasta de golpe: se compromete, luego se obliga y al final se paga. La **vigencia 2026 está en curso**: sus valores bajos son el ritmo normal de un año que apenas empieza, **no subejecución**. Por eso el «% ejecución» nacional mezcla un año casi cerrado (2025) con uno que arranca (2026).

**b) Inversión por sector** (barras horizontales, vigente vs. pagado): Transporte, Educación, Salud, Gobierno Territorial… las 12 mayores.

**c) Por fuente de financiación** (barras horizontales): el tipo de recurso que financia (Propios Territorio, PGN-Nación, SGP-Educación, SGR…).

**Caveat principal.** Los valores **SUMAN por línea presupuestal** (bpin × vigencia × recurso), por lo que un mismo proyecto puede aportar a varias filas. BPIN refleja **presupuesto vigente 2025–2026**, no toda la ventana. **No es comparable directamente con el valor de los contratos de SECOP II:** son universos y unidades distintas. Un % de ejecución bajo es normal a mitad de la vigencia.

---

## 6. ¿Se ejecuta?  ·  Ejecución y pagos

**Pregunta que responde:** ¿cuánto de lo contratado se factura y se paga realmente?

**Qué muestra.** El embudo de ejecución según las columnas del propio contrato en SECOP II: **contratado → facturado → pagado**.

**El dato de portada.** De cada 100 pesos contratados, solo **26,5 %** se reporta pagado en la fuente; la diferencia incluye contratos en ejecución y subreporte.

### KPIs y gráficas

| KPI | Valor |
|---|---|
| Contratado | **$583,8 billones COP** |
| Facturado | **$190,7 billones COP** |
| Pagado | **$154,5 billones COP** |
| % pagado | **26,5 %** |

**a) Contratado vs. facturado vs. pagado, por año** (líneas). El pie advierte que **2026 está doblemente incompleto**: es parcial por fecha de firma *y* los contratos recién firmados aún no han tenido tiempo de facturarse o pagarse. La caída de 2026 es **rezago contable**, no una caída real de ejecución.

**b) Cómo se reparte el pago, contrato a contrato** *(KPI nuevo, «distribución de pago»).* Barras con el % de contratos en cada tramo del ratio pagado/valor: 0 %, 1–30 %, 30–70 %, 70–99 %, ≥100 %.

- **Cómo leerla.** El «% pagado» agregado (26,5 %) esconde una realidad **bimodal**: entre los contratos con pago reportado, cerca de **la mitad están en 0 %** (en ejecución o aún sin pagar) y alrededor de **un tercio ya están al 100 % o más**. La **mediana del ratio** pagado/valor es **~25 %**. El porcentaje de cada tramo es sobre los contratos con pago reportado.

**Caveat principal.** Los campos `valor_facturado` y `valor_pagado` provienen de SECOP II y **solo están poblados en parte** de los contratos (cobertura ~91,7 % facturado, ~90,6 % pagado). Por eso los porcentajes son **cotas inferiores** debidas al subreporte, no necesariamente baja ejecución: el «% pagado» mezcla no-ejecución, subreporte y contratos recién firmados que aún no completan su ciclo de pago.

---

## 7. ¿Dónde?  ·  Mapa por departamento

> Página principal de la familia **where**. La acompaña la analítica **Crecimiento 2023–2025**.

**Pregunta que responde:** ¿cómo se distribuye territorialmente la contratación?

**Qué muestra.** Un **mapa coroplético de Colombia**: el **color representa el NÚMERO de contratos** por departamento (2022–2026); el valor total aparece en el tooltip y en las barras de abajo. El departamento sale de `entidad_departamento`, normalizado a **código DANE** (insensible a tildes y mayúsculas).

### Gráficas

**a) Mapa de Colombia** (coroplético por número de contratos).

**b) Top departamentos por valor** (barras horizontales, 15 mayores). Bogotá encabeza con holgura por concentrar entidades del orden nacional.

**c) Contratación per cápita por departamento** *(KPI nuevo).* Barras horizontales con el **valor contratado por habitante** (población: proyección DANE 2023, catálogo estático citado para reproducibilidad).

- **Cómo leerla.** **Reordena la lectura**: deja de dominar solo el tamaño absoluto y permite comparar departamentos grandes y pequeños en igualdad. Es población del departamento de la **entidad contratante**, no del lugar de ejecución.
- **Caveat.** Bogotá se **infla** porque concentra entidades del orden nacional cuyo gasto cubre todo el país.

**Cómo leer la sección.** Bogotá y los departamentos con entidades nacionales concentran montos altos por la **ubicación de la entidad contratante**, no necesariamente del lugar donde se ejecuta la obra o el servicio. No es un juicio de riesgo.

**Caveat principal.** Incluye los contratos con departamento identificable (**~95 % del total**); el ~5 % restante no reporta un departamento reconocible y **queda fuera del mapa**. La corrección de tildes (ver [Auditoría de datos](06-Auditoria-De-Datos.md)) ya recuperó a Bogotá, que antes se perdía.

### 7.1 Página hija · Crecimiento 2023–2025

**Pregunta:** ¿qué sectores subieron o bajaron entre 2023 y 2025? **Qué muestra:** variación porcentual del valor contratado por sector (se omite 2022 por baja cobertura). **Lectura:** de **30 sectores comparables**, 6 redujeron su valor; **Aseo** fue el de mayor alza (+140 %) y **Arrendamiento** la mayor caída (−31 %). **Caveat:** variación **nominal**, no ajustada por inflación; solo sectores con ≥300 contratos/año, y se descartan alzas dominadas por un único contrato de cuantía extrema. La variación no implica irregularidad.

---

## 8. ¿Hay señales?  ·  Concentración y registros

> Página principal de la familia **signal**, junto con Cruces. Reúne **tres registros públicos** —SECOP II, SIRI y CNE— de forma **agregada**, con espíritu de laboratorio de datos: **describir, no acusar**.

**Pregunta que responde:** ¿hay indicadores estadísticos del mercado que valga la pena observar?

**El encuadre (callout).** Estas cifras son **agregados estadísticos** de registros públicos. **No** cruzan sanciones ni aportes con contratos, ni mencionan nombres individuales: describen el mercado en conjunto, no a personas. Ninguna cifra de esta página implica irregularidad, conflicto de interés ni juicio sobre persona o entidad alguna.

### Bloque 1 · Concentración del mercado

| KPI | Valor |
|---|---|
| Top-10 concentra (valor) | **7,0 %** |
| Directa · % de contratos | **78,3 %** |

**Percentiles del valor por contrato** (barras: p10, p25, p50, p75, p90, p99). El pie advierte que la distribución tiene una **cola muy larga**: el p99 vale **decenas de veces la mediana** (≈$1.700 M vs. ≈$20 M). El salto final refleja esa cola —y posibles errores de digitación de cuantía extrema—, no el contrato típico (cercano a la mediana, p50).

**Concentración de proveedores por sector (HHI)** *(KPI nuevo).* Barras horizontales con el **índice Herfindahl-Hirschman** (0–10.000) por sector, que mide qué tan concentrado está el valor entre los proveedores de cada sector.

- **Cómo leerla.** Referencia internacional (DOJ): **<1.500 diversificado**, **1.500–2.500 moderado**, **>2.500 concentrado**. Un HHI alto en un mercado **pequeño** es esperable (pocos proveedores) y **no implica** colusión ni irregularidad.
- **Caveat.** Solo se incluyen sectores con **≥50 proveedores**, para que el índice sea informativo.

### Bloque 2 · Sanciones registradas (SIRI)

| KPI | Valor |
|---|---|
| Sanciones 2022–2026 | **13.441** |
| Con inhabilidad vigente | **24.939** |
| Inhabilidad mediana (meses) | **120** |

**Sanciones por año** (barras; pie de año parcial para 2026). **¿Quién recibe las sanciones? (tipo de sancionado)** (barras horizontales).

- **Cómo leerla.** El SIRI clasifica al sancionado por su **tipo o «calidad»** —miembro de la fuerza pública, servidor público, particular, contratista—, **no por la gravedad de la falta**. Cerca del **66 %** son de la fuerza pública: eso refleja el volumen de su **régimen disciplinario interno** (faltas del servicio), **no** que cometan más corrupción. Es composición del registro, no un señalamiento.

### Bloque 3 · Financiación de campañas (CNE)

| KPI | Valor |
|---|---|
| Aportes | **350.566** |
| Monto total | **$1,34 billones COP** |

**Aportes por partido (top 12)** y **Aportes por departamento (top 15)** (barras horizontales). Los **partidos están normalizados** para agrupar grafías de una misma colectividad.

- **Caveat.** Cubre **solo los ciclos electorales 2022–2023**. La vista por departamento **excluye los aportes a cargos nacionales** (~30 % del monto), que no tienen un departamento asignado.

**Caveat principal de la sección.** Estos números **describen, no juzgan**. Una concentración del 7 %, un HHI alto, una sanción o un aporte son **observaciones**; no señalan culpables ni infieren irregularidad ni establecen relación causal con ningún contrato. Cada indicador lleva su nota metodológica. Ver [Metodología](03-Metodologia.md).

---

## 9. ¿Se cruzan los datos?  ·  Donantes y sancionados (Cruces)

**Pregunta que responde:** ¿aparecen los mismos NITs en varios registros públicos a la vez?

**Qué muestra.** Coincidencias de **NIT exacto** entre el `contratista_nit` (SECOP II, deduplicado, valor &gt; 0) y otros registros. El emparejamiento por NIT exacto es **conservador**: puede **subestimar** coincidencias por diferencias de formato (dígito de verificación, ceros). Estos solapamientos **no son acusaciones**: son puntos de partida que requieren verificación humana.

> **Los cruces no son del mismo tipo.** **Donante ↔ Contratista** es una *coincidencia simple* (el NIT aparece como aportante en Cuentas Claras del CNE *y* como contratista, sin condición de tiempo). **Sancionado ↔ Contratista** es *temporal* (el NIT firmó contratos con fecha **posterior** a su primera sanción del SIRI). Por eso no son directamente comparables.

### Cruce A · Donante ↔ Contratista

| KPI | Valor |
|---|---|
| NITs que contratan y aportan | **27.488** |
| % de los contratistas | **~2,9 %** |
| Contratos de esos NITs | **120.229** |
| Valor de esos contratos | **$28,6 billones COP** |

**Gráfica «Aportes a campañas vs. valor contratado por los aportantes».** Dos barras a escala: aportes de campaña 2022–2023 (**$1,34 B**) frente al valor contratado por quienes aportaron (**$28,6 B**).

- **Cómo leerla.** Para dar escala: el total de aportes es **mucho menor** que el valor contratado por quienes aparecen como aportantes. Son **universos distintos** —un aporte no es un contrato— y la coincidencia **no implica causalidad**: contratar y aportar son actividades legales independientes.

### Cruce B · Sancionado ↔ Contratista

| KPI | Valor |
|---|---|
| NITs con contrato tras sanción | **1.560** |
| Contratos posteriores | **8.970** |
| Valor de esos contratos | **$6,8 billones COP** |

- **Cómo leerla.** 1.560 NITs del registro del SIRI firmaron contratos con fecha posterior a su sanción. Una sanción disciplinaria **no siempre inhabilita** para contratar y muchas inhabilidades pueden estar cumplidas: este dato **no afirma ilegalidad**, solo invita a verificar.

### Cruce C · Multa en SECOP ↔ Contratista *(KPI nuevo)*

| KPI | Valor |
|---|---|
| Multas registradas | **1.866** (2010–2026) |
| NITs multados | **1.233** |
| Multados que contratan | **270** |
| Valor contratado por ellos | **~$12,3 billones COP** |

- **Cómo leerla.** El registro de **multas contractuales** de SECOP es un mecanismo de cumplimiento distinto al SIRI disciplinario. 270 NITs multados también figuran como contratistas. Una multa contractual **no inhabilita** ni implica irregularidad futura; es una coincidencia factual que merece verificación caso por caso.
- **Caveat.** **Cobertura parcial:** muchas multas no llegan al registro estructurado de SECOP.

**Caveat principal de la sección.** Coincidir en dos registros públicos **no implica irregularidad**. Los datos electorales solo cubren los ciclos **2022–2023**. El cruce es estructural (mismo NIT en dos fuentes) y debe leerse con la **cautela máxima**: describe coincidencias, no conductas. Mostramos el dato; la interpretación es tuya.

---

## 10. Acerca

**Pregunta que responde:** ¿cómo se construyó esto y cuáles son sus límites?

**Qué muestra.** La ficha del proyecto: **ventana** (2022–2026), **fecha de corte de datos** y de generación, las **fuentes oficiales** (SECOP II contratos y procesos, PAA, BPIN del DNP, Sanciones SIRI de la Procuraduría, Aportes Cuentas Claras del CNE, y RUES/Supersociedades para los cruces), una tabla de **frescura de datos** (periodo, corte e ingesta por fuente), la lista completa de **notas y límites**, el repositorio y la licencia **Apache 2.0**, y la autoría (**Alejandro y Juan José Amorocho**).

**Cómo leerla.** Es la lectura obligada antes de citar cualquier cifra. Resume por qué el total subestima el gasto, por qué 2026 es parcial, por qué el 1.er semestre de 2022 tiene baja cobertura y por qué se prioriza la mediana.

**Caveat principal.** Es la sección que **declara todos los caveats**: ningún dato del observatorio debe interpretarse sin leer esta página y la [Metodología](03-Metodologia.md).

---

## Caveats transversales

Algunas salvedades aplican a varias secciones a la vez. Conviene tenerlas presentes en todo el recorrido:

| Caveat | Afecta sobre todo a |
|--------|---------------------|
| El valor total subestima el gasto (sin SECOP I ni adiciones) | Inicio, ¿Quién?, ¿Dónde?, ¿Se ejecuta? |
| 2026 es parcial; 2022-H1 tiene baja cobertura | Todas las series temporales |
| ~5 % de contratos sin departamento mapeable | ¿Dónde? |
| Procesos no trae nº de oferentes (sin competencia efectiva) | ¿Cómo contrata? |
| Facturado/pagado solo poblados en parte → cotas inferiores | ¿Se ejecuta? |
| PAA solo 2024–2026; «No especificada» = modalidad faltante | ¿Qué se planea? |
| BPIN es presupuesto vigente 2025–2026, no ejecución histórica | ¿En qué se invierte? |
| Electoral solo ciclos 2022–2023 | ¿Hay señales?, ¿Se cruzan? |
| Cruces por NIT exacto: conservadores, pueden subestimar | ¿Se cruzan los datos? |
| Outliers de valor extremos (posibles errores de fuente) | Inicio, ¿Quién?, ¿Dónde?, percentiles — por eso se muestra la mediana |
| Antigüedad y HHI solo sobre subconjuntos con cobertura suficiente | ¿Quién? (RUES ~41,5 %), ¿Señales? (≥50 proveedores) |

---

## Notas sobre robustez de los datos

El snapshot que alimenta estas secciones pasa por controles de calidad antes de publicarse:

- **Validación Zod en runtime.** Cada archivo `*.json` se valida contra un esquema al cargarse en el navegador: si su forma no coincide, la sección lo reporta en vez de mostrar números corruptos.
- **Guards anti-fragmentación.** El verificador del snapshot (`verify_snapshot.py`) comprueba, entre otras cosas, que las entidades no queden fragmentadas por grafías distintas del mismo NIT (de ahí el uso de `APPROX_TOP_COUNT` para el nombre más frecuente).
- **45 consultas SQL** en `data/queries/` producen los agregados; ninguna cifra se escribe a mano en el frontend.

---

## Para profundizar

- **[De dónde vienen los datos](01-Fuentes.md)** — las fuentes y el esquema.
- **[Cómo se limpian y agregan](02-Datos-y-Materializacion.md)** — el materializador y las consultas.
- **[Metodología](03-Metodologia.md)** — qué calculamos y qué NO.
- **[Cómo se calcula todo](13-Como-Se-Calcula-Todo.md)** — la fórmula detrás de cada cifra.
- **[Auditoría de datos](06-Auditoria-De-Datos.md)** — control de calidad y veracidad de las cifras.
- **[Los cruces](08-Los-Cruces.md)** — detalle de las coincidencias entre fuentes.
- **[Caveats y límites](09-Caveats-Y-Limites.md)** — todas las salvedades reunidas.
- **[FAQ](05-FAQ.md)** — preguntas frecuentes.
- **[Glosario](10-Glosario.md)** — términos técnicos.
