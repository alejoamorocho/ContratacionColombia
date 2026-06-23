/**
 * Esquemas Zod del snapshot público — ÚNICA fuente de verdad de la forma de los
 * datos. Los tipos de `types.ts` se derivan de aquí (`z.infer`), y el hook
 * `usePublicData` valida cada JSON contra su esquema EN RUNTIME: si un archivo
 * del snapshot llega malformado o desactualizado, la app falla de forma clara y
 * controlada en vez de pintar `undefined`. Validar en el borde (al cargar) es la
 * defensa correcta para datos estáticos que se regeneran a mano.
 */
import { z } from 'zod';

const num = z.number();
const str = z.string();

export const metaSchema = z.object({
  ventana: z.object({ desde: num, hasta: num }),
  generado: str,
  corte_datos: str,
  fuentes: z.array(str),
  fuentes_detalle: z.array(z.object({ fuente: str, periodo: str, corte: str, ingesta: str })),
  notas: z.array(str),
});

export const panoramaSchema = z.object({
  kpis: z.object({ contratos: num, valor_total: num, valor_mediano: num, entidades: num, contratistas: num }),
  por_anio: z.array(z.object({ anio: num, contratos: num, valor: num })),
  top_sectores: z.array(z.object({ sector: str, contratos: num, valor: num })),
});

export const quienSchema = z.object({
  top_entidades: z.array(z.object({ nombre: str, nit: str, valor: num, contratos: num })),
  por_nivel: z.array(z.object({ nivel: str, valor: num, contratos: num })),
  por_sector: z.array(z.object({ sector: str, valor: num, contratos: num })),
});

export const comoSchema = z.object({
  por_modalidad: z.array(z.object({ modalidad: str, contratos: num, valor: num, pct: num })),
  modalidad_por_anio: z.array(z.object({ anio: num, modalidad: str, valor: num })),
  pct_directa: num,           // cuota por NÚMERO de contratos
  pct_competitiva: num,
  pct_directa_valor: num,     // cuota por VALOR (muy distinta a la anterior)
});

export const dondeSchema = z.object({
  por_departamento: z.array(z.object({ dane: str, departamento: str, valor: num, contratos: num })),
});

export const senalesSchema = z.object({
  concentracion: z.object({ top10_pct_valor: num, n_contratistas: num }),
  percentiles_valor: z.array(z.object({ p: num, valor: num })),
  pct_directa_nacional: num,
  notas_metodologicas: z.array(str),
});

export const procesosSchema = z.object({
  kpis: z.object({ total: num, pct_adjudicado: num, pct_cancelado: num }),
  por_modalidad: z.array(z.object({ modalidad: str, procesos: num, pct_adjudicado: num })),
});

export const planeacionSchema = z.object({
  kpis: z.object({ items: num, valor_planeado: num, entidades: num }),
  por_anio: z.array(z.object({ anio: num, valor: num })),
  top_categorias: z.array(z.object({ categoria: str, valor: num, items: num })),
  por_modalidad: z.array(z.object({ modalidad: str, valor: num, items: num })),
});

export const inversionSchema = z.object({
  kpis: z.object({ proyectos: num, valor_vigente: num, valor_pagado: num, pct_ejecucion: num }),
  por_sector: z.array(z.object({ sector: str, vigente: num, pagado: num })),
  por_vigencia: z.array(z.object({ anio: num, vigente: num, pagado: num })),
  por_fuente: z.array(z.object({ fuente: str, valor: num })),
});

export const ejecucionSchema = z.object({
  kpis: z.object({ contratado: num, facturado: num, pagado: num, pct_facturado: num, pct_pagado: num, cobertura_factura: num, cobertura_pago: num }),
  por_anio: z.array(z.object({ anio: num, contratado: num, facturado: num, pagado: num })),
});

export const sancionesSchema = z.object({
  kpis: z.object({ total: num, inhabilidad_vigente: num, inhabilidad_promedio_meses: num, inhabilidad_mediana_meses: num }),
  por_tipo: z.array(z.object({ tipo: str, n: num })),
  por_anio: z.array(z.object({ anio: num, n: num })),
  por_gravedad: z.array(z.object({ gravedad: str, n: num })),
});

export const electoralSchema = z.object({
  kpis: z.object({ aportes: num, monto_total: num, candidatos: num }),
  por_anio: z.array(z.object({ anio: num, monto: num })),
  top_partidos: z.array(z.object({ partido: str, monto: num, aportes: num })),
  por_departamento: z.array(z.object({ departamento: str, monto: num })),
});

export const crucesSchema = z.object({
  donante: z.object({ nits: num, contratos: num, valor: num, total_contratistas: num }),
  sancionado: z.object({ nits: num, contratos: num, valor: num }),
});

/** Señales/cruces agregados: items[clave] = { campo: número }. */
export const senalesExtraSchema = z.object({
  items: z.record(str, z.record(str, num)),
});

/** Secciones analíticas: items[clave] = { kpis, serie }. */
export const analisisSchema = z.object({
  items: z.record(
    str,
    z.object({
      kpis: z.record(str, z.union([num, str])),
      serie: z.array(z.record(str, z.unknown())),
    }),
  ),
});

/** KPIs analíticos nuevos (oleada 1): cadena BPIN, PAA por origen, mezcla por nivel. */
export const kpisExtraSchema = z.object({
  items: z.object({
    bpin_cadena: z.array(z.object({ anio: num, vigente: num, comprometido: num, obligado: num, pagado: num })),
    paa_origen: z.array(z.object({ origen: str, valor: num, items: num })),
    mezcla_nivel: z.array(z.object({ nivel: str, grupo: str, contratos: num, valor: num })),
  }),
});

/** Registro seccion→esquema; `usePublicData` valida si encuentra una entrada. */
export const SCHEMAS: Record<string, z.ZodTypeAny> = {
  meta: metaSchema,
  panorama: panoramaSchema,
  quien: quienSchema,
  como: comoSchema,
  donde: dondeSchema,
  senales: senalesSchema,
  procesos: procesosSchema,
  planeacion: planeacionSchema,
  inversion: inversionSchema,
  ejecucion: ejecucionSchema,
  sanciones: sancionesSchema,
  electoral: electoralSchema,
  cruces: crucesSchema,
  senales_extra: senalesExtraSchema,
  analisis: analisisSchema,
  kpis_extra: kpisExtraSchema,
};

export type MetaData = z.infer<typeof metaSchema>;
export type PanoramaData = z.infer<typeof panoramaSchema>;
export type QuienData = z.infer<typeof quienSchema>;
export type ComoData = z.infer<typeof comoSchema>;
export type DondeData = z.infer<typeof dondeSchema>;
export type SenalesData = z.infer<typeof senalesSchema>;
export type ProcesosData = z.infer<typeof procesosSchema>;
export type PlaneacionData = z.infer<typeof planeacionSchema>;
export type InversionData = z.infer<typeof inversionSchema>;
export type EjecucionData = z.infer<typeof ejecucionSchema>;
export type SancionesData = z.infer<typeof sancionesSchema>;
export type ElectoralData = z.infer<typeof electoralSchema>;
export type CrucesData = z.infer<typeof crucesSchema>;
export type SenalesExtra = z.infer<typeof senalesExtraSchema>;
export type AnalisisData = z.infer<typeof analisisSchema>;
export type KpisExtra = z.infer<typeof kpisExtraSchema>;
