-- Señales: concentración del top-10 de contratistas y % de contratación directa.
--
-- top10_pct_valor = % del valor total adjudicado a los 10 contratistas con
-- mayor valor acumulado. n_contratistas = total de contratistas únicos.
-- pct_directa_nacional = % de contratos cuya modalidad contiene 'DIRECTA'.
-- Estadística descriptiva; NO implica irregularidad.
WITH por_contratista AS (
  SELECT contratista_nit, SUM(valor) AS valor_contratista
  FROM `{p}.{d}.contratos`
  WHERE fecha_firma BETWEEN '2022-01-01' AND '2026-12-31'
    AND valor IS NOT NULL AND valor > 0
    AND contratista_nit IS NOT NULL AND contratista_nit != ''
  GROUP BY contratista_nit
),
ranked AS (
  SELECT
    valor_contratista,
    ROW_NUMBER() OVER (ORDER BY valor_contratista DESC) AS rn
  FROM por_contratista
),
concentracion AS (
  SELECT
    ROUND(SUM(IF(rn <= 10, valor_contratista, 0)) * 100.0 / SUM(valor_contratista), 1) AS top10_pct_valor,
    COUNT(*) AS n_contratistas
  FROM ranked
),
directa AS (
  -- Misma definición que ¿Cómo contrata? (modalidad_norm sobre la base limpia),
  -- para que «% directa» sea UNA sola cifra en todo el sitio (no dos métodos).
  SELECT
    ROUND(COUNTIF(modalidad_norm = 'Contratación directa') * 100.0 / COUNT(*), 1) AS pct_directa_nacional
  FROM `{p}.{d}.contratos`
  WHERE fecha_firma BETWEEN '2022-01-01' AND '2026-12-31'
    AND valor IS NOT NULL AND valor > 0
)
SELECT
  c.top10_pct_valor,
  c.n_contratistas,
  d.pct_directa_nacional
FROM concentracion c, directa d;
