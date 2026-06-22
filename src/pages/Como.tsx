import { useMemo } from 'react';
import { SectionHeader } from '../components/SectionHeader';
import KPICard from '../components/charts/KPICard';
import VPieChart from '../components/charts/VPieChart';
import VLineChart from '../components/charts/VLineChart';
import { usePublicData } from '../hooks/usePublicData';
import type { ComoData } from '../lib/types';

const OTRAS = 'Otras';

export default function Como() {
  const { data, loading, error } = usePublicData<ComoData>('como');

  // Pivota modalidad_por_anio (formato largo) a formato ANCHO:
  // una fila por año, una columna numérica por cada modalidad (top 4 + "Otras").
  const { filasAnchas, modalidadesTop } = useMemo(() => {
    const filas = data?.modalidad_por_anio ?? [];

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
  }, [data]);

  if (loading) return <p style={{ color: 'var(--fg-muted)' }}>Cargando…</p>;
  if (error || !data) return <p style={{ color: 'var(--fg-muted)' }}>No se pudieron cargar los datos.</p>;

  return (
    <div>
      <SectionHeader
        kicker="Cómo contrata"
        title="¿Por qué mecanismos se contrata?"
        desc="Modalidades de contratación y su evolución (2022–2026)."
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-6)',
        }}
      >
        <KPICard label="% Contratación directa" valor={data.pct_directa} unidad="%" />
        <KPICard label="% Competitiva" valor={data.pct_competitiva} unidad="%" />
      </div>

      <h2 style={{ fontFamily: 'var(--font-heading)' }}>Distribución por modalidad</h2>
      <VPieChart data={data.por_modalidad} nameKey="modalidad" valueKey="valor" />

      <h2 style={{ fontFamily: 'var(--font-heading)', marginTop: 'var(--space-6)' }}>
        Evolución por modalidad y año
      </h2>
      <VLineChart data={filasAnchas} xKey="anio" lines={modalidadesTop.map((m) => ({ key: m }))} />
    </div>
  );
}
