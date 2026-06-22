-- ¿Dónde creció y dónde se redujo? — KPIs de crecimiento por sector 2023→2025.
--
-- Base 2023→2025 (se OMITE 2022, contaminado por baja cobertura de SECOP II en
-- su primer semestre). El sector se deriva de objeto_clasificado con el MISMO
-- CASE legible de quien_sector.sql.
--
-- valor_2025 / valor_2023 son los TOTALES (todos los contratos de cada año), no
-- solo los sectores elegibles. Por eso usan SUM global y coinciden con Panorama.
--
-- "Sector mayor alza" se calcula sobre los sectores ELEGIBLES: ≥300 contratos en
-- AMBOS años (estabilidad) Y cuyo mayor contrato del año pesa <50 % del valor del
-- sector (max_top1_share < 0.5). Este segundo filtro descarta alzas que no son
-- crecimiento del sector sino UN solo contrato de cuantía extrema (p. ej. en
-- 2025 un único contrato concentra ~67 % de "Servicios públicos" y ~64 % de
-- "Catastro"). Sin él, el titular sería engañoso. n_sectores_cayeron cuenta los
-- elegibles con variación negativa.
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
    SUM(valor) OVER (PARTITION BY
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
      END, EXTRACT(YEAR FROM fecha_firma)) AS total_anio,
    MAX(valor) OVER (PARTITION BY
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
      END, EXTRACT(YEAR FROM fecha_firma)) AS max_anio,
    COUNT(*) OVER (PARTITION BY
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
      END, EXTRACT(YEAR FROM fecha_firma)) AS n_anio
  FROM `{p}.{d}.contratos`
  WHERE fecha_firma BETWEEN '2022-01-01' AND '2026-12-31'
    AND valor IS NOT NULL AND valor > 0
    AND EXTRACT(YEAR FROM fecha_firma) IN (2023, 2025)
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
    SAFE_DIVIDE(valor_2025 - valor_2023, valor_2023) * 100 AS var_pct
  FROM pivot
  WHERE n_2023 >= 300 AND n_2025 >= 300 AND max_top1_share < 0.5
),
totales AS (
  SELECT
    SUM(IF(anio = 2023, valor, 0)) AS valor_2023,
    SUM(IF(anio = 2025, valor, 0)) AS valor_2025
  FROM por_sector
)
SELECT
  (SELECT valor_2025 FROM totales) AS valor_2025,
  (SELECT valor_2023 FROM totales) AS valor_2023,
  (SELECT sector FROM elegibles ORDER BY var_pct DESC LIMIT 1) AS sector_mayor_alza,
  (SELECT ROUND(MAX(var_pct), 1) FROM elegibles)               AS var_mayor_alza,
  (SELECT COUNT(*) FROM elegibles WHERE var_pct < 0)           AS n_sectores_cayeron,
  (SELECT COUNT(*) FROM elegibles)                             AS n_sectores;
