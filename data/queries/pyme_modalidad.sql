-- Quién contrata (PYME): participación de PYME DENTRO de cada modalidad.
-- Reutiliza la normalización de modalidad de `como_modalidad.sql` (7 categorías
-- canónicas, insensibles a mayúsculas/acentos) para evitar duplicados.
-- pct_contratos_pyme = % de contratos de esa modalidad marcados PYME
-- (es_pyme autodeclarado: 'si'/'true' = PYME). El denominador es el total de
-- contratos de la modalidad (incluye No PYME y NULL), para leerse como
-- "de cada 100 contratos de esta modalidad, cuántos son PYME".
WITH norm AS (
  SELECT
    CASE
      WHEN modalidad IS NULL THEN 'Otras'
      WHEN m LIKE '%DIRECTA%' THEN 'Contratación directa'
      WHEN m LIKE '%REGIMEN%ESPECIAL%' THEN 'Régimen especial'
      WHEN m LIKE '%MINIMA%' THEN 'Mínima cuantía'
      WHEN m LIKE '%ABREVIAD%' OR m LIKE '%MENOR CUANTIA%' OR m LIKE '%SUBASTA%' THEN 'Selección abreviada'
      WHEN m LIKE '%LICITACION%' THEN 'Licitación pública'
      WHEN m LIKE '%MERITOS%' OR m LIKE '%CONCURSO%' THEN 'Concurso de méritos'
      ELSE 'Otras'
    END AS modalidad,
    es_pyme
  FROM (
    SELECT
      modalidad,
      es_pyme,
      REGEXP_REPLACE(NORMALIZE(UPPER(modalidad), NFD), r'\pM', '') AS m
    FROM `{p}.{d}.contratos`
    WHERE fecha_firma BETWEEN '2022-01-01' AND '2026-12-31'
      AND valor IS NOT NULL AND valor > 0
  )
)
SELECT
  modalidad,
  COUNT(*) AS contratos,
  ROUND(
    COUNTIF(LOWER(es_pyme) IN ('si', 'true')) * 100.0 / COUNT(*), 1
  ) AS pct_contratos_pyme
FROM norm
GROUP BY modalidad
ORDER BY pct_contratos_pyme DESC;
