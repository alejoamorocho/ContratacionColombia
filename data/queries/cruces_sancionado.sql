-- CRUCE NEUTRAL — Sancionado ↔ Contratista (ventana 2022-2026).
--
-- Cuenta NITs que firmaron contratos DESPUÉS de figurar en el registro de
-- sanciones del SIRI (Procuraduría). Solo contratos posteriores a la primera
-- sanción registrada del NIT, dentro de la ventana 2022-2026.
--
-- ⚠ TONO: una sanción disciplinaria NO siempre inhabilita para contratar (depende
-- del tipo y la vigencia de la inhabilidad), y muchas inhabilidades pueden estar
-- ya cumplidas. Esto NO afirma ilegalidad: describe un solapamiento temporal entre
-- dos registros públicos que MERECE VERIFICACIÓN caso por caso.
--
-- Método: coincidencia EXACTA de NIT (`contratista_nit` = `sancionado_nit`);
-- conservador (puede subestimar por formato). `fecha_firma` posterior a la primera
-- sanción del NIT. Las sanciones consideradas pueden ser de cualquier fecha; los
-- contratos están limitados a 2022-2026.
WITH sanc AS (
  SELECT sancionado_nit AS nit, MIN(fecha_inicio) AS primera_sancion
  FROM `{p}.{d}.sanciones`
  WHERE sancionado_nit IS NOT NULL AND sancionado_nit != ''
  GROUP BY nit
)
SELECT
  COUNT(DISTINCT c.contratista_nit) AS nits,
  COUNT(*) AS contratos,
  SUM(c.valor) AS valor
FROM `{p}.{d}.contratos` c
JOIN sanc s ON s.nit = c.contratista_nit
WHERE c.fecha_firma BETWEEN '2022-01-01' AND '2026-12-31' AND c.valor > 0
  AND c.contratista_nit IS NOT NULL AND c.contratista_nit != ''
  AND c.fecha_firma > s.primera_sancion;
