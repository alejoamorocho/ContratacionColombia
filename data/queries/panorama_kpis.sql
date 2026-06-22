-- Panorama: KPIs nacionales agregados (ventana 2022-2026).
-- Una sola fila: total contratos, valor total, entidades y contratistas únicos.
SELECT
  COUNT(*) AS contratos,
  SUM(valor) AS valor_total,
  APPROX_QUANTILES(valor, 100)[OFFSET(50)] AS valor_mediano,
  COUNT(DISTINCT entidad_nit) AS entidades,
  COUNT(DISTINCT contratista_nit) AS contratistas
FROM `{p}.{d}.contratos`
WHERE fecha_firma BETWEEN '2022-01-01' AND '2026-12-31'
  AND valor IS NOT NULL AND valor > 0;
