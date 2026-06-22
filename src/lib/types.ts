export interface MetaData {
  ventana: { desde: number; hasta: number };
  generado: string;          // ISO date
  corte_datos: string;       // ISO date del último dato
  fuentes: string[];
  fuentes_detalle: { fuente: string; periodo: string; corte: string; ingesta: string }[];
  notas: string[];
}
export interface PanoramaData {
  kpis: { contratos: number; valor_total: number; valor_mediano: number; entidades: number; contratistas: number };
  por_anio: { anio: number; contratos: number; valor: number }[];
  top_sectores: { sector: string; contratos: number; valor: number }[];
}
export interface QuienData {
  top_entidades: { nombre: string; nit: string; valor: number; contratos: number }[];
  por_nivel: { nivel: string; valor: number; contratos: number }[];
  por_sector: { sector: string; valor: number; contratos: number }[];
}
export interface ComoData {
  por_modalidad: { modalidad: string; contratos: number; valor: number; pct: number }[];
  modalidad_por_anio: { anio: number; modalidad: string; valor: number }[];
  pct_directa: number;
  pct_competitiva: number;
}
export interface DondeData {
  por_departamento: { dane: string; departamento: string; valor: number; contratos: number }[];
}
export interface SenalesData {
  concentracion: { top10_pct_valor: number; n_contratistas: number };
  percentiles_valor: { p: number; valor: number }[];
  pct_directa_nacional: number;
  notas_metodologicas: string[];
}
export interface ProcesosData {
  kpis: { total: number; pct_adjudicado: number; pct_cancelado: number };
  por_modalidad: { modalidad: string; procesos: number; pct_adjudicado: number }[];
}
export interface PlaneacionData {
  kpis: { items: number; valor_planeado: number; entidades: number };
  por_anio: { anio: number; valor: number }[];
  top_categorias: { categoria: string; valor: number; items: number }[];
  por_modalidad: { modalidad: string; valor: number; items: number }[];
}
export interface InversionData {
  kpis: { proyectos: number; valor_vigente: number; valor_pagado: number; pct_ejecucion: number };
  por_sector: { sector: string; vigente: number; pagado: number }[];
  por_vigencia: { anio: number; vigente: number; pagado: number }[];
  por_fuente: { fuente: string; valor: number }[];
}
export interface EjecucionData {
  kpis: { contratado: number; facturado: number; pagado: number; pct_facturado: number; pct_pagado: number };
  por_anio: { anio: number; contratado: number; facturado: number; pagado: number }[];
}
export interface SancionesData {
  kpis: { total: number; inhabilidad_vigente: number; inhabilidad_promedio_meses: number };
  por_tipo: { tipo: string; n: number }[];
  por_anio: { anio: number; n: number }[];
  por_gravedad: { gravedad: string; n: number }[];
}
export interface ElectoralData {
  kpis: { aportes: number; monto_total: number; candidatos: number };
  por_anio: { anio: number; monto: number }[];
  top_partidos: { partido: string; monto: number; aportes: number }[];
  por_departamento: { departamento: string; monto: number }[];
}
export interface CrucesData {
  donante: { nits: number; contratos: number; valor: number; total_contratistas: number };
  sancionado: { nits: number; contratos: number; valor: number };
}
export type SeccionData = {
  meta: MetaData; panorama: PanoramaData; quien: QuienData;
  como: ComoData; donde: DondeData; senales: SenalesData;
};
