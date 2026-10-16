import fs from 'fs';
import path from 'path';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { app } from '../src/app';
import { connectDatabase, disconnectDatabase } from '../src/config/db';
import { Anomaly } from '../src/models/Anomaly';
import { ImportBatch } from '../src/models/ImportBatch';
import { Transaction } from '../src/models/Transaction';

describe('Explainable Financial Anomaly Detection Engine (Milestone 4)', () => {
  const USER_CLEAN = 'user_anom_clean';
  const USER_ANOMALOUS = 'user_anom_target';
  const USER_ISOLATED = 'user_anom_isolated';
  const USER_EMPTY = 'user_anom_empty';

  let duplicateFindingId = '';
  let spikeFindingId = '';

  beforeAll(async () => {
    await connectDatabase();

    const testUsers = [USER_CLEAN, USER_ANOMALOUS, USER_ISOLATED, USER_EMPTY];
    await Transaction.deleteMany({ userId: { $in: testUsers } });
    await ImportBatch.deleteMany({ userId: { $in: testUsers } });
    await Anomaly.deleteMany({ userId: { $in: testUsers } });

    // Seed USER_CLEAN with normal, non-anomalous distributed transactions
    await Transaction.create([
      {
        userId: USER_CLEAN,
        date: new Date('2026-10-01T10:00:00.000Z'),
        description: 'Customer Counter Sale 1',
        amount: 5000.0,
        type: 'income',
        category: 'Sales',
        paymentMethod: 'bank_transfer',
        status: 'completed',
        reference: 'INV-101',
      },
      {
        userId: USER_CLEAN,
        date: new Date('2026-10-03T11:00:00.000Z'),
        description: 'Office Internet Bill',
        amount: 1200.0,
        type: 'expense',
        category: 'Utilities',
        paymentMethod: 'upi',
        status: 'completed',
        reference: 'TEL-101',
      },
      {
        userId: USER_CLEAN,
        date: new Date('2026-10-06T15:00:00.000Z'),
        description: 'Office Electricity Bill',
        amount: 1400.0,
        type: 'expense',
        category: 'Utilities',
        paymentMethod: 'upi',
        status: 'completed',
        reference: 'EB-101',
      },
      {
        userId: USER_CLEAN,
        date: new Date('2026-10-10T14:00:00.000Z'),
        description: 'Printer Paper Supplies',
        amount: 850.0,
        type: 'expense',
        category: 'Supplies',
        paymentMethod: 'cash',
        status: 'completed',
        reference: 'SUP-101',
      },
    ]);

    // Seed USER_ANOMALOUS with targeted injected anomalies
    await Transaction.create([
      // 1. Utilities baseline for spike detection (Mean: ~1200)
      {
        userId: USER_ANOMALOUS,
        date: new Date('2026-10-01T09:00:00.000Z'),
        description: 'Water Bill',
        amount: 1100.0,
        type: 'expense',
        category: 'Utilities',
        paymentMethod: 'upi',
        status: 'completed',
        reference: 'UTIL-01',
      },
      {
        userId: USER_ANOMALOUS,
        date: new Date('2026-10-02T10:00:00.000Z'),
        description: 'Broadband Bill',
        amount: 1300.0,
        type: 'expense',
        category: 'Utilities',
        paymentMethod: 'bank_transfer',
        status: 'completed',
        reference: 'UTIL-02',
      },
      {
        userId: USER_ANOMALOUS,
        date: new Date('2026-10-03T11:00:00.000Z'),
        description: 'Office Cleaning Utility',
        amount: 1200.0,
        type: 'expense',
        category: 'Utilities',
        paymentMethod: 'upi',
        status: 'completed',
        reference: 'UTIL-03',
      },

      // 2. INJECTED SPIKE: 4x average spike in Utilities
      {
        userId: USER_ANOMALOUS,
        date: new Date('2026-10-08T16:00:00.000Z'),
        description: 'Abnormal Power Surcharge Bill',
        amount: 5400.0,
        type: 'expense',
        category: 'Utilities',
        paymentMethod: 'upi',
        status: 'completed',
        reference: 'EB-SPIKE-99',
      },

      // 3. INJECTED DUPLICATE: Exactly identical ₹3,200 payment within 15 minutes
      {
        userId: USER_ANOMALOUS,
        date: new Date('2026-10-05T13:10:00.000Z'),
        description: 'Cardboard Box Packaging Supplies',
        amount: 3200.0,
        type: 'expense',
        category: 'Packaging',
        paymentMethod: 'upi',
        status: 'completed',
        reference: 'INV-BOX-12',
      },
      {
        userId: USER_ANOMALOUS,
        date: new Date('2026-10-05T13:22:00.000Z'), // 12 minutes later
        description: 'Cardboard Box Packaging Supplies',
        amount: 3200.0,
        type: 'expense',
        category: 'Packaging',
        paymentMethod: 'upi',
        status: 'completed',
        reference: 'UPI-REF-DUP',
      },

      // 4. INJECTED BURST: 3 repeated identical transactions of ₹1,500 within 4 hours
      {
        userId: USER_ANOMALOUS,
        date: new Date('2026-10-07T08:00:00.000Z'),
        description: 'Van Delivery Courier',
        amount: 1500.0,
        type: 'expense',
        category: 'Logistics',
        paymentMethod: 'cash',
        status: 'completed',
        reference: 'BURST-1',
      },
      {
        userId: USER_ANOMALOUS,
        date: new Date('2026-10-07T09:30:00.000Z'),
        description: 'Van Delivery Courier',
        amount: 1500.0,
        type: 'expense',
        category: 'Logistics',
        paymentMethod: 'cash',
        status: 'completed',
        reference: 'BURST-2',
      },
      {
        userId: USER_ANOMALOUS,
        date: new Date('2026-10-07T11:00:00.000Z'),
        description: 'Van Delivery Courier',
        amount: 1500.0,
        type: 'expense',
        category: 'Logistics',
        paymentMethod: 'cash',
        status: 'completed',
        reference: 'BURST-3',
      },

      // 5. INJECTED HIGH-VALUE UNRECONCILED
      {
        userId: USER_ANOMALOUS,
        date: new Date('2026-10-09T18:00:00.000Z'),
        description: 'Temporary Contract Labor Payment',
        amount: 9500.0,
        type: 'expense',
        category: 'Salaries',
        paymentMethod: 'cash',
        status: 'completed',
        // missing reference
      },
    ]);
  }, 30000);

  afterAll(async () => {
    const testUsers = [USER_CLEAN, USER_ANOMALOUS, USER_ISOLATED, USER_EMPTY];
    await Transaction.deleteMany({ userId: { $in: testUsers } });
    await ImportBatch.deleteMany({ userId: { $in: testUsers } });
    await Anomaly.deleteMany({ userId: { $in: testUsers } });
    await disconnectDatabase();
  }, 30000);

  // ==========================================================================
  // 1. Authentication Enforcement
  // ==========================================================================
  describe('Authentication Enforcement', () => {
    it('rejects GET /api/anomalies without authentication with 401', async () => {
      const res = await request(app).get('/api/anomalies');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('rejects POST /api/anomalies/detect without authentication with 401', async () => {
      const res = await request(app).post('/api/anomalies/detect');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('rejects PATCH /api/anomalies/:id/resolve without authentication with 401', async () => {
      const res = await request(app)
        .patch('/api/anomalies/507f1f77bcf86cd799439011/resolve')
        .send({ isResolved: true });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  // ==========================================================================
  // 2. Empty Datasets & Clean Non-Anomalous Transactions
  // ==========================================================================
  describe('Empty Datasets & Clean Datasets', () => {
    it('returns 0 anomalies and zero summary for user with empty dataset', async () => {
      const res = await request(app)
        .get('/api/anomalies')
        .set('x-mock-user-id', USER_EMPTY);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.anomalies).toEqual([]);
      expect(res.body.data.summary).toEqual({
        total: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
      });
    });

    it('does not generate false anomalies for user with normal distributed transactions', async () => {
      const res = await request(app)
        .post('/api/anomalies/detect')
        .set('x-mock-user-id', USER_CLEAN);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.anomalies).toHaveLength(0);
      expect(res.body.data.summary.total).toBe(0);
    });
  });

  // ==========================================================================
  // 3. Injected Anomaly Rules Detection
  // ==========================================================================
  describe('Injected Anomaly Detection Rules', () => {
    it('detects duplicate payments within 15 minutes with high risk score and evidence', async () => {
      const res = await request(app)
        .post('/api/anomalies/detect')
        .set('x-mock-user-id', USER_ANOMALOUS);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const anomalies = res.body.data.anomalies;
      expect(anomalies.length).toBeGreaterThanOrEqual(3);

      const dup = anomalies.find(
        (a: any) => a.type === 'duplicate_payment' && a.affectedAmount === 3200
      );
      expect(dup).toBeDefined();
      expect(dup.rule).toBe('DUPLICATE_OR_NEAR_DUPLICATE_PAYMENT');
      expect(dup.severity).toBe('critical'); // <= 15 minutes gives critical severity
      expect(dup.confidenceScore).toBeGreaterThanOrEqual(0.85);
      expect(dup.affectedAmount).toBe(3200);
      expect(dup.transactionIds).toHaveLength(2);
      expect(dup.evidence).toMatchObject({
        duplicateAmount: 3200,
        descriptionMatch: true,
      });
      expect(dup.evidence.timeDeltaMinutes).toBeLessThanOrEqual(15);
      expect(dup.isResolved).toBe(false);

      duplicateFindingId = dup.id;
    });

    it('detects unusual 4x expense spike in Utilities with statistical Z-Score evidence', async () => {
      const res = await request(app)
        .get('/api/anomalies')
        .set('x-mock-user-id', USER_ANOMALOUS);

      expect(res.status).toBe(200);
      const spike = res.body.data.anomalies.find((a: any) => a.type === 'expense_spike');
      expect(spike).toBeDefined();
      expect(spike.rule).toBe('UNUSUAL_EXPENSE_SPIKE');
      expect(spike.confidenceScore).toBeGreaterThanOrEqual(0.7);
      expect(spike.evidence.category).toBe('Utilities');
      expect(spike.evidence.multiplier).toBeGreaterThanOrEqual(2.5);
      expect(spike.evidence.zScore).toBeGreaterThanOrEqual(2.0);
      expect(spike.evidence.categoryBaselineMean).toBeCloseTo(1200, -2);
      expect(spike.affectedAmount).toBeGreaterThan(3000);

      spikeFindingId = spike.id;
    });

    it('detects repeated transaction burst of 3 identical payments within 24h', async () => {
      const res = await request(app)
        .get('/api/anomalies')
        .set('x-mock-user-id', USER_ANOMALOUS);

      const burst = res.body.data.anomalies.find((a: any) => a.type === 'irregular_frequency');
      expect(burst).toBeDefined();
      expect(burst.rule).toBe('REPEATED_TRANSACTION_BURST');
      expect(burst.evidence.count).toBe(3);
      expect(burst.evidence.singleAmount).toBe(1500);
      expect(burst.evidence.totalBurstAmount).toBe(4500);
      expect(burst.evidence.timeWindowHours).toBeLessThanOrEqual(24);
    });

    it('detects high-value expense without invoice reference', async () => {
      const res = await request(app)
        .get('/api/anomalies')
        .set('x-mock-user-id', USER_ANOMALOUS);

      const unreconciled = res.body.data.anomalies.find((a: any) => a.type === 'unexpected_vendor');
      expect(unreconciled).toBeDefined();
      expect(unreconciled.rule).toBe('HIGH_VALUE_UNRECONCILED');
      expect(unreconciled.affectedAmount).toBe(9500);
      expect(unreconciled.evidence.missingReference).toBe(true);
    });
  });

  // ==========================================================================
  // 4. Review Status & Resolution Lifecycle
  // ==========================================================================
  describe('Review Status & Resolution Lifecycle', () => {
    it('marks an anomaly finding as resolved with auditor review notes', async () => {
      expect(duplicateFindingId).toBeTruthy();

      const res = await request(app)
        .patch(`/api/anomalies/${duplicateFindingId}/resolve`)
        .set('x-mock-user-id', USER_ANOMALOUS)
        .send({
          isResolved: true,
          resolutionNotes: 'Verified duplicate invoice adjustment received via credit note #CN-991.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.anomalyId).toBe(duplicateFindingId);

      // Verify status persisted
      const verifyRes = await request(app)
        .get('/api/anomalies')
        .set('x-mock-user-id', USER_ANOMALOUS);

      const resolvedAnom = verifyRes.body.data.anomalies.find((a: any) => a.id === duplicateFindingId);
      expect(resolvedAnom.isResolved).toBe(true);
      expect(resolvedAnom.resolvedAt).toBeDefined();
      expect(resolvedAnom.resolutionNotes).toContain('credit note #CN-991');
    });

    it('preserves resolved status across subsequent re-scans (idempotence)', async () => {
      // Trigger a full recompute scan
      const recomputeRes = await request(app)
        .post('/api/anomalies/detect')
        .set('x-mock-user-id', USER_ANOMALOUS);

      expect(recomputeRes.status).toBe(200);

      // Verify the previously resolved anomaly is STILL resolved
      const resolvedAnom = recomputeRes.body.data.anomalies.find(
        (a: any) => a.id === duplicateFindingId
      );
      expect(resolvedAnom).toBeDefined();
      expect(resolvedAnom.isResolved).toBe(true);
      expect(resolvedAnom.resolutionNotes).toContain('credit note #CN-991');
    });

    it('filters anomalies by resolution status (isResolved=false)', async () => {
      const res = await request(app)
        .get('/api/anomalies?isResolved=false')
        .set('x-mock-user-id', USER_ANOMALOUS);

      expect(res.status).toBe(200);
      expect(res.body.data.anomalies.every((a: any) => !a.isResolved)).toBe(true);
      expect(res.body.data.anomalies.some((a: any) => a.id === duplicateFindingId)).toBe(false);
    });

    it('returns 404 when trying to resolve non-existent anomaly', async () => {
      const res = await request(app)
        .patch('/api/anomalies/507f1f77bcf86cd799439011/resolve')
        .set('x-mock-user-id', USER_ANOMALOUS)
        .send({ isResolved: true });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  // ==========================================================================
  // 5. Multi-User Scoping & Isolation
  // ==========================================================================
  describe('Multi-User Scoping & Isolation', () => {
    it('strictly isolates anomalies so other users cannot view or resolve findings', async () => {
      // USER_ISOLATED has no transactions
      const resIsolated = await request(app)
        .get('/api/anomalies')
        .set('x-mock-user-id', USER_ISOLATED);

      expect(resIsolated.status).toBe(200);
      expect(resIsolated.body.data.anomalies).toHaveLength(0);

      // USER_ISOLATED cannot resolve USER_ANOMALOUS anomaly
      const resolveAttempt = await request(app)
        .patch(`/api/anomalies/${spikeFindingId}/resolve`)
        .set('x-mock-user-id', USER_ISOLATED)
        .send({ isResolved: true });

      expect(resolveAttempt.status).toBe(404);
      expect(resolveAttempt.body.error.code).toBe('NOT_FOUND');
    });
  });

  // ==========================================================================
  // 6. End-to-End CSV Ingestion with Synthetic Dataset
  // ==========================================================================
  describe('End-to-End CSV Ingestion with Synthetic Dataset', () => {
    const CSV_TEST_USER = 'user_anom_csv_e2e';

    beforeAll(async () => {
      await Transaction.deleteMany({ userId: CSV_TEST_USER });
      await ImportBatch.deleteMany({ userId: CSV_TEST_USER });
      await Anomaly.deleteMany({ userId: CSV_TEST_USER });
    });

    afterAll(async () => {
      await Transaction.deleteMany({ userId: CSV_TEST_USER });
      await ImportBatch.deleteMany({ userId: CSV_TEST_USER });
      await Anomaly.deleteMany({ userId: CSV_TEST_USER });
    });

    it('ingests synthetic_anomalies_test.csv and detects injected anomalies automatically', async () => {
      const fixturePath = path.join(__dirname, 'fixtures', 'synthetic_anomalies_test.csv');
      const csvBuffer = fs.readFileSync(fixturePath);

      // Ingest CSV
      const uploadRes = await request(app)
        .post('/api/transactions/import')
        .set('x-mock-user-id', CSV_TEST_USER)
        .attach('file', csvBuffer, 'synthetic_anomalies_test.csv');

      expect(uploadRes.status).toBe(201);
      expect(uploadRes.body.success).toBe(true);
      expect(uploadRes.body.data.importedRows).toBe(14);

      // Query anomalies for this user
      const anomRes = await request(app)
        .get('/api/anomalies')
        .set('x-mock-user-id', CSV_TEST_USER);

      expect(anomRes.status).toBe(200);
      expect(anomRes.body.success).toBe(true);

      const findings = anomRes.body.data.anomalies;
      expect(findings.length).toBeGreaterThanOrEqual(3);

      // Verify Duplicate Packaging finding
      const dup = findings.find(
        (f: any) => f.type === 'duplicate_payment' && f.affectedAmount === 3200
      );
      expect(dup).toBeDefined();
      expect(dup.affectedAmount).toBe(3200);

      // Verify Electricity Spike finding
      const spike = findings.find((f: any) => f.type === 'expense_spike');
      expect(spike).toBeDefined();
      expect(spike.evidence.category).toBe('Utilities');

      // Verify Rapid Burst finding
      const burst = findings.find((f: any) => f.type === 'irregular_frequency');
      expect(burst).toBeDefined();
      expect(burst.evidence.singleAmount).toBe(1500);
    });
  });
});
