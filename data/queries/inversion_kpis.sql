-- ¿En qué invierte el Estado? — KPIs nacionales de inversión pública (proyectos BPIN, DNP).
-- Ventana 2022-2026 por vigencia. Fuente: tabla bpin_ejecucion.
--
-- DEDUP: la tabla trae filas idénticas repetidas por reingesta (mismo id, distinto
-- fecha_ingesta). Hay 345K filas vs 206K id distintos. Se deduplica por id quedándose
-- con la reingesta más reciente. Tras deduplicar, cada id es una línea de ejecución
-- (bpin × vigencia × tipo de recurso) y los valores SE SUMAN por fila (un bpin abarca
-- varias vigencias/fuentes). NO se deduplica por bpin: eso perdería líneas de ejecución.
--
-- Una sola fila: nº de proyectos (bpin distintos), valor vigente, valor pagado y % ejecución.
WITH dedup AS (
  SELECT *
  FROM `{p}.{d}.bpin_ejecucion`
  WHERE SAFE_CAST(vigencia AS INT64) BETWEEN 2022 AND 2026
  QUALIFY ROW_NUMBER() OVER (PARTITION BY id ORDER BY fecha_ingesta DESC) = 1
)
SELECT
  COUNT(DISTINCT bpin) AS proyectos,
  SUM(COALESCE(valor_vigente, 0)) AS valor_vigente,
  SUM(COALESCE(valor_pagado, 0)) AS valor_pagado,
  SAFE_DIVIDE(SUM(COALESCE(valor_pagado, 0)), SUM(COALESCE(valor_vigente, 0))) AS pct_ejecucion
FROM dedup;
