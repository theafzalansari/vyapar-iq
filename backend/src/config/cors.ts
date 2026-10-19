import { CorsOptions } from 'cors';
import { env } from './env';

/**
 * Returns the set of allowed origins for Cross-Origin Resource Sharing.
 * Includes:
 * 1. The production Vercel frontend: https://vyapar-iq-plum.vercel.app
 * 2. Any custom FRONTEND_URL provided via environment variables (supports comma-separated origins)
 * 3. Local development origins (localhost & 127.0.0.1 on ports 5173, 3000, 4173)
 */
export const getAllowedOrigins = (): string[] => {
  const origins = new Set<string>([
    // Production frontend on Vercel
    'https://vyapar-iq-plum.vercel.app',
    // Local development origins
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:4173',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:4173',
  ]);

  if (env.FRONTEND_URL) {
    // Support single URL or comma-separated list of origins, trimming whitespace and trailing slashes
    env.FRONTEND_URL.split(',').forEach((url) => {
      const trimmed = url.trim().replace(/\/+$/, '');
      if (trimmed) {
        origins.add(trimmed);
      }
    });
  }

  return Array.from(origins);
};

/**
 * Checks whether an incoming request origin is allowed.
 * Requests without an origin (e.g. curl, server-to-server, health probes) are allowed.
 */
export const isOriginAllowed = (requestOrigin?: string): boolean => {
  if (!requestOrigin) {
    return true;
  }
  const normalized = requestOrigin.trim().replace(/\/+$/, '').toLowerCase();
  return getAllowedOrigins().some((allowed) => allowed.toLowerCase() === normalized);
};

export const corsOptions: CorsOptions = {
  origin: (requestOrigin, callback) => {
    if (isOriginAllowed(requestOrigin)) {
      return callback(null, true);
    }
    // Origin not allowed by CORS policy
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-mock-user-id',
    'x-allow-duplicate',
    'Accept',
    'Origin',
    'X-Requested-With',
  ],
  exposedHeaders: ['Content-Disposition'],
  optionsSuccessStatus: 204,
  maxAge: 86400, // Cache preflight response for 24 hours
};
