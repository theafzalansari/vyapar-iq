import cors from 'cors';
import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { corsOptions } from './config/cors';
import { env } from './config/env';
import { clerkAuthMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { apiRouter } from './routes';

export const createApp = (): Express => {
  const app = express();

  // Cross-Origin Resource Sharing (runs first to intercept preflights & set CORS headers)
  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));

  // Basic security and HTTP protection (allows cross-origin resource reads for API/files)
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // Request body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // HTTP access logging (omitted in test runs)
  if (env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Clerk authentication middleware (decorates request with auth state)
  app.use(clerkAuthMiddleware);

  // Main API Router
  app.use('/api', apiRouter);

  // 404 Handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'ROUTE_NOT_FOUND',
        message: `Route not found: ${req.method} ${req.originalUrl}`,
      },
    });
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
};

export const app = createApp();
