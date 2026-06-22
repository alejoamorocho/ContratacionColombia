/**
 * Utilidades de formateo para fechas, moneda y numeros.
 * Maneja Firestore Timestamps, numeros grandes y formato colombiano.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FirestoreTimestamp = { seconds: number; nanoseconds: number } | { toDate: () => Date };

/**
 * Formatea una fecha al estilo colombiano DD/MM/YYYY.
 * Acepta strings ISO, Date, Firestore Timestamps, o undefined.
 */
export function formatFechaColombia(fecha: string | Date | FirestoreTimestamp | undefined | null): string {
  if (!fecha) return '—';
  try {
    const d = toDate(fecha);
    if (!d || isNaN(d.getTime())) return '—';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } catch {
    return '—';
  }
}

/** Convierte cualquier valor tipo fecha a Date nativo. */
function toDate(val: unknown): Date | null {
  if (!val) return null;
  if (val instanceof Date) return val;
  if (typeof val === 'string') return new Date(val);
  if (typeof val === 'object' && val !== null) {
    if ('toDate' in val && typeof (val as { toDate: () => Date }).toDate === 'function') {
      return (val as { toDate: () => Date }).toDate();
    }
    if ('seconds' in val && typeof (val as { seconds: number }).seconds === 'number') {
      return new Date((val as { seconds: number }).seconds * 1000);
    }
  }
  return null;
}

/**
 * Formatea un numero con separadores de miles (punto) y max 3 decimales.
 * Usa formato colombiano: 1.234.567,89
 */
export function formatNumber(val: number | string | null | undefined): string {
  if (val == null) return '—';
  const num = typeof val === 'string' ? Number(val) : val;
  if (!isFinite(num)) return '—';
  return num.toLocaleString('es-CO', { maximumFractionDigits: 3 });
}

/**
 * Formatea un valor numerico a pesos colombianos abreviados.
 *
 * Convención colombiana (escala larga):
 *   - 1e6  → "M"     (millones)
 *   - 1e9  → "mil M" (mil millones) — NO es billón en español
 *   - 1e12 → "B"     (billones)     — equivale a "trillion" en inglés
 *
 * Se evita abreviar 1e9 como "B" (es ambigua con billón) y 1e12 como "T"
 * (suena a trillón, que en español es 1e18). Las cifras de contratación
 * pública suelen caer entre 1e6 y 1e12, donde la ambigüedad ha causado
 * malinterpretaciones en reportes previos.
 */
export function formatCOP(valor: number | string | null | undefined): string {
  if (valor == null) return '$0';
  const num = typeof valor === 'string' ? Number(valor) : valor;
  if (!isFinite(num)) return '$0';
  const abs = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  if (abs >= 1e12) return `${sign}$${(abs / 1e12).toLocaleString('es-CO', { maximumFractionDigits: 2 })} B`;
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toLocaleString('es-CO', { maximumFractionDigits: 2 })} mil M`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toLocaleString('es-CO', { maximumFractionDigits: 1 })} M`;
  return `${sign}$${abs.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;
}

/**
 * Formatea valor generico segun tipo: cop, pct, date, number.
 * Punto de entrada unico para tablas y componentes.
 */
export function formatValue(val: unknown, format?: string): string {
  if (val == null) return '—';

  // Coerce string numbers when a numeric format is requested
  const numVal = typeof val === 'number' ? val
    : (typeof val === 'string' && format && ['cop', 'pct', 'number'].includes(format) && !isNaN(Number(val)) && val.trim().length > 0)
      ? Number(val) : null;

  if (format === 'cop' && numVal != null) return formatCOP(numVal);
  if (format === 'pct' && numVal != null) return `${numVal.toLocaleString('es-CO', { maximumFractionDigits: 1 })}%`;
  if (format === 'number' && numVal != null) return formatNumber(numVal);
  if (format === 'date') return formatFechaColombia(val as string | Date | FirestoreTimestamp);

  // Auto-detect numbers
  if (typeof val === 'number') return formatNumber(val);

  // Auto-detect Firestore Timestamps
  if (typeof val === 'object' && val !== null && ('seconds' in val || 'toDate' in val)) {
    return formatFechaColombia(val as FirestoreTimestamp);
  }

  return String(val);
}

/**
 * Formatea una fecha ISO a tiempo relativo en español.
 * Ej: "hace 3 h", "hace 2 d", "hace 1 mes".
 */
export function formatRelativeTime(isoString: string | null | undefined): string {
  if (!isoString) return 'nunca';
  try {
    const date = new Date(isoString);
    if (!isFinite(date.getTime())) return 'nunca';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffS = Math.floor(diffMs / 1000);
    const diffM = Math.floor(diffS / 60);
    const diffH = Math.floor(diffM / 60);
    const diffD = Math.floor(diffH / 24);
    const diffW = Math.floor(diffD / 7);
    const diffMo = Math.floor(diffD / 30);

    if (diffS < 60) return `hace ${diffS}s`;
    if (diffM < 60) return `hace ${diffM}m`;
    if (diffH < 24) return `hace ${diffH}h`;
    if (diffD < 7) return `hace ${diffD}d`;
    if (diffW < 4) return `hace ${diffW}s`;
    if (diffMo < 12) return `hace ${diffMo}m`;
    return formatFechaColombia(isoString);
  } catch {
    return 'nunca';
  }
}
