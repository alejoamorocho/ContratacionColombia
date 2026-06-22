-- Sanciones: conteo por tipo (ventana 2022-2026).
-- `tipo` viene limpio en la fuente SIRI (DISCIPLINARIA / CONTRACTUAL), sin
-- variantes de mayúsculas ni tildes; aun así se normaliza por robustez y se
-- colapsan posibles nulos/vacíos a 'Sin clasificar'.
SELECT
  CASE
    WHEN tipo IS NULL OR TRIM(tipo) = '' THEN 'Sin clasificar'
    ELSE REGEXP_REPLACE(NORMALIZE(UPPER(TRIM(tipo)), NFD), r'\pM', '')
  END AS tipo,
  COUNT(*) AS n
FROM `{p}.{d}.sanciones`
WHERE fecha_inicio BETWEEN '2022-01-01' AND '2026-12-31'
GROUP BY tipo
ORDER BY n DESC;
