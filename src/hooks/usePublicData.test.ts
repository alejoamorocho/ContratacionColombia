import { renderHook, waitFor } from '@testing-library/react';
import { usePublicData } from './usePublicData';

beforeEach(() => {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: true, json: async () => ({ kpis: { contratos: 1 } }),
  } as Response);
});

it('carga el JSON de la sección y expone data', async () => {
  const { result } = renderHook(() => usePublicData('panorama'));
  expect(result.current.loading).toBe(true);
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.data).toEqual({ kpis: { contratos: 1 } });
  expect(globalThis.fetch).toHaveBeenCalledWith(expect.stringContaining('/data/panorama.json'));
});
