-- Panorama: evolución por año (n_contratos y valor por año de firma).
SELECT
  EXTRACT(YEAR FROM fecha_firma) AS anio,
  COUNT(*) AS contratos,
  SUM(valor) AS valor
FROM `{p}.{d}.contratos`
WHERE fecha_firma BETWEEN '2022-01-01' AND '2026-12-31'
  AND valor IS NOT NULL AND valor > 0
GROUP BY anio
ORDER BY anio;
