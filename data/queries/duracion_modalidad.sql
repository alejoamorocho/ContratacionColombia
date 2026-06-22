-- Duración por modalidad: mediana del plazo CONTRATADO
-- (DATE_DIFF(fecha_fin, fecha_inicio, DAY)) para cada una de las 7 modalidades
-- canónicas. Mismo criterio que duracion_kpis.sql: NO usa `duracion_dias`
-- (rota), acota a [1, 3650] días.
--
-- La modalidad se normaliza a las mismas 7 etiquetas que como_modalidad.sql
-- (colapsa códigos + texto crudo + tildes, insensible a mayúsculas/acentos).
--
-- Lee la tabla CRUDA `contratos` (backtick partido `{p}.{d}`.contratos) porque
-- la base deduplicada no materializa fecha_inicio/fecha_fin. Gráfica de barras
-- horizontal ordenada por mediana descendente.
WITH base AS (
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
    DATE_DIFF(fecha_fin, fecha_inicio, DAY) AS dias
  FROM (
    SELECT
      modalidad,
      fecha_inicio,
      fecha_fin,
      REGEXP_REPLACE(NORMALIZE(UPPER(modalidad), NFD), r'\pM', '') AS m
    FROM `{p}.{d}`.contratos
    WHERE fecha_firma BETWEEN '2022-01-01' AND '2026-12-31'
      AND valor IS NOT NULL AND valor > 0
      AND fecha_inicio IS NOT NULL AND fecha_fin IS NOT NULL
  )
),
filtrado AS (
  SELECT modalidad, dias FROM base WHERE dias BETWEEN 1 AND 3650
)
SELECT
  modalidad,
  COUNT(*) AS contratos,
  APPROX_QUANTILES(dias, 100)[OFFSET(50)] AS mediana_dias
FROM filtrado
GROUP BY modalidad
ORDER BY mediana_dias DESC;
