import React, { createContext, useContext, useEffect } from 'react';
import { ClerkProvider, useAuth as useClerkAuth, useUser as useClerkUser } from '@clerk/clerk-react';
import { env } from '../config/env';
import { setAuthTokenGetter } from '../services/api.client';

interface MockUser {
  id: string;
  fullName: string;
  firstName: string;
  primaryEmailAddress: { emailAddress: string };
  imageUrl?: string;
}

interface AuthContextType {
  isLoaded: boolean;
  isSignedIn: boolean;
  userId: string | null;
  user: MockUser | null;
  isMockMode: boolean;
}

const defaultMockUser: MockUser = {
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
});

/**
 * Internal Mock Auth Provider used when Clerk keys are not configured
 */
const MockAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthContext.Provider
      value={{
        isLoaded: true,
        isSignedIn: true,
        userId: defaultMockUser.id,
        user: defaultMockUser,
        isMockMode: true,
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

  const mappedUser: MockUser | null = user
    ? {
        id: user.id,
        fullName: user.fullName || user.firstName || 'User',
        firstName: user.firstName || 'User',
        primaryEmailAddress: {
          emailAddress: user.primaryEmailAddress?.emailAddress || '',
        },
        imageUrl: user.imageUrl,
      }
    : null;

  return (
    <AuthContext.Provider
      value={{
        isLoaded,
        isSignedIn: !!isSignedIn,
        userId: userId || null,
        user: mappedUser,
        isMockMode: false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Unified AppAuthProvider: Automatically chooses Clerk or Mock mode
 */
export const AppAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const hasClerkKey = Boolean(env.clerkPublishableKey && env.clerkPublishableKey.startsWith('pk_'));

  if (hasClerkKey) {
    return (
      <ClerkProvider publishableKey={env.clerkPublishableKey}>
        <ClerkSyncWrapper>{children}</ClerkSyncWrapper>
      </ClerkProvider>
    );
  }

  return <MockAuthProvider>{children}</MockAuthProvider>;
};

export const useAppAuth = () => useContext(AuthContext);
