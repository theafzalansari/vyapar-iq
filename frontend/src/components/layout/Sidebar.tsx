import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  AlertTriangle,
  BarChart3,
  Bot,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Grid,
  LayoutDashboard,
  Network,
  Settings,
  Zap,
} from 'lucide-react';

interface SidebarItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  highlight?: boolean;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const sections: SidebarSection[] = [
    {
      title: 'Launcher',
      items: [
        { to: '/apps', label: 'All Applications', icon: <Grid size={18} />, badge: 'Suite' },
      ],
    },
    {
      title: 'Finance & Ledger',
      items: [
        { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { to: '/transactions', label: 'General Ledger', icon: <FileSpreadsheet size={18} /> },
        { to: '/analytics', label: 'Analytics & Trends', icon: <BarChart3 size={18} /> },
      ],
    },
    {
      title: 'Forensic Audit & AI',
      items: [
        { to: '/findings', label: 'Findings & Anomalies', icon: <AlertTriangle size={18} /> },
        { to: '/network', label: 'Counterparty Graph', icon: <Network size={18} /> },
        { to: '/copilot', label: 'Business Copilot', icon: <Bot size={18} />, highlight: true },
        { to: '/reports', label: 'Audit Reports', icon: <FileText size={18} /> },
      ],
    },
    {
      title: 'Workspace',
      items: [
        { to: '/settings', label: 'Company Settings', icon: <Settings size={18} /> },
      ],
    },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand Header */}
      <div
        style={{
          padding: '20px 20px',
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
          <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
            Vyapar<span style={{ color: 'var(--info)' }}>IQ</span>
          </h2>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            AIVORA 2K26 Copilot
          </p>
        </div>
      </div>

      {/* Nav List with Sections */}
      <nav style={{ padding: '16px 12px', flex: 1, overflowY: 'auto' }}>
        {sections.map((sec, secIdx) => (
          <div key={sec.title} style={{ marginBottom: secIdx < sections.length - 1 ? '18px' : '0' }}>
            <p
              style={{
                fontSize: '0.72rem',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                fontWeight: 700,
                letterSpacing: '0.08em',
                padding: '4px 12px 6px',
              }}
            >
              {sec.title}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {sec.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.88rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                    backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                    border: isActive ? '1px solid var(--primary)' : '1px solid transparent',
                    transition: 'all 0.15s ease-in-out',
                  })}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: 'inherit' }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      style={{
                        backgroundColor: 'var(--bg-surface)',
                        color: 'var(--text-muted)',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Info */}
      <div
        style={{
          padding: '16px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)',
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
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
              Deterministic Engine: OK
            </span>
          </div>
          <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Reconciliation & Anomaly rules verified.
          </p>
        </div>

        <div style={{ marginTop: '10px', textAlign: 'center' }}>
          <NavLink
            to="/"
            style={{
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none',
              padding: '4px 10px',
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
