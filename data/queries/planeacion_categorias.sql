-- Planeación (PAA): top categorías por valor planeado.
--
-- NOTA IMPORTANTE: en la tabla `paa`, la columna `objeto_clasificado` está 100%
-- vacía. La única clasificación temática disponible es `categorias_unspsc`
-- (códigos UNSPSC, p.ej. '80111600'; a veces varios separados por ';'). Se toma
-- el PRIMER código y sus 2 primeros dígitos = "segmento" UNSPSC, y se traduce a
-- una etiqueta legible en español (taxonomía estándar UNSPSC). Las filas sin
-- código UNSPSC se agrupan en 'Sin clasificar'.
-- Misma deduplicación de dos pasos que planeacion_kpis.sql.
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
  WHERE d.valor_total_esperado IS NOT NULL AND d.valor_total_esperado > 0
),
cat AS (
  SELECT
    CASE SUBSTR(REGEXP_EXTRACT(categorias_unspsc, r'^[^;]+'), 1, 2)
      WHEN '10' THEN 'Material vivo (animal, vegetal)'
      WHEN '11' THEN 'Materias primas y minerales'
      WHEN '12' THEN 'Químicos'
      WHEN '13' THEN 'Caucho, plásticos y resinas'
      WHEN '14' THEN 'Papel y materiales de oficina'
      WHEN '15' THEN 'Combustibles y lubricantes'
      WHEN '20' THEN 'Maquinaria de minería y construcción'
      WHEN '21' THEN 'Maquinaria agrícola y forestal'
      WHEN '22' THEN 'Maquinaria de construcción de edificios'
      WHEN '23' THEN 'Maquinaria industrial'
      WHEN '24' THEN 'Manejo y almacenamiento de materiales'
      WHEN '25' THEN 'Vehículos y transporte'
      WHEN '26' THEN 'Maquinaria de generación eléctrica'
      WHEN '27' THEN 'Herramientas y equipos generales'
      WHEN '30' THEN 'Materiales y componentes de construcción'
      WHEN '31' THEN 'Componentes de fabricación'
      WHEN '32' THEN 'Componentes electrónicos'
      WHEN '39' THEN 'Iluminación y componentes eléctricos'
      WHEN '40' THEN 'Distribución, calefacción y ventilación'
      WHEN '41' THEN 'Equipo de laboratorio y medición'
      WHEN '42' THEN 'Equipo y suministros médicos'
      WHEN '43' THEN 'Equipo y software de tecnología (TIC)'
      WHEN '44' THEN 'Equipos y suministros de oficina'
      WHEN '45' THEN 'Equipos de impresión, fotografía y audiovisuales'
      WHEN '46' THEN 'Equipos de defensa y seguridad'
      WHEN '47' THEN 'Equipos de limpieza'
      WHEN '48' THEN 'Equipo para servicios de comida y hostelería'
      WHEN '49' THEN 'Equipo deportivo y recreativo'
      WHEN '50' THEN 'Alimentos y bebidas'
      WHEN '51' THEN 'Medicamentos y productos farmacéuticos'
      WHEN '52' THEN 'Artículos de uso doméstico'
      WHEN '53' THEN 'Ropa, calzado y accesorios'
      WHEN '54' THEN 'Relojería y joyería'
      WHEN '55' THEN 'Productos editoriales e impresos'
      WHEN '56' THEN 'Muebles y mobiliario'
      WHEN '60' THEN 'Instrumentos musicales, arte y educación'
      WHEN '70' THEN 'Servicios agrícolas, pesca y forestales'
      WHEN '71' THEN 'Servicios de minería y petróleo'
      WHEN '72' THEN 'Servicios de construcción y mantenimiento'
      WHEN '73' THEN 'Servicios de producción industrial'
      WHEN '76' THEN 'Servicios de limpieza y tratamiento de residuos'
      WHEN '77' THEN 'Servicios medioambientales'
      WHEN '78' THEN 'Servicios de transporte y logística'
      WHEN '80' THEN 'Servicios de gestión y profesionales'
      WHEN '81' THEN 'Servicios de ingeniería e investigación'
      WHEN '82' THEN 'Servicios editoriales, diseño y artes gráficas'
      WHEN '83' THEN 'Servicios públicos (agua, energía, telecom.)'
      WHEN '84' THEN 'Servicios financieros y de seguros'
      WHEN '85' THEN 'Servicios de salud'
      WHEN '86' THEN 'Servicios de educación y capacitación'
      WHEN '90' THEN 'Servicios de viajes, alimentación y entretenimiento'
      WHEN '91' THEN 'Servicios personales y domésticos'
      WHEN '92' THEN 'Servicios de seguridad y defensa nacional'
      WHEN '93' THEN 'Servicios políticos y comunitarios'
      WHEN '94' THEN 'Organizaciones y asociaciones'
      WHEN '95' THEN 'Terrenos, edificios y construcciones'
      ELSE 'Sin clasificar'
    END AS categoria,
    valor_total_esperado AS valor
  FROM latest
)
SELECT
  categoria,
  SUM(valor) AS valor,
  COUNT(*) AS items
FROM cat
GROUP BY categoria
HAVING items >= 20
ORDER BY valor DESC
LIMIT 12;
