import { useParams, Navigate } from 'react-router-dom';
import { PageShell } from '../components/PageShell';
import { MethodologyNote } from '../components/MethodologyNote';
import KPICard from '../components/charts/KPICard';
import VBarChart from '../components/charts/VBarChart';
import VLineChart from '../components/charts/VLineChart';
import { usePublicData } from '../hooks/usePublicData';
import { ANALISIS } from '../lib/analisis';
import type { AnalisisData } from '../lib/types';

const OVERLINE: Record<string, string> = {
  who: '// ¿Quién contrata?',
  how: '// ¿Cómo contrata?',
  where: '// ¿Dónde?',
};

/** Página genérica de una sección analítica (KPIs + un desglose), dirigida por config. */
export default function Analisis() {
  const { key = '' } = useParams();
  const cfg = ANALISIS[key];
  const { data, loading, error } = usePublicData<AnalisisData>('analisis');

  if (!cfg) return <Navigate to="/" replace />;
  if (loading) return <p style={{ color: 'var(--fg-muted)' }}>Cargando…</p>;
  if (error || !data) return <p style={{ color: 'var(--fg-muted)' }}>No se pudieron cargar los datos.</p>;

  const item = data.items[key] ?? { kpis: {}, serie: [] };
  const chart = cfg.chart;

  return (
    <PageShell
      tone={cfg.tone}
      overline={OVERLINE[cfg.tone] ?? '// Análisis'}
      question={cfg.pregunta}
      context={cfg.contexto}
      callout={<span>{cfg.callout}</span>}
      methodology={<MethodologyNote>{cfg.nota}</MethodologyNote>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 'var(--space-4)' }}>
        {cfg.kpis.map((k) => (
          <KPICard key={k.metric} label={k.label} valor={item.kpis[k.metric] ?? 0} unidad={k.unidad} />
        ))}
      </div>

      {chart && item.serie.length > 0 && (
        <>
          <h2 style={{ fontFamily: 'var(--font-heading)', margin: 'var(--space-6) 0 var(--space-3)' }}>{chart.titulo}</h2>
          {chart.tipo === 'line' ? (
            <VLineChart data={item.serie} xKey={chart.xKey} lines={chart.series.map((s) => ({ key: s.key, color: s.color }))} />
          ) : (
            <VBarChart
              data={item.serie}
              xKey={chart.xKey}
              bars={chart.series.map((s) => ({ key: s.key, color: s.color }))}
              layout={chart.layout ?? 'vertical'}
              height={chart.layout === 'horizontal' ? 420 : 300}
            />
          )}
        </>
      )}
    </PageShell>
  );
}
