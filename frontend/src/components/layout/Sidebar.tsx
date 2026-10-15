import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  AlertTriangle,
  Bot,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  LayoutDashboard,
  Network,
  Zap,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/transactions', label: 'Transactions', icon: <FileSpreadsheet size={18} /> },
    { to: '/findings', label: 'Findings & Anomalies', icon: <AlertTriangle size={18} />, badge: '3' },
    { to: '/copilot', label: 'AI Copilot', icon: <Bot size={18} />, highlight: true },
    { to: '/network', label: 'Network Graph', icon: <Network size={18} /> },
    { to: '/reports', label: 'Audit Reports', icon: <FileText size={18} /> },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand Header */}
      <div
        style={{
          padding: '22px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: 'var(--shadow-glow)',
          }}
        >
          <Zap size={22} fill="#FFFFFF" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#FFFFFF', letterSpacing: '-0.03em' }}>
            Vyapar<span style={{ color: 'var(--info)' }}>IQ</span>
          </h2>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            AIVORA 2K26 Copilot
          </p>
        </div>
      </div>

      {/* Nav List */}
      <nav style={{ padding: '16px 12px', flex: 1 }}>
        <p
          style={{
            fontSize: '0.72rem',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            fontWeight: 700,
            letterSpacing: '0.08em',
            padding: '8px 12px',
          }}
        >
          Finance & Insights
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                transition: 'all 0.15s ease-in-out',
              })}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.25)',
                    color: '#F87171',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '9999px',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Footer Info */}
      <div
        style={{
          padding: '16px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
        }}
      >
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--success)',
                display: 'inline-block',
                boxShadow: '0 0 8px var(--success)',
              }}
            />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Engine Status: OK
            </span>
          </div>
          <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Hybrid deterministic rules + LLM explanation active.
          </p>
        </div>

        <div style={{ marginTop: '12px', textAlign: 'center' }}>
          <NavLink
            to="/"
            style={{
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              transition: 'color 0.15s ease',
            }}
          >
            <span>Public Home</span>
            <ExternalLink size={12} />
          </NavLink>
        </div>
      </div>
    </aside>
  );
};
