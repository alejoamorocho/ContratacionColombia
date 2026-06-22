import { NavLink } from 'react-router-dom';
import { BarChart3, Building2, GitBranch, Map, Activity, Info } from 'lucide-react';
import './Sidebar.css';

const SECCIONES = [
  { to: '/', label: 'Panorama', icon: BarChart3, end: true },
  { to: '/quien', label: 'Quién contrata', icon: Building2 },
  { to: '/como', label: 'Cómo contrata', icon: GitBranch },
  { to: '/donde', label: 'Dónde', icon: Map },
  { to: '/senales', label: 'Señales', icon: Activity },
  { to: '/acerca', label: 'Acerca', icon: Info },
];

export function Sidebar() {
  return (
    <nav className="sidebar">
      <div className="sidebar__brand">VECTORVI</div>
      <ul>
        {SECCIONES.map((s) => (
          <li key={s.to}>
            <NavLink to={s.to} end={s.end} className={({ isActive }) => isActive ? 'active' : ''}>
              <s.icon size={16} /> <span>{s.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="sidebar__foot">Datos 2022–2026 · SECOP II</div>
    </nav>
  );
}
