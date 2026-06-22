import { PageShell } from '../components/PageShell';
import { MethodologyNote } from '../components/MethodologyNote';
import KPICard from '../components/charts/KPICard';
import { usePublicData } from '../hooks/usePublicData';
import { formatCOP, formatNumber } from '../lib/formatters';
import type { CrucesData } from '../lib/types';

export default function Cruces() {
  const { data, loading, error } = usePublicData<CrucesData>('cruces');

  if (loading) return <p style={{ color: 'var(--fg-muted)' }}>Cargando…</p>;
  if (error || !data) return <p style={{ color: 'var(--fg-muted)' }}>No se pudieron cargar los datos.</p>;

  const pctDonante = (data.donante.nits * 100) / (data.donante.total_contratistas || 1);

  const h2: React.CSSProperties = { fontFamily: 'var(--font-heading)', margin: 'var(--space-6) 0 var(--space-2)' };
  const grid: React.CSSProperties = {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 'var(--space-4)',
  };
  const nota: React.CSSProperties = { color: 'var(--fg-muted)', maxWidth: '74ch', lineHeight: 1.6, marginTop: 'var(--space-3)' };

  return (
    <PageShell
      tone="signal"
      overline="// ¿Se cruzan los datos?"
      question="¿Aparecen los mismos NITs en varios registros?"
      context="Un laboratorio de datos: cruzamos registros públicos para ver coincidencias factuales. Estos solapamientos NO son acusaciones ni señalan a nadie — son puntos de partida que requieren verificación humana."
      callout={
        <span>
          Coincidir en dos registros públicos <strong>no implica irregularidad</strong>.
          Aportar a una campaña es legal y una sanción no siempre inhabilita para
          contratar. Mostramos el dato; la interpretación es tuya.
        </span>
      }
      methodology={
        <MethodologyNote>
          <p>
            <strong>Coincidencia de NIT.</strong> Se cruza el <code>contratista_nit</code>
            de los contratos (SECOP II, 2022–2026, deduplicados, valor &gt; 0) contra el
            NIT de otros registros públicos. El emparejamiento es por <strong>NIT exacto</strong>:
            es conservador y puede <strong>subestimar</strong> coincidencias por
            diferencias de formato (dígito de verificación, ceros).
          </p>
          <p>
            <strong>Donante ↔ Contratista:</strong> NIT presente como aportante en Cuentas
            Claras (CNE) y como contratista. <strong>Sancionado ↔ Contratista:</strong> NIT en
            el registro de sanciones del SIRI (Procuraduría) que firmó contratos con fecha
            <em> posterior</em> a su primera sanción registrada. Ninguno de los dos cruces
            afirma ilegalidad; ambos describen solapamientos temporales que merecen
            verificación caso por caso.
          </p>
        </MethodologyNote>
      }
    >
      <h2 style={{ ...h2, marginTop: 0 }}>Donante ↔ Contratista</h2>
      <div style={grid}>
        <KPICard label="NITs que contratan y aportan" valor={data.donante.nits} />
        <KPICard label="% de los contratistas" valor={pctDonante} unidad="%" />
        <KPICard label="Contratos de esos NITs" valor={data.donante.contratos} />
        <KPICard label="Valor de esos contratos" valor={data.donante.valor} unidad="COP" />
      </div>
      <p style={nota}>
        {formatNumber(data.donante.nits)} contratistas (el {pctDonante.toFixed(1)} % del total)
        también figuran como aportantes a campañas. Sus contratos en el período suman{' '}
        {formatCOP(data.donante.valor)}. Aportar a una campaña es un derecho legal; esta
        coincidencia es solo un dato descriptivo.
      </p>

      <h2 style={h2}>Sancionado ↔ Contratista</h2>
      <div style={grid}>
        <KPICard label="NITs con contrato tras sanción" valor={data.sancionado.nits} />
        <KPICard label="Contratos posteriores" valor={data.sancionado.contratos} />
        <KPICard label="Valor de esos contratos" valor={data.sancionado.valor} unidad="COP" />
      </div>
      <p style={nota}>
        {formatNumber(data.sancionado.nits)} NITs del registro de sanciones del SIRI firmaron
        contratos con fecha posterior a su sanción, por {formatCOP(data.sancionado.valor)}. Una
        sanción disciplinaria no siempre inhabilita para contratar y muchas inhabilidades pueden
        estar cumplidas: este dato <strong>no afirma ilegalidad</strong>, solo invita a verificar.
      </p>
    </PageShell>
  );
}
