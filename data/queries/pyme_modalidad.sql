-- Quién contrata (PYME): participación de PYME DENTRO de cada modalidad.
-- modalidad ya normalizada en la tabla base (`modalidad_norm`). es_pyme
-- autodeclarado: 'si'/'true' = PYME. El denominador es el total de contratos de
-- la modalidad (incluye No PYME y NULL): "de cada 100 contratos, cuántos son PYME".
SELECT
  modalidad_norm AS modalidad,
  COUNT(*) AS contratos,
  ROUND(COUNTIF(LOWER(es_pyme) IN ('si', 'true')) * 100.0 / COUNT(*), 1) AS pct_contratos_pyme
FROM `{p}.{d}.contratos`
WHERE fecha_firma BETWEEN '2022-01-01' AND '2026-12-31'
  AND valor IS NOT NULL AND valor > 0
GROUP BY modalidad_norm
ORDER BY pct_contratos_pyme DESC;
