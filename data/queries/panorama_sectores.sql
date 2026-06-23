-- Panorama: top categorías de objeto por valor. Usa la etiqueta legible
-- normalizada en la base (`objeto_label`), igual que quien_sector.sql, para que
-- la portada y "¿Quién contrata?" muestren EXACTAMENTE las mismas etiquetas
-- limpias (con tildes). N mínimo 20; top 12 por valor.
SELECT
  objeto_label AS sector,
  COUNT(*) AS contratos,
  SUM(valor) AS valor
FROM `{p}.{d}.contratos`
WHERE fecha_firma BETWEEN '2022-01-01' AND '2026-12-31'
  AND valor IS NOT NULL AND valor > 0
  -- 'Sin clasificar' es AUSENCIA de categoría temática, no un sector: se excluye
  -- del ranking para que no compita visualmente con Construcción, Salud, etc.
  AND objeto_label != 'Sin clasificar'
GROUP BY objeto_label
HAVING contratos >= 20
ORDER BY valor DESC
LIMIT 12;
