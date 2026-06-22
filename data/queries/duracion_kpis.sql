-- Duración: ¿cuánto duran los contratos del Estado? Estadística descriptiva del
-- PLAZO CONTRATADO = DATE_DIFF(fecha_fin, fecha_inicio, DAY).
--
-- IMPORTANTE: NO se usa la columna `duracion_dias` (viene rota/inconsistente en
-- la fuente). El plazo se calcula desde fecha_inicio→fecha_fin.
-- Se acota a [1, 3650] días (1 día a 10 años) para descartar fechas invertidas,
-- contratos de un solo día por error y plazos absurdos; ~0.4% de filas con
-- ambas fechas quedan fuera del rango.
--
-- Nota de tabla: esta query lee la tabla CRUDA `contratos` (no la base
-- deduplicada `_contratos_pub`, que no materializa fecha_inicio/fecha_fin). El
-- backtick partido `{p}.{d}`.contratos es intencional para que el materializador
-- NO la redirija a la base. La dedup por id no es crítica aquí: son cuantiles.
WITH dur AS (
  SELECT DATE_DIFF(fecha_fin, fecha_inicio, DAY) AS dias
  FROM `{p}.{d}`.contratos
  WHERE fecha_firma BETWEEN '2022-01-01' AND '2026-12-31'
    AND valor IS NOT NULL AND valor > 0
    AND fecha_inicio IS NOT NULL AND fecha_fin IS NOT NULL
),
filtrado AS (
  SELECT dias FROM dur WHERE dias BETWEEN 1 AND 3650
),
q AS (
  SELECT APPROX_QUANTILES(dias, 100) AS pct FROM filtrado
)
SELECT
  pct[OFFSET(50)] AS mediana_dias,
  pct[OFFSET(25)] AS p25,
  pct[OFFSET(75)] AS p75,
  pct[OFFSET(90)] AS p90,
  (SELECT COUNT(*) FROM filtrado) AS contratos
FROM q;
