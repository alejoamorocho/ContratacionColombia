# VECTORVI — Observatorio público de contratación colombiana

> **Describe. No juzga.** Datos abiertos de la contratación pública colombiana (2022–2026), organizados para entender qué pasó.

![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![Vite](https://img.shields.io/badge/Vite-build-646cff.svg)
![Estático](https://img.shields.io/badge/100%25-est%C3%A1tico-3fb950.svg)

---

## Qué es

Un **dashboard estático y público** que muestra, con gráficas claras y tono neutral, cómo se movió la contratación pública colombiana (fuente: **SECOP II**) entre **2022 y 2026**. No interpreta ni acusa: presenta cifras agregadas para que cualquier persona se haga una idea de lo que ocurrió.

El sitio es **100% estático**: lee archivos JSON pre-calculados. **No tiene backend, no llama funciones, no usa base de datos ni autenticación.** La única superficie pública son archivos estáticos servidos por CDN. Esto lo hace barato, seguro y fácil de forkear.

## Secciones

| Sección | Qué muestra |
|---------|-------------|
| **Panorama** | KPIs macro (contratos, valor total, entidades, contratistas) + evolución por año + top sectores |
| **Quién contrata** | Top entidades por valor, distribución por nivel de gobierno y por sector |
| **Cómo contrata** | Modalidades de contratación, su evolución y el % de contratación directa |
| **Dónde** | Mapa coroplético de Colombia por departamento + ranking territorial |
| **Señales** | Estadística descriptiva (concentración, percentiles). Neutral, sin juicio |
| **Acerca** | Metodología, fuentes, ventana de datos y límites |

## Fork en 5 minutos

```bash
git clone https://github.com/alejoamorocho/ContratacionColombia.git
cd ContratacionColombia
npm install
npm run dev          # usa el snapshot de datos ya incluido en public/data/
```

El sitio funciona de inmediato con el snapshot commiteado: **no necesitas BigQuery** para verlo o trabajar sobre él.

### Regenerar los datos (opcional)

Si tienes tu propia fuente en BigQuery (una tabla `contratos` con el mismo esquema), puedes regenerar el snapshot:

```bash
cd data
pip install -r requirements.txt
export GCP_PROJECT=tu-proyecto BQ_DATASET=tu-dataset   # auth: gcloud application-default login
python materialize_public.py                            # reescribe ../public/data/*.json
```

La ventana (años) se controla con `YEAR_FROM` / `YEAR_TO`.

### Desplegar

```bash
npm run build
firebase deploy --only hosting     # o sube dist/ a Netlify, Vercel, GitHub Pages…
```

Al ser estático, se puede desplegar en cualquier hosting de archivos.

## Cómo está hecho

- **Frontend:** React 19 + TypeScript + Vite. Gráficas con Recharts; mapa con react-simple-maps. Cada sección lee su JSON vía el hook `usePublicData`.
- **Datos:** `data/materialize_public.py` agrega los contratos en BigQuery y emite los JSON de `public/data/`. Las consultas SQL están en `data/queries/` para auditoría.
- **Diseño:** tema oscuro tipo GitHub, tokens CSS centralizados, sin dependencias de UI pesadas.

## Filosofía

Este proyecto existe para que **cualquier colombiano** pueda ver y construir sobre datos públicos abiertos. No hace scoring, no señala culpables, no emite juicios: **organiza datos y los muestra bien**. Si quieres otra metodología o más fuentes, **forkéalo** — está pensado para eso.

## Licencia y créditos

Open source bajo **[Apache License 2.0](LICENSE)**.

Creado por **Alejandro Amorocho** y **Juan José Amorocho**. Ver [NOTICE](NOTICE).

> Contribuciones bienvenidas — ver [CONTRIBUTING.md](CONTRIBUTING.md).
