const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const { getRedisClient } = require('../config/redis');

function createRateLimiter(options = {}) {
  const defaultOptions = {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests, please try again later' }
  };

  try {
    const redisClient = getRedisClient();
    return rateLimit({
      ...defaultOptions,
      ...options,
      store: new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args)
      })
    });
  } catch (error) {
    console.warn('Redis not available, using memory store for rate limiting');
    return rateLimit({ ...defaultOptions, ...options });
  }
}

const eventIngestionLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 1000,
  keyGenerator: (req) => req.apiKey?.app_id || req.ip
});

const analyticsLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 100
});

const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10
});

module.exports = { createRateLimiter, eventIngestionLimiter, analyticsLimiter, authLimiter };
