import { Anomaly } from '../models/Anomaly';
import { ITransactionDocument, Transaction } from '../models/Transaction';
import { AnalyticsFilterInput, normalizeDateBoundaries } from '../schemas/analytics.schema';
import {
  CategoryBreakdown,
  DashboardSummaryResponse,
  MonthlyCashflowTrend,
  TransactionDTO,
} from '../types/contracts.types';
import { analyticsService, roundCurrency } from './analytics.service';
import { anomalyDetectionService } from './anomalyDetection.service';
import { mapTransactionToDTO } from './csvImport.service';

/**
 * Formats a numeric currency value with Indian numbering conventions (en-IN).
 */
export function formatINR(val: number): string {
  const absVal = Math.abs(val);
  const formatted = absVal.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: Number.isInteger(absVal) ? 0 : 2,
  });
  return val < 0 ? `-₹${formatted}` : `₹${formatted}`;
}

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/**
 * Converts a period string like "2026-10" to "Oct 2026".
 */
export function formatMonthPeriod(periodStr: string): string {
  const parts = periodStr.split('-');
  if (parts.length >= 2) {
    const year = parts[0];
    const monthIdx = parseInt(parts[1], 10) - 1;
    if (monthIdx >= 0 && monthIdx < 12) {
      return `${MONTH_NAMES[monthIdx]} ${year}`;
    }
  }
  return periodStr;
}

export const dashboardService = {
  /**
   * Aggregates comprehensive dashboard business metrics for the authenticated Clerk user.
   * Completely deterministic, grounded in the user's verified ledger data, and strictly isolated.
   */
  async getDashboardSummary(
    userId: string,
    filter: AnalyticsFilterInput = {}
  ): Promise<DashboardSummaryResponse> {
    const { startDate, endDate } = normalizeDateBoundaries(filter.startDate, filter.endDate);

    // 1. Compute deterministic summary metrics (total income, total expenses, net balance)
    const summary = await analyticsService.getSummary(userId, filter);

    // 2. Previous period calculation for changePercentage when explicit date range is supplied
    let revenueChange: number | undefined;
    let expenseChange: number | undefined;
    let profitChange: number | undefined;

    if (startDate && endDate) {
      const durationMs = endDate.getTime() - startDate.getTime();
      const prevEnd = new Date(startDate.getTime() - 1);
      const prevStart = new Date(prevEnd.getTime() - durationMs);

      const prevSummary = await analyticsService.getSummary(userId, {
        startDate: prevStart.toISOString(),
        endDate: prevEnd.toISOString(),
      });

      if (prevSummary.totalIncome > 0) {
        revenueChange = roundCurrency(
          ((summary.totalIncome - prevSummary.totalIncome) / prevSummary.totalIncome) * 100
        );
      }
      if (prevSummary.totalExpenses > 0) {
        expenseChange = roundCurrency(
          ((summary.totalExpenses - prevSummary.totalExpenses) / prevSummary.totalExpenses) * 100
        );
      }
      if (prevSummary.netBalance !== 0) {
        profitChange = roundCurrency(
          ((summary.netBalance - prevSummary.netBalance) / Math.abs(prevSummary.netBalance)) * 100
        );
      }
    }

    // 3. Monthly cashflow trends
    const trendsResult = await analyticsService.getTrends(userId, {
      startDate: filter.startDate,
      endDate: filter.endDate,
      groupBy: 'month',
    });

    const cashflowTrends: MonthlyCashflowTrend[] = trendsResult.trends.map((t) => ({
      period: formatMonthPeriod(t.period),
      income: t.income,
      expenses: t.expenses,
      netCashflow: t.netCashflow,
    }));

    // 4. Top category breakdowns (income and expense)
    const [expenseCatsResult, incomeCatsResult] = await Promise.all([
      analyticsService.getCategories(userId, {
        startDate: filter.startDate,
        endDate: filter.endDate,
        type: 'expense',
      }),
      analyticsService.getCategories(userId, {
        startDate: filter.startDate,
        endDate: filter.endDate,
        type: 'income',
      }),
    ]);

    const topExpenseCategories: CategoryBreakdown[] = expenseCatsResult.categories
      .slice(0, 5)
      .map((c) => ({
        category: c.category,
        amount: c.totalAmount,
        percentage: c.percentage,
        transactionCount: c.transactionCount,
      }));

    const topIncomeCategories: CategoryBreakdown[] = incomeCatsResult.categories
      .slice(0, 5)
      .map((c) => ({
        category: c.category,
        amount: c.totalAmount,
        percentage: c.percentage,
        transactionCount: c.transactionCount,
      }));

    // 5. Recent transactions for the widget (last 5 entries)
    const recentDocs = await Transaction.find({
      userId,
      amount: { $gt: 0 },
    })
      .sort({ date: -1, createdAt: -1 })
      .limit(5)
      .lean();

    const recentTransactions: TransactionDTO[] = recentDocs.map((doc) =>
      mapTransactionToDTO(doc as unknown as ITransactionDocument)
    );

    // 6. Unresolved anomaly alerts count
    let anomalyAlertsCount = await Anomaly.countDocuments({
      userId,
      isResolved: false,
    });

    // Auto-detect anomalies if never scanned before and user has transactions
    if (anomalyAlertsCount === 0 && summary.transactionCount > 0) {
      const existingAnomalyCount = await Anomaly.countDocuments({ userId });
      if (existingAnomalyCount === 0) {
        const detected = await anomalyDetectionService.detectAnomalies(userId);
        anomalyAlertsCount = detected.anomalies.filter((a) => !a.isResolved).length;
      }
    }

    // 7. Formulate final response structure conforming strictly to DashboardSummaryResponse
    const periodStart =
      summary.period.startDate || startDate?.toISOString() || new Date().toISOString();
    const periodEnd = summary.period.endDate || endDate?.toISOString() || new Date().toISOString();

    return {
      period: {
        startDate: periodStart,
        endDate: periodEnd,
      },
      metrics: {
        totalRevenue: {
          label: 'Total Revenue',
          value: summary.totalIncome,
          formatted: formatINR(summary.totalIncome),
          changePercentage: revenueChange,
          trend:
            summary.totalIncome > 0
              ? revenueChange !== undefined
                ? revenueChange >= 0
                  ? 'up'
                  : 'down'
                : 'up'
              : 'neutral',
          helperText:
            revenueChange !== undefined
              ? `${revenueChange >= 0 ? '+' : ''}${revenueChange}% vs previous period`
              : summary.totalIncome > 0
              ? `${summary.incomeCount} incoming receipt${summary.incomeCount === 1 ? '' : 's'}`
              : 'No revenue recorded',
        },
        totalExpenses: {
          label: 'Total Expenses',
          value: summary.totalExpenses,
          formatted: formatINR(summary.totalExpenses),
          changePercentage: expenseChange,
          trend:
            summary.totalExpenses > 0
              ? expenseChange !== undefined
                ? expenseChange <= 0
                  ? 'down'
                  : 'up'
                : 'down'
              : 'neutral',
          helperText:
            expenseChange !== undefined
              ? `${expenseChange >= 0 ? '+' : ''}${expenseChange}% vs previous period`
              : summary.totalExpenses > 0
              ? `${summary.expenseCount} operating expenditure${summary.expenseCount === 1 ? '' : 's'}`
              : 'No expenses recorded',
        },
        netProfit: {
          label: 'Net Profit Margin',
          value: summary.netBalance,
          formatted: formatINR(summary.netBalance),
          changePercentage: profitChange,
          trend: summary.netBalance > 0 ? 'up' : summary.netBalance < 0 ? 'down' : 'neutral',
          helperText:
            summary.totalIncome > 0
              ? `${((summary.netBalance / summary.totalIncome) * 100).toFixed(1)}% profit margin`
              : summary.transactionCount > 0
              ? 'Operating with zero revenue'
              : 'No transactions recorded',
        },
        burnRateOrSavings: {
          label: summary.netBalance >= 0 ? 'Cash Flow Surplus' : 'Net Burn Rate',
          value: Math.abs(summary.netBalance),
          formatted: formatINR(Math.abs(summary.netBalance)),
          changePercentage: profitChange,
          trend: summary.netBalance >= 0 ? 'up' : 'down',
          helperText:
            summary.netBalance >= 0 ? 'Available liquid buffer' : 'Operating cash deficit',
        },
      },
      cashflowTrends,
      topExpenseCategories,
      topIncomeCategories,
      recentTransactions,
      anomalyAlertsCount,
    };
  },
};
