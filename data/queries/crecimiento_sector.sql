-- ¿Dónde creció y dónde se redujo? — variación % del valor por sector 2023→2025.
--
-- Mismo CASE legible de quien_sector.sql. Solo sectores ELEGIBLES: ≥300 contratos
-- en AMBOS años Y cuyo mayor contrato del año pesa <50 % del valor del sector
-- (descarta alzas falsas por un único contrato de cuantía extrema, p. ej.
-- "Servicios públicos"/"Catastro" en 2025). var_pct = (valor_2025 - valor_2023)
-- / valor_2023 * 100, variación NOMINAL (no ajustada por inflación).
--
-- La serie devuelve los 8 sectores de mayor alza y los 4 de mayor caída (12
-- barras para un gráfico divergente), ordenados de mayor a menor variación.
WITH ranked AS (
  SELECT
    CASE COALESCE(objeto_clasificado, 'SIN_CLASIFICAR')
      WHEN 'SALUD' THEN 'Salud'
      WHEN 'CONSULTORIA' THEN 'Consultoría'
      WHEN 'CONTRATACION_PERSONAL' THEN 'Contratación de personal'
      WHEN 'EDUCACION' THEN 'Educación'
      WHEN 'APOYO_GESTION' THEN 'Apoyo a la gestión'
      WHEN 'JURIDICO' THEN 'Jurídico'
      WHEN 'CULTURA_DEPORTE' THEN 'Cultura y deporte'
      WHEN 'SOCIAL' THEN 'Social'
      WHEN 'CONSTRUCCION' THEN 'Construcción'
      WHEN 'TECNOLOGIA' THEN 'Tecnología'
      WHEN 'SEGURIDAD' THEN 'Seguridad'
      WHEN 'COMUNICACIONES' THEN 'Comunicaciones'
      WHEN 'FINANCIERO' THEN 'Financiero'
      WHEN 'ARRENDAMIENTO' THEN 'Arrendamiento'
      WHEN 'ALIMENTACION' THEN 'Alimentación'
      WHEN 'TRANSPORTE' THEN 'Transporte'
      WHEN 'AGROPECUARIO' THEN 'Agropecuario'
      WHEN 'MEDIO_AMBIENTE' THEN 'Medio ambiente'
      WHEN 'CAPACITACION_FORMACION' THEN 'Capacitación y formación'
      WHEN 'GESTION_DOCUMENTAL' THEN 'Gestión documental'
      WHEN 'MANTENIMIENTO' THEN 'Mantenimiento'
      WHEN 'VIVIENDA' THEN 'Vivienda'
      WHEN 'SUMINISTRO' THEN 'Suministro'
      WHEN 'ASEO' THEN 'Aseo'
      WHEN 'TELECOMUNICACIONES' THEN 'Telecomunicaciones'
      WHEN 'AGUA_SANEAMIENTO' THEN 'Agua y saneamiento'
      WHEN 'CATASTRO' THEN 'Catastro'
      WHEN 'DEFENSA' THEN 'Defensa'
      WHEN 'INTERVENTORIA' THEN 'Interventoría'
      WHEN 'SIN_CLASIFICAR' THEN 'Sin clasificar'
      ELSE INITCAP(REPLACE(objeto_clasificado, '_', ' '))
    END AS sector,
    EXTRACT(YEAR FROM fecha_firma) AS anio,
    SUM(valor) OVER w AS total_anio,
    MAX(valor) OVER w AS max_anio,
    COUNT(*)   OVER w AS n_anio
  FROM `{p}.{d}.contratos`
  WHERE fecha_firma BETWEEN '2022-01-01' AND '2026-12-31'
    AND valor IS NOT NULL AND valor > 0
    AND EXTRACT(YEAR FROM fecha_firma) IN (2023, 2025)
  WINDOW w AS (PARTITION BY
    CASE COALESCE(objeto_clasificado, 'SIN_CLASIFICAR')
      WHEN 'SALUD' THEN 'Salud' WHEN 'CONSULTORIA' THEN 'Consultoría'
      WHEN 'CONTRATACION_PERSONAL' THEN 'Contratación de personal'
      WHEN 'EDUCACION' THEN 'Educación' WHEN 'APOYO_GESTION' THEN 'Apoyo a la gestión'
      WHEN 'JURIDICO' THEN 'Jurídico' WHEN 'CULTURA_DEPORTE' THEN 'Cultura y deporte'
      WHEN 'SOCIAL' THEN 'Social' WHEN 'CONSTRUCCION' THEN 'Construcción'
      WHEN 'TECNOLOGIA' THEN 'Tecnología' WHEN 'SEGURIDAD' THEN 'Seguridad'
      WHEN 'COMUNICACIONES' THEN 'Comunicaciones' WHEN 'FINANCIERO' THEN 'Financiero'
      WHEN 'ARRENDAMIENTO' THEN 'Arrendamiento' WHEN 'ALIMENTACION' THEN 'Alimentación'
      WHEN 'TRANSPORTE' THEN 'Transporte' WHEN 'AGROPECUARIO' THEN 'Agropecuario'
      WHEN 'MEDIO_AMBIENTE' THEN 'Medio ambiente'
      WHEN 'CAPACITACION_FORMACION' THEN 'Capacitación y formación'
      WHEN 'GESTION_DOCUMENTAL' THEN 'Gestión documental'
      WHEN 'MANTENIMIENTO' THEN 'Mantenimiento' WHEN 'VIVIENDA' THEN 'Vivienda'
      WHEN 'SUMINISTRO' THEN 'Suministro' WHEN 'ASEO' THEN 'Aseo'
      WHEN 'TELECOMUNICACIONES' THEN 'Telecomunicaciones'
      WHEN 'AGUA_SANEAMIENTO' THEN 'Agua y saneamiento' WHEN 'CATASTRO' THEN 'Catastro'
      WHEN 'DEFENSA' THEN 'Defensa' WHEN 'INTERVENTORIA' THEN 'Interventoría'
      WHEN 'SIN_CLASIFICAR' THEN 'Sin clasificar'
      ELSE INITCAP(REPLACE(objeto_clasificado, '_', ' '))
    END, EXTRACT(YEAR FROM fecha_firma))
),
por_sector AS (
  SELECT
    sector, anio,
    ANY_VALUE(total_anio) AS valor,
    ANY_VALUE(n_anio)     AS contratos,
    ANY_VALUE(max_anio) / ANY_VALUE(total_anio) AS top1_share
  FROM ranked
  GROUP BY sector, anio
),
pivot AS (
  SELECT
    sector,
    SUM(IF(anio = 2023, valor, 0))     AS valor_2023,
    SUM(IF(anio = 2025, valor, 0))     AS valor_2025,
    SUM(IF(anio = 2023, contratos, 0)) AS n_2023,
    SUM(IF(anio = 2025, contratos, 0)) AS n_2025,
    MAX(top1_share)                    AS max_top1_share
  FROM por_sector
  GROUP BY sector
),
elegibles AS (
  SELECT
    sector,
    ROUND(SAFE_DIVIDE(valor_2025 - valor_2023, valor_2023) * 100, 1) AS var_pct,
    ROW_NUMBER() OVER (ORDER BY SAFE_DIVIDE(valor_2025 - valor_2023, valor_2023) DESC) AS rk_alza,
    ROW_NUMBER() OVER (ORDER BY SAFE_DIVIDE(valor_2025 - valor_2023, valor_2023) ASC)  AS rk_baja
  FROM pivot
  WHERE n_2023 >= 300 AND n_2025 >= 300 AND max_top1_share < 0.5
)
SELECT sector, var_pct
FROM elegibles
WHERE rk_alza <= 8 OR rk_baja <= 4
ORDER BY var_pct DESC;
