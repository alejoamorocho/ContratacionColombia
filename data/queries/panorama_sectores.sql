-- Panorama: top sectores por valor (objeto_clasificado = sector).
-- N mínimo 20 para que el sector sea estable; top 12 por valor.
SELECT
  COALESCE(objeto_clasificado, 'Sin clasificar') AS sector,
  COUNT(*) AS contratos,
  SUM(valor) AS valor
FROM `{p}.{d}.contratos`
WHERE fecha_firma BETWEEN '2022-01-01' AND '2026-12-31'
  AND valor IS NOT NULL AND valor > 0
GROUP BY sector
HAVING contratos >= 20
ORDER BY valor DESC
LIMIT 12;
