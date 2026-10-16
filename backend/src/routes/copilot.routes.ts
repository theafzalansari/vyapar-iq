import { NextFunction, Request, Response, Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { CopilotChatInput, copilotChatSchema } from '../schemas/copilot.schema';
import {
  copilotService,
  CopilotError,
  GeminiNotConfiguredError,
  GeminiProviderError,
  GeminiRateLimitError,
  GeminiTimeoutError,
} from '../services/copilot.service';
import { ApiResponse } from '../types/api.types';
import { CopilotChatResponse } from '../types/contracts.types';

export const copilotRouter = Router();

// In-memory sliding window rate limiter: 30 requests per minute per authenticated user
const rateLimitWindowMs = 60 * 1000;
const maxRequestsPerWindow = 30;
const userRequestTimestamps = new Map<string, number[]>();

export const resetCopilotRateLimits = () => {
  userRequestTimestamps.clear();
};

const copilotRateLimiter = (req: Request, res: Response, next: NextFunction): void => {
  const userId = req.userId;
  if (!userId) {
    return next();
  }

  const now = Date.now();
  const windowStart = now - rateLimitWindowMs;

  const timestamps = (userRequestTimestamps.get(userId) || []).filter((t) => t > windowStart);

  if (timestamps.length >= maxRequestsPerWindow) {
    res.status(429).json({
      success: false,
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: 'Too many requests. Please wait a moment before sending another question to Copilot.',
      },
    });
    return;
  }

  timestamps.push(now);
  userRequestTimestamps.set(userId, timestamps);
  next();
};

/**
 * POST /api/copilot/chat
 * Primary conversational endpoint for VyaparIQ Business Copilot.
 * Integrates deterministic analytics, anomaly detection evidence, and Gemini explanations.
 */
copilotRouter.post(
  '/chat',
  requireAuth,
  copilotRateLimiter,
  validateRequest(copilotChatSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const input = req.body as CopilotChatInput;

      const response = await copilotService.generateGroundedChat(userId, input);

      const apiResponse: ApiResponse<CopilotChatResponse> = {
        success: true,
        data: response,
      };

      res.status(200).json(apiResponse);
    } catch (error: any) {
      if (error instanceof GeminiNotConfiguredError) {
        res.status(503).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof GeminiRateLimitError) {
        res.status(429).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof GeminiTimeoutError) {
        res.status(504).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof GeminiProviderError) {
        res.status(502).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof CopilotError) {
        res.status(error.status).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      // Safe fallback for unexpected errors
      console.error('Unhandled Copilot endpoint error:', error?.message || error);
      res.status(500).json({
        success: false,
        error: {
          code: 'COPILOT_SERVER_ERROR',
          message: 'Unable to process AI Copilot query. Please try again.',
        },
      });
    }
  }
);
