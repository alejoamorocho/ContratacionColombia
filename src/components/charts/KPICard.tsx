import { memo } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import Card from '../ui/Card';
import { formatCOP, formatNumber } from '../../lib/formatters';

/** Props del componente KPICard. */
interface KPICardProps {
  /** Etiqueta descriptiva del KPI. */
  label: string;
  /** Valor numerico o textual a mostrar. */
  valor: number | string;
  /** Unidad del valor: 'COP' para pesos colombianos, '%' para porcentaje. */
  unidad?: string;
  /** Porcentaje de cambio respecto al periodo anterior. Positivo = aumento, negativo = disminucion. */
  tendencia?: number;
  /** Color personalizado para el valor. */
  color?: string;
  /** Si true, tendencia positiva es buena (verde); si false/omitido, positiva es mala (rojo). */
  invertTrend?: boolean;
}

/**
 * Tarjeta de KPI que muestra un indicador clave con formato automatico
 * segun la unidad (COP, %, numerico) e indicador de tendencia con icono.
 * @param props.label - Etiqueta del KPI
 * @param props.valor - Valor a mostrar
 * @param props.unidad - Unidad para formateo automatico
 * @param props.tendencia - Porcentaje de cambio
 * @param props.color - Color del valor
 */
function KPICard({ label, valor, unidad, tendencia, color, invertTrend }: KPICardProps) {
  const formatValor = () => {
    if (typeof valor === 'string') return valor;
    if (!isFinite(valor)) return '—';
    if (unidad === 'COP') return formatCOP(valor);
    if (unidad === '%') return `${valor.toLocaleString('es-CO', { maximumFractionDigits: 1 })}%`;
    return formatNumber(valor);
  };

  return (
    <Card variant="glow" style={{ minWidth: 150, flex: '1 1 150px', position: 'relative', overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: 3,
          background: 'var(--brand)',
        }}
      />
      <p style={{ color: 'var(--fg-muted)', fontSize: 12, margin: '0 0 8px' }}>{label}</p>
      <p
        style={{
          fontSize: 24,
          fontWeight: 700,
          fontFamily: 'var(--font-mono)',
          color: color || 'var(--fg-default)',
          margin: 0,
          lineHeight: 1.1,
        }}
      >
        {formatValor()}
      </p>
      {tendencia !== undefined && tendencia !== 0 && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            marginTop: 8,
            fontSize: 12,
            color: invertTrend
              ? (tendencia > 0 ? '#3fb950' : 'var(--risk-critical)')
              : (tendencia > 0 ? 'var(--risk-critical)' : '#3fb950'),
          }}
        >
          {tendencia > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {Math.abs(tendencia)}%
        </span>
      )}
    </Card>
  );
}

export default memo(KPICard);
