import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/DashboardLayout';
import { ADMIN_URL } from './lib/config';
import Panorama from './pages/Panorama';
import Quien from './pages/Quien';
import Como from './pages/Como';
import Donde from './pages/Donde';
import Senales from './pages/Senales';
import Acerca from './pages/Acerca';

function AdminRedirect() {
  if (typeof window !== 'undefined') window.location.href = ADMIN_URL;
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route index element={<Panorama />} />
          <Route path="quien" element={<Quien />} />
          <Route path="como" element={<Como />} />
          <Route path="donde" element={<Donde />} />
          <Route path="senales" element={<Senales />} />
          <Route path="acerca" element={<Acerca />} />
        </Route>
        <Route path="/admin" element={<AdminRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
