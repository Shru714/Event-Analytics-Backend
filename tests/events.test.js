const request = require('supertest');
const app = require('../src/server');

describe('Event Tracking', () => {
  let apiKey;

  beforeAll(async () => {
    const authRes = await request(app)
      .post('/api/auth/register')
      .send({ email: 'events@example.com', name: 'Events User' });
  });

  describe('POST /api/events/track', () => {
    it('should track single event with valid API key', async () => {
      const res = await request(app)
        .post('/api/events/track')
        .set('X-API-Key', apiKey)
        .send({
          eventType: 'page_view',
          userId: 'user123',
          url: 'https://example.com',
          screenWidth: 1920,
          screenHeight: 1080
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should reject without API key', async () => {
      const res = await request(app)
        .post('/api/events/track')
        .send({ eventType: 'click' });
      
      expect(res.statusCode).toBe(401);
    });

    it('should reject invalid event type', async () => {
      const res = await request(app)
        .post('/api/events/track')
        .set('X-API-Key', apiKey)
        .send({});
      
      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/events/track/batch', () => {
    it('should track multiple events', async () => {
      const res = await request(app)
        .post('/api/events/track/batch')
        .set('X-API-Key', apiKey)
        .send({
          events: [
            { eventType: 'click', userId: 'user123' },
            { eventType: 'scroll', userId: 'user123' }
          ]
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should reject batch over 100 events', async () => {
      const events = Array(101).fill({ eventType: 'test' });
      const res = await request(app)
        .post('/api/events/track/batch')
        .set('X-API-Key', apiKey)
        .send({ events });
      
      expect(res.statusCode).toBe(400);
    });
  });
});
