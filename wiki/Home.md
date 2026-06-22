# Wiki — VECTORVI público

Observatorio estático y open source de la contratación pública colombiana (SECOP II, 2022–2026). **Describe, no juzga.**

## Páginas

- **[De dónde vienen los datos](01-Fuentes.md)** — la fuente SECOP II y el esquema.
- **[Cómo se limpian y agregan](02-Datos-y-Materializacion.md)** — el materializador y las consultas.
- **[Metodología](03-Metodologia.md)** — qué calculamos y qué NO (sin scoring, sin juicios).
- **[Hacer un fork](04-Hacer-Un-Fork.md)** — clona, cambia, despliega lo tuyo.
- **[FAQ](05-FAQ.md)** — preguntas frecuentes.

## En una frase

Tomamos datos públicos de contratación, los agregamos en BigQuery, exportamos un snapshot JSON y lo mostramos en un dashboard estático con gráficas. Sin backend público, sin opiniones: solo datos organizados.

## Arquitectura (resumen)

```
BigQuery (contratos)  →  materialize_public.py  →  public/data/*.json  →  SPA estática (CDN)
```

Todo lo necesario para reproducirlo está en este repo. Si quieres tu propia versión, ve a **[Hacer un fork](04-Hacer-Un-Fork.md)**.
