import { clerkMiddleware, getAuth } from '@clerk/express';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { env } from '../config/env';

/**
 * Checks whether valid Clerk credentials have been configured.
 */
export const isClerkConfigured = (): boolean => {
  return (
    Boolean(env.CLERK_PUBLISHABLE_KEY) &&
    Boolean(env.CLERK_SECRET_KEY) &&
    !env.CLERK_PUBLISHABLE_KEY.includes('placeholder') &&
    !env.CLERK_SECRET_KEY.includes('placeholder')
  );
};

/**
 * Global Clerk middleware initialization.
 * Uses official @clerk/express clerkMiddleware when keys are present.
 */
export const clerkAuthMiddleware: RequestHandler = (req, res, next) => {
  if (isClerkConfigured()) {
    try {
      const middleware = clerkMiddleware({
        publishableKey: env.CLERK_PUBLISHABLE_KEY,
        secretKey: env.CLERK_SECRET_KEY,
      });
      return middleware(req, res, next);
    } catch (error) {
      console.error('Clerk middleware error:', error);
      return next();
    }
  }

  // If not configured, continue without decorating auth object
  next();
};

/**
 * Route-level middleware to enforce authentication on protected endpoints.
 * Returns standard 401 JSON response if unauthenticated.
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  // Allow test / dev mock header when not in production
  if (env.NODE_ENV !== 'production') {
    const mockUser = req.headers['x-mock-user-id'] as string;
    if (mockUser) {
      req.userId = mockUser;
      return next();
    }
  }

  // If Clerk is configured, verify official Clerk session / token
  if (isClerkConfigured()) {
    try {
      const auth = getAuth(req);
      if (auth && auth.userId) {
        req.userId = auth.userId;
        return next();
      }
    } catch {
      // In case getAuth fails or request has no auth object
    }

    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required. Missing or invalid Bearer token.',
      },
    });
    return;
  }

  // Development with unconfigured Clerk and no mock user header
  if (env.NODE_ENV !== 'production') {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message:
          'Authentication required. Clerk keys are not configured in .env. Provide valid Clerk keys or use "x-mock-user-id" header for development/testing.',
      },
    });
    return;
  }

  // Production with missing keys
  res.status(401).json({
    success: false,
    error: {
      code: 'UNAUTHORIZED',
      message: 'Authentication service unavailable. Please contact the administrator.',
    },
  });
};

/**
 * Utility helper to safely extract authenticated user id
 */
export const getAuthUser = (req: Request): { userId: string } => {
  if (!req.userId) {
    throw new Error('User is not authenticated');
  }
  return { userId: req.userId };
};
