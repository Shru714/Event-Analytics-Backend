const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const { authenticateApiKey } = require('../middleware/apiKeyAuth');
const { eventIngestionLimiter } = require('../middleware/rateLimiter');

/**
 * @swagger
 * /api/events/track:
 *   post:
 *     tags: [Events]
 *     summary: Track single event
 *     description: Track a single analytics event
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *           examples:
 *             page_view:
 *               summary: Page view event
 *               value:
 *                 event_type: page_view
 *                 app_id: my-website
 *                 user_id: user123
 *                 session_id: session456
 *                 properties:
 *                   page_url: "/dashboard"
 *                   page_title: "Dashboard"
 *                   referrer: "https://google.com"
 *             purchase:
 *               summary: Purchase event
 *               value:
 *                 event_type: purchase
 *                 app_id: my-ecommerce
 *                 user_id: user123
 *                 session_id: session456
 *                 properties:
 *                   product_id: "prod_123"
 *                   amount: 29.99
 *                   currency: "USD"
 *             custom:
 *               summary: Custom event
 *               value:
 *                 event_type: custom
 *                 app_id: my-app
 *                 properties:
 *                   custom_field: "custom_value"
 *                   metric: 42
 *     responses:
 *       201:
 *         description: Event tracked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Event tracked successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     event_id:
 *                       type: string
 *                       format: uuid
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/track', authenticateApiKey, eventIngestionLimiter, eventController.trackEvent);

/**
 * @swagger
 * /api/events/track/batch:
 *   post:
 *     tags: [Events]
 *     summary: Track multiple events
 *     description: Track multiple analytics events in a single request (max 100 events)
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - events
 *             properties:
 *               events:
 *                 type: array
 *                 maxItems: 100
 *                 items:
 *                   $ref: '#/components/schemas/Event'
 *           example:
 *             events:
 *               - event_type: page_view
 *                 app_id: my-website
 *                 user_id: user123
 *                 session_id: session456
 *                 properties:
 *                   page_url: "/home"
 *               - event_type: click
 *                 app_id: my-website
 *                 user_id: user123
 *                 session_id: session456
 *                 properties:
 *                   element: "signup-button"
 *                   page_url: "/home"
 *     responses:
 *       201:
 *         description: Events tracked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Batch events tracked successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     processed_count:
 *                       type: integer
 *                       example: 2
 *                     event_ids:
 *                       type: array
 *                       items:
 *                         type: string
 *                         format: uuid
 *       400:
 *         description: Validation error or batch too large
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       429:
 *         description: Rate limit exceeded
 */
router.post('/track/batch', authenticateApiKey, eventIngestionLimiter, eventController.trackBatchEvents);

module.exports = router;
