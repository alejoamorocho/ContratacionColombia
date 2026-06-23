# Metodología

Esta página explica **qué calcula** el observatorio y, con la misma importancia, **qué decide no calcular**. Todo el método se resume en una frase que gobierna el proyecto entero: **describe, no juzga**.

> **En una línea:** mostramos estadística descriptiva sobre datos públicos —conteos, sumas, medianas, percentiles, distribuciones, tasas, concentración y coincidencias por NIT— para que cada quien formule sus propias preguntas. No producimos puntajes, ni rankings de "peores", ni juicios sobre personas o entidades.

Cada cifra de este sitio sale de una consulta SQL pública (carpeta [`data/queries/`](../data/queries), **45 archivos `.sql`**) ejecutada sobre datos abiertos y transformada por un único script ([`data/materialize_public.py`](../data/materialize_public.py)). No hay modelos predictivos, no hay ponderaciones ocultas, no hay caja negra. Si una cifra te sorprende, puedes leer la consulta exacta que la produce.

---

## 1. El principio rector: describe, no juzga

Un dato no es una acusación. Que una entidad contrate mucho, que un sector concentre valor, que un NIT aparezca en dos listas públicas a la vez o que una modalidad domine son **hechos aritméticos** sobre fuentes abiertas. Interpretarlos —decidir si algo está bien, mal, es legal o irregular— excede lo que el dato permite afirmar y corresponde a quien consulte la **fuente primaria**, caso por caso.

De ese principio se derivan tres compromisos prácticos que atraviesan cada gráfico, cada tabla y cada etiqueta del sitio:

1. **Neutralidad de las cifras.** Cada número describe una realidad medible (cuántos contratos, cuánto valor, qué porcentaje, qué percentil), nunca una valoración. El 7,0 % de concentración del top‑10 o el 78,3 % de contratación directa son descriptores del mercado, no veredictos.
2. **Neutralidad del lenguaje.** Las etiquetas son fieles a lo que miden: "categoría de objeto", no "sector de la economía"; "señales", no "alertas de corrupción"; "coincidencia de NIT", no "conflicto de interés"; "No especificada", no "Otras", cuando el dato simplemente falta.
3. **Verificabilidad antes que conclusión.** El dashboard señala **dónde mirar**; nunca concluye por el lector. Las secciones más sensibles (señales, cruces) llevan una **nota metodológica visible** que recuerda que el número no implica irregularidad.

---

## 2. Qué calculamos: el catálogo completo de operaciones

Todas las cifras del observatorio son **estadística descriptiva**. Estas son las operaciones que usamos —y ninguna más. No hay ningún cálculo que no esté en esta lista.

| Operación | Qué responde | Dónde aparece | Ejemplo verificado |
|---|---|---|---|
| **Conteos** (`COUNT`, `COUNT(DISTINCT)`) | ¿Cuántos contratos, entidades, contratistas, NITs, ítems? | Todas las secciones | 3.969.440 contratos · 4.690 entidades · 954.767 contratistas |
| **Sumas** (`SUM`) | ¿Cuánto valor total, planeado, presupuestado, facturado, pagado? | Inicio, ¿Qué se planea?, ¿En qué se invierte?, ¿Se ejecuta? | Valor contratado total = $583,8 billones |
| **Mediana** (`APPROX_QUANTILES[OFFSET(50)]`) | ¿Cuánto vale el contrato *típico*? | Inicio, ¿Hay señales? | Valor mediano = $20,06 M |
| **Percentiles** (`APPROX_QUANTILES(valor, 100)`) | ¿Cómo se distribuye el valor? (p10…p99) | ¿Hay señales? | p10 $5,5 M · p50 $20,0 M · p90 $83,7 M · p99 $1.696 M |
| **Distribuciones** (`GROUP BY`) | ¿Cómo se reparte por año, modalidad, categoría de objeto, nivel de gobierno, departamento? | ¿Quién contrata?, ¿Cómo contrata?, ¿Dónde? | 7 modalidades · 30 sectores comparables en crecimiento |
| **Tasas y porcentajes** | ¿Qué fracción es contratación directa? ¿Qué % se ejecutó o se pagó? | ¿Cómo contrata?, ¿Se ejecuta?, ¿En qué se invierte? | Directa = 78,3 % de contratos · 45,3 % del valor · pagado = 26,5 % |
| **Concentración** (`ROW_NUMBER` + `SUM` parcial) | ¿Qué % del valor se lleva el top‑10 de contratistas? ¿Qué tan concentrado está un sector (HHI)? | ¿Hay señales? | Top‑10 = 7,0 % del valor |
| **Cruces por coincidencia exacta de NIT** (`JOIN`) | ¿Cuántos NITs aparecen en dos listas públicas a la vez? | ¿Se cruzan los datos? | Donante↔contratista, sancionado↔contratista |

Estas son las cifras de cabecera que verás en el panorama, todas leídas directamente de `public/data/panorama.json` y consultas asociadas:

| KPI nacional | Valor | Fuente del cálculo |
|---|---|---|
| Contratos (deduplicados) | **3.969.440** | `panorama_kpis.sql` · `COUNT(*)` |
| Valor contratado total | **$583,8 billones** | `panorama_kpis.sql` · `SUM(valor)` |
| Valor mediano del contrato | **$20,06 M** | `APPROX_QUANTILES(valor,100)[OFFSET(50)]` |
| Entidades contratantes | **4.690** | `COUNT(DISTINCT entidad_nit)` |
| Contratistas | **954.767** | `COUNT(DISTINCT contratista_nit)` |
| Concentración top‑10 | **7,0 %** del valor | `senales_concentracion.sql` |
| Contratación directa (n.º de contratos) | **78,3 %** | `como_modalidad.sql` / `senales_concentracion.sql` |
| Contratación directa (por valor) | **45,3 %** | `como.json → pct_directa_valor` |
| PAA — valor planeado | **$58,6 billones** | `planeacion_kpis.sql` |
| BPIN — presupuesto vigente | **$424,8 billones** (34 % ejecutado) | `inversion_kpis.sql` |
| Sanciones SIRI registradas | **13.441** | `sanciones_kpis.sql` |
| Aportes electorales | **$1,34 billones** | `electoral_kpis.sql` |
| Facturado / Pagado | **$190,7 B / $154,5 B** (26,5 % pagado) | `ejecucion_kpis.sql` |

> Las cifras de valor son sensibles a unos pocos contratos de cuantía extrema (que pueden incluir errores de digitación en la fuente). Por eso al lado del **total** siempre mostramos la **mediana**, robusta a esos casos. Ver [Auditoría de datos](06-Auditoria-De-Datos.md).

---

## 3. Decisiones metodológicas transversales

Estas reglas se aplican de forma idéntica en todas las secciones para que las cifras sean comparables entre sí y reconciliables con la fuente.

### 3.1. Mediana antes que promedio

La distribución del valor por contrato está **fuertemente sesgada a la derecha**: la mayoría de contratos vale decenas de millones, pero un puñado vale miles de millones. El promedio aritmético se dispararía hacia esos extremos y describiría mal al contrato "típico". Por eso reportamos la **mediana ($20,06 M)** y un abanico de **percentiles**, ambos robustos a los valores atípicos:

| Percentil | Valor del contrato | Lectura |
|---|---|---|
| p10 | $5,5 M | El 10 % de contratos vale menos que esto |
| p25 | $10,3 M | Cuartil inferior |
| **p50 (mediana)** | **$20,0 M** | El contrato típico |
| p75 | $40,5 M | Cuartil superior |
| p90 | $83,7 M | Solo el 10 % supera este valor |
| p99 | $1.696,3 M | El 1 % más caro |

El salto entre p90 ($83,7 M) y p99 ($1.696 M) es de **más de 20×**: esa cola larga es exactamente la razón por la que un promedio sería engañoso.

### 3.2. Deduplicación por identificador de contrato

La fuente SECOP II trae alrededor del **0,3 % de identificadores repetidos** (el mismo contrato ingerido o versionado más de una vez). Antes de cualquier agregación, el materializador construye una **tabla base limpia** que conserva una sola fila por `id` —la **última versión** según `ultima_actualizacion`— mediante:

```sql
QUALIFY ROW_NUMBER() OVER (
  PARTITION BY id ORDER BY ultima_actualizacion DESC
) = 1
```

Sin esta deduplicación, los conteos y las sumas se inflarían artificialmente. Todas las consultas de contratos leen de esa tabla base ya deduplicada (ver [Materialización](02-Datos-y-Materializacion.md)).

### 3.3. Ventana temporal fija y `valor > 0`

Todos los agregados de contratos aplican exactamente el mismo filtro:

```sql
WHERE fecha_firma BETWEEN '2022-01-01' AND '2026-12-31'
  AND valor IS NOT NULL AND valor > 0
```

- **Ventana fija 2022–2026** en todas las secciones, para que un dato de "¿Cómo contrata?" sea directamente comparable con uno de "¿Hay señales?".
- **`valor > 0`** descarta contratos sin cuantía declarada (que romperían medianas y porcentajes).
- **2026 es un año parcial**: solo incluye contratos firmados hasta el corte de datos. No se anualiza ni se proyecta.

### 3.4. Normalización canónica, calculada una sola vez

Para evitar que cada consulta repita la misma lógica (y diverja), la tabla base materializa dos columnas ya normalizadas:

- **`modalidad_norm`** → las 65+ etiquetas crudas de SECOP se colapsan a **7 categorías canónicas** (Contratación directa, Régimen especial, Mínima cuantía, Selección abreviada, Licitación pública, Concurso de méritos, Otras).
- **`objeto_label`** → la categoría de objeto se mapea a una etiqueta legible.

Así, "% directa" es **una sola cifra (78,3 %) en todo el sitio**, calculada con una única definición, y no dos métodos que darían dos números distintos. Lo mismo aplica al mapa: los departamentos se normalizan a **código DANE** (insensible a tildes) antes de agregar.

### 3.5. Entidades por NIT, con el nombre más frecuente

Una entidad nacional (ICBF, INVÍAS…) firma bajo **un solo NIT** pero con decenas de nombres regionales. Agrupamos por `entidad_nit` para consolidar toda la entidad, y mostramos como nombre el **más frecuente** vía `APPROX_TOP_COUNT(entidad_nombre, 1)`, no uno arbitrario. Así aparece, por ejemplo, **"ICBF Sede Nacional"** representando a todo el ICBF, en lugar de "ICBF Regional Caquetá".

### 3.6. Concentración como hecho, no como veredicto

"El top‑10 de contratistas concentra el **7,0 %** del valor total" es un descriptor del mercado, no un juicio. Se calcula sumando el valor de cada contratista, ordenándolos (`ROW_NUMBER`) y tomando la fracción de los 10 mayores sobre el total. Una concentración alta o baja puede tener explicaciones legítimas; el número no las juzga. Para los sectores también reportamos el **HHI** (índice Herfindahl‑Hirschman), un descriptor estándar de concentración de mercado, sin etiquetar ningún valor como "bueno" o "malo".

---

## 4. KPIs descriptivos por dominio

Además de los agregados nacionales, el observatorio materializa indicadores descriptivos por dominio. Todos siguen las mismas reglas (ventana fija, dedup, mediana sobre media) y se leen de `public/data/kpis_extra.json` y archivos hermanos.

| KPI | Qué describe | Método | Dónde |
|---|---|---|---|
| **Cadena presupuestal BPIN** | Cuánto se mueve por los 4 estados: vigente → comprometido → obligado → pagado | Sumas por estado y vigencia (BPIN/DNP) | ¿En qué se invierte? |
| **Tamaño típico de contrato** | Mediana y cuartiles por nivel de gobierno, modalidad y categoría de objeto | `APPROX_QUANTILES` p25/p50/p75 | ¿Cómo contrata? |
| **Distribución del pago** | Cómo se reparten los contratos por tramo de % pagado (0 %, 1‑30 %, 30‑70 %, 70‑99 %, ≥100 %) | Conteo por tramo + mediana del ratio pagado | ¿Se ejecuta? |
| **HHI por sector** | Concentración de proveedores dentro de cada categoría de objeto | Suma de cuadrados de cuotas de mercado | ¿Hay señales? |
| **Antigüedad del contratista** | Distribución de años desde la matrícula mercantil (RUES) | Mediana y tramos sobre cobertura parcial (~41,5 %) | ¿Quién contrata? |
| **Multas SECOP** | Multas y cláusulas penales registradas en SECOP, por año y NIT | Conteo, suma y cruce por NIT | ¿Hay señales? |
| **Per cápita por departamento** | Valor y nº de contratos por habitante | Valor / población DANE | ¿Dónde? |
| **Reincidencia del contratista** | Cómo se reparte el valor según cuántos contratos acumula cada NIT (1, 2‑4, 5‑9, 10+) | Conteo por tramo de frecuencia | ¿Quién contrata? |
| **Fidelidad PAA** | Qué fracción de lo planeado en el PAA termina en un proceso real | Cruce PAA↔procesos por entidad | ¿Qué se planea? |

> **Nota sobre coberturas parciales:** algunos KPIs (antigüedad del contratista, distribución de pago) se basan en campos que no están presentes en el 100 % de los registros. Cuando es así, la cifra reporta su **cobertura** (p. ej. antigüedad cubre ~41,5 % de los contratos) y nunca se presenta como si fuera universal.

---

## 5. Qué NO hacemos

Esta lista es tan importante como la anterior. Son operaciones que el proyecto **deliberadamente evita**, por coherencia con "describe, no juzga":

- ❌ **No hay scoring.** No existe un "puntaje de riesgo" ni un "índice de corrupción" de 0 a 100. No ponderamos variables para producir una nota. (El proyecto matriz, privado, sí usaba scoring; este observatorio público lo eliminó por diseño.)
- ❌ **No hay rankings de "peores".** No ordenamos entidades, contratistas ni territorios por sospecha. Los "top" que mostramos son por **magnitud descriptiva** (más valor, más contratos), nunca por mérito moral ni por riesgo inferido.
- ❌ **No emitimos juicios.** El dashboard no afirma que algo sea irregular, ilegal o indebido. No señala culpables.
- ❌ **No inferimos irregularidades a partir de los cruces.** Una coincidencia de NIT entre aportantes/sancionados y contratistas es un hecho aritmético, no una infracción. Ver [Los cruces](08-Los-Cruces.md).
- ❌ **No inferimos relaciones sutiles.** Los cruces usan **igualdad exacta de NIT**; no usamos nombres parecidos, parentescos, redes societarias, beneficiarios finales ni "probabilidades de ser la misma persona". Esto evita falsos positivos por homonimia, a costa de no detectar vínculos indirectos.
- ❌ **No establecemos causalidad ni temporalidad como prueba.** Que un contrato ocurra después de una donación o de una sanción no demuestra que sea su consecuencia. **Correlación no es causalidad.**
- ❌ **No interpretamos intenciones** detrás de los números.
- ❌ **No corregimos ni reemplazamos los datos de la fuente.** Salvo la limpieza documentada (dedup, normalización, `valor > 0`), reflejamos lo que SECOP, DNP, SIRI y CNE publican, con sus propias limitaciones. Ver [Caveats](09-Caveats-Y-Limites.md).

---

## 6. La sección "¿Hay señales?": señales, no alertas

La sección de señales muestra indicadores como la **concentración del top‑10 (7,0 % del valor)**, el **% de contratación directa (78,3 % de los contratos, 45,3 % del valor)**, las **sanciones SIRI registradas (13.441)**, las **multas SECOP** y la **financiación electoral ($1,34 billones)**. Todos son **hechos estadísticos descriptivos**.

Una concentración alta, mucha contratación directa o la presencia de un registro sancionatorio **no implican** irregularidad: pueden tener explicaciones legítimas —mercados pequeños, urgencias amparadas en la ley, modalidades de uso legítimo en numerosos supuestos, sanciones vencidas o de alcance limitado—. Por eso la sección lleva siempre una **nota metodológica visible** y se llama "señales" —algo que invita a mirar— y no "alertas" —algo que afirma un problema—.

---

## 7. Los cruces, en una frase metodológica

Los cruces de la sección **¿Se cruzan los datos?** juntan dos conjuntos públicos por un identificador común (el NIT) y **cuentan** las coincidencias. El método es **coincidencia exacta de NIT, sin inferencia y sin ponderación**:

| Cruce | NITs que coinciden | Contratos | Valor contratado de esos NITs |
|---|---|---|---|
| Aportante ↔ contratista | 27.488 | 120.229 | $28,6 billones |
| Sancionado ↔ contratista (firma posterior a la sanción) | 1.560 | 8.970 | $6,8 billones |

Dos precisiones esenciales:

- **El valor mostrado es lo contratado** por el NIT coincidente, **no** el monto donado ni el de la sanción.
- El cruce es **conservador**: la coincidencia exacta de NIT puede **subestimar** los solapamientos cuando hay diferencias de formato (dígito de verificación, ceros a la izquierda). Preferimos subestimar antes que producir falsos positivos.

El tratamiento completo —incluido por qué **no es acusatorio**— está en [Los cruces](08-Los-Cruces.md).

---

## 8. Reproducibilidad y validación

El método no es una caja negra: **todo el cálculo es público, auditable y verificable**.

- **Consultas SQL** en [`data/queries/`](../data/queries) — **45 archivos `.sql`**, una por sección/dominio, con la ventana 2022–2026 y los filtros explícitos. Cada archivo lleva comentarios que explican qué calcula y por qué.
- **Transformación** en [`data/materialize_public.py`](../data/materialize_public.py): consulta BigQuery, construye la **tabla base deduplicada por `id`**, normaliza (código DANE insensible a tildes, modalidades a 7 categorías, objetos a etiquetas legibles, modalidad del PAA faltante rotulada como **"No especificada"** en lugar de "Otras") y escribe `public/data/*.json`.
- **Funciones de forma** (`shape_*`) separadas de la consulta, para poder **probarlas sin BigQuery** (`data/test_materialize.py`).
- **Validación Zod en runtime**: el frontend valida cada JSON contra un esquema antes de renderizar, de modo que un dato malformado falla de forma visible en lugar de pintar una cifra silenciosamente incorrecta.
- **Guards anti‑fragmentación** en [`data/verify_snapshot.py`](../data/verify_snapshot.py): tras materializar, el verificador re‑ejecuta las consultas, **reconcilia cada KPI contra su JSON** y aplica guardias estructurales —entre ellas que no existan **etiquetas categóricas duplicadas** (anti‑fragmentación) y una **guardia de sentido** sobre los valores de las señales—. Si algo no cuadra, el snapshot no se publica.

Cualquiera con acceso a una tabla `contratos` equivalente puede **regenerar el snapshot a mano** y comprobar que cada número del dashboard reconcilia con la fuente. La [Auditoría de datos](06-Auditoria-De-Datos.md) documenta esa reconciliación y los problemas encontrados y corregidos.

---

## 9. Si quieres otra metodología

El proyecto está diseñado para ser **forkeable**: reemplaza las consultas y las transformaciones con tu propio enfoque —otra ventana temporal, otras fuentes, otros agregados, incluso un scoring si así lo decides— y vuelve a materializar. El observatorio te da la base transparente; el método que construyas encima es tuyo. Ver [Hacer un fork](04-Hacer-Un-Fork.md).

---

Más sobre el origen de las cifras en [Fuentes](01-Fuentes.md), sobre cómo se limpian en [Materialización](02-Datos-y-Materializacion.md), sobre el detalle de cada cálculo en [Cómo se calcula todo](13-Como-Se-Calcula-Todo.md), sobre su veracidad en [Auditoría de datos](06-Auditoria-De-Datos.md), y sobre sus límites en [Caveats](09-Caveats-Y-Limites.md).
