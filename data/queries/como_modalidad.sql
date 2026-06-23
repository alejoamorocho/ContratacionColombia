-- Cómo contrata: distribución por modalidad. La modalidad se normaliza UNA vez
-- en la tabla base (columna `modalidad_norm`, 7 categorías canónicas), así esta
-- query no repite el CASE. pct = porcentaje del total de contratos.
SELECT
  modalidad_norm AS modalidad,
  COUNT(*) AS contratos,
  SUM(valor) AS valor,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) AS pct
FROM `{p}.{d}.contratos`
WHERE fecha_firma BETWEEN '2022-01-01' AND '2026-12-31'
  AND valor IS NOT NULL AND valor > 0
GROUP BY modalidad_norm
ORDER BY contratos DESC;
