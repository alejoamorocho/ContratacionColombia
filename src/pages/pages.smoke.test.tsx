/**
 * Smoke test de runtime: monta cada sección con el snapshot real de public/data/
 * y verifica que renderiza sin lanzar (incluye gráficas, mapa y el shell).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Senal from './Senal';
import Analisis from './Analisis';
import Inicio from './Inicio';
import Quien from './Quien';
import Como from './Como';
import Planea from './Planea';
import Invierte from './Invierte';
import Ejecuta from './Ejecuta';
import Donde from './Donde';
import Senales from './Senales';
import Cruces from './Cruces';
import Acerca from './Acerca';

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

const PAGINAS: { nombre: string; Comp: React.ComponentType; texto: RegExp }[] = [
  { nombre: 'Inicio', Comp: Inicio, texto: /Laboratorio de datos/i },
  { nombre: 'Quién', Comp: Quien, texto: /¿Quién contrata\?/i },
  { nombre: 'Cómo', Comp: Como, texto: /¿Cómo contrata\?/i },
  { nombre: 'Planea', Comp: Planea, texto: /¿Qué se planea\?/i },
  { nombre: 'Invierte', Comp: Invierte, texto: /¿En qué se invierte\?/i },
  { nombre: 'Ejecuta', Comp: Ejecuta, texto: /¿Se ejecuta\?/i },
  { nombre: 'Dónde', Comp: Donde, texto: /¿Dónde\?/i },
  { nombre: 'Señales', Comp: Senales, texto: /¿Hay señales\?/i },
  { nombre: 'Cruces', Comp: Cruces, texto: /¿Se cruzan los datos\?/i },
  { nombre: 'Acerca', Comp: Acerca, texto: /laboratorio de datos/i },
];

PAGINAS.forEach(({ nombre, Comp, texto }) => {
  it(`${nombre} renderiza sin romperse`, async () => {
    wrap(<Comp />);
    await waitFor(() => expect(screen.getAllByText(texto).length).toBeGreaterThan(0));
  });
});

it('Senal (genérica) renderiza una señal con datos', async () => {
  render(
    <MemoryRouter initialEntries={['/senal/adiciones']}>
      <Routes>
        <Route path="/senal/:key" element={<Senal />} />
      </Routes>
    </MemoryRouter>,
  );
  await waitFor(() => expect(screen.getAllByText(/prorrog/i).length).toBeGreaterThan(0));
});

it('Analisis (genérica) renderiza una analítica con datos', async () => {
  render(
    <MemoryRouter initialEntries={['/analisis/genero']}>
      <Routes>
        <Route path="/analisis/:key" element={<Analisis />} />
      </Routes>
    </MemoryRouter>,
  );
  await waitFor(() => expect(screen.getAllByText(/mujeres|firma/i).length).toBeGreaterThan(0));
});
