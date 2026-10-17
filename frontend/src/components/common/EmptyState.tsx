import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <div
      className={`glass-panel ${className}`}
      style={{
        padding: '48px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {Icon && (
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: 'var(--primary-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)',
            marginBottom: '16px',
          }}
        >
          <Icon size={28} />
        </div>
      )}
      <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 600 }}>
        {title}
      </h3>
      <p
        style={{
          fontSize: '0.86rem',
          color: 'var(--text-muted)',
          maxWidth: '440px',
          lineHeight: 1.5,
          marginBottom: actionText || secondaryActionText ? '20px' : '0',
        }}
      >
        {description}
      </p>
      {(actionText || secondaryActionText) && (
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {secondaryActionText && onSecondaryAction && (
            <Button variant="secondary" size="sm" onClick={onSecondaryAction}>
              {secondaryActionText}
            </Button>
          )}
          {actionText && onAction && (
            <Button variant="primary" size="sm" onClick={onAction}>
              {actionText}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
