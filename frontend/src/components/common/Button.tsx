import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  kbd?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  kbd,
  className = '',
  disabled,
  style,
  ...props
}) => {
  const sizeStyles: Record<'xs' | 'sm' | 'md' | 'lg', React.CSSProperties> = {
    xs: { padding: '3px 8px', fontSize: '0.6875rem', height: '24px' },
    sm: { padding: '5px 10px', fontSize: '0.75rem', height: '30px' },
    md: { padding: '6px 14px', fontSize: '0.8125rem', height: '34px' },
    lg: { padding: '9px 18px', fontSize: '0.9375rem', height: '40px' },
  };

  return (
    <button
      className={`btn btn-${variant} ${className}`}
      style={{ ...sizeStyles[size], ...style }}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span
          style={{
            display: 'inline-block',
            width: '12px',
            height: '12px',
            border: '2px solid rgba(255,255,255,0.25)',
            borderTopColor: 'currentColor',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
          }}
        />
      ) : (
        icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>
      )}
      {children}
      {kbd && <kbd style={{ marginLeft: '4px' }}>{kbd}</kbd>}
    </button>
  );
};

export default Button;
