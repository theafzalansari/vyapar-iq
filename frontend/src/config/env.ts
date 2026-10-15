/**
 * Frontend environment configuration helper
 */

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  clerkPublishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '',
  useMockData: import.meta.env.VITE_USE_MOCK_DATA === 'true' || !import.meta.env.VITE_API_BASE_URL,
  isDev: import.meta.env.DEV,
};
