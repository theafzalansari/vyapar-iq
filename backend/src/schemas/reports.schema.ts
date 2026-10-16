import { z } from 'zod';
import { normalizeDateBoundaries } from './analytics.schema';

const isValidDate = (val: string): boolean => {
  if (!val || typeof val !== 'string') return false;
  const parsed = Date.parse(val.trim());
  return !isNaN(parsed);
};

export const reportQuerySchema = z
  .object({
    startDate: z
      .string()
      .trim()
      .refine(isValidDate, {
        message: 'startDate must be a valid date string (e.g. YYYY-MM-DD or ISO 8601)',
      })
      .optional(),
    endDate: z
      .string()
      .trim()
      .refine(isValidDate, {
        message: 'endDate must be a valid date string (e.g. YYYY-MM-DD or ISO 8601)',
      })
      .optional(),
    scope: z
      .enum(['reconciliation', 'anomalies', 'gst'], {
        errorMap: () => ({ message: 'scope must be one of: reconciliation, anomalies, gst' }),
      })
      .default('reconciliation')
      .optional(),
    businessName: z.string().trim().max(100).optional(),
    gstin: z.string().trim().max(20).optional(),
    pan: z.string().trim().max(15).optional(),
    industry: z.string().trim().max(100).optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        const { startDate, endDate } = normalizeDateBoundaries(data.startDate, data.endDate);
        if (startDate && endDate) {
          return startDate.getTime() <= endDate.getTime();
        }
      }
      return true;
    },
    {
      message: 'startDate must be before or equal to endDate',
      path: ['startDate'],
    }
  );

export type ReportQueryInput = z.infer<typeof reportQuerySchema>;
