-- ¿Se ejecuta? Valor contratado vs facturado vs pagado por año (desde contratos).
SELECT
  EXTRACT(YEAR FROM fecha_firma) AS anio,
  SUM(valor) AS contratado,
  SUM(valor_facturado) AS facturado,
  SUM(valor_pagado) AS pagado
FROM `{p}.{d}.contratos`
WHERE fecha_firma BETWEEN '2022-01-01' AND '2026-12-31' AND valor > 0
GROUP BY anio
ORDER BY anio;
