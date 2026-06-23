# Glosario

Términos de contratación pública colombiana y de análisis de datos, explicados en lenguaje claro. El objetivo es que **cualquier persona** pueda leer el observatorio sin un diccionario técnico al lado, y que quien venga del mundo de los datos entienda **cómo** se calculó cada cifra.

Como en todo el proyecto, las definiciones **describen, no juzgan**: nombrar una modalidad, una sanción, una concentración o una coincidencia es describir un hecho, nunca acusar (ver [Metodología](03-Metodologia.md)). Cada entrada explica **qué significa el término** y **por qué importa aquí** —qué pregunta del dashboard ayuda a responder y qué cuidado hay que tener al leerlo.

> **Cómo leer este glosario.** Los términos están en **orden alfabético**. Donde aporta contexto, se enlaza a la sección del dashboard o a la página de la wiki donde el término aparece en uso. Las cifras provienen del **snapshot vigente** (`public/data/*.json`, corte de datos 3-jun-2026, ventana **2022–2026**); son volátiles y se actualizan en cada materialización. Lo estable es el **método**, no el número exacto.

---

## Adición

Modificación de un contrato ya firmado que **aumenta su valor** (o, en la práctica, también su alcance). Permite ampliar lo contratado sin abrir un proceso nuevo, dentro de los límites que fija la ley.

**Por qué importa aquí.** El observatorio reporta los contratos que registran adiciones como un **hecho descriptivo** en la sección **¿Hay señales?**: en la ventana hay **311.567 contratos con adición** por **$60,4 billones**. Una adición es un instrumento legal y rutinario; su presencia **no implica** irregularidad. Se nombra el patrón, no se concluye nada sobre cada contrato. Ver [Las señales](07-Las-Secciones.md) y [Caveats](09-Caveats-Y-Limites.md).

## BPIN (Banco de Proyectos de Inversión Nacional)

Sistema del **DNP** (Departamento Nacional de Planeación) que registra los **proyectos de inversión pública** y el presupuesto asignado a cada uno. Responde a la pregunta "¿en qué se invierte?": a qué proyectos —vías, colegios, acueductos— se destina el dinero público.

**Por qué importa aquí.** BPIN aporta **$424,8 billones de presupuesto vigente** sobre **104.695 proyectos**, con un **34 % ejecutado** (pagado / vigente). Es **presupuesto**, no contratos: vive en un universo distinto al de SECOP II y **no debe sumarse** con el valor de los contratos —son cosas diferentes contadas con reglas diferentes. Además, refleja el presupuesto de las **vigencias 2025–2026**, no una serie histórica de inversión. Ver la sección **¿En qué se invierte?** en [Las secciones](07-Las-Secciones.md) y los límites en [Caveats](09-Caveats-Y-Limites.md).

## Cadena de ejecución BPIN (vigente → comprometido → obligado → pagado)

Las cuatro **etapas presupuestales** por las que pasa un peso de inversión BPIN. Es el ciclo de vida del dinero público, de la asignación al desembolso:

| Estado | Qué significa |
|---|---|
| **Vigente** | Presupuesto disponible para gastar en la vigencia. |
| **Comprometido** | Reservado por un acto administrativo (p. ej., un contrato firmado). |
| **Obligado** | Reconocida la deuda: el bien o servicio se recibió y hay obligación de pagar. |
| **Pagado** | El dinero salió efectivamente del Estado. |

**Por qué importa aquí.** El observatorio muestra la cadena por año (2025 y 2026) para que la "ejecución" no se reduzca a un solo número. El monto **decrece** de vigente a pagado por diseño: lo comprometido es menor que lo vigente, lo obligado menor que lo comprometido, y lo pagado menor que lo obligado. La brecha es **natural**, no un faltante. Ver **Vigencia** y la sección **¿En qué se invierte?**.

## CNE (Consejo Nacional Electoral)

Autoridad que regula y vigila la **financiación de campañas políticas** en Colombia. Su plataforma **Cuentas Claras** registra los **aportes** (donaciones) que reciben los candidatos.

**Por qué importa aquí.** El observatorio toma de Cuentas Claras **350.566 aportes** por **$1,34 billones** a **115.036 candidatos**, con los **partidos normalizados** (un mismo partido escrito de varias formas se unifica). Estos aportes se cruzan **por NIT** con los contratistas para describir coincidencias —donantes que también contratan—, nunca para insinuar una relación causal. Ver **Cruce**, la sección **¿Quién financia campañas?** y [Fuentes](01-Fuentes.md).

## Comprometido / obligado / pagado

Tres momentos del **gasto público** que conviene no confundir (aplican tanto a la cadena BPIN como, conceptualmente, a la ejecución de contratos):

- **Comprometido** — el Estado se obligó a gastar (firmó el contrato), pero el dinero aún no ha salido.
- **Obligado** — ya se recibió el bien o servicio y existe la obligación de pagar.
- **Pagado** — el desembolso se hizo efectivamente.

**Por qué importa aquí.** Explican por qué **lo contratado no es lo pagado**. En la ventana hay **$583,8 billones contratados** pero solo **$154,5 billones pagados (26,5 %)**, en parte porque muchos contratos siguen vivos y se pagan en vigencias futuras. Ver **Vigencia**, **Ejecución** y la sección **¿Se ejecuta?**.

## Concentración

Indicador descriptivo que mide **qué porción del total se reparte entre pocos actores**. En el observatorio se reporta como el porcentaje del valor que se llevan los principales contratistas: el **top-10 de contratistas concentra el 7,0 %** del valor total (sobre **954.767 contratistas únicos**).

**Por qué importa aquí.** Una concentración alta o baja es un **hecho estadístico**, no un juicio. Que pocos actores concentren parte del valor puede tener explicaciones legítimas (mercados especializados, obras de gran escala). Aparece en la sección **¿Hay señales?**. Para concentración *por sector* se usa además el **HHI** (ver abajo). Ver [Metodología](03-Metodologia.md).

## Concurso de méritos

**Modalidad** de selección usada para contratar **servicios de consultoría y proyectos de arquitectura**, donde lo que se evalúa principalmente es la **idoneidad y experiencia** del proponente, no solo el precio. Es una de las 7 categorías canónicas de modalidad. Ver **Modalidad**.

## Contratación directa

**Modalidad** en la que la entidad contrata **sin proceso competitivo previo**, amparada en **causales definidas por la ley** (por ejemplo, urgencia manifiesta, contratos interadministrativos, prestación de servicios profesionales, o cuando no existe pluralidad de oferentes).

**Por qué importa aquí.** Es la modalidad **más frecuente por número de contratos** y conviene leerla con dos lentes distintos:

| Lente | Cifra | Lectura |
|---|---|---|
| **Por número de contratos** | **78,3 %** | 8 de cada 10 contratos se firman directamente (muchos son de bajo valor: prestación de servicios). |
| **Por valor** | **45,3 %** | Menos de la mitad del *dinero* va por esta vía; las modalidades competitivas concentran contratos más grandes. |

Que un mismo fenómeno cambie tanto según se mida por **conteo** o por **valor** es justo lo que el observatorio quiere mostrar. Es un **hecho estadístico descriptivo**: la contratación directa es un mecanismo **legal** y su alta frecuencia **no implica** irregularidad por sí misma. Ver la sección **¿Cómo contrata?** en [Las secciones](07-Las-Secciones.md).

## Contrato

Acuerdo **ya firmado** entre una entidad pública y un contratista para entregar un bien, una obra o un servicio a cambio de un pago. Es la **unidad básica** del observatorio: la ventana 2022–2026 contiene **3.969.440 contratos** por **$583,8 billones COP**, con una **mediana de $20,06 millones**.

**Por qué importa aquí.** Se distingue del **proceso** (ver abajo): el proceso es el *concurso* o trámite de selección; el contrato es el *resultado firmado*. No todo proceso termina en contrato, y la cuenta de contratos se hace **deduplicando por `id`** —cada contrato cuenta una sola vez, aunque la fuente lo haya reportado varias veces. Ver **Deduplicación** y [Datos y materialización](02-Datos-y-Materializacion.md).

## Contrato vs. proceso

Dos cosas distintas que conviene no confundir:

| | **Proceso** | **Contrato** |
|---|---|---|
| Qué es | El trámite o concurso de selección | El acuerdo ya firmado |
| Momento | Antes de adjudicar | Después de adjudicar |
| Ejemplo de dato | Estado (adjudicado, desierto, en curso) | Valor, fechas, contratista |
| En el observatorio | **44,1 % adjudicado** (de 450.977 procesos) | **3.969.440 contratos** |

Un proceso puede terminar **adjudicado** (deriva en contrato), desierto o anulado. La fuente de procesos **no trae el número de oferentes**, así que **no se puede medir la competencia**. Ver **Proceso** y la sección **¿Cómo contrata?**.

## DANE (código)

Código numérico que el **Departamento Administrativo Nacional de Estadística (DANE)** asigna a cada **departamento y municipio** de Colombia. Sirve como identificador estándar para ubicar geográficamente los datos.

**Por qué importa aquí.** Los departamentos de los contratos se **normalizan a código DANE** de forma **insensible a tildes y mayúsculas** (así "Bogotá", "BOGOTA" y "bogota" cuentan como el mismo lugar) para pintar el **mapa coroplético** y para calcular la contratación **per cápita**. Ver **Per cápita**, la sección **¿Dónde?** y [Auditoría de datos](06-Auditoria-De-Datos.md).

## Deduplicación

Proceso de **quedarse con una sola copia** de cada registro cuando la fuente lo reporta varias veces (por reingestas o versiones sucesivas). En SECOP II un mismo contrato o ítem puede aparecer repetido; contarlo tal cual **infla** los totales.

**Por qué importa aquí.** Es una pieza central de la honestidad de las cifras. El método varía según la tabla:

- **Contratos** — se deduplica por `id`, conservando una fila por contrato.
- **PAA** — deduplicación de **dos pasos**: primero la reingesta más reciente por `id`; luego la **última versión** de cada plan (`MAX(version_paa)`), porque un PAA se actualiza durante el año.
- **BPIN** — la línea de ejecución más reciente por `id` (`ROW_NUMBER ... fecha_ingesta DESC`).

Sin deduplicación, casi todas las cifras del observatorio estarían sobrecontadas. Ver [Datos y materialización](02-Datos-y-Materializacion.md) y [Cómo se calcula todo](13-Como-Se-Calcula-Todo.md).

## Ejecución

Grado en que un contrato (o un presupuesto) **se ha llevado a la práctica**: cuánto se ha facturado y pagado frente a lo contratado.

**Por qué importa aquí.** La tabla de facturas de SECOP II llegó **vacía**, así que la ejecución se calcula desde **columnas del propio contrato** (`valor_facturado`, `valor_pagado`). En la ventana: **$190,7 billones facturados** y **$154,5 billones pagados**, equivalentes al **26,5 % de lo contratado**. Ese porcentaje **bajo es esperable**: muchos contratos están vigentes y se pagarán después. Ver **Comprometido / obligado / pagado**, **Vigencia** y la sección **¿Se ejecuta?**.

## HHI (Índice Herfindahl-Hirschman)

Medida estándar de **concentración de un mercado**. Se calcula sumando los **cuadrados de las cuotas** de cada actor; va de **0** (competencia perfecta, muchos actores con cuotas mínimas) a **10.000** (un solo actor con el 100 %). Mientras más alto, más concentrado.

**Por qué importa aquí.** El observatorio calcula el HHI de **proveedores por sector** (cuota = valor de cada contratista sobre el total del sector), solo para sectores con **≥ 50 proveedores** —para no inflar el índice donde hay pocos datos. Un HHI alto en un sector describe que **pocos proveedores concentran el valor**; es un hecho, no un señalamiento, y puede reflejar mercados naturalmente especializados. Ver **Concentración** y la sección **¿Hay señales?**.

## Inhabilidad

Situación jurídica que **impide** a una persona o empresa **contratar con el Estado** durante un período. Puede originarse, por ejemplo, en una **sanción** disciplinaria o fiscal, o en un conflicto de intereses definido por la ley.

**Por qué importa aquí.** El observatorio **no determina** inhabilidades: solo describe la existencia de **registros públicos** (como las sanciones SIRI, con una mediana de inhabilidad de **120 meses**). Que un NIT aparezca en un listado **no equivale** a estar inhabilitado para un contrato concreto; esa es una determinación jurídica que el observatorio **no hace**. Ver **Sanción**, **SIRI** y [Caveats](09-Caveats-Y-Limites.md).

## Licitación pública

**Modalidad** de selección **abierta y competitiva**, usada típicamente para contratos de **mayor cuantía** (sobre todo obras). Cualquier proponente que cumpla los requisitos puede presentarse, y la entidad selecciona según reglas publicadas de antemano. Aunque es poco frecuente por número de contratos, **concentra mucho valor**: pocos contratos, pero grandes. Es una de las 7 categorías de modalidad. Ver **Modalidad**.

## Mediana

Valor que queda **justo en el medio** cuando se ordenan todos los contratos de menor a mayor: la mitad vale menos, la mitad vale más. En el observatorio, la mediana del valor de contrato es de **$20,06 millones**.

**Por qué importa aquí.** Se prefiere la mediana al **promedio** porque es **robusta a valores extremos**: unos pocos contratos gigantescos (algunos posibles errores de la fuente) **disparan el promedio** pero apenas mueven la mediana. Por eso la mediana describe mejor el **contrato típico**. La mediana es, además, el **percentil 50**. Ver **Outlier**, **Percentil** y [Caveats](09-Caveats-Y-Limites.md).

## Mínima cuantía

**Modalidad** simplificada para compras de **bajo valor** (por debajo de un umbral que la ley fija según el presupuesto de cada entidad). Tiene un trámite más ágil que la licitación o la selección abreviada. Es una de las 7 categorías de modalidad. Ver **Modalidad**.

## Modalidad (de contratación)

El **mecanismo** por el cual una entidad selecciona a quién contrata. La ley colombiana define varias modalidades según el tipo, el valor y las circunstancias del contrato. El observatorio **normaliza** las modalidades de la fuente a **7 categorías canónicas y legibles** (una sola vez, en la columna `modalidad_norm` de la tabla base, de forma insensible a mayúsculas y tildes):

| Modalidad | En breve | Cuota por nº de contratos |
|---|---|---|
| **Contratación directa** | Sin concurso, por causal legal | **78,3 %** (la más frecuente) |
| **Régimen especial** | Entidades con reglas propias | 14,6 % |
| **Mínima cuantía** | Compras de bajo valor, trámite ágil | 4,8 % |
| **Selección abreviada** | Procedimiento simplificado | 1,6 % |
| **Licitación pública** | Concurso abierto, mayores cuantías | 0,4 % |
| **Concurso de méritos** | Consultoría; se evalúa idoneidad | 0,2 % |
| **Otras** | Lo que no encaja limpiamente | ~0,0 % |

**Por qué importa aquí.** Nombrar la modalidad describe **cómo** se contrató, no si estuvo bien o mal. Normalizar a 7 etiquetas evita que un mismo mecanismo escrito de cinco formas aparezca cinco veces. La misma normalización se aplica al **PAA**, con una diferencia: ahí los ítems sin modalidad se rotulan **"No especificada"** (ver **PAA**). Ver la sección **¿Cómo contrata?**.

## NIT (Número de Identificación Tributaria)

Identificador único que la **DIAN** asigna a empresas y personas para efectos tributarios. En el observatorio funciona como la **llave** para identificar y agrupar contratistas y entidades, y para **cruzar** un mismo actor entre fuentes distintas.

**Por qué importa aquí.** Los cruces se hacen por **NIT exacto** (coincidencia idéntica), de forma deliberadamente **conservadora**: NITs mal escritos, con dígito de verificación distinto o ausente **no cruzan** aunque correspondan a la misma entidad. Esto **subestima** los cruces y nunca infiere identidad por nombre. Agrupar por NIT también consolida entidades nacionales que firman bajo un mismo número con decenas de nombres regionales (ver **Orden / nivel** y **Entidad**). Ver la sección **¿Se cruzan los datos?** y [Los cruces](08-Los-Cruces.md).

> **Nota sobre nombres de entidad.** Cuando varias filas comparten NIT pero traen nombres distintos, el observatorio muestra el **nombre más frecuente** (`APPROX_TOP_COUNT`), no uno al azar. Así, el NIT del ICBF aparece como "ICBF Sede Nacional" y no como "ICBF Regional Caquetá".

## Orden / nivel (de gobierno)

Clasificación de las entidades según el **nivel del Estado** al que pertenecen: **nacional** (ministerios, institutos como el ICBF o el SENA), **territorial** (gobernaciones, alcaldías), **corporación autónoma** (ambientales) o **no clasificado** cuando la fuente no lo permite determinar.

**Por qué importa aquí.** El nivel permite comparar **manzanas con manzanas**: la mezcla entre contratación competitiva y directa varía mucho entre lo nacional y lo territorial, y mezclarlos esconde esa diferencia. El observatorio reporta la **mezcla por nivel** (conteo y valor) en los KPIs analíticos. Es la base de la idea de **peer group**. Ver **Peer group** y **Modalidad**.

## Outlier (valor extremo)

Dato que se **aparta enormemente** del resto. En contratación aparecen **outliers de valor**: montos muy grandes que a veces son reales (una megaobra) y a veces son **errores de digitación de la fuente** (sumas imposibles para el objeto contratado).

**Por qué importa aquí.** El observatorio **no los borra ni los corrige** —alterar el dato crudo iría contra la transparencia—, sino que reporta la **mediana** y los **percentiles** junto al total, para que los extremos no distorsionen la lectura. Ver **Mediana**, **Percentil** y [Caveats](09-Caveats-Y-Limites.md).

## PAA (Plan Anual de Adquisiciones)

Documento en el que cada entidad **proyecta, al inicio del año, qué piensa comprar**: una **intención de compra**, no ejecución. Responde a "¿qué se planea?".

**Por qué importa aquí.** El PAA suma **$58,6 billones** planeados (155.353 ítems, 644 entidades), pero solo está disponible para **2024–2026** (no hay PAA para 2022–2023), así que **no es comparable** con toda la ventana de contratos. Dos detalles de método:

- **Modalidad "No especificada".** El grueso de los ítems del PAA **no declara modalidad** (~39 % del valor). Eso es **dato faltante**, no una categoría residual, por eso se rotula **"No especificada"** (no "Otras"): así no se lee como si fuera una modalidad real de selección.
- **Fidelidad del PAA.** El observatorio mide qué porcentaje de los ítems planeados **ya tiene un proceso enlazado** —una forma neutral de describir cuánto de lo planeado se está materializando.

Ver la sección **¿Qué se planea?** en [Las secciones](07-Las-Secciones.md).

## Peer group (grupo de pares)

Conjunto de actores **comparables entre sí** —por ejemplo, municipios de tamaño parecido, o entidades del mismo **nivel** o sector— que se agrupan para que las comparaciones sean **justas**. Comparar un municipio pequeño con un ministerio nacional no dice mucho; compararlo con municipios similares, sí.

**Por qué importa aquí.** La idea de peer group sostiene buena parte de la lectura del observatorio: un valor "alto" solo cobra sentido **frente a pares comparables**, no en abstracto. Por eso varios KPIs se desagregan por **nivel**, **sector** o **departamento**. Ver **Orden / nivel** y [Metodología](03-Metodologia.md).

## Per cápita

Cifra **dividida por la población** para hacer comparables territorios de distinto tamaño. La contratación per cápita de un departamento = valor total contratado allí ÷ habitantes.

**Por qué importa aquí.** En valor absoluto, los departamentos grandes (Bogotá, Antioquia, Valle) siempre encabezan. El per cápita **corrige por población** y deja ver qué territorios contratan más **por habitante**, que es otra historia. El observatorio usa un **catálogo de población DANE embebido** (proyecciones por código de departamento) para calcular tanto el **valor per cápita** como los **contratos per cápita**. Ver **DANE**, **Per cápita** en la sección **¿Dónde?** y [Cómo se calcula todo](13-Como-Se-Calcula-Todo.md).

## Percentil

Medida que indica **qué porcentaje de los datos queda por debajo** de cierto valor. Si un contrato está en el **percentil 90 (p90)** de valor, significa que es **más caro que el 90 %** de los contratos.

**Por qué importa aquí.** El observatorio usa percentiles (p10…p99) y **cuantiles** para describir distribuciones **sin promediar** sobre datos sesgados. Por ejemplo, en el valor por contrato: p25 ≈ $10,3 M, p50 (mediana) ≈ $20,0 M, p75 ≈ $40,5 M, p90 ≈ $83,7 M y p99 ≈ $1.696 M —el salto enorme hacia p99 es lo que justifica usar la **mediana** y no el promedio. Ver **Mediana** y [Metodología](03-Metodologia.md).

## Proceso (de contratación)

El **trámite de selección** mediante el cual una entidad escoge con quién contratar: la convocatoria, las reglas, las ofertas y la decisión. Es lo que ocurre **antes** del contrato firmado.

**Por qué importa aquí.** El **44,1 % de los procesos está adjudicado** (terminó eligiendo a alguien). La fuente de procesos **no trae el número de oferentes**, así que **no se puede medir la competencia** (cuántos se presentaron). Ver **Contrato vs. proceso** y la sección **¿Cómo contrata?**.

## Prórroga

Modificación que **extiende el plazo** de un contrato sin necesariamente cambiar su valor. Permite dar más tiempo para ejecutar lo ya pactado.

**Por qué importa aquí.** El observatorio describe, de forma neutral, los contratos **prorrogados sin ejecución reportada** (**91.238 contratos**, $20,5 billones) como un patrón observable en la sección **¿Hay señales?**. Una prórroga es legal y frecuente; el dato describe una **coincidencia** (plazo extendido + sin pagos registrados), que puede deberse a rezagos de reporte. No es una conclusión. Ver **Adición** y [Caveats](09-Caveats-Y-Limites.md).

## Reincidencia (relación entidad–contratista)

Cuántas veces una **misma pareja** entidad–contratista ha firmado contratos. Describe si la relación es **puntual** (una vez) o **recurrente** (muchas veces).

**Por qué importa aquí.** El observatorio agrupa las parejas en tramos (**1**, **2-4**, **5-9**, **10+** contratos) y reporta qué porcentaje de contratos y de valor cae en cada tramo. Una relación recurrente puede reflejar **especialización legítima** (un proveedor que conoce bien a la entidad) o simple continuidad operativa; es un hecho descriptivo, no un señalamiento. Ver la sección **¿Hay señales?**.

## Régimen especial

Conjunto de reglas de contratación **propias** de ciertas entidades que **no se rigen por el estatuto general** (por ejemplo, universidades públicas, empresas de servicios públicos o entidades financieras estatales). En el observatorio es una de las 7 categorías de **modalidad** (14,6 % de los contratos). Ver **Modalidad**.

## RUES (Registro Único Empresarial y Social)

Registro, administrado por las **Cámaras de Comercio**, que consolida información de las **empresas** del país: matrícula mercantil, fecha de constitución, estado, etc.

**Por qué importa aquí.** El observatorio usa RUES para estimar la **antigüedad del contratista al momento de firmar** (fecha de firma − fecha de matrícula). Solo cubre empresas con matrícula RUES **cruzable por NIT exacto**, así que la cobertura es **parcial**: la cifra describe a las empresas que sí cruzan, no a todos los contratistas. Ver **NIT** y la sección **¿Quién contrata?**.

## Sanción

**Decisión de una autoridad de control** que castiga una conducta de un servidor público o de un particular que contrata con el Estado. Las sanciones disciplinarias las registra la **Procuraduría** en el **SIRI**; también existen las **multas SECOP** (sanciones contractuales que impone la propia entidad y publica en SECOP).

**Por qué importa aquí.** El observatorio incluye **13.441 registros de sanciones SIRI** y los cruza por NIT con los contratistas (**1.560 NITs** sancionados que también contratan, por **$6,8 billones**). Una sanción es un **hecho registrado**, no una conclusión sobre los contratos de esa persona: el cruce **describe coincidencias, no conductas**. Ver **SIRI**, **Inhabilidad** y [Los cruces](08-Los-Cruces.md).

## SECOP (Sistema Electrónico de Contratación Pública)

Plataforma oficial de **Colombia Compra Eficiente** donde las entidades del Estado **publican** su contratación. Tiene dos generaciones: **SECOP I** (más antigua) y **SECOP II** (transaccional).

**Por qué importa aquí.** El observatorio usa **únicamente SECOP II** (contratos, procesos, PAA y facturas). **No ingiere SECOP I**, razón principal por la que el valor total **subestima** el gasto público real del país. Ver **SECOP II** y [Fuentes](01-Fuentes.md).

## SECOP II

La generación **transaccional** del SECOP: las entidades gestionan ahí todo el ciclo (publicación, proceso, contrato). Es la **fuente principal** del observatorio.

**Por qué importa aquí.** De SECOP II salen los **contratos**, los **procesos**, los **PAA** y la **tabla de facturas** (que llegó **vacía**, por lo que la ejecución se calcula desde columnas del propio contrato). Cubre la ventana **2022–2026**, con **baja cobertura en el primer semestre de 2022** y un **2026 parcial** (corte de datos a junio). Ver [Fuentes](01-Fuentes.md) y [Caveats](09-Caveats-Y-Limites.md).

## Selección abreviada

**Modalidad** con un procedimiento **simplificado** frente a la licitación, prevista para casos específicos: bienes y servicios de características técnicas uniformes (donde el precio es lo decisivo), menor cuantía, declaratorias de desierta, entre otros. Es una de las 7 categorías de modalidad. Ver **Modalidad**.

## SGR (Sistema General de Regalías)

Mecanismo que distribuye entre los territorios los **recursos de regalías** —los ingresos del Estado por la explotación de recursos naturales no renovables (petróleo, minería)— para financiar proyectos de inversión.

**Por qué importa aquí.** El observatorio no tiene una sección dedicada al SGR; se menciona porque parte de la **inversión** registrada en proyectos (ver **BPIN**) y del PAA puede financiarse con **regalías** (aparecen como un origen de recursos). Es contexto presupuestal, no una fuente independiente del snapshot.

## SIGEP (Sistema de Información y Gestión del Empleo Público)

Registro de **servidores públicos** y de sus hojas de vida y bienes. En la plataforma principal de VECTORVI alimenta cruces de conflicto de interés; en el **observatorio público** se menciona como contexto, no como una sección con cifras propias del snapshot.

**Por qué importa aquí.** Sirve para entender que existen registros de **personas** (no solo empresas) que, en la plataforma privada, permiten describir vínculos. El observatorio público se concentra en datos **agregados y abiertos**; SIGEP aparece aquí solo para ubicar el término. Ver [Fuentes](01-Fuentes.md).

## SIRI (Sistema de Información de Registro de Sanciones e Inhabilidades)

Base de la **Procuraduría General de la Nación** que registra **sanciones disciplinarias e inhabilidades** de servidores públicos y particulares. Es una de las cuatro fuentes de cruce del observatorio.

**Por qué importa aquí.** Aporta los **13.441 registros de sanciones** que se cruzan por NIT con los contratistas en la sección **¿Se cruzan los datos?**. Aparecer en SIRI es un **hecho registrado**; el observatorio no lo interpreta como prueba de irregularidad en un contrato concreto. Ver **Sanción**, **Inhabilidad** y [Fuentes](01-Fuentes.md).

## Snapshot

La **foto de datos** que alimenta el sitio: el conjunto de archivos `public/data/*.json` que el materializador genera **una vez** desde BigQuery y que el sitio estático sirve **sin consultar ninguna base en vivo**.

**Por qué importa aquí.** Hace el sitio **rápido, barato y reproducible**: cualquiera puede regenerar el mismo snapshot con las mismas queries (ver [Hacer un fork](04-Hacer-Un-Fork.md)). El snapshot trae su **corte de datos** y fecha de generación en `meta.json`. Antes de publicarse, pasa por **validación**: un **esquema Zod** en tiempo de ejecución (el sitio rechaza datos malformados) y **guardias estructurales** en `verify_snapshot.py` (entre ellas, una **guardia anti-fragmentación** que impide que una misma categoría aparezca partida en varias etiquetas, y una guardia de sentido sobre los valores de señales). Ver **Materialización** y [Datos y materialización](02-Datos-y-Materializacion.md).

## Materialización

El **acto de calcular** el snapshot: ejecutar las queries SQL sobre BigQuery, agregarlas y volcarlas a JSON. El repositorio incluye **45 archivos `.sql`** en `data/queries/` más KPIs analíticos calculados en `materialize_public.py`.

**Por qué importa aquí.** Separa el **cálculo** (caro, ocasional, sobre BigQuery) de la **lectura** (instantánea, sobre JSON estático). El frontend **nunca** toca BigQuery; solo lee lo ya materializado. Ese diseño es lo que permite publicar un observatorio nacional con costo casi nulo. Ver **Snapshot**, [Arquitectura](11-Arquitectura.md) y [Cómo se calcula todo](13-Como-Se-Calcula-Todo.md).

## UNSPSC (Código de Naciones Unidas para productos y servicios)

Estándar internacional que **clasifica** bienes y servicios mediante un código jerárquico. SECOP II lo usa para etiquetar **qué** se está contratando.

**Por qué importa aquí.** A partir del UNSPSC (y de otras señales del objeto) el observatorio deriva una **etiqueta de sector legible** (`objeto_label`: Construcción, Salud, Educación…), que es la que se ve en "top sectores", en el HHI por sector y en el crecimiento sectorial. La clasificación cruda es difícil de leer; la etiqueta normalizada la hace humana. Ver **Modalidad** (misma lógica de normalización) y la sección **¿Quién contrata?**.

## Vigencia

En lo presupuestal, la **vigencia** es el **año fiscal** al que pertenecen unos recursos. Cuando el observatorio dice que BPIN refleja **"presupuesto vigente 2025–2026"**, se refiere al presupuesto **disponible para esas vigencias**, no a una serie histórica de inversión.

**Por qué importa aquí.** También existen las **vigencias futuras** (compromisos que se pagarán en años posteriores), que explican en parte por qué entre **contratado** y **pagado** hay una brecha natural: parte de lo firmado se paga en vigencias siguientes. Ver **Cadena de ejecución BPIN**, **Comprometido / obligado / pagado** y la sección **¿Se ejecuta?**.

---

## Para profundizar

- **[Las secciones](07-Las-Secciones.md)** — dónde aparece cada término en el dashboard.
- **[Fuentes](01-Fuentes.md)** — SECOP II, PAA, BPIN, SIRI y aportes de campaña (CNE) en detalle.
- **[Datos y materialización](02-Datos-y-Materializacion.md)** — deduplicación, snapshot y validación.
- **[Metodología](03-Metodologia.md)** — qué se calcula y qué no (sin scoring, sin juicios).
- **[Los cruces](08-Los-Cruces.md)** — cómo se relacionan donantes, sancionados y contratistas por NIT.
- **[Cómo se calcula todo](13-Como-Se-Calcula-Todo.md)** — el detalle query por query.
- **[Caveats y límites](09-Caveats-Y-Limites.md)** — los límites reales de cada dato.
