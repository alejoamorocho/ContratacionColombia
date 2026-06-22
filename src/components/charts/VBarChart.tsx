import { memo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { axisStyle, chartPalette, tooltipStyle, truncateLabel } from '../../lib/chartTheme';
import { formatCOP, formatNumber, formatCompact } from '../../lib/formatters';

/** Definicion de una barra en el grafico. */
interface BarDef {
  /** Clave del campo de datos para esta barra. */
  key: string;
  /** Color personalizado. Si se omite se usa la paleta por defecto. */
  color?: string;
}

/** Props del componente VBarChart. */
interface VBarChartProps {
  /** Datos a graficar. Cada objeto debe contener las claves definidas en bars y xKey. */
  data: Record<string, unknown>[];
  /** Clave del eje de categorias. */
  xKey: string;
  /** Definiciones de las barras a dibujar. */
  bars: BarDef[];
  /** Altura del grafico en pixeles. Por defecto 300. */
  height?: number;
  /** Orientacion: 'horizontal' para barras horizontales, 'vertical' para verticales. Por defecto 'vertical'. */
  layout?: 'horizontal' | 'vertical';
  /** Callback opcional al hacer click en una barra. Recibe el item de datos correspondiente. */
  onBarClick?: (item: Record<string, unknown>) => void;
}

const TICK_MAX = 24;

function TruncatedTick({ x = 0, y = 0, payload = { value: '' } }: { x?: number; y?: number; payload?: { value: unknown } }) {
  const text = String(payload.value || '');
  const truncated = truncateLabel(text, TICK_MAX);
  return (
    <g transform={`translate(${x},${y})`}>
      <title>{text}</title>
      <text
        x={-4}
        y={0}
        dy={4}
        textAnchor="end"
        fill="var(--fg-muted)"
        fontSize={11}
      >
        {truncated}
      </text>
    </g>
  );
}

function AngledTick({ x = 0, y = 0, payload = { value: '' } }: { x?: number; y?: number; payload?: { value: unknown } }) {
  const text = String(payload.value || '');
  const truncated = truncateLabel(text, TICK_MAX);
  return (
    <g transform={`translate(${x},${y})`}>
      <title>{text}</title>
      <text
        x={0}
        y={0}
        dy={8}
        textAnchor="end"
        fill="var(--fg-muted)"
        fontSize={11}
        transform="rotate(-35)"
      >
        {truncated}
      </text>
    </g>
  );
}

/** Detect if a value looks monetary (large number likely COP). */
function smartFormat(value: unknown, name: unknown): string {
  if (typeof value !== 'number') return String(value ?? '');
  const lowerName = String(name ?? '').toLowerCase();
  if (lowerName.includes('valor') || lowerName.includes('precio') || lowerName.includes('cop') || lowerName.includes('monto')) {
    return formatCOP(value);
  }
  return formatNumber(value);
}

/**
 * Grafico de barras configurable con soporte para orientacion horizontal y vertical,
 * multiples series y etiquetas truncadas con tooltip nativo.
 * @param props.data - Datos a graficar
 * @param props.xKey - Clave del eje de categorias
 * @param props.bars - Definiciones de las barras
 * @param props.height - Altura del grafico
 * @param props.layout - Orientacion del grafico
 */
function VBarChart({ data, xKey, bars, height = 300, layout = 'vertical', onBarClick }: VBarChartProps) {
  if (!data?.length) return (
    <div style={{ padding: 24, textAlign: 'center', color: 'var(--fg-subtle)', fontSize: 13 }}>
      Sin datos disponibles
    </div>
  );

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout={layout === 'horizontal' ? 'vertical' : 'horizontal'}
        margin={{ top: 8, right: 16, left: 8, bottom: layout === 'vertical' ? 48 : 24 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-muted)" />
        {layout === 'horizontal' ? (
          <>
            <YAxis
              dataKey={xKey}
              type="category"
              width={186}
              tick={<TruncatedTick />}
            />
            <XAxis type="number" {...axisStyle} tickFormatter={(value: number) => formatCompact(value)} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} tick={<AngledTick />} interval={0} height={60} />
            <YAxis {...axisStyle} width={52} tickFormatter={(value: number) => formatCompact(value)} />
          </>
        )}
        <Tooltip {...tooltipStyle} formatter={(value: unknown, name: unknown) => smartFormat(value, name)} />
        {bars.length > 1 && (
          <Legend
            wrapperStyle={{ color: '#8b949e', fontSize: 12, paddingTop: 4 }}
            iconType="square"
            iconSize={10}
          />
        )}
        {bars.map((b, i) => (
          <Bar
            key={b.key}
            dataKey={b.key}
            fill={b.color || chartPalette[i % chartPalette.length]}
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
            cursor={onBarClick ? 'pointer' : undefined}
            onClick={onBarClick ? (_: unknown, idx: number) => onBarClick(data[idx]) : undefined}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export default memo(VBarChart);
