-- Cómo contrata: valor por modalidad (normalizada en la base) y año. Se limita a
-- las 6 modalidades de mayor valor agregado para mantener la gráfica legible.
WITH top_mod AS (
  SELECT modalidad_norm
  FROM `{p}.{d}.contratos`
  WHERE fecha_firma BETWEEN '2022-01-01' AND '2026-12-31' AND valor IS NOT NULL AND valor > 0
  GROUP BY modalidad_norm
  ORDER BY SUM(valor) DESC
  LIMIT 6
)
SELECT
  EXTRACT(YEAR FROM fecha_firma) AS anio,
  modalidad_norm AS modalidad,
  SUM(valor) AS valor
FROM `{p}.{d}.contratos`
WHERE fecha_firma BETWEEN '2022-01-01' AND '2026-12-31' AND valor IS NOT NULL AND valor > 0
  AND modalidad_norm IN (SELECT modalidad_norm FROM top_mod)
GROUP BY anio, modalidad
ORDER BY modalidad, anio;
