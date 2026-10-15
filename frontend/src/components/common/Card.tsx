import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  padding?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  action,
  padding = '22px',
}) => {
  return (
    <div className={`glass-panel ${className}`} style={{ padding }}>
      {(title || action) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '18px',
            borderBottom: subtitle ? 'none' : '1px solid var(--border-subtle)',
            paddingBottom: subtitle ? '0' : '12px',
          }}
        >
          <div>
            {title && <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>{title}</h3>}
            {subtitle && <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
