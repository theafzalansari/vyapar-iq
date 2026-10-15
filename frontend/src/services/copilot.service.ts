import { env } from '../config/env';
import { mockDefaultCopilotResponse } from '../mocks/mockCopilot';
import { CopilotChatRequest, CopilotChatResponse } from '../types/contracts.types';
import { apiClient } from './api.client';

export const copilotService = {
  async sendMessage(request: CopilotChatRequest): Promise<CopilotChatResponse> {
    if (env.useMockData) {
      await new Promise((r) => setTimeout(r, 700));
      return mockDefaultCopilotResponse(request.message);
    }

    return apiClient<CopilotChatResponse>('/copilot/chat', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },
};
