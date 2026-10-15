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
