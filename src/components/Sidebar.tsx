import { NavLink } from 'react-router-dom';
import { Home, Building2, GitBranch, ClipboardList, Landmark, Wallet, Map, Activity, Share2, Info } from 'lucide-react';
import './Sidebar.css';

const SECCIONES = [
  { to: '/', label: 'Inicio', icon: Home, tone: 'context', end: true },
  { to: '/quien', label: 'Quién contrata', icon: Building2, tone: 'who' },
  { to: '/como', label: 'Cómo contrata', icon: GitBranch, tone: 'how' },
  { to: '/planea', label: 'Qué se planea', icon: ClipboardList, tone: 'plan' },
  { to: '/invierte', label: 'En qué se invierte', icon: Landmark, tone: 'invest' },
  { to: '/ejecuta', label: 'Se ejecuta', icon: Wallet, tone: 'exec' },
  { to: '/donde', label: 'Dónde', icon: Map, tone: 'where' },
  { to: '/senales', label: 'Hay señales', icon: Activity, tone: 'signal' },
  { to: '/cruces', label: 'Se cruzan los datos', icon: Share2, tone: 'signal' },
  { to: '/acerca', label: 'Acerca', icon: Info, tone: 'context' },
];

export function Sidebar() {
  return (
    <nav className="sidebar">
      <div className="sidebar__brand">VECTOR<span className="sidebar__vi">VI</span></div>
      <ul>
        {SECCIONES.map((s) => (
          <li key={s.to}>
            <NavLink
              to={s.to}
              end={s.end}
              data-tone={s.tone}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              <s.icon size={16} /> <span>{s.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="sidebar__foot">Datos abiertos 2022–2026</div>
    </nav>
  );
}
