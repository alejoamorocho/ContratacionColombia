import { useParams, Navigate } from 'react-router-dom';
import { PageShell } from '../components/PageShell';
import { MethodologyNote } from '../components/MethodologyNote';
import KPICard from '../components/charts/KPICard';
import { usePublicData } from '../hooks/usePublicData';
import { SENALES } from '../lib/senales';

const OVERLINE: Record<string, string> = {
  how: '// ¿Cómo contrata?',
  signal: '// ¿Hay señales?',
};

interface SenalesExtra {
  items: Record<string, Record<string, number>>;
}

/** Página genérica de una "señal" (cruce/indicador agregado), dirigida por config. */
export default function Senal() {
  const { key = '' } = useParams();
  const cfg = SENALES[key];
  const { data, loading, error } = usePublicData<SenalesExtra>('senales_extra');

  if (!cfg) return <Navigate to="/" replace />;
  if (loading) return <p style={{ color: 'var(--fg-muted)' }}>Cargando…</p>;
  if (error || !data) return <p style={{ color: 'var(--fg-muted)' }}>No se pudieron cargar los datos.</p>;

  const item = data.items[key] ?? {};

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
    </PageShell>
  );
}
