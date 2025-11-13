const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Unified Event Analytics API',
      version: '1.0.0',
      description: `
# Unified Event Analytics API

A scalable backend API for Website and Mobile App Analytics Platform.

## Features
- 🔐 JWT Authentication & API Key Management
- 📊 Real-time Event Tracking
- 📈 Analytics & Reporting
- 🚀 High Performance with Redis Caching
- 📱 Mobile & Web App Support

## Quick Start
1. Register a user account via \`/api/auth/register\`
2. Create an API key via \`/api/keys\`
3. Start tracking events via \`/api/events/track\`
4. View analytics via \`/api/analytics/*\` endpoints

## Rate Limiting
- Authentication endpoints: 5 requests per 15 minutes
- Event tracking: 1000 requests per 15 minutes
- Analytics: 100 requests per 15 minutes
      `,
      contact: {
        name: 'API Support',
        email: 'support@analytics.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://your-app.onrender.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API Key for event tracking and analytics access'
        },
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token for authenticated user operations'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        ApiKey: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            key_preview: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
            last_used: { type: 'string', format: 'date-time' }
          }
        },
        Event: {
          type: 'object',
          properties: {
            event_type: { 
              type: 'string',
              enum: ['page_view', 'click', 'form_submit', 'purchase', 'signup', 'login', 'custom'],
              description: 'Type of event being tracked'
            },
            app_id: { type: 'string', description: 'Application identifier' },
            user_id: { type: 'string', description: 'User identifier (optional)' },
            session_id: { type: 'string', description: 'Session identifier' },
            properties: { 
              type: 'object',
              description: 'Custom event properties',
              additionalProperties: true
            },
            timestamp: { type: 'string', format: 'date-time' }
          },
          required: ['event_type', 'app_id']
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            error: { type: 'string' }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication information is missing or invalid',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        ValidationError: {
          description: 'Validation error in request data',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User registration and login operations'
      },
      {
        name: 'API Keys',
        description: 'API key management for event tracking'
      },
      {
        name: 'Events',
        description: 'Event tracking and management'
      },
      {
        name: 'Analytics',
        description: 'Analytics and reporting endpoints'
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js']
};

module.exports = swaggerJsdoc(options);
