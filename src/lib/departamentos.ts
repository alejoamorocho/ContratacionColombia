/**
 * Mapa DANE → nombre de departamento.
 * SECOP II retorna departamentos como códigos DANE de 2 dígitos
 * ("05", "11", "19"...). Este módulo traduce a nombres legibles.
 */

const DANE_A_NOMBRE: Record<string, string> = {
  '05': 'Antioquia',
  '08': 'Atlántico',
  '11': 'Bogotá D.C.',
  '13': 'Bolívar',
  '15': 'Boyacá',
  '17': 'Caldas',
  '18': 'Caquetá',
  '19': 'Cauca',
  '20': 'Cesar',
  '23': 'Córdoba',
  '25': 'Cundinamarca',
  '27': 'Chocó',
  '41': 'Huila',
  '44': 'La Guajira',
  '47': 'Magdalena',
  '50': 'Meta',
  '52': 'Nariño',
  '54': 'Norte de Santander',
  '63': 'Quindío',
  '66': 'Risaralda',
  '68': 'Santander',
  '70': 'Sucre',
  '73': 'Tolima',
  '76': 'Valle del Cauca',
  '81': 'Arauca',
  '85': 'Casanare',
  '86': 'Putumayo',
  '88': 'San Andrés y Providencia',
  '91': 'Amazonas',
  '94': 'Guainía',
  '95': 'Guaviare',
  '97': 'Vaupés',
  '99': 'Vichada',
};

/**
 * Traduce un código DANE o nombre de departamento al nombre legible.
 * Acepta también códigos con espacios o sin padding ("5" → "Antioquia").
 * Si ya es un nombre, lo retorna tal cual (capitalizando).
 */
export function nombreDepartamento(raw: string | null | undefined): string {
  if (!raw) return 'Sin clasificar';
  const s = String(raw).trim();
  if (!s) return 'Sin clasificar';

  const padded = s.length === 1 ? `0${s}` : s;
  if (DANE_A_NOMBRE[padded]) return DANE_A_NOMBRE[padded];

  if (/^\d+$/.test(s)) return `Departamento ${s}`;

  return s
    .toLocaleLowerCase('es-CO')
    .replace(/\b[\wáéíóúñ]+/g, (w) => w.charAt(0).toLocaleUpperCase('es-CO') + w.slice(1));
}

/** Retorna el código DANE normalizado a 2 dígitos si `raw` es numérico. */
export function codigoDaneNormalizado(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const s = String(raw).trim();
  if (!/^\d+$/.test(s)) return null;
  return s.length === 1 ? `0${s}` : s;
}

/**
 * Convierte un nombre de departamento a slug URL-safe (lowercase, sin acentos,
 * espacios → guiones). Ej: "Bogotá D.C." → "bogota-dc", "Valle del Cauca" → "valle-del-cauca".
 */
export function slugDepartamento(nombre: string): string {
  return nombre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Parsea un slug de URL `/app/donde/{dane}-{slug}` y retorna `{dane, slugNombre}`.
 */
export function parseSlugDepto(
  slug: string | undefined,
): { dane: string | null; slugNombre: string | null } {
  if (!slug) return { dane: null, slugNombre: null };
  const match = slug.match(/^(\d{2})(?:-(.+))?$/);
  if (!match) return { dane: null, slugNombre: null };
  const dane = match[1];
  if (!DANE_A_NOMBRE[dane]) return { dane: null, slugNombre: null };
  return { dane, slugNombre: match[2] ?? null };
}
