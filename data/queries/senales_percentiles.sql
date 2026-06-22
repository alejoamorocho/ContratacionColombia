-- Señales: percentiles del valor por contrato (estadística descriptiva).
-- APPROX_QUANTILES(valor, 100) → se extraen p10, p25, p50, p75, p90, p99.
-- Una fila por percentil (p, valor) para alimentar la gráfica de barras.
WITH q AS (
  SELECT APPROX_QUANTILES(valor, 100) AS pct
  FROM `{p}.{d}.contratos`
  WHERE fecha_firma BETWEEN '2022-01-01' AND '2026-12-31'
    AND valor IS NOT NULL AND valor > 0
)
SELECT p, pct[OFFSET(p)] AS valor
FROM q, UNNEST([10, 25, 50, 75, 90, 99]) AS p
ORDER BY p;
