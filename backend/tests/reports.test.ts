import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { app } from '../src/app';
import { connectDatabase, disconnectDatabase } from '../src/config/db';
import { Anomaly } from '../src/models/Anomaly';
import { Transaction } from '../src/models/Transaction';
import { AuditReportData } from '../src/types/contracts.types';

describe('Audit Reports & Export API', () => {
  const USER_ALPHA = 'user_reports_test_alpha';
  const USER_BETA = 'user_reports_test_beta';
  const EMPTY_USER = 'user_reports_test_empty';

  beforeAll(async () => {
    await connectDatabase();

    // Clean up test data for isolated run
    await Promise.all([
      Transaction.deleteMany({ userId: { $in: [USER_ALPHA, USER_BETA, EMPTY_USER] } }),
      Anomaly.deleteMany({ userId: { $in: [USER_ALPHA, USER_BETA, EMPTY_USER] } }),
    ]);

    // Seed transactions for USER_ALPHA:
    // 1. Income: ₹50,000 on 2026-10-02
    // 2. Expense: ₹12,000 (Rent) on 2026-10-03
    // 3. Expense: ₹4,000 (Supplies) on 2026-10-05
    // 4. Expense: ₹4,000 (Supplies) on 2026-10-05 (15 mins later -> duplicate payment anomaly)
    await Transaction.create([
      {
        userId: USER_ALPHA,
        date: new Date('2026-10-02T10:00:00.000Z'),
        description: 'Client invoice payment for textile shipment',
        amount: 50000.0,
        type: 'income',
        category: 'Sales',
        reference: 'INV-2026-091',
        counterparty: 'Reliance Retail',
        paymentMethod: 'bank_transfer',
        status: 'completed',
      },
      {
        userId: USER_ALPHA,
        date: new Date('2026-10-03T11:00:00.000Z'),
        description: 'Warehouse commercial lease',
        amount: 12000.0,
        type: 'expense',
        category: 'Rent',
        reference: 'RENT-OCT-26',
        counterparty: 'Apex Real Estate',
        paymentMethod: 'bank_transfer',
        status: 'completed',
      },
      {
        userId: USER_ALPHA,
        date: new Date('2026-10-05T14:00:00.000Z'),
        description: 'Packaging tape and carton boxes',
        amount: 4000.0,
        type: 'expense',
        category: 'Packaging',
        reference: 'SUP-401',
        counterparty: 'Bharat Packaging',
        paymentMethod: 'upi',
        status: 'completed',
      },
      {
        userId: USER_ALPHA,
        date: new Date('2026-10-05T14:15:00.000Z'),
        description: 'Packaging tape and carton boxes',
        amount: 4000.0,
        type: 'expense',
        category: 'Packaging',
        reference: 'UPI-DUP-401',
        counterparty: 'Bharat Packaging',
        paymentMethod: 'upi',
        status: 'completed',
      },
    ]);

    // Seed transactions for USER_BETA (to verify cross-user isolation):
    await Transaction.create([
      {
        userId: USER_BETA,
        date: new Date('2026-10-10T10:00:00.000Z'),
        description: 'User Beta Secret Revenue',
        amount: 99999.0,
        type: 'income',
        category: 'BetaSales',
        reference: 'BETA-REF-99',
        counterparty: 'Beta Customer',
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

  // ==========================================================================
  // 1. Authentication & Security
  // ==========================================================================
  describe('Authentication & Authorization', () => {
    it('rejects unauthenticated requests to GET /api/reports with 401', async () => {
      const res = await request(app).get('/api/reports');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('rejects unauthenticated requests to GET /api/reports/pdf with 401', async () => {
      const res = await request(app).get('/api/reports/pdf');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('rejects unauthenticated requests to GET /api/reports/transactions/csv with 401', async () => {
      const res = await request(app).get('/api/reports/transactions/csv');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('rejects unauthenticated requests to GET /api/reports/findings/csv with 401', async () => {
      const res = await request(app).get('/api/reports/findings/csv');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // ==========================================================================
  // 2. Report Generation & Deterministic Financial Metrics
  // ==========================================================================
  describe('GET /api/reports (JSON report preview)', () => {
    it('generates a complete, verified audit report for an authenticated user', async () => {
      const res = await request(app)
        .get('/api/reports')
        .set('x-mock-user-id', USER_ALPHA);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const report: AuditReportData = res.body.data;
      expect(report.reportId).toMatch(/^REP-/);
      expect(report.generatedAt).toBeDefined();

      // Financial summary checks:
      // Inflow: 50,000, Outflow: 12000 + 4000 + 4000 = 20,000
      // Net operating profit: 30,000
      // Margin: (30000 / 50000) * 100 = 60%
      expect(report.financialSummary.totalRevenue).toBe(50000);
      expect(report.financialSummary.totalExpenses).toBe(20000);
      expect(report.financialSummary.netOperatingProfit).toBe(30000);
      expect(report.financialSummary.profitMarginPct).toBe(60);
      expect(report.financialSummary.totalVolume).toBe(4);
      expect(report.financialSummary.currency).toBe('INR');

      // Expense categories
      expect(report.expenseCategories.length).toBeGreaterThan(0);
      const packagingCat = report.expenseCategories.find((c) => c.category === 'Packaging');
      expect(packagingCat).toBeDefined();
      expect(packagingCat?.totalAmount).toBe(8000);

      // Anomalies audit
      expect(report.anomaliesAudit.totalIdentified).toBeGreaterThanOrEqual(1);
      const dupFinding = report.findings.find(
        (f) => f.rule === 'duplicate_payment' || f.type === 'duplicate_payment'
      );
      expect(dupFinding).toBeDefined();
      expect(dupFinding?.affectedAmount).toBe(4000);

      // Recommendations distinctly present
      expect(report.actionRecommendations.length).toBeGreaterThan(0);
      expect(report.actionRecommendations[0].title).toBeDefined();
      expect(report.actionRecommendations[0].priority).toBeDefined();

      // Legal disclaimer
      expect(report.disclaimer).toContain('DISCLAIMER');
      expect(report.disclaimer).toContain('do not constitute legal proof of fraud');
    });

    it('respects scope and business parameter overrides', async () => {
      const res = await request(app)
        .get('/api/reports?scope=gst&businessName=Alpha+Enterprises&gstin=27ABCDE1234F1Z5')
        .set('x-mock-user-id', USER_ALPHA);

      expect(res.status).toBe(200);
      expect(res.body.data.scope).toBe('gst');
      expect(res.body.data.businessProfile.name).toBe('Alpha Enterprises');
      expect(res.body.data.businessProfile.gstin).toBe('27ABCDE1234F1Z5');
    });

    it('validates date boundaries and rejects invalid startDate > endDate', async () => {
      const res = await request(app)
        .get('/api/reports?startDate=2026-10-10&endDate=2026-10-01')
        .set('x-mock-user-id', USER_ALPHA);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('rejects malformed date strings', async () => {
      const res = await request(app)
        .get('/api/reports?startDate=not-a-date')
        .set('x-mock-user-id', USER_ALPHA);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('handles empty datasets gracefully without crashing', async () => {
      const res = await request(app)
        .get('/api/reports')
        .set('x-mock-user-id', EMPTY_USER);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const report: AuditReportData = res.body.data;
      expect(report.financialSummary.totalRevenue).toBe(0);
      expect(report.financialSummary.totalExpenses).toBe(0);
      expect(report.financialSummary.netOperatingProfit).toBe(0);
      expect(report.financialSummary.profitMarginPct).toBe(0);
      expect(report.financialSummary.totalVolume).toBe(0);
      expect(report.expenseCategories).toEqual([]);
      expect(report.findings).toEqual([]);
      expect(report.sampleTransactions).toEqual([]);
      expect(report.businessProfile.auditorNotes).toContain('Full reconciliation passed');
    });
  });

  // ==========================================================================
  // 3. User Data Isolation
  // ==========================================================================
  describe('User-level Data Isolation', () => {
    it('strictly isolates User Alpha and User Beta report data', async () => {
      const resAlpha = await request(app)
        .get('/api/reports')
        .set('x-mock-user-id', USER_ALPHA);

      const resBeta = await request(app)
        .get('/api/reports')
        .set('x-mock-user-id', USER_BETA);

      expect(resAlpha.status).toBe(200);
      expect(resBeta.status).toBe(200);

      // Alpha has 50k revenue, Beta has 99999 revenue
      expect(resAlpha.body.data.financialSummary.totalRevenue).toBe(50000);
      expect(resBeta.body.data.financialSummary.totalRevenue).toBe(99999);

      // Beta should not see Alpha's transactions
      const betaTx = resBeta.body.data.sampleTransactions;
      expect(betaTx.some((t: any) => t.category === 'Packaging')).toBe(false);
      expect(betaTx.some((t: any) => t.description.includes('Beta'))).toBe(true);
    });
  });

  // ==========================================================================
  // 4. Downloadable PDF Generation
  // ==========================================================================
  describe('GET /api/reports/pdf', () => {
    it('generates a binary PDF buffer with proper headers and metadata', async () => {
      const res = await request(app)
        .get('/api/reports/pdf?scope=reconciliation')
        .set('x-mock-user-id', USER_ALPHA);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
      expect(res.headers['content-disposition']).toMatch(/attachment; filename="VyaparIQ_Audit_Report_REP-.*\.pdf"/);

      // Check PDF magic bytes '%PDF'
      const buffer = Buffer.isBuffer(res.body) ? res.body : Buffer.from(res.text, 'binary');
      expect(buffer.length).toBeGreaterThan(100);
      expect(buffer.slice(0, 4).toString()).toBe('%PDF');
    });

    it('generates a valid PDF for an empty user without error', async () => {
      const res = await request(app)
        .get('/api/reports/pdf')
        .set('x-mock-user-id', EMPTY_USER);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
      const buffer = Buffer.isBuffer(res.body) ? res.body : Buffer.from(res.text, 'binary');
      expect(buffer.length).toBeGreaterThan(100);
      expect(buffer.slice(0, 4).toString()).toBe('%PDF');
    });
  });

  // ==========================================================================
  // 5. CSV Exports
  // ==========================================================================
  describe('CSV Exports', () => {
    it('exports sanitized ledger transactions CSV matching user records', async () => {
      const res = await request(app)
        .get('/api/reports/transactions/csv')
        .set('x-mock-user-id', USER_ALPHA);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.headers['content-disposition']).toMatch(/attachment; filename="VyaparIQ_Transactions_.*\.csv"/);

      const csv = res.text;
      expect(csv).toContain('Transaction ID');
      expect(csv).toContain('Packaging tape and carton boxes');
      expect(csv).toContain('Reliance Retail');
      // Should not contain User Beta's record
      expect(csv).not.toContain('User Beta Secret Revenue');
    });

    it('exports audit findings CSV matching detected anomalies', async () => {
      const res = await request(app)
        .get('/api/reports/findings/csv')
        .set('x-mock-user-id', USER_ALPHA);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.headers['content-disposition']).toMatch(/attachment; filename="VyaparIQ_Audit_Findings_.*\.csv"/);

      const csv = res.text;
      expect(csv).toContain('Finding ID');
      expect(csv).toContain('Severity');
      expect(csv).toContain('duplicate_payment');
    });

    it('handles CSV exports for empty users gracefully with header only', async () => {
      const res = await request(app)
        .get('/api/reports/transactions/csv')
        .set('x-mock-user-id', EMPTY_USER);

      expect(res.status).toBe(200);
      const lines = res.text.trim().split('\r\n');
      expect(lines.length).toBe(1); // Only headers
      expect(lines[0]).toContain('Transaction ID');
    });
  });
});
