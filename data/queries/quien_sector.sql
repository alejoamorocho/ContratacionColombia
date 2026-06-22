-- Quién contrata: por categoría de objeto contratado (objeto_clasificado).
-- Mapea los códigos en MAYÚSCULAS a etiquetas legibles en español (con tildes).
-- N mínimo 20 para estabilidad; top 12 por valor.
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
  SUM(valor) AS valor,
  COUNT(*) AS contratos
FROM `{p}.{d}.contratos`
WHERE fecha_firma BETWEEN '2022-01-01' AND '2026-12-31'
  AND valor IS NOT NULL AND valor > 0
GROUP BY sector
HAVING contratos >= 20
ORDER BY valor DESC
LIMIT 12;
