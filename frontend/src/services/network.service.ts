import { env } from '../config/env';
import { mockNetworkData } from '../mocks/mockNetwork';
import { NetworkGraphResponse } from '../types/contracts.types';
import { apiClient } from './api.client';

export const networkService = {
  /**
   * Fetches the interactive transaction relationship graph from the backend.
   * Returns nodes (vendors, customers, transactions), edges, and relationship indicators.
   */
  async getNetworkGraph(params?: {
    startDate?: string;
    endDate?: string;
    category?: string;
  }): Promise<NetworkGraphResponse> {
    if (env.useMockData) {
      await new Promise((r) => setTimeout(r, 200));
      return {
        nodes: mockNetworkData.nodes,
        edges: mockNetworkData.edges,
        summary: {
          totalNodes: mockNetworkData.nodes.length,
          totalEdges: mockNetworkData.edges.length,
          vendorNodes: mockNetworkData.nodes.filter((n) => n.type === 'vendor').length,
          customerNodes: mockNetworkData.nodes.filter((n) => n.type === 'customer').length,
          transactionNodes: mockNetworkData.nodes.filter((n) => n.type === 'transaction').length,
          flaggedNodes: mockNetworkData.nodes.filter(
            (n) => n.severity && n.severity !== 'normal'
          ).length,
          flaggedEdges: mockNetworkData.edges.filter((e) => e.isFlagged).length,
        },
      };
    }

    return apiClient<NetworkGraphResponse>('/network-graph', {
      method: 'GET',
      params,
    });
  },
};
