const request = require('supertest');
const app = require('../src/server');

describe('API Key Management', () => {
  let authToken;
  let appId;

  beforeAll(async () => {
    const authRes = await request(app)
      .post('/api/auth/register')
      .send({ email: 'apikey@example.com', name: 'API Key User' });
    authToken = authRes.body.data.token;
  });

  describe('POST /api/keys', () => {
    it('should create new API key', async () => {
      const res = await request(app)
        .post('/api/keys')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ appId, name: 'Test Key', expiresInDays: 30 });
      
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('apiKey');
      expect(res.body.data.apiKey).toMatch(/^ak_/);
    });

    it('should reject without authentication', async () => {
      const res = await request(app)
        .post('/api/keys')
        .send({ appId, name: 'Test Key' });
      
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/keys', () => {
    it('should list user API keys', async () => {
      const res = await request(app)
        .get('/api/keys')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
