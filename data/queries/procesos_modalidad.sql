-- ¿Qué tan competida es la contratación?: procesos por modalidad.
--
-- La columna `modalidad` mezcla texto crudo con tildes ("Contratación régimen
-- especial") y variantes; se colapsa a categorías legibles insensibles a
-- mayúsculas/acentos (mismo criterio que como_modalidad.sql) para evitar
-- duplicados en la gráfica.
--
-- Por modalidad: nº de procesos, promedio de ofertas y % adjudicado.
-- promedio_ofertas considera SOLO procesos con n_ofertas_recibidas > 0
--   (ADVERTENCIA: columna casi sin poblar en la fuente; valor poco representativo).
-- pct_adjudicado = % de procesos en estado 'Seleccionado' dentro de la modalidad.
--
-- Se deduplica por id (última versión según fecha_ingesta).
WITH dedup AS (
  SELECT
    modalidad,
    estado_proceso,
    n_ofertas_recibidas
  FROM `{p}.{d}.procesos`
  WHERE fecha_publicacion BETWEEN '2022-01-01' AND '2026-12-31'
  QUALIFY ROW_NUMBER() OVER (
    PARTITION BY id ORDER BY fecha_ingesta DESC
  ) = 1
),
norm AS (
  SELECT
    CASE
      WHEN modalidad IS NULL THEN 'Otras'
      WHEN m LIKE '%DIRECTA%' THEN 'Contratación directa'
      WHEN m LIKE '%REGIMEN%ESPECIAL%' THEN 'Régimen especial'
      WHEN m LIKE '%MINIMA%' THEN 'Mínima cuantía'
      WHEN m LIKE '%ABREVIAD%' OR m LIKE '%MENOR CUANTIA%' OR m LIKE '%SUBASTA%' THEN 'Selección abreviada'
      WHEN m LIKE '%LICITACION%' THEN 'Licitación pública'
      WHEN m LIKE '%MERITOS%' OR m LIKE '%CONCURSO%' THEN 'Concurso de méritos'
      ELSE 'Otras'
    END AS modalidad,
    estado_proceso,
    n_ofertas_recibidas
  FROM (
    SELECT
      modalidad,
      estado_proceso,
      n_ofertas_recibidas,
      REGEXP_REPLACE(NORMALIZE(UPPER(modalidad), NFD), r'\pM', '') AS m
    FROM dedup
  )
)
SELECT
  modalidad,
  COUNT(*) AS procesos,
  ROUND(AVG(IF(n_ofertas_recibidas > 0, n_ofertas_recibidas, NULL)), 2) AS promedio_ofertas,
  ROUND(COUNTIF(estado_proceso = 'Seleccionado') * 100.0 / COUNT(*), 1) AS pct_adjudicado
FROM norm
GROUP BY modalidad
ORDER BY procesos DESC;
