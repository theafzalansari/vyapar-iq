import { z } from 'zod';

export const importBatchQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  status: z.enum(['pending', 'processing', 'completed', 'partial', 'failed']).optional(),
});

export const createImportBatchSchema = z.object({
  fileName: z.string().trim().min(1, 'fileName is required').max(255),
  fileSize: z.number().nonnegative('fileSize must be non-negative'),
  rowCount: z.number().int().nonnegative('rowCount must be non-negative').default(0),
});

export type ImportBatchQueryInput = z.infer<typeof importBatchQuerySchema>;
export type CreateImportBatchInput = z.infer<typeof createImportBatchSchema>;
