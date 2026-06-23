import { PageShell } from '../components/PageShell';
import { MethodologyNote } from '../components/MethodologyNote';
import VBarChart from '../components/charts/VBarChart';
import { usePublicData } from '../hooks/usePublicData';
import type { QuienData, KpisExtra } from '../lib/types';

export default function Quien() {
  const { data, loading, error } = usePublicData<QuienData>('quien');
  const { data: extra } = usePublicData<KpisExtra>('kpis_extra');

  if (loading) return <p style={{ color: 'var(--fg-muted)' }}>Cargando…</p>;
  if (error || !data) return <p style={{ color: 'var(--fg-muted)' }}>No se pudieron cargar los datos.</p>;

  const h2: React.CSSProperties = { fontFamily: 'var(--font-heading)', margin: 'var(--space-6) 0 var(--space-3)' };
  const nota: React.CSSProperties = { color: 'var(--fg-subtle)', fontSize: 12, lineHeight: 1.5, margin: 'var(--space-2) 0 var(--space-4)', maxWidth: '76ch' };
  const tamano = extra?.items.tamano_modalidad ?? [];

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

      {tamano.length > 0 && (
        <>
          <h2 style={h2}>Tamaño típico de contrato por modalidad</h2>
          <VBarChart data={tamano} xKey="grupo" bars={[{ key: 'p25' }, { key: 'mediana' }, { key: 'p75' }]} layout="horizontal" height={360} />
          <p style={nota}>
            Valor por contrato: cuartil inferior (p25), <strong>mediana (p50)</strong> y cuartil superior (p75).
            La mediana describe el contrato «normal» de cada modalidad y es robusta a cuantías extremas:
            las modalidades competitivas mueven contratos mucho mayores que la contratación directa.
          </p>
        </>
      )}
    </PageShell>
  );
}
