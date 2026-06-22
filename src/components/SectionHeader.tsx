export function SectionHeader({ kicker, title, desc }: { kicker: string; title: string; desc?: string }) {
  return (
    <header style={{ marginBottom: 'var(--space-5)' }}>
      <div style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-muted)', fontSize: 12 }}>{kicker}</div>
      <h1 style={{ fontFamily: 'var(--font-heading)', margin: '4px 0' }}>{title}</h1>
      {desc && <p style={{ color: 'var(--fg-muted)', maxWidth: '70ch' }}>{desc}</p>}
    </header>
  );
}
