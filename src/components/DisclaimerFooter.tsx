/** Pie de página de todas las secciones: deja explícito el tono no acusatorio. */
export function DisclaimerFooter() {
  return (
    <footer
      style={{
        marginTop: 'var(--space-8)',
        paddingTop: 'var(--space-4)',
        borderTop: '1px solid var(--border-default)',
        color: 'var(--fg-subtle)',
        fontSize: 12,
        lineHeight: 1.6,
        maxWidth: '80ch',
      }}
    >
      <strong style={{ color: 'var(--fg-muted)' }}>VECTORVI</strong> es un laboratorio
      de datos abiertos. Describe patrones estadísticos en información pública;{' '}
      <strong style={{ color: 'var(--fg-muted)' }}>ningún dato es acusatorio</strong> ni
      implica irregularidad. La interpretación y la verificación corresponden a quien
      consulta. Fuentes oficiales: SECOP II, PAA, BPIN (DNP), CNE, SIRI/Contraloría.
    </footer>
  );
}
