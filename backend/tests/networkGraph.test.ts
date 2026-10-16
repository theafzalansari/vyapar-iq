import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { app } from '../src/app';
import { connectDatabase, disconnectDatabase } from '../src/config/db';
import { Anomaly } from '../src/models/Anomaly';
import { Transaction } from '../src/models/Transaction';

describe('Network Graph API (GET /api/network-graph)', () => {
  const USER_ALPHA = 'user_network_test_alpha';
  const USER_BETA = 'user_network_test_beta';
  const EMPTY_USER = 'user_network_test_empty';

  beforeAll(async () => {
    await connectDatabase();

    // Clean up test collections for isolated test runs
    await Promise.all([
      Transaction.deleteMany({ userId: { $in: [USER_ALPHA, USER_BETA, EMPTY_USER] } }),
      Anomaly.deleteMany({ userId: { $in: [USER_ALPHA, USER_BETA, EMPTY_USER] } }),
    ]);

    // Seed User Alpha transactions with counterparties and potential relationships
    await Transaction.create([
      // Vendor 1: Sri Packaging Corp (2 payments with identical amount 3200 within 15 mins -> duplicate relationship)
      {
        userId: USER_ALPHA,
        date: new Date('2026-10-06T10:00:00.000Z'),
        description: 'Sri Packaging Corp - Corrugated packaging boxes',
        amount: 3200.0,
        type: 'expense',
        category: 'Packaging',
        reference: 'INV-BOX-12',
        counterparty: 'Sri Packaging Corp',
        paymentMethod: 'bank_transfer',
        status: 'completed',
      },
      {
        userId: USER_ALPHA,
        date: new Date('2026-10-06T10:12:00.000Z'), // 12 minutes later -> duplicate payment
        description: 'Sri Packaging Corp - Corrugated packaging boxes',
        amount: 3200.0,
        type: 'expense',
        category: 'Packaging',
        reference: 'UPI-REF-091',
        counterparty: 'Sri Packaging Corp',
        paymentMethod: 'upi',
        status: 'completed',
      },
      // Vendor 2: Commercial Landlord (Monthly Rent)
      {
        userId: USER_ALPHA,
        date: new Date('2026-10-01T09:00:00.000Z'),
        description: 'Commercial Realty Ltd - Shop commercial lease payment',
        amount: 15000.0,
        type: 'expense',
        category: 'Rent',
        reference: 'RENT-OCT-26',
        counterparty: 'Commercial Realty Ltd',
        paymentMethod: 'bank_transfer',
        status: 'completed',
      },
      // Customer 1: Pune Wholesale Mart (B2B Income)
      {
        userId: USER_ALPHA,
        date: new Date('2026-10-08T14:30:00.000Z'),
        description: 'Received from Pune Wholesale Mart - Bulk textile dispatch',
        amount: 45000.0,
        type: 'income',
        category: 'Sales',
        reference: 'INV-2026-001',
        counterparty: 'Pune Wholesale Mart',
        paymentMethod: 'bank_transfer',
        status: 'completed',
      },
    ]);

    // Seed User Beta transactions (for strict user isolation testing)
    await Transaction.create([
      {
        userId: USER_BETA,
        date: new Date('2026-10-05T10:00:00.000Z'),
        description: 'Private Supplier Beta - Secret chemical raw material',
        amount: 75000.0,
        type: 'expense',
        category: 'Materials',
        counterparty: 'Private Supplier Beta',
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
    it('rejects GET /api/network-graph without credentials with 401 UNAUTHORIZED', async () => {
      const res = await request(app).get('/api/network-graph');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('rejects invalid query date parameters with 400 VALIDATION_ERROR', async () => {
      const res = await request(app)
        .get('/api/network-graph?startDate=invalid-date')
        .set('x-mock-user-id', USER_ALPHA);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects startDate greater than endDate with 400 VALIDATION_ERROR', async () => {
      const res = await request(app)
        .get('/api/network-graph?startDate=2026-10-15&endDate=2026-10-01')
        .set('x-mock-user-id', USER_ALPHA);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Empty Datasets & Zero States', () => {
    it('returns empty typed graph response gracefully for user without transactions', async () => {
      const res = await request(app)
        .get('/api/network-graph')
        .set('x-mock-user-id', EMPTY_USER);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const data = res.body.data;
      expect(data).toBeDefined();
      expect(data.nodes).toEqual([]);
      expect(data.edges).toEqual([]);
      expect(data.summary).toEqual({
        totalNodes: 0,
        totalEdges: 0,
        vendorNodes: 0,
        customerNodes: 0,
        transactionNodes: 0,
        flaggedNodes: 0,
        flaggedEdges: 0,
      });
    });
  });

  describe('Populated Graph & Relationship Detection', () => {
    it('builds typed entity and transaction nodes with bounded coordinates', async () => {
      const res = await request(app)
        .get('/api/network-graph')
        .set('x-mock-user-id', USER_ALPHA);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const data = res.body.data;
      expect(data.nodes.length).toBeGreaterThanOrEqual(4);
      expect(data.edges.length).toBeGreaterThanOrEqual(4);

      // Verify vendor node exists
      const packagingVendor = data.nodes.find(
        (n: any) => n.type === 'vendor' && n.label.includes('Sri Packaging')
      );
      expect(packagingVendor).toBeDefined();
      expect(packagingVendor?.amount).toBe(6400); // 3200 + 3200
      expect(packagingVendor?.transactionCount).toBe(2);

      // Verify customer node exists
      const customerNode = data.nodes.find(
        (n: any) => n.type === 'customer' && n.label.includes('Pune Wholesale')
      );
      expect(customerNode).toBeDefined();
      expect(customerNode?.amount).toBe(45000);

      // Verify coordinates are strictly within SVG canvas boundary (0 to 850 x 0 to 520)
      data.nodes.forEach((node: any) => {
        expect(node.x).toBeGreaterThanOrEqual(40);
        expect(node.x).toBeLessThanOrEqual(810);
        expect(node.y).toBeGreaterThanOrEqual(40);
        expect(node.y).toBeLessThanOrEqual(480);
      });
    });

    it('detects duplicate payment relationship and creates flagged cross-link edge', async () => {
      const res = await request(app)
        .get('/api/network-graph')
        .set('x-mock-user-id', USER_ALPHA);

      expect(res.status).toBe(200);
      const data = res.body.data;

      // Find cross-link duplicate edge between the two 3200 transactions
      const dupEdge = data.edges.find((e: any) => e.type === 'duplicate_link');
      expect(dupEdge).toBeDefined();
      expect(dupEdge?.isFlagged).toBe(true);
      expect(dupEdge?.label).toContain('Duplicate');
    });

    it('supports alias route /api/network/graph returning identical structure', async () => {
      const res = await request(app)
        .get('/api/network/graph')
        .set('x-mock-user-id', USER_ALPHA);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.nodes.length).toBeGreaterThan(0);
      expect(res.body.data.edges.length).toBeGreaterThan(0);
    });
  });

  describe('User Isolation & Data Boundaries', () => {
    it('strictly isolates network graph data between authenticated users', async () => {
      const resAlpha = await request(app)
        .get('/api/network-graph')
        .set('x-mock-user-id', USER_ALPHA);

      const resBeta = await request(app)
        .get('/api/network-graph')
        .set('x-mock-user-id', USER_BETA);

      expect(resAlpha.status).toBe(200);
      expect(resBeta.status).toBe(200);

      // User Beta should only see Private Supplier Beta
      const betaLabels = resBeta.body.data.nodes.map((n: any) => n.label);
      expect(betaLabels.some((l: string) => l.includes('Private Supplier Beta'))).toBe(true);
      expect(betaLabels.some((l: string) => l.includes('Sri Packaging Corp'))).toBe(false);

      // User Alpha should not see Private Supplier Beta
      const alphaLabels = resAlpha.body.data.nodes.map((n: any) => n.label);
      expect(alphaLabels.some((l: string) => l.includes('Private Supplier Beta'))).toBe(false);
      expect(alphaLabels.some((l: string) => l.includes('Sri Packaging Corp'))).toBe(true);
    });
  });
});
