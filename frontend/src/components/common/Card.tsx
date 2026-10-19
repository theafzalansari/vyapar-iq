import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  headerIndicator?: string;
  padding?: string;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  action,
  headerIndicator,
  padding = '16px 20px',
  style,
}) => {
  return (
    <div className={`card-forensic ${className}`} style={{ padding, ...style }}>
      {(title || action) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px',
            borderBottom: subtitle ? 'none' : '1px solid var(--outline-variant)',
            paddingBottom: subtitle ? '0' : '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {headerIndicator && (
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: headerIndicator,
                  flexShrink: 0,
                }}
              />
            )}
            <div>
              {title && (
                <h3 className="font-headline-md" style={{ color: 'var(--on-surface)', fontSize: '1rem', fontWeight: 600 }}>
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="font-label-ui" style={{ color: 'var(--on-surface-variant)', marginTop: '2px', textTransform: 'uppercase' }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {action && <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
