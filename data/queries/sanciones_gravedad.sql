-- Sanciones: conteo por gravedad_falta (ventana 2022-2026).
-- NOTA DE DATOS: en la fuente SIRI esta columna NO trae la gravedad de la falta
-- (leve/grave/gravísima); de hecho replica la CALIDAD del sancionado
-- ("SERVIDOR PÚBLICO", "MIEMBRO DE LA FUERZA PÚBLICA", "PARTICULAR"...). Se
-- mantiene el campo solicitado pero el dashboard lo rotula con cautela.
-- Se normaliza UPPER + sin tildes para colapsar variantes y COALESCE a
-- 'Sin clasificar' los nulos/vacíos (181 filas en la ventana).
SELECT
  CASE
    WHEN gravedad_falta IS NULL OR TRIM(gravedad_falta) = '' THEN 'Sin clasificar'
    ELSE REGEXP_REPLACE(NORMALIZE(UPPER(TRIM(gravedad_falta)), NFD), r'\pM', '')
  END AS gravedad,
  COUNT(*) AS n
FROM `{p}.{d}.sanciones`
WHERE fecha_inicio BETWEEN '2022-01-01' AND '2026-12-31'
GROUP BY gravedad
ORDER BY n DESC;
