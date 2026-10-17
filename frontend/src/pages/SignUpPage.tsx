import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SignUp } from '@clerk/clerk-react';
import { ArrowLeft, CheckCircle2, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { useAppAuth } from '../context/AuthContext';

export const SignUpPage: React.FC = () => {
  const { hasClerkKey, isMockMode, isSignedIn } = useAppAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isSignedIn) {
      navigate('/apps', { replace: true });
    }
  }, [isSignedIn, navigate]);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-canvas)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow effects */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Top Header */}
      <header
        style={{
          padding: '24px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textDecoration: 'none',
          }}
        >
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
            Vyapar<span style={{ color: 'var(--primary)' }}>IQ</span>
          </span>
        </Link>

        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.86rem',
            color: 'var(--text-secondary)',
            fontWeight: 500,
            textDecoration: 'none',
            padding: '8px 14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Content Area */}
      <main
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px 24px',
          position: 'relative',
          zIndex: 10,
          flex: 1,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px', maxWidth: '460px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '9999px',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              fontSize: '0.78rem',
              fontWeight: 600,
              marginBottom: '12px',
            }}
          >
            <ShieldCheck size={14} />
            <span>Create Your Business Identity</span>
          </div>
          <h1
            style={{
              fontSize: '1.85rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              marginBottom: '8px',
            }}
          >
            Get Started with VyaparIQ
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Automate ledger reconciliation, detect financial anomalies, and generate audit-ready workpapers.
          </p>
        </div>

        {/* Clerk Sign Up Component or Dev Mock Mode Card */}
        {hasClerkKey ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <SignUp
              path="/sign-up"
              routing="path"
              signInUrl="/sign-in"
              forceRedirectUrl="/apps"
              fallbackRedirectUrl="/apps"
            />

            {/* Optional Dev shortcut */}
            {isMockMode && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  textAlign: 'center',
                  maxWidth: '380px',
                }}
              >
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Testing offline or in mock mode?
                </div>
                <button
                  onClick={() => navigate('/apps')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-card)',
                    color: 'var(--text-primary)',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Sparkles size={14} color="#6366F1" />
                  <span>Enter as Srushti Patil (Dev Mock)</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div
            className="glass-card"
            style={{
              maxWidth: '420px',
              width: '100%',
              padding: '32px',
              textAlign: 'center',
              borderRadius: 'var(--radius-xl)',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(99, 102, 241, 0.12)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}
            >
              <Sparkles size={24} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Developer Mock Mode Active
            </h2>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>
              Clerk publishable key is not configured in frontend <code>.env</code>. You can jump directly into the full platform suite.
            </p>

            <button
              onClick={() => navigate('/apps')}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--primary-gradient)',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '0.92rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-glow)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <CheckCircle2 size={18} />
              <span>Launch Workspace as Srushti Patil</span>
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          padding: '24px 32px',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          position: 'relative',
          zIndex: 10,
        }}
      >
        VyaparIQ • Business Audit & Financial Intelligence Suite • AIVORA 2K26
      </footer>
    </div>
  );
};

export default SignUpPage;
