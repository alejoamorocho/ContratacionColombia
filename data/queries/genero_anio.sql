-- Género del REPRESENTANTE LEGAL por año de firma (2022-2026).
-- % de contratos y % de valor adjudicado a mujeres, sobre la base Mujer+Hombre.
-- Lee la tabla CRUDA `contratos` (backtick por identificador para evitar el
-- redirect a _contratos_pub: genero_representante_legal no está en la base).
WITH base AS (
  SELECT
    EXTRACT(YEAR FROM fecha_firma) AS anio,
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
  SELECT anio, valor, genero FROM base WHERE genero IN ('Mujer', 'Hombre')
)
SELECT
  anio,
  ROUND(100 * COUNTIF(genero = 'Mujer') / COUNT(*), 1) AS pct_contratos_mujer,
  ROUND(100 * SUM(IF(genero = 'Mujer', valor, 0)) / SUM(valor), 1) AS pct_valor_mujer
FROM mh
GROUP BY anio
ORDER BY anio;
