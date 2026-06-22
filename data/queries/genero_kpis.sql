-- ¿Quién firma?: género del REPRESENTANTE LEGAL (no de la propiedad de la empresa).
-- Usa genero_representante_legal (contratista_genero está vacío). Cobertura ~98%.
-- Lee la tabla CRUDA `contratos` (la columna no está en la base deduplicada); la
-- forma con backtick por identificador evita el redirect a _contratos_pub.
-- KPIs de % se calculan sobre la base Mujer+Hombre (excluye 'Otro'/'Sin dato').
WITH base AS (
  SELECT
    valor,
    CASE
      WHEN UPPER(TRIM(genero_representante_legal)) IN ('F', 'MUJER', 'FEMENINO') THEN 'Mujer'
      WHEN UPPER(TRIM(genero_representante_legal)) IN ('M', 'HOMBRE', 'MASCULINO') THEN 'Hombre'
      WHEN UPPER(TRIM(genero_representante_legal)) = 'OTRO' THEN 'Otro'
      ELSE 'Sin dato'
    END AS genero
  FROM `{p}`.`{d}`.contratos
  WHERE fecha_firma BETWEEN '2022-01-01' AND '2026-12-31'
    AND valor IS NOT NULL AND valor > 0
),
mh AS (
  SELECT valor, genero FROM base WHERE genero IN ('Mujer', 'Hombre')
)
SELECT
  ROUND(100 * COUNTIF(genero = 'Mujer') / COUNT(*), 1) AS pct_contratos_mujer,
  ROUND(100 * SUM(IF(genero = 'Mujer', valor, 0)) / SUM(valor), 1) AS pct_valor_mujer,
  APPROX_QUANTILES(IF(genero = 'Mujer', valor, NULL), 100)[OFFSET(50)] AS mediana_valor_mujer,
  APPROX_QUANTILES(IF(genero = 'Hombre', valor, NULL), 100)[OFFSET(50)] AS mediana_valor_hombre
FROM mh;
