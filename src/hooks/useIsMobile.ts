import { useEffect, useState } from 'react';

/**
 * Devuelve true cuando el viewport es menor al breakpoint (640px por defecto).
 * Se usa para adaptar las gráficas (ancho de ejes, truncado de etiquetas) en
 * móvil, donde un eje de categorías ancho dejaría las barras ilegibles.
 */
export function useIsMobile(breakpoint = 640): boolean {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < breakpoint,
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);
  return isMobile;
}
