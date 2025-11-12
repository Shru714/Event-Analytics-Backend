const request = require('supertest');
const app = require('../src/server');

describe('Analytics Endpoints', () => {
  let authToken;
  let appId;

  beforeAll(async () => {
    const authRes = await request(app)
      .post('/api/auth/register')
      .send({ email: 'analytics@example.com', name: 'Analytics User' });
    authToken = authRes.body.data.token;
  });

  describe('GET /api/analytics/events/summary', () => {
    it('should return event summary', async () => {
      const res = await request(app)
        .get('/api/analytics/events/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ appId });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should reject without authentication', async () => {
      const res = await request(app)
        .get('/api/analytics/events/summary');
      
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/analytics/events/timeline', () => {
    it('should return event timeline', async () => {
      const res = await request(app)
        .get('/api/analytics/events/timeline')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ appId, interval: 'day' });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/analytics/apps/:appId/overview', () => {
    it('should return app overview', async () => {
      const res = await request(app)
        .get(`/api/analytics/apps/${appId}/overview`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('app');
      expect(res.body.data).toHaveProperty('stats');
    });
  });
});
