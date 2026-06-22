# Cómo cruzamos los datos

La sección **¿Se cruzan los datos?** del dashboard junta dos conjuntos de datos públicos por un identificador común —el **NIT**— y cuenta las coincidencias. Esta página explica **qué cruces hacemos**, **cómo los hacemos** y, sobre todo, **por qué no son acusatorios**.

> **Lo primero, en una frase:** una coincidencia es una coincidencia, **no** una irregularidad. Que un NIT aparezca en dos listas públicas es un hecho aritmético, no un señalamiento. Lee hasta el final antes de sacar conclusiones.

## Los dos cruces

| Cruce | Fuente A | Fuente B | Coinciden (NITs) | Valor contratado de esos NITs |
|---|---|---|---|---|
| Donante ↔ contratista | Aportes de campaña (Cuentas Claras, CNE) | Contratos (SECOP II) | **27.488** | **$28,6 billones** |
| Sancionado ↔ contratista | Sanciones SIRI (Procuraduría) | Contratos (SECOP II) | **1.560** | **$6,8 billones** |

Ambos cruces se calculan sobre la misma ventana del observatorio, **2022–2026**, y sobre la base de contratos **deduplicada por `id`** (ver [Auditoría de datos](06-Auditoria-De-Datos.md)).

### Donante ↔ contratista
NITs que **aparecen como aportantes** a campañas políticas en el sistema Cuentas Claras del CNE **y también** figuran como contratistas en SECOP II. El valor mostrado es la suma de lo que esos NITs tienen contratado en la ventana, **no** el monto donado.

### Sancionado ↔ contratista
NITs que **figuran con una sanción** en el sistema SIRI de la Procuraduría **y también** aparecen como contratistas. El cruce se hace **post-sanción**: nos interesa la coincidencia entre quien tiene un registro sancionatorio y quien contrata, dentro de la ventana de datos.

## El método (coincidencia exacta de NIT)

El cruce es deliberadamente **simple y transparente**:

1. **Llave única: el NIT.** Se comparan identificadores normalizados (sin dígito de verificación inconsistente, sin espacios ni puntos). Es una **coincidencia exacta**: el mismo NIT en ambas listas.
2. **Ventana 2022–2026.** Solo se consideran contratos dentro de la ventana del observatorio.
3. **Sin inferencia.** No usamos nombres parecidos, ni parentescos, ni redes, ni "probabilidades de ser la misma persona". Solo igualdad de NIT. Esto evita falsos positivos por homonimia, pero también significa que el cruce **no** detecta relaciones más sutiles.
4. **Se cuenta, no se pondera.** El resultado es un **conteo** de NITs coincidentes y la **suma** de su valor contratado. No hay score, ranking ni semáforo. (Ver [Metodología](03-Metodologia.md).)

Toda la lógica está en [`data/materialize_public.py`](../data/materialize_public.py) y las consultas en [`data/queries/`](../data/queries). Cualquiera puede reproducir o cambiar el cruce en un [fork](04-Hacer-Un-Fork.md).

## Por qué esto **no** es acusatorio

Este es el punto más importante de la página. Una coincidencia de NIT **no implica** que haya ocurrido nada irregular. Hay muchas explicaciones legítimas y, además, límites técnicos del propio dato:

- **Aportar a una campaña es legal.** La financiación de campañas está regulada y reportarla es obligatorio. Que una empresa o persona done **y** contrate con el Estado no es, por sí mismo, una infracción.
- **Una sanción no inhabilita automáticamente para todo, ni para siempre.** Las sanciones tienen tipos, alcances, vigencias y recursos. Un registro en SIRI **no** equivale a una inhabilidad vigente para contratar en una fecha y objeto concretos. Verificarlo requiere consultar el caso puntual.
- **La coincidencia no respeta el tiempo del caso.** El cruce es por NIT dentro de la ventana; **no** establece que el contrato sea posterior, anterior o consecuencia de la sanción o de la donación. La correlación temporal no está demostrada por el cruce.
- **El NIT no distingue circunstancias.** Empresas grandes, gremios y personas con actividad económica amplia aparecen naturalmente en muchas listas. La coincidencia puede deberse a tamaño o actividad, no a un vínculo causal.
- **Las fuentes tienen errores y vacíos.** Aportes (solo ciclos **2022–2023**), sanciones y contratos provienen de sistemas distintos, con calidades distintas. Puede haber NITs mal digitados, homónimos institucionales o registros desactualizados.
- **No hay relación causal en ningún sentido.** El dashboard **no** afirma que la donación "compró" el contrato, ni que la sanción debió impedirlo. Solo dice: *estos NITs están en ambas listas.* Punto.

> **Correlación no es causalidad.** Coincidir en dos bases de datos públicas describe una intersección estadística. Cualquier interpretación causal —y cualquier juicio sobre personas o entidades concretas— **excede lo que el dato permite afirmar.**

## Una invitación a verificar (no a concluir)

Estos cruces sirven para **hacerse preguntas**, no para responderlas. Si una coincidencia te llama la atención, el camino correcto es **ir a la fuente primaria**, caso por caso:

- **SECOP II** (Colombia Compra Eficiente): el contrato, su objeto, su modalidad y sus fechas.
- **Cuentas Claras** (CNE): el reporte de aportes, el ciclo electoral y el destinatario.
- **SIRI** (Procuraduría): el tipo de sanción, su alcance, su vigencia y si está en firme.
- Los **portales de las entidades** y los actos administrativos correspondientes.

Solo la fuente primaria —y, cuando aplique, el contexto jurídico— permite afirmar si hubo o no una irregularidad. Este observatorio **no** sustituye esa verificación: la facilita señalando dónde mirar.

## Caveats específicos de los cruces

- **Aportes de campaña: solo ciclos 2022–2023.** Coincidencias de otros años no están cubiertas.
- **Coincidencia exacta de NIT:** no captura homónimos, intermediarios, beneficiarios finales ni vínculos indirectos. Es estricta a propósito.
- **El valor mostrado es lo contratado por el NIT coincidente,** no el monto donado ni el monto sancionado.
- **No se infiere temporalidad** entre el contrato y la donación o la sanción.
- **`valor_total` subestima el gasto** (no incluye SECOP I ni adiciones), por lo que las sumas de estos cruces también son cotas inferiores. Ver [Auditoría de datos](06-Auditoria-De-Datos.md).

## En resumen

| | |
|---|---|
| **Qué es** | El conteo de NITs que aparecen en dos listas públicas a la vez. |
| **Qué no es** | Una acusación, un score de riesgo, una prueba de irregularidad o de causalidad. |
| **Para qué sirve** | Para formular preguntas y saber dónde verificar. |
| **Cómo verificar** | En la fuente primaria, caso por caso (SECOP II, Cuentas Claras, SIRI). |

---

Más sobre el enfoque general en [Metodología](03-Metodologia.md), sobre la calidad de las cifras en [Auditoría de datos](06-Auditoria-De-Datos.md), y sobre las fuentes en [De dónde vienen los datos](01-Fuentes.md).
