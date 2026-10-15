import React from 'react';
import { UserButton } from '@clerk/clerk-react';
import { Menu, ShieldAlert, Sparkles } from 'lucide-react';
import { useAppAuth } from '../../context/AuthContext';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, isMockMode } = useAppAuth();

  return (
    <header className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onToggleSidebar}
          style={{
            display: 'none',
            color: 'var(--text-secondary)',
            padding: '6px',
            borderRadius: '6px',
            background: 'var(--bg-surface)',
          }}
          className="mobile-toggle-btn"
        >
          <Menu size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              fontWeight: 500,
            }}
          >
            Workspace:
          </span>
          <span
            style={{
              fontSize: '0.88rem',
              color: 'var(--text-primary)',
              fontWeight: 600,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              padding: '4px 10px',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            Ansari Textiles & Trading (SME)
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        {/* Mock auth mode indicator */}
        {isMockMode ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              padding: '4px 10px',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              color: '#818CF8',
              fontWeight: 500,
            }}
          >
            <Sparkles size={13} />
            <span>Mock UI Dev Mode</span>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '4px 10px',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              color: '#34D399',
              fontWeight: 500,
            }}
          >
            <ShieldAlert size={13} />
            <span>Clerk Protected</span>
          </div>
        )}

        {/* User profile widget */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isMockMode ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                padding: '4px 12px',
                borderRadius: '9999px',
              }}
            >
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: 'var(--primary-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFF',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                SP
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.fullName || 'Srushti Patil'}</span>
            </div>
          ) : (
            <UserButton afterSignOutUrl="/" />
          )}
        </div>
      </div>
    </header>
  );
};
