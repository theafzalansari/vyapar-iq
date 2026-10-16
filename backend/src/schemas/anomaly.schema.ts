import { z } from 'zod';

export const anomalySeverityEnum = z.enum(['low', 'medium', 'high', 'critical']);

export const anomalyTypeEnum = z.enum([
  'expense_spike',
  'duplicate_payment',
  'unexpected_vendor',
  'negative_cashflow',
  'irregular_frequency',
  'unusual_category',
]);

const isValidDate = (val: string): boolean => {
  if (!val || typeof val !== 'string') return false;
  const parsed = Date.parse(val.trim());
  return !isNaN(parsed);
};

export const anomalyQuerySchema = z
  .object({
    severity: anomalySeverityEnum.optional(),
    type: anomalyTypeEnum.optional(),
    isResolved: z
      .union([z.boolean(), z.enum(['true', 'false'])])
      .transform((val) => (typeof val === 'boolean' ? val : val === 'true'))
      .optional(),
    startDate: z.string().trim().refine(isValidDate, { message: 'startDate must be a valid date' }).optional(),
    endDate: z.string().trim().refine(isValidDate, { message: 'endDate must be a valid date' }).optional(),
    recompute: z
      .union([z.boolean(), z.enum(['true', 'false'])])
      .transform((val) => (typeof val === 'boolean' ? val : val === 'true'))
      .optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate).getTime() <= new Date(data.endDate).getTime();
      }
      return true;
    },
    {
      message: 'startDate must be before or equal to endDate',
      path: ['startDate'],
    }
  );

export const resolveAnomalySchema = z.object({
  isResolved: z.boolean().default(true),
  resolutionNotes: z.string().trim().max(500, 'resolutionNotes cannot exceed 500 characters').optional(),
});

export const anomalyIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid anomaly ID format'),
});

export type AnomalyQueryInput = z.infer<typeof anomalyQuerySchema>;
export type ResolveAnomalyInput = z.infer<typeof resolveAnomalySchema>;
