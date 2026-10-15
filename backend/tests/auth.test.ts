import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../src/app';

describe('Authentication Middleware Verification', () => {
  it('rejects unauthenticated requests to protected endpoints with 401', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body.error).toHaveProperty('code', 'UNAUTHORIZED');
  });

  it('allows access to protected endpoint when authenticated via mock user in test mode', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('x-mock-user-id', 'user_clerk_test_99');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('userId', 'user_clerk_test_99');
  });
});
