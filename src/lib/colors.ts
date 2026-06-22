/**
 * @module colors
 * Mapas de colores centralizados para paginas de servicios.
 * Evita duplicacion en AuditReport, CompetitiveIntel, Opportunities, SupplierRating.
 */

/** Colores de severidad para hallazgos de auditoria. */
export const AUDIT_SEVERITY_COLORS: Record<string, string> = {
  CRITICO: '#f85149',
  ALTO: '#d29922',
  MEDIO: '#8b949e',
};

/** Labels de severidad para auditoria. */
export const AUDIT_SEVERITY_LABELS: Record<string, string> = {
  CRITICO: 'Critico',
  ALTO: 'Alto',
  MEDIO: 'Medio',
};

/** Colores de nivel de auditoria (score general). */
export const AUDIT_NIVEL_COLORS: Record<string, string> = {
  BUENO: '#3fb950',
  ACEPTABLE: '#58a6ff',
  DEFICIENTE: '#d29922',
  CRITICO: '#f85149',
};

/** Colores de cuadrantes BCG para inteligencia competitiva. */
export const BCG_COLORS: Record<string, string> = {
  ESTRELLA: '#f0c000',
  VACA: '#3fb950',
  INTERROGACION: '#58a6ff',
  PERRO: '#8b949e',
};

/** Colores de tipo de match para alertas de oportunidades. */
export const MATCH_COLORS: Record<string, string> = {
  categoria: '#58a6ff',
  departamento: '#3fb950',
  valor: '#d29922',
  entidad: '#bc8cff',
};

/** Colores de nivel de rating de proveedor. */
export const LEVEL_COLORS: Record<string, string> = {
  EXCELENTE: '#3fb950',
  BUENO: '#58a6ff',
  REGULAR: '#d29922',
  BAJO: '#f85149',
};
