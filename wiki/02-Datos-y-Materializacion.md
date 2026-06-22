# Cómo se limpian y agregan los datos

## El flujo

```
BigQuery (tabla contratos)
   │  data/materialize_public.py   (lo corre quien tenga acceso a la fuente)
   ▼
public/data/*.json                 (snapshot agregado, commiteado al repo)
   ▼
SPA estática                       (lo lee el navegador, solo lectura)
```

El sitio **nunca** consulta BigQuery: solo lee el JSON ya calculado. Por eso es barato y seguro.

## El materializador

`data/materialize_public.py` hace tres cosas:

1. **Consulta** BigQuery con las SQL de `data/queries/*.sql` (ventana 2022–2026, `valor > 0`).
2. **Transforma** las filas con funciones puras `shape_*` al formato exacto de `src/lib/types.ts`.
3. **Escribe** un archivo por sección en `public/data/`.

Las funciones `shape_*` están separadas de la consulta para poder **probarlas sin BigQuery** (ver `data/test_materialize.py`).

## Archivos generados

| Archivo | Contenido |
|---------|-----------|
| `meta.json` | Ventana, fecha de corte, fuentes, notas |
| `panorama.json` | KPIs macro + por año + top sectores |
| `quien.json` | Top entidades, por nivel de gobierno, por sector |
| `como.json` | Por modalidad, evolución, % directa |
| `donde.json` | Agregados por departamento (DANE) |
| `senales.json` | Concentración, percentiles, notas |

## Normalización geográfica

La columna `entidad_departamento` viene heterogénea (código de 2 o 5 dígitos, o nombre). El materializador la normaliza a **código DANE de 2 dígitos** con un `CASE WHEN` para poder pintar el mapa de Colombia de forma consistente.

## Regenerar

Ver **[Hacer un fork](04-Hacer-Un-Fork.md)** § "Cambia los datos".
