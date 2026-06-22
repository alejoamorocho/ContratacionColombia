-- Quién contrata: top entidades por valor contratado.
-- Agrupa por NIT de entidad; nombre representativo vía ANY_VALUE.
SELECT
  ANY_VALUE(entidad_nombre) AS nombre,
  entidad_nit AS nit,
  SUM(valor) AS valor,
  COUNT(*) AS contratos
FROM `{p}.{d}.contratos`
WHERE fecha_firma BETWEEN '2022-01-01' AND '2026-12-31'
  AND valor IS NOT NULL AND valor > 0
  AND entidad_nit IS NOT NULL AND entidad_nit != ''
GROUP BY entidad_nit
ORDER BY valor DESC
LIMIT 15;
