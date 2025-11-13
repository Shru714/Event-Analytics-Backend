const redis = require('redis');

let redisClient;

async function connectRedis() {
  if (!process.env.REDIS_URL) {
    console.log('Redis not available, using memory store for rate limiting');
    return null;
  }

  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error', err);
      redisClient = null;
    });
    redisClient.on('connect', () => console.log('Redis connected'));

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.log('Redis not available, using memory store for rate limiting');
    redisClient = null;
    return null;
  }
}

function getRedisClient() {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
}

module.exports = { connectRedis, getRedisClient };
