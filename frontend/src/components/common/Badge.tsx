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
  | 'primary';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  return <span className={`badge badge-${variant} ${className}`}>{children}</span>;
};
