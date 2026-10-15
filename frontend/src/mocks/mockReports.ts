export interface AuditReportData {
  reportId: string;
  generatedAt: string;
  period: {
    startDate: string;
    endDate: string;
  };
  businessProfile: {
    name: string;
    gstin: string;
    pan: string;
    industry: string;
    auditorNotes: string;
  };
  financialSummary: {
    totalRevenue: number;
    totalExpenses: number;
    netOperatingProfit: number;
    profitMarginPct: number;
    reconciledCount: number;
    unreconciledCount: number;
    totalVolume: number;
  };
  anomaliesAudit: {
    totalIdentified: number;
    resolvedCount: number;
    openCriticalCount: number;
    totalDisputedAmount: number;
  };
}

export const mockReportData: AuditReportData = {
  reportId: 'REP-2026-OCT-01',
  generatedAt: '2026-10-15T10:30:00.000Z',
  period: {
    startDate: '2026-10-01T00:00:00.000Z',
    endDate: '2026-10-15T23:59:59.000Z',
  },
  businessProfile: {
    name: 'Ansari Textiles & Trading Co.',
    gstin: '27AABCU9603R1ZM',
    pan: 'AABCU9603R',
    industry: 'Textile Wholesale & Distribution',
    auditorNotes: 'Reconciliation performed via VyaparIQ deterministic ingestion engine. Sample verified against bank statement UPI and NEFT settlements.',
  },
  financialSummary: {
    totalRevenue: 184500,
    totalExpenses: 98250,
    netOperatingProfit: 86250,
    profitMarginPct: 46.7,
    reconciledCount: 10,
    unreconciledCount: 1,
    totalVolume: 282750,
  },
  anomaliesAudit: {
    totalIdentified: 4,
    resolvedCount: 1,
    openCriticalCount: 1,
    totalDisputedAmount: 18980,
  },
};
