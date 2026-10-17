import { env } from '../config/env';
import {
  AnalyticsCategoriesResponse,
  AnalyticsSummaryResponse,
  AnalyticsTrendsResponse,
} from '../types/contracts.types';
import { apiClient } from './api.client';

export interface AnalyticsFilterParams {
  startDate?: string;
  endDate?: string;
}

export interface AnalyticsTrendsParams extends AnalyticsFilterParams {
  groupBy?: 'day' | 'month';
}

export interface AnalyticsCategoriesParams extends AnalyticsFilterParams {
  type?: 'income' | 'expense' | 'all';
}

export const analyticsService = {
  /**
   * GET /api/analytics/summary
   * Returns total income, total expenses, net balance, transaction count and currency.
   */
  async getSummary(params: AnalyticsFilterParams = {}): Promise<AnalyticsSummaryResponse> {
    if (env.useMockData) {
      await new Promise((r) => setTimeout(r, 150));
      return {
        totalIncome: 184500,
        totalExpenses: 98250,
        netBalance: 86250,
        transactionCount: 11,
        incomeCount: 3,
        expenseCount: 8,
        currency: 'INR',
        period: {
          startDate: params.startDate || null,
          endDate: params.endDate || null,
        },
        calculationBasis: 'reconciled_transactions',
      };
    }

    return apiClient<AnalyticsSummaryResponse>('/analytics/summary', {
      method: 'GET',
      params: {
        startDate: params.startDate,
        endDate: params.endDate,
      },
    });
  },

  /**
   * GET /api/analytics/trends
   * Returns chronological income and expenses grouped by month or day.
   */
  async getTrends(params: AnalyticsTrendsParams = {}): Promise<AnalyticsTrendsResponse> {
    if (env.useMockData) {
      await new Promise((r) => setTimeout(r, 150));
      return {
        groupBy: params.groupBy || 'month',
        period: {
          startDate: params.startDate || null,
          endDate: params.endDate || null,
        },
        trends: [
          { period: '2026-08', income: 145000, expenses: 82000, netCashflow: 63000, transactionCount: 9 },
          { period: '2026-09', income: 162000, expenses: 91000, netCashflow: 71000, transactionCount: 10 },
          { period: '2026-10', income: 184500, expenses: 98250, netCashflow: 86250, transactionCount: 11 },
        ],
      };
    }

    return apiClient<AnalyticsTrendsResponse>('/analytics/trends', {
      method: 'GET',
      params: {
        startDate: params.startDate,
        endDate: params.endDate,
        groupBy: params.groupBy,
      },
    });
  },

  /**
   * GET /api/analytics/categories
   * Returns breakdown of income or expense totals by category.
   */
  async getCategories(params: AnalyticsCategoriesParams = {}): Promise<AnalyticsCategoriesResponse> {
    if (env.useMockData) {
      await new Promise((r) => setTimeout(r, 150));
      return {
        period: {
          startDate: params.startDate || null,
          endDate: params.endDate || null,
        },
        typeFilter: params.type || 'all',
        totalIncome: 184500,
        totalExpenses: 98250,
        categories: [
          { category: 'Inventory', type: 'expense', totalAmount: 52000, transactionCount: 4, percentage: 52.9 },
          { category: 'Utilities', type: 'expense', totalAmount: 18500, transactionCount: 2, percentage: 18.8 },
          { category: 'Logistics', type: 'expense', totalAmount: 14750, transactionCount: 3, percentage: 15.0 },
          { category: 'Rent', type: 'expense', totalAmount: 13000, transactionCount: 1, percentage: 13.3 },
        ],
        breakdown: {
          income: [
            { category: 'Sales', type: 'income', totalAmount: 184500, transactionCount: 3, percentage: 100 },
          ],
          expenses: [
            { category: 'Inventory', type: 'expense', totalAmount: 52000, transactionCount: 4, percentage: 52.9 },
            { category: 'Utilities', type: 'expense', totalAmount: 18500, transactionCount: 2, percentage: 18.8 },
            { category: 'Logistics', type: 'expense', totalAmount: 14750, transactionCount: 3, percentage: 15.0 },
            { category: 'Rent', type: 'expense', totalAmount: 13000, transactionCount: 1, percentage: 13.3 },
          ],
        },
      };
    }

    return apiClient<AnalyticsCategoriesResponse>('/analytics/categories', {
      method: 'GET',
      params: {
        startDate: params.startDate,
        endDate: params.endDate,
        type: params.type,
      },
    });
  },
};
