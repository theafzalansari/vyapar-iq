import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  Download,
  FileText,
  LogIn,
  Moon,
  Network,
  Shield,
  ShieldAlert,
  Sparkles,
  Sun,
  TrendingUp,
  UploadCloud,
  UserPlus,
  Zap,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Link001, Link003 } from '../components/common/skiper40';
import { CashflowChart } from '../components/dashboard/CashflowChart';
import { LandingFaqChatbot } from '../components/landing/LandingFaqChatbot';
import { LandingTypewriter } from '../components/landing/LandingTypewriter';
import { useAppAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { mockDashboardData } from '../mocks/mockDashboard';
import { transactionsService } from '../services/transactions.service';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isSignedIn, isMockMode, user } = useAppAuth();
  const { theme, toggleTheme } = useTheme();

  const handleDownloadTemplate = async () => {
    try {
      const csvText = await transactionsService.downloadTemplate();
      const blob = new Blob([csvText], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'vyapariq_transactions_template.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      alert('Template download failed. Please navigate to the dashboard.');
    }
  };

  return (
    <div className="landing-shell">
      {/* Public Landing Navbar */}
      <header className="landing-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <Zap size={20} fill="#FFFFFF" />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Vyapar<span style={{ color: 'var(--info)' }}>IQ</span>
          </span>
        </div>

        {/* Product Navigation with Skiper UI Link003 Animation */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '28px' }} className="landing-nav-links">
          <Link003 to="/apps" style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 600 }}>
            App Suite
          </Link003>
          <Link003 href="#features" style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Features
          </Link003>
          <Link003 href="#workflow" style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Workflow
          </Link003>
          <Link003 href="#preview" style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Platform Preview
          </Link003>
          <Link003 to="/reports" style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Audit & Compliance
          </Link003>
        </nav>

        {/* CTA, Theme Toggle & Authentication Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Header Theme Toggle */}
          <button
            onClick={toggleTheme}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '34px',
              height: '34px',
              borderRadius: 'var(--rounded-sm)',
              backgroundColor: 'var(--surface-container-high)',
              color: 'var(--on-surface-variant)',
              border: '1px solid var(--outline-variant)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
            aria-label="Toggle light or dark theme"
          >
            {theme === 'dark' ? <Sun size={16} color="#FBBF24" /> : <Moon size={16} color="var(--primary)" />}
          </button>

          {isSignedIn ? (
            <>
              <button
                onClick={() => navigate('/apps')}
                style={{
                  color: 'var(--text-primary)',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                App Launcher
              </button>
              <Button variant="primary" size="sm" onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
              {!isMockMode ? (
                <UserButton afterSignOutUrl="/" />
              ) : (
                <div
                  onClick={() => navigate('/apps')}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--primary-gradient)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFF',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                  title={user?.fullName || 'User Profile'}
                >
                  {user?.firstName?.slice(0, 2).toUpperCase() || 'SP'}
                </div>
              )}
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/sign-in')}
                icon={<LogIn size={15} />}
              >
                Sign In
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/sign-up')}
                icon={<UserPlus size={15} />}
              >
                Sign Up
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-pill">
          <Sparkles size={14} />
          <span>AIVORA 2K26 • AI Business Copilot</span>
        </div>

        <h1 className="landing-title font-display">
          From Business Data to <span style={{ background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Better Decisions.</span>
        </h1>

        {/* Supporting Typewriter Kicker */}
        <div className="hero-typewriter-kicker" aria-label="Core Capabilities">
          <span className="typewriter-badge">
            <Sparkles size={13} style={{ color: 'var(--primary)' }} />
            <span>Platform Focus</span>
          </span>
          <LandingTypewriter />
        </div>

        <p className="landing-subtitle">
          Empowering small businesses with automated CSV ledger reconciliation, explainable anomaly detection, grounded financial conversational intelligence, and audit-ready reports.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {isSignedIn ? (
            <>
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/apps')}
                icon={<ArrowRight size={18} />}
              >
                Launch App Suite
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/dashboard')}
              >
                Financial Overview
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/sign-up')}
                icon={<UserPlus size={18} />}
              >
                Get Started Free
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/sign-in')}
                icon={<LogIn size={18} />}
              >
                Sign In to Workspace
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="lg"
            onClick={handleDownloadTemplate}
            icon={<Download size={18} />}
          >
            Sample CSV Template
          </Button>
        </div>

        {/* Realistic Dashboard Preview Window */}
        <div id="preview" className="dashboard-preview-frame">
          <div className="preview-topbar">
            <span className="window-dot" style={{ backgroundColor: '#EF4444' }} />
            <span className="window-dot" style={{ backgroundColor: '#F59E0B' }} />
            <span className="window-dot" style={{ backgroundColor: '#10B981' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '12px', fontFamily: 'monospace' }}>
              app.vyapariq.com/dashboard • Ansari Textiles & Trading (SME)
            </span>
          </div>

          <div style={{ padding: '28px', textAlign: 'left' }}>
            {/* KPI Cards Strip */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '24px',
              }}
            >
              <div className="glass-panel" style={{ padding: '16px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Revenue (Oct MTD)</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                  ₹1,84,500
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--success)', fontWeight: 600 }}>
                  ↑ +14.2% vs previous period
                </span>
              </div>
              <div className="glass-panel" style={{ padding: '16px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Expenses</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                  ₹98,250
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Operating costs reduced
                </span>
              </div>
              <div className="glass-panel" style={{ padding: '16px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Net Margin</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                  ₹86,250
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 600 }}>
                  46.7% profit margin
                </span>
              </div>
              <div
                className="glass-panel"
                style={{ padding: '16px', borderLeft: '4px solid var(--error)' }}
              >
                <span style={{ fontSize: '0.78rem', color: 'var(--error)' }}>Audit Flags</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--error)', marginTop: '4px' }}>
                  3 Anomalies
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  1 critical duplicate check
                </span>
              </div>
            </div>

            {/* Cashflow Graphic Preview (Phase 2 Redesign) */}
            <div
              style={{
                backgroundColor: 'var(--surface-container-lowest)',
                borderRadius: 'var(--rounded-xl)',
                border: '1px solid var(--outline-variant)',
                boxShadow: 'var(--shadow-sm)',
                padding: '24px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '18px',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Cashflow Rolling Trajectory
                  </span>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                    Reconciled monthly operating collections, overhead disbursements & net trajectory
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    className="font-label-data-sm"
                    style={{
                      fontSize: '0.6875rem',
                      padding: '3px 10px',
                      borderRadius: 'var(--rounded-full)',
                      backgroundColor: 'var(--tertiary-container)',
                      color: 'var(--tertiary)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      fontWeight: 600,
                    }}
                  >
                    ● Verified Ledger Ingestion
                  </span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    (Synthetic Sample Figures)
                  </span>
                </div>
              </div>
              <CashflowChart data={mockDashboardData.cashflowTrends} />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars Section */}
      <section id="features" style={{ maxWidth: '1280px', margin: '0 auto', padding: '64px 24px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '2.1rem', color: 'var(--text-primary)', marginBottom: '12px' }}>
            Comprehensive Business Financial Intelligence
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '640px', margin: '0 auto', fontSize: '0.95rem' }}>
            Built specifically for Indian and global small business owners who need clear insights, zero accounting bloat, and grounded AI recommendations.
          </p>
        </div>

        <div className="feature-grid">
          {/* Feature 1 */}
          <div className="feature-card">
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px',
              }}
            >
              <TrendingUp size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Business Intelligence</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
              Instant automated cash flow tracking, expense category breakdowns, profit margin calculations, and month-over-month operating trajectory.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="feature-card">
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'var(--error-container)',
                color: 'var(--error)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px',
              }}
            >
              <AlertTriangle size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Explainable Anomaly Detection</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
              Deterministic heuristics detect duplicate vendor payments, uncharacteristic utility spikes, and cash flow velocity drains with clear audit reasoning.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="feature-card">
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'rgba(6, 182, 212, 0.15)',
                color: 'var(--info)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px',
              }}
            >
              <Bot size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Grounded AI Copilot</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
              Ask conversational questions in plain business language. Every recommendation and metric is grounded directly in your reconciled transaction data.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="feature-card">
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px',
              }}
            >
              <Network size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Transaction Network Graph</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
              Visual relationship mapping between suppliers, purchase orders, cheques, and payments to identify settlement bottlenecks and counterparty clusters.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="feature-card">
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                color: 'var(--warning)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px',
              }}
            >
              <FileText size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Audit & Compliance Reports</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
              Generate comprehensive financial audit summaries with full evidence trails and anomaly resolution logs ready for internal accountants and tax filings.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="feature-card">
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px',
              }}
            >
              <Shield size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Idempotent CSV Ingestion</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
              Cryptographic SHA-256 batch hashing prevents duplicate statement uploads, safeguarding ledger integrity across repeat submissions.
            </p>
          </div>
        </div>
      </section>

      {/* 3-Step Workflow Section */}
      <section id="workflow" className="workflow-section">
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '2.1rem', color: 'var(--text-primary)', marginBottom: '12px' }}>
            Simple, Deterministic 3-Step Workflow
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            No tedious manual data entry or complex accounting configurations required.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {/* Step 1 */}
          <div className="step-card">
            <div className="step-number">1</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <UploadCloud size={18} color="var(--primary)" />
              <h4 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>Upload Statement CSV</h4>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>
              Drag and drop your standard bank or accounting CSV statement. Format validation handles numeric cleanup and flexible date parsing.
            </p>
          </div>

          {/* Step 2 */}
          <div className="step-card">
            <div className="step-number">2</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <ShieldAlert size={18} color="var(--info)" />
              <h4 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>Automated Analysis</h4>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>
              Deterministic algorithms calculate rolling cash flows and flag suspicious duplicate vendor disbursements or irregular expenditures.
            </p>
          </div>

          {/* Step 3 */}
          <div className="step-card">
            <div className="step-number">3</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <CheckCircle2 size={18} color="var(--success)" />
              <h4 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>Act & Optimize</h4>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>
              Review anomalies, question the AI copilot for cash flow advice, mark verified resolutions, and export audit statements.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section style={{ maxWidth: '1160px', margin: '0 auto', padding: '0 24px 60px' }}>
        <div
          className="glass-panel"
          style={{
            padding: '48px 32px',
            textAlign: 'center',
            backgroundColor: 'var(--surface-container)',
            border: '1px solid var(--outline-variant)',
            boxShadow: 'var(--shadow-glow)',
            borderRadius: 'var(--rounded-xl)',
          }}
        >
          <h2 style={{ fontSize: '2rem', marginBottom: '12px', color: 'var(--text-primary)' }}>
            Ready to Take Control of Your Business Cash Flow?
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '580px', margin: '0 auto 28px', fontSize: '0.95rem' }}>
            Experience VyaparIQ's AI copilot, explore interactive ledger filters, and test anomaly detection with sample data.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            {isSignedIn ? (
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/apps')}
                icon={<ArrowRight size={18} />}
              >
                Launch VyaparIQ App Suite
              </Button>
            ) : (
              <>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/sign-up')}
                  icon={<UserPlus size={18} />}
                >
                  Create Free Account
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/sign-in')}
                  icon={<LogIn size={18} />}
                >
                  Sign In
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Spacious, FinTrace AI-Inspired Responsive Footer (Phase 3 & Phase 4) */}
      <footer className="landing-footer">
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          {/* Main 4-Column Footer Navigation */}
          <div className="footer-grid">
            {/* Column 1: Brand & Positioning */}
            <div className="footer-col" style={{ paddingRight: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
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
                    boxShadow: 'var(--shadow-glow)',
                  }}
                >
                  <Zap size={18} fill="#FFF" />
                </div>
                <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  Vyapar<span style={{ color: 'var(--info)' }}>IQ</span>
                </span>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, margin: '4px 0 12px' }}>
                AI-powered financial intelligence & forensic audit SaaS designed for small businesses, accountants, and auditors. Automated CSV ledger reconciliation, deterministic anomaly discovery, and grounded conversational analytics.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.72rem',
                    padding: '3px 10px',
                    borderRadius: 'var(--rounded-full)',
                    backgroundColor: 'var(--tertiary-container)',
                    color: 'var(--tertiary)',
                    fontWeight: 600,
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--tertiary)' }} />
                  AIVORA 2K26 Edition
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '3px 10px',
                    borderRadius: 'var(--rounded-full)',
                    backgroundColor: 'var(--surface-container-high)',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                    border: '1px solid var(--outline-variant)',
                  }}
                >
                  SHA-256 Batch Hashing
                </span>
              </div>
            </div>

            {/* Column 2: Product Overview */}
            <div className="footer-col">
              <span className="footer-col-title">Product Overview</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link001 href="#features" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Platform Features
                </Link001>
                <Link001 href="#workflow" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  3-Step Workflow
                </Link001>
                <Link001 href="#preview" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Interactive Trajectory
                </Link001>
                <div
                  onClick={handleDownloadTemplate}
                  role="button"
                  tabIndex={0}
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Download size={13} style={{ opacity: 0.8 }} />
                  <span>Sample CSV Template</span>
                </div>
                <Link001 to="/apps" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  App Launcher Suite
                </Link001>
              </div>
            </div>

            {/* Column 3: Workspace Modules */}
            <div className="footer-col">
              <span className="footer-col-title">Workspace Modules</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link001 to="/dashboard" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Financial Dashboard
                </Link001>
                <Link001 to="/transactions" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Reconciled Ledger
                </Link001>
                <Link001 to="/analytics" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Cashflow Analytics
                </Link001>
                <Link001 to="/findings" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Forensic Findings
                </Link001>
                <Link001 to="/network" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Counterparty Graph
                </Link001>
                <Link001 to="/copilot" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Grounded AI Copilot
                </Link001>
                <Link001 to="/reports" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Audit Statements & PDF
                </Link001>
              </div>
            </div>

            {/* Column 4: Account Access */}
            <div className="footer-col">
              <span className="footer-col-title">Account Access</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link001 to="/sign-in" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Sign In to Workspace
                </Link001>
                <Link001 to="/sign-up" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Create Free Account
                </Link001>
                <Link001 to="/settings" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Workspace Settings
                </Link001>
                <Link001 to="/apps" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Switch Workspace
                </Link001>
              </div>
            </div>
          </div>

          {/* Bottom Status & Utility Row */}
          <div
            style={{
              marginTop: '48px',
              paddingTop: '20px',
              borderTop: '1px solid var(--outline-variant)',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px',
              fontSize: '0.76rem',
              color: 'var(--text-muted)',
            }}
          >
            <div>
              © 2026 VyaparIQ • Engineered for AIVORA 2K26 (AI for Business). All rights reserved.
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--tertiary)',
                  }}
                />
                All Systems Operational
              </span>
              <span>Deterministic Heuristic Engine v2.4</span>
              <span>Clerk Auth Secure</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Landing-Page-Only FAQ Assistant */}
      <LandingFaqChatbot />
    </div>
  );
};
