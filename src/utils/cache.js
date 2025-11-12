const { getRedisClient } = require('../config/redis');

const DEFAULT_TTL = parseInt(process.env.CACHE_TTL) || 3600;

async function getCached(key) {
  try {
    const redis = getRedisClient();
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

async function setCached(key, value, ttl = DEFAULT_TTL) {
  try {
    const redis = getRedisClient();
    await redis.setEx(key, ttl, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Cache set error:', error);
    return false;
  }
}

async function deleteCached(key) {
  try {
    const redis = getRedisClient();
    await redis.del(key);
    return true;
  } catch (error) {
    console.error('Cache delete error:', error);
    return false;
  }
}

async function invalidatePattern(pattern) {
  try {
    const redis = getRedisClient();
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(keys);
    }
    return true;
  } catch (error) {
    console.error('Cache invalidate error:', error);
    return false;
  }
}

function generateCacheKey(prefix, params) {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join(':');
  return `${prefix}:${sortedParams}`;
}

module.exports = {
  getCached,
  setCached,
  deleteCached,
  invalidatePattern,
  generateCacheKey
};
