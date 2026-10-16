import { z } from 'zod';
import { normalizeDateBoundaries } from './analytics.schema';

const isValidDate = (val: string): boolean => {
  if (!val || typeof val !== 'string') return false;
  const parsed = Date.parse(val.trim());
  return !isNaN(parsed);
};

export const networkGraphQuerySchema = z
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
    category: z.string().trim().max(100).optional(),
    limit: z.coerce.number().int().positive().max(300).default(100),
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
      message: 'startDate cannot be after endDate',
      path: ['endDate'],
    }
  );

export type NetworkGraphQueryInput = z.infer<typeof networkGraphQuerySchema>;
