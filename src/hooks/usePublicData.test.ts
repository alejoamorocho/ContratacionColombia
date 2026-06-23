import { renderHook, waitFor } from '@testing-library/react';
import { usePublicData } from './usePublicData';

const PANORAMA_VALIDO = {
  kpis: { contratos: 1, valor_total: 1, valor_mediano: 1, entidades: 1, contratistas: 1 },
  por_anio: [],
  top_sectores: [],
};

function mockFetch(payload: unknown, ok = true) {
  globalThis.fetch = vi.fn().mockResolvedValue({ ok, json: async () => payload } as Response);
}

it('carga y VALIDA el JSON de la sección contra su esquema Zod', async () => {
  mockFetch(PANORAMA_VALIDO);
  const { result } = renderHook(() => usePublicData('panorama'));
  expect(result.current.loading).toBe(true);
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.data).toEqual(PANORAMA_VALIDO);
  expect(result.current.error).toBeNull();
  expect(globalThis.fetch).toHaveBeenCalledWith(expect.stringContaining('/data/panorama.json'));
});

it('expone un error claro si el JSON NO cumple el esquema', async () => {
  mockFetch({ kpis: { contratos: 1 } }); // faltan campos requeridos
  const { result } = renderHook(() => usePublicData('panorama'));
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.data).toBeNull();
  expect(result.current.error).toBeInstanceOf(Error);
  expect(result.current.error?.message).toContain("Datos de 'panorama' inválidos");
});

it('devuelve el JSON tal cual si la sección no tiene esquema', async () => {
  mockFetch({ cualquier: 'cosa' });
  const { result } = renderHook(() => usePublicData('seccion_sin_esquema'));
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.data).toEqual({ cualquier: 'cosa' });
  expect(result.current.error).toBeNull();
});
