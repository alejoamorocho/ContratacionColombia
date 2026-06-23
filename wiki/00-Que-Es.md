# Qué es VECTORVI

**VECTORVI** es un **observatorio público de la contratación colombiana**: un laboratorio ciudadano que toma datos abiertos del Estado, los organiza con consultas reproducibles y los muestra en un dashboard claro, navegable y gratuito. No es una entidad de control ni un medio de comunicación: es una herramienta para *mirar* los datos y formarse un criterio propio.

El principio que ordena todo el proyecto es uno solo, y es innegociable:

> **Describe, no juzga.**

VECTORVI presenta estadística descriptiva sobre datos públicos. No califica, no rankea «los peores», no acusa y no emite veredictos. Le da a quien mira el mapa; el juicio lo pone quien mira.

## En una frase

> Un laboratorio ciudadano que convierte datos abiertos de contratación pública en gráficas claras, reproducibles y sin juicios — para que cualquiera pueda mirar, no para decirle qué pensar.

---

## La ventana que cubre

VECTORVI cubre el periodo **2022–2026** a partir de fuentes oficiales y abiertas. Las cifras de cabecera del snapshot publicado son:

| Indicador | Valor | Qué significa |
|---|---|---|
| **Contratos** | **3.969.440** | Contratos firmados, deduplicados por identificador. |
| **Valor contratado total** | **$583,8 billones** | Suma del valor del contrato *firmado* (no incluye adiciones ni ejecución posterior). |
| **Valor mediano por contrato** | **$20,06 millones** | El contrato «típico». Se usa la mediana, no el promedio, por los atípicos extremos. |
| **Entidades contratantes** | **4.690** | Entidades públicas que aparecen como contratantes. |
| **Contratistas** | **954.767** | Personas y empresas que recibieron al menos un contrato. |

> Todas estas cifras provienen del snapshot de datos versionado en `public/data/`. La fecha de corte y de generación de cada snapshot queda registrada en `public/data/meta.json` (campos `corte_datos` y `generado`). Los números pueden cambiar cuando se regenera el snapshot; lo que se mantiene estable es el **método**.

### Algunos órdenes de magnitud del periodo

Para dimensionar el alcance del observatorio, estos son otros agregados ya materializados (ver **[Cómo se calcula todo](13-Como-Se-Calcula-Todo.md)**):

| Tema | Cifra | Fuente / página |
|---|---|---|
| Contratación **directa** (por nº de contratos) | **78,3 %** | [Cómo contrata](07-Las-Secciones.md) |
| Contratación **directa** (por valor) | **45,3 %** | [Cómo contrata](07-Las-Secciones.md) |
| Concentración: top-10 contratistas (por valor) | **7,0 %** | [Hay señales](07-Las-Secciones.md) |
| Plan Anual de Adquisiciones (PAA), valor planeado | **$58,6 billones** | [Qué se planea](07-Las-Secciones.md) |
| Inversión pública (BPIN), valor vigente | **$424,8 billones** | [En qué se invierte](07-Las-Secciones.md) |
| BPIN, % ejecutado (pagado / vigente) | **34 %** | [En qué se invierte](07-Las-Secciones.md) |
| Sanciones disciplinarias (SIRI) | **13.441** | [Hay señales](07-Las-Secciones.md) |
| Aportes a campañas (CNE) | **$1,34 billones** | [Hay señales](07-Las-Secciones.md) |
| Ejecución: facturado | **$190,7 billones** | [Se ejecuta](07-Las-Secciones.md) |
| Ejecución: pagado | **$154,5 billones** (26,5 % del contratado) | [Se ejecuta](07-Las-Secciones.md) |

El detalle del cálculo de cada cifra está en **[Metodología](03-Metodologia.md)** y **[Cómo se calcula todo](13-Como-Se-Calcula-Todo.md)**.

---

## Para qué sirve

VECTORVI existe para responder, **con datos**, preguntas que cualquier ciudadano podría hacerse sobre el dinero público. La navegación está organizada **por preguntas**, no por tablas: la idea es que llegues con una duda y salgas con una gráfica que la responde.

| Pregunta | Qué te muestra |
|---|---|
| **¿Quién contrata?** | Qué entidades gastan y qué contratistas reciben; nivel de gobierno; categoría del objeto. Las entidades se agrupan por NIT y se etiquetan con el **nombre más frecuente** (por ejemplo, «ICBF Sede Nacional»). |
| **¿Cómo contrata?** | Modalidades de contratación, cuánto se hace por **contratación directa** (78,3 % de los contratos, 45,3 % del valor), tamaño típico del contrato por nivel, modalidad y objeto. |
| **¿Qué se planea?** | El **Plan Anual de Adquisiciones (PAA)**: qué dicen las entidades que van a comprar, por categoría, origen de recursos y modalidad, y qué tan fiel resulta la ejecución frente a lo planeado. |
| **¿En qué se invierte?** | El presupuesto de **inversión pública (BPIN)** del DNP: la cadena completa **vigente → comprometido → obligado → pagado** por sector, fuente y vigencia. |
| **¿Se ejecuta?** | La cadena **contratado → facturado → pagado**, y la distribución de pago de los contratos (qué proporción está en 0 %, parcial o ≥100 %). |
| **¿Dónde?** | Distribución territorial en un mapa coroplético por departamento, incluyendo cifras **per cápita** que normalizan por población. |
| **¿Hay señales?** | Concentración del mercado (índice **HHI** por sector), sanciones (**SIRI**), multas registradas en SECOP, financiación electoral, reincidencia de contratistas y antigüedad del contratista. |
| **¿Se cruzan los datos?** | Coincidencias **factuales** entre conjuntos: un mismo NIT que aparece como donante de campaña *y* como contratista, o como sancionado *y* como contratista. Son hechos estadísticos, no imputaciones. |

---

## Para quién es

VECTORVI está pensado para quien necesita **entender** la contratación pública sin montar su propia infraestructura de datos. A cada público le sirve para algo distinto:

| Público | Para qué le sirve | Caso de uso concreto |
|---|---|---|
| **Periodistas** | Encontrar hilos, dimensionar cifras, ubicar un caso en su contexto. | «Esta entidad contrató $X por directa en 2025: ¿es mucho frente a entidades comparables? ¿Cómo se ve su cadena de pago?» Antes de publicar, comparar contra el agregado nacional. |
| **Veedurías y organizaciones ciudadanas** | Vigilar el gasto en su territorio o sector con datos comparables y reproducibles. | «¿Cuánto se contrató en mi departamento per cápita? ¿Qué modalidades predominan? ¿Cuánto del PAA se terminó ejecutando?» |
| **Academia e investigación** | Una base agregada, reproducible y **citable** para estudiar el mercado público. | Citar la metodología versionada (SQL + materializador) en un paper sobre concentración del mercado, usando el HHI por sector ya calculado, o forkear y recalcular con otros umbrales. |
| **Ciudadanía** | Ver, con sus propios ojos, en qué se contrata el dinero de todos, sin necesidad de saber SQL ni descargar gigabytes de CSV. | «¿En qué se gasta el presupuesto? ¿Cuánto va a salud, a transporte, a educación? ¿Se paga lo que se contrata?» |
| **Desarrolladores y cívicos-tech** | Una base estática, gratuita y libre para construir encima. | Forkear el repo, cambiar la ventana de años, añadir una fuente nueva o un cruce propio. Ver **[Hacer un fork](04-Hacer-Un-Fork.md)**. |

---

## Qué lo hace distinto

VECTORVI se distingue por cuatro decisiones de diseño deliberadas:

### Estático

El dashboard es una aplicación que **solo lee archivos JSON pre-calculados**. No hay backend, ni base de datos, ni funciones, ni autenticación en la versión pública. La única superficie pública son archivos estáticos servidos por CDN.

Esto tiene consecuencias prácticas:

- **Barato:** se aloja en cualquier hosting estático (Firebase Hosting, Netlify, Vercel, GitHub Pages) por costo casi nulo, o incluso se abre localmente.
- **Seguro:** no hay nada que se pueda manipular en vivo, ni inyección de consultas, ni endpoint que falle bajo carga.
- **Robusto:** no «se cae» por tráfico; un CDN sirve los mismos archivos a cualquier número de visitantes.

Los datos pasan además por una **validación con Zod en runtime**: el frontend verifica el esquema de cada JSON al cargarlo (`src/lib/schemas.ts`), de modo que un archivo malformado se detecta en lugar de romper la interfaz silenciosamente.

### Neutral

El principio rector es **«describe, no juzga»**. VECTORVI muestra estadística descriptiva sobre datos públicos; las conclusiones las saca quien mira. No hay scoring 0–100, no hay semáforos de riesgo, no hay listas de «sospechosos». Una cifra alta —mucha contratación directa, una concentración elevada— **no es una acusación**: puede tener explicaciones perfectamente legítimas.

### Reproducible

Cada número proviene de consultas SQL versionadas y de un materializador auditable:

- **`data/queries/`** contiene los **45 archivos `.sql`** que definen, una por una, las agregaciones que se muestran.
- **`data/materialize_public.py`** ejecuta esas consultas contra BigQuery y emite los JSON de `public/data/`.
- **`data/verify_snapshot.py`** valida el snapshot resultante, con **guards anti-fragmentación** que detectan, por ejemplo, que una misma entidad aparezca dispersa bajo nombres distintos en lugar de consolidada por NIT.

Cualquiera puede ejecutar ese pipeline y obtener exactamente los mismos números. Ver **[Datos y materialización](02-Datos-y-Materializacion.md)** y **[Auditoría de datos](06-Auditoria-De-Datos.md)**.

### Open source

Publicado bajo licencia **Apache 2.0**. Puedes leer el código, verificar cómo se calculó todo y construir tu propia versión. Ver **[Hacer un fork](04-Hacer-Un-Fork.md)**.

```bash
git clone https://github.com/alejoamorocho/ContratacionColombia.git
cd ContratacionColombia
npm install
npm run dev          # usa el snapshot de datos ya incluido en public/data/
```

El sitio funciona de inmediato con el snapshot commiteado: **no necesitas BigQuery** para verlo o trabajar sobre él.

---

## Qué NO es

Para evitar malentendidos, conviene ser explícitos sobre lo que VECTORVI **no** hace:

- **No es un órgano de fiscalización.** No investiga, no sanciona, no reemplaza a la Contraloría, la Procuraduría ni la Fiscalía. Si encuentras algo que amerita control, el canal son esos órganos, no este observatorio.
- **No predice.** No estima probabilidades de fraude ni adivina comportamientos futuros. Todo lo que muestra es **lo que ya pasó**, según el dato reportado.
- **No rankea «peores».** No existe un listado de entidades o contratistas «malos». Los rankings que aparecen (top entidades por valor, por ejemplo) son descriptivos —«quién mueve más dinero»— y nunca normativos —«quién lo hace peor».
- **No acusa.** Ningún dato del observatorio señala a una persona o entidad como sospechosa. Cuando se muestran **coincidencias** (por ejemplo, un NIT que aparece como donante y como contratista), son **hechos estadísticos**, no imputaciones: pueden tener mil explicaciones legítimas y su sola existencia no implica irregularidad alguna.

En otras palabras: **VECTORVI te da el mapa, no el veredicto.**

---

## Honestidad sobre los datos

Trabajar con datos abiertos implica trabajar con sus límites, y los hacemos visibles en lugar de esconderlos. Los principales:

- **El valor total subestima el gasto real.** No incluye **SECOP I** (no se ingiere) ni las **adiciones** posteriores a los contratos. La cifra es el valor del contrato *firmado*, no lo finalmente ejecutado.
- **Hay contratos sin departamento mapeable.** Cerca del **5 %** de los contratos no tiene un departamento que se pueda llevar a código DANE para el mapa; quedan fuera de la vista territorial pero dentro de los agregados nacionales.
- **2026 es un año parcial.** Solo incluye contratos firmados hasta el corte de datos, así que no es comparable «de igual a igual» con los años completos.
- **El primer semestre de 2022 tiene baja cobertura** en SECOP II frente al resto de la serie; los conteos de ese tramo deben leerse con cautela.
- **Se muestra la mediana ($20,06 M), no el promedio.** Precisamente porque existen contratos de cuantía extrema —que a veces incluyen errores de digitación en la fuente— que distorsionarían un promedio. La mediana es robusta a esos casos.
- **Las cifras de financiación electoral son de los ciclos 2022–2023** (Cuentas Claras del CNE); no cubren todo el periodo del observatorio.

No pretendemos que los datos sean perfectos; pretendemos que sean **transparentes**. La lista completa de advertencias está en **[Fuentes](01-Fuentes.md)**, **[Caveats y límites](09-Caveats-Y-Limites.md)** y **[Auditoría de datos](06-Auditoria-De-Datos.md)**.

---

**Siguiente:** [De dónde vienen los datos](01-Fuentes.md) · [Metodología](03-Metodologia.md) · [Las secciones](07-Las-Secciones.md) · [Volver al inicio](Home.md)
