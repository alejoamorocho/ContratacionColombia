-- Planeación (PAA): distribución por modalidad de selección, normalizada a las
-- mismas 7 etiquetas canónicas que como_modalidad.sql (insensible a
-- mayúsculas/acentos) para evitar duplicados en la gráfica.
-- Misma deduplicación de dos pasos que planeacion_kpis.sql.
WITH dd AS (
  SELECT * EXCEPT(rn) FROM (
    SELECT *, ROW_NUMBER() OVER (
      PARTITION BY id ORDER BY fecha_ingesta DESC
    ) AS rn
    FROM `{p}.{d}.paa`
    WHERE anio BETWEEN 2022 AND 2026
  )
  WHERE rn = 1
),
maxv AS (
  SELECT paa_encabezado_id, MAX(version_paa) AS mv
  FROM dd
  GROUP BY paa_encabezado_id
),
latest AS (
  SELECT d.*
  FROM dd d
  JOIN maxv m
    ON d.paa_encabezado_id = m.paa_encabezado_id
   AND d.version_paa = m.mv
  WHERE d.valor_total_esperado IS NOT NULL AND d.valor_total_esperado > 0
),
norm AS (
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
    valor_total_esperado AS valor
  FROM (
    SELECT
      modalidad,
      valor_total_esperado,
      REGEXP_REPLACE(NORMALIZE(UPPER(modalidad), NFD), r'\pM', '') AS m
    FROM latest
  )
)
SELECT
  modalidad,
  COUNT(*) AS items,
  SUM(valor) AS valor
FROM norm
GROUP BY modalidad
ORDER BY valor DESC;
