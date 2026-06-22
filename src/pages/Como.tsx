import { useMemo } from 'react';
import { PageShell } from '../components/PageShell';
import { MethodologyNote } from '../components/MethodologyNote';
import KPICard from '../components/charts/KPICard';
import VPieChart from '../components/charts/VPieChart';
import VLineChart from '../components/charts/VLineChart';
import VBarChart from '../components/charts/VBarChart';
import { usePublicData } from '../hooks/usePublicData';
import type { ComoData, ProcesosData } from '../lib/types';

const OTRAS = 'Otras';

export default function Como() {
  const { data: como, loading: lc, error: ec } = usePublicData<ComoData>('como');
  const { data: procesos, loading: lp, error: ep } = usePublicData<ProcesosData>('procesos');

  // Pivota modalidad_por_anio (formato largo) a formato ANCHO:
  // una fila por año, una columna numérica por cada modalidad (top 4 + "Otras").
  const { filasAnchas, modalidadesTop } = useMemo(() => {
    const filas = como?.modalidad_por_anio ?? [];

    // Valor total acumulado por modalidad para elegir las top 4.
    const totalPorModalidad = new Map<string, number>();
    for (const f of filas) {
      totalPorModalidad.set(f.modalidad, (totalPorModalidad.get(f.modalidad) ?? 0) + (Number(f.valor) || 0));
    }

    const ordenadas = [...totalPorModalidad.entries()].sort((a, b) => b[1] - a[1]);
    const top = ordenadas.slice(0, 4).map(([m]) => m);
    const hayOtras = ordenadas.length > 4;
    const series = hayOtras ? [...top, OTRAS] : top;
    const topSet = new Set(top);

    // Agrupa por año, sumando cada modalidad en su columna (o en "Otras").
    const porAnio = new Map<number, Record<string, number>>();
    for (const f of filas) {
      const anio = Number(f.anio);
      const fila = porAnio.get(anio) ?? { anio };
      const col = topSet.has(f.modalidad) ? f.modalidad : OTRAS;
      fila[col] = (fila[col] ?? 0) + (Number(f.valor) || 0);
      porAnio.set(anio, fila);
    }

    // Asegura que toda fila tenga todas las series (0 por defecto) y ordena por año.
    const filasAnchas = [...porAnio.values()]
      .map((fila) => {
        const completa: Record<string, number> = { ...fila };
        for (const s of series) if (completa[s] == null) completa[s] = 0;
        return completa;
      })
      .sort((a, b) => a.anio - b.anio);

    return { filasAnchas, modalidadesTop: series };
  }, [como]);

  if (lc || lp) return <p style={{ color: 'var(--fg-muted)' }}>Cargando…</p>;
  if (ec || ep || !como || !procesos)
    return <p style={{ color: 'var(--fg-muted)' }}>No se pudieron cargar los datos.</p>;

  return (
    <PageShell
      tone="how"
      overline="// ¿Cómo contrata?"
      question="¿Por qué mecanismos contrata el Estado?"
      context="Las modalidades de contratación de SECOP II y cómo terminan los procesos (adjudicados o no). 2022–2026."
      callout={
        <>
          De cada peso contratado, <strong>{como.pct_directa}%</strong> sale por{' '}
          contratación directa y <strong>{como.pct_competitiva}%</strong> por mecanismos
          competitivos. Es una foto de los caminos del gasto, no un juicio sobre ellos.
        </>
      }
      methodology={
        <MethodologyNote>
          «Adjudicado» corresponde al estado <strong>Seleccionado</strong> en SECOP II;
          el resto de procesos (desiertos, cancelados, en trámite) no se cuentan como
          adjudicados. «Contratación directa» agrupa toda modalidad cuyo nombre contiene
          la palabra «directa». Las modalidades menos frecuentes se consolidan en «Otras»
          en la serie temporal para mantener la lectura clara.
          {' '}
          El número de oferentes (la competencia efectiva por proceso) <strong>no se
          publica</strong>: la fuente abierta trae ese campo prácticamente vacío (más del
          99% de los registros sin dato), por lo que no es posible reportarlo de forma
          confiable. Cifras 2022–2026.
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
        <KPICard label="% Contratación directa" valor={como.pct_directa} unidad="%" />
        <KPICard label="% Competitiva" valor={como.pct_competitiva} unidad="%" />
        <KPICard label="Procesos publicados" valor={procesos.kpis.total} />
        <KPICard label="% adjudicados" valor={procesos.kpis.pct_adjudicado} unidad="%" />
      </div>

      <h2 style={{ fontFamily: 'var(--font-heading)', margin: 'var(--space-6) 0 var(--space-3)' }}>
        Distribución por modalidad
      </h2>
      <VPieChart data={como.por_modalidad} nameKey="modalidad" valueKey="valor" />

      <h2 style={{ fontFamily: 'var(--font-heading)', margin: 'var(--space-6) 0 var(--space-3)' }}>
        Evolución por modalidad y año
      </h2>
      <VLineChart data={filasAnchas} xKey="anio" lines={modalidadesTop.map((m) => ({ key: m }))} />

      <h2 style={{ fontFamily: 'var(--font-heading)', margin: 'var(--space-6) 0 var(--space-3)' }}>
        Resultado de los procesos por modalidad
      </h2>
      <VBarChart
        data={procesos.por_modalidad}
        xKey="modalidad"
        bars={[{ key: 'pct_adjudicado', color: 'var(--shell-tone)' }]}
        layout="horizontal"
      />
    </PageShell>
  );
}
