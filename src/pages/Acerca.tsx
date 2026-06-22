import { SectionHeader } from '../components/SectionHeader';
import { usePublicData } from '../hooks/usePublicData';
import { formatFechaColombia } from '../lib/formatters';
import type { MetaData } from '../lib/types';

export default function Acerca() {
  const { data, loading, error } = usePublicData<MetaData>('meta');

  if (loading) return <p style={{ color: 'var(--fg-muted)' }}>Cargando…</p>;
  if (error || !data) return <p style={{ color: 'var(--fg-muted)' }}>No se pudieron cargar los datos.</p>;

  return (
    <div>
      <SectionHeader
        kicker="Acerca"
        title="VECTORVI — Observatorio público"
        desc="Datos abiertos de contratación pública colombiana, organizados para entender qué pasó."
      />

      <p style={{ color: 'var(--fg-default)', maxWidth: '70ch', lineHeight: 1.6 }}>
        VECTORVI es un observatorio estadístico público de la contratación del Estado colombiano,
        construido sobre los datos abiertos del SECOP II. Su propósito es organizar y describir lo
        que muestran los registros, no calificar ni juzgar a las entidades o contratistas. Es un
        proyecto de código abierto.
      </p>

      <div
        style={{
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius)',
          padding: 'var(--space-5)',
          margin: 'var(--space-5) 0',
          background: 'var(--bg-overlay)',
        }}
      >
        <div style={{ color: 'var(--fg-default)', marginBottom: 'var(--space-2)' }}>
          <strong>Ventana:</strong> {data.ventana.desde}–{data.ventana.hasta}
        </div>
        <div style={{ color: 'var(--fg-default)', marginBottom: 'var(--space-2)' }}>
          <strong>Fecha de corte de datos:</strong> {formatFechaColombia(data.corte_datos)}
        </div>
        <div style={{ color: 'var(--fg-default)' }}>
          <strong>Generado:</strong> {formatFechaColombia(data.generado)}
        </div>
      </div>

      <h2 style={{ fontFamily: 'var(--font-heading)', marginTop: 'var(--space-6)' }}>Fuentes</h2>
      <ul style={{ color: 'var(--fg-default)', maxWidth: '70ch', lineHeight: 1.7 }}>
        {data.fuentes.map((f, i) => (
          <li key={i}>{f}</li>
        ))}
      </ul>

      <h2 style={{ fontFamily: 'var(--font-heading)', marginTop: 'var(--space-6)' }}>
        Notas y límites
      </h2>
      <ul style={{ color: 'var(--fg-default)', maxWidth: '70ch', lineHeight: 1.7 }}>
        {data.notas.map((n, i) => (
          <li key={i}>{n}</li>
        ))}
      </ul>

      <h2 style={{ fontFamily: 'var(--font-heading)', marginTop: 'var(--space-6)' }}>
        Código y licencia
      </h2>
      <p style={{ color: 'var(--fg-default)', maxWidth: '70ch', lineHeight: 1.6 }}>
        <a href="#" style={{ color: 'var(--fg-default)' }}>Repositorio</a>
        {' · '}
        <a href="#" style={{ color: 'var(--fg-default)' }}>Wiki</a>
        <br />
        Open source bajo Apache 2.0.
      </p>

      <p
        style={{
          color: 'var(--fg-muted)',
          fontSize: 13,
          marginTop: 'var(--space-6)',
          borderTop: '1px solid var(--border-default)',
          paddingTop: 'var(--space-4)',
        }}
      >
        Creado por Alejandro Amorocho y Juan José Amorocho.
      </p>
    </div>
  );
}
