import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../src/app';

describe('Health and System Routes', () => {
  it('GET /api/health returns 200 and system health status', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('service', 'vyapar-iq-backend');
    expect(res.body.data).toHaveProperty('status');
    expect(res.body.data).toHaveProperty('database');
    expect(res.body.data).toHaveProperty('uptime');
    expect(res.body.data).toHaveProperty('timestamp');
  });

  it('GET /api/non-existent-route returns 404 with structured JSON', async () => {
    const res = await request(app).get('/api/non-existent-route');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      success: false,
      error: {
        code: 'ROUTE_NOT_FOUND',
        message: 'Route not found: GET /api/non-existent-route',
      },
    });
  });
});
