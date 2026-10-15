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

// Schema for validating a parsed CSV row
export const csvRowSchema = z.object({
  date: z
    .string()
    .min(1, 'Date is required')
    .refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
  description: z.string().trim().min(1, 'Description is required'),
  amount: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === 'string' ? parseFloat(val.replace(/,/g, '')) : val))
    .refine((val) => !isNaN(val) && val > 0, 'Amount must be a positive number'),
  type: z
    .string()
    .transform((val) => val.trim().toLowerCase())
    .refine((val) => val === 'income' || val === 'expense', 'Type must be income or expense')
    .transform((val) => val as 'income' | 'expense'),
  category: z.string().trim().min(1, 'Category is required'),
  paymentMethod: z
    .string()
    .optional()
    .transform((val) => (val ? val.trim().toLowerCase() : 'other'))
    .refine(
      (val) => ['cash', 'upi', 'bank_transfer', 'credit_card', 'debit_card', 'cheque', 'other'].includes(val),
      'Invalid payment method'
    )
    .default('other'),
  notes: z.string().trim().optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionQueryInput = z.infer<typeof transactionQuerySchema>;
export type CsvRowInput = z.infer<typeof csvRowSchema>;
