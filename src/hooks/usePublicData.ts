import { useEffect, useState } from 'react';
import { BASE } from '../lib/config';

export function usePublicData<T = unknown>(seccion: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`${BASE}data/${seccion}.json`)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((j) => { if (alive) { setData(j as T); setError(null); } })
      .catch((e) => { if (alive) setError(e as Error); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [seccion]);

  return { data, loading, error };
}
