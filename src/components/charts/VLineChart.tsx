import { memo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { axisStyle, chartPalette, tooltipStyle } from '../../lib/chartTheme';
import { formatNumber } from '../../lib/formatters';

/** Month abbreviations in Spanish. */
const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

/**
 * Format a date-like string (e.g. "2026-01", "2026-01-15") to "Ene 2026".
 * Falls back to the raw value if parsing fails.
 */
function formatDateLabel(value: string): string {
  if (!value) return '';
  // Try "YYYY-MM" or "YYYY-MM-DD"
  const match = String(value).match(/^(\d{4})-(\d{1,2})/);
  if (match) {
    const year = match[1];
    const monthIdx = parseInt(match[2], 10) - 1;
    if (monthIdx >= 0 && monthIdx < 12) {
      return `${MESES_CORTOS[monthIdx]} ${year}`;
    }
  }
  return String(value);
}

/** Definicion de una linea/area en el grafico. */
interface LineDef {
  /** Clave del campo de datos para esta linea. */
  key: string;
  /** Color personalizado de la linea. Si se omite se usa la paleta por defecto. */
  color?: string;
}

/** Props del componente VLineChart. */
interface VLineChartProps {
  /** Datos a graficar. Cada objeto debe contener las claves definidas en lines y xKey. */
  data: Record<string, unknown>[];
  /** Clave del eje X (campo de fecha, periodo, etc.). */
  xKey: string;
  /** Definiciones de las lineas/areas a dibujar. */
  lines: LineDef[];
  /** Altura del grafico en pixeles. Por defecto 300. */
  height?: number;
}

/**
 * Grafico de lineas con areas de gradiente. Soporta multiples series
 * superpuestas con colores de la paleta del tema.
 * @param props.data - Datos a graficar
 * @param props.xKey - Clave del eje X
 * @param props.lines - Definiciones de las series
 * @param props.height - Altura del grafico
 */
function VLineChart({ data, xKey, lines, height = 300 }: VLineChartProps) {
  if (!data?.length) return (
    <div style={{ padding: 24, textAlign: 'center', color: 'var(--fg-subtle)', fontSize: 13 }}>
      Sin datos disponibles
    </div>
  );

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
        <defs>
          {lines.map((l, i) => {
            const color = l.color || chartPalette[i % chartPalette.length];
            return (
              <linearGradient key={l.key} id={`grad-${l.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            );
          })}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-muted)" />
        <XAxis dataKey={xKey} {...axisStyle} tickFormatter={(v: string) => formatDateLabel(v)} />
        <YAxis {...axisStyle} tickFormatter={(value: number) => formatNumber(value)} />
        <Tooltip
          {...tooltipStyle}
          labelFormatter={(label: unknown) => formatDateLabel(String(label ?? ''))}
          formatter={(value: unknown) => typeof value === 'number' ? formatNumber(value) : String(value ?? '')}
          cursor={{ stroke: '#8b949e', strokeWidth: 1, strokeDasharray: '4 4' }}
        />
        {lines.length > 1 && (
          <Legend
            wrapperStyle={{ color: '#8b949e', fontSize: 12, paddingTop: 4 }}
            iconType="line"
            iconSize={14}
          />
        )}
        {lines.map((l, i) => {
          const color = l.color || chartPalette[i % chartPalette.length];
          return (
            <Area
              key={l.key}
              type="monotone"
              dataKey={l.key}
              stroke={color}
              strokeWidth={2}
              fill={`url(#grad-${l.key})`}
              dot={false}
              activeDot={{ r: 4, fill: color, stroke: 'var(--bg-canvas)' }}
            />
          );
        })}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default memo(VLineChart);
