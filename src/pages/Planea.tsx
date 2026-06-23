import { PageShell } from '../components/PageShell';
import { MethodologyNote } from '../components/MethodologyNote';
import KPICard from '../components/charts/KPICard';
import VBarChart from '../components/charts/VBarChart';
import VPieChart from '../components/charts/VPieChart';
import { usePublicData } from '../hooks/usePublicData';
import { formatCOP } from '../lib/formatters';
import type { PlaneacionData, KpisExtra } from '../lib/types';

export default function Planea() {
  const { data, loading, error } = usePublicData<PlaneacionData>('planeacion');
  const { data: extra } = usePublicData<KpisExtra>('kpis_extra');

  if (loading) return <p style={{ color: 'var(--fg-muted)' }}>Cargando…</p>;
  if (error || !data) return <p style={{ color: 'var(--fg-muted)' }}>No se pudieron cargar los datos.</p>;

  const { kpis } = data;
  const origen = extra?.items.paa_origen ?? [];
  const fidelidad = extra?.items.fidelidad_paa ?? [];

  return (
    <PageShell
      tone="plan"
      overline="// ¿Qué se planea?"
      question="¿Qué planea comprar el Estado?"
      context="El Plan Anual de Adquisiciones (PAA): lo que las entidades declaran que piensan contratar. Cobertura 2024–2026."
      callout={
        <>
          {kpis.entidades.toLocaleString('es-CO')} entidades han publicado su PAA, con{' '}
          {kpis.items.toLocaleString('es-CO')} ítems que suman {formatCOP(kpis.valor_planeado)} en
          intenciones de compra. Es una declaración previa, no un compromiso de contratación.
        </>
      }
      methodology={
        <MethodologyNote>
          PAA deduplicado a la última versión por entidad-año; las categorías se derivan del segmento
          UNSPSC del ítem; "Otras" incluye ítems sin modalidad declarada; solo existe PAA para 2024–2026.
        </MethodologyNote>
      }
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
          gap: 'var(--space-4)',
        }}
      >
        <KPICard label="Ítems planeados" valor={kpis.items} />
        <KPICard label="Valor planeado" valor={kpis.valor_planeado} unidad="COP" />
        <KPICard label="Entidades con PAA" valor={kpis.entidades} />
      </div>

      <h2 style={{ fontFamily: 'var(--font-heading)', margin: 'var(--space-6) 0 var(--space-3)' }}>
        Valor planeado por año
      </h2>
      <VBarChart
        data={data.por_anio}
        xKey="anio"
        bars={[{ key: 'valor', color: 'var(--shell-tone)' }]}
      />

      <h2 style={{ fontFamily: 'var(--font-heading)', margin: 'var(--space-6) 0 var(--space-3)' }}>
        Top categorías (UNSPSC)
      </h2>
      <VBarChart
        data={data.top_categorias.slice(0, 12)}
        xKey="categoria"
        bars={[{ key: 'valor' }]}
        layout="horizontal"
        height={420}
      />

      <h2 style={{ fontFamily: 'var(--font-heading)', margin: 'var(--space-6) 0 var(--space-3)' }}>
        Por modalidad prevista
      </h2>
      <VPieChart data={data.por_modalidad} nameKey="modalidad" valueKey="valor" />

      {origen.length > 0 && (
        <>
          <h2 style={{ fontFamily: 'var(--font-heading)', margin: 'var(--space-6) 0 var(--space-3)' }}>
            Por origen de los recursos
          </h2>
          <VBarChart data={origen} xKey="origen" bars={[{ key: 'valor' }]} layout="horizontal" height={300} />
          <p style={{ color: 'var(--fg-subtle)', fontSize: 12, lineHeight: 1.5, margin: 'var(--space-2) 0 var(--space-4)' }}>
            Con qué bolsa pública se planea comprar (lado «planeado» de la financiación). Regalías
            concentra mucho valor en pocos ítems (alto valor unitario). «Sin especificar» = ítems sin
            origen declarado.
          </p>
        </>
      )}

      {fidelidad.length > 0 && (
        <>
          <h2 style={{ fontFamily: 'var(--font-heading)', margin: 'var(--space-6) 0 var(--space-3)' }}>
            Fidelidad del plan: ítems con un proceso ya enlazado
          </h2>
          <VBarChart data={fidelidad} xKey="anio" bars={[{ key: 'pct', color: 'var(--shell-tone)' }]} />
          <p style={{ color: 'var(--fg-subtle)', fontSize: 12, lineHeight: 1.5, margin: 'var(--space-2) 0 var(--space-4)' }}>
            Porcentaje de ítems del PAA que ya traen enlazado un proceso de contratación real
            (<code>procesos_relacionados</code>). Baja con la cercanía del año: los planes más antiguos
            han tenido más tiempo de materializarse, por eso 2026 sale bajo. Es un proxy de
            materialización, no prueba de ejecución: un ítem sin enlace puede deberse a rezago al
            diligenciar, no a incumplimiento.
          </p>
        </>
      )}
    </PageShell>
  );
}
