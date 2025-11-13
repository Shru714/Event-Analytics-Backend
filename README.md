# Unified Event Analytics Backend

A scalable backend API for Website and Mobile App Analytics Platform that collects, processes, and aggregates user events with high throughput and cloud deployment support.

## 🚀 Quick Start (5 Minutes)

**Easiest way to get started** - No Docker or local database required!

See [EASY_SETUP.md](EASY_SETUP.md) for step-by-step instructions using free cloud databases (Neon + Upstash).

**Or with Docker:**
```bash
npm install
docker-compose up -d
npm run migrate
npm start
```

**Windows without Docker?** See [WINDOWS_SETUP.md](WINDOWS_SETUP.md)

## Features

### API Key Management
- Unique API key generation for each registered app
- API key expiration, regeneration, and revocation support
- Secure authentication via request headers (X-API-Key)
- Google OAuth integration for app owner onboarding

### Event Data Collection
- High-availability endpoint for analytics event ingestion
- Support for clicks, page views, device data, and referrers
- Automatic user agent parsing (browser, OS, device detection)
- Bulk event ingestion with batch endpoint
- Structured metadata support with JSON fields

### Analytics & Reporting
- Event summaries with aggregation by type, time range, and app
- Unique user tracking and session analytics
- Device, browser, and OS breakdowns
- Timeline analytics with hourly/daily intervals
- User-level analytics with activity history
- Redis-based caching for frequently accessed queries

### Security & Rate Limiting
- API key-based authentication with HMAC hashing
- IP-based and API key-based rate limiting
- Distributed rate limiting using Redis
- Secure key storage (never expose raw keys after creation)
- HTTPS enforcement ready

### Containerization & Deployment
- Docker and Docker Compose setup
- PostgreSQL database with optimized indexes
- Redis caching layer
- Health check endpoint for monitoring
- Environment-based configuration
- Horizontal scaling support

## Architecture

### System Components

**Auth Service**: Handles user registration, Google OAuth, JWT token generation

**API Key Service**: Manages API key lifecycle (creation, validation, revocation, regeneration)

**Ingestion Service**: Receives and validates analytics events, processes user agent data

**Analytics Service**: Aggregates data and serves summaries with caching

### Data Flow
1. Client sends event with API key → Event Ingestion API validates key
2. Event data stored in PostgreSQL with parsed metadata
3. Cache invalidation triggers for affected analytics queries
4. Analytics endpoints query database or return cached results
5. Aggregations computed on-demand with Redis caching

### Database Schema

**users**: User accounts with Google OAuth support
**apps**: Applications registered by users
**api_keys**: Hashed API keys with expiration and usage tracking
**events**: All analytics events with full metadata
**event_aggregations**: Precomputed summaries (optional optimization)

### Indexes
- Composite indexes on (app_id, event_type, created_at)
- GIN index on JSONB metadata fields
- Indexes on user_id, session_id for fast lookups

## Setup Instructions

### Quick Start (Choose One)

**Option A: With Docker (Recommended)**
```bash
npm install
docker-compose up -d
npm run migrate
npm start
```

**Option B: Without Docker (Windows)**

See [WINDOWS_SETUP.md](WINDOWS_SETUP.md) for detailed instructions.

Quick steps:
1. Install PostgreSQL locally or use a cloud database (Neon, Supabase)
2. `npm install`
3. `copy .env.example .env` and configure DATABASE_URL
4. `npm run migrate`
5. `npm start`

### Prerequisites

**With Docker:**
- Node.js 18+
- Docker Desktop

**Without Docker:**
- Node.js 18+
- PostgreSQL 15+ (local or cloud)
- Redis (optional)

### Detailed Setup

1. **Clone and install**
```bash
git clone <repository-url>
cd unified-event-analytics-backend
npm install
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. **Start database services**

With Docker:
```bash
docker-compose up -d
```

Without Docker: See [WINDOWS_SETUP.md](WINDOWS_SETUP.md)

4. **Run migrations**
```bash
npm run migrate
```

5. **Start server**
```bash
npm start
# Or for development:
npm run dev
```

The API will be available at `http://localhost:3000`
API Documentation: `http://localhost:3000/api-docs`

### Troubleshooting

- **Database connection failed**: See [WINDOWS_SETUP.md](WINDOWS_SETUP.md)
- **Docker not installed**: See [WINDOWS_SETUP.md](WINDOWS_SETUP.md) for non-Docker setup
- **Port conflicts**: Change PORT in .env file

### Production Deployment

1. Build Docker image
```bash
docker build -t analytics-backend .
```

2. Deploy to cloud platform (Render, Railway, AWS ECS)
- Set environment variables
- Configure DATABASE_URL and REDIS_URL
- Expose port 3000
- Enable health checks at `/health`

### Environment Variables

See `.env.example` for all required configuration:
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: Secret for JWT token signing
- `API_KEY_SECRET`: Secret for API key hashing
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `RATE_LIMIT_*`: Rate limiting configuration
- `CACHE_TTL`: Cache time-to-live in seconds

## API Documentation

### Authentication Endpoints

**POST /api/auth/register** - Register new user
**POST /api/auth/login** - Login user
**GET /api/auth/google** - Initiate Google OAuth
**GET /api/auth/google/callback** - Google OAuth callback

### API Key Management (Requires JWT)

**POST /api/keys** - Create new API key
**GET /api/keys** - List all API keys
**GET /api/keys/:keyId** - Get API key details
**POST /api/keys/:keyId/regenerate** - Regenerate API key
**DELETE /api/keys/:keyId** - Revoke API key

### Event Ingestion (Requires API Key)

**POST /api/events/track** - Track single event
```json
{
  "eventType": "page_view",
  "userId": "user123",
  "sessionId": "session456",
  "url": "https://example.com/page",
  "referrer": "https://google.com",
  "screenWidth": 1920,
  "screenHeight": 1080,
  "metadata": { "custom": "data" }
}
```

**POST /api/events/track/batch** - Track multiple events (max 100)
```json
{
  "events": [
    { "eventType": "click", "userId": "user123", ... },
    { "eventType": "scroll", "userId": "user123", ... }
  ]
}
```

### Analytics Endpoints (Requires JWT)

**GET /api/analytics/events/summary** - Get event summary
Query params: `appId`, `eventType`, `startDate`, `endDate`

**GET /api/analytics/events/timeline** - Get event timeline
Query params: `appId`, `eventType`, `startDate`, `endDate`, `interval` (hour/day)

**GET /api/analytics/users/:userId** - Get user analytics
Query params: `appId`

**GET /api/analytics/apps/:appId/overview** - Get app overview

## Testing

Run tests with coverage:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

### Test Coverage
- Unit tests for crypto utilities, user agent parsing
- Integration tests for all API endpoints
- API key validation and expiration tests
- Event ingestion and batch processing tests
- Analytics aggregation accuracy tests
- Rate limiting behavior tests

## Performance Optimizations

### Caching Strategy
- Redis caching for analytics queries with configurable TTL
- Cache keys generated from query parameters
- Automatic cache invalidation on new events
- HyperLogLog for approximate unique user counts (future)

### Database Optimizations
- Composite indexes for common query patterns
- GIN indexes for JSONB metadata searches
- Connection pooling with configurable limits
- Prepared statements for frequent queries

### Scalability
- Horizontal scaling via Docker containers
- Stateless API design for load balancing
- Redis-based distributed rate limiting
- Asynchronous event processing ready (message queue integration)
- Database partitioning by date/app_id (future)

## Security Considerations

- API keys hashed with HMAC-SHA256
- JWT tokens for user authentication
- Rate limiting on all endpoints
- Helmet.js for security headers
- CORS configuration
- Input validation and sanitization
- SQL injection prevention via parameterized queries
- No raw API keys stored or logged

## Monitoring & Logging

- Health check endpoint: `GET /health`
- Morgan HTTP request logging
- Database connection error handling
- Redis connection monitoring
- Rate limit tracking
- API key usage statistics

## Challenges & Solutions

**Challenge**: High-volume event ingestion
**Solution**: Batch endpoint, connection pooling, async processing ready

**Challenge**: Fast analytics queries on large datasets
**Solution**: Redis caching, database indexes, precomputed aggregations

**Challenge**: API key security
**Solution**: HMAC hashing, prefix-only display, automatic expiration

**Challenge**: Rate limiting in distributed environment
**Solution**: Redis-based distributed rate limiter

**Challenge**: User agent parsing accuracy
**Solution**: useragent library with fallback handling

## Future Enhancements

- Message queue integration (RabbitMQ/Kafka) for async event processing
- Real-time analytics with WebSocket support
- Machine learning-based anomaly detection
- Geographic analytics with IP geolocation
- Custom dashboard builder
- Data export functionality (CSV, JSON)
- Webhook notifications for events
- Multi-tenancy with organization support

## License

MIT

## Support

For issues and questions, please open a GitHub issue.
