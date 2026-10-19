import React from 'react';

export type BadgeVariant =
  | 'income'
  | 'expense'
  | 'critical'
  | 'high'
  | 'medium'
  | 'low'
  | 'info'
  | 'default'
  | 'success'
  | 'warning'
  | 'primary'
  | 'verified';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  pulse?: boolean;
  size?: 'sm' | 'md';
  className?: string;
  style?: React.CSSProperties;
}

const dotColors: Record<BadgeVariant, string> = {
  income: 'var(--tertiary)',
  success: 'var(--tertiary)',
  verified: 'var(--tertiary)',
  expense: 'var(--error)',
  critical: 'var(--error)',
  high: 'var(--warning)',
  warning: 'var(--warning)',
  medium: 'var(--secondary)',
  info: 'var(--secondary)',
  primary: 'var(--primary)',
  low: 'var(--outline)',
  default: 'var(--outline)',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  dot = false,
  pulse = false,
  size = 'md',
  className = '',
  style,
}) => {
  const isSm = size === 'sm';

  return (
    <span
      className={`badge badge-${variant} ${className}`}
      style={{
        padding: isSm ? '2px 6px' : '3px 8px',
        fontSize: isSm ? '0.625rem' : '0.6875rem',
        ...style,
      }}
    >
      {dot && (
        <span
          className="badge-dot"
          style={{
            backgroundColor: dotColors[variant] || 'currentColor',
            position: 'relative',
          }}
        >
          {pulse && (
            <span
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                backgroundColor: dotColors[variant] || 'currentColor',
                animation: 'pulse 1.4s infinite ease-out',
                opacity: 0.75,
              }}
            />
          )}
        </span>
      )}
      {children}
    </span>
  );
};

export default Badge;
