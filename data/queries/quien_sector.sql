-- Quién contrata: por categoría de objeto contratado. La etiqueta legible
-- (con tildes) se normaliza UNA vez en la tabla base (columna `objeto_label`),
-- así esta query no repite el mapeo de códigos. N mínimo 20; top 12 por valor.
SELECT
  objeto_label AS sector,
  SUM(valor) AS valor,
  COUNT(*) AS contratos
FROM `{p}.{d}.contratos`
WHERE fecha_firma BETWEEN '2022-01-01' AND '2026-12-31'
  AND valor IS NOT NULL AND valor > 0
GROUP BY objeto_label
HAVING contratos >= 20
ORDER BY valor DESC
LIMIT 12;
