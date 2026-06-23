-- ¿Se ejecuta? KPIs de ejecución desde la tabla de contratos (la tabla
-- `facturas` no tiene montos). Compara lo contratado con lo facturado y pagado.
-- valor_facturado / valor_pagado son NULL en parte de los contratos; SUM los
-- ignora, así que los porcentajes son cotas inferiores (cobertura parcial).
-- cobertura_factura/cobertura_pago = % de contratos (de la base con valor>0) que
-- traen el campo NO NULO. Separa "cobertura del dato" de "nivel de ejecución":
-- un % pagado bajo puede deberse a subreporte (cobertura baja), no a no-pago.
SELECT
  SUM(valor) AS contratado,
  SUM(valor_facturado) AS facturado,
  SUM(valor_pagado) AS pagado,
  ROUND(SUM(valor_facturado) * 100.0 / NULLIF(SUM(valor), 0), 1) AS pct_facturado,
  ROUND(SUM(valor_pagado) * 100.0 / NULLIF(SUM(valor), 0), 1) AS pct_pagado,
  ROUND(COUNTIF(valor_facturado IS NOT NULL) * 100.0 / COUNT(*), 1) AS cobertura_factura,
  ROUND(COUNTIF(valor_pagado IS NOT NULL) * 100.0 / COUNT(*), 1) AS cobertura_pago
FROM `{p}.{d}.contratos`
WHERE fecha_firma BETWEEN '2022-01-01' AND '2026-12-31' AND valor > 0;
