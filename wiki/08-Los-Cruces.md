# Cómo cruzamos los datos

La sección **¿Se cruzan los datos?** del dashboard junta dos o más conjuntos de datos públicos por un identificador común —el **NIT**— y cuenta las coincidencias. Esta página explica **qué cruces hacemos**, **cómo los hacemos** y, sobre todo, **por qué no son acusatorios**.

> **Lo primero, en una frase:** una coincidencia es una coincidencia, **no** una irregularidad. Que un NIT aparezca en dos listas públicas es un hecho aritmético, no un señalamiento. Lee hasta el final antes de sacar conclusiones.

Todo lo que sigue es **estadística descriptiva neutral**. No hay score, ni ranking, ni semáforo, ni modelo que "prediga" corrupción. El observatorio **cuenta y describe; no juzga ni infiere intención** (ver [Metodología](03-Metodologia.md)). Los cruces son la materia prima para **hacerse preguntas**, no para responderlas.

---

## 1. Los tres cruces de portada

La sección de cruces de mayor visibilidad junta contratistas de SECOP II con tres registros sancionatorios o de financiación, **por coincidencia exacta de NIT** y dentro de la ventana del observatorio (**2022–2026**, sobre la base de contratos **deduplicada por `id`** — ver [Auditoría de datos](06-Auditoria-De-Datos.md)).

| Cruce | Fuente A | Fuente B | NITs que coinciden | Valor contratado de esos NITs |
|---|---|---|---|---|
| Donante ↔ contratista | Aportes de campaña (Cuentas Claras, CNE) | Contratos (SECOP II) | **27.488** | **$28,6 billones** |
| Sancionado ↔ contratista | Sanciones SIRI (Procuraduría) | Contratos (SECOP II) | **1.560** | **$6,8 billones** |
| Multas SECOP ↔ contratista | Multas contractuales (SECOP) | Contratos (SECOP II) | **270** | **$12,3 billones** |

Para dimensionar las cifras: el universo es de **3.969.440 contratos** firmados por **954.767 contratistas** y **4.690 entidades**, con un **valor contratado total de $583,8 billones** (valor mediano por contrato: **$20,06 M**). Los NITs que coinciden son, en todos los casos, una **fracción** de ese universo; el valor contratado de cada cruce está muy por debajo del total nacional, como debe ser (la [guardia anti fan-out](#4-anti-doble-conteo-fan-out) garantiza que ningún cruce lo supere).

### 1.1 Donante ↔ contratista

NITs que **aparecen como aportantes** a campañas políticas en el sistema Cuentas Claras del CNE **y también** figuran como contratistas en SECOP II. Son **27.488** NITs, asociados a **120.229 contratos** por **$28,6 billones**.

- **El valor mostrado es lo que esos NITs tienen contratado** en la ventana, **no** el monto donado.
- La consulta ([`cruces_donante.sql`](../data/queries/cruces_donante.sql)) hace `JOIN` por `contratista_nit = nit_aportante`, sobre `DISTINCT nit_aportante` (cada donante cuenta una sola vez), con contratos `2022–2026` y `valor > 0`.
- **Aportar a una campaña es legal** y reportarlo es obligatorio. Donar **y** contratar con el Estado no es, por sí mismo, una infracción.

### 1.2 Sancionado ↔ contratista

NITs que **figuran con una sanción** en el sistema SIRI de la Procuraduría **y también** aparecen como contratistas. Son **1.560** NITs, **8.970 contratos**, **$6,8 billones**.

- El cruce se hace **post-sanción**: solo cuenta contratos cuya `fecha_firma` es **posterior a la primera sanción registrada** de ese NIT (`MIN(fecha_inicio)` en SIRI). Es más conservador que un simple "aparece en ambas listas".
- Lógica en [`cruces_sancionado.sql`](../data/queries/cruces_sancionado.sql). Las sanciones consideradas pueden ser de cualquier fecha; los contratos están acotados a 2022–2026.
- **Una sanción no inhabilita automáticamente para todo, ni para siempre.** Las inhabilidades tienen tipo, alcance y vigencia, y muchas pueden estar ya cumplidas. Un registro en SIRI **no** equivale a una inhabilidad vigente para un contrato concreto.

### 1.3 Multas SECOP ↔ contratista

Las **multas contractuales del SECOP** son sanciones pecuniarias que una entidad impone a un contratista durante la ejecución (incumplimiento, mora, etc.). Es un registro **distinto** del SIRI disciplinario.

Panorama factual de la fuente (`multas_secop`):

| Métrica | Valor |
|---|---|
| Multas registradas | **1.866** |
| Valor total de las multas | **$1,06 billones** |
| NITs distintos multados | **1.233** |
| Rango temporal de la fuente | **2010–2026** (serie graficada desde 2015) |

Y el **cruce neutral por NIT** con la base de contratistas:

| Métrica | Valor |
|---|---|
| NITs multados que también contratan | **270** |
| Valor contratado por esos NITs | **$12,3 billones** |

- El lado de multas se **deduplica** (`DISTINCT nit_sancionado`) antes del `JOIN`, para no multiplicar el valor de un contrato por cada multa.
- La consulta acota fechas basura de la fuente (hay registros con año 2027/2028) al rango **2010–2026**.
- **Caveat:** coincidencia exacta de NIT; una multa pasada **no** inhabilita necesariamente para contratar después. Una multa describe un episodio de ejecución, no una prohibición permanente.

---

## 2. El método (coincidencia exacta de NIT)

El cruce es deliberadamente **simple y transparente**. Su virtud no es la sofisticación, sino la **auditabilidad**: cualquiera puede leer la consulta y reproducir el número.

1. **Llave única: el NIT.** Se comparan identificadores normalizados (sin espacios ni puntos, con el dígito de verificación tratado de forma consistente). Es una **coincidencia exacta**: el mismo NIT, carácter por carácter, en ambas listas. En `puerta_giratoria` y `supervisor_contratista` la llave es el **número de documento** de la persona en lugar del NIT, pero el principio es el mismo.
2. **Ventana 2022–2026.** Solo se consideran contratos dentro de la ventana del observatorio, con `valor > 0`.
3. **Sin inferencia.** No usamos nombres parecidos, ni parentescos, ni grafos de probabilidad, ni "probabilidades de ser la misma persona". Solo igualdad de identificador. Esto **evita falsos positivos por homonimia**, pero también significa que el cruce **es estricto a propósito**: no detecta relaciones más sutiles (intermediarios, beneficiarios finales, NITs mal digitados).
4. **Conservador, no exhaustivo.** Por ser exacto, el cruce tiende a **subestimar**: si el mismo actor figura con dos formatos de NIT (con y sin dígito de verificación, con ceros a la izquierda), no se empareja. Las cifras son **cotas inferiores** de la coincidencia real.
5. **Se cuenta, no se pondera.** El resultado es un **conteo** de NITs coincidentes y la **suma** de su valor contratado. No hay score, ranking ni semáforo (ver [Metodología](03-Metodologia.md)).

Toda la lógica está en [`data/materialize_public.py`](../data/materialize_public.py) y las consultas en [`data/queries/`](../data/queries) (el repositorio tiene **45 archivos `.sql`**). Cualquiera puede reproducir o cambiar el cruce en un [fork](04-Hacer-Un-Fork.md). Además, los datos del runtime se validan con **Zod** y el snapshot se reconcilia con `verify_snapshot.py` (ver [§4](#4-anti-doble-conteo-fan-out)).

### 2.1 La asimetría temporal (importa)

Los tres cruces **no tratan el tiempo de la misma manera**, y esto cambia su lectura. Tenerlo claro evita comparar peras con manzanas:

| Cruce | ¿Respeta el orden temporal? | Qué afirma exactamente |
|---|---|---|
| **Donante ↔ contratista** | **No.** Es una coincidencia de NIT *sin* condición temporal. | "Este NIT donó (en algún ciclo 2022–2023) **y** contrató (en algún momento 2022–2026)." No dice qué pasó antes. |
| **Sancionado ↔ contratista** | **Sí.** Exige `fecha_firma > primera sanción`. | "Este NIT firmó un contrato **después** de figurar en el registro sancionatorio del SIRI." |
| **Multas SECOP ↔ contratista** | **No** (en el cruce de portada). | "Este NIT fue multado (alguna vez) **y** contrata." El cruce no condiciona la fecha del contrato respecto de la multa. |

> **Por qué la asimetría es deliberada.** El cruce de donante es **agregado y atemporal** porque los aportes solo cubren los ciclos **2022–2023**: condicionar "contrato después de la elección" reduciría drásticamente la cobertura y se trataría aparte (esa variante temporal sí existe, es la señal [`donante_post_eleccion`](#3-las-11-senales)). El cruce de sancionado **sí** impone temporalidad porque es lo que lo hace informativo: que alguien contrate *tras* una sanción es una coincidencia más específica que la mera aparición en dos listas. Aun así, **ni siquiera el cruce de sancionado prueba causalidad**: un contrato posterior a una sanción no implica que la sanción debió impedirlo (puede ser de otro tipo, ya cumplida, o sin relación con el objeto del contrato).

---

## 3. Las 11 señales

Más allá de los tres cruces de portada, el dashboard publica **11 "señales"**: conteos de coincidencias factuales entre registros públicos, servidos como **agregados nacionales** (sin nombres, sin NITs, sin perfiles individuales) en la ruta `/senal/:key`. Datos en [`public/data/senales_extra.json`](../public/data/senales_extra.json); lógica en `_build_senales_extra()` de [`data/materialize_public.py`](../data/materialize_public.py).

> **Ninguna señal es acusatoria.** Cada una mide una coincidencia que **merece verificación caso por caso** y tiene explicaciones legítimas. Una coincidencia **no** es una irregularidad.

Las señales usan la tabla **cruda** `contratos` porque necesitan columnas que la base limpia no materializa (`fecha_prorroga`, `doc_supervisor`, `entidad_municipio`); el ~0,3 % de duplicados es marginal para estos agregados. Ventana común **2022–2026**, `valor > 0`.

### Grupo A — magnitud de figuras contractuales (¿Cómo?)

| Señal | Qué cuenta | Lógica y umbral |
|---|---|---|
| **`adiciones`** | Contratos con prórroga y su valor | `fecha_prorroga IS NOT NULL`. Sin umbral. |
| **`contratos_no_planeados`** | Entidades-año que contrataron > 20 % sobre su PAA | PAA deduplicado (última versión) por entidad-año vs. suma contratado; casos con `contratado > 1.2 × planeado` |
| **`brechas_bpin`** | Proyectos de inversión poco ejecutados | BPIN vigencia 2025–2026 con `valor_vigente ≥ $1.000M` y `pagado/vigente < 0.30`; brecha = `vigente − pagado` |

### Grupo B — coincidencias que merecen mirada (¿Hay señales?)

| Señal | Qué cuenta | Lógica y umbral |
|---|---|---|
| **`prorroga_sin_ejecucion`** | Contratos prorrogados con pago bajo | `fecha_prorroga IS NOT NULL` **y** `pagado/valor < 0.30` **y** firmado hace `≥ 12 meses` |
| **`monopolio_municipal`** | Municipios con un contratista dominante | Por municipio-contratista: `share ≥ 50 %` del valor **y** el municipio tiene entre **30 y 5.000** contratos |
| **`supervisor_contratista`** | Personas que supervisan y contratan con la misma entidad | `doc_supervisor` (≥2 contratos) **=** `contratista_nit` (≥2) **en la misma entidad** |
| **`puerta_giratoria`** | Servidores SIGEP que contratan con su entidad | `sigep_servidores.numero_documento = contratista_nit` **y** entidad normalizada coincide |
| **`redes_relaciones`** | Empresas que comparten representante legal | Contratistas cuyo NIT está en una relación `REPRESENTANTE_COMPARTIDO` (lado cruzado deduplicado) |
| **`sancionado_otro_depto`** | Sancionados que contratan en otro departamento | `sanciones.sancionado_nit = contratista_nit` **y** depto. entidad **≠** depto. sanción **y** contrato **posterior** a la sanción |
| **`donante_post_eleccion`** | Donantes que contratan tras la elección | `campanas.nit_aportante = contratista_nit` **y** `fecha_firma > 1-ene del año siguiente` a la elección |
| **`cluster_electoral`** | Campañas con varios aportantes que contratan | Por candidato: `≥ 3` aportantes distintos **y** `≥ 2` de ellos también contratistas. Cuenta campañas y aportantes (**no valor**) |

### 3.1 Magnitudes actuales de cada señal

Estos son los valores del snapshot vigente (lee siempre el dato fresco en [`senales_extra.json`](../public/data/senales_extra.json); el método es estable, los números se actualizan con cada corte):

| Señal | Conteo | Valor asociado |
|---|---|---|
| `adiciones` | 311.567 contratos | $60,4 billones |
| `prorroga_sin_ejecucion` | 91.238 contratos | $20,5 billones |
| `brechas_bpin` | 14.247 proyectos | $336,8 billones (brecha; fuente BPIN, no contratos) |
| `contratos_no_planeados` | 229 casos | $60,9 billones |
| `monopolio_municipal` | 40 municipios | $10,5 billones |
| `supervisor_contratista` | 2.608 personas | $321.491 millones |
| `puerta_giratoria` | 2.628 personas | $186.681 millones |
| `redes_relaciones` | 631 empresas | $5,96 billones |
| `sancionado_otro_depto` | 1.495 contratistas | $142.393 millones |
| `donante_post_eleccion` | 8.963 contratistas | $11,9 billones |
| `cluster_electoral` | 3.648 clusters | 11.358 aportantes que contratan (sin valor) |

### 3.2 Por qué cada umbral (reducir ruido, no señalar culpables)

Los umbrales **no** marcan a nadie como culpable; existen para **filtrar coincidencias triviales** que solo añadirían ruido:

- **Monopolio municipal (30–5.000 contratos):** excluye municipios diminutos (donde un proveedor único es trivial) y los enormes (donde el 50 % sería improbable sin ser una noticia ya conocida).
- **Supervisor/contratista (≥2 de cada rol):** exigir al menos dos contratos por rol evita coincidencias de un solo contrato, más propensas a homonimia o error de digitación.
- **Sancionado/donante (condición temporal):** que el contrato sea **posterior** a la sanción o **posterior** a la elección hace el cruce más conservador que un simple "aparece en ambas listas".
- **Cluster electoral (no muestra valor):** se omite el valor a propósito para evitar el doble conteo entre campañas; tampoco nombra candidatos ni partidos. Los partidos, cuando se muestran en otras secciones, van **normalizados** para no fragmentar la misma colectividad.

---

## 4. Anti doble-conteo (fan-out)

Este es un detalle técnico **crítico** para la honestidad de los números. Tres señales cruzan contratos contra una tabla donde **un mismo NIT puede aparecer en varias filas**: un donante en **varias campañas**, una empresa en **varias relaciones**, un sancionado con sanciones en **varios departamentos**.

Un `JOIN` directo sumaría el valor del **mismo contrato una vez por cada coincidencia**, inflando el total. Antes del fix, `donante_post_eleccion` llegaba a **~$820 billones**, por encima del universo contratado del país (**~$584 billones**) — una imposibilidad aritmética que delataba el error.

**La solución:** deduplicar el lado cruzado (`DISTINCT` / `EXISTS`) **antes** de sumar, de modo que cada contrato cuente **una sola vez**.

| Señal con riesgo de fan-out | Causa (un NIT → varias filas) | Mitigación |
|---|---|---|
| `donante_post_eleccion` | Un donante aporta a varias campañas | `JOIN` con donante deduplicado por NIT |
| `redes_relaciones` | Un NIT en múltiples relaciones `REPRESENTANTE_COMPARTIDO` | `UNION DISTINCT` de NITs antes del `JOIN` |
| `sancionado_otro_depto` | Un sancionado con sanciones en varios deptos. | `EXISTS` en lugar de `JOIN` (cuenta el contrato una vez) |

Los conteos de personas/empresas (`COUNT(DISTINCT …)`) ya eran correctos; el fan-out solo afectaba a las **sumas de valor**. Los cruces de portada (donante, sancionado, multas) aplican la misma disciplina: se deduplica con `DISTINCT` el lado que se cruza.

> **Guardia de sentido en el código.** El script [`verify_snapshot.py`](../data/verify_snapshot.py) incluye una **guardia anti-fragmentación** y una **guardia de sentido** que comprueban, sin tocar BigQuery, que **ningún valor de señal supere el total contratado del país** (excepto `brechas_bpin`, que viene de otra fuente y mide brecha presupuestal, no contratos). Si un cruce vuelve a inflarse, el snapshot **no pasa** la validación y el build falla. Es una red de seguridad permanente contra el fan-out.

---

## 5. Por qué esto **no** es acusatorio

Este es el punto más importante de la página. Una coincidencia de NIT **no implica** que haya ocurrido nada irregular. Hay muchas explicaciones legítimas y, además, límites técnicos del propio dato:

- **Aportar a una campaña es legal.** La financiación de campañas está regulada y reportarla es obligatorio. Donar **y** contratar con el Estado no es, por sí mismo, una infracción.
- **Una sanción no inhabilita automáticamente para todo, ni para siempre.** Las sanciones tienen tipos, alcances, vigencias y recursos. Un registro en SIRI **no** equivale a una inhabilidad vigente para una fecha y un objeto concretos.
- **Una multa describe un episodio de ejecución, no una prohibición.** Una multa contractual pasada no impide contratar después; señala que en algún contrato hubo un incumplimiento que la entidad sancionó pecuniariamente.
- **La coincidencia no siempre respeta el tiempo del caso.** Salvo el cruce de sancionado (que sí exige contrato posterior), los cruces de portada **no** establecen que el contrato sea consecuencia de la donación o de la multa. Y aun el cruce temporal **no prueba causalidad**.
- **El NIT no distingue circunstancias.** Empresas grandes, gremios y personas con actividad económica amplia aparecen naturalmente en muchas listas. La coincidencia puede deberse a **tamaño o actividad**, no a un vínculo causal.
- **Las fuentes tienen errores y vacíos.** Aportes (solo ciclos **2022–2023**), sanciones, multas y contratos provienen de sistemas distintos, con calidades distintas. Puede haber NITs mal digitados, homónimos institucionales o registros desactualizados.
- **No hay relación causal en ningún sentido.** El dashboard **no** afirma que la donación "compró" el contrato, ni que la sanción o la multa debieron impedirlo. Solo dice: *estos NITs están en ambas listas.* Punto.

> **Correlación no es causalidad.** Coincidir en dos bases de datos públicas describe una **intersección estadística**. Cualquier interpretación causal —y cualquier juicio sobre personas o entidades concretas— **excede lo que el dato permite afirmar.**

---

## 6. Una invitación a verificar (no a concluir)

Estos cruces sirven para **hacerse preguntas**, no para responderlas. Si una coincidencia te llama la atención, el camino correcto es **ir a la fuente primaria**, caso por caso:

- **SECOP II** (Colombia Compra Eficiente): el contrato, su objeto, su modalidad y sus fechas; también las multas contractuales.
- **Cuentas Claras** (CNE): el reporte de aportes, el ciclo electoral y el destinatario.
- **SIRI** (Procuraduría): el tipo de sanción, su alcance, su vigencia y si está en firme.
- Los **portales de las entidades** y los actos administrativos correspondientes.

Solo la fuente primaria —y, cuando aplique, el contexto jurídico— permite afirmar si hubo o no una irregularidad. Este observatorio **no** sustituye esa verificación: la facilita señalando **dónde mirar**. Conviene recordar, además, que las entidades en el sitio se identifican por NIT y muestran el **nombre más frecuente** asociado a ese NIT (vía `APPROX_TOP_COUNT`, p. ej. "ICBF Sede Nacional"); el nombre es una ayuda de lectura, no la llave del cruce.

---

## 7. Caveats específicos de los cruces

- **Aportes de campaña: solo ciclos 2022–2023.** Coincidencias de otros años no están cubiertas.
- **Coincidencia exacta de NIT/documento:** no captura homónimos, intermediarios, beneficiarios finales ni vínculos indirectos. Es estricta a propósito y tiende a **subestimar**.
- **El valor mostrado es lo contratado por el NIT coincidente,** no el monto donado, ni la multa, ni el valor de la sanción.
- **Asimetría temporal entre cruces:** donante y multas son atemporales en la portada; sancionado exige contrato posterior. No los compares como si midieran lo mismo (ver [§2.1](#21-la-asimetria-temporal-importa)).
- **Multas:** el registro `multas_secop` cubre **2010–2026** (más amplio que la ventana de contratos); la serie graficada arranca en 2015 y se acotan fechas basura de la fuente.
- **Fan-out controlado pero presente como riesgo:** tres señales requieren deduplicar el lado cruzado; `verify_snapshot.py` lo verifica en cada build (ver [§4](#4-anti-doble-conteo-fan-out)).
- **`valor_total` subestima el gasto** (no incluye SECOP I ni adiciones), por lo que las sumas de estos cruces también son **cotas inferiores**. Ver [Auditoría de datos](06-Auditoria-De-Datos.md).

---

## 8. En resumen

| | |
|---|---|
| **Qué es** | El conteo de NITs (o documentos) que aparecen en dos listas públicas a la vez. |
| **Qué no es** | Una acusación, un score de riesgo, una prueba de irregularidad o de causalidad. |
| **Cuántos cruces** | 3 de portada (donante, sancionado, multas) + 11 señales agregadas. |
| **Cómo se calcula** | Coincidencia exacta de identificador, ventana 2022–2026, conteo y suma, lado cruzado deduplicado. |
| **Para qué sirve** | Para formular preguntas y saber dónde verificar. |
| **Cómo verificar** | En la fuente primaria, caso por caso (SECOP II, Cuentas Claras, SIRI). |

---

Más sobre el enfoque general en [Metodología](03-Metodologia.md), sobre el cálculo exacto de cada señal en [Cómo se calcula todo](13-Como-Se-Calcula-Todo.md), sobre la calidad de las cifras en [Auditoría de datos](06-Auditoria-De-Datos.md), sobre los límites en [Caveats y límites](09-Caveats-Y-Limites.md) y sobre las fuentes en [De dónde vienen los datos](01-Fuentes.md).
