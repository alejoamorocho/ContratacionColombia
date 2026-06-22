-- ¿Qué tan competida es la contratación?: KPIs nacionales de procesos SECOP II.
--
-- Una sola fila. La tabla `procesos` trae ~0.08% de ids repetidos (mismo proceso
-- ingerido/versionado más de una vez); se deduplica conservando la última versión
-- por id según `fecha_ingesta` para no contar dos veces el mismo proceso.
--
-- pct_adjudicado = % de procesos en estado 'Seleccionado' (estado terminal de
--   adjudicación en SECOP II).
-- pct_desierto   = % de procesos 'Cancelado'. La fuente NO marca "desierto"
--   explícitamente; 'Cancelado' es el proxy más cercano de proceso no adjudicado.
-- promedio_ofertas = promedio de n_ofertas_recibidas considerando SOLO los
--   procesos con n_ofertas_recibidas > 0. ADVERTENCIA: esta columna está
--   prácticamente sin poblar en la fuente (>99.99% en 0), por lo que el promedio
--   describe apenas unas decenas de procesos y NO es representativo del universo.
WITH dedup AS (
  SELECT
    estado_proceso,
    n_ofertas_recibidas
  FROM `{p}.{d}.procesos`
  WHERE fecha_publicacion BETWEEN '2022-01-01' AND '2026-12-31'
  QUALIFY ROW_NUMBER() OVER (
    PARTITION BY id ORDER BY fecha_ingesta DESC
  ) = 1
)
SELECT
  COUNT(*) AS total,
  ROUND(COUNTIF(estado_proceso = 'Seleccionado') * 100.0 / COUNT(*), 1) AS pct_adjudicado,
  ROUND(COUNTIF(estado_proceso = 'Cancelado')   * 100.0 / COUNT(*), 1) AS pct_desierto,
  ROUND(AVG(IF(n_ofertas_recibidas > 0, n_ofertas_recibidas, NULL)), 2) AS promedio_ofertas
FROM dedup;
