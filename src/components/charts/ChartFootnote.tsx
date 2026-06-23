import type { ReactNode } from 'react';

/**
 * Pie de gráfico para advertencias de LECTURA (años parciales, sesgos de
 * cobertura). A diferencia de MethodologyNote (colapsable), esto es VISIBLE
 * siempre y va pegado al gráfico que podría inducir una lectura falsa.
 */
export default function ChartFootnote({ children }: { children: ReactNode }) {
  return (
    <p style={{ color: 'var(--fg-subtle)', fontSize: 12, lineHeight: 1.5, margin: 'var(--space-2) 0 var(--space-4)', maxWidth: '76ch' }}>
      ⚠ {children}
    </p>
  );
}

/** Advertencia estándar para TODA serie por año: 2026 parcial y 2022-H1 con baja cobertura. */
export const NOTA_ANIO_PARCIAL =
  '2026 es un año parcial (contratos firmados hasta el corte de jun-2026) y el primer semestre de 2022 tuvo baja cobertura en SECOP II. La caída del primer y del último año refleja datos incompletos, no menor contratación.';
