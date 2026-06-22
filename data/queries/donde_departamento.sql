-- Dónde: agregado por departamento, normalizado a código DANE de 2 dígitos.
--
-- entidad_departamento llega MUY heterogéneo: código DANE de 2 o 5 dígitos, o el
-- nombre con/sin tildes y en distintas grafías ("Distrito Capital de Bogotá",
-- "Bogota D.C.", "11", "Antioquia", "05"...). Para no perder contratos (una
-- versión previa dejaba fuera ~42% del valor, sobre todo Bogotá por la tilde),
-- el nombre se normaliza quitando acentos y pasando a minúsculas ANTES de
-- comparar (REGEXP_REPLACE(NORMALIZE(..., NFD), r'\pM', '')). El NOMBRE mostrado
-- sale del catálogo canónico DANE→nombre, no del valor crudo.
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
    entidad_departamento AS ed_raw,
    REGEXP_REPLACE(NORMALIZE(LOWER(TRIM(entidad_departamento)), NFD), r'\pM', '') AS ed,
    valor
  FROM `{p}.{d}.contratos`
  WHERE fecha_firma BETWEEN '2022-01-01' AND '2026-12-31'
    AND valor IS NOT NULL AND valor > 0
    AND entidad_departamento IS NOT NULL
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
    valor
  FROM norm
),
agregados AS (
  SELECT dane, SUM(valor) AS valor, COUNT(*) AS contratos
  FROM clasif
  WHERE dane IS NOT NULL
  GROUP BY dane
)
SELECT a.dane, d.departamento, a.valor, a.contratos
FROM agregados a
JOIN deptos d ON d.dane = a.dane
ORDER BY a.valor DESC;
