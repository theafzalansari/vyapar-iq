/**
 * VyaparIQ - Core Business & Feature API Contracts
 * Defines the public contracts for Frontend (Srushti Patil), AI logic, and Backend integration.
 */

// ============================================================================
// 1. Transaction & Domain Types
// ============================================================================

export type TransactionType = 'income' | 'expense';

export type PaymentMethod =
  | 'cash'
  | 'upi'
  | 'bank_transfer'
  | 'credit_card'
  | 'debit_card'
  | 'cheque'
  | 'other';

export type TransactionStatus = 'completed' | 'pending' | 'flagged' | 'reconciled';

export interface TransactionDTO {
  id: string;
  userId: string;
  batchId?: string | null;
  date: string; // ISO 8601
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  reference?: string | null;
  notes?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// 2. CSV Import Contract
// ============================================================================

export interface CsvRowError {
  row: number;
  field?: string;
  value?: unknown;
  message: string;
}

export interface CsvImportRequestMetadata {
  fileName: string;
  fileSize: number;
  defaultPaymentMethod?: PaymentMethod;
}

export interface CsvImportResponse {
  batchId: string;
  fileName: string;
  totalRows: number;
  importedRows: number;
  rejectedRows: number;
  successfulRows?: number;
  failedRows?: number;
  errors: CsvRowError[];
  sampleTransactions: TransactionDTO[];
  status: 'completed' | 'partial' | 'failed';
  importedAt: string;
}

// ============================================================================
// 3. Dashboard Summary Contract
// ============================================================================

export interface MetricCard {
  label: string;
  value: number;
  formatted: string;
  changePercentage?: number;
  trend?: 'up' | 'down' | 'neutral';
  helperText?: string;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface MonthlyCashflowTrend {
  period: string; // e.g. "2026-01", "Jan 2026"
  income: number;
  expenses: number;
  netCashflow: number;
}

export interface DashboardSummaryResponse {
  period: {
    startDate: string;
    endDate: string;
  };
  metrics: {
    totalRevenue: MetricCard;
    totalExpenses: MetricCard;
    netProfit: MetricCard;
    burnRateOrSavings: MetricCard;
  };
  cashflowTrends: MonthlyCashflowTrend[];
  topExpenseCategories: CategoryBreakdown[];
  topIncomeCategories: CategoryBreakdown[];
  recentTransactions: TransactionDTO[];
  anomalyAlertsCount: number;
}

// ============================================================================
// 4. Anomaly Findings Contract
// ============================================================================

export type AnomalySeverity = 'low' | 'medium' | 'high' | 'critical';

export type AnomalyType =
  | 'expense_spike'
  | 'duplicate_payment'
  | 'unexpected_vendor'
  | 'negative_cashflow'
  | 'irregular_frequency'
  | 'unusual_category';

export interface AnomalyFinding {
  id: string;
  type: AnomalyType;
  severity: AnomalySeverity;
  title: string;
  description: string;
  detectedAt: string;
  transactionId?: string;
  affectedAmount?: number;
  confidenceScore: number; // 0.00 to 1.00
  recommendedAction: string;
  isResolved: boolean;
  resolvedAt?: string;
}

export interface AnomalyListResponse {
  anomalies: AnomalyFinding[];
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

// ============================================================================
// 5. Copilot Chat Contract
// ============================================================================

export interface CopilotChatRequest {
  message: string;
  context?: {
    startDate?: string;
    endDate?: string;
    category?: string;
    anomalyId?: string;
  };
}

export interface GroundedMetric {
  metric: string;
  value: string | number;
  basis: string;
}

export interface ActionRecommendation {
  id: string;
  title: string;
  actionType: 'review_transactions' | 'set_budget_alert' | 'export_report' | 'reconcile_batch';
  payload?: Record<string, unknown>;
}

export interface CopilotChatResponse {
  reply: string;
  groundedMetrics: GroundedMetric[];
  suggestedFollowUps: string[];
  recommendedActions: ActionRecommendation[];
  confidence: number;
  timestamp: string;
}
