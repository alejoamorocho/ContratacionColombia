import { PageShell } from '../components/PageShell';
import { MethodologyNote } from '../components/MethodologyNote';
import VBarChart from '../components/charts/VBarChart';
import { usePublicData } from '../hooks/usePublicData';
import type { QuienData } from '../lib/types';

export default function Quien() {
  const { data, loading, error } = usePublicData<QuienData>('quien');

  if (loading) return <p style={{ color: 'var(--fg-muted)' }}>Cargando…</p>;
  if (error || !data) return <p style={{ color: 'var(--fg-muted)' }}>No se pudieron cargar los datos.</p>;

  const h2: React.CSSProperties = { fontFamily: 'var(--font-heading)', margin: 'var(--space-6) 0 var(--space-3)' };

  return (
    <PageShell
      tone="who"
      overline="// ¿Quién contrata?"
      question="¿Quiénes reciben la contratación pública?"
      context="Las entidades que más gastan y los contratistas que más recursos reciben, por valor contratado (2022–2026). Muestra cómo se reparte el gasto público entre proveedores."
      methodology={
        <MethodologyNote>
          Se suma el campo <code>valor</code> de los contratos de SECOP II por
          entidad y por contratista (deduplicados por identificador de contrato,
          valor &gt; 0). El "nivel de gobierno" viene del campo <code>orden</code>;
          un 17 % de contratos no lo reporta y aparece como "Sin clasificar".
        </MethodologyNote>
      }
    >
      <h2 style={{ ...h2, marginTop: 0 }}>Entidades que más contratan (por valor)</h2>
      <VBarChart data={data.top_entidades.slice(0, 15)} xKey="nombre" bars={[{ key: 'valor' }]} layout="horizontal" height={480} />

      <h2 style={h2}>Por nivel de gobierno</h2>
      <VBarChart data={data.por_nivel} xKey="nivel" bars={[{ key: 'valor' }]} />

      <h2 style={h2}>Por categoría de objeto</h2>
      <VBarChart data={data.por_sector.slice(0, 15)} xKey="sector" bars={[{ key: 'valor' }]} layout="horizontal" height={420} />
    </PageShell>
  );
}
