const { getPool } = require('../database/connection');
const { parseUserAgent } = require('../utils/userAgent');
const { invalidatePattern } = require('../utils/cache');

async function trackEvent(req, res, next) {
  try {
    const { eventType, userId, sessionId, url, referrer, metadata, screenWidth, screenHeight } = req.body;
    const appId = req.appId;

    if (!eventType) {
      return res.status(400).json({ success: false, error: 'Event type is required' });
    }

    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.connection.remoteAddress;
    const { browser, os, device } = parseUserAgent(userAgent);

    const pool = getPool();
    await pool.query(
      `INSERT INTO events (app_id, event_type, user_id, session_id, url, referrer, 
       ip_address, user_agent, browser, os, device, screen_width, screen_height, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [appId, eventType, userId, sessionId, url, referrer, ipAddress, userAgent, 
       browser, os, device, screenWidth, screenHeight, metadata ? JSON.stringify(metadata) : null]
    );

    await invalidatePattern(`analytics:${appId}:*`);

    res.status(201).json({ success: true, message: 'Event tracked successfully' });
  } catch (error) {
    next(error);
  }
}

async function trackBatchEvents(req, res, next) {
  try {
    const { events } = req.body;
    const appId = req.appId;

    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ success: false, error: 'Events array is required' });
    }

    if (events.length > 100) {
      return res.status(400).json({ success: false, error: 'Maximum 100 events per batch' });
    }

    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.connection.remoteAddress;
    const { browser, os, device } = parseUserAgent(userAgent);

    const pool = getPool();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      for (const event of events) {
        if (!event.eventType) continue;

        await client.query(
          `INSERT INTO events (app_id, event_type, user_id, session_id, url, referrer, 
           ip_address, user_agent, browser, os, device, screen_width, screen_height, metadata)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
          [appId, event.eventType, event.userId, event.sessionId, event.url, event.referrer,
           ipAddress, userAgent, browser, os, device, event.screenWidth, event.screenHeight,
           event.metadata ? JSON.stringify(event.metadata) : null]
        );
      }

      await client.query('COMMIT');
      await invalidatePattern(`analytics:${appId}:*`);

      res.status(201).json({ success: true, message: `${events.length} events tracked successfully` });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
}

module.exports = { trackEvent, trackBatchEvents };
