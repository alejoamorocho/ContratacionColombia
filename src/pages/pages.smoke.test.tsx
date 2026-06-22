/**
 * Smoke test de runtime: monta cada sección con el snapshot real de public/data/
 * y verifica que renderiza sin lanzar (incluye las gráficas y el mapa).
 * Sustituye a la verificación visual cuando el navegador headless no está disponible.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Panorama from './Panorama';
import Quien from './Quien';
import Como from './Como';
import Donde from './Donde';
import Senales from './Senales';
import Acerca from './Acerca';

// Polyfill mínimo para Recharts (ResponsiveContainer usa ResizeObserver, ausente en jsdom)
class RO { observe() {} unobserve() {} disconnect() {} }
(globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = RO;

const PUBLIC_DIR = resolve(__dirname, '../../public');

beforeEach(() => {
  globalThis.fetch = vi.fn(async (url: string | URL) => {
    const path = String(url).replace(/^https?:\/\/[^/]+/, '').replace(/^\//, '');
    const file = readFileSync(resolve(PUBLIC_DIR, path), 'utf-8');
    return { ok: true, json: async () => JSON.parse(file), text: async () => file } as Response;
  }) as typeof fetch;
});

const wrap = (ui: React.ReactNode) => render(<MemoryRouter>{ui}</MemoryRouter>);

it('Panorama renderiza KPIs y títulos', async () => {
  wrap(<Panorama />);
  await waitFor(() => expect(screen.getByText(/Panorama nacional/i)).toBeTruthy());
  expect(screen.getByText(/Top sectores/i)).toBeTruthy();
});

it('Quién contrata renderiza', async () => {
  wrap(<Quien />);
  await waitFor(() => expect(screen.getByText(/Quién contrata/i)).toBeTruthy());
});

it('Cómo contrata renderiza', async () => {
  wrap(<Como />);
  await waitFor(() => expect(screen.getByText(/Cómo contrata/i)).toBeTruthy());
});

it('Dónde renderiza (incluye el mapa)', async () => {
  wrap(<Donde />);
  await waitFor(() => expect(screen.getByText(/Distribución territorial/i)).toBeTruthy());
});

it('Señales renderiza con tono neutral', async () => {
  wrap(<Senales />);
  await waitFor(() => expect(screen.getByText(/Estadística descriptiva/i)).toBeTruthy());
  expect(screen.getByText(/METODOLOGÍA/i)).toBeTruthy();
});

it('Acerca renderiza créditos', async () => {
  wrap(<Acerca />);
  await waitFor(() => expect(screen.getByText(/Amorocho/i)).toBeTruthy());
});
