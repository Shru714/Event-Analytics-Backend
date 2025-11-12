const { getPool } = require('../database/connection');
const { getCached, setCached, generateCacheKey } = require('../utils/cache');

async function getEventSummary(req, res, next) {
  try {
    const userId = req.user.userId;
    const { appId, eventType, startDate, endDate } = req.query;

    const cacheKey = generateCacheKey('analytics:summary', { userId, appId, eventType, startDate, endDate });
    const cached = await getCached(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    const pool = getPool();
    let query = `
      SELECT 
        e.event_type,
        COUNT(*) as total_events,
        COUNT(DISTINCT e.user_id) as unique_users,
        COUNT(DISTINCT e.session_id) as unique_sessions,
        jsonb_object_agg(COALESCE(e.device, 'Unknown'), device_count) as device_breakdown,
        jsonb_object_agg(COALESCE(e.browser, 'Unknown'), browser_count) as browser_breakdown,
        jsonb_object_agg(COALESCE(e.os, 'Unknown'), os_count) as os_breakdown
      FROM events e
      JOIN apps a ON e.app_id = a.id
      WHERE a.user_id = $1
    `;
    const params = [userId];
    let paramIndex = 2;

    if (appId) {
      query += ` AND e.app_id = $${paramIndex}`;
      params.push(appId);
      paramIndex++;
    }

    if (eventType) {
      query += ` AND e.event_type = $${paramIndex}`;
      params.push(eventType);
      paramIndex++;
    }

    if (startDate) {
      query += ` AND e.created_at >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND e.created_at <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    query += ` GROUP BY e.event_type`;

    const deviceQuery = query.replace('jsonb_object_agg(COALESCE(e.device', 'COUNT(*) as device_count FROM (SELECT e.device FROM events e JOIN apps a ON e.app_id = a.id WHERE a.user_id = $1');
    const browserQuery = query.replace('jsonb_object_agg(COALESCE(e.browser', 'COUNT(*) as browser_count FROM (SELECT e.browser FROM events e JOIN apps a ON e.app_id = a.id WHERE a.user_id = $1');
    const osQuery = query.replace('jsonb_object_agg(COALESCE(e.os', 'COUNT(*) as os_count FROM (SELECT e.os FROM events e JOIN apps a ON e.app_id = a.id WHERE a.user_id = $1');

    const result = await pool.query(query, params);

    await setCached(cacheKey, result.rows);

    res.json({ success: true, data: result.rows, cached: false });
  } catch (error) {
    next(error);
  }
}

async function getEventTimeline(req, res, next) {
  try {
    const userId = req.user.userId;
    const { appId, eventType, startDate, endDate, interval = 'day' } = req.query;

    const cacheKey = generateCacheKey('analytics:timeline', { userId, appId, eventType, startDate, endDate, interval });
    const cached = await getCached(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    const pool = getPool();
    const dateFormat = interval === 'hour' ? 'YYYY-MM-DD HH24:00:00' : 'YYYY-MM-DD';
    
    let query = `
      SELECT 
        TO_CHAR(e.created_at, '${dateFormat}') as time_bucket,
        COUNT(*) as event_count,
        COUNT(DISTINCT e.user_id) as unique_users
      FROM events e
      JOIN apps a ON e.app_id = a.id
      WHERE a.user_id = $1
    `;
    const params = [userId];
    let paramIndex = 2;

    if (appId) {
      query += ` AND e.app_id = $${paramIndex}`;
      params.push(appId);
      paramIndex++;
    }

    if (eventType) {
      query += ` AND e.event_type = $${paramIndex}`;
      params.push(eventType);
      paramIndex++;
    }

    if (startDate) {
      query += ` AND e.created_at >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND e.created_at <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    query += ` GROUP BY time_bucket ORDER BY time_bucket`;

    const result = await pool.query(query, params);

    await setCached(cacheKey, result.rows);

    res.json({ success: true, data: result.rows, cached: false });
  } catch (error) {
    next(error);
  }
}

async function getUserAnalytics(req, res, next) {
  try {
    const { userId: targetUserId } = req.params;
    const userId = req.user.userId;
    const { appId } = req.query;

    const cacheKey = generateCacheKey('analytics:user', { userId, targetUserId, appId });
    const cached = await getCached(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    const pool = getPool();
    
    let query = `
      SELECT 
        COUNT(*) as total_events,
        COUNT(DISTINCT e.event_type) as unique_event_types,
        COUNT(DISTINCT e.session_id) as total_sessions,
        MAX(e.created_at) as last_seen,
        MIN(e.created_at) as first_seen,
        MODE() WITHIN GROUP (ORDER BY e.device) as primary_device,
        MODE() WITHIN GROUP (ORDER BY e.browser) as primary_browser,
        MODE() WITHIN GROUP (ORDER BY e.os) as primary_os
      FROM events e
      JOIN apps a ON e.app_id = a.id
      WHERE a.user_id = $1 AND e.user_id = $2
    `;
    const params = [userId, targetUserId];

    if (appId) {
      query += ` AND e.app_id = $3`;
      params.push(appId);
    }

    const summaryResult = await pool.query(query, params);

    let recentQuery = `
      SELECT event_type, url, created_at, device, browser
      FROM events e
      JOIN apps a ON e.app_id = a.id
      WHERE a.user_id = $1 AND e.user_id = $2
    `;
    const recentParams = [userId, targetUserId];

    if (appId) {
      recentQuery += ` AND e.app_id = $3`;
      recentParams.push(appId);
    }

    recentQuery += ` ORDER BY created_at DESC LIMIT 10`;

    const recentResult = await pool.query(recentQuery, recentParams);

    const data = {
      summary: summaryResult.rows[0],
      recentEvents: recentResult.rows
    };

    await setCached(cacheKey, data);

    res.json({ success: true, data, cached: false });
  } catch (error) {
    next(error);
  }
}

async function getAppOverview(req, res, next) {
  try {
    const { appId } = req.params;
    const userId = req.user.userId;

    const cacheKey = generateCacheKey('analytics:app-overview', { userId, appId });
    const cached = await getCached(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    const pool = getPool();

    const appResult = await pool.query('SELECT * FROM apps WHERE id = $1 AND user_id = $2', [appId, userId]);
    if (appResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'App not found' });
    }

    const statsQuery = `
      SELECT 
        COUNT(*) as total_events,
        COUNT(DISTINCT user_id) as total_users,
        COUNT(DISTINCT session_id) as total_sessions,
        COUNT(DISTINCT event_type) as unique_event_types
      FROM events
      WHERE app_id = $1
    `;
    const statsResult = await pool.query(statsQuery, [appId]);

    const topEventsQuery = `
      SELECT event_type, COUNT(*) as count
      FROM events
      WHERE app_id = $1
      GROUP BY event_type
      ORDER BY count DESC
      LIMIT 10
    `;
    const topEventsResult = await pool.query(topEventsQuery, [appId]);

    const data = {
      app: appResult.rows[0],
      stats: statsResult.rows[0],
      topEvents: topEventsResult.rows
    };

    await setCached(cacheKey, data);

    res.json({ success: true, data, cached: false });
  } catch (error) {
    next(error);
  }
}

module.exports = { getEventSummary, getEventTimeline, getUserAnalytics, getAppOverview };
