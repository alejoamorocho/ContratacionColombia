# Preguntas frecuentes (FAQ)

Respuestas cortas y neutrales a las dudas más comunes. Todo el proyecto se rige por un principio: **describe, no juzga**. Si una respuesta te deja con ganas de más, al final de cada bloque hay enlaces a la página que profundiza.

> **La pregunta que más se repite, de una vez:** *¿esto dice quién es corrupto?* **No.** El observatorio organiza y muestra datos públicos. No juzga, no acusa, no califica a nadie. Ninguna cifra de este sitio es una conclusión sobre legalidad o conducta. Ver [Metodología](03-Metodologia.md).

## Sobre el enfoque (qué es y qué no es)

### ¿Esto dice quién es corrupto o señala culpables?
No. El proyecto **describe** datos abiertos; no emite juicios. Una cifra alta, una concentración o una coincidencia entre listados es un **hecho estadístico descriptivo**, no una acusación. No hay scores de riesgo, ni rankings de "los peores", ni semáforos. Ver [Metodología](03-Metodologia.md) y [Caveats y límites](09-Caveats-Y-Limites.md).

### Entonces, ¿para qué sirve?
Para **hacerse preguntas** sobre la contratación pública con datos organizados: ver escalas, patrones, distribuciones geográficas y coincidencias entre fuentes. Es un punto de partida para investigar, no un veredicto. Quien quiera afirmar algo sobre un caso concreto debe ir a la **fuente primaria** y verificar.

### ¿Por qué insisten tanto en "describe, no juzga"?
Porque los datos abiertos de contratación se prestan a interpretaciones apresuradas. Una empresa puede tener mil contratos por ser grande, no por nada irregular. Marcar la frontera entre **describir un hecho** y **juzgar a una persona** es lo que mantiene al proyecto honesto y útil.

## Sobre las secciones nuevas y los cruces

### En "¿Se cruzan los datos?" aparece mi empresa (o alguien que conozco) junto a donantes o sancionados. ¿Eso la acusa de algo?
No. Que un **NIT** aparezca en dos listas públicas a la vez es una **coincidencia aritmética**, no una irregularidad. El cruce solo dice: *este identificador está en ambas listas.* No afirma causalidad, ni temporalidad, ni ilegalidad. Ver [Los cruces](08-Los-Cruces.md).

### ¿Un sancionado puede contratar con el Estado? ¿No es eso ilegal?
No necesariamente. Una **sanción no inhabilita automáticamente para todo ni para siempre**: tiene tipos, alcances, vigencias y recursos. Un registro en SIRI **no** equivale a una inhabilidad vigente para un contrato y una fecha concretos. El cruce además es **por NIT dentro de la ventana** y **no establece** si el contrato fue antes, durante o después de la sanción. Verificar un caso real requiere consultar SIRI (Procuraduría) y el acto administrativo puntual. Ver [Los cruces](08-Los-Cruces.md).

### ¿Los aportes a campañas son ilegales? ¿Por qué los muestran junto a contratos?
**Aportar a una campaña es legal.** La financiación electoral está regulada y reportarla es obligatorio (por eso existe **Cuentas Claras** del CNE). Que una persona o empresa done **y** además contrate con el Estado no es, por sí solo, una infracción. El cruce donante ↔ contratista cuenta **27.488 NITs** que coinciden (con **$28,6 billones** contratados), pero ese valor es **lo contratado por esos NITs**, no el monto donado, y no implica ninguna relación causal. Ver [Los cruces](08-Los-Cruces.md).

### ¿Cómo hacen el cruce? ¿Usan nombres parecidos o redes?
No. El cruce es **coincidencia exacta de NIT**: el mismo identificador normalizado en ambas fuentes. No usamos nombres similares, parentescos, ni "probabilidad de ser la misma persona". Es deliberadamente **conservador**: evita falsos positivos por homonimia, pero también **subestima** los cruces reales (NITs mal digitados o personas naturales sin NIT no coinciden). Ver [Los cruces](08-Los-Cruces.md).

### ¿Qué significan las secciones de planeación, inversión y ejecución?
- **¿Qué se planea?** muestra el **PAA** (Plan Anual de Adquisiciones): lo que las entidades **planean** comprar (**$58,6 B**). Es una intención, no un contrato firmado.
- **¿En qué se invierte?** usa **BPIN** (DNP): **presupuesto vigente 2025–2026** (**$424,8 B**, 34 % ejecutado). Es **presupuesto**, no contratos, y vive en otro universo: **no se debe sumar** con el valor de contratos de SECOP II.
- **¿Se ejecuta?** describe la cadena **contratado ($584,8 B) → facturado ($190,7 B) → pagado ($154,5 B)**.

Cada una tiene su salvedad; ver [Las secciones](07-Las-Secciones.md) y [Caveats y límites](09-Caveats-Y-Limites.md).

### ¿Por qué no muestran cuántos oferentes compitieron por cada proceso?
Porque el dato **no existe en la fuente**. El dataset de procesos de SECOP II no trae el número de oferentes, así que **no se puede medir la competencia**. Preferimos no mostrar un indicador que no podemos sustentar. Ver el caveat de procesos en [Caveats y límites](09-Caveats-Y-Limites.md).

## Sobre las cifras y sus límites

### ¿Por qué el gasto total parece bajo para todo un país?
Porque **el valor total subestima el gasto público real**. Las cifras son **valor de lo publicado en SECOP II**, no el gasto del Estado completo. Quedan fuera, entre otros:
- **SECOP I** (no se ingiere).
- **Adiciones y prórrogas** (el valor base no las suma).
- **Regímenes especiales** y entidades que no publican en SECOP II.

Por eso el total (**$583,8 B** sobre **3.969.440** contratos) es un **piso**, no el gasto completo. Ver [Caveats y límites](09-Caveats-Y-Limites.md) y [Auditoría de datos](06-Auditoria-De-Datos.md).

### ¿Por qué muestran la mediana ($20 M) y no solo el promedio?
Porque hay **valores extremos** (*outliers*) que pueden ser **errores de digitación de la fuente**. No los borramos —alterar el dato crudo iría contra la transparencia—, pero distorsionan el promedio. La **mediana (~$20 millones)** es robusta a esos extremos y describe mucho mejor el **contrato típico**. Ver el detalle en [Auditoría de datos](06-Auditoria-De-Datos.md).

### ¿Por qué 2026 se ve incompleto?
Porque es el **año en curso**: la ventana llega hasta la fecha de corte del snapshot y 2026 se va llenando a medida que se publican contratos. Comparar 2026 contra años cerrados es **injusto por construcción**. Lo mismo, en sentido inverso, pasa con el **primer semestre de 2022**, que tiene **baja cobertura** porque la adopción de SECOP II no fue uniforme. Ver [Caveats y límites](09-Caveats-Y-Limites.md).

### ¿Por qué algunos contratos no aparecen en el mapa?
Porque **~5 %** de los contratos traen un departamento ausente, ambiguo o no reconocible y **no se mapean**. No se imputa ni se inventa una ubicación: lo no mapeable se deja fuera del mapa. Por eso los totales del mapa son algo menores que el total nacional. Ver [Caveats y límites](09-Caveats-Y-Limites.md).

### ¿Por qué hay datos solo de ciertos años en algunas secciones?
Porque cada fuente tiene su propia cobertura:
- **PAA (planeación):** solo **2024–2026**.
- **BPIN (inversión):** **presupuesto vigente 2025–2026**.
- **Electoral (Cuentas Claras):** solo ciclos **2022–2023**.

No es un olvido: es el alcance real del dato disponible. Ver [Fuentes](01-Fuentes.md) y [Caveats y límites](09-Caveats-Y-Limites.md).

### ¿Se puede confiar en estos números?
Son **agregados descriptivos de datos abiertos**, reproducibles y auditados internamente, pero **no son una auditoría oficial ni una denuncia**. Cada cifra tiene límites conocidos que **acotan** lo que puede afirmar (sin invalidarla). La transparencia del método —consultas y limpieza abiertas— permite que cualquiera verifique. Ver [Auditoría de datos](06-Auditoria-De-Datos.md).

## Sobre la actualización

### ¿Están actualizados al minuto?
No. Es una **foto fija**: un *snapshot* que se regenera **manualmente** cuando los mantenedores corren el materializador. La fecha de corte aparece en la sección **Acerca** del sitio.

### ¿Por qué no se actualiza en tiempo real?
Porque el sitio público es **estático**: solo lee archivos JSON, no consulta ninguna base de datos en vivo. Esto lo hace barato, rápido y seguro, a cambio de no ser tiempo real. Refrescar los datos es un paso deliberado que ejecutan los mantenedores. Ver [Datos y materialización](02-Datos-y-Materializacion.md).

### ¿Cada cuánto se refresca?
Cuando los mantenedores deciden refrescar el snapshot. No hay un cron público ni una promesa de frecuencia fija. La fecha del último corte siempre se indica en **Acerca**.

## Sobre el uso técnico y el fork

### ¿Necesito BigQuery o una cuenta para usar el sitio?
No. El sitio público es 100 % de **solo lectura** y **anónimo**: no hay login, registro ni cuentas. Solo necesitas un navegador.

### ¿Necesito BigQuery para forkearlo y desplegarlo?
**No para desplegarlo.** El snapshot JSON viene **incluido** en el repositorio, así que puedes clonar, construir y publicar sin tocar ninguna base de datos. Solo necesitas BigQuery (y acceso a las fuentes) si quieres **regenerar** los datos desde cero con tu propia consulta. Ver [Hacer un fork](04-Hacer-Un-Fork.md).

### ¿Puedo usar este código para mi propio proyecto, incluso comercialmente?
Sí. La licencia es **Apache 2.0**: puedes usarlo, modificarlo, redistribuirlo y desplegarlo —incluso con fines comerciales— conservando la atribución y el aviso de licencia. El proyecto fue creado por **Alejandro y Juan José Amorocho**. Ver [Hacer un fork](04-Hacer-Un-Fork.md).

### ¿Dónde puedo desplegarlo?
En **cualquier hosting estático**: Firebase Hosting, Netlify, Vercel, GitHub Pages o un bucket con CDN. Como no hay backend, no hay nada que aprovisionar más allá de servir archivos. Ver [Hacer un fork](04-Hacer-Un-Fork.md).

### ¿Por qué es estático y no una app con backend?
Por **simplicidad, costo y seguridad**: no hay servidor que mantener ni que pueda ser abusado, no hay base de datos pública que proteger, y la única superficie expuesta son archivos JSON. El procesamiento pesado ocurre **antes**, en el pipeline de materialización, no en cada visita. Ver [Datos y materialización](02-Datos-y-Materializacion.md).

### ¿Cómo se generan los JSON que lee el sitio?
Un pipeline ejecutable a mano (`data/materialize_public.py` + `data/queries/*.sql`) lee BigQuery, **deduplica** los contratos por `id`, **normaliza** (códigos DANE insensibles a tildes, modalidades a 7 categorías, objetos a etiquetas legibles) y escribe `public/data/*.json`. Es totalmente reproducible. Ver [Datos y materialización](02-Datos-y-Materializacion.md).

### ¿Tiene login, cuentas o recoge datos míos?
No. El sitio público no tiene autenticación, no guarda perfiles y es de solo lectura. No hay nada que iniciar sesión ni nada que registrarse.

## Sobre las fuentes y los errores

### ¿De dónde salen los datos exactamente?
De cuatro fuentes abiertas, ventana **2022–2026**:
- **SECOP II** (Colombia Compra Eficiente): contratos, procesos, PAA y facturas.
- **BPIN** (DNP): presupuesto por proyecto de inversión.
- **Sanciones SIRI** (Procuraduría): registros sancionatorios (**13.441**).
- **Aportes de campaña — Cuentas Claras** (CNE): financiación electoral (**$1,34 B**).

Detalle de cada una en [Fuentes](01-Fuentes.md).

### Encontré un error en los datos o en una gráfica. ¿Qué hago?
Abre un *issue* en el repositorio indicando la **sección** y el **periodo**, y si puedes, la cifra que esperabas y por qué. Como todo es reproducible, es fácil rastrear el origen. Ver [CONTRIBUTING](../CONTRIBUTING.md).

### Vi una coincidencia que me parece sospechosa. ¿Qué hago?
**Verifícala en la fuente primaria**, caso por caso: el contrato en **SECOP II**, el aporte en **Cuentas Claras**, la sanción en **SIRI**, y los actos administrativos de la entidad. Una coincidencia sirve para **formular una pregunta**, no para responderla. Este observatorio señala dónde mirar; no sustituye la verificación. Ver [Los cruces](08-Los-Cruces.md).

---

¿No está tu pregunta aquí? Empieza por [Qué es](00-Que-Es.md), revisa los [Caveats y límites](09-Caveats-Y-Limites.md) o vuelve al [índice de la wiki](Home.md).
