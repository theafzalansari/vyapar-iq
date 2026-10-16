import { z } from 'zod';

export const copilotChatSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message cannot exceed 1000 characters'),
  context: z
    .object({
      startDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'startDate must be a valid date').optional(),
      endDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'endDate must be a valid date').optional(),
      category: z.string().trim().optional(),
      anomalyId: z.string().trim().optional(),
    })
    .optional(),
});

export type CopilotChatInput = z.infer<typeof copilotChatSchema>;

export const groundedMetricSchema = z.object({
  metric: z.string(),
  value: z.union([z.string(), z.number()]),
  basis: z.string(),
});

export const actionRecommendationSchema = z.object({
  id: z.string(),
  title: z.string(),
  actionType: z.enum(['review_transactions', 'set_budget_alert', 'export_report', 'reconcile_batch']),
  payload: z.record(z.unknown()).optional(),
});

export const copilotChatResponseSchema = z.object({
  reply: z.string(),
  groundedMetrics: z.array(groundedMetricSchema).default([]),
  suggestedFollowUps: z.array(z.string()).default([]),
  recommendedActions: z.array(actionRecommendationSchema).default([]),
  confidence: z.number().min(0).max(1).default(0.9),
  timestamp: z.string(),
  relatedAnomalies: z.array(z.any()).optional(),
  supportingEvidence: z.record(z.unknown()).optional(),
});

export type CopilotChatResponseOutput = z.infer<typeof copilotChatResponseSchema>;
