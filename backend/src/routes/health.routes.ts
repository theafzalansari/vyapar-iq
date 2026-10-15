import { Router, Request, Response } from 'express';
import { getDatabaseStatus } from '../config/db';
import { env } from '../config/env';
import { ApiResponse, HealthStatusResponse } from '../types/api.types';

export const healthRouter = Router();

healthRouter.get('/health', (_req: Request, res: Response) => {
  const dbStatus = getDatabaseStatus();

  const responseData: HealthStatusResponse = {
    status: dbStatus === 'connected' ? 'ok' : 'degraded',
    service: 'vyapar-iq-backend',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: dbStatus,
    environment: env.NODE_ENV,
  };

  const response: ApiResponse<HealthStatusResponse> = {
    success: true,
    data: responseData,
  };

  res.status(200).json(response);
});
