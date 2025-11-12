const express = require('express');
const router = express.Router();
const apiKeyController = require('../controllers/apikey.controller');
const { authenticateUser } = require('../middleware/auth');

router.use(authenticateUser);

router.post('/', apiKeyController.createApiKey);
router.get('/', apiKeyController.listApiKeys);
router.get('/:keyId', apiKeyController.getApiKey);
router.post('/:keyId/regenerate', apiKeyController.regenerateApiKey);
router.delete('/:keyId', apiKeyController.revokeApiKey);

module.exports = router;
