const crypto = require('crypto');
const bcrypt = require('bcrypt');

function generateApiKey() {
  const key = crypto.randomBytes(32).toString('hex');
  return `ak_${key}`;
}

function hashApiKey(apiKey) {
  return crypto
    .createHmac('sha256', process.env.API_KEY_SECRET)
    .update(apiKey)
    .digest('hex');
}

function getApiKeyPrefix(apiKey) {
  return apiKey.substring(0, 12);
}

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

module.exports = {
  generateApiKey,
  hashApiKey,
  getApiKeyPrefix,
  hashPassword,
  comparePassword
};
