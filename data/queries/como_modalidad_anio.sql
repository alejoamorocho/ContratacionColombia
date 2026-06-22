-- Cómo contrata: valor por modalidad y año, con la modalidad normalizada a
-- etiquetas canónicas (mismo criterio que como_modalidad.sql). Se limita a las
-- 6 modalidades de mayor valor agregado para mantener la gráfica legible.
WITH norm AS (
  SELECT
    EXTRACT(YEAR FROM fecha_firma) AS anio,
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
      fecha_firma,
      modalidad,
      valor,
      REGEXP_REPLACE(NORMALIZE(UPPER(modalidad), NFD), r'\pM', '') AS m
    FROM `{p}.{d}.contratos`
    WHERE fecha_firma BETWEEN '2022-01-01' AND '2026-12-31'
      AND valor IS NOT NULL AND valor > 0
  )
),
top_mod AS (
  SELECT modalidad
  FROM norm
  GROUP BY modalidad
  ORDER BY SUM(valor) DESC
  LIMIT 6
)
SELECT
  anio,
  modalidad,
  SUM(valor) AS valor
FROM norm
WHERE modalidad IN (SELECT modalidad FROM top_mod)
GROUP BY anio, modalidad
ORDER BY modalidad, anio;
