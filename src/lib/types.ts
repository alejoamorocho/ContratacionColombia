/**
 * Tipos del snapshot público. La forma se define UNA sola vez como esquemas Zod
 * en `schemas.ts` (validados en runtime al cargar); aquí solo se re-exportan los
 * tipos inferidos para conservar los nombres y no duplicar la definición.
 */
export type {
  MetaData,
  PanoramaData,
  QuienData,
  ComoData,
  DondeData,
  SenalesData,
  ProcesosData,
  PlaneacionData,
  InversionData,
  EjecucionData,
  SancionesData,
  ElectoralData,
  CrucesData,
  SenalesExtra,
  AnalisisData,
} from './schemas';

import type { MetaData, PanoramaData, QuienData, ComoData, DondeData, SenalesData } from './schemas';

export type SeccionData = {
  meta: MetaData; panorama: PanoramaData; quien: QuienData;
  como: ComoData; donde: DondeData; senales: SenalesData;
};
