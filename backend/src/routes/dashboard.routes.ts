import { NextFunction, Request, Response, Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { AnalyticsFilterInput, analyticsFilterSchema } from '../schemas/analytics.schema';
import { dashboardService } from '../services/dashboard.service';
import { ApiResponse } from '../types/api.types';
import { DashboardSummaryResponse } from '../types/contracts.types';

export const dashboardRouter = Router();

/**
 * GET /api/dashboard/summary
 * Returns comprehensive dashboard summary metrics, trends, category distributions,
 * recent transactions, and anomaly counts for the authenticated Clerk user.
 */
dashboardRouter.get(
  '/summary',
  requireAuth,
  validateRequest(analyticsFilterSchema, 'query'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const filter = req.query as unknown as AnalyticsFilterInput;

      const summary = await dashboardService.getDashboardSummary(userId, filter);

      const response: ApiResponse<DashboardSummaryResponse> = {
        success: true,
        data: summary,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);
