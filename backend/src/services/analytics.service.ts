import { FilterQuery } from 'mongoose';
import { ITransactionDocument, Transaction } from '../models/Transaction';
import {
  AnalyticsCategoriesQueryInput,
  AnalyticsFilterInput,
  AnalyticsTrendsQueryInput,
  normalizeDateBoundaries,
} from '../schemas/analytics.schema';
import {
  AnalyticsCategoriesResponse,
  AnalyticsSummaryResponse,
  AnalyticsTrendPoint,
  AnalyticsTrendsResponse,
  CategoryBreakdownItem,
} from '../types/contracts.types';

/**
 * Deterministic numeric rounding to 2 decimal places to avoid IEEE 754 precision drift.
 */
export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export const analyticsService = {
  /**
   * 1. GET /api/analytics/summary
   * Computes cumulative income, expenses, net balance (income minus expenses),
   * and transaction counts for the authenticated Clerk user.
   */
  async getSummary(
    userId: string,
    filter: AnalyticsFilterInput = {}
  ): Promise<AnalyticsSummaryResponse> {
    const { startDate, endDate } = normalizeDateBoundaries(filter.startDate, filter.endDate);

    const matchStage: FilterQuery<ITransactionDocument> = {
      userId,
      amount: { $gt: 0 },
    };

    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = startDate;
      if (endDate) matchStage.date.$lte = endDate;
    }

    const aggregationResults = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0],
            },
          },
          totalExpenses: {
            $sum: {
              $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0],
            },
          },
          incomeCount: {
            $sum: {
              $cond: [{ $eq: ['$type', 'income'] }, 1, 0],
            },
          },
          expenseCount: {
            $sum: {
              $cond: [{ $eq: ['$type', 'expense'] }, 1, 0],
            },
          },
          transactionCount: { $sum: 1 },
          earliestDate: { $min: '$date' },
          latestDate: { $max: '$date' },
        },
      },
    ]);

    if (!aggregationResults || aggregationResults.length === 0) {
      return {
        totalIncome: 0,
        totalExpenses: 0,
        netBalance: 0,
        transactionCount: 0,
        incomeCount: 0,
        expenseCount: 0,
        currency: 'INR',
        period: {
          startDate: startDate ? startDate.toISOString() : null,
          endDate: endDate ? endDate.toISOString() : null,
        },
        calculationBasis:
          'Calculated strictly from 0 ingested transactions in scope. Does not reflect total bank balance without verified opening balance.',
      };
    }

    const raw = aggregationResults[0];
    const totalIncome = roundCurrency(raw.totalIncome || 0);
    const totalExpenses = roundCurrency(raw.totalExpenses || 0);
    const netBalance = roundCurrency(totalIncome - totalExpenses);
    const transactionCount = raw.transactionCount || 0;
    const incomeCount = raw.incomeCount || 0;
    const expenseCount = raw.expenseCount || 0;

    const periodStart = startDate
      ? startDate.toISOString()
      : raw.earliestDate
      ? new Date(raw.earliestDate).toISOString()
      : null;

    const periodEnd = endDate
      ? endDate.toISOString()
      : raw.latestDate
      ? new Date(raw.latestDate).toISOString()
      : null;

    return {
      totalIncome,
      totalExpenses,
      netBalance,
      transactionCount,
      incomeCount,
      expenseCount,
      currency: 'INR',
      period: {
        startDate: periodStart,
        endDate: periodEnd,
      },
      calculationBasis: `Calculated strictly from ${transactionCount} ingested transaction(s) in scope (total income minus total expenses). Does not reflect total bank balance without verified opening balance.`,
    };
  },

  /**
   * 2. GET /api/analytics/trends
   * Returns income, expenses, and net cashflow grouped by day or month in consistent chronological order.
   */
  async getTrends(
    userId: string,
    query: AnalyticsTrendsQueryInput = { groupBy: 'month' }
  ): Promise<AnalyticsTrendsResponse> {
    const { startDate, endDate } = normalizeDateBoundaries(query.startDate, query.endDate);
    const groupBy = query.groupBy || 'month';
    const dateFormat = groupBy === 'day' ? '%Y-%m-%d' : '%Y-%m';

    const matchStage: FilterQuery<ITransactionDocument> = {
      userId,
      amount: { $gt: 0 },
    };

    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = startDate;
      if (endDate) matchStage.date.$lte = endDate;
    }

    const rawTrends = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$date' } },
          income: {
            $sum: {
              $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0],
            },
          },
          expenses: {
            $sum: {
              $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0],
            },
          },
          transactionCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const trends: AnalyticsTrendPoint[] = (rawTrends || []).map((point) => {
      const income = roundCurrency(point.income || 0);
      const expenses = roundCurrency(point.expenses || 0);
      return {
        period: point._id,
        income,
        expenses,
        netCashflow: roundCurrency(income - expenses),
        transactionCount: point.transactionCount || 0,
      };
    });

    return {
      groupBy,
      period: {
        startDate: startDate ? startDate.toISOString() : null,
        endDate: endDate ? endDate.toISOString() : null,
      },
      trends,
    };
  },

  /**
   * 3. GET /api/analytics/categories
   * Aggregates totals and volume percentages grouped by category, with consistent handling of uncategorized rows.
   */
  async getCategories(
    userId: string,
    query: AnalyticsCategoriesQueryInput = { type: 'all' }
  ): Promise<AnalyticsCategoriesResponse> {
    const { startDate, endDate } = normalizeDateBoundaries(query.startDate, query.endDate);
    const typeFilter = query.type || 'all';

    const matchStage: FilterQuery<ITransactionDocument> = {
      userId,
      amount: { $gt: 0 },
    };

    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = startDate;
      if (endDate) matchStage.date.$lte = endDate;
    }

    if (typeFilter !== 'all') {
      matchStage.type = typeFilter;
    }

    const rawCategories = await Transaction.aggregate([
      { $match: matchStage },
      {
        $project: {
          type: 1,
          amount: 1,
          category: {
            $let: {
              vars: {
                trimmed: {
                  $trim: {
                    input: { $ifNull: ['$category', ''] },
                  },
                },
              },
              in: {
                $cond: [
                  { $gt: [{ $strLenCP: '$$trimmed' }, 0] },
                  '$$trimmed',
                  'Uncategorized',
                ],
              },
            },
          },
        },
      },
      {
        $group: {
          _id: {
            category: '$category',
            type: '$type',
          },
          totalAmount: { $sum: '$amount' },
          transactionCount: { $sum: 1 },
        },
      },
      {
        $sort: {
          totalAmount: -1,
        },
      },
    ]);

    // Calculate totals for income and expenses separately to compute percentage share
    let totalIncome = 0;
    let totalExpenses = 0;

    for (const item of rawCategories) {
      const amt = item.totalAmount || 0;
      if (item._id.type === 'income') {
        totalIncome += amt;
      } else if (item._id.type === 'expense') {
        totalExpenses += amt;
      }
    }

    totalIncome = roundCurrency(totalIncome);
    totalExpenses = roundCurrency(totalExpenses);

    const categories: CategoryBreakdownItem[] = rawCategories.map((item) => {
      const type = item._id.type as 'income' | 'expense';
      const totalAmount = roundCurrency(item.totalAmount || 0);
      const denominator = type === 'income' ? totalIncome : totalExpenses;
      const percentage = denominator > 0 ? roundCurrency((totalAmount / denominator) * 100) : 0;

      return {
        category: item._id.category,
        type,
        totalAmount,
        transactionCount: item.transactionCount || 0,
        percentage,
      };
    });

    const incomeCategories = categories
      .filter((c) => c.type === 'income')
      .sort((a, b) => b.totalAmount - a.totalAmount);

    const expenseCategories = categories
      .filter((c) => c.type === 'expense')
      .sort((a, b) => b.totalAmount - a.totalAmount);

    return {
      period: {
        startDate: startDate ? startDate.toISOString() : null,
        endDate: endDate ? endDate.toISOString() : null,
      },
      typeFilter,
      totalIncome,
      totalExpenses,
      categories,
      breakdown: {
        income: incomeCategories,
        expenses: expenseCategories,
      },
    };
  },
};
