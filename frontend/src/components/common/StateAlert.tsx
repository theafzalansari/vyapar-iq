import React from 'react';
import { AlertCircle, CheckCircle, Info, RefreshCw } from 'lucide-react';

interface StateAlertProps {
  type?: 'error' | 'warning' | 'info' | 'success';
  title?: string;
  message: string;
  onRetry?: () => void;
  actionText?: string;
}

export const StateAlert: React.FC<StateAlertProps> = ({
  type = 'info',
  title,
  message,
  onRetry,
  actionText = 'Retry',
}) => {
  const configs = {
    error: {
      icon: <AlertCircle size={20} color="#EF4444" />,
      bg: 'var(--danger-bg)',
      border: 'rgba(239, 68, 68, 0.3)',
      text: '#FCA5A5',
    },
    warning: {
      icon: <AlertCircle size={20} color="#F59E0B" />,
      bg: 'var(--warning-bg)',
      border: 'rgba(245, 158, 11, 0.3)',
      text: '#FCD34D',
    },
    info: {
      icon: <Info size={20} color="#06B6D4" />,
      bg: 'var(--info-bg)',
      border: 'rgba(6, 182, 212, 0.3)',
      text: '#7DD3FC',
    },
    success: {
      icon: <CheckCircle size={20} color="#10B981" />,
      bg: 'var(--success-bg)',
      border: 'rgba(16, 185, 129, 0.3)',
      text: '#6EE7B7',
    },
  };

  const config = configs[type];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        padding: '16px 20px',
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: 'var(--radius-md)',
        marginBottom: '20px',
      }}
    >
      <div style={{ flexShrink: 0, marginTop: '2px' }}>{config.icon}</div>
      <div style={{ flex: 1 }}>
        {title && (
          <h4 style={{ fontSize: '0.92rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
            {title}
          </h4>
        )}
        <p style={{ fontSize: '0.85rem', color: config.text, lineHeight: 1.45 }}>{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            padding: '6px 12px',
            borderRadius: '6px',
            color: '#FFFFFF',
            fontSize: '0.8rem',
            fontWeight: 500,
            flexShrink: 0,
          }}
        >
          <RefreshCw size={13} />
          {actionText}
        </button>
      )}
    </div>
  );
};
