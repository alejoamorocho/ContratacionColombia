-- Dónde: agregado por departamento normalizado a código DANE de 2 dígitos.
--
-- entidad_departamento llega heterogéneo (código DANE 2 díg, código DANE 5 díg,
-- o nombre con/sin acentos). El CASE WHEN reproduce _build_dane_case_sql() de
-- functions/bigquery/materializers/por_departamento.py (mapeo DANE_OFICIAL de
-- functions/bigquery/utils_dane.py). El NOMBRE mostrado sale del mapeo DANE→nombre
-- (no del valor crudo), vía el JOIN con la tabla canónica deptos.
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
clasif AS (
  SELECT
    CASE
      WHEN entidad_departamento IN ('05', '08', '11', '13', '15', '17', '18', '19', '20', '23', '25', '27', '41', '44', '47', '50', '52', '54', '63', '66', '68', '70', '73', '76', '81', '85', '86', '88', '91', '94', '95', '97', '99') THEN entidad_departamento
      WHEN LENGTH(entidad_departamento) = 5 AND SUBSTR(entidad_departamento, 1, 2) IN ('05', '08', '11', '13', '15', '17', '18', '19', '20', '23', '25', '27', '41', '44', '47', '50', '52', '54', '63', '66', '68', '70', '73', '76', '81', '85', '86', '88', '91', '94', '95', '97', '99')
        THEN SUBSTR(entidad_departamento, 1, 2)
      WHEN LOWER(TRIM(entidad_departamento)) IN ('antioquia', 'antioquia') THEN '05'
      WHEN LOWER(TRIM(entidad_departamento)) IN ('atlántico', 'atlantico') THEN '08'
      WHEN LOWER(TRIM(entidad_departamento)) IN ('bogotá d.c.', 'bogota d.c.') THEN '11'
      WHEN LOWER(TRIM(entidad_departamento)) IN ('bolívar', 'bolivar') THEN '13'
      WHEN LOWER(TRIM(entidad_departamento)) IN ('boyacá', 'boyaca') THEN '15'
      WHEN LOWER(TRIM(entidad_departamento)) IN ('caldas', 'caldas') THEN '17'
      WHEN LOWER(TRIM(entidad_departamento)) IN ('caquetá', 'caqueta') THEN '18'
      WHEN LOWER(TRIM(entidad_departamento)) IN ('cauca', 'cauca') THEN '19'
      WHEN LOWER(TRIM(entidad_departamento)) IN ('cesar', 'cesar') THEN '20'
      WHEN LOWER(TRIM(entidad_departamento)) IN ('córdoba', 'cordoba') THEN '23'
      WHEN LOWER(TRIM(entidad_departamento)) IN ('cundinamarca', 'cundinamarca') THEN '25'
      WHEN LOWER(TRIM(entidad_departamento)) IN ('chocó', 'choco') THEN '27'
      WHEN LOWER(TRIM(entidad_departamento)) IN ('huila', 'huila') THEN '41'
      WHEN LOWER(TRIM(entidad_departamento)) IN ('la guajira', 'la guajira') THEN '44'
      WHEN LOWER(TRIM(entidad_departamento)) IN ('magdalena', 'magdalena') THEN '47'
      WHEN LOWER(TRIM(entidad_departamento)) IN ('meta', 'meta') THEN '50'
      WHEN LOWER(TRIM(entidad_departamento)) IN ('nariño', 'narino') THEN '52'
      WHEN LOWER(TRIM(entidad_departamento)) IN ('norte de santander', 'norte de santander') THEN '54'
      WHEN LOWER(TRIM(entidad_departamento)) IN ('quindío', 'quindio') THEN '63'
      WHEN LOWER(TRIM(entidad_departamento)) IN ('risaralda', 'risaralda') THEN '66'
      WHEN LOWER(TRIM(entidad_departamento)) IN ('santander', 'santander') THEN '68'
      WHEN LOWER(TRIM(entidad_departamento)) IN ('sucre', 'sucre') THEN '70'
      WHEN LOWER(TRIM(entidad_departamento)) IN ('tolima', 'tolima') THEN '73'
      WHEN LOWER(TRIM(entidad_departamento)) IN ('valle del cauca', 'valle del cauca') THEN '76'
      WHEN LOWER(TRIM(entidad_departamento)) IN ('arauca', 'arauca') THEN '81'
      WHEN LOWER(TRIM(entidad_departamento)) IN ('casanare', 'casanare') THEN '85'
      WHEN LOWER(TRIM(entidad_departamento)) IN ('putumayo', 'putumayo') THEN '86'
      WHEN LOWER(TRIM(entidad_departamento)) IN ('san andrés y providencia', 'san andres y providencia') THEN '88'
      WHEN LOWER(TRIM(entidad_departamento)) IN ('amazonas', 'amazonas') THEN '91'
      WHEN LOWER(TRIM(entidad_departamento)) IN ('guainía', 'guainia') THEN '94'
      WHEN LOWER(TRIM(entidad_departamento)) IN ('guaviare', 'guaviare') THEN '95'
      WHEN LOWER(TRIM(entidad_departamento)) IN ('vaupés', 'vaupes') THEN '97'
      WHEN LOWER(TRIM(entidad_departamento)) IN ('vichada', 'vichada') THEN '99'
      WHEN LOWER(TRIM(entidad_departamento)) IN ('bogota dc', 'distrito capital de bogota', 'bogota distrito capital') THEN '11'
      WHEN LOWER(TRIM(entidad_departamento)) IN ('san andres') THEN '88'
      ELSE NULL
    END AS dane,
    valor
  FROM `{p}.{d}.contratos`
  WHERE fecha_firma BETWEEN '2022-01-01' AND '2026-12-31'
    AND valor IS NOT NULL AND valor > 0
    AND entidad_departamento IS NOT NULL
),
agregados AS (
  SELECT dane, SUM(valor) AS valor, COUNT(*) AS contratos
  FROM clasif
  WHERE dane IS NOT NULL
  GROUP BY dane
)
SELECT
  a.dane,
  d.departamento,
  a.valor,
  a.contratos
FROM agregados a
JOIN deptos d ON d.dane = a.dane
ORDER BY a.valor DESC;
