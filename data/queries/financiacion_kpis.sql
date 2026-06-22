-- ¿Con qué dinero se contrata? — KPIs de financiación por fuente del gasto.
-- Grupo ¿Cómo? · Ventana 2022-2026 por fecha_firma · valor > 0.
--
-- Las columnas recursos_* son montos COP que reportan de qué bolsa pública sale el
-- valor del contrato: recursos_pgn (Presupuesto General de la Nación), recursos_propios
-- (recursos propios de la entidad), recursos_sgp (Sistema General de Participaciones),
-- recursos_regalias (Sistema General de Regalías). En el esquema vienen como NUMERIC;
-- igual se castea a FLOAT64 con SAFE_CAST por robustez ante reingestas.
--
-- COBERTURA: la suma de las cuatro fuentes nombradas (~$367 billones) equivale a solo
-- ~63% del valor total contratado (~$585 billones). El resto del valor no trae fuente
-- atribuida en estas columnas. Por eso la sección OPERA sobre el monto con fuente
-- reportada, no sobre el total. pct_con_fuente expone esa cobertura.
--
-- Una sola fila: total por fuente + valor total + cobertura.
SELECT
  SUM(SAFE_CAST(recursos_pgn      AS FLOAT64)) AS pgn,
  SUM(SAFE_CAST(recursos_propios  AS FLOAT64)) AS propios,
  SUM(SAFE_CAST(recursos_sgp      AS FLOAT64)) AS sgp,
  SUM(SAFE_CAST(recursos_regalias AS FLOAT64)) AS regalias,
  -- valor_con_fuente = suma de las 4 fuentes. COALESCE por término: si una columna es
  -- NULL no debe anular la fila entera (de lo contrario el monto cae y el % baja a ~55%).
  -- Así la cobertura coincide con la suma de los 4 KPIs (~$367 billones ≈ 63%).
  SUM(
    COALESCE(SAFE_CAST(recursos_pgn      AS FLOAT64), 0) +
    COALESCE(SAFE_CAST(recursos_propios  AS FLOAT64), 0) +
    COALESCE(SAFE_CAST(recursos_sgp      AS FLOAT64), 0) +
    COALESCE(SAFE_CAST(recursos_regalias AS FLOAT64), 0)
  ) AS valor_con_fuente,
  SUM(valor) AS valor_total,
  SAFE_DIVIDE(
    SUM(
      COALESCE(SAFE_CAST(recursos_pgn      AS FLOAT64), 0) +
      COALESCE(SAFE_CAST(recursos_propios  AS FLOAT64), 0) +
      COALESCE(SAFE_CAST(recursos_sgp      AS FLOAT64), 0) +
      COALESCE(SAFE_CAST(recursos_regalias AS FLOAT64), 0)
    ),
    SUM(valor)
  ) AS pct_con_fuente
FROM `{p}.{d}.contratos`
WHERE fecha_firma BETWEEN '2022-01-01' AND '2026-12-31'
  AND valor > 0;
