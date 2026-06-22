# Cómo contribuir

¡Gracias por tu interés! Este es un proyecto abierto para que la ciudadanía vea y construya sobre datos públicos. Cualquier mejora —una gráfica más clara, una sección nueva, una corrección— es bienvenida.

## Principios

- **Describe, no juzga.** Mantén el tono neutral. Mostramos datos, no emitimos juicios ni acusaciones.
- **Simple y estático.** El sitio público no debe llamar funciones, bases de datos ni APIs. Solo lee JSON estáticos. Si una mejora necesita backend, va en un proyecto aparte.
- **KISS / YAGNI.** Componentes pequeños y enfocados; cada sección lee su propio JSON; sin abstracciones innecesarias.

## Flujo

1. Haz un fork y crea una rama: `git checkout -b mi-mejora`.
2. Desarrolla: `npm install && npm run dev` (usa el snapshot incluido, no necesitas BigQuery).
3. Verifica antes de abrir PR:
   ```bash
   npx tsc --noEmit     # tipos
   npm run build        # build de producción
   npm run test         # tests
   ```
4. Abre un Pull Request describiendo el cambio.

## Estructura

```
src/
  pages/          una página por sección (lee su JSON)
  components/     shell (sidebar, layout) + charts reutilizables + mapa
  hooks/          usePublicData (carga de JSON)
  lib/            tipos, formato, helpers, config
  styles/         tokens y estilos base
public/data/      snapshot JSON (commiteado)
data/             materializador Python + consultas SQL
```

## Datos

Para cambiar qué datos se muestran, edita el materializador (`data/materialize_public.py` y `data/queries/*.sql`) y los tipos en `src/lib/types.ts`. Mantén ambos en sincronía: el JSON que emite el materializador debe cumplir exactamente los tipos.

## Reportar problemas

Abre un *issue* describiendo qué viste y qué esperabas. Si es sobre los datos, indica la sección y el periodo.
