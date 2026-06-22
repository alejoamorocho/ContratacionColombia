import { memo } from 'react';
import './HexLogo.css';

/** Logo de VECTORVI: grafo de nodos (hexágono). Los nodos cambian entre los
 *  colores de Colombia (amarillo, azul, rojo) en una oleada escalonada. */
function HexLogo({ size = 26, animated = true }: { size?: number; animated?: boolean }) {
  return (
    <svg
      className={animated ? 'hexlogo hexlogo--animated' : 'hexlogo'}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      aria-hidden="true"
    >
      <g stroke="var(--border-default, #30363d)" strokeWidth="1.2">
        <line x1="16" y1="4" x2="26.4" y2="10" />
        <line x1="26.4" y1="10" x2="26.4" y2="22" />
        <line x1="26.4" y1="22" x2="16" y2="28" />
        <line x1="16" y1="28" x2="5.6" y2="22" />
        <line x1="5.6" y1="22" x2="5.6" y2="10" />
        <line x1="5.6" y1="10" x2="16" y2="4" />
        <line x1="16" y1="16" x2="16" y2="4" />
        <line x1="16" y1="16" x2="26.4" y2="10" />
        <line x1="16" y1="16" x2="26.4" y2="22" />
        <line x1="16" y1="16" x2="16" y2="28" />
        <line x1="16" y1="16" x2="5.6" y2="22" />
        <line x1="16" y1="16" x2="5.6" y2="10" />
      </g>
      <circle className="hexnode hexnode-1" cx="16" cy="4" r="2.5" />
      <circle className="hexnode hexnode-2" cx="26.4" cy="10" r="2.5" />
      <circle className="hexnode hexnode-3" cx="26.4" cy="22" r="2.5" />
      <circle className="hexnode hexnode-4" cx="16" cy="28" r="2.5" />
      <circle className="hexnode hexnode-5" cx="5.6" cy="22" r="2.5" />
      <circle className="hexnode hexnode-6" cx="5.6" cy="10" r="2.5" />
      <circle className="hexnode hexnode-c" cx="16" cy="16" r="3.5" />
    </svg>
  );
}

export default memo(HexLogo);
