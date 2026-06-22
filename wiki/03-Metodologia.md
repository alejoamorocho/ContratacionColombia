# Metodología

## Principio rector: describe, no juzga

Este observatorio **no emite juicios**. No dice quién está bien o mal, no calcula un "puntaje de corrupción", no señala culpables. Muestra **estadística descriptiva** sobre datos públicos para que cada persona saque sus conclusiones.

## Qué calculamos

- **Conteos y sumas**: número de contratos, valor total, entidades y contratistas únicos.
- **Distribuciones**: por año, por sector, por modalidad, por nivel de gobierno, por departamento.
- **Percentiles** de valor (p10…p90), usando medianas y cuantiles — no promedios sobre distribuciones sesgadas.
- **Concentración**: qué porcentaje del valor se lleva el top-10 de contratistas. Es un dato descriptivo, **no** una acusación.

## Qué NO hacemos

- ❌ Scoring o ranking de "riesgo" / "corrupción".
- ❌ Cruces que infieran irregularidades (sanciones, parentescos, etc.).
- ❌ Señalar entidades o personas concretas como sospechosas.
- ❌ Interpretar intenciones detrás de los números.

## Sobre la sección "Señales"

La sección **Señales** muestra indicadores como la concentración del mercado o el % de contratación directa. Son **hechos estadísticos**. Una concentración alta o mucha contratación directa **no implican** irregularidad: pueden tener explicaciones legítimas. Por eso la sección lleva siempre una nota metodológica visible.

## Reproducibilidad

Todas las consultas SQL están en `data/queries/` y el código de transformación en `data/materialize_public.py`. Cualquiera puede auditar exactamente cómo se calculó cada número, o cambiarlo en un fork.

## Si quieres otra metodología

Forkéalo. El proyecto está diseñado para que reemplaces las consultas y las transformaciones con tu propio enfoque. Ver **[Hacer un fork](04-Hacer-Un-Fork.md)**.
