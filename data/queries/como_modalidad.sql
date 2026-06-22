-- Cómo contrata: distribución por modalidad, normalizada a etiquetas canónicas.
-- La columna `modalidad` mezcla códigos (DIRECTA, REGIMEN_ESPECIAL...) con texto
-- crudo y tildes ("Contratación régimen especial"); se colapsan a 7 categorías
-- legibles insensibles a mayúsculas/acentos para evitar duplicados en la gráfica.
-- pct = porcentaje del total de contratos.
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
    valor
  FROM (
    SELECT
      modalidad,
      valor,
      REGEXP_REPLACE(NORMALIZE(UPPER(modalidad), NFD), r'\pM', '') AS m
    FROM `{p}.{d}.contratos`
    WHERE fecha_firma BETWEEN '2022-01-01' AND '2026-12-31'
      AND valor IS NOT NULL AND valor > 0
  )
)
SELECT
  modalidad,
  COUNT(*) AS contratos,
  SUM(valor) AS valor,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) AS pct
FROM norm
GROUP BY modalidad
ORDER BY contratos DESC;
