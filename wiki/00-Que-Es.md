# Qué es VECTORVI

**VECTORVI** es un **observatorio público de la contratación colombiana**: un laboratorio ciudadano que toma datos abiertos del Estado, los organiza y los muestra en un dashboard claro, navegable y gratuito. No es una entidad de control ni un medio de comunicación: es una herramienta para *mirar* los datos.

Cubre la ventana **2022–2026**: cerca de **3.969.440 contratos** por un valor reportado de **$583,8 billones**, **4.690 entidades** y **954.767 contratistas**. Todo a partir de fuentes oficiales y abiertas.

## Para qué sirve

VECTORVI existe para responder, con datos, preguntas que cualquier ciudadano podría hacerse sobre el dinero público:

- **¿Quién contrata?** — qué entidades gastan y qué contratistas reciben.
- **¿Cómo contrata?** — modalidades, procesos, cuánto se hace por contratación directa.
- **¿Qué se planea?** — el Plan Anual de Adquisiciones (PAA).
- **¿En qué se invierte?** — presupuesto por proyecto (BPIN).
- **¿Se ejecuta?** — la cadena contratado → facturado → pagado.
- **¿Dónde?** — distribución territorial en un mapa por departamento.
- **¿Hay señales?** — concentración del mercado, sanciones, financiación electoral.
- **¿Se cruzan los datos?** — coincidencias entre donantes y contratistas, o entre sancionados y contratistas.

La navegación está organizada **por preguntas**, no por tablas. La idea es que llegues con una duda y salgas con una gráfica que la responde. Para el detalle de cada cifra, ver **[Metodología](03-Metodologia.md)**.

## Para quién es

VECTORVI está pensado para quien necesita *entender* la contratación pública sin montar su propia infraestructura de datos:

| Público | Para qué le sirve |
|---|---|
| **Periodistas** | Encontrar hilos, dimensionar cifras, ubicar un caso en su contexto. |
| **Veedurías y organizaciones ciudadanas** | Vigilar el gasto en su territorio o sector con datos comparables. |
| **Academia e investigación** | Una base agregada, reproducible y citable para estudiar el mercado público. |
| **Ciudadanía** | Ver, con sus propios ojos, en qué se contrata el dinero de todos. |

## Qué lo hace distinto

- **Estático.** El dashboard es una aplicación que solo lee archivos JSON pre-calculados. No hay backend, ni base de datos, ni funciones en la versión pública: nada que se pueda manipular en vivo, nada que falle bajo carga. Lo puedes alojar en cualquier hosting estático o incluso abrir localmente.
- **Neutral.** El principio rector es **"describe, no juzga"**. VECTORVI muestra estadística descriptiva sobre datos públicos; las conclusiones las saca quien mira.
- **Reproducible.** Cada número proviene de consultas SQL versionadas (`data/queries/`) y de un materializador (`data/materialize_public.py`) que cualquiera puede ejecutar y auditar. Ver **[Datos y materialización](02-Datos-y-Materializacion.md)** y **[Auditoría de datos](06-Auditoria-De-Datos.md)**.
- **Open source.** Publicado bajo licencia **Apache 2.0**. Puedes leer el código, verificar cómo se calculó todo, y construir tu propia versión. Ver **[Hacer un fork](04-Hacer-Un-Fork.md)**.

## Qué NO es

Para evitar malentendidos, conviene ser explícitos sobre lo que VECTORVI **no** hace:

- **No es un órgano de fiscalización.** No investiga, no sanciona, no reemplaza a la Contraloría, la Procuraduría ni la Fiscalía.
- **No predice.** No estima probabilidades de fraude ni adivina comportamientos futuros.
- **No rankea "peores".** No existe un listado de entidades o contratistas malos. Una cifra alta —mucha contratación directa, una concentración elevada— **no es** una acusación: puede tener explicaciones legítimas.
- **No acusa.** Ningún dato del observatorio señala a una persona o entidad como sospechosa. Cuando se muestran coincidencias (por ejemplo, un NIT que aparece como donante y como contratista), son **hechos estadísticos**, no imputaciones.

En otras palabras: VECTORVI te da el mapa, no el veredicto.

## Honestidad sobre los datos

Trabajar con datos abiertos implica trabajar con sus límites, y los hacemos visibles en lugar de esconderlos. Por ejemplo: el valor total **subestima** el gasto real (no incluye SECOP I ni adiciones); cerca del **5%** de los contratos no tiene departamento mapeable; **2026** es un año parcial y **2022** tiene baja cobertura en su primer semestre; y se muestra la **mediana** ($20M) precisamente porque existen valores atípicos extremos que distorsionarían un promedio.

La lista completa de advertencias está en **[Fuentes](01-Fuentes.md)** y **[Auditoría de datos](06-Auditoria-De-Datos.md)**. No pretendemos que los datos sean perfectos; pretendemos que sean **transparentes**.

## En una frase

> Un laboratorio ciudadano que convierte datos abiertos de contratación pública en gráficas claras, reproducibles y sin juicios — para que cualquiera pueda mirar, no para decirle qué pensar.

---

**Siguiente:** [De dónde vienen los datos](01-Fuentes.md) · [Metodología](03-Metodologia.md) · [Volver al inicio](Home.md)
