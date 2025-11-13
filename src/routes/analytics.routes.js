const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticateUser } = require('../middleware/auth');
const { analyticsLimiter } = require('../middleware/rateLimiter');

router.use(authenticateUser);
router.use(analyticsLimiter);

/**
 * @swagger
 * /api/analytics/events/summary:
 *   get:
 *     tags: [Analytics]
 *     summary: Get events summary
 *     description: Get aggregated summary of events with counts by type
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: app_id
 *         schema:
 *           type: string
 *         description: Filter by specific app ID
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Events summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_events:
 *                       type: integer
 *                       example: 1250
 *                     event_types:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           event_type:
 *                             type: string
 *                             example: page_view
 *                           count:
 *                             type: integer
 *                             example: 850
 *                     date_range:
 *                       type: object
 *                       properties:
 *                         start_date:
 *                           type: string
 *                           format: date
 *                         end_date:
 *                           type: string
 *                           format: date
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/events/summary', analyticsController.getEventSummary);

/**
 * @swagger
 * /api/analytics/events/timeline:
 *   get:
 *     tags: [Analytics]
 *     summary: Get events timeline
 *     description: Get time-series data of events over a specified period
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: app_id
 *         schema:
 *           type: string
 *         description: Filter by specific app ID
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for timeline (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for timeline (YYYY-MM-DD)
 *       - in: query
 *         name: granularity
 *         schema:
 *           type: string
 *           enum: [hour, day, week, month]
 *           default: day
 *         description: Time granularity for grouping
 *     responses:
 *       200:
 *         description: Events timeline retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     timeline:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date-time
 *                           count:
 *                             type: integer
 *                           event_type:
 *                             type: string
 *                     granularity:
 *                       type: string
 *                       example: day
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/events/timeline', analyticsController.getEventTimeline);

/**
 * @swagger
 * /api/analytics/users/{userId}:
 *   get:
 *     tags: [Analytics]
 *     summary: Get user analytics
 *     description: Get analytics data for a specific user
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to analyze
 *       - in: query
 *         name: app_id
 *         schema:
 *           type: string
 *         description: Filter by specific app ID
 *     responses:
 *       200:
 *         description: User analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: string
 *                       example: user123
 *                     total_events:
 *                       type: integer
 *                       example: 45
 *                     first_seen:
 *                       type: string
 *                       format: date-time
 *                     last_seen:
 *                       type: string
 *                       format: date-time
 *                     event_breakdown:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           event_type:
 *                             type: string
 *                           count:
 *                             type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/users/:userId', analyticsController.getUserAnalytics);

/**
 * @swagger
 * /api/analytics/apps/{appId}/overview:
 *   get:
 *     tags: [Analytics]
 *     summary: Get app overview
 *     description: Get comprehensive analytics overview for a specific app
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appId
 *         required: true
 *         schema:
 *           type: string
 *         description: App ID to analyze
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for analysis (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for analysis (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: App overview retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     app_id:
 *                       type: string
 *                       example: my-website
 *                     total_events:
 *                       type: integer
 *                       example: 2500
 *                     unique_users:
 *                       type: integer
 *                       example: 150
 *                     unique_sessions:
 *                       type: integer
 *                       example: 300
 *                     top_events:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           event_type:
 *                             type: string
 *                           count:
 *                             type: integer
 *                     date_range:
 *                       type: object
 *                       properties:
 *                         start_date:
 *                           type: string
 *                           format: date
 *                         end_date:
 *                           type: string
 *                           format: date
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/apps/:appId/overview', analyticsController.getAppOverview);

module.exports = router;
