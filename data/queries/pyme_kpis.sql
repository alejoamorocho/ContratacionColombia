-- Quién contrata: participación PYME (pequeñas y medianas empresas).
-- es_pyme está AUTODECLARADO por el contratista en SECOP II y tiene DOBLE
-- codificación textual: 'si'/'true' = PYME, 'no'/'false' = No PYME (más NULLs
-- que no se cuentan como ninguno). Por eso se usa LOWER(es_pyme) IN (...).
-- pct_contratos_pyme: % de contratos marcados PYME sobre el total con valor>0.
-- pct_valor_pyme: % del valor total que fue a contratos PYME.
-- valor_total_pyme: suma del valor de los contratos PYME (COP).
SELECT
  ROUND(
    COUNTIF(LOWER(es_pyme) IN ('si', 'true')) * 100.0 / COUNT(*), 1
  ) AS pct_contratos_pyme,
  ROUND(
    SUM(IF(LOWER(es_pyme) IN ('si', 'true'), valor, 0)) * 100.0 / SUM(valor), 1
  ) AS pct_valor_pyme,
  SUM(IF(LOWER(es_pyme) IN ('si', 'true'), valor, 0)) AS valor_total_pyme,
  COUNTIF(LOWER(es_pyme) IN ('si', 'true')) AS contratos_pyme
FROM `{p}.{d}.contratos`
WHERE fecha_firma BETWEEN '2022-01-01' AND '2026-12-31'
  AND valor IS NOT NULL AND valor > 0;
