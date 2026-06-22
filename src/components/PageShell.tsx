import type { ReactNode } from 'react';
import { DisclaimerFooter } from './DisclaimerFooter';

export type Tone =
  | 'who' | 'how' | 'plan' | 'invest' | 'exec' | 'where' | 'signal' | 'context';

interface PageShellProps {
  /** Sobretítulo monoespaciado, ej. "// ¿Quién contrata?". */
  overline: string;
  /** Pregunta ciudadana (título principal). */
  question: string;
  /** Párrafo de contexto que explica qué muestra la sección. */
  context: string;
  /** Tono de color del módulo (colorea overline, callout y acentos). */
  tone?: Tone;
  /** Insight narrativo destacado antes de los datos (opcional). */
  callout?: ReactNode;
  /** Bloque de metodología colapsable (opcional). */
  methodology?: ReactNode;
  children: ReactNode;
}

/**
 * Marco narrativo de cada sección: pregunta → contexto → (callout) → datos →
 * metodología → disclaimer. Replica el IntelligencePageShell de la app privada.
 */
export function PageShell({
  overline, question, context, tone = 'context', callout, methodology, children,
}: PageShellProps) {
  return (
    <div data-tone={tone}>
      <header style={{ marginBottom: 'var(--space-6)' }}>
        <p className="shell-overline">{overline}</p>
        <h1 className="shell-question">{question}</h1>
        <p className="shell-context">{context}</p>
      </header>

      {callout && <div className="shell-callout">{callout}</div>}

      {children}

      {methodology}

      <DisclaimerFooter />
    </div>
  );
}
