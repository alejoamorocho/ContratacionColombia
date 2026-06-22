-- Planeación (PAA): valor planeado por año de adquisición.
-- Nota de cobertura: el PAA en SECOP II solo tiene datos 2024-2026 (no 2022-2023);
-- 2026 puede crecer a medida que las entidades publican sus planes.
-- Misma deduplicación de dos pasos que planeacion_kpis.sql (id + última versión
-- por paa_encabezado_id).
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
)
SELECT
  anio,
  SUM(valor_total_esperado) AS valor
FROM latest
WHERE valor_total_esperado IS NOT NULL AND valor_total_esperado > 0
GROUP BY anio
ORDER BY anio;
