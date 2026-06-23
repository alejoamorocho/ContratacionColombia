import { useParams, Navigate } from 'react-router-dom';
import { PageShell } from '../components/PageShell';
import { MethodologyNote } from '../components/MethodologyNote';
import KPICard from '../components/charts/KPICard';
import { usePublicData } from '../hooks/usePublicData';
import { SENALES } from '../lib/senales';
import type { SenalesExtra, PanoramaData } from '../lib/types';
import { formatCompact, formatNumber } from '../lib/formatters';

const OVERLINE: Record<string, string> = {
  how: '// ¿Cómo contrata?',
  signal: '// ¿Hay señales?',
};

/** Barra de proporción: qué fracción del universo nacional representa la señal. */
function ProportionBar({ label, pct, detalle }: { label: string; pct: number; detalle: string }) {
  const w = Math.max(Math.min(pct, 100), 0.4);
  return (
    <div style={{ margin: 'var(--space-4) 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
        <span style={{ color: 'var(--fg-muted)' }}>{label}</span>
        <span style={{ color: 'var(--shell-tone)', fontWeight: 600 }}>
          {pct < 0.1 ? '<0,1' : pct.toFixed(pct < 1 ? 2 : 1)}% del total
        </span>
      </div>
      <div style={{ height: 12, borderRadius: 6, background: 'var(--bg-subtle)', overflow: 'hidden', border: '1px solid var(--border-muted)' }}>
        <div style={{ height: '100%', width: `${w}%`, background: 'var(--shell-tone)' }} />
      </div>
      <p style={{ fontSize: 12, color: 'var(--fg-subtle)', margin: '6px 0 0' }}>{detalle}</p>
    </div>
  );
}

/** Página genérica de una "señal" (cruce/indicador agregado), dirigida por config. */
export default function Senal() {
  const { key = '' } = useParams();
  const cfg = SENALES[key];
  const { data, loading, error } = usePublicData<SenalesExtra>('senales_extra');
  const pan = usePublicData<PanoramaData>('panorama').data;

  if (!cfg) return <Navigate to="/" replace />;
  if (loading) return <p style={{ color: 'var(--fg-muted)' }}>Cargando…</p>;
  if (error || !data) return <p style={{ color: 'var(--fg-muted)' }}>No se pudieron cargar los datos.</p>;

  const item = data.items[key] ?? {};
  // brechas_bpin.valor es la brecha de BPIN (no valor de contratos): no se compara
  // contra el universo de contratación.
  const esBpin = key === 'brechas_bpin';
  const bars: { label: string; pct: number; detalle: string }[] = [];
  if (pan) {
    if (typeof item.contratos === 'number' && item.contratos > 0 && pan.kpis.contratos > 0) {
      bars.push({
        label: 'Número de contratos',
        pct: (item.contratos * 100) / pan.kpis.contratos,
        detalle: `${formatNumber(item.contratos)} de ${formatNumber(pan.kpis.contratos)} contratos firmados en el país (2022–2026).`,
      });
    }
    if (typeof item.valor === 'number' && item.valor > 0 && !esBpin && pan.kpis.valor_total > 0) {
      bars.push({
        label: 'Valor de estos contratos',
        pct: (item.valor * 100) / pan.kpis.valor_total,
        detalle: `${formatCompact(item.valor)} de ${formatCompact(pan.kpis.valor_total)} contratados en el país.`,
      });
    }
  }

  return (
    <PageShell
      tone={cfg.tone}
      overline={OVERLINE[cfg.tone] ?? '// Señal'}
      question={cfg.pregunta}
      context={cfg.contexto}
      callout={<span>{cfg.callout}</span>}
      methodology={<MethodologyNote>{cfg.nota}</MethodologyNote>}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
          gap: 'var(--space-4)',
        }}
      >
        {cfg.kpis.map((k) => (
          <KPICard key={k.metric} label={k.label} valor={item[k.metric] ?? 0} unidad={k.unidad} />
        ))}
      </div>

      {bars.length > 0 && (
        <div style={{ marginTop: 'var(--space-6)' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', margin: '0 0 var(--space-2)' }}>Magnitud en contexto</h2>
          <p style={{ color: 'var(--fg-muted)', fontSize: 13, lineHeight: 1.6, margin: '0 0 var(--space-3)', maxWidth: '70ch' }}>
            Para dimensionar la señal: qué porción del total nacional de contratación 2022–2026 representa.
            Una porción pequeña suele ser lo esperable; el dato describe, no juzga.
          </p>
          {bars.map((b) => (
            <ProportionBar key={b.label} {...b} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
