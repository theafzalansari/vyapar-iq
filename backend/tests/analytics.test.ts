import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { app } from '../src/app';
import { connectDatabase, disconnectDatabase } from '../src/config/db';
import { Transaction } from '../src/models/Transaction';

describe('Deterministic Financial Analytics API (Milestone 3)', () => {
  const USER_ALPHA = 'user_analytics_test_alpha';
  const USER_BETA = 'user_analytics_test_beta';
  const EMPTY_USER = 'user_analytics_test_empty';

  beforeAll(async () => {
    await connectDatabase();

    // Clean up test users
    await Transaction.deleteMany({
      userId: { $in: [USER_ALPHA, USER_BETA, EMPTY_USER] },
    });

    // Seed test data for USER_ALPHA
    await Transaction.create([
      // 2026-09 transactions
      {
        userId: USER_ALPHA,
        date: new Date('2026-09-15T10:00:00.000Z'),
        description: 'September Retail Sale',
        amount: 10000.0,
        type: 'income',
        category: 'Sales',
        paymentMethod: 'bank_transfer',
        status: 'completed',
      },
      {
        userId: USER_ALPHA,
        date: new Date('2026-09-20T14:00:00.000Z'),
        description: 'September Office Supplies',
        amount: 2500.5,
        type: 'expense',
        category: 'Supplies',
        paymentMethod: 'upi',
        status: 'completed',
      },
      // 2026-10 transactions
      {
        userId: USER_ALPHA,
        date: new Date('2026-10-01T00:00:00.000Z'), // Boundary: start of day
        description: 'October B2B Order',
        amount: 25000.25,
        type: 'income',
        category: 'Sales',
        paymentMethod: 'bank_transfer',
        status: 'completed',
      },
      {
        userId: USER_ALPHA,
        date: new Date('2026-10-05T12:00:00.000Z'),
        description: 'Commercial Shop Rent',
        amount: 12000.0,
        type: 'expense',
        category: 'Rent',
        paymentMethod: 'bank_transfer',
        status: 'completed',
      },
      {
        userId: USER_ALPHA,
        date: new Date('2026-10-10T16:30:00.000Z'),
        description: 'Consulting Advisory Retainer',
        amount: 8500.5,
        type: 'income',
        category: 'Consulting',
        paymentMethod: 'upi',
        status: 'completed',
      },
      {
        userId: USER_ALPHA,
        date: new Date('2026-10-15T23:45:00.000Z'), // Boundary: late evening on end date
        description: 'Electricity Bill Payment',
        amount: 1850.25,
        type: 'expense',
        category: 'Utilities',
        paymentMethod: 'upi',
        status: 'completed',
      },
    ]);

    // Insert a raw record with blank/whitespace category to test Uncategorized fallback
    await Transaction.collection.insertOne({
      userId: USER_ALPHA,
      date: new Date('2026-10-16T08:00:00.000Z'), // Past 15th boundary
      description: 'Raw Materials Packaging',
      amount: 4200.0,
      type: 'expense',
      category: '   ', // Blank / whitespace category
      paymentMethod: 'cash',
      status: 'completed',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Seed test data for USER_BETA (for testing data isolation)
    await Transaction.create([
      {
        userId: USER_BETA,
        date: new Date('2026-10-02T11:00:00.000Z'),
        description: 'Beta Bulk Order',
        amount: 90000.0,
        type: 'income',
        category: 'Enterprise',
        paymentMethod: 'bank_transfer',
        status: 'completed',
      },
      {
        userId: USER_BETA,
        date: new Date('2026-10-04T15:00:00.000Z'),
        description: 'Beta Machinery Lease',
        amount: 35000.0,
        type: 'expense',
        category: 'Equipment',
        paymentMethod: 'bank_transfer',
        status: 'completed',
      },
    ]);
  }, 30000);

  afterAll(async () => {
    await Transaction.deleteMany({
      userId: { $in: [USER_ALPHA, USER_BETA, EMPTY_USER] },
    });
    await disconnectDatabase();
  }, 30000);

  // ==========================================================================
  // 1. Authentication Enforcement
  // ==========================================================================
  describe('Authentication Enforcement', () => {
    it('rejects GET /api/analytics/summary without authentication with 401', async () => {
      const res = await request(app).get('/api/analytics/summary');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('rejects GET /api/analytics/trends without authentication with 401', async () => {
      const res = await request(app).get('/api/analytics/trends');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('rejects GET /api/analytics/categories without authentication with 401', async () => {
      const res = await request(app).get('/api/analytics/categories');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  // ==========================================================================
  // 2. Empty Datasets & Opening Balance Semantics
  // ==========================================================================
  describe('Empty Dataset Handling & Opening Balance Semantics', () => {
    it('returns zero totals and clear basis note for a user with no transactions', async () => {
      const res = await request(app)
        .get('/api/analytics/summary')
        .set('x-mock-user-id', EMPTY_USER);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({
        totalIncome: 0,
        totalExpenses: 0,
        netBalance: 0,
        transactionCount: 0,
        incomeCount: 0,
        expenseCount: 0,
        currency: 'INR',
      });
      // Explicit statement confirming net balance is not claimed to be total bank balance
      expect(res.body.data.calculationBasis).toContain('Does not reflect total bank balance');
    });

    it('returns empty trends array for empty user', async () => {
      const res = await request(app)
        .get('/api/analytics/trends')
        .set('x-mock-user-id', EMPTY_USER);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.trends).toEqual([]);
    });

    it('returns empty categories array and breakdowns for empty user', async () => {
      const res = await request(app)
        .get('/api/analytics/categories')
        .set('x-mock-user-id', EMPTY_USER);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.categories).toEqual([]);
      expect(res.body.data.breakdown.income).toEqual([]);
      expect(res.body.data.breakdown.expenses).toEqual([]);
      expect(res.body.data.totalIncome).toBe(0);
      expect(res.body.data.totalExpenses).toBe(0);
    });
  });

  // ==========================================================================
  // 3. GET /api/analytics/summary Calculations & Precision
  // ==========================================================================
  describe('GET /api/analytics/summary', () => {
    it('computes accurate cumulative income, expenses, and net balance across all transactions', async () => {
      const res = await request(app)
        .get('/api/analytics/summary')
        .set('x-mock-user-id', USER_ALPHA);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const { data } = res.body;

      // Income: 10000 + 25000.25 + 8500.5 = 43500.75
      expect(data.totalIncome).toBe(43500.75);
      expect(data.incomeCount).toBe(3);

      // Expenses: 2500.5 + 12000 + 1850.25 + 4200 = 20550.75
      expect(data.totalExpenses).toBe(20550.75);
      expect(data.expenseCount).toBe(4);

      // Net balance = 43500.75 - 20550.75 = 22950.00
      expect(data.netBalance).toBe(22950.0);
      expect(data.transactionCount).toBe(7);
      expect(data.currency).toBe('INR');
      expect(data.calculationBasis).toContain('7 ingested transaction(s)');
      expect(data.calculationBasis).toContain('Does not reflect total bank balance');
    });

    it('filters summary accurately within inclusive date boundaries', async () => {
      // Query Oct 1 to Oct 15 inclusive
      // Should include Oct 1 start of day and Oct 15 late evening
      // Should exclude Sept transactions and Oct 16 transaction
      const res = await request(app)
        .get('/api/analytics/summary?startDate=2026-10-01&endDate=2026-10-15')
        .set('x-mock-user-id', USER_ALPHA);

      expect(res.status).toBe(200);
      const { data } = res.body;

      // Income in range: Oct 1 (25000.25) + Oct 10 (8500.50) = 33500.75
      expect(data.totalIncome).toBe(33500.75);
      expect(data.incomeCount).toBe(2);

      // Expenses in range: Oct 5 (12000) + Oct 15 evening (1850.25) = 13850.25
      expect(data.totalExpenses).toBe(13850.25);
      expect(data.expenseCount).toBe(2);

      // Net balance in range: 33500.75 - 13850.25 = 19650.50
      expect(data.netBalance).toBe(19650.5);
      expect(data.transactionCount).toBe(4);
    });
  });

  // ==========================================================================
  // 4. Multi-User Scoping & Data Isolation
  // ==========================================================================
  describe('Multi-User Scoping & Isolation', () => {
    it('strictly isolates analytics summary between different users', async () => {
      const resAlpha = await request(app)
        .get('/api/analytics/summary')
        .set('x-mock-user-id', USER_ALPHA);

      const resBeta = await request(app)
        .get('/api/analytics/summary')
        .set('x-mock-user-id', USER_BETA);

      expect(resAlpha.body.data.totalIncome).toBe(43500.75);
      expect(resBeta.body.data.totalIncome).toBe(90000.0);
      expect(resBeta.body.data.totalExpenses).toBe(35000.0);
      expect(resBeta.body.data.netBalance).toBe(55000.0);
      expect(resBeta.body.data.transactionCount).toBe(2);
    });

    it('isolates trend data between users', async () => {
      const resBeta = await request(app)
        .get('/api/analytics/trends?groupBy=month')
        .set('x-mock-user-id', USER_BETA);

      expect(resBeta.body.data.trends).toHaveLength(1);
      expect(resBeta.body.data.trends[0]).toEqual({
        period: '2026-10',
        income: 90000,
        expenses: 35000,
        netCashflow: 55000,
        transactionCount: 2,
      });
    });
  });

  // ==========================================================================
  // 5. GET /api/analytics/trends
  // ==========================================================================
  describe('GET /api/analytics/trends', () => {
    it('returns monthly aggregated trends in chronological order by default', async () => {
      const res = await request(app)
        .get('/api/analytics/trends')
        .set('x-mock-user-id', USER_ALPHA);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.groupBy).toBe('month');

      const trends = res.body.data.trends;
      expect(trends).toHaveLength(2);

      // Sept 2026
      expect(trends[0].period).toBe('2026-09');
      expect(trends[0].income).toBe(10000);
      expect(trends[0].expenses).toBe(2500.5);
      expect(trends[0].netCashflow).toBe(7499.5);
      expect(trends[0].transactionCount).toBe(2);

      // Oct 2026
      expect(trends[1].period).toBe('2026-10');
      expect(trends[1].income).toBe(33500.75);
      expect(trends[1].expenses).toBe(18050.25);
      expect(trends[1].netCashflow).toBe(15450.5);
      expect(trends[1].transactionCount).toBe(5);
    });

    it('returns daily aggregated trends when groupBy=day in chronological order', async () => {
      const res = await request(app)
        .get('/api/analytics/trends?groupBy=day&startDate=2026-10-01&endDate=2026-10-15')
        .set('x-mock-user-id', USER_ALPHA);

      expect(res.status).toBe(200);
      expect(res.body.data.groupBy).toBe('day');

      const trends = res.body.data.trends;
      expect(trends.length).toBeGreaterThanOrEqual(4);

      // Check chronological ordering
      for (let i = 0; i < trends.length - 1; i++) {
        expect(trends[i].period < trends[i + 1].period).toBe(true);
      }

      // Check individual day
      const oct1 = trends.find((t: any) => t.period === '2026-10-01');
      expect(oct1).toBeDefined();
      expect(oct1.income).toBe(25000.25);
      expect(oct1.expenses).toBe(0);

      const oct15 = trends.find((t: any) => t.period === '2026-10-15');
      expect(oct15).toBeDefined();
      expect(oct15.expenses).toBe(1850.25);
    });
  });

  // ==========================================================================
  // 6. GET /api/analytics/categories & Uncategorized Fallback
  // ==========================================================================
  describe('GET /api/analytics/categories', () => {
    it('returns categories with amounts, counts, percentages and handles missing category as Uncategorized', async () => {
      const res = await request(app)
        .get('/api/analytics/categories')
        .set('x-mock-user-id', USER_ALPHA);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const { categories, breakdown, totalIncome, totalExpenses } = res.body.data;

      expect(totalIncome).toBe(43500.75);
      expect(totalExpenses).toBe(20550.75);

      // Check that blank category was transformed to "Uncategorized"
      const uncategorized = categories.find((c: any) => c.category === 'Uncategorized');
      expect(uncategorized).toBeDefined();
      expect(uncategorized.totalAmount).toBe(4200.0);
      expect(uncategorized.type).toBe('expense');

      // Verify category percentage against totalExpenses (4200 / 20550.75 = 20.44%)
      expect(uncategorized.percentage).toBeCloseTo(20.44, 1);

      // Verify breakdown lists
      expect(breakdown.income.length).toBe(2); // Sales, Consulting
      expect(breakdown.expenses.length).toBe(4); // Rent, Supplies, Utilities, Uncategorized
    });

    it('filters categories by type=income', async () => {
      const res = await request(app)
        .get('/api/analytics/categories?type=income')
        .set('x-mock-user-id', USER_ALPHA);

      expect(res.status).toBe(200);
      expect(res.body.data.typeFilter).toBe('income');
      expect(res.body.data.categories.every((c: any) => c.type === 'income')).toBe(true);
      expect(res.body.data.breakdown.expenses).toHaveLength(0);
    });

    it('filters categories by type=expense', async () => {
      const res = await request(app)
        .get('/api/analytics/categories?type=expense')
        .set('x-mock-user-id', USER_ALPHA);

      expect(res.status).toBe(200);
      expect(res.body.data.typeFilter).toBe('expense');
      expect(res.body.data.categories.every((c: any) => c.type === 'expense')).toBe(true);
      expect(res.body.data.breakdown.income).toHaveLength(0);
    });
  });

  // ==========================================================================
  // 7. Input Validation & Error Handling
  // ==========================================================================
  describe('Input Validation & Error Handling', () => {
    it('rejects invalid startDate format with 400', async () => {
      const res = await request(app)
        .get('/api/analytics/summary?startDate=not-a-valid-date')
        .set('x-mock-user-id', USER_ALPHA);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects startDate that occurs after endDate with 400', async () => {
      const res = await request(app)
        .get('/api/analytics/summary?startDate=2026-10-20&endDate=2026-10-10')
        .set('x-mock-user-id', USER_ALPHA);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.details[0].message).toContain('startDate must be before or equal to endDate');
    });

    it('rejects invalid groupBy option in trends with 400', async () => {
      const res = await request(app)
        .get('/api/analytics/trends?groupBy=hourly')
        .set('x-mock-user-id', USER_ALPHA);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects invalid category type filter with 400', async () => {
      const res = await request(app)
        .get('/api/analytics/categories?type=crypto')
        .set('x-mock-user-id', USER_ALPHA);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
