import { SectionHeader } from '../components/SectionHeader';
import VBarChart from '../components/charts/VBarChart';
import { usePublicData } from '../hooks/usePublicData';
import type { QuienData } from '../lib/types';

export default function Quien() {
  const { data, loading, error } = usePublicData<QuienData>('quien');

  if (loading) return <p style={{ color: 'var(--fg-muted)' }}>Cargando…</p>;
  if (error || !data) return <p style={{ color: 'var(--fg-muted)' }}>No se pudieron cargar los datos.</p>;

  const h2Style: React.CSSProperties = {
    fontFamily: 'var(--font-heading)',
    margin: '0 0 var(--space-3)',
  };
  const blockStyle: React.CSSProperties = {
    marginBottom: 'var(--space-6)',
  };

  return (
    <div>
      <SectionHeader
        kicker="Quién contrata"
        title="¿Quiénes reciben la contratación?"
        desc="Entidades contratantes por valor y volumen (2022–2026)."
      />

      <section style={blockStyle}>
        <h2 style={h2Style}>Top entidades por valor</h2>
        <VBarChart
          data={data.top_entidades.slice(0, 15)}
          xKey="nombre"
          bars={[{ key: 'valor' }]}
          layout="horizontal"
          height={480}
        />
      </section>

      <section style={blockStyle}>
        <h2 style={h2Style}>Por nivel de gobierno</h2>
        <VBarChart
          data={data.por_nivel}
          xKey="nivel"
          bars={[{ key: 'valor' }]}
        />
      </section>

      <section style={blockStyle}>
        <h2 style={h2Style}>Por sector</h2>
        <VBarChart
          data={data.por_sector.slice(0, 15)}
          xKey="sector"
          bars={[{ key: 'valor' }]}
          layout="horizontal"
          height={420}
        />
      </section>
    </div>
  );
}
