import { PageShell } from '../components/PageShell';
import { MethodologyNote } from '../components/MethodologyNote';
import MapaColombia from '../components/MapaColombia';
import VBarChart from '../components/charts/VBarChart';
import { usePublicData } from '../hooks/usePublicData';
import type { DondeData, KpisExtra } from '../lib/types';

export default function Donde() {
  const { data, loading, error } = usePublicData<DondeData>('donde');
  const { data: extra } = usePublicData<KpisExtra>('kpis_extra');

  if (loading) return <p style={{ color: 'var(--fg-muted)' }}>Cargando…</p>;
  if (error || !data) return <p style={{ color: 'var(--fg-muted)' }}>No se pudieron cargar los datos.</p>;

  const topValor = [...data.por_departamento].sort((a, b) => b.valor - a.valor).slice(0, 15);
  const percapita = extra?.items.percapita ?? [];

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

      {percapita.length > 0 && (
        <>
          <h2 style={{ fontFamily: 'var(--font-heading)', marginTop: 'var(--space-6)' }}>
            Contratación per cápita por departamento
          </h2>
          <VBarChart data={percapita.slice(0, 15)} xKey="departamento" bars={[{ key: 'valor_per_capita', color: 'var(--shell-tone)' }]} layout="horizontal" height={420} />
          <p style={{ color: 'var(--fg-subtle)', fontSize: 12, lineHeight: 1.5, margin: 'var(--space-2) 0 var(--space-4)', maxWidth: '76ch' }}>
            Valor contratado por habitante (población: proyección DANE 2023, catálogo estático citado
            para reproducibilidad). Reordena la lectura: deja de dominar solo el tamaño absoluto. Es
            población del departamento de la <strong>entidad contratante</strong>, no del lugar de
            ejecución; Bogotá se infla por concentrar entidades del orden nacional.
          </p>
        </>
      )}
    </PageShell>
  );
}
