import { NextFunction, Request, Response, Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import {
  AnalyticsCategoriesQueryInput,
  analyticsCategoriesQuerySchema,
  AnalyticsFilterInput,
  analyticsFilterSchema,
  AnalyticsTrendsQueryInput,
  analyticsTrendsQuerySchema,
} from '../schemas/analytics.schema';
import { analyticsService } from '../services/analytics.service';
import { ApiResponse } from '../types/api.types';
import {
  AnalyticsCategoriesResponse,
  AnalyticsSummaryResponse,
  AnalyticsTrendsResponse,
} from '../types/contracts.types';

export const analyticsRouter = Router();

/**
 * GET /api/analytics/summary
 * Returns total income, total expenses, net balance, transaction counts, and currency.
 * Scoped strictly to the authenticated Clerk user.
 */
analyticsRouter.get(
  '/summary',
  requireAuth,
  validateRequest(analyticsFilterSchema, 'query'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const filter = req.query as unknown as AnalyticsFilterInput;

      const summary = await analyticsService.getSummary(userId, filter);

      const response: ApiResponse<AnalyticsSummaryResponse> = {
        success: true,
        data: summary,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/analytics/trends
 * Returns income and expense trends grouped chronologically by day or month.
 * Scoped strictly to the authenticated Clerk user.
 */
analyticsRouter.get(
  '/trends',
  requireAuth,
  validateRequest(analyticsTrendsQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const query = req.query as unknown as AnalyticsTrendsQueryInput;

      const trends = await analyticsService.getTrends(userId, query);

      const response: ApiResponse<AnalyticsTrendsResponse> = {
        success: true,
        data: trends,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/analytics/categories
 * Returns income and expense totals grouped by category, with percentage breakdowns.
 * Scoped strictly to the authenticated Clerk user.
 */
analyticsRouter.get(
  '/categories',
  requireAuth,
  validateRequest(analyticsCategoriesQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const query = req.query as unknown as AnalyticsCategoriesQueryInput;

      const categories = await analyticsService.getCategories(userId, query);

      const response: ApiResponse<AnalyticsCategoriesResponse> = {
        success: true,
        data: categories,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);
