import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  Download,
  FileText,
  Network,
  Shield,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  UploadCloud,
  Zap,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { CashflowChart } from '../components/dashboard/CashflowChart';
import { mockDashboardData } from '../mocks/mockDashboard';
import { transactionsService } from '../services/transactions.service';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

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
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Vyapar<span style={{ color: 'var(--info)' }}>IQ</span>
          </span>
        </div>

        {/* Product Navigation */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '28px' }} className="landing-nav-links">
          <Link to="/apps" style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 600 }}>
            App Suite
          </Link>
          <a href="#features" style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Features
          </a>
          <a href="#workflow" style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Workflow
          </a>
          <a href="#preview" style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Platform Preview
          </a>
          <a href="#audit" style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Audit & Compliance
          </a>
        </nav>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => navigate('/apps')}
            style={{
              color: 'var(--text-primary)',
              fontSize: '0.88rem',
              fontWeight: 600,
              padding: '8px 16px',
            }}
          >
            App Launcher
          </button>
          <Button variant="primary" size="sm" onClick={() => navigate('/dashboard')}>
            Launch Dashboard
          </Button>
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

        <p className="landing-subtitle">
          Empowering small businesses with automated CSV ledger reconciliation, explainable anomaly detection, grounded financial conversational intelligence, and audit-ready reports.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
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
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#FFFFFF', marginTop: '4px' }}>
                  ₹1,84,500
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--success)', fontWeight: 600 }}>
                  ↑ +14.2% vs previous period
                </span>
              </div>
              <div className="glass-panel" style={{ padding: '16px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Expenses</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#FFFFFF', marginTop: '4px' }}>
                  ₹98,250
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Operating costs reduced
                </span>
              </div>
              <div className="glass-panel" style={{ padding: '16px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Net Margin</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#FFFFFF', marginTop: '4px' }}>
                  ₹86,250
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 600 }}>
                  46.7% profit margin
                </span>
              </div>
              <div
                className="glass-panel"
                style={{ padding: '16px', borderLeft: '4px solid #EF4444' }}
              >
                <span style={{ fontSize: '0.78rem', color: '#F87171' }}>Audit Flags</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#EF4444', marginTop: '4px' }}>
                  3 Anomalies
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  1 critical duplicate check
                </span>
              </div>
            </div>

            {/* Cashflow Graphic Preview */}
            <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Cashflow Rolling Trajectory</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified Ledger Ingestion</span>
              </div>
              <CashflowChart data={mockDashboardData.cashflowTrends} />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars Section */}
      <section id="features" style={{ maxWidth: '1280px', margin: '0 auto', padding: '64px 24px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '2.1rem', color: '#FFFFFF', marginBottom: '12px' }}>
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
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#EF4444',
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
                backgroundColor: 'rgba(139, 92, 246, 0.15)',
                color: '#A78BFA',
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
          <h2 style={{ fontSize: '2.1rem', color: '#FFFFFF', marginBottom: '12px' }}>
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
              <h4 style={{ fontSize: '1.15rem' }}>Upload Statement CSV</h4>
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
              <h4 style={{ fontSize: '1.15rem' }}>Automated Analysis</h4>
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
              <h4 style={{ fontSize: '1.15rem' }}>Act & Optimize</h4>
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
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            boxShadow: 'var(--shadow-glow)',
          }}
        >
          <h2 style={{ fontSize: '2rem', marginBottom: '12px', color: '#FFFFFF' }}>
            Ready to Take Control of Your Business Cash Flow?
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '580px', margin: '0 auto 28px', fontSize: '0.95rem' }}>
            Experience VyaparIQ's AI copilot, explore interactive ledger filters, and test anomaly detection with sample data.
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/dashboard')}
            icon={<ArrowRight size={18} />}
          >
            Launch VyaparIQ App
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '24px',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '24px',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: 'var(--primary-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
              }}
            >
              <Zap size={16} fill="#FFF" />
            </div>
            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#FFFFFF' }}>
              Vyapar<span style={{ color: 'var(--info)' }}>IQ</span>
            </span>
          </div>

          <div style={{ display: 'flex', gap: '24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/transactions">Transactions</Link>
            <Link to="/findings">Findings</Link>
            <Link to="/copilot">AI Copilot</Link>
            <Link to="/network">Network Graph</Link>
            <Link to="/reports">Audit Reports</Link>
          </div>
        </div>

        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            fontSize: '0.76rem',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
          }}
        >
          <div>
            © 2026 VyaparIQ • Built for AIVORA 2K26 (AI for Business). All rights reserved.
          </div>
          <div style={{ maxWidth: '600px' }}>
            <strong>Legal Disclaimer:</strong> Algorithmic findings and anomaly detections represent statistical heuristics for operational accounting review. They do not constitute legal proof of fraud or financial auditing certifications.
          </div>
        </div>
      </footer>
    </div>
  );
};
