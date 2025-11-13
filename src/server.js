require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { connectDatabase } = require('./database/connection');
const { connectRedis } = require('./config/redis');

const authRoutes = require('./routes/auth.routes');
const eventRoutes = require('./routes/event.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const apiKeyRoutes = require('./routes/apikey.routes');

const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [System]
 *     summary: Health check
 *     description: Check if the API is running and healthy
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API root endpoint
/**
 * @swagger
 * /:
 *   get:
 *     tags: [System]
 *     summary: API information
 *     description: Get basic API information and available endpoints
 *     responses:
 *       200:
 *         description: API information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: Unified Event Analytics API
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 status:
 *                   type: string
 *                   example: running
 *                 documentation:
 *                   type: string
 *                   example: /api-docs
 *                 endpoints:
 *                   type: object
 *                   properties:
 *                     auth:
 *                       type: string
 *                       example: /api/auth
 *                     events:
 *                       type: string
 *                       example: /api/events
 *                     analytics:
 *                       type: string
 *                       example: /api/analytics
 *                     keys:
 *                       type: string
 *                       example: /api/keys
 */
app.get('/', (req, res) => {
  res.json({
    name: 'Unified Event Analytics API',
    version: '1.0.0',
    status: 'running',
    documentation: '/api-docs',
    endpoints: {
      auth: '/api/auth',
      events: '/api/events',
      analytics: '/api/analytics',
      keys: '/api/keys'
    }
  });
});

// Redirect common documentation URLs to the correct path
app.get('/docs', (req, res) => res.redirect('/api-docs'));
app.get('/DOCS', (req, res) => res.redirect('/api-docs'));
app.get('/documentation', (req, res) => res.redirect('/api-docs'));

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/keys', apiKeyRoutes);

app.use(errorHandler);

async function startServer() {
  try {
    await connectDatabase();
    await connectRedis();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
