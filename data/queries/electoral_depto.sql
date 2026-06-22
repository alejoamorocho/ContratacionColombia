-- ¿Cómo se financian las campañas? — monto aportado por departamento del candidato.
-- Ventana 2022-2026.
--
-- `departamento_candidato` llega heterogéneo: código DANE de 2 ó 5 dígitos, o el
-- nombre con/sin tildes en distintas grafías ("11", "05", "Bogotá D.C.",
-- "Antioquia"...). Se normaliza con el MISMO criterio que `donde_departamento.sql`
-- (quitar acentos con NORMALIZE NFD + minúsculas, mapear a código DANE de 2 dígitos)
-- y el NOMBRE mostrado sale del catálogo canónico DANE→nombre, no del valor crudo.
--
-- Los aportes a campañas de cargos nacionales (Senado, Presidencia) no traen
-- departamento (~21% de los registros, NULL): quedan FUERA de esta vista por
-- departamento por diseño (no son atribuibles a un territorio).
WITH deptos AS (
  SELECT * FROM UNNEST([
    STRUCT('05' AS dane, 'Antioquia' AS departamento),
    ('08', 'Atlántico'), ('11', 'Bogotá D.C.'), ('13', 'Bolívar'),
    ('15', 'Boyacá'), ('17', 'Caldas'), ('18', 'Caquetá'), ('19', 'Cauca'),
    ('20', 'Cesar'), ('23', 'Córdoba'), ('25', 'Cundinamarca'), ('27', 'Chocó'),
    ('41', 'Huila'), ('44', 'La Guajira'), ('47', 'Magdalena'), ('50', 'Meta'),
    ('52', 'Nariño'), ('54', 'Norte de Santander'), ('63', 'Quindío'),
    ('66', 'Risaralda'), ('68', 'Santander'), ('70', 'Sucre'), ('73', 'Tolima'),
    ('76', 'Valle del Cauca'), ('81', 'Arauca'), ('85', 'Casanare'),
    ('86', 'Putumayo'), ('88', 'San Andrés y Providencia'), ('91', 'Amazonas'),
    ('94', 'Guainía'), ('95', 'Guaviare'), ('97', 'Vaupés'), ('99', 'Vichada')
  ])
),
norm AS (
  SELECT
    TRIM(departamento_candidato) AS ed_raw,
    REGEXP_REPLACE(NORMALIZE(LOWER(TRIM(departamento_candidato)), NFD), r'\pM', '') AS ed,
    COALESCE(monto_aportado, 0) AS monto
  FROM `{p}.{d}.campanas`
  WHERE SAFE_CAST(anio_eleccion AS INT64) BETWEEN 2022 AND 2026
    AND departamento_candidato IS NOT NULL
    AND TRIM(departamento_candidato) != ''
),
clasif AS (
  SELECT
    CASE
      -- Código DANE de 2 dígitos
      WHEN ed_raw IN ('05','08','11','13','15','17','18','19','20','23','25','27','41','44','47','50','52','54','63','66','68','70','73','76','81','85','86','88','91','94','95','97','99') THEN ed_raw
      -- Código DANE de 5 dígitos (municipio) -> 2 primeros (departamento)
      WHEN LENGTH(ed_raw) = 5 AND SUBSTR(ed_raw, 1, 2) IN ('05','08','11','13','15','17','18','19','20','23','25','27','41','44','47','50','52','54','63','66','68','70','73','76','81','85','86','88','91','94','95','97','99') THEN SUBSTR(ed_raw, 1, 2)
      -- Nombres (ya sin tildes ni mayúsculas en ed)
      WHEN ed = 'antioquia' THEN '05'
      WHEN ed = 'atlantico' THEN '08'
      WHEN ed IN ('bogota d.c.','bogota dc','bogota','distrito capital de bogota','bogota distrito capital','distrito capital','santa fe de bogota','santafe de bogota') THEN '11'
      WHEN ed = 'bolivar' THEN '13'
      WHEN ed = 'boyaca' THEN '15'
      WHEN ed = 'caldas' THEN '17'
      WHEN ed = 'caqueta' THEN '18'
      WHEN ed = 'cauca' THEN '19'
      WHEN ed = 'cesar' THEN '20'
      WHEN ed = 'cordoba' THEN '23'
      WHEN ed = 'cundinamarca' THEN '25'
      WHEN ed = 'choco' THEN '27'
      WHEN ed = 'huila' THEN '41'
      WHEN ed IN ('la guajira','guajira') THEN '44'
      WHEN ed = 'magdalena' THEN '47'
      WHEN ed = 'meta' THEN '50'
      WHEN ed = 'narino' THEN '52'
      WHEN ed = 'norte de santander' THEN '54'
      WHEN ed = 'quindio' THEN '63'
      WHEN ed = 'risaralda' THEN '66'
      WHEN ed = 'santander' THEN '68'
      WHEN ed = 'sucre' THEN '70'
      WHEN ed = 'tolima' THEN '73'
      WHEN ed IN ('valle del cauca','valle') THEN '76'
      WHEN ed = 'arauca' THEN '81'
      WHEN ed = 'casanare' THEN '85'
      WHEN ed = 'putumayo' THEN '86'
      WHEN ed IN ('san andres y providencia','san andres','archipielago de san andres','archipielago de san andres providencia y santa catalina') THEN '88'
      WHEN ed = 'amazonas' THEN '91'
      WHEN ed = 'guainia' THEN '94'
      WHEN ed = 'guaviare' THEN '95'
      WHEN ed = 'vaupes' THEN '97'
      WHEN ed = 'vichada' THEN '99'
      ELSE NULL
    END AS dane,
    monto
  FROM norm
),
agregados AS (
  SELECT dane, SUM(monto) AS monto, COUNT(*) AS aportes
  FROM clasif
  WHERE dane IS NOT NULL
  GROUP BY dane
)
SELECT a.dane, d.departamento, a.monto, a.aportes
FROM agregados a
JOIN deptos d ON d.dane = a.dane
ORDER BY a.monto DESC;
