import { PageShell } from '../components/PageShell';
import { MethodologyNote } from '../components/MethodologyNote';
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
    <PageShell
      tone="where"
      overline="// ¿Dónde?"
      question="¿Cómo se distribuye territorialmente la contratación?"
      context="El color del mapa representa el NÚMERO de contratos por departamento (2022–2026); el valor total aparece en el tooltip y en las barras de abajo. No es un juicio de riesgo: la concentración en las grandes ciudades refleja dónde están las entidades contratantes."
      methodology={
        <MethodologyNote>
          El departamento sale de <code>entidad_departamento</code>, normalizado a
          código DANE (insensible a tildes y mayúsculas). Incluye los contratos con
          departamento identificable (~95 % del total); el resto no reporta un
          departamento reconocible en la fuente y no se mapea.
        </MethodologyNote>
      }
    >
      <MapaColombia departamentos={data.por_departamento} />

      <p style={{ color: 'var(--fg-muted)', fontSize: 13, marginTop: 'var(--space-3)' }}>
        Incluye los contratos con departamento identificable (~95 % del total).
      </p>

      <h2 style={{ fontFamily: 'var(--font-heading)', marginTop: 'var(--space-6)' }}>
        Top departamentos por valor
      </h2>
      <VBarChart data={topValor} xKey="departamento" bars={[{ key: 'valor' }]} layout="horizontal" height={480} />
    </PageShell>
  );
}
