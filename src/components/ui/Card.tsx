import { memo } from 'react';
import type { CSSProperties, ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'glow' | 'gradient-border';
  style?: CSSProperties;
  className?: string;
}

function Card({ children, variant = 'default', style, className = '' }: CardProps) {
  if (variant === 'glow') {
    return (
      <div className={`card-glow ${className}`} style={style}>
        {children}
      </div>
    );
  }

  if (variant === 'gradient-border') {
    return (
      <div className={`card-gradient-border ${className}`} style={style}>
        {children}
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        background: 'var(--bg-overlay)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius)',
        padding: 'var(--space-4)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default memo(Card);
