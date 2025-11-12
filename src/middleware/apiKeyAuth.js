const { getPool } = require('../database/connection');
const { hashApiKey } = require('../utils/crypto');

async function authenticateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ success: false, error: 'API key required' });
  }

  try {
    const keyHash = hashApiKey(apiKey);
    const pool = getPool();

    const result = await pool.query(
      `SELECT ak.*, a.id as app_id, a.user_id 
       FROM api_keys ak 
       JOIN apps a ON ak.app_id = a.id 
       WHERE ak.key_hash = $1 AND ak.status = 'active'`,
      [keyHash]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid or inactive API key' });
    }

    const apiKeyData = result.rows[0];

    if (apiKeyData.expires_at && new Date(apiKeyData.expires_at) < new Date()) {
      await pool.query(
        `UPDATE api_keys SET status = 'expired' WHERE id = $1`,
        [apiKeyData.id]
      );
      return res.status(401).json({ success: false, error: 'API key has expired' });
    }

    await pool.query(
      `UPDATE api_keys SET last_used_at = CURRENT_TIMESTAMP, usage_count = usage_count + 1 WHERE id = $1`,
      [apiKeyData.id]
    );

    req.apiKey = apiKeyData;
    req.appId = apiKeyData.app_id;
    next();
  } catch (error) {
    console.error('API key authentication error:', error);
    return res.status(500).json({ success: false, error: 'Authentication failed' });
  }
}

module.exports = { authenticateApiKey };
