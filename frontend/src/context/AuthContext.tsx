import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClerkProvider,
  useAuth as useClerkAuth,
  useClerk,
  useUser as useClerkUser,
} from '@clerk/clerk-react';
import { env } from '../config/env';
import { setAuthTokenGetter } from '../services/api.client';
import { useTheme } from './ThemeContext';

export interface AppUser {
  id: string;
  fullName: string;
  firstName: string;
  primaryEmailAddress: { emailAddress: string };
  imageUrl?: string;
}

export interface AuthContextType {
  isLoaded: boolean;
  isSignedIn: boolean;
  userId: string | null;
  user: AppUser | null;
  isMockMode: boolean;
  hasClerkKey: boolean;
  signOut: () => Promise<void>;
}

const defaultMockUser: AppUser = {
  id: 'user_srushti_patil',
  fullName: 'Srushti Patil',
  firstName: 'Srushti',
  primaryEmailAddress: { emailAddress: 'srushti.patil@vyapariq.dev' },
};

const AuthContext = createContext<AuthContextType>({
  isLoaded: true,
  isSignedIn: true,
  userId: defaultMockUser.id,
  user: defaultMockUser,
  isMockMode: true,
  hasClerkKey: false,
  signOut: async () => {},
});

/**
 * Mock Auth Provider used when Clerk keys are not configured or VITE_USE_MOCK_DATA is true
 */
const MockAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    navigate('/');
  };

  return (
    <AuthContext.Provider
      value={{
        isLoaded: true,
        isSignedIn: true,
        userId: defaultMockUser.id,
        user: defaultMockUser,
        isMockMode: true,
        hasClerkKey: false,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Clerk Auth Bridge that syncs Clerk session token with our central API Client
 */
const ClerkSyncWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getToken, isLoaded, isSignedIn, userId } = useClerkAuth();
  const { user } = useClerkUser();
  const { signOut: clerkSignOut } = useClerk();
  const navigate = useNavigate();

  useEffect(() => {
    if (getToken) {
      setAuthTokenGetter(async () => {
        try {
          return await getToken();
        } catch {
          return null;
        }
      });
    }
  }, [getToken]);

  const mappedUser: AppUser | null = useMemo(() => {
    if (!user) return null;
    return {
      id: user.id,
      fullName: user.fullName || user.firstName || 'User',
      firstName: user.firstName || 'User',
      primaryEmailAddress: {
        emailAddress: user.primaryEmailAddress?.emailAddress || '',
      },
      imageUrl: user.imageUrl,
    };
  }, [user]);

  const handleSignOut = async () => {
    await clerkSignOut({ redirectUrl: '/' });
    navigate('/');
  };

  return (
    <AuthContext.Provider
      value={{
        isLoaded,
        isSignedIn: !!isSignedIn,
        userId: userId || null,
        user: mappedUser,
        isMockMode: false,
        hasClerkKey: true,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Unified AppAuthProvider: Initializes Clerk when publishable key is present,
 * or gracefully falls back to local developer mock authentication.
 */
export const AppAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const hasClerkKey = Boolean(
    env.clerkPublishableKey &&
      env.clerkPublishableKey.startsWith('pk_') &&
      !env.clerkPublishableKey.includes('placeholder')
  );

  const clerkAppearance = useMemo(
    () => ({
      variables: {
        colorPrimary: '#6366F1',
        colorBackground: theme === 'dark' ? '#111827' : '#FFFFFF',
        colorText: theme === 'dark' ? '#F8FAFC' : '#0F172A',
        colorTextSecondary: theme === 'dark' ? '#94A3B8' : '#64748B',
        colorInputBackground: theme === 'dark' ? '#1F2937' : '#F8FAFC',
        colorInputBorder: theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : '#CBD5E1',
        borderRadius: '10px',
        fontFamily: 'Inter, sans-serif',
      },
      elements: {
        card: {
          backgroundColor: theme === 'dark' ? '#111827' : '#FFFFFF',
          border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #E2E8F0',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
        },
        headerTitle: {
          color: theme === 'dark' ? '#F8FAFC' : '#0F172A',
        },
        headerSubtitle: {
          color: theme === 'dark' ? '#94A3B8' : '#64748B',
        },
        formButtonPrimary: {
          backgroundColor: '#6366F1',
          '&:hover': {
            backgroundColor: '#4F46E5',
          },
        },
        footerActionLink: {
          color: '#6366F1',
          '&:hover': {
            color: '#4F46E5',
          },
        },
      },
    }),
    [theme]
  );

  if (hasClerkKey) {
    return (
      <ClerkProvider
        publishableKey={env.clerkPublishableKey}
        routerPush={(to) => navigate(to)}
        routerReplace={(to) => navigate(to, { replace: true })}
        signInUrl="/sign-in"
        signUpUrl="/sign-up"
        afterSignOutUrl="/"
        appearance={clerkAppearance}
      >
        <ClerkSyncWrapper>{children}</ClerkSyncWrapper>
      </ClerkProvider>
    );
  }

  return <MockAuthProvider>{children}</MockAuthProvider>;
};

export const useAppAuth = () => useContext(AuthContext);
