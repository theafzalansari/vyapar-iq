import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Bot,
  FileSpreadsheet,
  FileText,
  LayoutDashboard,
  Network,
  Search,
  Settings,
  Sparkles,
  UploadCloud,
  Zap,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { anomaliesService } from '../services/anomalies.service';
import { dashboardService } from '../services/dashboard.service';

interface BusinessApp {
  id: string;
  name: string;
  category: 'finance' | 'audit' | 'operations';
  description: string;
  icon: React.ReactNode;
  route: string;
  color: string;
  bgLight: string;
  badge?: string;
  badgeVariant?: 'primary' | 'success' | 'warning' | 'critical' | 'info' | 'default';
  hotkey?: string;
}

export const AppsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'finance' | 'audit' | 'operations'>('all');
  const [anomalyCount, setAnomalyCount] = useState<number | null>(null);
  const [txCount, setTxCount] = useState<number | null>(null);

  useEffect(() => {
    // Fetch live summary badges
    dashboardService
      .getDashboardSummary()
      .then((data) => {
        if (data.recentTransactions) setTxCount(data.recentTransactions.length);
        if (data.anomalyAlertsCount !== undefined) setAnomalyCount(data.anomalyAlertsCount);
      })
      .catch(() => {});

    anomaliesService
      .getAnomalies()
      .then((res) => {
        const unres = res.anomalies.filter((a) => !a.isResolved).length;
        setAnomalyCount(unres);
      })
      .catch(() => {});
  }, []);

  const apps: BusinessApp[] = [
    {
      id: 'dashboard',
      name: 'Financial Dashboard',
      category: 'finance',
      description: 'Real-time revenue, burn rate, cash flow velocity, and core business KPIs.',
      icon: <LayoutDashboard size={26} />,
      route: '/dashboard',
      color: '#6366F1',
      bgLight: 'rgba(99, 102, 241, 0.12)',
      badge: 'Live KPIs',
      badgeVariant: 'primary',
      hotkey: '1',
    },
    {
      id: 'transactions',
      name: 'General Ledger',
      category: 'finance',
      description: 'Statement ingestion, transaction filtering, bank references, and CSV imports.',
      icon: <FileSpreadsheet size={26} />,
      route: '/transactions',
      color: '#10B981',
      bgLight: 'rgba(16, 185, 129, 0.12)',
      badge: txCount ? `${txCount} Ingested` : 'Reconciled',
      badgeVariant: 'success',
      hotkey: '2',
    },
    {
      id: 'analytics',
      name: 'Financial Analytics',
      category: 'finance',
      description: 'Deep-dive category breakdowns, profit margins, and monthly chronological trends.',
      icon: <BarChart3 size={26} />,
      route: '/analytics',
      color: '#06B6D4',
      bgLight: 'rgba(6, 182, 212, 0.12)',
      badge: 'Deterministic',
      badgeVariant: 'info',
      hotkey: '3',
    },
    {
      id: 'findings',
      name: 'Audit Anomalies',
      category: 'audit',
      description: 'Heuristic risk scoring, duplicate payment detection, and audit review lifecycle.',
      icon: <AlertTriangle size={26} />,
      route: '/findings',
      color: '#F59E0B',
      bgLight: 'rgba(245, 158, 11, 0.12)',
      badge: anomalyCount !== null && anomalyCount > 0 ? `${anomalyCount} Flagged` : '0 Issues',
      badgeVariant: anomalyCount && anomalyCount > 0 ? 'warning' : 'success',
      hotkey: '4',
    },
    {
      id: 'network',
      name: 'Counterparty Graph',
      category: 'audit',
      description: 'Interactive vendor-customer relationship network and duplicate payment clusters.',
      icon: <Network size={26} />,
      route: '/network',
      color: '#8B5CF6',
      bgLight: 'rgba(139, 92, 246, 0.12)',
      badge: 'Clustered',
      badgeVariant: 'primary',
      hotkey: '5',
    },
    {
      id: 'copilot',
      name: 'Business Copilot',
      category: 'audit',
      description: 'Evidence-grounded conversational assistant powered by Google Gemini.',
      icon: <Bot size={26} />,
      route: '/copilot',
      color: '#EC4899',
      bgLight: 'rgba(236, 72, 153, 0.12)',
      badge: 'AI Grounded',
      badgeVariant: 'info',
      hotkey: '6',
    },
    {
      id: 'reports',
      name: 'Audit & Reports',
      category: 'operations',
      description: 'Formal fiscal audit workpapers, vector PDF generation, and CSV compliance export.',
      icon: <FileText size={26} />,
      route: '/reports',
      color: '#3B82F6',
      bgLight: 'rgba(59, 130, 246, 0.12)',
      badge: 'PDF / CSV',
      badgeVariant: 'primary',
      hotkey: '7',
    },
    {
      id: 'settings',
      name: 'Company Settings',
      category: 'operations',
      description: 'Business profile, GSTIN/PAN info, theme customization, and export defaults.',
      icon: <Settings size={26} />,
      route: '/settings',
      color: '#64748B',
      bgLight: 'rgba(100, 116, 139, 0.12)',
      badge: 'Config',
      badgeVariant: 'default',
      hotkey: '8',
    },
  ];

  const filteredApps = apps.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = activeCategory === 'all' || app.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', paddingBottom: '48px' }}>
      {/* Header & App Launcher Banner */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          marginBottom: '28px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--primary-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
              }}
            >
              <Zap size={18} fill="#FFF" />
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Business Applications
            </h1>
            <Badge variant="primary">Suite Launcher</Badge>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Unified business finance, forensic audit, AI assistance, and compliance modules.
          </p>
        </div>

        {/* Quick App Search Bar */}
        <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
          <Search
            size={16}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Search business applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 38px',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.88rem',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
          />
        </div>
      </div>

      {/* Category Pills Strip */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '28px',
          flexWrap: 'wrap',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '16px',
        }}
      >
        {[
          { key: 'all', label: 'All Applications' },
          { key: 'finance', label: 'Finance & Ledger' },
          { key: 'audit', label: 'Risk & Forensic Intelligence' },
          { key: 'operations', label: 'Operations & Settings' },
        ].map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key as any)}
            style={{
              padding: '7px 16px',
              borderRadius: '9999px',
              fontSize: '0.84rem',
              fontWeight: 600,
              backgroundColor:
                activeCategory === cat.key ? 'var(--primary-light)' : 'transparent',
              color: activeCategory === cat.key ? 'var(--primary)' : 'var(--text-secondary)',
              border:
                activeCategory === cat.key
                  ? '1px solid var(--primary)'
                  : '1px solid var(--border-subtle)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 3x3 Odoo-style App Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
          gap: '20px',
          marginBottom: '36px',
        }}
      >
        {filteredApps.map((app) => (
          <div
            key={app.id}
            onClick={() => navigate(app.route)}
            className="glass-panel"
            style={{
              padding: '24px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s, border-color 0.2s',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.borderColor = app.color;
              e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.15)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'var(--border-card)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    backgroundColor: app.bgLight,
                    color: app.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.2s ease',
                  }}
                >
                  {app.icon}
                </div>
                {app.badge && (
                  <Badge variant={app.badgeVariant || 'default'}>
                    {app.badge}
                  </Badge>
                )}
              </div>

              <h3
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>{app.name}</span>
                <ArrowUpRight size={16} color="var(--text-muted)" />
              </h3>

              <p
                style={{
                  fontSize: '0.84rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.5,
                  marginBottom: '16px',
                }}
              >
                {app.description}
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '12px',
                borderTop: '1px solid var(--border-subtle)',
                fontSize: '0.76rem',
                color: 'var(--text-secondary)',
                fontWeight: 600,
              }}
            >
              <span style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Launch App
              </span>
              <span
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                ⌘{app.hotkey}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Launch Strip */}
      <div
        className="glass-panel"
        style={{
          padding: '20px 24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          background: 'var(--brand-gradient-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Quick Workflows & Ingestion
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Jump straight into common daily tasks across your financial ledger.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/transactions')}
            className="btn btn-secondary"
            style={{ fontSize: '0.82rem', padding: '7px 14px' }}
          >
            <UploadCloud size={15} /> Upload Bank CSV
          </button>
          <button
            onClick={() => navigate('/copilot')}
            className="btn btn-secondary"
            style={{ fontSize: '0.82rem', padding: '7px 14px' }}
          >
            <Bot size={15} /> Ask Copilot
          </button>
          <button
            onClick={() => navigate('/reports')}
            className="btn btn-primary"
            style={{ fontSize: '0.82rem', padding: '7px 14px' }}
          >
            <FileText size={15} /> Export Audit Report
          </button>
        </div>
      </div>
    </div>
  );
};
