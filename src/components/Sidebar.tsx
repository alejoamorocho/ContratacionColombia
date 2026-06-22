import { NavLink } from 'react-router-dom';
import { Home, Building2, GitBranch, Map, Activity, Info } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import './Sidebar.css';

interface SubItem { to: string; label: string; end?: boolean }
type Entry =
  | { type: 'link'; to: string; label: string; icon: LucideIcon; tone: string; end?: boolean }
  | { type: 'group'; label: string; icon: LucideIcon; tone: string; items: SubItem[] };

const NAV: Entry[] = [
  { type: 'link', to: '/', label: 'Inicio', icon: Home, tone: 'context', end: true },
  { type: 'link', to: '/quien', label: 'Quién contrata', icon: Building2, tone: 'who' },
  {
    type: 'group', label: 'Cómo contrata', icon: GitBranch, tone: 'how',
    items: [
      { to: '/como', label: 'Modalidades y procesos' },
      { to: '/planea', label: 'Planeación (PAA)' },
      { to: '/invierte', label: 'Inversión (BPIN)' },
      { to: '/ejecuta', label: 'Ejecución y pagos' },
      { to: '/senal/adiciones', label: 'Adiciones' },
      { to: '/senal/contratos_no_planeados', label: 'Contratos no planeados' },
      { to: '/senal/brechas_bpin', label: 'Brechas de inversión' },
    ],
  },
  { type: 'link', to: '/donde', label: 'Dónde', icon: Map, tone: 'where' },
  {
    type: 'group', label: 'Hay señales', icon: Activity, tone: 'signal',
    items: [
      { to: '/senales', label: 'Concentración y registros' },
      { to: '/cruces', label: 'Donantes y sancionados' },
      { to: '/senal/prorroga_sin_ejecucion', label: 'Prórroga sin ejecución' },
      { to: '/senal/monopolio_municipal', label: 'Monopolio municipal' },
      { to: '/senal/supervisor_contratista', label: 'Supervisor-contratista' },
      { to: '/senal/puerta_giratoria', label: 'Puerta giratoria' },
      { to: '/senal/redes_relaciones', label: 'Redes de relaciones' },
      { to: '/senal/sancionado_otro_depto', label: 'Sancionado en otro depto.' },
      { to: '/senal/cluster_electoral', label: 'Cluster electoral' },
      { to: '/senal/insolvente', label: 'Contratista insolvente' },
      { to: '/senal/donante_post_eleccion', label: 'Donante post-elección' },
    ],
  },
  { type: 'link', to: '/acerca', label: 'Acerca', icon: Info, tone: 'context' },
];

export function Sidebar() {
  return (
    <nav className="sidebar">
      <div className="sidebar__brand">VECTOR<span className="sidebar__vi">VI</span></div>
      <ul>
        {NAV.map((e) =>
          e.type === 'link' ? (
            <li key={e.to}>
              <NavLink to={e.to} end={e.end} data-tone={e.tone} className={({ isActive }) => (isActive ? 'active' : '')}>
                <e.icon size={16} /> <span>{e.label}</span>
              </NavLink>
            </li>
          ) : (
            <li key={e.label} className="sidebar__group" data-tone={e.tone}>
              <div className="sidebar__group-label">
                <e.icon size={15} /> <span>{e.label}</span>
              </div>
              <ul className="sidebar__sub">
                {e.items.map((s) => (
                  <li key={s.to}>
                    <NavLink to={s.to} end={s.end} data-tone={e.tone} className={({ isActive }) => (isActive ? 'active' : '')}>
                      <span>{s.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </li>
          ),
        )}
      </ul>
      <div className="sidebar__foot">Datos abiertos 2022–2026</div>
    </nav>
  );
}
