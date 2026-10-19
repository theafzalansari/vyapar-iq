import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface StateAlertProps {
  type?: 'error' | 'warning' | 'info' | 'success';
  title?: string;
  message: string;
  onRetry?: () => void;
  actionText?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const StateAlert: React.FC<StateAlertProps> = ({
  type = 'info',
  title,
  message,
  onRetry,
  actionText = 'Retry',
  className = '',
  style,
}) => {
  const configs = {
    error: {
      icon: <AlertCircle size={18} color="var(--error)" />,
      bg: 'var(--error-container)',
      border: 'rgba(244, 63, 94, 0.35)',
      text: 'var(--error)',
      titleColor: 'var(--on-surface)',
    },
    warning: {
      icon: <AlertTriangle size={18} color="var(--warning)" />,
      bg: 'var(--warning-bg)',
      border: 'rgba(245, 158, 11, 0.35)',
      text: 'var(--warning)',
      titleColor: 'var(--on-surface)',
    },
    info: {
      icon: <Info size={18} color="var(--secondary)" />,
      bg: 'var(--secondary-container)',
      border: 'rgba(14, 165, 233, 0.35)',
      text: 'var(--secondary)',
      titleColor: 'var(--on-surface)',
    },
    success: {
      icon: <CheckCircle size={18} color="var(--tertiary)" />,
      bg: 'var(--tertiary-container)',
      border: 'rgba(16, 185, 129, 0.35)',
      text: 'var(--tertiary)',
      titleColor: 'var(--on-surface)',
    },
  };

  const config = configs[type];

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '12px 16px',
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: 'var(--rounded-md)',
        marginBottom: '16px',
        ...style,
      }}
    >
      <div style={{ flexShrink: 0, marginTop: '2px' }}>{config.icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && (
          <h4
            className="font-headline-md"
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: config.titleColor,
              marginBottom: '2px',
            }}
          >
            {title}
          </h4>
        )}
        <p className="font-body-sm" style={{ color: config.text, lineHeight: 1.4 }}>
          {message}
        </p>
      </div>
      {onRetry && (
        <Button
          variant="secondary"
          size="xs"
          onClick={onRetry}
          icon={<RefreshCw size={12} />}
        >
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default StateAlert;
