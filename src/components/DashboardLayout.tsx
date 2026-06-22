import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function DashboardLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: 'var(--space-6)', maxWidth: 1200 }}>
        <Outlet />
      </main>
    </div>
  );
}
