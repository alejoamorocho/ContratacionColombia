import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/DashboardLayout';
import { ADMIN_URL } from './lib/config';

const Inicio = lazy(() => import('./pages/Inicio'));
const Quien = lazy(() => import('./pages/Quien'));
const Como = lazy(() => import('./pages/Como'));
const Planea = lazy(() => import('./pages/Planea'));
const Invierte = lazy(() => import('./pages/Invierte'));
const Ejecuta = lazy(() => import('./pages/Ejecuta'));
const Donde = lazy(() => import('./pages/Donde'));
const Senales = lazy(() => import('./pages/Senales'));
const Acerca = lazy(() => import('./pages/Acerca'));

function AdminRedirect() {
  if (typeof window !== 'undefined') window.location.href = ADMIN_URL;
  return null;
}

function Cargando() {
  return <p style={{ color: 'var(--fg-muted)' }}>Cargando…</p>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Cargando />}>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route index element={<Inicio />} />
            <Route path="quien" element={<Quien />} />
            <Route path="como" element={<Como />} />
            <Route path="planea" element={<Planea />} />
            <Route path="invierte" element={<Invierte />} />
            <Route path="ejecuta" element={<Ejecuta />} />
            <Route path="donde" element={<Donde />} />
            <Route path="senales" element={<Senales />} />
            <Route path="acerca" element={<Acerca />} />
          </Route>
          <Route path="/admin" element={<AdminRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
