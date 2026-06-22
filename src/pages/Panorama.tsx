import { SectionHeader } from '../components/SectionHeader';
import KPICard from '../components/charts/KPICard';
import VLineChart from '../components/charts/VLineChart';
import VBarChart from '../components/charts/VBarChart';
import { usePublicData } from '../hooks/usePublicData';
import type { PanoramaData } from '../lib/types';

export default function Panorama() {
  const { data, loading, error } = usePublicData<PanoramaData>('panorama');

  if (loading) return <p style={{ color: 'var(--fg-muted)' }}>Cargando…</p>;
  if (error || !data) return <p style={{ color: 'var(--fg-muted)' }}>No se pudieron cargar los datos.</p>;

  const { kpis, por_anio, top_sectores } = data;

  return (
    <div>
      <SectionHeader
        kicker="Panorama nacional"
        title="¿Qué pasó en la contratación 2022–2026?"
        desc="Cifras agregadas de SECOP II. Describe, no juzga."
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-6)',
        }}
      >
        <KPICard label="Contratos" valor={kpis.contratos} />
        <KPICard label="Valor total" valor={kpis.valor_total} unidad="COP" />
        <KPICard label="Entidades" valor={kpis.entidades} />
        <KPICard label="Contratistas" valor={kpis.contratistas} />
      </div>

      <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: 'var(--space-4)' }}>
        Evolución por año
      </h2>
      <VLineChart data={por_anio} xKey="anio" lines={[{ key: 'valor' }]} />

      <h2
        style={{
          fontFamily: 'var(--font-heading)',
          margin: 'var(--space-6) 0 var(--space-4)',
        }}
      >
        Top sectores por valor
      </h2>
      <VBarChart data={top_sectores} xKey="sector" bars={[{ key: 'valor' }]} layout="horizontal" />
    </div>
  );
}
