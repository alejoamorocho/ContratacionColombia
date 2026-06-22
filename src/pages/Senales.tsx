import { usePublicData } from '../hooks/usePublicData';
import { SectionHeader } from '../components/SectionHeader';
import { Badge } from '../components/Badge';
import KPICard from '../components/charts/KPICard';
import VBarChart from '../components/charts/VBarChart';
import type { SenalesData } from '../lib/types';

export default function Senales() {
  const { data, loading, error } = usePublicData<SenalesData>('senales');

  if (loading) return <p style={{ color: 'var(--fg-muted)' }}>Cargando…</p>;
  if (error || !data) return <p style={{ color: 'var(--fg-muted)' }}>No se pudieron cargar los datos.</p>;

  return (
    <div>
      <SectionHeader
        kicker="Estadística descriptiva"
        title="Señales estadísticas"
        desc="Indicadores descriptivos del mercado. NO implican irregularidad ni juicio alguno."
      />

      <div
        style={{
          background: 'var(--bg-overlay)',
          borderRadius: 'var(--radius)',
          padding: 'var(--space-5)',
          marginBottom: 'var(--space-6)',
        }}
      >
        <div style={{ marginBottom: 'var(--space-3)' }}>
          <Badge tone="info">METODOLOGÍA</Badge>
        </div>
        <ul style={{ color: 'var(--fg-muted)', margin: 0, paddingLeft: '1.25em', lineHeight: 1.6 }}>
          {data.notas_metodologicas.map((nota, i) => (
            <li key={i}>{nota}</li>
          ))}
        </ul>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-6)',
        }}
      >
        <KPICard label="Top-10 concentra (valor)" valor={data.concentracion.top10_pct_valor} unidad="%" />
        <KPICard label="% Contratación directa" valor={data.pct_directa_nacional} unidad="%" />
      </div>

      <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: 'var(--space-4)' }}>
        Distribución de valor por percentiles
      </h2>
      <VBarChart data={data.percentiles_valor} xKey="p" bars={[{ key: 'valor' }]} />
    </div>
  );
}
