-- Quién contrata: distribución por nivel de gobierno (orden = nivel).
SELECT
  COALESCE(orden, 'Sin clasificar') AS nivel,
  SUM(valor) AS valor,
  COUNT(*) AS contratos
FROM `{p}.{d}.contratos`
WHERE fecha_firma BETWEEN '2022-01-01' AND '2026-12-31'
  AND valor IS NOT NULL AND valor > 0
GROUP BY nivel
ORDER BY valor DESC;
