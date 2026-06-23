import { useEffect, useState } from 'react';
import { BASE } from '../lib/config';
import { SCHEMAS } from '../lib/schemas';

/**
 * Carga `public/data/{seccion}.json` y, si existe un esquema Zod para esa
 * sección, lo VALIDA en runtime. Así un snapshot malformado o desactualizado
 * produce un error claro y controlado en lugar de romper la UI con datos
 * inesperados. Si no hay esquema, se devuelve el JSON tal cual (tipado por T).
 */
export function usePublicData<T = unknown>(seccion: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`${BASE}data/${seccion}.json`)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((j) => {
        if (!alive) return;
        const schema = SCHEMAS[seccion];
        if (schema) {
          const res = schema.safeParse(j);
          if (!res.success) {
            const issue = res.error.issues[0];
            throw new Error(`Datos de '${seccion}' inválidos: ${issue?.path.join('.') || '·'} — ${issue?.message ?? 'esquema no coincide'}`);
          }
          setData(res.data as T);
        } else {
          setData(j as T);
        }
        setError(null);
      })
      .catch((e) => { if (alive) setError(e as Error); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [seccion]);

  return { data, loading, error };
}
