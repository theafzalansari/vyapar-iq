import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const sizeStyles = {
    sm: { padding: '6px 12px', fontSize: '0.8rem' },
    md: { padding: '9px 18px', fontSize: '0.88rem' },
    lg: { padding: '12px 24px', fontSize: '1rem' },
  };

  return (
    <button
      className={`btn btn-${variant} ${className}`}
      style={sizeStyles[size]}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span
          style={{
            display: 'inline-block',
            width: '14px',
            height: '14px',
            border: '2px solid rgba(255,255,255,0.3)',
            borderTopColor: '#FFF',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
          }}
        />
      ) : (
        icon
      )}
      {children}
    </button>
  );
};
