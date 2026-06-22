-- Sanciones: conteo por año de inicio (ventana 2022-2026).
-- 2026 es parcial (solo hasta el corte de datos); el dashboard lo anota.
SELECT
  EXTRACT(YEAR FROM fecha_inicio) AS anio,
  COUNT(*) AS n
FROM `{p}.{d}.sanciones`
WHERE fecha_inicio BETWEEN '2022-01-01' AND '2026-12-31'
GROUP BY anio
ORDER BY anio;
