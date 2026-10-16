import { AuditReportData } from '../types/contracts.types';
import { mockTransactions } from './mockTransactions';

export const mockReportData: AuditReportData = {
  reportId: 'REP-2026-OCT-01',
  generatedAt: '2026-10-15T10:30:00.000Z',
  period: {
    startDate: '2026-10-01',
    endDate: '2026-10-15',
  },
  scope: 'reconciliation',
  businessProfile: {
    name: 'Ansari Textiles & Trading Co.',
    gstin: '27AABCU9603R1ZM',
    pan: 'AABCU9603R',
    industry: 'Textile Wholesale & Distribution',
    auditorNotes:
      'Reconciliation performed via VyaparIQ deterministic ingestion engine. Sample verified against bank statement UPI and NEFT settlements.',
  },
  financialSummary: {
    totalRevenue: 184500,
    totalExpenses: 98250,
    netOperatingProfit: 86250,
    profitMarginPct: 46.7,
    reconciledCount: 10,
    unreconciledCount: 1,
    totalVolume: 11,
    currency: 'INR',
  },
  anomaliesAudit: {
    totalIdentified: 4,
    resolvedCount: 1,
    openCriticalCount: 1,
    totalDisputedAmount: 18980,
  },
  expenseCategories: [
    {
      category: 'Inventory',
      totalAmount: 52000,
      transactionCount: 4,
      percentage: 52.9,
    },
    {
      category: 'Utilities',
      totalAmount: 18500,
      transactionCount: 2,
      percentage: 18.8,
    },
    {
      category: 'Logistics',
      totalAmount: 14750,
      transactionCount: 3,
      percentage: 15.0,
    },
    {
      category: 'Rent',
      totalAmount: 13000,
      transactionCount: 1,
      percentage: 13.3,
    },
  ],
  cashflowTrends: [
    {
      period: '2026-08',
      income: 145000,
      expenses: 82000,
      netCashflow: 63000,
      transactionCount: 9,
    },
    {
      period: '2026-09',
      income: 162000,
      expenses: 91000,
      netCashflow: 71000,
      transactionCount: 10,
    },
    {
      period: '2026-10',
      income: 184500,
      expenses: 98250,
      netCashflow: 86250,
      transactionCount: 11,
    },
  ],
  findings: [
    {
      id: 'anom_01',
      type: 'duplicate_payment',
      severity: 'critical',
      title: 'Potential Duplicate Payment',
      description: 'Identical amount of ₹15,000 sent to vendor Raw Material Supplier twice within 24 hours.',
      detectedAt: '2026-10-12T14:20:00.000Z',
      transactionId: 'tx_106',
      affectedAmount: 15000,
      confidenceScore: 0.94,
      recommendedAction: 'Verify vendor ledger to ensure payment was not debited twice.',
      isResolved: false,
    },
    {
      id: 'anom_02',
      type: 'expense_spike',
      severity: 'high',
      title: 'Unexpected Expense Surge',
      description: 'Logistics outflow surged 180% above the 30-day moving average.',
      detectedAt: '2026-10-14T09:15:00.000Z',
      transactionId: 'tx_108',
      affectedAmount: 3980,
      confidenceScore: 0.82,
      recommendedAction: 'Review dispatch invoice and fuel surcharge annexures.',
      isResolved: false,
    },
  ],
  sampleTransactions: mockTransactions.slice(0, 10),
  actionRecommendations: [
    {
      id: 'rec_01',
      title: 'Review Duplicate Vendor Payouts',
      priority: 'high',
      category: 'Cash Flow Protection',
      description: 'Verify duplicate invoice #INV-492 to prevent unrecovered payment leakage.',
    },
    {
      id: 'rec_02',
      title: 'Inventory Bulk Purchase Optimization',
      priority: 'medium',
      category: 'Cost Optimization',
      description: 'Inventory expenditures account for 52.9% of outlays. Review supplier trade credit terms.',
    },
  ],
  disclaimer:
    'DISCLAIMER: This automated audit report and detected anomalies indicate potential patterns and variance requiring human review; they do not constitute legal proof of fraud or tax non-compliance. All financial totals reflect ingested ledger records.',
};
