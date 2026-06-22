-- Planeación (PAA): KPIs nacionales del Plan Anual de Adquisiciones (2024-2026).
-- "¿Qué planea comprar el Estado?" — una sola fila: nº de ítems planeados
-- (deduplicados), valor total esperado y nº de entidades con PAA.
--
-- DEDUPLICACIÓN (dos pasos, mismo criterio en las 4 queries de planeación):
--   1) `id` se repite por re-ingesta (filas idénticas); se conserva una por id
--      según `fecha_ingesta` (las copias son exactas: misma versión y valor).
--   2) El PAA se publica por VERSIONES: cada `paa_encabezado_id` (= una entidad
--      en un año) acumula varias `version_paa`, y las versiones viejas NO se
--      borran de la fuente. Se conserva solo la ÚLTIMA versión por encabezado,
--      para no contar dos veces ítems que fueron replanificados.
-- Efecto: id-only deja 222.854 ítems / $92,1B; última-versión deja 156.152
-- ítems / $58,6B (≈30% eran versiones superadas).
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
  COUNT(*) AS items,
  SUM(valor_total_esperado) AS valor_planeado,
  COUNT(DISTINCT entidad_nit) AS entidades
FROM latest
WHERE valor_total_esperado IS NOT NULL AND valor_total_esperado > 0;
