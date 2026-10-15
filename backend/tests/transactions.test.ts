import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { app } from '../src/app';
import { connectDatabase, disconnectDatabase } from '../src/config/db';
import { ImportBatch } from '../src/models/ImportBatch';
import { Transaction } from '../src/models/Transaction';

describe('Transaction Ingestion & Management API', () => {
  const TEST_USER_1 = 'test_user_ingest_alpha';
  const TEST_USER_2 = 'test_user_ingest_beta';

  beforeAll(async () => {
    await connectDatabase();
    // Clean up previous test artifacts for test users
    await Transaction.deleteMany({ userId: { $in: [TEST_USER_1, TEST_USER_2] } });
    await ImportBatch.deleteMany({ userId: { $in: [TEST_USER_1, TEST_USER_2] } });
  });

  afterAll(async () => {
    // Clean up test records
    await Transaction.deleteMany({ userId: { $in: [TEST_USER_1, TEST_USER_2] } });
    await ImportBatch.deleteMany({ userId: { $in: [TEST_USER_1, TEST_USER_2] } });
    await disconnectDatabase();
  });

  // ==========================================================================
  // 1. Authentication Enforcement
  // ==========================================================================
  describe('Authentication Enforcement', () => {
    it('rejects POST /api/transactions/import without authentication with 401', async () => {
      const res = await request(app)
        .post('/api/transactions/import')
        .attach('file', Buffer.from('date,type,amount,category,description\n2026-10-01,income,100,Sales,Cash'), 'test.csv');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('rejects GET /api/transactions without authentication with 401', async () => {
      const res = await request(app).get('/api/transactions');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  // ==========================================================================
  // 2. CSV Template Download
  // ==========================================================================
  describe('GET /api/transactions/template', () => {
    it('returns 200 with text/csv header and valid column headers', async () => {
      const res = await request(app).get('/api/transactions/template');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.headers['content-disposition']).toContain('attachment; filename="vyapariq_transactions_template.csv"');
      expect(res.text).toContain('date,type,amount,category,description,reference');
    });
  });

  // ==========================================================================
  // 3. File Validation & Error Handling
  // ==========================================================================
  describe('File Validation & Bad Request Handling', () => {
    it('rejects request when no file is uploaded', async () => {
      const res = await request(app)
        .post('/api/transactions/import')
        .set('x-mock-user-id', TEST_USER_1);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('MISSING_FILE');
    });

    it('rejects empty (0-byte) CSV file', async () => {
      const res = await request(app)
        .post('/api/transactions/import')
        .set('x-mock-user-id', TEST_USER_1)
        .attach('file', Buffer.from(''), 'empty.csv');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('EMPTY_FILE');
    });

    it('rejects non-CSV file extensions', async () => {
      const res = await request(app)
        .post('/api/transactions/import')
        .set('x-mock-user-id', TEST_USER_1)
        .attach('file', Buffer.from('some dummy content'), 'document.pdf');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_FILE_TYPE');
    });

    it('rejects CSV with missing required column headers', async () => {
      const invalidCsv = 'date,amount\n2026-10-01,500';
      const res = await request(app)
        .post('/api/transactions/import')
        .set('x-mock-user-id', TEST_USER_1)
        .attach('file', Buffer.from(invalidCsv), 'missing_headers.csv');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('MISSING_REQUIRED_COLUMNS');
    });

    it('rejects malformed CSV syntax', async () => {
      const malformedCsv = 'date,type,amount,category,description\n2026-10-01,"unclosed quote,500,Sales,Item';
      const res = await request(app)
        .post('/api/transactions/import')
        .set('x-mock-user-id', TEST_USER_1)
        .attach('file', Buffer.from(malformedCsv), 'malformed.csv');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('MALFORMED_CSV');
    });
  });

  // ==========================================================================
  // 4. Successful CSV Ingestion & Row Validation
  // ==========================================================================
  describe('Successful Ingestion & Row-Level Validation', () => {
    it('successfully imports valid CSV and assigns ownership to authenticated user', async () => {
      const validCsv = [
        'date,type,amount,category,description,reference',
        '2026-10-01,income,"12,500.00",Sales,Product sale counter,INV-001',
        '2026-10-02,expense,450.75,Utilities,Internet bill payment,NET-991',
      ].join('\n');

      const res = await request(app)
        .post('/api/transactions/import')
        .set('x-mock-user-id', TEST_USER_1)
        .attach('file', Buffer.from(validCsv), 'valid_batch_1.csv');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalRows).toBe(2);
      expect(res.body.data.importedRows).toBe(2);
      expect(res.body.data.rejectedRows).toBe(0);
      expect(res.body.data.status).toBe('completed');
      expect(res.body.data.errors).toHaveLength(0);

      // Verify records in database
      const savedDocs = await Transaction.find({ userId: TEST_USER_1 });
      expect(savedDocs.length).toBeGreaterThanOrEqual(2);
      expect(savedDocs.every((doc) => doc.userId === TEST_USER_1)).toBe(true);
    });

    it('handles mixed valid and invalid rows with row-level error reporting', async () => {
      const mixedCsv = [
        'date,type,amount,category,description,reference',
        '2026-10-03,income,1500,Sales,Valid Cash Sale,REF-OK',
        'not-a-date,income,500,Sales,Invalid Date,REF-BAD1',
        '2026-10-04,invalid_type,300,Sales,Invalid Type,REF-BAD2',
        '2026-10-05,expense,-100,Rent,Negative Amount,REF-BAD3',
        '2026-10-06,expense,250,,Missing Category,REF-BAD4',
      ].join('\n');

      const res = await request(app)
        .post('/api/transactions/import')
        .set('x-mock-user-id', TEST_USER_1)
        .attach('file', Buffer.from(mixedCsv), 'mixed_batch.csv');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalRows).toBe(5);
      expect(res.body.data.importedRows).toBe(1);
      expect(res.body.data.rejectedRows).toBe(4);
      expect(res.body.data.status).toBe('partial');
      expect(res.body.data.errors.length).toBeGreaterThanOrEqual(4);

      // Verify row numbers in error reports (row 1 is header, data starts at row 2)
      const errorRows = res.body.data.errors.map((e: any) => e.row);
      expect(errorRows).toContain(3);
      expect(errorRows).toContain(4);
      expect(errorRows).toContain(5);
      expect(errorRows).toContain(6);
    });
  });

  // ==========================================================================
  // 5. Duplicate Upload & Idempotency Strategy
  // ==========================================================================
  describe('Duplicate Upload & Idempotency Strategy', () => {
    it('detects duplicate uploads via SHA-256 hash and rejects with 409 Conflict', async () => {
      const csvContent = [
        'date,type,amount,category,description,reference',
        '2026-10-10,income,8000,Services,Web Development,INV-88',
      ].join('\n');

      // 1st Upload - Succeeds
      const firstRes = await request(app)
        .post('/api/transactions/import')
        .set('x-mock-user-id', TEST_USER_1)
        .attach('file', Buffer.from(csvContent), 'idempotent_test.csv');

      expect(firstRes.status).toBe(201);

      // 2nd Upload with exact same content - Fails with 409 Conflict
      const dupRes = await request(app)
        .post('/api/transactions/import')
        .set('x-mock-user-id', TEST_USER_1)
        .attach('file', Buffer.from(csvContent), 'idempotent_test_copy.csv');

      expect(dupRes.status).toBe(409);
      expect(dupRes.body.success).toBe(false);
      expect(dupRes.body.error.code).toBe('DUPLICATE_UPLOAD');
      expect(dupRes.body.error.details).toHaveProperty('existingBatchId');

      // 3rd Upload with allowDuplicate=true - Succeeds
      const overrideRes = await request(app)
        .post('/api/transactions/import?allowDuplicate=true')
        .set('x-mock-user-id', TEST_USER_1)
        .attach('file', Buffer.from(csvContent), 'idempotent_test_copy.csv');

      expect(overrideRes.status).toBe(201);
      expect(overrideRes.body.success).toBe(true);
    });
  });

  // ==========================================================================
  // 6. User Scoping, Filtering, and Pagination (GET /api/transactions)
  // ==========================================================================
  describe('GET /api/transactions Scoping & Filtering', () => {
    beforeAll(async () => {
      // Seed isolated transactions for User 2
      await Transaction.create([
        {
          userId: TEST_USER_2,
          date: new Date('2026-10-12'),
          description: 'Secret Expense for Beta',
          amount: 9999,
          type: 'expense',
          category: 'Confidential',
          paymentMethod: 'cash',
          status: 'completed',
        },
      ]);
    });

    it('strictly isolates query results to the authenticated user', async () => {
      const res = await request(app)
        .get('/api/transactions')
        .set('x-mock-user-id', TEST_USER_1);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const items = res.body.data.transactions;
      // User 1 must not see User 2's transactions
      expect(items.some((tx: any) => tx.userId === TEST_USER_2)).toBe(false);
      expect(items.some((tx: any) => tx.description.includes('Secret Expense'))).toBe(false);
    });

    it('filters transactions by type', async () => {
      const res = await request(app)
        .get('/api/transactions?type=income')
        .set('x-mock-user-id', TEST_USER_1);

      expect(res.status).toBe(200);
      expect(res.body.data.transactions.every((tx: any) => tx.type === 'income')).toBe(true);
    });

    it('filters transactions by date range', async () => {
      const res = await request(app)
        .get('/api/transactions?startDate=2026-10-01T00:00:00.000Z&endDate=2026-10-02T23:59:59.000Z')
        .set('x-mock-user-id', TEST_USER_1);

      expect(res.status).toBe(200);
      expect(res.body.data.transactions.length).toBeGreaterThan(0);
      res.body.data.transactions.forEach((tx: any) => {
        const txDate = new Date(tx.date).getTime();
        expect(txDate).toBeGreaterThanOrEqual(new Date('2026-10-01T00:00:00.000Z').getTime());
        expect(txDate).toBeLessThanOrEqual(new Date('2026-10-02T23:59:59.000Z').getTime());
      });
    });

    it('paginates transactions accurately', async () => {
      const res = await request(app)
        .get('/api/transactions?page=1&limit=2')
        .set('x-mock-user-id', TEST_USER_1);

      expect(res.status).toBe(200);
      expect(res.body.data.transactions.length).toBeLessThanOrEqual(2);
      expect(res.body.data.pagination.page).toBe(1);
      expect(res.body.data.pagination.limit).toBe(2);
      expect(res.body.data.pagination).toHaveProperty('total');
      expect(res.body.data.pagination).toHaveProperty('totalPages');
    });
  });
});
