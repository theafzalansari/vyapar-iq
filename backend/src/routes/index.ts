import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { ApiResponse } from '../types/api.types';
import { healthRouter } from './health.routes';

export const apiRouter = Router();

// Mount public health router at /health (e.g. /api/health)
apiRouter.use('/', healthRouter);

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
