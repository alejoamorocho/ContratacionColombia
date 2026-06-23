-- ¿Cómo se financian las campañas? — top partidos/movimientos por monto aportado.
-- Ventana 2022-2026.
--
-- `partido` llega MUY sucio: misma colectividad en varias grafías ("PARTIDO
-- CENTRO DEMOCRÁTICO" vs "PARTIDO CENTRO DEMOCRATICO"), con tildes inconsistentes
-- e incluso caracteres corruptos (mojibake U+FFFD por mala codificación en la
-- fuente). Para no fragmentar el mismo partido en varias filas se construye una
-- CLAVE normalizada (mayúsculas, sin acentos vía NORMALIZE NFD, sin bytes no-ASCII
-- y con espacios colapsados) y se agrega por esa clave. La ETIQUETA mostrada es la
-- variante cruda más frecuente de cada clave, prefiriendo las que NO contienen el
-- carácter de reemplazo, de forma determinística.
--
-- La CLAVE normaliza para que la MISMA colectividad no se fragmente en barras:
--   1. mayúsculas, sin acentos (NFD) ni bytes corruptos (mojibake U+FFFD).
--   2. quita el prefijo "COALICION " (une "Coalición Pacto Histórico" con "Pacto Histórico").
--   3. quita el sufijo de lista/cámara " - SENADO/CAMARA/ASAMBLEA…" (une las listas
--      de Senado y Cámara de un mismo partido). Coaliciones con nombre PROPIO
--      (p.ej. "Equipo por Colombia") conservan su identidad.
WITH base AS (
  SELECT
    COALESCE(monto_aportado, 0) AS monto,
    COALESCE(NULLIF(TRIM(partido), ''), 'Sin partido') AS partido_raw
  FROM `{p}.{d}.campanas`
  WHERE SAFE_CAST(anio_eleccion AS INT64) BETWEEN 2022 AND 2026
),
norm AS (
  SELECT
    monto,
    partido_raw,
    CASE
      WHEN partido_raw = 'Sin partido' THEN 'Sin partido'
      ELSE TRIM(
             REGEXP_REPLACE(            -- 3) sufijo de lista/cámara
               REGEXP_REPLACE(          -- 2) prefijo COALICION
                 REGEXP_REPLACE(        -- colapsa espacios
                   REGEXP_REPLACE(NORMALIZE(UPPER(partido_raw), NFD), r'[^\x00-\x7F]', ''),
                   r'\s+', ' '),
                 r'^COALICION ', ''),
               r'\s-\s.*$', ''))
    END AS partido_key
  FROM base
),
label AS (
  -- variante cruda preferida por clave (etiqueta mostrada, determinística):
  -- 1º sin carácter corrupto, 2º la más frecuente, 3º orden alfabético
  SELECT
    partido_key,
    partido_raw AS partido,
    ROW_NUMBER() OVER (
      PARTITION BY partido_key
      ORDER BY CONTAINS_SUBSTR(partido_raw, '�'),    -- 1º sin carácter corrupto
               CONTAINS_SUBSTR(partido_raw, ' - '),  -- 2º sin sufijo de cámara/lista
               COUNT(*) DESC,                         -- 3º la más frecuente
               partido_raw                            -- 4º alfabético (determinístico)
    ) AS rn
  FROM norm
  GROUP BY partido_key, partido_raw
)
SELECT
  l.partido AS partido,
  SUM(n.monto) AS monto,
  COUNT(*) AS aportes
FROM norm n
JOIN label l ON l.partido_key = n.partido_key AND l.rn = 1
GROUP BY l.partido
ORDER BY monto DESC
LIMIT 12;
