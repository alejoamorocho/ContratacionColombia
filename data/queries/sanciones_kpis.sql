-- Sanciones (registro SIRI): KPIs nacionales agregados. Registro FACTUAL — describe, no juzga.
--   total                    = nº de sanciones INICIADAS en la ventana 2022-2026 (para la serie).
--   inhabilidad_vigente      = nº con estado VIGENTE e inhabilidad > 0 meses, SIN ventana de
--                              fecha: una inhabilidad larga impuesta antes de 2022 sigue activa
--                              hoy y debe contarse (responde "¿cuántos están inhabilitados?").
--   inhabilidad_mediana_meses / _promedio_meses = tendencia central del periodo de inhabilidad
--                              (>0). Se reporta la MEDIANA (robusta a la fuerte asimetría: muchas
--                              cortas, pocas de 20 años) junto al promedio, por la regla
--                              mediana-sobre-media del proyecto.
-- La tabla NO tiene ids repetidos (COUNT(*)=COUNT(DISTINCT id)=44.472), no se deduplica.
WITH ventana AS (
  SELECT COUNT(*) AS total
  FROM `{p}.{d}.sanciones`
  WHERE fecha_inicio BETWEEN '2022-01-01' AND '2026-12-31'
),
inhab AS (
  SELECT
    COUNTIF(
      UPPER(COALESCE(estado, '')) = 'VIGENTE'
      AND inhabilidad_meses IS NOT NULL
      AND inhabilidad_meses > 0
    ) AS inhabilidad_vigente,
    ROUND(AVG(CASE WHEN inhabilidad_meses > 0 THEN inhabilidad_meses END), 1) AS inhabilidad_promedio_meses,
    APPROX_QUANTILES(IF(inhabilidad_meses > 0, inhabilidad_meses, NULL), 100)[OFFSET(50)] AS inhabilidad_mediana_meses
  FROM `{p}.{d}.sanciones`
)
SELECT
  v.total,
  i.inhabilidad_vigente,
  i.inhabilidad_promedio_meses,
  i.inhabilidad_mediana_meses
FROM ventana v, inhab i;
