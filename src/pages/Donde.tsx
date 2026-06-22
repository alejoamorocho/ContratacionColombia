import { SectionHeader } from '../components/SectionHeader';
import MapaColombia from '../components/MapaColombia';
import VBarChart from '../components/charts/VBarChart';
import { usePublicData } from '../hooks/usePublicData';
import type { DondeData } from '../lib/types';

export default function Donde() {
  const { data, loading, error } = usePublicData<DondeData>('donde');

  if (loading) return <p style={{ color: 'var(--fg-muted)' }}>Cargando…</p>;
  if (error || !data) return <p style={{ color: 'var(--fg-muted)' }}>No se pudieron cargar los datos.</p>;

  const topValor = [...data.por_departamento].sort((a, b) => b.valor - a.valor).slice(0, 15);

  return (
    <div>
      <SectionHeader
        kicker="Distribución territorial"
        title="¿Dónde se contrata?"
        desc="Valor y número de contratos por departamento (2022–2026)."
      />

      <MapaColombia departamentos={data.por_departamento} />

      <h2 style={{ fontFamily: 'var(--font-heading)', marginTop: 'var(--space-6)' }}>
        Top departamentos por valor
      </h2>
      <VBarChart
        data={topValor}
        xKey="departamento"
        bars={[{ key: 'valor' }]}
        layout="horizontal"
        height={480}
      />
    </div>
  );
}
