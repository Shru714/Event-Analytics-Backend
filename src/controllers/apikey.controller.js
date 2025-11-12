const { getPool } = require('../database/connection');
const { generateApiKey, hashApiKey, getApiKeyPrefix } = require('../utils/crypto');

async function createApiKey(req, res, next) {
  try {
    const { appId, name, expiresInDays } = req.body;
    const userId = req.user.userId;

    if (!appId) {
      return res.status(400).json({ success: false, error: 'App ID is required' });
    }

    const pool = getPool();

    const appResult = await pool.query('SELECT * FROM apps WHERE id = $1 AND user_id = $2', [appId, userId]);
    if (appResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'App not found or unauthorized' });
    }

    const apiKey = generateApiKey();
    const keyHash = hashApiKey(apiKey);
    const keyPrefix = getApiKeyPrefix(apiKey);

    let expiresAt = null;
    if (expiresInDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    }

    const result = await pool.query(
      `INSERT INTO api_keys (app_id, key_hash, key_prefix, name, expires_at) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, app_id, key_prefix, name, status, expires_at, created_at`,
      [appId, keyHash, keyPrefix, name, expiresAt]
    );

    res.status(201).json({
      success: true,
      data: {
        ...result.rows[0],
        apiKey
      },
      message: 'Store this API key securely. It will not be shown again.'
    });
  } catch (error) {
    next(error);
  }
}

async function listApiKeys(req, res, next) {
  try {
    const userId = req.user.userId;
    const { appId } = req.query;

    const pool = getPool();

    let query = `
      SELECT ak.id, ak.app_id, ak.key_prefix, ak.name, ak.status, 
             ak.expires_at, ak.last_used_at, ak.usage_count, ak.created_at,
             a.name as app_name
      FROM api_keys ak
      JOIN apps a ON ak.app_id = a.id
      WHERE a.user_id = $1
    `;
    const params = [userId];

    if (appId) {
      query += ' AND ak.app_id = $2';
      params.push(appId);
    }

    query += ' ORDER BY ak.created_at DESC';

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
}

async function getApiKey(req, res, next) {
  try {
    const { keyId } = req.params;
    const userId = req.user.userId;

    const pool = getPool();
    const result = await pool.query(
      `SELECT ak.*, a.name as app_name
       FROM api_keys ak
       JOIN apps a ON ak.app_id = a.id
       WHERE ak.id = $1 AND a.user_id = $2`,
      [keyId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'API key not found' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
}

async function regenerateApiKey(req, res, next) {
  try {
    const { keyId } = req.params;
    const userId = req.user.userId;

    const pool = getPool();

    const existingKey = await pool.query(
      `SELECT ak.*, a.user_id
       FROM api_keys ak
       JOIN apps a ON ak.app_id = a.id
       WHERE ak.id = $1 AND a.user_id = $2`,
      [keyId, userId]
    );

    if (existingKey.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'API key not found' });
    }

    await pool.query('UPDATE api_keys SET status = $1 WHERE id = $2', ['revoked', keyId]);

    const newApiKey = generateApiKey();
    const keyHash = hashApiKey(newApiKey);
    const keyPrefix = getApiKeyPrefix(newApiKey);

    const result = await pool.query(
      `INSERT INTO api_keys (app_id, key_hash, key_prefix, name, expires_at) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, app_id, key_prefix, name, status, expires_at, created_at`,
      [
        existingKey.rows[0].app_id,
        keyHash,
        keyPrefix,
        existingKey.rows[0].name,
        existingKey.rows[0].expires_at
      ]
    );

    res.json({
      success: true,
      data: {
        ...result.rows[0],
        apiKey: newApiKey
      },
      message: 'Store this API key securely. It will not be shown again.'
    });
  } catch (error) {
    next(error);
  }
}

async function revokeApiKey(req, res, next) {
  try {
    const { keyId } = req.params;
    const userId = req.user.userId;

    const pool = getPool();
    const result = await pool.query(
      `UPDATE api_keys ak
       SET status = 'revoked', updated_at = CURRENT_TIMESTAMP
       FROM apps a
       WHERE ak.app_id = a.id AND ak.id = $1 AND a.user_id = $2
       RETURNING ak.id`,
      [keyId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'API key not found' });
    }

    res.json({
      success: true,
      message: 'API key revoked successfully'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createApiKey,
  listApiKeys,
  getApiKey,
  regenerateApiKey,
  revokeApiKey
};
