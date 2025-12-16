import request from 'supertest';
import { app } from '../server/index';

describe('API Integration Tests', () => {
  let adminToken: string;

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@local.test', password: 'adminpass' });

    adminToken = loginRes.body.token;
  });

  it('GET /api/summary should return 200', async () => {
    const res = await request(app).get('/api/summary');
    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
  });

  it('GET /api/referrals should return 200 (auth required)', async () => {
    const res = await request(app)
      .get('/api/referrals')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Add more endpoint tests as needed
});
