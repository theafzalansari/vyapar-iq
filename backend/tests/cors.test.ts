import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../src/app';
import { getAllowedOrigins, isOriginAllowed } from '../src/config/cors';

describe('Cross-Origin Resource Sharing (CORS) Configuration', () => {
  const PRODUCTION_ORIGIN = 'https://vyapar-iq-plum.vercel.app';
  const LOCAL_DEV_ORIGIN = 'http://localhost:5173';
  const UNKNOWN_ORIGIN = 'https://malicious-attacker-domain.com';

  describe('Allowed Origins Helper', () => {
    it('includes the exact production Vercel origin', () => {
      const allowed = getAllowedOrigins();
      expect(allowed).toContain(PRODUCTION_ORIGIN);
    });

    it('includes local development origins', () => {
      const allowed = getAllowedOrigins();
      expect(allowed).toContain(LOCAL_DEV_ORIGIN);
      expect(allowed).toContain('http://localhost:3000');
    });

    it('correctly validates allowed vs rejected origins', () => {
      expect(isOriginAllowed(PRODUCTION_ORIGIN)).toBe(true);
      expect(isOriginAllowed(LOCAL_DEV_ORIGIN)).toBe(true);
      expect(isOriginAllowed(UNKNOWN_ORIGIN)).toBe(false);
      expect(isOriginAllowed(undefined)).toBe(true); // Non-browser / curl requests
    });
  });

  describe('Preflight OPTIONS Requests', () => {
    it('handles OPTIONS /api/anomalies preflight for production Vercel origin', async () => {
      const res = await request(app)
        .options('/api/anomalies')
        .set('Origin', PRODUCTION_ORIGIN)
        .set('Access-Control-Request-Method', 'GET')
        .set('Access-Control-Request-Headers', 'Authorization, Content-Type, x-mock-user-id');

      expect(res.status).toBe(204);
      expect(res.headers['access-control-allow-origin']).toBe(PRODUCTION_ORIGIN);
      expect(res.headers['access-control-allow-credentials']).toBe('true');
      expect(res.headers['access-control-allow-methods']).toContain('GET');
      expect(res.headers['access-control-allow-methods']).toContain('OPTIONS');
      expect(res.headers['access-control-allow-headers']).toContain('Authorization');
      expect(res.headers['access-control-allow-headers']).toContain('Content-Type');
      expect(res.headers['access-control-max-age']).toBe('86400');
    });

    it('handles OPTIONS /api/dashboard/summary preflight for production Vercel origin', async () => {
      const res = await request(app)
        .options('/api/dashboard/summary')
        .set('Origin', PRODUCTION_ORIGIN)
        .set('Access-Control-Request-Method', 'GET')
        .set('Access-Control-Request-Headers', 'Authorization, Content-Type');

      expect(res.status).toBe(204);
      expect(res.headers['access-control-allow-origin']).toBe(PRODUCTION_ORIGIN);
      expect(res.headers['access-control-allow-credentials']).toBe('true');
    });

    it('handles OPTIONS preflight for local development origin', async () => {
      const res = await request(app)
        .options('/api/anomalies')
        .set('Origin', LOCAL_DEV_ORIGIN)
        .set('Access-Control-Request-Method', 'GET');

      expect(res.status).toBe(204);
      expect(res.headers['access-control-allow-origin']).toBe(LOCAL_DEV_ORIGIN);
      expect(res.headers['access-control-allow-credentials']).toBe('true');
    });

    it('does NOT return Access-Control-Allow-Origin for unauthorized origin in preflight', async () => {
      const res = await request(app)
        .options('/api/anomalies')
        .set('Origin', UNKNOWN_ORIGIN)
        .set('Access-Control-Request-Method', 'GET');

      // Unauthorized preflights must not include the CORS allow origin header
      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    });
  });

  describe('Actual HTTP Requests with Origin Header', () => {
    it('sets CORS headers on public GET /api/health from production origin', async () => {
      const res = await request(app)
        .get('/api/health')
        .set('Origin', PRODUCTION_ORIGIN);

      expect(res.status).toBe(200);
      expect(res.headers['access-control-allow-origin']).toBe(PRODUCTION_ORIGIN);
      expect(res.headers['access-control-allow-credentials']).toBe('true');
      expect(res.headers['cross-origin-resource-policy']).toBe('cross-origin');
    });

    it('preserves 401 UNAUTHORIZED on protected endpoints while sending CORS headers to browser', async () => {
      const res = await request(app)
        .get('/api/anomalies')
        .set('Origin', PRODUCTION_ORIGIN);

      // Auth is strictly preserved: unauthenticated requests still return 401
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.error).toHaveProperty('code', 'UNAUTHORIZED');

      // But CORS header is returned so the browser client can read the 401 response
      expect(res.headers['access-control-allow-origin']).toBe(PRODUCTION_ORIGIN);
      expect(res.headers['access-control-allow-credentials']).toBe('true');
    });

    it('allows authenticated requests from production origin and returns CORS headers', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Origin', PRODUCTION_ORIGIN)
        .set('x-mock-user-id', 'user_prod_tester');

      expect(res.status).toBe(200);
      expect(res.headers['access-control-allow-origin']).toBe(PRODUCTION_ORIGIN);
      expect(res.headers['access-control-allow-credentials']).toBe('true');
      expect(res.body.data.userId).toBe('user_prod_tester');
    });

    it('does NOT set Access-Control-Allow-Origin for untrusted origin on GET request', async () => {
      const res = await request(app)
        .get('/api/health')
        .set('Origin', UNKNOWN_ORIGIN);

      expect(res.status).toBe(200);
      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    });

    it('handles direct non-browser requests without Origin header seamlessly', async () => {
      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    });
  });
});
