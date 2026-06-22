-- CRUCE NEUTRAL — Donante ↔ Contratista (ventana 2022-2026).
--
-- Cuenta cuántos NITs figuran a la vez como CONTRATISTAS del Estado y como
-- APORTANTES a campañas (CNE/Cuentas Claras). Es un solapamiento FACTUAL de dos
-- registros públicos.
--
-- ⚠ TONO: aportar a una campaña es legal y coincidir en ambos registros NO
-- implica irregularidad ni favorecimiento. Es estadística descriptiva; cualquier
-- interpretación causal exige verificación caso por caso.
--
-- Método: coincidencia EXACTA de NIT (`contratista_nit` = `nit_aportante`).
-- Es conservador: puede SUBESTIMAR por diferencias de formato (dígito de
-- verificación, ceros). Contratos limitados a la ventana 2022-2026, valor > 0.
WITH aportantes AS (
  SELECT DISTINCT CAST(nit_aportante AS STRING) AS nit
  FROM `{p}.{d}.campanas`
  WHERE nit_aportante IS NOT NULL
)
SELECT
  COUNT(DISTINCT c.contratista_nit) AS nits,
  COUNT(*) AS contratos,
  SUM(c.valor) AS valor,
  (SELECT COUNT(DISTINCT contratista_nit)
   FROM `{p}.{d}.contratos`
   WHERE fecha_firma BETWEEN '2022-01-01' AND '2026-12-31' AND valor > 0
     AND contratista_nit IS NOT NULL AND contratista_nit != '') AS total_contratistas
FROM `{p}.{d}.contratos` c
JOIN aportantes a ON a.nit = c.contratista_nit
WHERE c.fecha_firma BETWEEN '2022-01-01' AND '2026-12-31' AND c.valor > 0
  AND c.contratista_nit IS NOT NULL AND c.contratista_nit != '';
