import { z } from 'zod';

/**
 * Normalizes input date strings into accurate start/end boundary Date objects.
 * - If YYYY-MM-DD format:
 *   - startDate -> YYYY-MM-DDT00:00:00.000Z (inclusive start of day)
 *   - endDate   -> YYYY-MM-DDT23:59:59.999Z (inclusive end of day)
 * - If full ISO timestamp:
 *   - Preserves exact timestamp
 */
export function normalizeDateBoundaries(
  startDateStr?: string,
  endDateStr?: string
): {
  startDate?: Date;
  endDate?: Date;
} {
  let startDate: Date | undefined;
  let endDate: Date | undefined;

  if (startDateStr) {
    const trimmed = startDateStr.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      startDate = new Date(`${trimmed}T00:00:00.000Z`);
    } else {
      startDate = new Date(trimmed);
    }
  }

  if (endDateStr) {
    const trimmed = endDateStr.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      endDate = new Date(`${trimmed}T23:59:59.999Z`);
    } else {
      endDate = new Date(trimmed);
    }
  }

  return { startDate, endDate };
}

const isValidDate = (val: string): boolean => {
  if (!val || typeof val !== 'string') return false;
  const parsed = Date.parse(val.trim());
  return !isNaN(parsed);
};

// Base date filter schema for analytics queries
export const analyticsFilterSchema = z
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

// Trends query schema
export const analyticsTrendsQuerySchema = z
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
    groupBy: z
      .enum(['day', 'month'], {
        errorMap: () => ({ message: 'groupBy must be either "day" or "month"' }),
      })
      .default('month'),
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

// Categories query schema
export const analyticsCategoriesQuerySchema = z
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
    type: z
      .enum(['income', 'expense', 'all'], {
        errorMap: () => ({ message: 'type must be "income", "expense", or "all"' }),
      })
      .default('all'),
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

export type AnalyticsFilterInput = z.infer<typeof analyticsFilterSchema>;
export type AnalyticsTrendsQueryInput = z.infer<typeof analyticsTrendsQuerySchema>;
export type AnalyticsCategoriesQueryInput = z.infer<typeof analyticsCategoriesQuerySchema>;
