import type { ReactNode } from 'react';

/** Bloque colapsable "Cómo calculamos estos datos" (metodología siempre disponible). */
export function MethodologyNote({
  title = 'Cómo calculamos estos datos',
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <details
      style={{
        marginTop: 'var(--space-6)',
        border: '1px solid var(--border-muted)',
        borderRadius: 'var(--radius)',
        background: 'var(--bg-overlay)',
        padding: '0 var(--space-4)',
      }}
    >
      <summary
        style={{
          cursor: 'pointer',
          padding: 'var(--space-3) 0',
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--fg-muted)',
        }}
      >
        {title}
      </summary>
      <div
        style={{
          paddingBottom: 'var(--space-4)',
          color: 'var(--fg-muted)',
          fontSize: 13,
          lineHeight: 1.7,
          maxWidth: '78ch',
        }}
      >
        {children}
      </div>
    </details>
  );
}
