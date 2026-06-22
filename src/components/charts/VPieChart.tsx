import { memo, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { chartPalette, tooltipStyle, truncateLabel } from '../../lib/chartTheme';
import { formatNumber } from '../../lib/formatters';

/** Props del componente VPieChart. */
interface VPieChartProps {
  /** Datos a graficar. Cada objeto debe contener nameKey y valueKey. */
  data: Record<string, unknown>[];
  /** Clave del campo para los nombres/etiquetas de cada sector. */
  nameKey: string;
  /** Clave del campo para los valores numericos de cada sector. */
  valueKey: string;
  /** Paleta de colores personalizada. Si se omite se usa chartPalette. */
  colors?: string[];
  /** Altura del grafico en pixeles. Por defecto 280. */
  height?: number;
}

/**
 * Grafico de dona (donut) con leyenda interactiva para datasets grandes (>5 items).
 * Incluye highlight al hacer hover sobre la leyenda y etiquetas con porcentaje.
 * @param props.data - Datos a graficar
 * @param props.nameKey - Clave de nombres
 * @param props.valueKey - Clave de valores
 * @param props.colors - Paleta de colores opcional
 * @param props.height - Altura del grafico
 */
function VPieChart({ data, nameKey, valueKey, colors, height = 280 }: VPieChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (!data?.length) return (
    <div style={{ padding: 24, textAlign: 'center', color: 'var(--fg-subtle)', fontSize: 13 }}>
      Sin datos disponibles
    </div>
  );

  const palette = colors || chartPalette;
  const showLegend = data.length > 5;
  const total = data.reduce((sum: number, d: Record<string, unknown>) => sum + (Number(d[valueKey]) || 0), 0);

  return (
    <div>
      <ResponsiveContainer width="100%" height={showLegend ? height - 60 : height}>
        <PieChart>
          <Pie
            data={data}
            dataKey={valueKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            innerRadius="55%"
            outerRadius={showLegend ? '75%' : '80%'}
            paddingAngle={2}
            strokeWidth={0}
            label={
              showLegend
                ? false
                : ({ name, percent }) =>
                    `${truncateLabel(String(name))} ${((percent ?? 0) * 100).toFixed(0)}%`
            }
            labelLine={showLegend ? false : { stroke: 'var(--fg-muted)' }}
            style={{ fontSize: 11, fill: 'var(--fg-muted)' }}
          >
            {data.map((_: Record<string, unknown>, i: number) => (
              <Cell
                key={i}
                fill={palette[i % palette.length]}
                fillOpacity={activeIndex !== null && activeIndex !== i ? 0.3 : 1}
                style={{ transition: 'fill-opacity 0.2s' }}
              />
            ))}
          </Pie>
          <Tooltip {...tooltipStyle} formatter={(value) => typeof value === 'number' ? formatNumber(value) : String(value ?? '')} />
        </PieChart>
      </ResponsiveContainer>

      {showLegend && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px 12px',
            justifyContent: 'center',
            paddingTop: 4,
          }}
        >
          {data.map((d: Record<string, unknown>, i: number) => {
            const val = Number(d[valueKey]) || 0;
            const pct = total > 0 ? ((val / total) * 100).toFixed(0) : '0';
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 10,
                  color: 'var(--fg-muted)',
                  cursor: 'pointer',
                  opacity: activeIndex !== null && activeIndex !== i ? 0.5 : 1,
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 2,
                    background: palette[i % palette.length],
                    flexShrink: 0,
                  }}
                />
                <span>
                  {truncateLabel(String(d[nameKey]))}{' '}
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default memo(VPieChart);
