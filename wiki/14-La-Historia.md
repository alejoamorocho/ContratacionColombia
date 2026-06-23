# La historia del proyecto

Esta página cuenta **todo el proyecto como un relato**: de dónde viene, por qué existe, qué decisiones lo definieron y a dónde va. Las otras páginas explican el *qué* y el *cómo*; esta explica el **porqué**. Si vas a entender una sola página de la wiki antes de forkear, citar o criticar el observatorio, que sea esta.

> **Idea central.** VECTORVI tomó una herramienta privada de inteligencia analítica y la convirtió en un **bien público**: un laboratorio ciudadano que organiza con rigor los datos abiertos de la contratación colombiana y los muestra **sin juzgar**, con todo su método a la vista, para que cualquiera pueda mirar —no para decirle qué pensar.

---

## Índice

1. [El origen: de herramienta privada a bien público](#1-el-origen-de-una-herramienta-privada-a-un-bien-público)
2. [El problema que resuelve](#2-el-problema-que-resuelve)
3. [La decisión que define todo: "describe, no juzga"](#3-la-decisión-que-define-todo-describe-no-juzga)
4. [La arquitectura como postura ética](#4-la-arquitectura-como-postura-ética)
5. [El viaje de un dato](#5-el-viaje-de-un-dato)
6. [Las decisiones difíciles y la honestidad sobre los límites](#6-las-decisiones-difíciles-y-la-honestidad-sobre-los-límites)
7. [El diseño: navegar por preguntas, no por tablas](#7-el-diseño-navegar-por-preguntas-no-por-tablas)
8. [El blindaje: cómo el proyecto se protege de sí mismo](#8-el-blindaje-cómo-el-proyecto-se-protege-de-sí-mismo)
9. [Por qué es open source](#9-por-qué-es-open-source)
10. [A dónde va](#10-a-dónde-va)

---

## 1. El origen: de una herramienta privada a un bien público

VECTORVI no nació como un dashboard público. Nació como una **plataforma privada de inteligencia analítica** sobre contratación estatal colombiana: cruzaba SECOP II, SIGEP, sanciones, registros societarios, financiación de campañas y elecciones para hacer *due diligence*, análisis de mercado y evaluación de riesgo. Era potente, pero también era **cerrada**: requería backend, cómputo, credenciales y, sobre todo, criterio para interpretarla. Era una herramienta para especialistas.

En algún momento apareció una pregunta incómoda: *si los datos son públicos, ¿por qué la mirada sobre ellos es privada?* Los contratos del Estado colombiano están en datos abiertos. SECOP II es consultable. El presupuesto de inversión, las sanciones, los aportes de campaña: todo está publicado. Lo que faltaba no era el dato, sino una forma **clara, honesta y gratuita** de mirarlo, sin pedirle a nadie que monte su propia infraestructura ni que confíe en un puntaje que no puede auditar.

De ahí salió este proyecto: tomar lo más valioso de la plataforma privada —el conocimiento de las fuentes, la limpieza de los datos, las preguntas correctas— y destilarlo en algo que **cualquiera** pudiera abrir en un navegador y entender en cinco minutos. No una versión recortada de un producto comercial, sino **otra cosa**: un observatorio ciudadano, neutral y abierto.

> El proyecto privado responde *"¿en quién debo confiar para contratar?"*. El observatorio público responde *"¿en qué se contrata el dinero de todos?"*. La segunda pregunta no necesita dueño.

### Dos productos, dos contratos sociales

La separación es deliberada y conviene tenerla clara desde el principio, porque explica casi todas las decisiones posteriores:

| | Plataforma privada (origen) | Observatorio público (este repo) |
|---|---|---|
| **Pregunta** | ¿En quién confío para contratar? | ¿En qué se gasta el dinero de todos? |
| **Granularidad** | Individual: NIT, perfil, red, score | Agregada: sumas, medianas, percentiles |
| **Veredicto** | Evalúa riesgo, ordena por mérito | No evalúa: describe coincidencias |
| **Infraestructura** | Backend, BigQuery en vivo, auth | Sitio estático, solo lee JSON |
| **Acceso** | Cerrado, credenciales | Abierto, navegador, fork libre |
| **Dato personal** | Sí (es su razón de ser) | No: el snapshot público es 100 % agregado |

Lo privado y lo público conviven sin contradicción. El **módulo de búsqueda y licitaciones** —que sí necesita cómputo y autenticación— vive aparte, en `/admin`, fuera del sitio público. El observatorio que cualquiera ve no tiene puertas traseras porque, literalmente, no tiene puertas.

## 2. El problema que resuelve

Colombia publica una cantidad enorme de datos de contratación. Eso es una buena noticia y, a la vez, un problema: **el dato abierto, por sí solo, no es transparencia**. Una base con casi cuatro millones de contratos —**3.969.440** en la ventana 2022–2026—, en columnas técnicas, con códigos, duplicados y valores atípicos, es opaca para casi todo el mundo. Un periodista de región, una veeduría ciudadana, un estudiante, no tienen cómo descargar, limpiar, deduplicar y agregar millones de filas para responder una pregunta tan simple como *"¿cuánto se contrató en mi departamento?"*.

VECTORVI cierra esa brecha. Hace **una vez**, bien y a la vista de todos, el trabajo pesado —limpieza, deduplicación, normalización, agregación— y publica el resultado como gráficas que responden preguntas en lenguaje humano. El valor no está en tener el dato (ya es público); está en **organizarlo con rigor y mostrarlo sin agenda**.

Para que la escala del trabajo sea concreta, estas son algunas de las cifras que el observatorio agrega y deja listas para mirar de un vistazo:

| Magnitud | Valor | Lectura honesta |
|---|---|---|
| Contratos (2022–2026) | **3.969.440** | Deduplicados por identificador |
| Valor contratado total | **$583,8 billones** | Cota inferior; sin SECOP I ni adiciones |
| Valor mediano por contrato | **$20,06 M** | El contrato *típico*, inmune a outliers |
| Entidades contratantes | **4.690** | Por NIT, con el nombre más frecuente |
| Contratistas | **954.767** | Por NIT |
| Concentración top-10 contratistas | **7,0 %** del valor | Mercado atomizado, no capturado |
| Contratación directa (por nº de contratos) | **78,3 %** | Mayoría en volumen |
| Contratación directa (por valor) | **45,3 %** | Menos de la mitad del dinero |

Cada una de estas cifras se calcula con una consulta SQL versionada (el repo contiene **45 archivos `.sql`** en `data/queries/`) y se reconcilia automáticamente antes de publicar. Cómo se obtiene cada número está en [Cómo se calcula todo](13-Como-Se-Calcula-Todo.md).

## 3. La decisión que define todo: "describe, no juzga"

La tentación, con datos de contratación pública, es obvia: convertirlos en un detector de corrupción. Poner semáforos, calcular un "índice de riesgo", rankear a los "peores", titular con escándalo. Es lo que más clics produce. Y es, deliberadamente, **lo que este proyecto se prohíbe hacer**.

La razón no es timidez, es honestidad intelectual. Un dato de contratación **no contiene** la información necesaria para juzgar. Que una entidad use mucho la contratación directa puede ser perfectamente legal. Que un NIT aparezca como donante de campaña *y* como contratista puede no tener nada de irregular. Que una sanción exista no significa que inhabilite para un contrato concreto. Decidir si algo está bien o mal exige ir a la **fuente primaria**, conocer el contexto jurídico y mirar el caso. Un dashboard que pretenda hacer ese juicio por el lector **estaría mintiendo** sobre lo que el dato permite afirmar.

Por eso el principio rector es **"describe, no juzga"**, y de él se derivan compromisos concretos que recorren todo el código:

- Las secciones se llaman **"señales"**, no "alertas". Una señal invita a mirar; una alerta afirma un problema.
- Los cruces **cuentan coincidencias**, no acusan. *"Estos NITs están en dos listas"* es un hecho aritmético, punto. Ejemplo: **270** NITs aparecen a la vez con multa registrada en SECOP y con contratos; eso es una coincidencia que vale la pena ver, no una acusación.
- **No hay scoring.** Ni puntaje de riesgo, ni índice de corrupción, ni ranking de sospechosos. Los "top" que se muestran son por **magnitud** (más valor, más contratos), nunca por mérito moral.
- El lenguaje es fiel: "categoría de objeto", no "sector sospechoso"; "concentración", no "monopolio corrupto"; "modalidad No especificada", no "modalidad oculta".

### El mismo principio, aplicado a los KPIs nuevos

A medida que el observatorio creció, se sumaron decenas de indicadores. Cada uno se diseñó para **describir una estructura**, no para emitir un veredicto. Algunos ejemplos del estado actual:

- **Distribución de pago.** En lugar de afirmar "el Estado no paga", se muestra el reparto real: **46,9 %** de los contratos figura con **0 %** pagado y **35,1 %** con **≥100 %**; el resto se reparte en tramos intermedios. La mediana de ejecución de pago ronda el **25 %**. La gráfica describe una distribución bimodal —rezago de reporte en datos abiertos— y deja que el lector la interprete.
- **Cadena BPIN (4 estados).** La inversión pública se muestra como una cascada *vigente → comprometido → obligado → pagado*, no como un "% de ejecución" suelto que sugiera incumplimiento. Con **$424,8 B vigentes** y **34 %** ejecutado agregado, el matiz importa: 2026 apenas empieza.
- **Concentración por sector (HHI).** El índice Herfindahl-Hirschman describe cuántos proveedores se reparten cada categoría. Un HHI alto se nombra "mercado concentrado", nunca "monopolio sospechoso"; un HHI bajo, "mercado atomizado".
- **Fidelidad del PAA.** Qué porción de lo planeado terminó en contratos (**49,6 %** en 2024, decreciente en años aún en curso) se presenta como *medida de planeación*, no como reproche.
- **Reincidencia, antigüedad del contratista, tamaño típico de contrato, multas, per cápita por departamento**: todos son descripciones estadísticas, con su *caveat* de cobertura visible.

Esta es la columna vertebral ética del proyecto. Todo lo demás —la arquitectura, el diseño, la metodología— es consecuencia de ella. El tratamiento completo está en [Metodología](03-Metodologia.md) y [Los cruces](08-Los-Cruces.md).

## 4. La arquitectura como postura ética

La decisión técnica más importante del observatorio público es que es **estático**. No tiene backend, ni base de datos, ni funciones en el sitio. Es una aplicación React que solo lee archivos JSON pre-calculados, servidos por un CDN. Y esto no es solo una elección de ingeniería: es una **postura**.

| Decisión técnica | Lo que significa para el ciudadano |
|---|---|
| **Sin backend** | No hay nada que manipular en vivo, ni un servidor que pueda "ajustar" un número según quién pregunte. |
| **Sin base de datos consultable** | Nadie consume recursos de nadie; el sitio no puede ser usado para extraer ni cruzar datos sensibles. |
| **Snapshot versionado en Git** | La "foto" de los datos está congelada y firmada en el historial. Puedes ver qué cambió y cuándo. |
| **Cómputo cero en el sitio** | No falla bajo carga, no tiene costo por usuario, se puede alojar en cualquier parte o incluso abrir localmente. |
| **Solo lee JSON agregado** | No hay nombres, NITs ni perfiles en el snapshot público: nada que perfilar a una persona. |

Un observatorio que pretende ser neutral **no debería** poder cambiar lo que muestra en tiempo real. Al ser estático, lo que ves es exactamente lo que está en el archivo público, y el archivo se generó con código que también es público. La arquitectura **hace creíble** la promesa de neutralidad: no hay que confiar en la buena fe de un servidor, porque no hay servidor. Detalle en [Arquitectura](11-Arquitectura.md).

> La neutralidad no se promete: se **construye en piedra**. Un número que no puede recalcularse a tu gusto en función de quién pregunta es, por diseño, un número que no negocia.

## 5. El viaje de un dato

Vale la pena seguir a un solo contrato desde la fuente hasta la pantalla, porque ese viaje **es** el proyecto:

```
  SECOP II            BigQuery              materialize_public.py        public/data/*.json        El navegador
 (dato abierto)   →  (tabla cruda)      →   limpia · dedup · agrega   →   (snapshot JSON)      →   gráfica + mapa
                       millones de filas      ventana 2022-2026,           versionado en Git         (solo lee JSON)
                                              valor>0, dedup por id,        validado con Zod
                                              modalidad→7 cats, DANE
```

1. **Nace** cuando una entidad publica un contrato en SECOP II.
2. **Se recolecta** en una tabla de BigQuery junto a millones de pares.
3. **Se limpia**: el materializador construye primero una tabla base `_contratos_pub` que descarta valores nulos y ≤ 0, fija la ventana 2022–2026, **deduplica** las versiones repetidas del mismo `id` (SECOP reingiere un pequeño porcentaje), normaliza la modalidad a una de **7 categorías**, el departamento a código **DANE** y agrupa cada entidad por NIT mostrando su **nombre más frecuente** (`APPROX_TOP_COUNT`, p. ej. *"ICBF Sede Nacional"*).
4. **Se agrega**: deja de ser un contrato individual y pasa a ser parte de una suma, una mediana, un percentil, una barra del mapa. **Aquí desaparece el dato personal**: el snapshot público es 100 % agregado, sin nombres de personas, sin perfiles.
5. **Se valida y se congela**: cada JSON debe satisfacer un **esquema Zod** en tiempo de ejecución del frontend y pasar el verificador `verify_snapshot.py` antes de quedar versionado en el repositorio.
6. **Se muestra** cuando alguien abre el dashboard y el navegador lee ese JSON.

Cada paso es auditable. Cómo se calcula **cada** número de ese viaje está en [Cómo se calcula todo](13-Como-Se-Calcula-Todo.md); cómo se limpia, en [Materialización](02-Datos-y-Materializacion.md); qué se encontró y corrigió, en [Auditoría de datos](06-Auditoria-De-Datos.md).

## 6. Las decisiones difíciles y la honestidad sobre los límites

Un proyecto honesto se reconoce en lo que **admite que no puede hacer**. Estas fueron algunas de las decisiones incómodas, y por qué se tomaron así:

- **Mostrar la mediana, no solo el total.** El valor total ($583,8 billones) impresiona, pero está sesgado por unos pocos contratos de cuantía extrema, algunos de los cuales son errores de digitación de la fuente. Borrarlos sería falsear el dato original; ignorarlos, engañar. La salida honesta: mostrar **también la mediana** ($20,06 M), que describe el contrato típico y es inmune a esos *outliers*.
- **No esconder los huecos.** 2026 es un año parcial. El primer semestre de 2022 tiene baja cobertura. El PAA solo existe desde 2024 ($58,6 B planeados por 644 entidades). BPIN es presupuesto vigente 2025–2026 ($424,8 B). Cerca del 5 % de contratos no tiene departamento mapeable. Indicadores como antigüedad del contratista tienen cobertura parcial (~41,5 %), y se declara. Nada de esto se oculta: cada sección lleva su *caveat* visible.
- **El total subestima el gasto.** No incluye SECOP I ni las adiciones. En lugar de inflar la cifra, se declara que es una **cota inferior**. Es preferible un número honesto y pequeño que uno grande y falso. Lo mismo con la ejecución de pago: lo facturado ($190,7 B) y lo pagado ($154,5 B) reflejan un **26,5 %** de avance reportado, con el rezago propio de los datos abiertos anotado al lado.
- **Coincidencia exacta de NIT, sin inferencia.** Los cruces no usan nombres parecidos ni redes societarias ni "probabilidad de ser la misma persona". Eso evita falsos positivos por homonimia, a costa de no detectar vínculos sutiles. Se prefiere **errar por prudencia**.
- **Nombrar lo que no se sabe.** Cuando una categoría no se puede determinar, se la llama por su nombre: la modalidad del PAA que antes se etiquetaba como "Otras" ahora es **"No especificada"**, y los partidos se muestran **normalizados** para no fragmentar el mismo partido en varias etiquetas. No se inventa una categoría limpia donde el dato es ambiguo.

La lista completa, sin letra pequeña, está en [Caveats](09-Caveats-Y-Limites.md). La filosofía detrás: *no pretendemos que los datos sean perfectos; pretendemos que sean transparentes.*

## 7. El diseño: navegar por preguntas, no por tablas

La mayoría de los portales de datos abiertos están organizados **por estructura técnica**: tablas, campos, filtros, descargas. VECTORVI se organiza **por preguntas humanas**: ¿Quién contrata? ¿Cómo? ¿Dónde? ¿Hay señales? La idea es que llegues con una duda y salgas con una gráfica, sin saber qué es un `objeto_clasificado` ni un `entidad_nit`.

| Pregunta del ciudadano | Sección | Lo que responde |
|---|---|---|
| ¿Qué tan grande es esto? | Panorama | Totales, mediana, serie por año, top sectores |
| ¿Quién contrata? | Quién | Entidades, niveles, concentración, género, pyme |
| ¿Cómo se contrata? | Cómo | Modalidades, directa vs. competitiva, tamaño típico |
| ¿Dónde? | Dónde | Mapa por departamento, valor absoluto y per cápita |
| ¿En qué se planeó y se invirtió? | Planeación / Inversión | PAA y cadena BPIN |
| ¿Hay coincidencias que mirar? | Señales | Cruces neutrales: sanciones, aportes, reincidencia |

El diseño visual sigue la misma intención: oscuro, sobrio, sin estridencias, con un **sistema de tonos** que da a cada grupo de preguntas su propio color sin convertir nada en una alarma roja. La paleta de Colombia —amarillo, azul, rojo— aparece, pero en el logo de nodos que late suavemente, no en semáforos de riesgo. La forma **refuerza** el fondo: un laboratorio de datos sereno, no un tablero de denuncias.

## 8. El blindaje: cómo el proyecto se protege de sí mismo

Un observatorio que pide confianza tiene que defenderse de su propio error. Si una regeneración futura del snapshot rompe un cálculo, fragmenta una categoría o introduce un número absurdo, el principio "describe, no juzga" se vería traicionado en silencio. Por eso, además del código que genera los datos, el repo incluye una capa de **verificación automática** que debe pasar antes de publicar:

- **`verify_snapshot.py`** reconcilia los JSON contra reglas de sentido y bloquea la publicación si algo no cuadra.
- **Guards anti-fragmentación.** Una verificación estructural impide que un mismo concepto aparezca dividido en etiquetas casi-duplicadas (p. ej. dos variantes del mismo partido, o dos modalidades que deberían ser una). Si detecta duplicados categóricos, falla.
- **Guardia de sentido en señales.** Ninguna suma de valores de una "señal" puede superar el universo del que proviene; si una coincidencia "pesa" más que el todo, hay un error y se detiene.
- **Validación Zod en runtime.** El frontend valida cada JSON contra su esquema al cargarlo: si la forma del dato no coincide con lo que el dashboard espera, se sabe de inmediato, no se renderiza una gráfica engañosa.

Este blindaje es coherente con la ética del proyecto: la neutralidad no depende de que los mantenedores nunca se equivoquen, sino de que **el sistema atrape el error antes de que llegue al lector**. Más detalle en [Auditoría de datos](06-Auditoria-De-Datos.md).

## 9. Por qué es open source

El observatorio se publica bajo licencia **Apache 2.0**, con todo su código: el frontend, el materializador, las **45 consultas SQL**, el verificador y esta wiki. Es una decisión coherente con todo lo anterior.

Si el proyecto pide confianza —"estos números son correctos y neutrales"—, la única forma legítima de pedirla es **permitir que cualquiera verifique**. Que el método sea auditable no es un extra: es la condición para que la neutralidad sea creíble. Por eso no hay fórmulas secretas ni pesos ocultos. Cualquiera puede:

- leer exactamente cómo se calculó cada cifra,
- correr el materializador y reconciliar los números,
- cambiar un umbral, usar otra ventana temporal,
- o construir su propia versión para su municipio o su sector.

Ver [Hacer un fork](04-Hacer-Un-Fork.md).

Y se publica con **crédito compartido**: el proyecto fue creado por **Alejandro y Juan José Amorocho**. Abrirlo es también una invitación: tómalo, mejóralo, llévalo a donde nosotros no llegamos.

## 10. A dónde va

El observatorio es una **foto fija** que se refresca a mano cuando los mantenedores regeneran el snapshot. Eso lo hace estable y barato, pero también deja camino por delante. Algunas direcciones naturales:

- **Per cápita ya está, profundizar.** El valor por habitante (con población DANE) ya permite comparar territorios de forma justa —no solo por tamaño absoluto—; queda extenderlo a más cortes y a nivel municipal.
- **Más ventanas y comparativos.** Series más largas a medida que mejore la cobertura histórica de SECOP II; hoy el comparativo de crecimiento cubre **30 sectores** (6 de los cuales cayeron entre 2023 y 2025).
- **Forks temáticos.** Versiones por departamento, por sector o por entidad, que la comunidad puede construir sobre la misma base.
- **Más fuentes abiertas.** Siempre bajo la misma regla: solo lo que tenga datos reales y se pueda mostrar de forma agregada y neutral —como ya se hizo con sanciones SIRI (**13.441** registros), aportes de campaña (**$1,34 B**), PAA, BPIN y multas SECOP.

Pero la dirección de fondo no cambia, porque es la misma con la que empezó: **hacer que mirar el dinero público sea fácil, honesto y de todos.**

---

> **En una frase.** VECTORVI tomó una herramienta privada de inteligencia y la convirtió en un bien público: un laboratorio ciudadano que organiza con rigor los datos abiertos de la contratación colombiana y los muestra sin juzgar, con todo su método —y su blindaje— a la vista, para que cualquiera pueda mirar, no para decirle qué pensar.

**Sigue leyendo:** [Qué es](00-Que-Es.md) · [Metodología](03-Metodologia.md) · [Cómo se calcula todo](13-Como-Se-Calcula-Todo.md) · [Auditoría de datos](06-Auditoria-De-Datos.md) · [Hacer un fork](04-Hacer-Un-Fork.md)
