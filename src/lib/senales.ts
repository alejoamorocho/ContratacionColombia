import type { Tone } from '../components/PageShell';

/** Una métrica a mostrar como KPI (referencia una clave del JSON senales_extra). */
export interface SenalKpi {
  metric: string;
  label: string;
  unidad?: 'COP' | '%';
}

export interface SenalConfig {
  label: string;        // etiqueta corta (sidebar / título)
  tone: Tone;
  pregunta: string;
  contexto: string;
  callout: string;      // encuadre neutral (no acusatorio)
  kpis: SenalKpi[];
  nota: string;         // metodología + caveat
}

const NEUTRAL = 'Es un dato descriptivo sobre registros públicos; no implica irregularidad y merece verificación caso por caso.';

/**
 * Catálogo de "señales" (cruces/indicadores) que el dashboard muestra como
 * AGREGADOS NACIONALES neutrales, sin nombres ni perfiles. Cada una se sirve
 * desde public/data/senales_extra.json (clave = key de este record).
 */
export const SENALES: Record<string, SenalConfig> = {
  adiciones: {
    label: 'Adiciones',
    tone: 'how',
    pregunta: '¿Cuántos contratos se prorrogan o adicionan?',
    contexto: 'Contratos de SECOP II que registran una prórroga (fecha de prórroga). Adicionar o prorrogar es una figura legal y frecuente; el dato describe su magnitud.',
    callout: `Una prórroga es un mecanismo contractual normal. ${NEUTRAL}`,
    kpis: [
      { metric: 'contratos', label: 'Contratos con prórroga' },
      { metric: 'valor', label: 'Valor de esos contratos', unidad: 'COP' },
    ],
    nota: 'Se cuentan los contratos con fecha_prorroga no nula en 2022–2026. No distingue el motivo de la prórroga (vigencias futuras, ajustes, etc.).',
  },
  contratos_no_planeados: {
    label: 'Contratos no planeados',
    tone: 'how',
    pregunta: '¿Qué entidades contratan por encima de lo que planearon?',
    contexto: 'Entidades-año cuyo valor contratado superó en más de 20% el valor de su Plan Anual de Adquisiciones (PAA) publicado para ese año.',
    callout: `Superar el plan puede deberse a urgencias, vigencias futuras o reprogramación. ${NEUTRAL}`,
    kpis: [
      { metric: 'casos', label: 'Entidades-año que superaron su PAA' },
      { metric: 'valor', label: 'Valor contratado en esos casos', unidad: 'COP' },
    ],
    nota: 'Requiere PAA publicado (solo 2024–2026): si una entidad no publicó PAA, NO aparece aquí (no se asume incumplimiento). Umbral: contratado > 1,2 × planeado.',
  },
  brechas_bpin: {
    label: 'Brechas de inversión',
    tone: 'how',
    pregunta: '¿Qué proyectos de inversión están poco ejecutados?',
    contexto: 'Proyectos de inversión (BPIN, ≥ $1.000 M) cuyo valor pagado es menor al 30% de su presupuesto vigente.',
    callout: `Una ejecución baja a mitad de vigencia es esperable; no equivale a un problema. ${NEUTRAL}`,
    kpis: [
      { metric: 'proyectos', label: 'Proyectos con ejecución < 30%' },
      { metric: 'valor', label: 'Brecha (vigente − pagado)', unidad: 'COP' },
    ],
    nota: 'BPIN es presupuesto vigente 2025–2026, no ejecución histórica. La brecha puede cerrarse durante la vigencia.',
  },
  prorroga_sin_ejecucion: {
    label: 'Prórroga sin ejecución',
    tone: 'signal',
    pregunta: '¿Hay contratos prorrogados con poca ejecución de pagos?',
    contexto: 'Contratos prorrogados (firmados hace ≥ 12 meses) cuyo valor pagado reportado es menor al 30% del valor.',
    callout: `El pago puede estar subreportado en la fuente o el contrato seguir vigente. ${NEUTRAL}`,
    kpis: [
      { metric: 'contratos', label: 'Contratos prorrogados con pago < 30%' },
      { metric: 'valor', label: 'Valor de esos contratos', unidad: 'COP' },
    ],
    nota: 'valor_pagado viene de SECOP II y está subreportado en parte de los contratos: el indicador puede sobrestimar la "no ejecución".',
  },
  monopolio_municipal: {
    label: 'Monopolio municipal',
    tone: 'signal',
    pregunta: '¿Hay municipios donde un solo contratista concentra el gasto?',
    contexto: 'Municipios (entre 30 y 5.000 contratos) donde un contratista concentra al menos el 50% del valor contratado.',
    callout: `En mercados locales pequeños la concentración puede ser natural (pocos proveedores). ${NEUTRAL}`,
    kpis: [
      { metric: 'municipios', label: 'Municipios con un contratista dominante' },
      { metric: 'valor', label: 'Valor concentrado', unidad: 'COP' },
    ],
    nota: 'Mide concentración por municipio, no por entidad. No identifica al contratista.',
  },
  supervisor_contratista: {
    label: 'Supervisor-contratista',
    tone: 'signal',
    pregunta: '¿Hay personas que supervisan y a la vez contratan con la misma entidad?',
    contexto: 'Personas cuyo documento aparece como supervisor de contratos y también como contratista de la misma entidad (≥ 2 de cada rol).',
    callout: `Puede tratarse de homónimos, roles en periodos distintos o vínculos legítimos. ${NEUTRAL}`,
    kpis: [
      { metric: 'personas', label: 'Personas en ambos roles' },
      { metric: 'valor', label: 'Valor contratado', unidad: 'COP' },
    ],
    nota: 'Coincidencia exacta de documento dentro de la misma entidad. No verifica simultaneidad temporal ni identidad real.',
  },
  puerta_giratoria: {
    label: 'Puerta giratoria',
    tone: 'signal',
    pregunta: '¿Hay servidores públicos que contratan con su propia entidad?',
    contexto: 'Personas registradas en SIGEP como servidores de una entidad que también figuran como contratistas de esa misma entidad.',
    callout: `Contratar por prestación de servicios es legal y común; SIGEP no trae fechas para distinguir antes/después. ${NEUTRAL}`,
    kpis: [
      { metric: 'personas', label: 'Personas en SIGEP que contratan con su entidad' },
      { metric: 'valor', label: 'Valor contratado', unidad: 'COP' },
    ],
    nota: 'Coincidencia documento↔NIT y entidad normalizada. No distingue vinculación paralela vs. rotación (SIGEP es histórico, sin fecha).',
  },
  redes_relaciones: {
    label: 'Redes de relaciones',
    tone: 'signal',
    pregunta: '¿Hay empresas que contratan compartiendo representante legal?',
    contexto: 'Empresas contratistas que comparten representante legal con otra empresa (según la red de relaciones).',
    callout: `Compartir representante legal es legal y frecuente entre empresas de un mismo grupo. ${NEUTRAL}`,
    kpis: [
      { metric: 'empresas', label: 'Empresas con representante compartido' },
      { metric: 'valor', label: 'Valor contratado', unidad: 'COP' },
    ],
    nota: 'Derivado de la tabla de relaciones (vínculo REPRESENTANTE_COMPARTIDO). No expone los NITs ni la estructura de la red.',
  },
  sancionado_otro_depto: {
    label: 'Sancionado en otro depto.',
    tone: 'signal',
    pregunta: '¿Hay sancionados que contratan en un departamento distinto al de su sanción?',
    contexto: 'NITs del registro de sanciones que firmaron contratos —posteriores a la sanción— en un departamento diferente al de la sanción.',
    callout: `Una sanción no siempre inhabilita y su alcance puede ser local o vencido. ${NEUTRAL}`,
    kpis: [
      { metric: 'contratistas', label: 'NITs sancionados que contratan en otro depto.' },
      { metric: 'valor', label: 'Valor contratado', unidad: 'COP' },
    ],
    nota: 'Coincidencia exacta de NIT; departamento de la entidad ≠ departamento de la sanción; contrato posterior a la sanción.',
  },
  donante_post_eleccion: {
    label: 'Donante post-elección',
    tone: 'signal',
    pregunta: '¿Cuántos donantes contratan después de la elección que financiaron?',
    contexto: 'NITs que aportaron a una campaña y firmaron contratos en los años posteriores a esa elección.',
    callout: `Aportar a una campaña es legal y la coincidencia no prueba relación alguna. ${NEUTRAL}`,
    kpis: [
      { metric: 'contratistas', label: 'Donantes que contratan después' },
      { metric: 'valor', label: 'Valor contratado', unidad: 'COP' },
    ],
    nota: 'Coincidencia exacta de NIT; contrato firmado el año siguiente a la elección o después. No establece causalidad.',
  },
  cluster_electoral: {
    label: 'Cluster electoral',
    tone: 'signal',
    pregunta: '¿Hay campañas con varios aportantes que luego contratan?',
    contexto: 'Campañas (por candidato) con al menos 3 aportantes, de los cuales 2 o más figuran también como contratistas del Estado.',
    callout: `Es un conteo de coincidencias por campaña; no nombra candidatos ni implica nada sobre ellos. ${NEUTRAL}`,
    kpis: [
      { metric: 'clusters', label: 'Campañas con aportantes que contratan' },
      { metric: 'aportantes_que_contratan', label: 'Aportantes que contratan' },
    ],
    nota: 'No se muestra valor para evitar doble conteo entre campañas. No se detallan candidatos, partidos ni montos.',
  },
};

export const SENAL_KEYS = Object.keys(SENALES);
