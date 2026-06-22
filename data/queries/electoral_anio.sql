-- ¿Cómo se financian las campañas? — monto total por año de elección.
-- Ventana 2022-2026. anio_eleccion llega como INT pero se castea defensivamente
-- (algunos registros traen el año como texto). Sólo hay aportes reportados para
-- los ciclos 2022 (Congreso/Presidencia) y 2023 (autoridades territoriales).
SELECT
  SAFE_CAST(anio_eleccion AS INT64) AS anio,
  SUM(COALESCE(monto_aportado, 0)) AS monto,
  COUNT(*) AS aportes
FROM `{p}.{d}.campanas`
WHERE SAFE_CAST(anio_eleccion AS INT64) BETWEEN 2022 AND 2026
GROUP BY anio
ORDER BY anio;
