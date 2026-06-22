-- Estacionalidad (¿Cómo?): distribución de la contratación por MES de firma,
-- agregando los años completos 2022-2025 (excluye 2026, vigencia parcial).
-- Devuelve un nombre de mes corto en español ('Ene'..'Dic') ya ordenado 1-12,
-- el número de contratos y el valor agregado, para la gráfica de barras.
WITH base AS (
  SELECT
    EXTRACT(MONTH FROM fecha_firma) AS mes_num,
    valor
  FROM `{p}.{d}.contratos`
  WHERE EXTRACT(YEAR FROM fecha_firma) BETWEEN 2022 AND 2025
    AND valor IS NOT NULL AND valor > 0
)
SELECT
  mes_num,
  CASE mes_num
    WHEN 1 THEN 'Ene' WHEN 2 THEN 'Feb' WHEN 3 THEN 'Mar'
    WHEN 4 THEN 'Abr' WHEN 5 THEN 'May' WHEN 6 THEN 'Jun'
    WHEN 7 THEN 'Jul' WHEN 8 THEN 'Ago' WHEN 9 THEN 'Sep'
    WHEN 10 THEN 'Oct' WHEN 11 THEN 'Nov' WHEN 12 THEN 'Dic'
  END AS mes,
  COUNT(*) AS contratos,
  SUM(valor) AS valor
FROM base
GROUP BY mes_num
ORDER BY mes_num;
