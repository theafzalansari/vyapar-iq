import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
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
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  ShieldCheck,
  X,
  Zap,
} from 'lucide-react';
import { useAppAuth } from '../../context/AuthContext';
import { anomaliesService } from '../../services/anomalies.service';

interface SidebarItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: 'primary' | 'error' | 'tertiary';
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

export interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen = false,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const { isMockMode } = useAppAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [businessName, setBusinessName] = useState('Ansari Textiles & Trading Co.');
  const [unresolvedAnomalyCount, setUnresolvedAnomalyCount] = useState<number | null>(null);

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
        setUnresolvedAnomalyCount(unres);
      })
      .catch(() => {});
  }, [location.pathname]);

  const sections: SidebarSection[] = [
    {
      title: 'Launcher',
      items: [{ to: '/apps', label: 'All Applications', icon: <Grid size={16} /> }],
    },
    {
      title: 'Finance & Ledger',
      items: [
        { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
        { to: '/transactions', label: 'General Ledger', icon: <FileSpreadsheet size={16} /> },
        { to: '/analytics', label: 'Analytics & Trends', icon: <BarChart3 size={16} /> },
      ],
    },
    {
      title: 'Forensic Audit & AI',
      items: [
        {
          to: '/findings',
          label: 'Findings & Anomalies',
          icon: <AlertTriangle size={16} />,
          badge: unresolvedAnomalyCount !== null ? `${unresolvedAnomalyCount} New` : '4 New',
          badgeColor: 'error',
        },
        { to: '/network', label: 'Counterparty Graph', icon: <Network size={16} /> },
        {
          to: '/copilot',
          label: 'Business Copilot',
          icon: <Bot size={16} />,
          badge: 'AI',
          badgeColor: 'tertiary',
        },
        { to: '/reports', label: 'Audit Reports', icon: <FileText size={16} /> },
      ],
    },
    {
      title: 'Workspace',
      items: [{ to: '/settings', label: 'Company Settings', icon: <Settings size={16} /> }],
    },
  ];

  // Collapsed Rail View (Desktop only, when not in mobile open drawer)
  const isRail = isCollapsed && !isOpen;

  return (
    <aside
      className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}
      aria-label="Application Sidebar"
    >
      {/* Top Brand Header (h-14 / 56px) */}
      <div
        style={{
          height: '56px',
          padding: isRail ? '0' : '0 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isRail ? 'center' : 'space-between',
          borderBottom: '1px solid var(--outline-variant)',
          position: 'relative',
          flexShrink: 0,
        }}
      >
        {/* Brand or Centered Icon */}
        <div
          onClick={() => navigate('/apps')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
          }}
          title="VyaparIQ App Suite"
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--rounded-sm)',
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <Zap size={16} fill="#FFFFFF" />
          </div>
          {!isRail && (
            <span
              className="font-headline-md"
              style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--on-surface)', letterSpacing: '-0.02em' }}
            >
              Vyapar<span style={{ color: 'var(--primary)' }}>IQ</span>
            </span>
          )}
        </div>

        {/* Controls when expanded or in mobile drawer */}
        {!isRail && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={() => navigate('/apps')}
              style={{
                padding: '6px',
                borderRadius: 'var(--rounded-sm)',
                color: 'var(--on-surface-variant)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: location.pathname === '/apps' ? 'var(--surface-container-high)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
              title="Open App Switcher"
              aria-label="Open App Switcher"
            >
              <Grid size={16} />
            </button>

            {/* Desktop Collapse Toggle */}
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="hide-on-mobile"
                aria-label="Collapse sidebar"
                aria-expanded={true}
                style={{
                  padding: '6px',
                  borderRadius: 'var(--rounded-sm)',
                  color: 'var(--on-surface-variant)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
                title="Collapse sidebar"
              >
                <PanelLeftClose size={16} />
              </button>
            )}

            {/* Mobile Drawer Close Button */}
            {isOpen && (
              <button
                onClick={onClose}
                aria-label="Close mobile sidebar drawer"
                style={{
                  padding: '6px',
                  borderRadius: 'var(--rounded-sm)',
                  color: 'var(--on-surface-variant)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {/* Floating Expand Toggle on Collapsed Rail */}
        {isRail && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            aria-label="Expand sidebar"
            aria-expanded={false}
            style={{
              position: 'absolute',
              right: '-11px',
              top: '17px',
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              backgroundColor: 'var(--surface-container-highest)',
              border: '1px solid var(--outline-variant)',
              color: 'var(--on-surface-variant)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              zIndex: 20,
            }}
            title="Expand sidebar"
          >
            <PanelLeftOpen size={12} />
          </button>
        )}
      </div>

      {/* Active Workspace / Entity Selector Ribbon */}
      <div style={{ padding: isRail ? '10px 0' : '10px 12px', borderBottom: '1px solid var(--outline-variant)', flexShrink: 0 }}>
        {isRail ? (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div
              onClick={() => navigate('/settings')}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--rounded-sm)',
                backgroundColor: 'var(--surface-container)',
                border: '1px solid var(--outline-variant)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--primary)',
              }}
              title={`${businessName} (Active · FY25-26)`}
            >
              {businessName.charAt(0) || 'V'}
              <span
                style={{
                  position: 'absolute',
                  bottom: '3px',
                  right: '3px',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--tertiary)',
                }}
              />
            </div>
          </div>
        ) : (
          <div
            onClick={() => navigate('/settings')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '7px 10px',
              borderRadius: 'var(--rounded-sm)',
              backgroundColor: 'var(--surface-container)',
              border: '1px solid var(--outline-variant)',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
            }}
          >
            <div style={{ minWidth: 0, paddingRight: '6px' }}>
              <div
                className="font-body-md"
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  color: 'var(--on-surface)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {businessName}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                <span
                  style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--tertiary)',
                    display: 'inline-block',
                  }}
                />
                <span
                  className="font-label-data-sm"
                  style={{ fontSize: '0.625rem', color: 'var(--tertiary)', textTransform: 'uppercase' }}
                >
                  Active · FY25-26
                </span>
              </div>
            </div>
            <span style={{ color: 'var(--outline)', fontSize: '0.75rem' }}>▾</span>
          </div>
        )}
      </div>

      {/* Navigation Sections */}
      <div style={{ flex: 1, overflowY: 'auto', padding: isRail ? '10px 0' : '12px 10px' }}>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: isRail ? '6px' : '14px', alignItems: isRail ? 'center' : 'stretch' }}>
          {sections.map((section, sIdx) => (
            <section key={section.title} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: isRail ? 'center' : 'stretch' }}>
              {isRail ? (
                sIdx > 0 && <div style={{ width: '28px', height: '1px', backgroundColor: 'var(--outline-variant)', margin: '4px 0 6px' }} />
              ) : (
                <div
                  className="font-label-ui"
                  style={{
                    padding: '0 8px',
                    marginBottom: '6px',
                    color: 'var(--outline)',
                    fontSize: '0.6875rem',
                    letterSpacing: '0.05em',
                  }}
                >
                  {section.title}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: isRail ? '4px' : '2px', width: '100%', alignItems: isRail ? 'center' : 'stretch' }}>
                {section.items.map((item) => {
                  const isActive = location.pathname === item.to;

                  if (isRail) {
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={onClose}
                        className="sidebar-rail-link"
                        aria-label={item.label}
                        title={item.label}
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: 'var(--rounded-sm)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textDecoration: 'none',
                          backgroundColor: isActive ? 'var(--primary-container)' : 'transparent',
                          color: isActive ? 'var(--primary)' : 'var(--outline)',
                          borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                          position: 'relative',
                          transition: 'all 0.12s ease',
                        }}
                      >
                        <span>{item.icon}</span>

                        {/* Dot indicator if badge exists */}
                        {item.badge && (
                          <span
                            style={{
                              position: 'absolute',
                              top: '7px',
                              right: '7px',
                              width: '7px',
                              height: '7px',
                              borderRadius: '50%',
                              backgroundColor: item.badgeColor === 'error' ? 'var(--error)' : 'var(--tertiary)',
                              border: '1px solid var(--surface-container-low)',
                            }}
                          />
                        )}

                        {/* Floating Tooltip */}
                        <div className="sidebar-rail-tooltip">
                          {item.label}
                          {item.badge ? ` (${item.badge})` : ''}
                        </div>
                      </NavLink>
                    );
                  }

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onClose}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        borderRadius: 'var(--rounded-sm)',
                        textDecoration: 'none',
                        fontSize: '0.8125rem',
                        fontWeight: isActive ? 600 : 400,
                        backgroundColor: isActive ? 'var(--primary-container)' : 'transparent',
                        color: isActive ? 'var(--on-primary-container)' : 'var(--on-surface-variant)',
                        borderLeft: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                        boxShadow: isActive ? 'inset 0 1px 0 rgba(255, 255, 255, 0.08)' : 'none',
                        transition: 'all 0.12s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'var(--surface-container-high)';
                          e.currentTarget.style.color = 'var(--on-surface)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--on-surface-variant)';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: isActive ? 'var(--primary)' : 'var(--outline)' }}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className="font-label-data-sm"
                          style={{
                            fontSize: '0.625rem',
                            padding: '1px 5px',
                            borderRadius: 'var(--rounded-xs)',
                            backgroundColor:
                              item.badgeColor === 'error'
                                ? 'var(--error-container)'
                                : item.badgeColor === 'tertiary'
                                ? 'var(--tertiary-container)'
                                : 'var(--surface-container-high)',
                            color:
                              item.badgeColor === 'error'
                                ? 'var(--error)'
                                : item.badgeColor === 'tertiary'
                                ? 'var(--tertiary)'
                                : 'var(--on-surface-variant)',
                            border:
                              item.badgeColor === 'error'
                                ? '1px solid rgba(244, 63, 94, 0.3)'
                                : item.badgeColor === 'tertiary'
                                ? '1px solid rgba(16, 185, 129, 0.3)'
                                : '1px solid var(--outline-variant)',
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </section>
          ))}
        </nav>
      </div>

      {/* Bottom Telemetry & Quota Panel */}
      <div
        style={{
          padding: isRail ? '12px 0' : '12px',
          borderTop: '1px solid var(--outline-variant)',
          backgroundColor: 'var(--surface-container-lowest)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: isRail ? 'center' : 'stretch',
          gap: '8px',
          flexShrink: 0,
        }}
        title={isRail ? 'Ingestion Quota: 28.5% (14,280 / 50,000 Trans.)' : undefined}
      >
        {isRail ? (
          <>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--surface-container-high)',
                border: '1px solid var(--outline-variant)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isMockMode ? 'var(--secondary)' : 'var(--tertiary)',
                cursor: 'pointer',
              }}
              title="Protected · All Systems Operational"
            >
              <ShieldCheck size={16} />
            </div>
            <NavLink
              to="/"
              title="Public Landing"
              aria-label="Navigate to Public Landing"
              style={{
                color: 'var(--outline)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
              }}
            >
              <ExternalLink size={12} />
            </NavLink>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="font-label-ui" style={{ color: 'var(--outline)', fontSize: '0.625rem' }}>
                Ingestion Quota
              </span>
              <span className="font-label-data-sm" style={{ color: 'var(--on-surface-variant)', fontSize: '0.6875rem' }}>
                28.5%
              </span>
            </div>

            <div
              style={{
                width: '100%',
                height: '5px',
                backgroundColor: 'var(--surface-container-highest)',
                borderRadius: 'var(--rounded-full)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: '28.5%',
                  backgroundColor: 'var(--primary)',
                  borderRadius: 'var(--rounded-full)',
                }}
              />
            </div>

            <div
              className="font-label-data-sm"
              style={{ fontSize: '0.625rem', color: 'var(--outline)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              14,280 / 50,000 Trans.
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '6px',
                borderTop: '1px solid var(--outline-variant)',
              }}
            >
              {isMockMode ? (
                <span
                  className="font-label-data-sm"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.6875rem',
                    color: 'var(--secondary)',
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--secondary)',
                    }}
                  />
                  Demo Mode
                </span>
              ) : (
                <span
                  className="font-label-data-sm"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.6875rem',
                    color: 'var(--tertiary)',
                  }}
                >
                  <ShieldCheck size={11} color="var(--tertiary)" />
                  Protected
                </span>
              )}

              <NavLink
                to="/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  fontSize: '0.6875rem',
                  color: 'var(--outline)',
                  textDecoration: 'none',
                }}
              >
                <span>Public</span>
                <ExternalLink size={10} />
              </NavLink>
            </div>
          </>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
