import { PageShell } from '../components/PageShell';
import { usePublicData } from '../hooks/usePublicData';
import { formatFechaColombia } from '../lib/formatters';
import type { MetaData } from '../lib/types';

export default function Acerca() {
  const { data, loading, error } = usePublicData<MetaData>('meta');

  if (loading) return <p style={{ color: 'var(--fg-muted)' }}>Cargando…</p>;
  if (error || !data) return <p style={{ color: 'var(--fg-muted)' }}>No se pudieron cargar los datos.</p>;

  const h2: React.CSSProperties = { fontFamily: 'var(--font-heading)', margin: 'var(--space-6) 0 var(--space-3)' };
  const link: React.CSSProperties = { color: 'var(--brand)' };

  return (
    <PageShell
      tone="context"
      overline="// Acerca"
      question="Un laboratorio de datos públicos"
      context="VECTORVI organiza datos abiertos oficiales de la contratación del Estado colombiano para que cualquier persona los entienda. Describe, no juzga: ningún dato es acusatorio."
    >
      <div
        style={{
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius)',
          padding: 'var(--space-5)',
          margin: 'var(--space-2) 0 var(--space-4)',
          background: 'var(--bg-overlay)',
        }}
      >
        <div style={{ marginBottom: 'var(--space-2)' }}>
          <strong>Ventana:</strong> {data.ventana.desde}–{data.ventana.hasta}
        </div>
        <div style={{ marginBottom: 'var(--space-2)' }}>
          <strong>Fecha de corte de datos:</strong> {formatFechaColombia(data.corte_datos)}
        </div>
        <div>
          <strong>Generado:</strong> {formatFechaColombia(data.generado)}
        </div>
      </div>

      <h2 style={h2}>Fuentes oficiales</h2>
      <ul style={{ color: 'var(--fg-default)', maxWidth: '72ch', lineHeight: 1.7 }}>
        {data.fuentes.map((f, i) => <li key={i}>{f}</li>)}
      </ul>

      <h2 style={h2}>Frescura de datos</h2>
      <p style={{ color: 'var(--fg-muted)', maxWidth: '72ch', lineHeight: 1.6, marginBottom: 'var(--space-3)' }}>
        Cada fuente tiene su propio corte e ingesta. Esto es de cuándo es cada dato:
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', maxWidth: '72ch', fontSize: 13 }}>
          <thead>
            <tr style={{ color: 'var(--fg-muted)', textAlign: 'left' }}>
              <th style={{ padding: '6px 10px', borderBottom: '1px solid var(--border-default)' }}>Fuente</th>
              <th style={{ padding: '6px 10px', borderBottom: '1px solid var(--border-default)' }}>Periodo</th>
              <th style={{ padding: '6px 10px', borderBottom: '1px solid var(--border-default)' }}>Corte</th>
              <th style={{ padding: '6px 10px', borderBottom: '1px solid var(--border-default)' }}>Ingerido</th>
            </tr>
          </thead>
          <tbody>
            {data.fuentes_detalle?.map((f, i) => (
              <tr key={i} style={{ color: 'var(--fg-default)' }}>
                <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--border-muted)' }}>{f.fuente}</td>
                <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--border-muted)', fontFamily: 'var(--font-mono)' }}>{f.periodo}</td>
                <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--border-muted)', color: 'var(--fg-muted)' }}>{f.corte}</td>
                <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--border-muted)', fontFamily: 'var(--font-mono)' }}>{f.ingesta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={h2}>Notas y límites</h2>
      <ul style={{ color: 'var(--fg-muted)', maxWidth: '72ch', lineHeight: 1.7 }}>
        {data.notas.map((n, i) => <li key={i}>{n}</li>)}
      </ul>

      <h2 style={h2}>Código y licencia</h2>
      <p style={{ color: 'var(--fg-default)', maxWidth: '72ch', lineHeight: 1.6 }}>
        <a href="https://github.com/alejoamorocho/ContratacionColombia" target="_blank" rel="noopener noreferrer" style={link}>Repositorio en GitHub</a>
        {' · '}
        <a href="https://github.com/alejoamorocho/ContratacionColombia/tree/main/wiki" target="_blank" rel="noopener noreferrer" style={link}>Wiki</a>
        {' · '}
        <a href="https://github.com/alejoamorocho/ContratacionColombia/blob/main/wiki/06-Auditoria-De-Datos.md" target="_blank" rel="noopener noreferrer" style={link}>Auditoría de datos</a>
        <br />
        Open source bajo Apache 2.0.
      </p>

      <p
        style={{
          color: 'var(--fg-muted)', fontSize: 13, marginTop: 'var(--space-6)',
          borderTop: '1px solid var(--border-default)', paddingTop: 'var(--space-4)',
        }}
      >
        Creado por Alejandro Amorocho y Juan José Amorocho.
      </p>
    </PageShell>
  );
}
