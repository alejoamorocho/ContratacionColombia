import type { Tone } from '../components/PageShell';

export interface AnalisisKpi {
  metric: string;
  label: string;
  unidad?: 'COP' | '%';
}

export interface AnalisisChart {
  tipo: 'bar' | 'line';
  xKey: string;
  series: { key: string; label?: string; color?: string }[];
  layout?: 'horizontal' | 'vertical';
  titulo: string;
}

export interface AnalisisConfig {
  label: string;
  tone: Tone;
  pregunta: string;
  contexto: string;
  callout: string;
  kpis: AnalisisKpi[];
  chart?: AnalisisChart;
  nota: string;
}

/**
 * Secciones analíticas ("datos valiosos"): KPIs + un desglose. Datos desde
 * public/data/analisis.json (clave = key). Todas verificadas contra BigQuery.
 */
export const ANALISIS: Record<string, AnalisisConfig> = {
  genero: {
    label: 'Género de quien firma',
    tone: 'who',
    pregunta: '¿Quién firma los contratos: hombres o mujeres, y reciben lo mismo?',
    contexto: 'Cada contrato registra el género del representante legal del contratista. Comparamos cuántos contratos firman mujeres frente a hombres y qué porcentaje del valor recibe cada grupo.',
    callout: 'Las mujeres firman la mayoría de los contratos (53%), pero el valor adjudicado a contratistas con representante legal mujer (41%) queda por debajo de su peso en número.',
    kpis: [
      { metric: 'pct_contratos_mujer', label: 'Contratos firmados por mujeres', unidad: '%' },
      { metric: 'pct_valor_mujer', label: 'Valor adjudicado a mujeres', unidad: '%' },
      { metric: 'mediana_valor_mujer', label: 'Valor mediano · mujer', unidad: 'COP' },
      { metric: 'mediana_valor_hombre', label: 'Valor mediano · hombre', unidad: 'COP' },
    ],
    chart: {
      tipo: 'line', xKey: 'anio',
      series: [
        { key: 'pct_contratos_mujer', label: '% contratos (mujeres)' },
        { key: 'pct_valor_mujer', label: '% valor (mujeres)' },
      ],
      titulo: 'Participación de mujeres por año: contratos vs. valor (%)',
    },
    nota: 'El género corresponde al REPRESENTANTE LEGAL, no a la propiedad de la empresa (98% de cobertura). Los porcentajes se calculan sobre la base mujer+hombre. La mediana es robusta a contratos de cuantía extrema.',
  },
  pyme: {
    label: 'PYMEs',
    tone: 'who',
    pregunta: '¿Cuánta contratación llega a pequeñas y medianas empresas?',
    contexto: 'Contratos marcados como PYME por el propio contratista. Se mide su peso en número de contratos y en valor, y cómo varía según la modalidad de contratación.',
    callout: 'Las PYME firman cerca de 1 de cada 8 contratos y captan algo más de 1 de cada 5 pesos: pesan más en valor que en número. Su participación es alta en las modalidades competitivas de menor cuantía y baja en la contratación directa.',
    kpis: [
      { metric: 'pct_contratos_pyme', label: 'Contratos firmados por PYME', unidad: '%' },
      { metric: 'pct_valor_pyme', label: 'Del valor total va a PYME', unidad: '%' },
      { metric: 'valor_total_pyme', label: 'Valor contratado con PYME', unidad: 'COP' },
    ],
    chart: {
      tipo: 'bar', xKey: 'modalidad',
      series: [{ key: 'pct_contratos_pyme', label: '% de contratos PYME' }],
      layout: 'horizontal',
      titulo: 'Participación PYME dentro de cada modalidad (% de contratos)',
    },
    nota: 'es_pyme es autodeclarado por el contratista en SECOP II, no auditado. El 12,8% nacional MEZCLA universos: el denominador incluye la contratación directa (≈78% del total, dominada por personas naturales donde el concepto PYME casi no aplica), lo que diluye la cifra. El indicador más informativo es la participación PYME DENTRO de las modalidades competitivas, mucho más alta. El porcentaje por modalidad es sobre el total de contratos de esa modalidad.',
  },
  duracion: {
    label: 'Duración',
    tone: 'how',
    pregunta: '¿Cuánto duran los contratos del Estado?',
    contexto: 'El plazo contratado es el tiempo pactado entre la fecha de inicio y la de fin del contrato. La mitad se pactan a 151 días o menos; la modalidad marca el ritmo.',
    callout: 'La mitad de los contratos se pactan a 151 días o menos (unos cinco meses); 1 de cada 10 supera los 333 días.',
    kpis: [
      { metric: 'mediana_dias', label: 'Plazo mediano (días)' },
      { metric: 'p25', label: 'Plazo corto · p25 (días)' },
      { metric: 'p75', label: 'Plazo largo · p75 (días)' },
      { metric: 'p90', label: 'Muy largo · p90 (días)' },
    ],
    chart: {
      tipo: 'bar', xKey: 'modalidad',
      series: [{ key: 'mediana_dias', label: 'Mediana (días)' }],
      layout: 'horizontal',
      titulo: 'Plazo mediano contratado por modalidad (días)',
    },
    nota: 'Plazo CONTRATADO (fecha_inicio → fecha_fin), no ejecución real. Calculado con DATE_DIFF; se excluyen plazos fuera de [1, 3650] días.',
  },
  estacionalidad: {
    label: 'Estacionalidad',
    tone: 'how',
    pregunta: '¿En qué meses se mueve la contratación pública?',
    contexto: 'Distribución de los contratos por mes de firma, agregando los años completos 2023–2025. Se excluyen 2022 (su primer semestre tuvo cobertura severamente baja en SECOP II, que inflaba enero) y 2026 (vigencia parcial).',
    callout: 'Enero concentra el 13,6% de los contratos (1,6 veces un mes promedio): es el arranque de vigencia. Diciembre firma pocos contratos pero el mayor valor del año (17,3%), muy influido por unos pocos contratos de cuantía extrema.',
    kpis: [
      { metric: 'pct_contratos_enero', label: 'Contratos firmados en enero', unidad: '%' },
      { metric: 'ratio_enero_promedio', label: 'Enero vs. mes promedio (×)' },
      { metric: 'pct_valor_diciembre', label: 'Valor adjudicado en diciembre', unidad: '%' },
      { metric: 'pct_contratos_q1', label: 'Contratos en el primer trimestre', unidad: '%' },
    ],
    chart: {
      tipo: 'bar', xKey: 'mes',
      series: [{ key: 'contratos', label: 'Contratos firmados' }],
      titulo: 'Contratos por mes de firma (2022–2025 agregados)',
    },
    nota: 'Calculado solo sobre 2023–2025 (años bien cubiertos): incluir 2022 inflaba enero por el subreporte del 1.er semestre. Enero concentra las firmas de inicio de vigencia (prestación de servicios): es un fenómeno administrativo del calendario presupuestal, no una señal. El pico de VALOR de diciembre es sensible a unos pocos contratos de cuantía extrema.',
  },
  financiacion: {
    label: 'Financiación',
    tone: 'how',
    pregunta: '¿Con qué dinero se contrata?',
    contexto: 'Cada contrato puede reportar de qué bolsa pública sale su valor: el PGN, los recursos propios de la entidad, el SGP y las regalías. Se suma, por bolsa, el valor de los contratos firmados entre 2022 y 2026.',
    callout: 'El PGN financia $204 billones —más que las otras tres fuentes juntas—, seguido por los recursos propios con $119 billones.',
    kpis: [
      { metric: 'pgn', label: 'PGN — Presupuesto Nación', unidad: 'COP' },
      { metric: 'propios', label: 'Recursos propios', unidad: 'COP' },
      { metric: 'sgp', label: 'SGP — Participaciones', unidad: 'COP' },
      { metric: 'regalias', label: 'Regalías', unidad: 'COP' },
    ],
    chart: {
      tipo: 'bar', xKey: 'fuente',
      series: [{ key: 'valor', label: 'Valor contratado' }],
      layout: 'horizontal',
      titulo: 'Valor contratado por fuente de financiación (2022–2026)',
    },
    nota: 'Solo ~63% del valor total contratado tiene fuente reportada en estas columnas; las cifras operan sobre el monto con fuente atribuida, no sobre el total. Las bolsas no son excluyentes: un contrato puede combinar varias.',
  },
  crecimiento: {
    label: '¿En qué creció?',
    tone: 'where',
    pregunta: '¿En qué creció y en qué se redujo la contratación 2023–2025?',
    contexto: 'Variación del valor contratado por sector entre 2023 y 2025 (se omite 2022 por su baja cobertura). Solo sectores con ≥300 contratos al año; se excluyen alzas que dependen de un único contrato de cuantía extrema.',
    callout: 'De 31 sectores comparables, 6 redujeron su valor entre 2023 y 2025. Aseo fue el de mayor alza (+140%); Arrendamiento, la mayor caída (−31%).',
    kpis: [
      { metric: 'valor_2025', label: 'Valor contratado 2025', unidad: 'COP' },
      { metric: 'valor_2023', label: 'Valor contratado 2023', unidad: 'COP' },
      { metric: 'sector_mayor_alza', label: 'Sector de mayor alza' },
      { metric: 'n_sectores_cayeron', label: 'Sectores que se redujeron' },
    ],
    chart: {
      tipo: 'bar', xKey: 'sector',
      series: [{ key: 'var_pct', label: 'Variación 2023→2025 (%)' }],
      layout: 'horizontal',
      titulo: 'Variación del valor contratado por sector, 2023→2025 (%)',
    },
    nota: 'Variación nominal, no ajustada por inflación; excluye 2026 (año parcial). Sectores con ≥300 contratos/año; se descartan alzas dominadas por un solo contrato. La variación no implica irregularidad.',
  },
};

export const ANALISIS_KEYS = Object.keys(ANALISIS);
