import { usePublicData } from '../hooks/usePublicData';
import { PageShell } from '../components/PageShell';
import { MethodologyNote } from '../components/MethodologyNote';
import KPICard from '../components/charts/KPICard';
import VBarChart from '../components/charts/VBarChart';
import ChartFootnote, { NOTA_ANIO_PARCIAL } from '../components/charts/ChartFootnote';
import type { SenalesData, SancionesData, ElectoralData } from '../lib/types';

const h2Style = { fontFamily: 'var(--font-heading)', margin: 'var(--space-6) 0 var(--space-3)' } as const;
const kpiGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
  gap: 'var(--space-4)',
  marginBottom: 'var(--space-4)',
} as const;
const notaStyle = {
  color: 'var(--fg-muted)',
  fontSize: 13,
  lineHeight: 1.6,
  margin: 'var(--space-3) 0 0',
  maxWidth: '78ch',
} as const;

export default function Senales() {
  const senales = usePublicData<SenalesData>('senales');
  const sanciones = usePublicData<SancionesData>('sanciones');
  const electoral = usePublicData<ElectoralData>('electoral');

  if (senales.loading) return <p style={{ color: 'var(--fg-muted)' }}>Cargando…</p>;
  if (senales.error || !senales.data) return <p style={{ color: 'var(--fg-muted)' }}>No se pudieron cargar los datos.</p>;

  const s = senales.data;
  const san = sanciones.data;
  const el = electoral.data;

  return (
    <PageShell
      tone="signal"
      overline="// ¿Hay señales?"
      question="Señales estadísticas del mercado público"
      context="Indicadores descriptivos: concentración, sanciones registradas y financiación de campañas. Estadística factual de un laboratorio de datos — NO implica irregularidad ni señala a nadie."
      callout={
        <>
          Estas cifras son <strong>agregados estadísticos</strong> de registros públicos.
          No cruzan sanciones ni aportes con contratos, ni mencionan nombres individuales:
          describen el mercado en conjunto, no a personas.
        </>
      }
      methodology={
        <MethodologyNote>
          Esta sección reúne tres registros públicos oficiales y los presenta de forma
          agregada, con espíritu de laboratorio de datos: <strong>describir, no acusar</strong>.
          {' '}
          La <em>concentración</em> y los <em>percentiles de valor</em> se calculan sobre los
          contratos publicados en SECOP II dentro de la ventana analizada. Las{' '}
          <em>sanciones</em> provienen del registro disciplinario (SIRI) y los{' '}
          <em>aportes</em> de la financiación de campañas reportada al CNE. Sanciones y aportes
          son hechos registrados de forma pública; aquí aparecen <strong>solo como totales
          agregados</strong>, sin cruzarse con contratos ni con nombres individuales. Ninguna
          cifra de esta página implica irregularidad, conflicto de interés ni juicio sobre
          persona o entidad alguna.
        </MethodologyNote>
      }
    >
      {/* 1) Concentración del mercado */}
      <h2 style={h2Style}>Concentración del mercado</h2>
      <div style={kpiGrid}>
        <KPICard label="Top-10 concentra (valor)" valor={s.concentracion.top10_pct_valor} unidad="%" />
        <KPICard label="Directa · % de contratos" valor={s.pct_directa_nacional} unidad="%" />
      </div>
      <VBarChart
        data={s.percentiles_valor}
        xKey="p"
        bars={[{ key: 'valor', color: 'var(--shell-tone)' }]}
      />

      {/* 2) Sanciones registradas (SIRI) */}
      <h2 style={h2Style}>Sanciones registradas (SIRI)</h2>
      {san ? (
        <>
          <div style={kpiGrid}>
            <KPICard label="Sanciones 2022–2026" valor={san.kpis.total} />
            <KPICard label="Con inhabilidad vigente" valor={san.kpis.inhabilidad_vigente} />
            <KPICard label="Inhabilidad mediana (meses)" valor={san.kpis.inhabilidad_mediana_meses} />
          </div>
          <h3 style={{ ...h2Style, fontSize: 16 }}>Sanciones por año</h3>
          <VBarChart data={san.por_anio} xKey="anio" bars={[{ key: 'n' }]} />
          <ChartFootnote>{NOTA_ANIO_PARCIAL}</ChartFootnote>
          <h3 style={{ ...h2Style, fontSize: 16 }}>Calidad del sancionado</h3>
          <VBarChart data={san.por_gravedad} xKey="gravedad" bars={[{ key: 'n' }]} layout="horizontal" />
          <p style={notaStyle}>
            La columna refleja la <strong>calidad de la persona</strong> sancionada, no la gravedad
            del hecho. Cerca del 66% de los registros corresponde a la fuerza pública: refleja el
            volumen de su disciplina interna, no mayor corrupción.
          </p>
        </>
      ) : (
        <p style={{ color: 'var(--fg-muted)' }}>
          {sanciones.loading ? 'Cargando sanciones…' : 'No se pudieron cargar las sanciones.'}
        </p>
      )}

      {/* 3) Financiación de campañas (CNE) */}
      <h2 style={h2Style}>Financiación de campañas (CNE)</h2>
      {el ? (
        <>
          <div style={kpiGrid}>
            <KPICard label="Aportes" valor={el.kpis.aportes} />
            <KPICard label="Monto total" valor={el.kpis.monto_total} unidad="COP" />
          </div>
          <h3 style={{ ...h2Style, fontSize: 16 }}>Aportes por partido (top 12)</h3>
          <VBarChart
            data={el.top_partidos.slice(0, 12)}
            xKey="partido"
            bars={[{ key: 'monto' }]}
            layout="horizontal"
            height={420}
          />
          <h3 style={{ ...h2Style, fontSize: 16 }}>Aportes por departamento (top 15)</h3>
          <VBarChart
            data={el.por_departamento.slice(0, 15)}
            xKey="departamento"
            bars={[{ key: 'monto' }]}
            layout="horizontal"
            height={420}
          />
          <p style={notaStyle}>
            Cubre solo los ciclos electorales 2022–2023. La vista por departamento excluye los
            aportes a cargos nacionales (cerca del 30% del monto), que no tienen un departamento
            asignado.
          </p>
        </>
      ) : (
        <p style={{ color: 'var(--fg-muted)' }}>
          {electoral.loading ? 'Cargando financiación…' : 'No se pudieron cargar los datos electorales.'}
        </p>
      )}
    </PageShell>
  );
}
