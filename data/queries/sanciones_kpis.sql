-- Sanciones (registro SIRI): KPIs nacionales agregados, ventana 2022-2026.
-- Una sola fila. Registro FACTUAL — describe, no juzga.
--   total                    = nº de sanciones registradas con fecha_inicio en ventana.
--   inhabilidad_vigente      = nº con estado VIGENTE y un periodo de inhabilidad > 0 meses.
--   inhabilidad_promedio_meses = promedio de inhabilidad_meses sobre las que SÍ
--                                imponen inhabilidad (>0); las sanciones sin
--                                inhabilidad (NULL) no diluyen el promedio.
-- La tabla NO tiene ids repetidos (COUNT(*)=COUNT(DISTINCT id)=44.472), no se deduplica.
SELECT
  COUNT(*) AS total,
  COUNTIF(
    UPPER(COALESCE(estado, '')) = 'VIGENTE'
    AND inhabilidad_meses IS NOT NULL
    AND inhabilidad_meses > 0
  ) AS inhabilidad_vigente,
  ROUND(
    AVG(CASE WHEN inhabilidad_meses > 0 THEN inhabilidad_meses END), 1
  ) AS inhabilidad_promedio_meses
FROM `{p}.{d}.sanciones`
WHERE fecha_inicio BETWEEN '2022-01-01' AND '2026-12-31';
