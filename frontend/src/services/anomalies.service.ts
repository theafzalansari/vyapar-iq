import { env } from '../config/env';
import { mockAnomaliesData } from '../mocks/mockAnomalies';
import { AnomalyListResponse } from '../types/contracts.types';
import { apiClient } from './api.client';

export const anomaliesService = {
  async getAnomalies(): Promise<AnomalyListResponse> {
    if (env.useMockData) {
      await new Promise((r) => setTimeout(r, 200));
      return mockAnomaliesData;
    }

    return apiClient<AnomalyListResponse>('/anomalies', {
      method: 'GET',
    });
  },

  async resolveAnomaly(anomalyId: string): Promise<{ success: boolean; anomalyId: string }> {
    if (env.useMockData) {
      await new Promise((r) => setTimeout(r, 300));
      const found = mockAnomaliesData.anomalies.find((a) => a.id === anomalyId);
      if (found) {
        found.isResolved = true;
        found.resolvedAt = new Date().toISOString();
      }
      return { success: true, anomalyId };
    }

    return apiClient<{ success: boolean; anomalyId: string }>(`/anomalies/${anomalyId}/resolve`, {
      method: 'PATCH',
    });
  },
};
