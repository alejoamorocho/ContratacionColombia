-- Quién contrata: top entidades por valor contratado, agrupado por NIT.
-- Una entidad NACIONAL (ICBF, INVÍAS…) firma bajo UN solo NIT pero con decenas
-- de nombres regionales; agrupar por NIT consolida toda la entidad. El nombre
-- mostrado es el MÁS FRECUENTE (APPROX_TOP_COUNT), no uno arbitrario, para que
-- no aparezca p.ej. "ICBF Regional Caquetá" representando a todo el ICBF.
SELECT
  APPROX_TOP_COUNT(entidad_nombre, 1)[OFFSET(0)].value AS nombre,
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
