import { Link } from 'react-router-dom';
import { Building2, GitBranch, ClipboardList, TrendingUp, Wallet, Map, Activity, Network } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { usePublicData } from '../hooks/usePublicData';
import type { PanoramaData, MetaData } from '../lib/types';
import KPICard from '../components/charts/KPICard';
import VLineChart from '../components/charts/VLineChart';
import ChartFootnote, { NOTA_ANIO_PARCIAL } from '../components/charts/ChartFootnote';
import { DisclaimerFooter } from '../components/DisclaimerFooter';

const MODULOS: { to: string; tone: string; q: string; blurb: string; icon: LucideIcon }[] = [
  { to: '/quien', tone: 'who', icon: Building2, q: '¿Quién contrata?', blurb: 'Qué entidades gastan más y qué contratistas reciben más recursos del Estado.' },
  { to: '/como', tone: 'how', icon: GitBranch, q: '¿Cómo contrata?', blurb: 'Por qué mecanismos se contrata y qué tan competidas son las licitaciones.' },
  { to: '/planea', tone: 'plan', icon: ClipboardList, q: '¿Qué se planea?', blurb: 'Lo que las entidades planean comprar según su Plan Anual de Adquisiciones.' },
  { to: '/invierte', tone: 'invest', icon: TrendingUp, q: '¿En qué se invierte?', blurb: 'Ejecución de los proyectos de inversión pública por sector y vigencia.' },
  { to: '/ejecuta', tone: 'exec', icon: Wallet, q: '¿Se ejecuta?', blurb: 'Cuánto se factura y se paga frente a lo que se contrata.' },
  { to: '/donde', tone: 'where', icon: Map, q: '¿Dónde?', blurb: 'Cómo se distribuye la contratación por departamento, en un mapa de Colombia.' },
  { to: '/senales', tone: 'signal', icon: Activity, q: '¿Hay señales?', blurb: 'Concentración, sanciones y financiación electoral. Estadística descriptiva, sin juicios.' },
  { to: '/cruces', tone: 'signal', icon: Network, q: '¿Se cruzan los datos?', blurb: 'Coincidencias factuales entre registros (donantes, sancionados). Sin acusar a nadie.' },
];

export default function Inicio() {
  const { data: pan } = usePublicData<PanoramaData>('panorama');
  const { data: meta } = usePublicData<MetaData>('meta');

  return (
    <div data-tone="context">
      {/* Hero editorial */}
      <header style={{ marginBottom: 'var(--space-6)' }}>
        <p className="shell-overline" style={{ color: 'var(--brand)' }}>
          // Laboratorio de datos públicos
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(26px, 4vw, 40px)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            margin: '0 0 var(--space-3)',
            maxWidth: '20ch',
          }}
        >
          Qué pasó con la contratación pública colombiana
        </h1>
        <p style={{ color: 'var(--fg-muted)', maxWidth: '72ch', lineHeight: 1.6, fontSize: 16 }}>
          Tomamos datos abiertos oficiales y los organizamos para que cualquier persona
          entienda, sin tecnicismos, cómo se mueve el dinero público en Colombia
          {meta ? ` entre ${meta.ventana.desde} y ${meta.ventana.hasta}` : ''}.{' '}
          <strong style={{ color: 'var(--fg-default)' }}>Describe, no juzga:</strong> aquí
          hay datos organizados, no acusaciones.
        </p>
      </header>

      {/* Resumen nacional */}
      {pan && (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))',
              gap: 'var(--space-4)',
              marginBottom: 'var(--space-6)',
            }}
          >
            <KPICard label="Contratos" valor={pan.kpis.contratos} />
            <KPICard label="Valor total" valor={pan.kpis.valor_total} unidad="COP" />
            <KPICard label="Valor mediano" valor={pan.kpis.valor_mediano} unidad="COP" />
            <KPICard label="Entidades" valor={pan.kpis.entidades} />
            <KPICard label="Contratistas" valor={pan.kpis.contratistas} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', margin: '0 0 var(--space-3)' }}>
            Valor contratado por año
          </h2>
          <VLineChart data={pan.por_anio} xKey="anio" lines={[{ key: 'valor', color: 'var(--brand)' }]} />
          <ChartFootnote>{NOTA_ANIO_PARCIAL}</ChartFootnote>
        </>
      )}

      {/* Navegación por preguntas */}
      <h2 style={{ fontFamily: 'var(--font-heading)', margin: 'var(--space-8) 0 var(--space-2)' }}>
        Explora por preguntas
      </h2>
      <p style={{ color: 'var(--fg-muted)', marginBottom: 'var(--space-5)' }}>
        Cada módulo plantea una pregunta y la responde con datos.
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))',
          gap: 'var(--space-4)',
        }}
      >
        {MODULOS.map((m) => (
          <Link
            key={m.to}
            to={m.to}
            data-tone={m.tone}
            className="card q-card"
            style={{
              position: 'relative',
              overflow: 'hidden',
              padding: 'var(--space-5)',
              background: 'var(--bg-overlay)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius)',
              textDecoration: 'none',
              display: 'block',
            }}
          >
            <span className="tone-topbar" />
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: 10,
                marginBottom: 'var(--space-3)',
                background: 'color-mix(in srgb, var(--shell-tone) 16%, transparent)',
                border: '1px solid color-mix(in srgb, var(--shell-tone) 30%, transparent)',
                color: 'var(--shell-tone)',
              }}
            >
              <m.icon size={20} strokeWidth={2} />
            </span>
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 18,
                margin: '0 0 var(--space-2)',
                color: 'var(--shell-tone)',
              }}
            >
              {m.q}
            </h3>
            <p style={{ color: 'var(--fg-muted)', fontSize: 14, lineHeight: 1.5, margin: 0 }}>
              {m.blurb}
            </p>
            <span style={{ color: 'var(--shell-tone)', fontSize: 13, marginTop: 'var(--space-3)', display: 'inline-block' }}>
              Explorar →
            </span>
          </Link>
        ))}
      </div>

      <DisclaimerFooter />
    </div>
  );
}
