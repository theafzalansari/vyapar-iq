import React, { createContext, useContext, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
  success: () => {},
  error: () => {},
  info: () => {},
});

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newToast: ToastMessage = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    const duration = toast.duration || 4000;
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const success = (message: string, title?: string) => addToast({ type: 'success', message, title });
  const error = (message: string, title?: string) => addToast({ type: 'error', message, title });
  const info = (message: string, title?: string) => addToast({ type: 'info', message, title });

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, info }}>
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '400px',
          width: 'calc(100vw - 48px)',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => {
          const config = {
            success: {
              icon: <CheckCircle2 size={18} color="#10B981" />,
              border: 'rgba(16, 185, 129, 0.4)',
              bg: 'var(--bg-card)',
            },
            error: {
              icon: <AlertCircle size={18} color="#EF4444" />,
              border: 'rgba(239, 68, 68, 0.4)',
              bg: 'var(--bg-card)',
            },
            warning: {
              icon: <AlertCircle size={18} color="#F59E0B" />,
              border: 'rgba(245, 158, 11, 0.4)',
              bg: 'var(--bg-card)',
            },
            info: {
              icon: <Info size={18} color="#06B6D4" />,
              border: 'rgba(6, 182, 212, 0.4)',
              bg: 'var(--bg-card)',
            },
          }[toast.type];

          return (
            <div
              key={toast.id}
              style={{
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '14px 16px',
                backgroundColor: config.bg,
                border: `1px solid ${config.border}`,
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-md)',
                color: 'var(--text-primary)',
                animation: 'slideUp 0.25s ease-out',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div style={{ flexShrink: 0, marginTop: '2px' }}>{config.icon}</div>
              <div style={{ flex: 1 }}>
                {toast.title && (
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '2px' }}>
                    {toast.title}
                  </div>
                )}
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {toast.message}
                </div>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
