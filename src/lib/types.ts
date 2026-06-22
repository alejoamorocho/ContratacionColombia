export interface MetaData {
  ventana: { desde: number; hasta: number };
  generado: string;          // ISO date
  corte_datos: string;       // ISO date del último dato
  fuentes: string[];
  notas: string[];
}
export interface PanoramaData {
  kpis: { contratos: number; valor_total: number; entidades: number; contratistas: number };
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
export type SeccionData = {
  meta: MetaData; panorama: PanoramaData; quien: QuienData;
  como: ComoData; donde: DondeData; senales: SenalesData;
};
