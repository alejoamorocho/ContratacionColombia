/**
 * Utilidades de formateo para fechas, moneda y números (formato colombiano).
 * El sitio público recibe siempre fechas como string ISO desde el snapshot JSON.
 */

/** Formatea una fecha (string ISO o Date) al estilo colombiano DD/MM/YYYY. */
export function formatFechaColombia(fecha: string | Date | undefined | null): string {
  if (!fecha) return '—';
  const d = fecha instanceof Date ? fecha : new Date(fecha);
  if (isNaN(d.getTime())) return '—';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}

/**
 * Formatea un número con separadores colombianos (1.234.567,89), máx. 3 decimales.
 */
export function formatNumber(val: number | string | null | undefined): string {
  if (val == null) return '—';
  const num = typeof val === 'string' ? Number(val) : val;
  if (!isFinite(num)) return '—';
  return num.toLocaleString('es-CO', { maximumFractionDigits: 3 });
}

/**
 * Formatea un valor a pesos colombianos abreviados (escala larga colombiana):
 *   - 1e6  → "M"     (millones)
 *   - 1e9  → "mil M" (mil millones) — NO es billón en español
 *   - 1e12 → "B"     (billones)     — equivale a "trillion" en inglés
 * Se evita "B" para 1e9 (ambiguo) y "T" para 1e12 (suena a trillón = 1e18).
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
