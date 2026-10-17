import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { useAppAuth } from '../../context/AuthContext';

/**
 * Route protection guard that checks authentication state.
 * Displays a styled loading state while Clerk SDK initializes,
 * redirects unauthenticated visitors to /sign-in,
 * and renders child routes for authenticated users.
 */
export const ProtectedRoute: React.FC = () => {
  const { isLoaded, isSignedIn } = useAppAuth();
  const location = useLocation();

  if (!isLoaded) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-canvas)',
          gap: '20px',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: 'var(--shadow-glow)',
            animation: 'pulse 1.8s infinite ease-in-out',
          }}
        >
          <Zap size={28} fill="#FFFFFF" />
        </div>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
            Authenticating VyaparIQ Workspace
          </h3>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
            Verifying cryptographic credentials and workspace permissions...
          </p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
