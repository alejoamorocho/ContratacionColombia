-- Cómo contrata: distribución por modalidad (n_contratos, valor, pct de contratos).
-- pct = porcentaje del total de contratos que representa cada modalidad.
SELECT
  COALESCE(modalidad, 'Sin modalidad') AS modalidad,
  COUNT(*) AS contratos,
  SUM(valor) AS valor,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) AS pct
FROM `{p}.{d}.contratos`
WHERE fecha_firma BETWEEN '2022-01-01' AND '2026-12-31'
  AND valor IS NOT NULL AND valor > 0
GROUP BY modalidad
ORDER BY contratos DESC;
