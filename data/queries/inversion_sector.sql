-- ¿En qué invierte el Estado? — Inversión por sector (proyectos BPIN, DNP).
-- Ventana 2022-2026 por vigencia. Valores SUMADOS por línea de ejecución (ver dedup en kpis).
--
-- DEDUP por id (reingesta más reciente). Normaliza el sector (UPPER + sin acentos) para
-- agrupar categorías que llegan con acentos/mayúsculas inconsistentes. Top 15 por vigente.
WITH dedup AS (
  SELECT *
  FROM `{p}.{d}.bpin_ejecucion`
  WHERE SAFE_CAST(vigencia AS INT64) BETWEEN 2022 AND 2026
  QUALIFY ROW_NUMBER() OVER (PARTITION BY id ORDER BY fecha_ingesta DESC) = 1
)
SELECT
  REGEXP_REPLACE(NORMALIZE(UPPER(
    COALESCE(NULLIF(TRIM(sector), ''), 'SIN SECTOR')), NFD), r'\pM', '') AS sector,
  SUM(COALESCE(valor_vigente, 0)) AS vigente,
  SUM(COALESCE(valor_pagado, 0)) AS pagado
FROM dedup
GROUP BY sector
HAVING vigente > 0
ORDER BY vigente DESC
LIMIT 15;
