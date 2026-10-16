import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { app } from '../src/app';
import { connectDatabase, disconnectDatabase } from '../src/config/db';
import { Anomaly } from '../src/models/Anomaly';
import { Transaction } from '../src/models/Transaction';

describe('Dashboard Summary API (GET /api/dashboard/summary)', () => {
  const USER_ALPHA = 'user_dashboard_test_alpha';
  const USER_BETA = 'user_dashboard_test_beta';
  const EMPTY_USER = 'user_dashboard_test_empty';

  beforeAll(async () => {
    await connectDatabase();

    // Clean up test collections for isolated test runs
    await Promise.all([
      Transaction.deleteMany({ userId: { $in: [USER_ALPHA, USER_BETA, EMPTY_USER] } }),
      Anomaly.deleteMany({ userId: { $in: [USER_ALPHA, USER_BETA, EMPTY_USER] } }),
    ]);

    // Seed User Alpha transactions spanning 2 months
    await Transaction.create([
      // September 2026
      {
        userId: USER_ALPHA,
        date: new Date('2026-09-10T10:00:00.000Z'),
        description: 'September Retail Sales',
        amount: 20000.0,
        type: 'income',
        category: 'Sales',
        paymentMethod: 'bank_transfer',
        status: 'completed',
      },
      {
        userId: USER_ALPHA,
        date: new Date('2026-09-15T14:00:00.000Z'),
        description: 'September Office Supplies',
        amount: 5000.0,
        type: 'expense',
        category: 'Supplies',
        paymentMethod: 'upi',
        status: 'completed',
      },
      // October 2026
      {
        userId: USER_ALPHA,
        date: new Date('2026-10-01T09:00:00.000Z'),
        description: 'October B2B Client Order',
        amount: 50000.0,
        type: 'income',
        category: 'Sales',
        paymentMethod: 'bank_transfer',
        status: 'completed',
        reference: 'INV-OCT-001',
      },
      {
        userId: USER_ALPHA,
        date: new Date('2026-10-05T11:30:00.000Z'),
        description: 'Commercial Shop Rent',
        amount: 15000.0,
        type: 'expense',
        category: 'Rent',
        paymentMethod: 'bank_transfer',
        status: 'completed',
      },
      {
        userId: USER_ALPHA,
        date: new Date('2026-10-08T15:00:00.000Z'),
        description: 'Inventory Stock Purchase',
        amount: 10000.0,
        type: 'expense',
        category: 'Inventory',
        paymentMethod: 'bank_transfer',
        status: 'completed',
      },
      {
        userId: USER_ALPHA,
        date: new Date('2026-10-12T16:00:00.000Z'),
        description: 'Consulting Advisory Services',
        amount: 12000.0,
        type: 'income',
        category: 'Consulting',
        paymentMethod: 'upi',
        status: 'completed',
      },
    ]);

    // Seed User Beta transactions (strict user isolation testing)
    await Transaction.create([
      {
        userId: USER_BETA,
        date: new Date('2026-10-02T10:00:00.000Z'),
        description: 'User Beta Consulting Income',
        amount: 99999.0,
        type: 'income',
        category: 'Private Services',
        paymentMethod: 'bank_transfer',
        status: 'completed',
      },
    ]);
  });

  afterAll(async () => {
    await Promise.all([
      Transaction.deleteMany({ userId: { $in: [USER_ALPHA, USER_BETA, EMPTY_USER] } }),
      Anomaly.deleteMany({ userId: { $in: [USER_ALPHA, USER_BETA, EMPTY_USER] } }),
    ]);
    await disconnectDatabase();
  });

  describe('Authentication & Security', () => {
    it('rejects GET /api/dashboard/summary without credentials with 401', async () => {
      const res = await request(app).get('/api/dashboard/summary');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('rejects invalid query date parameters with 400 validation error', async () => {
      const res = await request(app)
        .get('/api/dashboard/summary?startDate=not-a-real-date')
        .set('x-mock-user-id', USER_ALPHA);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Empty Datasets & Zero States', () => {
    it('handles a user with zero transactions gracefully with 200 and typed empty metrics', async () => {
      const res = await request(app)
        .get('/api/dashboard/summary')
        .set('x-mock-user-id', EMPTY_USER);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const data = res.body.data;
      expect(data).toBeDefined();

      // Metrics should be zeroed and formatted cleanly
      expect(data.metrics.totalRevenue.value).toBe(0);
      expect(data.metrics.totalRevenue.formatted).toBe('₹0');
      expect(data.metrics.totalRevenue.trend).toBe('neutral');

      expect(data.metrics.totalExpenses.value).toBe(0);
      expect(data.metrics.totalExpenses.formatted).toBe('₹0');
      expect(data.metrics.totalExpenses.trend).toBe('neutral');

      expect(data.metrics.netProfit.value).toBe(0);
      expect(data.metrics.netProfit.formatted).toBe('₹0');
      expect(data.metrics.netProfit.trend).toBe('neutral');

      expect(data.metrics.burnRateOrSavings.value).toBe(0);
      expect(data.metrics.burnRateOrSavings.formatted).toBe('₹0');

      // Arrays should be empty lists
      expect(data.cashflowTrends).toEqual([]);
      expect(data.topExpenseCategories).toEqual([]);
      expect(data.topIncomeCategories).toEqual([]);
      expect(data.recentTransactions).toEqual([]);
      expect(data.anomalyAlertsCount).toBe(0);
      expect(data.period.startDate).toBeDefined();
      expect(data.period.endDate).toBeDefined();
    });
  });

  describe('Populated Data & Business Analytics', () => {
    it('returns accurate composite financial summary for populated user', async () => {
      const res = await request(app)
        .get('/api/dashboard/summary')
        .set('x-mock-user-id', USER_ALPHA);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const data = res.body.data;

      // Income = 20000 + 50000 + 12000 = 82000
      // Expenses = 5000 + 15000 + 10000 = 30000
      // Net Profit = 82000 - 30000 = 52000
      expect(data.metrics.totalRevenue.value).toBe(82000);
      expect(data.metrics.totalRevenue.formatted).toBe('₹82,000');
      expect(data.metrics.totalRevenue.trend).toBe('up');

      expect(data.metrics.totalExpenses.value).toBe(30000);
      expect(data.metrics.totalExpenses.formatted).toBe('₹30,000');
      expect(data.metrics.totalExpenses.trend).toBe('down');

      expect(data.metrics.netProfit.value).toBe(52000);
      expect(data.metrics.netProfit.formatted).toBe('₹52,000');
      expect(data.metrics.netProfit.trend).toBe('up');

      expect(data.metrics.burnRateOrSavings.label).toBe('Cash Flow Surplus');
      expect(data.metrics.burnRateOrSavings.value).toBe(52000);
      expect(data.metrics.burnRateOrSavings.trend).toBe('up');

      // Cashflow trends across months
      expect(data.cashflowTrends.length).toBe(2);
      expect(data.cashflowTrends[0].period).toBe('Sep 2026');
      expect(data.cashflowTrends[0].income).toBe(20000);
      expect(data.cashflowTrends[0].expenses).toBe(5000);
      expect(data.cashflowTrends[0].netCashflow).toBe(15000);

      expect(data.cashflowTrends[1].period).toBe('Oct 2026');
      expect(data.cashflowTrends[1].income).toBe(62000);
      expect(data.cashflowTrends[1].expenses).toBe(25000);
      expect(data.cashflowTrends[1].netCashflow).toBe(37000);

      // Top Expense Categories
      expect(data.topExpenseCategories.length).toBeGreaterThan(0);
      const rentCat = data.topExpenseCategories.find((c: any) => c.category === 'Rent');
      expect(rentCat).toBeDefined();
      expect(rentCat?.amount).toBe(15000);

      // Top Income Categories
      const salesCat = data.topIncomeCategories.find((c: any) => c.category === 'Sales');
      expect(salesCat).toBeDefined();
      expect(salesCat?.amount).toBe(70000);

      // Recent Transactions: max 5, sorted descending by date
      expect(data.recentTransactions.length).toBe(5);
      expect(data.recentTransactions[0].description).toBe('Consulting Advisory Services');
      expect(data.recentTransactions[0].id).toBeDefined();
      expect(data.recentTransactions[0].userId).toBe(USER_ALPHA);
    });

    it('filters dashboard metrics accurately within specified date range and computes comparisons', async () => {
      // Query October 2026 only
      const res = await request(app)
        .get('/api/dashboard/summary?startDate=2026-10-01&endDate=2026-10-31')
        .set('x-mock-user-id', USER_ALPHA);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const data = res.body.data;
      // October only: Income = 50000 + 12000 = 62000
      // Expenses = 15000 + 10000 = 25000
      // Net Profit = 37000
      expect(data.metrics.totalRevenue.value).toBe(62000);
      expect(data.metrics.totalExpenses.value).toBe(25000);
      expect(data.metrics.netProfit.value).toBe(37000);

      // Previous 30-day period (September): Income = 20000, Expenses = 5000
      // Revenue change: ((62000 - 20000) / 20000) * 100 = 210%
      expect(data.metrics.totalRevenue.changePercentage).toBe(210);
      expect(data.metrics.totalRevenue.trend).toBe('up');
      expect(data.metrics.totalRevenue.helperText).toContain('+210% vs previous period');

      // Cashflow trends within October
      expect(data.cashflowTrends.length).toBe(1);
      expect(data.cashflowTrends[0].period).toBe('Oct 2026');
    });
  });

  describe('User Data Isolation', () => {
    it('strictly isolates data between users and never leaks another user records', async () => {
      const resAlpha = await request(app)
        .get('/api/dashboard/summary')
        .set('x-mock-user-id', USER_ALPHA);

      const resBeta = await request(app)
        .get('/api/dashboard/summary')
        .set('x-mock-user-id', USER_BETA);

      expect(resAlpha.status).toBe(200);
      expect(resBeta.status).toBe(200);

      // User Beta should have 99999 revenue, User Alpha should not
      expect(resBeta.body.data.metrics.totalRevenue.value).toBe(99999);
      expect(resAlpha.body.data.metrics.totalRevenue.value).toBe(82000);

      // Verify no Beta transactions leaked into Alpha's recent transactions
      const alphaTxUserIds = resAlpha.body.data.recentTransactions.map((tx: any) => tx.userId);
      expect(alphaTxUserIds).not.toContain(USER_BETA);
      expect(alphaTxUserIds.every((id: string) => id === USER_ALPHA)).toBe(true);

      const betaTxUserIds = resBeta.body.data.recentTransactions.map((tx: any) => tx.userId);
      expect(betaTxUserIds.every((id: string) => id === USER_BETA)).toBe(true);
    });
  });

  describe('Anomaly Alerts Integration', () => {
    it('returns the count of unresolved anomaly alerts accurately', async () => {
      // Create a test anomaly for USER_ALPHA
      await Anomaly.create({
        userId: USER_ALPHA,
        type: 'expense_spike',
        severity: 'high',
        rule: 'category_rolling_spike',
        title: 'High Rent Expense Spike',
        description: 'Rent was unusually high',
        detectedAt: new Date(),
        transactionIds: [],
        affectedAmount: 15000,
        confidenceScore: 0.88,
        riskScore: 0.82,
        evidence: {},
        recommendedAction: 'Verify lease agreement',
        isResolved: false,
        fingerprint: 'test-fingerprint-alpha-1',
      });

      const res = await request(app)
        .get('/api/dashboard/summary')
        .set('x-mock-user-id', USER_ALPHA);

      expect(res.status).toBe(200);
      expect(res.body.data.anomalyAlertsCount).toBeGreaterThanOrEqual(1);
    });
  });
});
