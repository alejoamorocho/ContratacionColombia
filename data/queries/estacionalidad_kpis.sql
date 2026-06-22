-- Estacionalidad (¿Cómo?): KPIs sobre el mes de FIRMA del contrato.
-- Excluye 2026 (vigencia parcial) para no sesgar el patrón mensual: solo
-- años completos 2022-2025. enero concentra firmas de inicio de vigencia
-- (prestación de servicios); es un fenómeno administrativo, no una señal.
-- pct_contratos_enero / pct_valor_diciembre = participación del mes en el total.
-- ratio_enero_promedio = cuántas veces el volumen de enero supera al mes medio.
WITH base AS (
  SELECT
    EXTRACT(MONTH FROM fecha_firma) AS mes,
    valor
  FROM `{p}.{d}.contratos`
  WHERE EXTRACT(YEAR FROM fecha_firma) BETWEEN 2022 AND 2025
    AND valor IS NOT NULL AND valor > 0
),
por_mes AS (
  SELECT mes, COUNT(*) AS contratos, SUM(valor) AS valor
  FROM base
  GROUP BY mes
)
SELECT
  ROUND(100 * SUM(IF(mes = 1, contratos, 0)) / SUM(contratos), 1) AS pct_contratos_enero,
  ROUND(100 * SUM(IF(mes = 12, valor, 0)) / SUM(valor), 1) AS pct_valor_diciembre,
  ROUND(
    (SELECT contratos FROM por_mes WHERE mes = 1) / (SUM(contratos) / 12),
    1
  ) AS ratio_enero_promedio,
  ROUND(100 * SUM(IF(mes <= 3, contratos, 0)) / SUM(contratos), 1) AS pct_contratos_q1
FROM por_mes;
