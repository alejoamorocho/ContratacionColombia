# Glosario

Términos de contratación pública colombiana y de análisis de datos, explicados en lenguaje claro. El objetivo es que cualquier persona pueda leer el observatorio sin diccionario técnico al lado. Como en todo el proyecto, las definiciones **describen, no juzgan**: nombrar una modalidad, una sanción o una concentración es describir un hecho, nunca acusar (ver [Metodología](03-Metodologia.md)).

Los términos están en **orden alfabético**. Donde aporta contexto, se enlaza a la sección del dashboard o a la página de la wiki donde el término aparece en uso.

---

## BPIN (Banco de Proyectos de Inversión Nacional)

Sistema del **DNP** (Departamento Nacional de Planeación) que registra los proyectos de **inversión pública** y el presupuesto asignado a cada uno. Responde a la pregunta "¿en qué se invierte?": a qué proyectos —vías, colegios, acueductos— se destina la plata.

En el observatorio, BPIN aporta **$424,8 billones de presupuesto vigente** con un **34 % ejecutado**. Es **presupuesto**, no contratos: vive en un universo distinto al de SECOP II y **no debe sumarse** con el valor de los contratos. Además, refleja el presupuesto **vigente 2025–2026**, no una serie histórica. Ver la sección **¿En qué se invierte?** en [Las secciones](07-Las-Secciones.md) y los límites en [Caveats](09-Caveats-Y-Limites.md).

## Concentración

Indicador descriptivo que mide **qué porción del total se reparte entre pocos actores**. En el observatorio se reporta como el porcentaje del valor que se llevan los principales contratistas: el **top-10 de contratistas concentra el 7 %** del valor total.

Una concentración alta o baja es un **hecho estadístico**, no un juicio. Que pocos actores concentren parte del valor puede tener explicaciones legítimas (mercados especializados, obras de gran escala). Aparece en la sección **¿Hay señales?**; ver [Metodología](03-Metodologia.md).

## Concurso de méritos

**Modalidad** de selección usada para contratar **servicios de consultoría y proyectos de arquitectura**, donde lo que se evalúa principalmente es la **idoneidad y experiencia** del proponente, no solo el precio. Es una de las 7 categorías de modalidad a las que se normalizan los datos. Ver **Modalidad**.

## Contratación directa

**Modalidad** en la que la entidad contrata **sin proceso competitivo previo**, amparada en **causales definidas por la ley** (por ejemplo, urgencia manifiesta, contratos interadministrativos, prestación de servicios profesionales, o cuando no existe pluralidad de oferentes).

Es la modalidad **más frecuente** en los datos: **78,4 % de los contratos** son contratación directa. Esto es un **hecho estadístico descriptivo**: la contratación directa es un mecanismo **legal** y su alta frecuencia **no implica** irregularidad por sí misma. Ver la sección **¿Cómo contrata?** en [Las secciones](07-Las-Secciones.md).

## Contrato

Acuerdo **ya firmado** entre una entidad pública y un contratista para entregar un bien, una obra o un servicio a cambio de un pago. Es la unidad básica del observatorio: la ventana 2022–2026 contiene **3.969.440 contratos** por **$583,8 billones COP**, con una **mediana de $20 millones**.

Se distingue del **proceso** (ver más abajo): el proceso es el *concurso* o trámite de selección; el contrato es el *resultado firmado*. No todo proceso termina en contrato, y la cuenta de contratos se hace **deduplicando por `id`** (ver [Datos y materialización](02-Datos-y-Materializacion.md)).

## Contrato vs. proceso

Dos cosas distintas que conviene no confundir:

| | **Proceso** | **Contrato** |
|---|---|---|
| Qué es | El trámite o concurso de selección | El acuerdo ya firmado |
| Momento | Antes de adjudicar | Después de adjudicar |
| Ejemplo de dato | Estado (adjudicado, desierto, en curso) | Valor, fechas, contratista |
| En el observatorio | **44 % adjudicado** | 3.969.440 contratos |

Un proceso puede terminar **adjudicado** (deriva en contrato), desierto o anulado. Ver **Proceso** y la sección **¿Cómo contrata?**.

## DANE (código)

Código numérico que el **Departamento Administrativo Nacional de Estadística (DANE)** asigna a cada **departamento y municipio** de Colombia. Sirve como identificador estándar para ubicar geográficamente los datos.

En el observatorio, los departamentos de los contratos se **normalizan a código DANE** de forma **insensible a tildes y mayúsculas** (así "Bogotá", "BOGOTA" y "bogota" cuentan como el mismo lugar) para pintar el **mapa coroplético**. Ver la sección **¿Dónde?** y [Auditoría de datos](06-Auditoria-De-Datos.md).

## Inhabilidad

Situación jurídica que **impide** a una persona o empresa **contratar con el Estado** durante un período. Puede originarse, por ejemplo, en una **sanción** disciplinaria o fiscal, o en un conflicto de intereses definido por la ley.

El observatorio **no determina** inhabilidades: solo describe la existencia de registros públicos (como las **sanciones SIRI**). Que un NIT aparezca en un listado de sanciones **no equivale** a estar inhabilitado para un contrato concreto; esa es una determinación jurídica que el observatorio **no hace**. Ver **Sanción** y [Caveats](09-Caveats-Y-Limites.md).

## Licitación pública

**Modalidad** de selección **abierta y competitiva**, usada típicamente para contratos de **mayor cuantía** (sobre todo obras). Cualquier proponente que cumpla los requisitos puede presentarse, y la entidad selecciona según reglas publicadas de antemano. Es una de las 7 categorías de modalidad. Ver **Modalidad**.

## Mediana

Valor que queda **justo en el medio** cuando se ordenan todos los contratos de menor a mayor: la mitad vale menos, la mitad vale más. En el observatorio, la mediana es de **~$20 millones**.

Se prefiere la mediana al **promedio** porque es **robusta a valores extremos**: unos pocos contratos gigantescos (algunos posibles errores de la fuente) **disparan el promedio** pero apenas mueven la mediana. Por eso la mediana describe mejor el **contrato típico**. Ver **Outlier**, **Percentil** y [Caveats](09-Caveats-Y-Limites.md).

## Mínima cuantía

**Modalidad** simplificada para compras de **bajo valor** (por debajo de un umbral que la ley fija según el presupuesto de cada entidad). Tiene un trámite más ágil que la licitación o la selección abreviada. Es una de las 7 categorías de modalidad. Ver **Modalidad**.

## Modalidad (de contratación)

El **mecanismo** por el cual una entidad selecciona a quién contrata. La ley colombiana define varias modalidades según el tipo, el valor y las circunstancias del contrato. El observatorio **normaliza** las modalidades de la fuente a **7 categorías legibles**:

| Modalidad | En breve |
|---|---|
| **Contratación directa** | Sin concurso, por causal legal (la más frecuente: 78,4 %) |
| **Licitación pública** | Concurso abierto, mayores cuantías |
| **Selección abreviada** | Procedimiento simplificado para ciertos bienes/servicios |
| **Mínima cuantía** | Compras de bajo valor, trámite ágil |
| **Concurso de méritos** | Consultoría; se evalúa idoneidad |
| **Régimen especial** | Entidades con reglas propias (universidades, empresas públicas, etc.) |
| **Otras** | Lo que no encaja limpiamente en las anteriores |

Nombrar la modalidad describe **cómo** se contrató, no si estuvo bien o mal. Ver la sección **¿Cómo contrata?** en [Las secciones](07-Las-Secciones.md).

## NIT (Número de Identificación Tributaria)

Identificador único que la **DIAN** asigna a empresas y personas para efectos tributarios. En el observatorio funciona como la **llave** para identificar y agrupar contratistas, y para **cruzar** un mismo actor entre fuentes distintas.

Los cruces se hacen por **NIT exacto** (coincidencia idéntica), de forma deliberadamente **conservadora**: NITs mal escritos, con dígito de verificación distinto o ausente **no cruzan** aunque correspondan a la misma entidad. Esto **subestima** los cruces y nunca infiere identidad por nombre. Ver **¿Se cruzan los datos?** en [Las secciones](07-Las-Secciones.md) y [Los cruces](08-Los-Cruces.md).

## Outlier (valor extremo)

Dato que se **aparta enormemente** del resto. En contratación aparecen **outliers de valor**: montos muy grandes que a veces son reales y a veces son **errores de digitación de la fuente** (por ejemplo, sumas imposibles para el objeto contratado).

El observatorio **no los borra ni los corrige** —alterar el dato crudo iría contra la transparencia—, sino que reporta la **mediana** junto al total para que los extremos no distorsionen la lectura. Ver **Mediana** y [Caveats](09-Caveats-Y-Limites.md).

## PAA (Plan Anual de Adquisiciones)

Documento en el que cada entidad **proyecta, al inicio del año, qué piensa comprar**: una **intención de compra**, no ejecución. Responde a "¿qué se planea?".

En el observatorio, el PAA suma **$58,6 billones** planeados, pero solo está disponible para **2024–2026** (no hay PAA para 2022–2023), así que **no es comparable** con toda la ventana de contratos. Ver la sección **¿Qué se planea?** en [Las secciones](07-Las-Secciones.md).

## Peer group (grupo de pares)

Conjunto de actores **comparables entre sí** —por ejemplo, municipios de tamaño parecido, o entidades del mismo sector— que se agrupan para que las comparaciones sean **justas**. Comparar un municipio pequeño con un ministerio nacional no dice mucho; compararlo con municipios similares, sí.

La idea de peer group sostiene buena parte de la lectura del observatorio: un valor "alto" solo cobra sentido **frente a pares comparables**, no en abstracto. Ver [Metodología](03-Metodologia.md).

## Percentil

Medida que indica **qué porcentaje de los datos queda por debajo** de cierto valor. Si un contrato está en el **percentil 90 (p90)** de valor, significa que es **más caro que el 90 %** de los contratos.

El observatorio usa percentiles (p10…p90) y **cuantiles** para describir distribuciones **sin promediar** sobre datos sesgados. La **mediana** es, de hecho, el percentil 50. Ver **Mediana** y [Metodología](03-Metodologia.md).

## Proceso (de contratación)

El **trámite de selección** mediante el cual una entidad escoge con quién contratar: la convocatoria, las reglas, las ofertas y la decisión. Es lo que ocurre **antes** del contrato firmado.

En el observatorio, **el 44 % de los procesos está adjudicado** (terminó eligiendo a alguien). Importante: la fuente de procesos **no trae el número de oferentes**, así que **no se puede medir la competencia** (cuántos se presentaron). Ver **Contrato vs. proceso** y la sección **¿Cómo contrata?** en [Las secciones](07-Las-Secciones.md).

## Régimen especial

Conjunto de reglas de contratación **propias** de ciertas entidades que **no se rigen por el estatuto general** (por ejemplo, universidades públicas, empresas de servicios públicos o entidades financieras estatales). En el observatorio es una de las 7 categorías de **modalidad**. Ver **Modalidad**.

## Sanción

**Decisión de una autoridad de control** que castiga una conducta de un servidor público o de un particular que contrata con el Estado. Las sanciones disciplinarias las registra la **Procuraduría** en el **SIRI**.

El observatorio incluye **13.441 registros de sanciones SIRI** y los cruza por NIT con los contratistas (**1.560 NITs** sancionados que también contratan, por **$6,8 billones**). Una sanción es un **hecho registrado**, no una conclusión sobre los contratos de esa persona: el cruce **describe coincidencias, no conductas**. Ver **SIRI**, **Inhabilidad** y [Los cruces](08-Los-Cruces.md).

## SECOP (Sistema Electrónico de Contratación Pública)

Plataforma oficial de Colombia Compra Eficiente donde las entidades del Estado **publican** su contratación. Tiene dos generaciones: **SECOP I** (más antigua) y **SECOP II** (transaccional).

El observatorio usa **únicamente SECOP II** (contratos, procesos, PAA y facturas). **No ingiere SECOP I**, razón principal por la que el valor total **subestima** el gasto público real. Ver **SECOP II** y [Fuentes](01-Fuentes.md).

## SECOP II

La generación **transaccional** del SECOP: las entidades gestionan ahí todo el ciclo (publicación, proceso, contrato). Es la **fuente principal** del observatorio.

De SECOP II salen los **contratos**, los **procesos**, los **PAA** y la **tabla de facturas** (que llegó vacía, por lo que la ejecución se calcula desde columnas del propio contrato). Cubre la ventana **2022–2026**, con **baja cobertura en el primer semestre de 2022** y un **2026 parcial**. Ver [Fuentes](01-Fuentes.md) y [Caveats](09-Caveats-Y-Limites.md).

## Selección abreviada

**Modalidad** con un procedimiento **simplificado** frente a la licitación, prevista para casos específicos: bienes y servicios de características técnicas uniformes (donde el precio es lo decisivo), menor cuantía, declaratorias de desierta, entre otros. Es una de las 7 categorías de modalidad. Ver **Modalidad**.

## SGR (Sistema General de Regalías)

Mecanismo que distribuye entre los territorios los **recursos de regalías** —los ingresos del Estado por la explotación de recursos naturales no renovables (petróleo, minería)— para financiar proyectos de inversión.

El observatorio no tiene una sección dedicada al SGR; se menciona porque parte de la **inversión** registrada en proyectos (ver **BPIN**) puede financiarse con estos recursos. Es contexto presupuestal, no una fuente independiente del snapshot.

## SIRI (Sistema de Información de Registro de Sanciones e Inhabilidades)

Base de la **Procuraduría General de la Nación** que registra **sanciones disciplinarias e inhabilidades** de servidores públicos y particulares. Es una de las cuatro fuentes del observatorio.

Aporta los **13.441 registros de sanciones** que se cruzan por NIT con los contratistas en la sección **¿Se cruzan los datos?**. Aparecer en SIRI es un **hecho registrado**; el observatorio no lo interpreta como prueba de irregularidad en un contrato. Ver **Sanción** y [Fuentes](01-Fuentes.md).

## Vigencia

En lo presupuestal, la **vigencia** es el **año fiscal** al que pertenecen unos recursos. Cuando el observatorio dice que BPIN refleja **"presupuesto vigente 2025–2026"**, se refiere al presupuesto **disponible para esas vigencias**, no a una serie histórica de inversión.

También existen las **vigencias futuras** (compromisos que se pagarán en años posteriores), que explican en parte por qué entre **contratado** y **pagado** hay una brecha natural: parte de lo firmado se paga en vigencias siguientes. Ver la sección **¿Se ejecuta?** en [Las secciones](07-Las-Secciones.md).

---

## Para profundizar

- **[Las secciones](07-Las-Secciones.md)** — dónde aparece cada término en el dashboard.
- **[Fuentes](01-Fuentes.md)** — SECOP II, BPIN, SIRI y aportes de campaña en detalle.
- **[Metodología](03-Metodologia.md)** — qué se calcula y qué no (sin scoring, sin juicios).
- **[Los cruces](08-Los-Cruces.md)** — cómo se relacionan donantes, sancionados y contratistas por NIT.
- **[Caveats y límites](09-Caveats-Y-Limites.md)** — los límites reales de cada dato.
