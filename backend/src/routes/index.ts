import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { ApiResponse } from '../types/api.types';
import { analyticsRouter } from './analytics.routes';
import { healthRouter } from './health.routes';
import { transactionRouter } from './transaction.routes';

export const apiRouter = Router();

// Mount public health router at /health (e.g. /api/health)
apiRouter.use('/', healthRouter);

// Mount transaction router at /transactions (e.g. /api/transactions)
apiRouter.use('/transactions', transactionRouter);

// Mount analytics router at /analytics (e.g. /api/analytics)
apiRouter.use('/analytics', analyticsRouter);

// Protected route to verify Clerk authentication
apiRouter.get('/auth/me', requireAuth, (req: Request, res: Response) => {
  const response: ApiResponse<{ userId: string; message: string }> = {
    success: true,
    data: {
      userId: req.userId || 'unknown',
      message: 'Authentication successful. You have access to protected VyaparIQ endpoints.',
    },
  };
  res.status(200).json(response);
});
