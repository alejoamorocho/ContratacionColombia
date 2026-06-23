# Preguntas frecuentes (FAQ)

Respuestas claras y neutrales a las dudas más comunes sobre el observatorio. Todo el proyecto se rige por un solo principio, que conviene tener presente al leer cualquier cifra de este sitio: **describe, no juzga**. Si una respuesta te deja con ganas de más, al final de cada bloque hay enlaces a la página que profundiza.

> **La pregunta que más se repite, de una vez:** *¿esto dice quién es corrupto?* **No.** El observatorio organiza y muestra **datos públicos**. No juzga, no acusa, no califica a nadie. Ninguna cifra de este sitio es una conclusión sobre legalidad o conducta. Ver [Metodología](03-Metodologia.md).

## Índice de preguntas

- [Sobre el enfoque (qué es y qué no es)](#sobre-el-enfoque-qué-es-y-qué-no-es)
- [Sobre los cruces de datos](#sobre-los-cruces-de-datos)
- [Sobre las secciones de planeación, inversión y ejecución](#sobre-las-secciones-de-planeación-inversión-y-ejecución)
- [Sobre las cifras y sus límites](#sobre-las-cifras-y-sus-límites)
- [Sobre las personas y la privacidad](#sobre-las-personas-y-la-privacidad)
- [Sobre la actualización](#sobre-la-actualización)
- [Sobre el uso, la cita y la licencia](#sobre-el-uso-la-cita-y-la-licencia)
- [Sobre el funcionamiento técnico y el fork](#sobre-el-funcionamiento-técnico-y-el-fork)
- [Sobre las fuentes y los errores](#sobre-las-fuentes-y-los-errores)

---

## Sobre el enfoque (qué es y qué no es)

### ¿Esto dice quién es corrupto o señala culpables?
No. El proyecto **describe** datos abiertos; no emite juicios. Una cifra alta, una concentración o una coincidencia entre listados es un **hecho estadístico descriptivo**, no una acusación. No hay scores de riesgo, ni rankings de "los peores", ni semáforos, ni etiquetas de "sospechoso". Toda interpretación sobre legalidad o conducta queda **fuera del alcance** del sitio y corresponde a las autoridades competentes y a la verificación en la fuente primaria. Ver [Metodología](03-Metodologia.md) y [Caveats y límites](09-Caveats-Y-Limites.md).

### Entonces, ¿para qué sirve?
Para **hacerse preguntas** sobre la contratación pública con datos organizados: ver escalas, patrones, distribuciones geográficas, tendencias en el tiempo y coincidencias entre fuentes. Es un **punto de partida para investigar**, no un veredicto. Quien quiera afirmar algo sobre un caso concreto debe ir a la **fuente primaria** (SECOP II, SIRI, Cuentas Claras, BPIN) y verificar. El observatorio te dice *dónde mirar*; no responde por ti.

### ¿Por qué insisten tanto en "describe, no juzga"?
Porque los datos abiertos de contratación se prestan a interpretaciones apresuradas. Una empresa puede tener mil contratos por ser grande, no por nada irregular. Una entidad puede usar mucha contratación directa porque la ley se lo permite en numerosos supuestos. Marcar la frontera entre **describir un hecho** y **juzgar a una persona** es lo que mantiene al proyecto honesto y útil. Todo el diseño —sin scoring, sin rankings de culpables, sin lenguaje acusatorio— responde a ese principio. Ver [Metodología](03-Metodologia.md).

### ¿Por qué no hay un puntaje de riesgo (0 a 100) por entidad o contratista?
Porque un puntaje **comprime un juicio** en un número: decide implícitamente qué es "malo" y cuánto pesa. Eso es exactamente lo que el observatorio evita. En su lugar mostramos **distribuciones, percentiles y conteos** que cada quien interpreta con su propio criterio. Un percentil 99 de valor solo significa "contrato de cuantía muy alta", no "contrato problemático".

### ¿Hay alguna sección que sí "acuse"?
Ninguna. Incluso las secciones que cruzan listados (donantes, sancionados) están redactadas en términos de **coincidencia de identificadores**, no de irregularidad. Las notas metodológicas de cada gráfica lo repiten explícitamente. Ver [Los cruces](08-Los-Cruces.md).

---

## Sobre los cruces de datos

### ¿Cómo se hacen los cruces? ¿Usan nombres parecidos o redes de personas?
No. El cruce es **coincidencia exacta de NIT**: el mismo identificador, normalizado, presente en ambas fuentes. No usamos nombres similares, parentescos, ni "probabilidad de ser la misma persona". El método es deliberadamente **conservador**:

- **Ventaja:** evita falsos positivos por homonimia (dos "Juan Pérez" distintos nunca se confunden).
- **Costo:** **subestima** los cruces reales. Si un NIT está mal digitado en una fuente, o si una persona natural aparece sin NIT, simplemente **no coincide** y queda fuera del cruce.

En resumen, un cruce solo afirma: *este identificador está en ambas listas*. Ver [Los cruces](08-Los-Cruces.md).

### En "¿Se cruzan los datos?" aparece mi empresa (o alguien que conozco) junto a donantes o sancionados. ¿Eso la acusa de algo?
No. Que un **NIT** aparezca en dos listas públicas a la vez es una **coincidencia aritmética**, no una irregularidad. El cruce no afirma causalidad, ni temporalidad, ni ilegalidad. No dice "esta empresa donó *para* ganar contratos"; solo dice "este NIT figura como donante **y** como contratista". La explicación puede ser perfectamente legítima.

### ¿Los aportes a campañas son ilegales? ¿Por qué los muestran junto a contratos?
**Aportar a una campaña es legal.** La financiación electoral está regulada y reportarla es obligatorio —por eso existe **Cuentas Claras** del CNE—. Que una persona o empresa done **y** además contrate con el Estado no es, por sí solo, una infracción. El cruce donante ↔ contratista cuenta **27.488 NITs** que coinciden, asociados a **120.229 contratos** que suman **$28,6 billones**. Pero atención a la lectura:

- Esos **$28,6 B** son **lo contratado por esos NITs**, no el monto donado.
- El monto total de aportes electorales es **$1,34 billones** (otra magnitud, otra fuente).
- La coincidencia **no implica** ninguna relación causal entre donar y contratar.

Ver [Los cruces](08-Los-Cruces.md) y la sección electoral en [Las secciones](07-Las-Secciones.md).

### ¿Un sancionado puede contratar con el Estado? ¿No es eso ilegal?
No necesariamente. Una **sanción no inhabilita automáticamente para todo ni para siempre**: tiene tipos, alcances, vigencias y recursos. Un registro en SIRI **no equivale** a una inhabilidad vigente para un contrato y una fecha concretos. Además, nuestro cruce:

- Es **por NIT dentro de la ventana** de datos.
- **No establece** si el contrato fue antes, durante o después de la sanción.

El cruce sancionado ↔ contratista encuentra **1.560 NITs** coincidentes, con **8.970 contratos** por **$6,79 billones** contratados. Verificar un caso real requiere consultar **SIRI (Procuraduría)** y el acto administrativo puntual, con sus fechas y alcances. Ver [Los cruces](08-Los-Cruces.md).

### ¿Qué son las "multas" que aparecen y por qué tienen años tan antiguos?
Son **multas y sanciones registradas en SECOP** (cláusulas penales, multas contractuales), distintas de las sanciones disciplinarias de SIRI. El observatorio cuenta **1.866 multas** sobre **1.233 NITs**, por un valor de aproximadamente **$1,06 billones**. La serie arranca antes de la ventana general (hay registros desde **2010**) porque las multas se reportan con la fecha del hecho sancionado, que puede ser anterior. De esas multas, **270 NITs** coinciden además con contratistas activos en la ventana (**$12,3 billones** contratados). Como siempre: es una coincidencia de identificador, no un juicio.

### ¿Por qué no muestran cuántos oferentes compitieron por cada proceso?
Porque el dato **no existe en la fuente**. El dataset de procesos de SECOP II no trae el número de oferentes, así que **no se puede medir la competencia** de forma directa. Preferimos no mostrar un indicador que no podemos sustentar con el dato crudo. Ver el caveat de procesos en [Caveats y límites](09-Caveats-Y-Limites.md).

---

## Sobre las secciones de planeación, inversión y ejecución

### ¿Qué significan "se planea", "se invierte" y "se ejecuta"? ¿Se pueden sumar?
Son **tres universos distintos** que **no se deben sumar entre sí**. Cada uno responde a una pregunta diferente:

| Sección | Fuente | Qué mide | Magnitud | Cobertura temporal |
|---|---|---|---|---|
| **¿Qué se planea?** | PAA (SECOP II) | Lo que las entidades **planean** comprar | **$58,6 B** planeados | 2024–2026 |
| **¿En qué se invierte?** | BPIN (DNP) | **Presupuesto** de proyectos de inversión | **$424,8 B** vigentes, **34 % ejecutado** | vigencias 2025–2026 |
| **¿Se ejecuta?** | SECOP II (contratos + facturas) | La cadena contratado → facturado → pagado | ver abajo | 2022–2026 |

- El **PAA** es una **intención de compra**, no un contrato firmado. Su modalidad "No especificada" (antes mostrada como "Otras") agrupa los ítems sin modalidad declarada.
- El **BPIN** es **presupuesto público**, no contratos; vive en otro universo contable y **no se debe sumar** con el valor de contratos de SECOP II.

Cada sección tiene su salvedad; ver [Las secciones](07-Las-Secciones.md) y [Caveats y límites](09-Caveats-Y-Limites.md).

### ¿Qué es la "cadena de ejecución"?
Describe cómo un contrato firmado avanza —o no— hacia el pago, en cuatro magnitudes encadenadas:

```
Contratado  $583,8 B   (valor de los contratos firmados)
   │
   ▼
Facturado   $190,7 B   (32,7 % de lo contratado)
   │
   ▼
Pagado      $154,5 B   (26,5 % de lo contratado)
```

La caída entre eslabones **no es necesariamente un problema**: muchos contratos son recientes y aún están en ejecución, otros se pagan en vigencias futuras, y 2026 apenas empieza a facturar. La cobertura de los módulos de factura y pago ronda el **91 %**, así que parte de la brecha es simplemente **dato que falta**, no plata sin pagar. Ver [Las secciones](07-Las-Secciones.md).

### En la inversión (BPIN) hay una cadena de cuatro estados. ¿Qué significan?
El BPIN describe el ciclo presupuestal de cada proyecto de inversión en cuatro momentos: **vigente → comprometido → obligado → pagado**. Por ejemplo, en la vigencia 2025 el presupuesto **vigente** ($204,5 B) se comprometió, obligó y pagó en proporciones decrecientes. Es la lógica del gasto público, no del contrato individual: por eso conviene leerlo aparte de SECOP II.

---

## Sobre las cifras y sus límites

### ¿Por qué el gasto total parece bajo para todo un país?
Porque **el valor total subestima el gasto público real**. Las cifras son el **valor de lo publicado en SECOP II**, no el gasto del Estado completo. Quedan fuera, entre otros:

- **SECOP I** (no se ingiere en este observatorio).
- **Adiciones y prórrogas** (el valor base del contrato no las suma).
- **Regímenes especiales** y entidades que no publican en SECOP II.

Por eso el total —**$583,8 billones** sobre **3.969.440** contratos— es un **piso**, no el gasto completo del país. Tómalo como "al menos esto", nunca como "exactamente esto". Ver [Caveats y límites](09-Caveats-Y-Limites.md) y [Auditoría de datos](06-Auditoria-De-Datos.md).

### ¿Por qué muestran la mediana ($20 M) y no solo el promedio?
Porque hay **valores extremos** (*outliers*) que pueden ser **errores de digitación de la fuente** —un contrato con ceros de más, por ejemplo—. No los borramos (alterar el dato crudo iría contra la transparencia), pero distorsionan el promedio. La **mediana** es **robusta** a esos extremos y describe mucho mejor el **contrato típico**: el valor mediano nacional es **$20,06 millones**. Para entender la forma completa de la distribución también publicamos percentiles (p10, p25, p50, p75, p90, p99). Ver el detalle en [Auditoría de datos](06-Auditoria-De-Datos.md).

### ¿Qué es la contratación directa y por qué aparece como mayoría?
Es la **modalidad** en la que la entidad contrata sin un proceso competitivo abierto, dentro de los supuestos que la ley permite (por ejemplo prestación de servicios profesionales, urgencias, contratos interadministrativos). En los datos representa el **78,3 % por número de contratos**, pero solo el **45,3 % por valor** —porque son muchos contratos, en general más pequeños—. Que sea mayoría **no implica irregularidad**: su uso es legítimo en numerosos supuestos legales. Ver [Cómo contrata](07-Las-Secciones.md).

### ¿Qué tan concentrada está la contratación? ¿Unos pocos se llevan todo?
No, al menos no a nivel agregado. Los **10 mayores contratistas** del país concentran apenas el **7,0 % del valor total**, repartido entre **954.767 contratistas** distintos. Es una base muy amplia. Eso no descarta concentraciones **dentro de un sector o una entidad** concreta —para eso publicamos el índice HHI por sector—, pero el panorama nacional es diverso. Ver [Señales](07-Las-Secciones.md).

### ¿Por qué 2026 se ve incompleto?
Porque es el **año en curso**: la ventana llega hasta la **fecha de corte del snapshot** (datos a **3 de junio de 2026**) y 2026 se va llenando a medida que se publican contratos. Comparar 2026 contra años cerrados es **injusto por construcción**. Lo mismo, en sentido inverso, ocurre con el **primer semestre de 2022**, que tiene **baja cobertura** porque la adopción de SECOP II no fue uniforme al inicio de la ventana. Ver [Caveats y límites](09-Caveats-Y-Limites.md).

### ¿Por qué algunos contratos no aparecen en el mapa?
Porque alrededor del **5 %** de los contratos traen un departamento ausente, ambiguo o no reconocible y **no se mapean**. No se imputa ni se inventa una ubicación: lo no mapeable se deja **fuera del mapa**, no se reasigna a un departamento cualquiera. Por eso los totales del mapa son algo menores que el total nacional. Para comparar entre departamentos de distinto tamaño poblacional también ofrecemos cifras **per cápita**. Ver [Caveats y límites](09-Caveats-Y-Limites.md).

### ¿Por qué hay datos solo de ciertos años en algunas secciones?
Porque cada fuente tiene su propia cobertura, y no la inventamos:

| Sección | Cobertura disponible |
|---|---|
| Contratos / procesos (SECOP II) | 2022–2026 |
| **PAA — planeación** | 2024–2026 |
| **BPIN — inversión** | vigencias 2025–2026 |
| **Electoral (Cuentas Claras)** | ciclos 2022–2023 |
| **Sanciones SIRI** | 2022–2026 (inhabilidades vigentes a la fecha) |

No es un olvido: es el **alcance real del dato disponible**. Ver [Fuentes](01-Fuentes.md) y [Caveats y límites](09-Caveats-Y-Limites.md).

### ¿Por qué la entidad aparece con un nombre y no con otro? A veces el mismo NIT tiene nombres distintos.
Porque en SECOP II una misma entidad (un mismo NIT) suele estar registrada con **varias grafías** del nombre a lo largo del tiempo. Para no elegir una al azar, el observatorio agrupa por **NIT** y muestra el **nombre más frecuente** asociado a ese identificador (con `APPROX_TOP_COUNT`). Así, por ejemplo, el ICBF aparece de forma estable como **"ICBF Sede Nacional"** aunque en los registros existan otras variantes. Ver [Quién contrata](07-Las-Secciones.md).

### ¿Se puede confiar en estos números?
Son **agregados descriptivos de datos abiertos**, reproducibles y auditados internamente, pero **no son una auditoría oficial ni una denuncia**. Cada cifra tiene límites conocidos que **acotan** lo que puede afirmar (sin invalidarla). Como respaldo:

- El método —consultas SQL y limpieza— es **abierto** (45 archivos `.sql` en `data/queries/`), de modo que cualquiera puede reproducirlo.
- El snapshot se valida en dos capas: **guards anti-fragmentación** en `verify_snapshot.py` (que impiden, por ejemplo, etiquetas categóricas duplicadas o sumas sin sentido) y validación **Zod en tiempo de ejecución** en el frontend, que verifica que cada JSON tenga la forma esperada antes de mostrarlo.

Ver [Auditoría de datos](06-Auditoria-De-Datos.md) y [Cómo se calcula todo](13-Como-Se-Calcula-Todo.md).

---

## Sobre las personas y la privacidad

### ¿Por qué no hay nombres de personas naturales?
Porque el observatorio trabaja con **agregados**, no con perfiles individuales. El sitio público muestra **conteos, valores, distribuciones y coincidencias por NIT**, no fichas de personas. No publicamos un "expediente" de nadie ni cruzamos parentescos o redes personales. Esta decisión es deliberada: protege la privacidad, evita la difamación por homonimia y mantiene el foco en el **patrón estadístico**, no en el señalamiento individual.

### ¿El observatorio guarda o rastrea datos míos como visitante?
No. El sitio público **no tiene login, ni cuentas, ni registro**, y es de **solo lectura**. No guarda perfiles de usuario ni requiere identificarte para nada. Solo necesitas un navegador.

### ¿Es seguro usar este sitio?
Sí. El sitio es **100 % estático**: solo sirve archivos JSON precalculados, sin backend, sin base de datos en vivo y sin formularios que envíen tus datos a ningún lado. No hay superficie de ataque más allá de servir archivos, y no hay nada que iniciar sesión. El procesamiento pesado ocurre **antes**, en el pipeline de materialización, no en cada visita.

---

## Sobre la actualización

### ¿Están actualizados al minuto?
No. Es una **foto fija**: un *snapshot* que se regenera **manualmente** cuando los mantenedores corren el materializador. La **fecha de corte de los datos** (en el snapshot actual, **3 de junio de 2026**) y la **fecha de generación** aparecen en la sección **Acerca** del sitio y en `meta.json`.

### ¿Por qué no se actualiza en tiempo real?
Porque el sitio público es **estático**: solo lee archivos JSON, no consulta ninguna base de datos en vivo. Esto lo hace **barato, rápido y seguro**, a cambio de no ser tiempo real. Refrescar los datos es un paso deliberado que ejecutan los mantenedores corriendo el pipeline. Ver [Datos y materialización](02-Datos-y-Materializacion.md).

### ¿Cada cuánto se refresca?
Cuando los mantenedores deciden regenerar el snapshot. **No hay un cron público** ni una promesa de frecuencia fija. La fecha del último corte siempre se indica en **Acerca**, así que puedes saber a qué momento corresponden las cifras que estás viendo.

---

## Sobre el uso, la cita y la licencia

### ¿Puedo usar y citar estos datos?
Sí. Los agregados son **públicos y reproducibles**. Puedes usarlos en investigaciones, notas periodísticas, trabajos académicos o tableros propios. Al citarlos:

- Indica que son **agregados descriptivos de SECOP II y fuentes asociadas**, no cifras oficiales.
- Menciona la **fecha de corte** del snapshot (las cifras cambian entre versiones).
- Recuerda el principio: **describe, no juzga** — una coincidencia no es una conclusión.
- Para afirmaciones sobre un caso concreto, remite siempre a la **fuente primaria**.

### ¿Puedo usar este código para mi propio proyecto, incluso comercialmente?
Sí. La licencia es **Apache 2.0**: puedes usarlo, modificarlo, redistribuirlo y desplegarlo —incluso con fines comerciales— conservando la atribución y el aviso de licencia. El proyecto fue creado por **Alejandro y Juan José Amorocho**. Ver [Hacer un fork](04-Hacer-Un-Fork.md).

### Encontré una cifra de este sitio citada en otro lado. ¿Es oficial?
No. Ninguna cifra de este observatorio es **oficial ni vinculante**. Son agregados de datos abiertos con límites conocidos (subestimación del total, faltantes de cobertura, año en curso incompleto). Quien cite estos números debe aclararlo. La fuente oficial de cada dato es la entidad que lo produce: **Colombia Compra Eficiente** (SECOP), **DNP** (BPIN), **Procuraduría** (SIRI), **CNE** (Cuentas Claras).

---

## Sobre el funcionamiento técnico y el fork

### ¿Necesito BigQuery o una cuenta para usar el sitio?
No. El sitio público es 100 % de **solo lectura** y **anónimo**: no hay login, registro ni cuentas. Solo necesitas un navegador.

### ¿Necesito BigQuery para forkearlo y desplegarlo?
**No para desplegarlo.** El snapshot JSON viene **incluido** en el repositorio (`public/data/*.json`), así que puedes clonar, construir y publicar sin tocar ninguna base de datos. Solo necesitas BigQuery (y acceso a las fuentes) si quieres **regenerar** los datos desde cero con tu propia consulta. Ver [Hacer un fork](04-Hacer-Un-Fork.md).

### ¿Cómo se generan los JSON que lee el sitio?
Un pipeline ejecutable a mano —`data/materialize_public.py` + los **45 archivos** `data/queries/*.sql`— lee BigQuery y produce los JSON públicos:

1. **Deduplica** los contratos por `id` (un contrato cuenta una sola vez).
2. **Normaliza**: códigos DANE insensibles a tildes para el mapa, modalidades agrupadas en 7 categorías, objetos a etiquetas legibles, partidos políticos normalizados, nombre de entidad por NIT vía `APPROX_TOP_COUNT`.
3. **Valida** el resultado con `verify_snapshot.py`, que incluye **guards anti-fragmentación** (impiden etiquetas categóricas duplicadas y otras anomalías estructurales).
4. **Escribe** `public/data/*.json`, que el frontend vuelve a validar contra esquemas **Zod** en tiempo de ejecución.

Es totalmente reproducible. Ver [Datos y materialización](02-Datos-y-Materializacion.md) y [Cómo se calcula todo](13-Como-Se-Calcula-Todo.md).

### ¿Dónde puedo desplegarlo?
En **cualquier hosting estático**: Firebase Hosting, Netlify, Vercel, GitHub Pages o un bucket con CDN. Como no hay backend, no hay nada que aprovisionar más allá de servir archivos. Ver [Hacer un fork](04-Hacer-Un-Fork.md) y [Despliegue](12-Despliegue.md).

### ¿Por qué es estático y no una app con backend?
Por **simplicidad, costo y seguridad**: no hay servidor que mantener ni que pueda ser abusado, no hay base de datos pública que proteger, y la única superficie expuesta son archivos JSON. El procesamiento pesado ocurre **antes**, en el pipeline de materialización, no en cada visita. Ver [Arquitectura](11-Arquitectura.md).

### ¿Tiene login, cuentas o recoge datos míos?
No. El sitio público no tiene autenticación, no guarda perfiles y es de solo lectura. No hay nada que iniciar sesión ni nada que registrar.

---

## Sobre las fuentes y los errores

### ¿De dónde salen los datos exactamente?
De **cinco fuentes abiertas**, en su ventana de cobertura respectiva:

| Fuente | Origen | Qué aporta | Cifra de referencia |
|---|---|---|---|
| **SECOP II** | Colombia Compra Eficiente | Contratos, procesos, PAA y facturas | $583,8 B contratados; 3.969.440 contratos |
| **BPIN** | DNP | Presupuesto de inversión por proyecto | $424,8 B vigentes (34 % ejecutado) |
| **Sanciones SIRI** | Procuraduría | Registros sancionatorios disciplinarios | 13.441 registros |
| **Aportes de campaña** | CNE — Cuentas Claras | Financiación electoral | $1,34 B en aportes |
| **RUES / Supersociedades** | Cámaras / Supersociedades | Apoyo a cruces (registro y finanzas) | — |

Detalle de cada una en [Fuentes](01-Fuentes.md).

### Encontré un error en los datos o en una gráfica. ¿Qué hago?
Abre un *issue* en el repositorio indicando la **sección** y el **periodo**, y si puedes, la cifra que esperabas y por qué. Como todo es reproducible (consultas SQL abiertas + materializador), es fácil rastrear el origen del número. Ver [CONTRIBUTING](../CONTRIBUTING.md).

### Vi una coincidencia que me parece sospechosa. ¿Qué hago?
**Verifícala en la fuente primaria**, caso por caso:

- El contrato → en **SECOP II**.
- El aporte → en **Cuentas Claras** (CNE).
- La sanción → en **SIRI** (Procuraduría).
- El presupuesto → en **BPIN** (DNP).
- Y los **actos administrativos** de la entidad correspondiente.

Una coincidencia sirve para **formular una pregunta**, no para responderla. Este observatorio señala dónde mirar; **no sustituye la verificación**. Ver [Los cruces](08-Los-Cruces.md) y [Caveats y límites](09-Caveats-Y-Limites.md).

---

¿No está tu pregunta aquí? Empieza por [Qué es](00-Que-Es.md), revisa los [Caveats y límites](09-Caveats-Y-Limites.md), consulta el [Glosario](10-Glosario.md) o vuelve al [índice de la wiki](Home.md).
