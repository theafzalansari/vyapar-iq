import cors from 'cors';
import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { clerkAuthMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { apiRouter } from './routes';

export const createApp = (): Express => {
  const app = express();

  // Basic security and HTTP protection
  app.use(helmet());

  // Cross-Origin Resource Sharing
  app.use(
    cors({
      origin: [env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-mock-user-id'],
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
