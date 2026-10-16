import { z } from 'zod';

export const transactionTypeEnum = z.enum(['income', 'expense']);

export const paymentMethodEnum = z.enum([
  'cash',
  'upi',
  'bank_transfer',
  'credit_card',
  'debit_card',
  'cheque',
  'other',
]);

export const transactionStatusEnum = z.enum([
  'completed',
  'pending',
  'flagged',
  'reconciled',
]);

// Schema for manual creation of a transaction
export const createTransactionSchema = z.object({
  date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'date must be a valid ISO 8601 date string',
    }),
  description: z
    .string()
    .trim()
    .min(1, 'description is required')
    .max(500, 'description cannot exceed 500 characters'),
  amount: z
    .number({ invalid_type_error: 'amount must be a number' })
    .positive('amount must be a positive number'),
  type: transactionTypeEnum,
  category: z
    .string()
    .trim()
    .min(1, 'category is required')
    .max(100, 'category cannot exceed 100 characters'),
  paymentMethod: paymentMethodEnum.default('other'),
  status: transactionStatusEnum.default('completed'),
  notes: z.string().trim().max(1000).optional(),
  reference: z.string().trim().max(100).optional().nullable(),
  counterparty: z.string().trim().max(200).optional().nullable(),
  metadata: z.record(z.unknown()).optional(),
  batchId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'batchId must be a valid Mongo ObjectId').optional().nullable(),
});

// Schema for updating a transaction
export const updateTransactionSchema = createTransactionSchema.partial();

// Schema for querying transactions with filters & pagination
export const transactionQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  type: transactionTypeEnum.optional(),
  category: z.string().trim().optional(),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'startDate must be a valid date').optional(),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'endDate must be a valid date').optional(),
  status: transactionStatusEnum.optional(),
  search: z.string().trim().optional(),
  sortBy: z.enum(['date', 'amount', 'createdAt']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Helper for parsing flexible CSV dates (ISO, YYYY-MM-DD, DD-MM-YYYY, MM/DD/YYYY)
const parseFlexibleDate = (val: string): Date | null => {
  if (!val || typeof val !== 'string') return null;
  const trimmed = val.trim();
  if (!trimmed) return null;

  // Try direct Date.parse first
  const parsed = Date.parse(trimmed);
  if (!isNaN(parsed)) {
    return new Date(parsed);
  }

  // Try DD-MM-YYYY or DD/MM/YYYY
  const parts = trimmed.split(/[-/]/);
  if (parts.length === 3) {
    // If year is parts[2]
    if (parts[2].length === 4) {
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const y = parseInt(parts[2], 10);
      const testDate = new Date(y, m, d);
      if (!isNaN(testDate.getTime())) return testDate;
    }
  }

  return null;
};

// Schema for validating a parsed CSV row
export const csvRowSchema = z.object({
  date: z
    .string({ required_error: 'Date is required' })
    .trim()
    .min(1, 'Date is required')
    .refine((val) => parseFlexibleDate(val) !== null, 'Invalid date format')
    .transform((val) => parseFlexibleDate(val)!.toISOString()),
  description: z
    .string({ required_error: 'Description is required' })
    .trim()
    .min(1, 'Description is required')
    .max(500, 'Description cannot exceed 500 characters'),
  amount: z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (typeof val === 'number') return val;
      const cleaned = val.replace(/,/g, '').trim();
      return cleaned === '' ? NaN : parseFloat(cleaned);
    })
    .refine((val) => !isNaN(val), 'Amount must be a valid number')
    .refine((val) => val > 0, 'Amount must be greater than zero'),
  type: z
    .string({ required_error: 'Type is required' })
    .trim()
    .min(1, 'Type is required')
    .transform((val) => val.toLowerCase())
    .refine((val) => val === 'income' || val === 'expense', "Type must be either 'income' or 'expense'")
    .transform((val) => val as 'income' | 'expense'),
  category: z
    .string({ required_error: 'Category is required' })
    .trim()
    .min(1, 'Category is required')
    .max(100, 'Category cannot exceed 100 characters'),
  reference: z
    .string()
    .trim()
    .max(100, 'Reference cannot exceed 100 characters')
    .optional()
    .nullable()
    .transform((val) => val || null),
  counterparty: z
    .string()
    .trim()
    .max(200, 'Counterparty cannot exceed 200 characters')
    .optional()
    .nullable()
    .transform((val) => val || null),
  paymentMethod: z
    .string()
    .optional()
    .transform((val) => (val ? val.trim().toLowerCase() : 'other'))
    .refine(
      (val) => ['cash', 'upi', 'bank_transfer', 'credit_card', 'debit_card', 'cheque', 'other'].includes(val),
      'Invalid payment method'
    )
    .default('other'),
  notes: z.string().trim().max(1000).optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionQueryInput = z.infer<typeof transactionQuerySchema>;
export type CsvRowInput = z.infer<typeof csvRowSchema>;
