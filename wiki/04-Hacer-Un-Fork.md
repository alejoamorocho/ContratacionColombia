# Hacer un fork

Este proyecto está pensado para que saques **tu propia versión**: otra ventana de años, otras gráficas, otra fuente de datos, otro país incluso. Aquí está el camino completo.

## 1. Clona y corre (sin BigQuery)

```bash
git clone <tu-fork>
cd vectorvi-public
npm install
npm run dev
```

Funciona de inmediato con el snapshot incluido en `public/data/`. No necesitas credenciales de nada para empezar.

## 2. Cambia la presentación

- **Una sección** = un archivo en `src/pages/`. Lee su JSON con `usePublicData('<seccion>')` y renderiza gráficas.
- **Gráficas** reutilizables en `src/components/charts/` (barras, líneas, dona, KPI) + el mapa en `src/components/MapaColombia.tsx`.
- **Estilo**: edita los tokens en `src/styles/tokens.css` y `globals.css`.

Añadir una sección nueva: crea `src/pages/MiSeccion.tsx`, agrégala al `Sidebar` y al `App.tsx`, y crea su JSON en `public/data/`.

## 3. Cambia los datos (opcional)

El snapshot lo genera `data/materialize_public.py` desde una tabla `contratos` en BigQuery.

```bash
cd data
pip install -r requirements.txt
gcloud auth application-default login
export GCP_PROJECT=tu-proyecto BQ_DATASET=tu-dataset YEAR_FROM=2022 YEAR_TO=2026
python materialize_public.py
```

- Las consultas viven en `data/queries/*.sql` — edítalas para tu esquema.
- Las funciones `shape_*` en `materialize_public.py` transforman las filas al formato de `src/lib/types.ts`. **Si cambias la forma, actualiza también `types.ts`.**
- ¿Otra fuente que no es BigQuery? Reemplaza la capa de consulta y conserva las `shape_*` y la escritura de JSON.

## 4. Despliega lo tuyo

```bash
npm run build
# elige uno:
firebase deploy --only hosting     # Firebase Hosting
# o arrastra dist/ a Netlify / Vercel / Cloudflare Pages / GitHub Pages
```

Es estático: cualquier hosting de archivos sirve.

## 5. Respeta la licencia

El proyecto es **Apache 2.0**. Puedes usarlo, modificarlo y redistribuirlo, incluso comercialmente. Solo conserva el aviso de copyright y la atribución a los creadores (ver `NOTICE`).

## Checklist antes de publicar tu fork

- [ ] `npx tsc --noEmit` sin errores
- [ ] `npm run build` ok
- [ ] El sitio no llama a ninguna API/función (mantenlo estático)
- [ ] Documentaste tu fuente y tu ventana de datos en la sección **Acerca**
