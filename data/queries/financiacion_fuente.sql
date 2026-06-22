-- ¿Con qué dinero se contrata? — Valor contratado por fuente de financiación.
-- Grupo ¿Cómo? · Ventana 2022-2026 por fecha_firma · valor > 0.
--
-- Suma el monto reportado en cada bolsa pública (recursos_*, NUMERIC; SAFE_CAST a
-- FLOAT64 por robustez). Cuatro fuentes en orden de magnitud descendente:
--   PGN       — Presupuesto General de la Nación
--   Propios   — recursos propios de la entidad contratante
--   SGP       — Sistema General de Participaciones
--   Regalías  — Sistema General de Regalías
--
-- IMPORTANTE: la suma de estas cuatro fuentes (~$367 billones) cubre ~63% del valor
-- total contratado. No es el total del Estado; es el monto con fuente atribuida.
--
-- Cuatro filas {fuente, valor}, ordenadas por valor desc, para gráfica de barras.
SELECT 'PGN'      AS fuente, SUM(SAFE_CAST(recursos_pgn      AS FLOAT64)) AS valor
FROM `{p}.{d}.contratos`
WHERE fecha_firma BETWEEN '2022-01-01' AND '2026-12-31' AND valor > 0
UNION ALL
SELECT 'Propios'  AS fuente, SUM(SAFE_CAST(recursos_propios  AS FLOAT64)) AS valor
FROM `{p}.{d}.contratos`
WHERE fecha_firma BETWEEN '2022-01-01' AND '2026-12-31' AND valor > 0
UNION ALL
SELECT 'SGP'      AS fuente, SUM(SAFE_CAST(recursos_sgp      AS FLOAT64)) AS valor
FROM `{p}.{d}.contratos`
WHERE fecha_firma BETWEEN '2022-01-01' AND '2026-12-31' AND valor > 0
UNION ALL
SELECT 'Regalías' AS fuente, SUM(SAFE_CAST(recursos_regalias AS FLOAT64)) AS valor
FROM `{p}.{d}.contratos`
WHERE fecha_firma BETWEEN '2022-01-01' AND '2026-12-31' AND valor > 0
ORDER BY valor DESC;
