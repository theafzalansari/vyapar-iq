import { DashboardSummaryResponse } from '../types/contracts.types';
import { mockTransactions } from './mockTransactions';

export const mockDashboardData: DashboardSummaryResponse = {
  period: {
    startDate: '2026-10-01T00:00:00.000Z',
    endDate: '2026-10-15T23:59:59.000Z',
  },
  metrics: {
    totalRevenue: {
      label: 'Total Revenue',
      value: 184500,
      formatted: '₹1,84,500',
      changePercentage: 14.2,
      trend: 'up',
      helperText: 'vs previous 15-day period',
    },
    totalExpenses: {
      label: 'Total Expenses',
      value: 98250,
      formatted: '₹98,250',
      changePercentage: -4.5,
      trend: 'down',
      helperText: 'Operating costs reduced',
    },
    netProfit: {
      label: 'Net Profit Margin',
      value: 86250,
      formatted: '₹86,250',
      changePercentage: 22.8,
      trend: 'up',
      helperText: '46.7% profit margin',
    },
    burnRateOrSavings: {
      label: 'Cash Flow Surplus',
      value: 64000,
      formatted: '₹64,000',
      changePercentage: 8.5,
      trend: 'up',
      helperText: 'Available liquid buffer',
    },
  },
  cashflowTrends: [
    { period: 'May 2026', income: 140000, expenses: 95000, netCashflow: 45000 },
    { period: 'Jun 2026', income: 155000, expenses: 102000, netCashflow: 53000 },
    { period: 'Jul 2026', income: 148000, expenses: 110000, netCashflow: 38000 },
    { period: 'Aug 2026', income: 172000, expenses: 105000, netCashflow: 67000 },
    { period: 'Sep 2026', income: 168000, expenses: 112000, netCashflow: 56000 },
    { period: 'Oct 2026', income: 184500, expenses: 98250, netCashflow: 86250 },
  ],
  topExpenseCategories: [
    { category: 'Inventory Restocking', amount: 48000, percentage: 48.8, transactionCount: 6 },
    { category: 'Commercial Rent', amount: 22000, percentage: 22.4, transactionCount: 1 },
    { category: 'Salaries & Wages', amount: 16500, percentage: 16.8, transactionCount: 3 },
    { category: 'Electricity & Utilities', amount: 6250, percentage: 6.4, transactionCount: 2 },
    { category: 'Packaging & Logistics', amount: 5500, percentage: 5.6, transactionCount: 4 },
  ],
  topIncomeCategories: [
    { category: 'Retail Counter Sales', amount: 112000, percentage: 60.7, transactionCount: 24 },
    { category: 'B2B Wholesale Orders', amount: 54500, percentage: 29.5, transactionCount: 5 },
    { category: 'Online Direct Orders', amount: 18000, percentage: 9.8, transactionCount: 8 },
  ],
  recentTransactions: mockTransactions.slice(0, 5),
  anomalyAlertsCount: 3,
};
