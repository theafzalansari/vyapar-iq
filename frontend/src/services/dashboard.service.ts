import { env } from '../config/env';
import { mockDashboardData } from '../mocks/mockDashboard';
import { DashboardSummaryResponse } from '../types/contracts.types';
import { apiClient } from './api.client';

export const dashboardService = {
  async getDashboardSummary(startDate?: string, endDate?: string): Promise<DashboardSummaryResponse> {
    if (env.useMockData) {
      await new Promise((r) => setTimeout(r, 200));
      return mockDashboardData;
    }

    return apiClient<DashboardSummaryResponse>('/dashboard/summary', {
      method: 'GET',
      params: { startDate, endDate },
    });
  },
};
