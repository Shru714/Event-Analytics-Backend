const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticateUser } = require('../middleware/auth');
const { analyticsLimiter } = require('../middleware/rateLimiter');

router.use(authenticateUser);
router.use(analyticsLimiter);

router.get('/events/summary', analyticsController.getEventSummary);
router.get('/events/timeline', analyticsController.getEventTimeline);
router.get('/users/:userId', analyticsController.getUserAnalytics);
router.get('/apps/:appId/overview', analyticsController.getAppOverview);

module.exports = router;
