import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import './DashboardLayout.css';

export function DashboardLayout() {
  return (
    <div className="layout">
      <Sidebar />
      <main className="layout__main">
        <Outlet />
      </main>
    </div>
  );
}
