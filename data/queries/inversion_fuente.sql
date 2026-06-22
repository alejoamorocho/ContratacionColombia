-- ¿En qué invierte el Estado? — Inversión por fuente de financiación (proyectos BPIN, DNP).
-- Ventana 2022-2026. Valores SUMADOS por línea de ejecución (ver dedup en kpis).
--
-- NOTA DE DATOS: la columna `fuente_financiacion` está 100% NULA en la tabla. La fuente
-- real de financiación vive en `tipo_recurso_fuente_financiacion` (62 categorías, 0 nulos:
-- "Propios territorio", "SGP - Educación", "SGR - Asignaciones directas", "PGN - Nación", …).
-- Se usa esa columna como fuente de financiación. Texto en Latin-1 con acentos correctos.
--
-- DEDUP por id (reingesta más reciente). Normaliza (UPPER + sin acentos). Top 15 por valor.
WITH dedup AS (
  SELECT *
  FROM `{p}.{d}.bpin_ejecucion`
  WHERE SAFE_CAST(vigencia AS INT64) BETWEEN 2022 AND 2026
  QUALIFY ROW_NUMBER() OVER (PARTITION BY id ORDER BY fecha_ingesta DESC) = 1
)
SELECT
  REGEXP_REPLACE(NORMALIZE(UPPER(
    COALESCE(NULLIF(TRIM(tipo_recurso_fuente_financiacion), ''), 'SIN FUENTE')), NFD),
    r'\pM', '') AS fuente,
  SUM(COALESCE(valor_vigente, 0)) AS valor
FROM dedup
GROUP BY fuente
HAVING valor > 0
ORDER BY valor DESC
LIMIT 15;
