import { describe, expect, it } from 'vitest';
import { copilotChatSchema } from '../src/schemas/copilot.schema';
import { createTransactionSchema, csvRowSchema } from '../src/schemas/transaction.schema';

describe('Zod Validation Schemas', () => {
  describe('createTransactionSchema', () => {
    it('validates a valid transaction object', () => {
      const validPayload = {
        date: '2026-10-14T10:00:00.000Z',
        description: 'Wholesale Inventory Purchase',
        amount: 25000,
        type: 'expense' as const,
        category: 'Inventory',
        paymentMethod: 'bank_transfer' as const,
        status: 'completed' as const,
        notes: 'Invoice #INV-2026-091',
      };

      const result = createTransactionSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.amount).toBe(25000);
        expect(result.data.category).toBe('Inventory');
      }
    });

    it('rejects negative or zero amounts', () => {
      const invalidPayload = {
        date: '2026-10-14T10:00:00.000Z',
        description: 'Refund',
        amount: -500,
        type: 'expense',
        category: 'Sales',
      };

      const result = createTransactionSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('rejects invalid transaction type', () => {
      const invalidPayload = {
        date: '2026-10-14T10:00:00.000Z',
        description: 'Testing',
        amount: 500,
        type: 'loan',
        category: 'Finance',
      };

      const result = createTransactionSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });

  describe('csvRowSchema', () => {
    it('transforms and parses formatted string amounts and lowercase types', () => {
      const csvRow = {
        date: '2026-09-15',
        description: 'Store Counter Sales',
        amount: '1,450.75',
        type: 'INCOME',
        category: 'Sales',
        paymentMethod: 'UPI',
      };

      const result = csvRowSchema.safeParse(csvRow);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.amount).toBe(1450.75);
        expect(result.data.type).toBe('income');
        expect(result.data.paymentMethod).toBe('upi');
      }
    });
  });

  describe('copilotChatSchema', () => {
    it('validates a copilot chat prompt', () => {
      const payload = {
        message: 'What was my top expense category last month?',
        context: {
          startDate: '2026-09-01T00:00:00.000Z',
          endDate: '2026-09-30T23:59:59.000Z',
        },
      };

      const result = copilotChatSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('rejects an empty message', () => {
      const result = copilotChatSchema.safeParse({ message: '   ' });
      expect(result.success).toBe(false);
    });
  });
});
