const request = require('supertest');
const app = require('../src/server');

describe('Auth Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', name: 'Test User' });
      
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('token');
    });

    it('should reject duplicate email', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ email: 'duplicate@example.com', name: 'User 1' });
      
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'duplicate@example.com', name: 'User 2' });
      
      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login existing user', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ email: 'login@example.com', name: 'Login User' });
      
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@example.com' });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
    });

    it('should reject non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@example.com' });
      
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
