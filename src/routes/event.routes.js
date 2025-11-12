const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const { authenticateApiKey } = require('../middleware/apiKeyAuth');
const { eventIngestionLimiter } = require('../middleware/rateLimiter');

router.post('/track', authenticateApiKey, eventIngestionLimiter, eventController.trackEvent);
router.post('/track/batch', authenticateApiKey, eventIngestionLimiter, eventController.trackBatchEvents);

module.exports = router;
