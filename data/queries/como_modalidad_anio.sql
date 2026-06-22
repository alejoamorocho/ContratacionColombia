-- Cómo contrata: valor por modalidad y año (serie por modalidad).
-- Se limita a las 6 modalidades de mayor valor agregado para mantener
-- el JSON ligero y legible en la gráfica de líneas.
WITH top_mod AS (
  SELECT COALESCE(modalidad, 'Sin modalidad') AS modalidad
  FROM `{p}.{d}.contratos`
  WHERE fecha_firma BETWEEN '2022-01-01' AND '2026-12-31'
    AND valor IS NOT NULL AND valor > 0
  GROUP BY modalidad
  ORDER BY SUM(valor) DESC
  LIMIT 6
)
SELECT
  EXTRACT(YEAR FROM c.fecha_firma) AS anio,
  COALESCE(c.modalidad, 'Sin modalidad') AS modalidad,
  SUM(c.valor) AS valor
FROM `{p}.{d}.contratos` c
WHERE c.fecha_firma BETWEEN '2022-01-01' AND '2026-12-31'
  AND c.valor IS NOT NULL AND c.valor > 0
  AND COALESCE(c.modalidad, 'Sin modalidad') IN (SELECT modalidad FROM top_mod)
GROUP BY anio, modalidad
ORDER BY modalidad, anio;
