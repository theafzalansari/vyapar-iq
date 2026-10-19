import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Bot,
  Building2,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  Grid,
  LayoutDashboard,
  Menu,
  Moon,
  Network,
  Search,
  Settings,
  Sun,
} from 'lucide-react';
import { useAppAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { anomaliesService } from '../../services/anomalies.service';

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
  const [unresolvedAlerts, setUnresolvedAlerts] = useState<number>(4);
  const appMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('vyapariq_business_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.businessName) setBusinessName(parsed.businessName);
      }
    } catch {}

    anomaliesService
      .getAnomalies()
      .then((res) => {
        const unres = res.anomalies.filter((a) => !a.isResolved).length;
        setUnresolvedAlerts(unres);
      })
      .catch(() => {});
  }, [location.pathname]);

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
    { name: 'Dashboard', route: '/dashboard', icon: <LayoutDashboard size={16} color="var(--primary)" /> },
    { name: 'General Ledger', route: '/transactions', icon: <FileSpreadsheet size={16} color="var(--tertiary)" /> },
    { name: 'Analytics', route: '/analytics', icon: <BarChart3 size={16} color="var(--secondary)" /> },
    { name: 'Anomalies', route: '/findings', icon: <AlertTriangle size={16} color="var(--warning)" /> },
    { name: 'Network Graph', route: '/network', icon: <Network size={16} color="#8B5CF6" /> },
    { name: 'Business Copilot', route: '/copilot', icon: <Bot size={16} color="var(--primary)" /> },
    { name: 'Audit Reports', route: '/reports', icon: <FileText size={16} color="var(--secondary)" /> },
    { name: 'Settings', route: '/settings', icon: <Settings size={16} color="var(--outline)" /> },
  ];

  const currentRouteName =
    {
      '/apps': 'All Applications',
      '/dashboard': 'Financial Dashboard',
      '/transactions': 'General Ledger',
      '/analytics': 'Analytics & Trends',
      '/findings': 'Findings & Anomalies',
      '/network': 'Counterparty Graph',
      '/copilot': 'Business Copilot',
      '/reports': 'Audit Reports & Export',
      '/settings': 'Company Settings',
    }[location.pathname] || 'Workspace';

  return (
    <header className="navbar">
      {/* Left: Mobile Toggle, Odoo-Style App Switcher, Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
        <button
          onClick={onToggleSidebar}
          style={{
            display: 'none',
            color: 'var(--on-surface-variant)',
            padding: '5px',
            borderRadius: 'var(--rounded-sm)',
            backgroundColor: 'var(--surface-container)',
          }}
          className="mobile-toggle-btn"
          title="Toggle Navigation"
        >
          <Menu size={18} />
        </button>

        {/* Odoo-style App Launcher Matrix Button */}
        <div style={{ position: 'relative' }} ref={appMenuRef}>
          <button
            onClick={() => setIsAppMenuOpen((prev) => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 8px',
              borderRadius: 'var(--rounded-sm)',
              backgroundColor: isAppMenuOpen ? 'var(--primary-container)' : 'var(--surface-container)',
              color: isAppMenuOpen ? 'var(--on-primary-container)' : 'var(--on-surface-variant)',
              border: isAppMenuOpen ? '1px solid var(--primary)' : '1px solid var(--outline-variant)',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.75rem',
              transition: 'all 0.12s ease',
            }}
            title="Open Application Matrix"
          >
            <Grid size={15} />
            <span className="hide-on-mobile">Apps</span>
          </button>

          {/* Quick Dropdown Matrix */}
          {isAppMenuOpen && (
            <div
              className="card-forensic"
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                width: '300px',
                padding: '12px',
                backgroundColor: 'var(--surface-container-low)',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--outline-variant)',
                borderRadius: 'var(--rounded-md)',
                zIndex: 100,
                animation: 'slideUp 0.15s ease-out',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  paddingBottom: '6px',
                  borderBottom: '1px solid var(--outline-variant)',
                }}
              >
                <span className="font-label-ui" style={{ color: 'var(--outline)', fontSize: '0.625rem' }}>
                  VyaparIQ Business Suite
                </span>
                <Link
                  to="/apps"
                  style={{ fontSize: '0.6875rem', color: 'var(--primary)', fontWeight: 600 }}
                  onClick={() => setIsAppMenuOpen(false)}
                >
                  View All →
                </Link>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
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
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: 'var(--rounded-sm)',
                      backgroundColor:
                        location.pathname === item.route ? 'var(--primary-container)' : 'transparent',
                      color:
                        location.pathname === item.route ? 'var(--on-primary-container)' : 'var(--on-surface)',
                      border:
                        location.pathname === item.route
                          ? '1px solid var(--primary)'
                          : '1px solid transparent',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      textAlign: 'left',
                      transition: 'all 0.1s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (location.pathname !== item.route) {
                        e.currentTarget.style.backgroundColor = 'var(--surface-container-high)';
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

        {/* Forensic Breadcrumb Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
          <Building2 size={14} color="var(--outline)" />
          <span
            onClick={() => navigate('/settings')}
            style={{
              fontSize: '0.8125rem',
              color: 'var(--on-surface-variant)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '160px',
            }}
            title={businessName}
          >
            {businessName}
          </span>
          <ChevronRight size={13} color="var(--outline)" />
          <span
            style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--on-surface)',
              whiteSpace: 'nowrap',
            }}
          >
            {currentRouteName}
          </span>
        </div>
      </div>

      {/* Center: Global Search Bar with ⌘K */}
      <div
        className="hide-on-mobile"
        style={{
          flex: 1,
          maxWidth: '420px',
          margin: '0 16px',
        }}
      >
        <div
          onClick={() => {
            if (location.pathname !== '/transactions') navigate('/transactions');
          }}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            cursor: 'pointer',
          }}
        >
          <Search
            size={14}
            color="var(--outline)"
            style={{ position: 'absolute', left: '10px', pointerEvents: 'none' }}
          />
          <input
            type="text"
            readOnly
            placeholder="Search transactions, counterparties, findings... ⌘K"
            style={{
              width: '100%',
              height: '32px',
              paddingLeft: '32px',
              paddingRight: '48px',
              borderRadius: 'var(--rounded-sm)',
              backgroundColor: 'var(--surface-container-lowest)',
              border: '1px solid var(--outline-variant)',
              color: 'var(--on-surface)',
              fontSize: '0.75rem',
              outline: 'none',
              cursor: 'pointer',
            }}
          />
          <kbd
            style={{
              position: 'absolute',
              right: '8px',
              pointerEvents: 'none',
              fontSize: '0.625rem',
              padding: '1px 5px',
            }}
          >
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Live Sync HUD, Theme Switcher, Alerts & User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        {/* Live Sync HUD Pill */}
        <div
          className="hide-on-mobile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 8px',
            borderRadius: 'var(--rounded-sm)',
            backgroundColor: 'var(--tertiary-container)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            color: 'var(--tertiary)',
            fontSize: '0.6875rem',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--tertiary)',
              display: 'inline-block',
              animation: 'pulse 1.8s infinite',
            }}
          />
          <span>Synced with Ledger</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: 'var(--rounded-sm)',
            backgroundColor: 'var(--surface-container)',
            color: 'var(--on-surface-variant)',
            border: '1px solid var(--outline-variant)',
            cursor: 'pointer',
            transition: 'all 0.12s ease',
          }}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
        >
          {theme === 'dark' ? <Sun size={15} color="#FBBF24" /> : <Moon size={15} color="var(--primary)" />}
        </button>

        {/* Risk Alerts Notification Trigger */}
        <button
          onClick={() => navigate('/findings')}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: 'var(--rounded-sm)',
            backgroundColor: 'var(--surface-container)',
            color: 'var(--on-surface-variant)',
            border: '1px solid var(--outline-variant)',
            cursor: 'pointer',
          }}
          title="Risk Alerts & Anomalies"
        >
          <Bell size={15} />
          {unresolvedAlerts > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                minWidth: '16px',
                height: '16px',
                padding: '0 3px',
                borderRadius: 'var(--rounded-full)',
                backgroundColor: 'var(--error)',
                color: '#ffffff',
                fontSize: '0.625rem',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
              }}
            >
              {unresolvedAlerts}
            </span>
          )}
        </button>

        <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--outline-variant)', margin: '0 2px' }} />

        {/* User profile widget */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {isMockMode ? (
            <Link
              to="/settings"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '3px 8px',
                borderRadius: 'var(--rounded-sm)',
                backgroundColor: 'var(--surface-container)',
                border: '1px solid var(--outline-variant)',
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'var(--primary-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                }}
              >
                {user?.firstName?.slice(0, 2).toUpperCase() || 'SP'}
              </div>
              <div className="hide-on-mobile" style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: 'var(--on-surface)',
                    lineHeight: 1.1,
                  }}
                >
                  {user?.fullName || 'Srushti Patil'}
                </span>
                <span className="font-label-data-sm" style={{ fontSize: '0.5625rem', color: 'var(--outline)' }}>
                  Financial Controller
                </span>
              </div>
            </Link>
          ) : (
            <UserButton afterSignOutUrl="/" />
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
