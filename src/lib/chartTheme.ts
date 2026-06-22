/**
 * @module chartTheme
 * Tema visual para graficas Recharts. Los colores se derivan de los tokens
 * CSS definidos en globals.css / tokens.css para garantizar una única fuente
 * de verdad. Mantenemos los hex como fallback para contextos donde CSS vars
 * no son evaluables (p.ej. props de Recharts en SSR).
 */

/** Hex fallback alineado con --accent, --accent-secondary, --risk-*, etc. */
const FALLBACK = {
  accent: '#388bfd',
  accentSecondary: '#bc8cff',
  riskCritical: '#f85149',
  riskHigh: '#d29922',
  riskMedium: '#db8b0b',
  riskLow: '#8b949e',
  success: '#3fb950',
  purple: '#a371f7',
  skyBlue: '#79c0ff',
  orange: '#f0883e',
  bgOverlay: '#161b22',
  borderDefault: '#30363d',
  fgDefault: '#e6edf3',
  fgMuted: '#8b949e',
} as const;

/** Colores principales por fuente de datos. */
export const chartColors = {
  secop: FALLBACK.accent,
  siri: FALLBACK.riskCritical,
  icij: FALLBACK.riskHigh,
  campanas: FALLBACK.purple,
  accent: FALLBACK.accent,
  accentSecondary: FALLBACK.accentSecondary,
  success: FALLBACK.success,
  muted: FALLBACK.fgMuted,
} as const;

/** Mapa de colores por nivel de riesgo para graficas. */
export const riskColors: Record<string, string> = {
  CRITICO: FALLBACK.riskCritical,
  ALTO: FALLBACK.riskHigh,
  MEDIO: FALLBACK.riskMedium,
  BAJO: FALLBACK.riskLow,
};

/** Paleta de 8 colores para series multiples en graficas. */
export const chartPalette = [
  FALLBACK.accent,
  FALLBACK.accentSecondary,
  FALLBACK.riskCritical,
  FALLBACK.riskHigh,
  FALLBACK.purple,
  FALLBACK.success,
  FALLBACK.skyBlue,
  FALLBACK.orange,
];

/** Estilos del tooltip de Recharts (fondo oscuro, borde sutil). */
export const tooltipStyle = {
  contentStyle: {
    backgroundColor: FALLBACK.bgOverlay,
    border: `1px solid ${FALLBACK.borderDefault}`,
    borderRadius: 6,
    color: FALLBACK.fgDefault,
    fontSize: 13,
    fontFamily: 'var(--font-mono)',
  },
  itemStyle: { color: FALLBACK.fgDefault },
  labelStyle: { color: FALLBACK.fgMuted, fontFamily: 'var(--font-mono)', fontSize: 11 },
};

/** Estilos de ejes X/Y para Recharts. */
export const axisStyle = {
  tick: { fill: FALLBACK.fgMuted, fontSize: 11, fontFamily: 'var(--font-mono)' },
  axisLine: { stroke: FALLBACK.borderDefault },
  tickLine: { stroke: FALLBACK.borderDefault },
};

/** Longitud maxima para etiquetas truncadas en ejes de graficas. */
export const LABEL_MAX = 20;

/**
 * Trunca un texto para que quepa en etiquetas de graficas.
 */
export function truncateLabel(text: string, max = LABEL_MAX): string {
  return text.length > max ? text.substring(0, max - 2) + '...' : text;
}
