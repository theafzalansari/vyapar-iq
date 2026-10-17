import { apiClient } from './api.client';

export interface AuthMeResponse {
  userId: string;
  message: string;
}

export const authService = {
  /**
   * GET /api/auth/me
   * Validates authenticated session against backend Clerk JWT / mock verification.
   */
  async getAuthMe(): Promise<AuthMeResponse> {
    return apiClient<AuthMeResponse>('/auth/me', {
      method: 'GET',
    });
  },
};
