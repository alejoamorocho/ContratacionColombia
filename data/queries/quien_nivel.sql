-- Quién contrata: distribución por nivel de gobierno (orden = nivel).
-- El campo `orden` solo trae Territorial / Nacional / Corporación Autónoma; los
-- nulos (~17 %) no reportan el nivel y se etiquetan como "No reportado".
SELECT
  CASE WHEN orden IS NULL OR TRIM(orden) = '' THEN 'No reportado' ELSE orden END AS nivel,
  SUM(valor) AS valor,
  COUNT(*) AS contratos
FROM `{p}.{d}.contratos`
WHERE fecha_firma BETWEEN '2022-01-01' AND '2026-12-31'
  AND valor IS NOT NULL AND valor > 0
GROUP BY nivel
ORDER BY valor DESC;
