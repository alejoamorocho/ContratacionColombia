-- ¿En qué invierte el Estado? — Inversión por vigencia/año (proyectos BPIN, DNP).
-- Ventana 2022-2026. Valores SUMADOS por línea de ejecución (ver dedup en kpis).
--
-- DEDUP por id (reingesta más reciente). vigencia llega como STRING/INT sucio (hay valores
-- como 213 o 2103); SAFE_CAST + filtro de ventana descartan los fuera de rango.
WITH dedup AS (
  SELECT *
  FROM `{p}.{d}.bpin_ejecucion`
  WHERE SAFE_CAST(vigencia AS INT64) BETWEEN 2022 AND 2026
  QUALIFY ROW_NUMBER() OVER (PARTITION BY id ORDER BY fecha_ingesta DESC) = 1
)
SELECT
  SAFE_CAST(vigencia AS INT64) AS anio,
  SUM(COALESCE(valor_vigente, 0)) AS vigente,
  SUM(COALESCE(valor_pagado, 0)) AS pagado
FROM dedup
GROUP BY anio
ORDER BY anio;
