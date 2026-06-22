import { useMemo, useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';
import { formatCOP } from '../lib/formatters';
import type { DondeData } from '../lib/types';

/** Fila de departamento (shape del snapshot público `donde.json`). */
type DeptoFila = DondeData['por_departamento'][number];

/** Props del componente MapaColombia. */
interface MapaColombiaProps {
  /** Datos por departamento del snapshot público (`{dane, departamento, valor, contratos}`). */
  departamentos: DeptoFila[];
  /** Callback al hacer clic en un departamento. Recibe código DANE y nombre. */
  onDepartamentoClick?: (codigo: string, nombre: string) => void;
  /** Código DANE del departamento activo/seleccionado para resaltarlo. */
  departamentoActivo?: string;
}

const GEO_URL = '/colombia-departments.json';

/** Sequential blue palette from lightest to darkest (7 buckets). */
const BLUE_PALETTE = [
  '#1b2a4a', // very low
  '#1a3a5c', // low
  '#1a5276', // medium-low
  '#2171b5', // medium
  '#4292c6', // medium-high
  '#6baed6', // high
  '#9ecae1', // very high
];

/** Compute quantile-based color for contract count. */
function contractCountToColor(count: number, quantiles: number[]): string {
  if (count <= 0) return 'var(--bg-subtle)';
  for (let i = 0; i < quantiles.length; i++) {
    if (count <= quantiles[i]) return BLUE_PALETTE[i];
  }
  return BLUE_PALETTE[BLUE_PALETTE.length - 1];
}

/** Compute quantile thresholds from an array of values. */
function computeQuantiles(values: number[], nBuckets: number): number[] {
  const sorted = [...values].filter((v) => v > 0).sort((a, b) => a - b);
  if (sorted.length === 0) return [];
  const thresholds: number[] = [];
  for (let i = 1; i <= nBuckets; i++) {
    const idx = Math.min(Math.floor((i / nBuckets) * sorted.length), sorted.length - 1);
    thresholds.push(sorted[idx]);
  }
  return thresholds;
}

function getTooltipPosition(x: number, y: number) {
  const tooltipW = 200;
  const tooltipH = 60;
  let left = x + 12;
  let top = y - 10;
  if (left + tooltipW > window.innerWidth) left = x - tooltipW - 12;
  if (top < 0) top = y + 20;
  if (top + tooltipH > window.innerHeight) top = y - tooltipH - 10;
  return { left, top };
}

/**
 * Mapa coroplético de Colombia. Colorea cada departamento por número de
 * contratos (escala secuencial azul por cuantiles) y muestra un tooltip con
 * valor y contratos. Componente de presentación puro: recibe los datos por
 * props (sin llamadas externas), haciendo match por código DANE con
 * `DPTO_CCDGO` del GeoJSON.
 * @param props.departamentos - Datos por departamento del snapshot público
 * @param props.onDepartamentoClick - Callback al hacer clic en departamento
 * @param props.departamentoActivo - Departamento seleccionado
 */
export function MapaColombia({
  departamentos,
  onDepartamentoClick,
  departamentoActivo,
}: MapaColombiaProps) {
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    depto: DeptoFila | null;
    nombre: string;
  } | null>(null);

  const deptoMap = useMemo(() => {
    const m = new Map<string, DeptoFila>();
    departamentos.forEach((d) => m.set(d.dane, d));
    return m;
  }, [departamentos]);

  const quantiles = useMemo(
    () => computeQuantiles(departamentos.map((d) => d.contratos), BLUE_PALETTE.length),
    [departamentos],
  );

  const tooltipPos = tooltip ? getTooltipPosition(tooltip.x, tooltip.y) : null;

  return (
    <div style={{ position: 'relative', width: '100%', height: 520 }}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          center: [-73, 4],
          scale: 2200,
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const code: string =
                  geo.properties.DPTO_CCDGO || geo.properties.DPTO || geo.properties.codigo_dane;
                const depto = deptoMap.get(code);
                const isActive = departamentoActivo === code;
                const isDimmed = departamentoActivo && !isActive;
                const geoNombre: string =
                  geo.properties.DPTO_CNMBR || geo.properties.NOMBRE_DPT || geo.properties.name || code;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => {
                      const nombre = depto?.departamento || geoNombre;
                      onDepartamentoClick?.(code, nombre);
                    }}
                    onMouseEnter={(e) => {
                      setTooltip({
                        x: e.clientX,
                        y: e.clientY,
                        depto: depto || null,
                        nombre: depto?.departamento || geoNombre,
                      });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    style={{
                      default: {
                        fill: depto
                          ? contractCountToColor(depto.contratos, quantiles)
                          : 'var(--bg-subtle)',
                        fillOpacity: isDimmed ? 0.4 : 1,
                        stroke: isActive ? 'var(--accent)' : 'var(--border-default)',
                        strokeWidth: isActive ? 1.5 : 0.5,
                        cursor: 'pointer',
                        transition: 'fill 0.2s ease, fill-opacity 0.2s ease',
                        outline: 'none',
                      },
                      hover: {
                        fill: depto
                          ? contractCountToColor(depto.contratos, quantiles)
                          : 'var(--bg-subtle)',
                        fillOpacity: 1,
                        stroke: 'var(--accent)',
                        strokeWidth: 1.5,
                        cursor: 'pointer',
                        outline: 'none',
                      },
                      pressed: {
                        fill: depto
                          ? contractCountToColor(depto.contratos, quantiles)
                          : 'var(--bg-subtle)',
                        stroke: 'var(--accent)',
                        strokeWidth: 2,
                        outline: 'none',
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {tooltip && tooltipPos && (
        <div
          style={{
            position: 'fixed',
            left: tooltipPos.left,
            top: tooltipPos.top,
            background: 'var(--bg-overlay)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius)',
            padding: '8px 12px',
            fontSize: 12,
            zIndex: 1000,
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{tooltip.nombre}</div>
          {tooltip.depto ? (
            <div style={{ color: 'var(--fg-muted)' }}>
              {tooltip.depto.contratos.toLocaleString('es-CO')} contratos
              <br />
              Valor total: {formatCOP(tooltip.depto.valor)}
            </div>
          ) : (
            <div style={{ color: 'var(--fg-subtle)' }}>Sin datos disponibles</div>
          )}
        </div>
      )}

      {/* Leyenda */}
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          background: 'var(--bg-overlay)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius)',
          padding: '8px 12px',
          fontSize: 11,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--fg-muted)' }}>
          N.° de contratos
        </div>
        {quantiles.length > 0
          ? (() => {
              const labels: { label: string; color: string }[] = [];
              let prev = 0;
              for (let i = 0; i < quantiles.length; i++) {
                const lo = prev + 1;
                const hi = quantiles[i];
                if (lo > hi) continue;
                labels.push({
                  label: `${lo.toLocaleString('es-CO')} – ${hi.toLocaleString('es-CO')}`,
                  color: BLUE_PALETTE[i],
                });
                prev = hi;
              }
              labels.push({ label: 'Sin datos', color: 'var(--bg-subtle)' });
              return labels;
            })().map((item) => (
              <div
                key={item.label}
                style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}
              >
                <div
                  style={{ width: 12, height: 12, borderRadius: 2, background: item.color }}
                />
                <span style={{ color: 'var(--fg-muted)' }}>{item.label}</span>
              </div>
            ))
          : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <div style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--bg-subtle)' }} />
              <span style={{ color: 'var(--fg-muted)' }}>Sin datos</span>
            </div>
          )}
      </div>
    </div>
  );
}

export default MapaColombia;
