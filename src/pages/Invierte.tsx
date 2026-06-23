import { PageShell } from '../components/PageShell';
import { MethodologyNote } from '../components/MethodologyNote';
import KPICard from '../components/charts/KPICard';
import VBarChart from '../components/charts/VBarChart';
import ChartFootnote from '../components/charts/ChartFootnote';
import { usePublicData } from '../hooks/usePublicData';
import type { InversionData, KpisExtra } from '../lib/types';
import { formatCOP } from '../lib/formatters';

export default function Invierte() {
  const { data, loading, error } = usePublicData<InversionData>('inversion');
  const { data: extra } = usePublicData<KpisExtra>('kpis_extra');

  if (loading) return <p style={{ color: 'var(--fg-muted)' }}>Cargando…</p>;
  if (error || !data) return <p style={{ color: 'var(--fg-muted)' }}>No se pudieron cargar los datos.</p>;

  const { kpis, por_sector, por_fuente } = data;
  const cadena = extra?.items.bpin_cadena ?? [];

  return (
    <PageShell
      tone="invest"
      overline="// ¿En qué se invierte?"
      question="¿En qué invierte el Estado?"
      context="Presupuesto de inversión pública vigente (BPIN, DNP): proyectos por sector, su financiación y cuánto se ha pagado. Es presupuesto vigente/programado (vigencias 2025–2026), no ejecución histórica."
      callout={
        <>
          De {formatCOP(kpis.valor_vigente)} de presupuesto vigente, se han pagado{' '}
          {formatCOP(kpis.valor_pagado)} —{' '}
          {(kpis.pct_ejecucion * 100).toLocaleString('es-CO', { maximumFractionDigits: 1 })}% del total
          programado a la fecha.
        </>
      }
      methodology={
        <MethodologyNote>
          BPIN deduplicado por id de proyecto; los valores SUMAN por línea presupuestal
          (combinación de bpin × vigencia × recurso), por lo que un mismo proyecto puede
          aportar a varias filas. El campo «fuente» corresponde al tipo de recurso que
          financia el proyecto. Estas cifras son presupuesto vigente/programado, no gasto
          histórico ejecutado. Un % de ejecución bajo es normal a mitad de la vigencia.
        </MethodologyNote>
      }
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-6)',
        }}
      >
        <KPICard label="Proyectos" valor={kpis.proyectos} />
        <KPICard label="Presupuesto vigente" valor={kpis.valor_vigente} unidad="COP" />
        <KPICard label="Pagado" valor={kpis.valor_pagado} unidad="COP" />
        <KPICard label="% ejecución" valor={kpis.pct_ejecucion * 100} unidad="%" />
      </div>

      {cadena.length > 0 && (
        <>
          <h2 style={{ fontFamily: 'var(--font-heading)', margin: 'var(--space-6) 0 var(--space-3)' }}>
            Cadena de ejecución presupuestal
          </h2>
          <VBarChart
            data={cadena}
            xKey="anio"
            bars={[{ key: 'vigente' }, { key: 'comprometido' }, { key: 'obligado' }, { key: 'pagado' }]}
          />
          <ChartFootnote>
            El presupuesto recorre cuatro estados: vigente → comprometido → obligado → pagado.
            La vigencia 2026 está <strong>en curso</strong>: sus valores bajos son el ritmo normal de
            avance de un año que apenas empieza, no subejecución. Por eso el «% ejecución» nacional
            mezcla un año casi cerrado (2025) con uno que arranca (2026).
          </ChartFootnote>
        </>
      )}

      <h2 style={{ fontFamily: 'var(--font-heading)', margin: 'var(--space-6) 0 var(--space-3)' }}>
        Inversión por sector
      </h2>
      <VBarChart
        data={por_sector.slice(0, 12)}
        xKey="sector"
        bars={[{ key: 'vigente' }, { key: 'pagado' }]}
        layout="horizontal"
        height={440}
      />

      <h2 style={{ fontFamily: 'var(--font-heading)', margin: 'var(--space-6) 0 var(--space-3)' }}>
        Por fuente de financiación
      </h2>
      <VBarChart
        data={por_fuente.slice(0, 10)}
        xKey="fuente"
        bars={[{ key: 'valor', color: 'var(--shell-tone)' }]}
        layout="horizontal"
        height={360}
      />
    </PageShell>
  );
}
