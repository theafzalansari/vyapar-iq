import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import {
  AlertTriangle,
  BarChart3,
  Bot,
  FileSpreadsheet,
  FileText,
  Grid,
  LayoutDashboard,
  Menu,
  Moon,
  Network,
  Settings,
  ShieldAlert,
  Sparkles,
  Sun,
} from 'lucide-react';
import { useAppAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, isMockMode } = useAppAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [isAppMenuOpen, setIsAppMenuOpen] = useState(false);
  const [businessName, setBusinessName] = useState('Ansari Textiles & Trading Co.');
  const appMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('vyapariq_business_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.businessName) setBusinessName(parsed.businessName);
      }
    } catch {}
  }, []);

  // Close app menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (appMenuRef.current && !appMenuRef.current.contains(e.target as Node)) {
        setIsAppMenuOpen(false);
      }
    };
    if (isAppMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAppMenuOpen]);

  // Close app menu on route change
  useEffect(() => {
    setIsAppMenuOpen(false);
  }, [location.pathname]);

  const appItems = [
    { name: 'Dashboard', route: '/dashboard', icon: <LayoutDashboard size={18} color="#6366F1" /> },
    { name: 'General Ledger', route: '/transactions', icon: <FileSpreadsheet size={18} color="#10B981" /> },
    { name: 'Analytics', route: '/analytics', icon: <BarChart3 size={18} color="#06B6D4" /> },
    { name: 'Anomalies', route: '/findings', icon: <AlertTriangle size={18} color="#F59E0B" /> },
    { name: 'Network Graph', route: '/network', icon: <Network size={18} color="#8B5CF6" /> },
    { name: 'Business Copilot', route: '/copilot', icon: <Bot size={18} color="#EC4899" /> },
    { name: 'Audit Reports', route: '/reports', icon: <FileText size={18} color="#3B82F6" /> },
    { name: 'Settings', route: '/settings', icon: <Settings size={18} color="#64748B" /> },
  ];

  const currentRouteName =
    {
      '/apps': 'Applications',
      '/dashboard': 'Financial Dashboard',
      '/transactions': 'General Ledger',
      '/analytics': 'Financial Analytics',
      '/findings': 'Audit Anomalies',
      '/network': 'Counterparty Graph',
      '/copilot': 'Business Copilot',
      '/reports': 'Audit Reports & Export',
      '/settings': 'Company Settings',
    }[location.pathname] || 'Workspace';

  return (
    <header
      className="navbar"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        height: '64px',
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Left: Mobile Toggle, Odoo-Style App Launcher, Breadcrumb */}
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
          title="Toggle Navigation"
        >
          <Menu size={20} />
        </button>

        {/* Odoo-style App Launcher Grid Icon Button */}
        <div style={{ position: 'relative' }} ref={appMenuRef}>
          <button
            onClick={() => setIsAppMenuOpen((prev) => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: isAppMenuOpen ? 'var(--primary-light)' : 'var(--bg-surface)',
              color: isAppMenuOpen ? 'var(--primary)' : 'var(--text-secondary)',
              border: isAppMenuOpen ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.84rem',
              transition: 'all 0.15s ease',
            }}
            title="Open Application Launcher"
          >
            <Grid size={17} />
            <span className="hide-on-mobile">Apps</span>
          </button>

          {/* Quick Dropdown Matrix */}
          {isAppMenuOpen && (
            <div
              className="glass-panel"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                width: '320px',
                padding: '16px',
                backgroundColor: 'var(--bg-card)',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-lg)',
                zIndex: 100,
                animation: 'slideUp 0.18s ease-out',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  VyaparIQ Suite
                </span>
                <Link
                  to="/apps"
                  style={{ fontSize: '0.76rem', color: 'var(--primary)', fontWeight: 600 }}
                  onClick={() => setIsAppMenuOpen(false)}
                >
                  View All Apps →
                </Link>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {appItems.map((item) => (
                  <button
                    key={item.route}
                    onClick={() => {
                      navigate(item.route);
                      setIsAppMenuOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor:
                        location.pathname === item.route ? 'var(--primary-light)' : 'transparent',
                      color:
                        location.pathname === item.route ? 'var(--primary)' : 'var(--text-primary)',
                      border:
                        location.pathname === item.route
                          ? '1px solid var(--primary)'
                          : '1px solid transparent',
                      cursor: 'pointer',
                      fontSize: '0.84rem',
                      fontWeight: 500,
                      textAlign: 'left',
                      transition: 'all 0.12s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (location.pathname !== item.route) {
                        e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (location.pathname !== item.route) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {item.icon}
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Breadcrumb Module Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>/</span>
          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {currentRouteName}
          </span>
        </div>

        {/* Workspace Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px' }}>
          <span
            style={{
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--bg-surface)',
              padding: '3px 10px',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
              maxWidth: '220px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {businessName}
          </span>
        </div>
      </div>

      {/* Right: Theme Switcher, Auth Mode Pill, User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-subtle)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
        >
          {theme === 'dark' ? <Sun size={17} color="#FBBF24" /> : <Moon size={17} color="#6366F1" />}
        </button>

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
              color: 'var(--primary)',
              fontWeight: 500,
            }}
          >
            <Sparkles size={13} />
            <span className="hide-on-mobile">Dev Mode</span>
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
            <span className="hide-on-mobile">Protected</span>
          </div>
        )}

        {/* User profile widget */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isMockMode ? (
            <Link
              to="/settings"
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
              <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {user?.fullName || 'Srushti Patil'}
              </span>
            </Link>
          ) : (
            <UserButton afterSignOutUrl="/" />
          )}
        </div>
      </div>
    </header>
  );
};
