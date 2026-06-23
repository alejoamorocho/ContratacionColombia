import { PageShell } from '../components/PageShell';
import { MethodologyNote } from '../components/MethodologyNote';
import { usePublicData } from '../hooks/usePublicData';
import KPICard from '../components/charts/KPICard';
import VLineChart from '../components/charts/VLineChart';
import ChartFootnote from '../components/charts/ChartFootnote';
import type { EjecucionData } from '../lib/types';

/**
 * ¿Se ejecuta? — compara valor contratado vs facturado vs pagado (SECOP II).
 * Los porcentajes son cotas inferiores por subreporte de la fuente.
 */
export default function Ejecuta() {
  const { data, loading, error } = usePublicData<EjecucionData>('ejecucion');

  if (loading) return <p style={{ color: 'var(--fg-muted)' }}>Cargando…</p>;
  if (error || !data) return <p style={{ color: 'var(--fg-muted)' }}>No se pudieron cargar los datos.</p>;

  const { kpis, por_anio } = data;

  return (
    <PageShell
      tone="exec"
      overline="// ¿Se ejecuta?"
      question="¿Se ejecuta lo que se contrata?"
      context="Compara el valor contratado con lo que se factura y se paga, según SECOP II. Solo parte de los contratos reportan facturación/pago, así que los porcentajes son cotas inferiores."
      callout={
        <>
          De cada 100 pesos contratados, solo <strong>{kpis.pct_pagado}%</strong> se reporta pagado en la
          fuente; la diferencia incluye contratos en ejecución y subreporte.
        </>
      }
      methodology={
        <MethodologyNote>
          Los campos valor_facturado y valor_pagado provienen de SECOP II y solo están poblados en una
          parte de los contratos (cobertura reportada: {kpis.cobertura_factura}% facturado, {kpis.cobertura_pago}% pagado);
          por eso los porcentajes son cotas inferiores debidas al subreporte, no necesariamente baja ejecución.
          El «% pagado» es un ratio por valor (suma pagada / suma contratada) que mezcla no-ejecución,
          subreporte y contratos recién firmados que aún no completan su ciclo de pago.
        </MethodologyNote>
      }
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        <KPICard label="Contratado" valor={kpis.contratado} unidad="COP" />
        <KPICard label="Facturado" valor={kpis.facturado} unidad="COP" />
        <KPICard label="Pagado" valor={kpis.pagado} unidad="COP" />
        <KPICard label="% pagado" valor={kpis.pct_pagado} unidad="%" />
      </div>

      <h2 style={{ fontFamily: 'var(--font-heading)', margin: 'var(--space-6) 0 var(--space-3)' }}>
        Contratado vs facturado vs pagado, por año
      </h2>
      <VLineChart
        data={por_anio}
        xKey="anio"
        lines={[{ key: 'contratado' }, { key: 'facturado' }, { key: 'pagado' }]}
      />
      <ChartFootnote>
        El último año está doblemente incompleto: 2026 es parcial por fecha de firma <em>y</em> los
        contratos recién firmados aún no han tenido tiempo de facturarse o pagarse. La caída de
        facturado/pagado en 2026 es ese rezago contable, no una caída real de la ejecución.
      </ChartFootnote>
    </PageShell>
  );
}
