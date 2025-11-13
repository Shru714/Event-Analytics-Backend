const express = require('express');
const router = express.Router();
const apiKeyController = require('../controllers/apikey.controller');
const { authenticateUser } = require('../middleware/auth');

router.use(authenticateUser);

/**
 * @swagger
 * /api/keys:
 *   post:
 *     tags: [API Keys]
 *     summary: Create new API key
 *     description: Generate a new API key for event tracking
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: My App API Key
 *                 description: Descriptive name for the API key
 *     responses:
 *       201:
 *         description: API key created successfully
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
 *                   example: API key created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     apiKey:
 *                       $ref: '#/components/schemas/ApiKey'
 *                     key:
 *                       type: string
 *                       description: Full API key (only shown once)
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   get:
 *     tags: [API Keys]
 *     summary: List user API keys
 *     description: Get all API keys for the authenticated user
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: API keys retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ApiKey'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/', apiKeyController.createApiKey);
router.get('/', apiKeyController.listApiKeys);

/**
 * @swagger
 * /api/keys/{keyId}:
 *   get:
 *     tags: [API Keys]
 *     summary: Get API key details
 *     description: Get details of a specific API key
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: keyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: API key ID
 *     responses:
 *       200:
 *         description: API key details retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ApiKey'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   delete:
 *     tags: [API Keys]
 *     summary: Revoke API key
 *     description: Permanently revoke an API key
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: keyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: API key ID
 *     responses:
 *       200:
 *         description: API key revoked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:keyId', apiKeyController.getApiKey);
router.delete('/:keyId', apiKeyController.revokeApiKey);

/**
 * @swagger
 * /api/keys/{keyId}/regenerate:
 *   post:
 *     tags: [API Keys]
 *     summary: Regenerate API key
 *     description: Generate a new key value for an existing API key
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: keyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: API key ID
 *     responses:
 *       200:
 *         description: API key regenerated successfully
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
 *                   example: API key regenerated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     key:
 *                       type: string
 *                       description: New API key value
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post('/:keyId/regenerate', apiKeyController.regenerateApiKey);

module.exports = router;
