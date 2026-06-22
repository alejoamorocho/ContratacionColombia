-- ¿Cómo se financian las campañas? — KPIs nacionales de aportes (CNE).
-- Ventana 2022-2026 por anio_eleccion. Una sola fila: nº de aportes,
-- suma de monto y nº de candidatos distintos.
--
-- Tono SENSIBLE: transparencia factual de financiación política. SOLO agregados,
-- nunca cruces aportante→contratista. Describe, no juzga.
--
-- candidatos: se cuenta por identificacion_candidato (estable) con respaldo al
-- nombre cuando la identificación viene vacía, para no inflar el conteo por
-- variaciones de grafía del nombre.
SELECT
  COUNT(*) AS aportes,
  SUM(COALESCE(monto_aportado, 0)) AS monto_total,
  COUNT(DISTINCT COALESCE(
    NULLIF(TRIM(identificacion_candidato), ''),
    NULLIF(TRIM(candidato), '')
  )) AS candidatos
FROM `{p}.{d}.campanas`
WHERE SAFE_CAST(anio_eleccion AS INT64) BETWEEN 2022 AND 2026;
