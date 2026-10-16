import { NextFunction, Request, Response, Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import {
  anomalyIdParamSchema,
  AnomalyQueryInput,
  anomalyQuerySchema,
  ResolveAnomalyInput,
  resolveAnomalySchema,
} from '../schemas/anomaly.schema';
import { anomalyDetectionService } from '../services/anomalyDetection.service';
import { ApiResponse } from '../types/api.types';
import { AnomalyListResponse } from '../types/contracts.types';

export const anomalyRouter = Router();

/**
 * GET /api/anomalies
 * Retrieves detected anomaly findings for the authenticated user with optional filtering.
 * Automatically runs a deterministic scan if no anomalies exist yet or if ?recompute=true.
 */
anomalyRouter.get(
  '/',
  requireAuth,
  validateRequest(anomalyQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const query = req.query as unknown as AnomalyQueryInput;

      if (query.recompute) {
        const result = await anomalyDetectionService.detectAnomalies(userId);
        res.status(200).json({
          success: true,
          data: result,
        });
        return;
      }

      // Check existing findings; if empty, perform initial scan
      let result = await anomalyDetectionService.getAnomalies(userId, query);
      if (result.anomalies.length === 0 && !query.severity && !query.type) {
        result = await anomalyDetectionService.detectAnomalies(userId);
      }

      const response: ApiResponse<AnomalyListResponse> = {
        success: true,
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/anomalies/detect
 * Explicitly triggers a deterministic anomaly scan on the authenticated user's transactions.
 */
anomalyRouter.post(
  '/detect',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const result = await anomalyDetectionService.detectAnomalies(userId);

      const response: ApiResponse<AnomalyListResponse> = {
        success: true,
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/anomalies/:id/resolve
 * Marks a finding as reviewed / resolved by the authenticated user.
 */
anomalyRouter.patch(
  '/:id/resolve',
  requireAuth,
  validateRequest(anomalyIdParamSchema, 'params'),
  validateRequest(resolveAnomalySchema, 'body'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const { id } = req.params as { id: string };
      const body = (req.body || {}) as ResolveAnomalyInput;

      const result = await anomalyDetectionService.resolveAnomaly(
        userId,
        id,
        body.isResolved ?? true,
        body.resolutionNotes
      );

      const response: ApiResponse<{ success: boolean; anomalyId: string }> = {
        success: true,
        data: result,
      };

      res.status(200).json(response);
    } catch (error: any) {
      if (error.message && error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Anomaly finding not found or unauthorized',
          },
        });
        return;
      }
      next(error);
    }
  }
);
