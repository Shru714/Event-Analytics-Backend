# Unified Event Analytics Engine - Technical Architecture

## System Overview

The Unified Event Analytics Engine is a production-grade backend system designed to handle high-volume event tracking and analytics for web and mobile applications. The architecture prioritizes scalability, performance, and security.

## Architecture Layers

### 1. API Layer (Express.js)
- RESTful API endpoints with OpenAPI/Swagger documentation
- Middleware stack: Helmet (security), CORS, Morgan (logging)
- Rate limiting with Redis-backed distributed limiter
- JWT-based user authentication
- API key-based client authentication

### 2. Service Layer
Three primary service modules:

**Auth Service**
- User registration and login
- Google OAuth 2.0 integration
- JWT token generation and validation
- Session management

**API Key Service**
- API key generation with cryptographic randomness
- HMAC-SHA256 key hashing for secure storage
- Key lifecycle management (creation, expiration, revocation, regeneration)
- Usage tracking and statistics

**Event Ingestion Service**
- Single and batch event processing
- User agent parsing for device/browser/OS detection
- IP address capture and geolocation ready
- Metadata validation and storage
- Asynchronous processing ready (queue integration point)

**Analytics Service**
- Real-time and historical data aggregation
- Multi-dimensional analytics (time, event type, user, device)
- Caching layer for performance optimization
- Precomputed aggregations support

### 3. Data Layer

**PostgreSQL Database**
- Primary data store for all persistent data
- Connection pooling (max 20 connections)
- Optimized schema with strategic indexes
- JSONB support for flexible metadata

**Redis Cache**
- Query result caching with configurable TTL
- Distributed rate limiting state
- Session storage
- Cache invalidation on data mutations

## Data Flow Architecture

### Event Ingestion Flow
```
Client App → API Gateway → Rate Limiter → API Key Auth → Event Controller
→ User Agent Parser → Database Insert → Cache Invalidation → Response
```

### Analytics Query Flow
```
User Request → JWT Auth → Rate Limiter → Analytics Controller
→ Cache Check → [Cache Hit: Return] OR [Cache Miss: DB Query → Cache Set → Return]
```

### API Key Lifecycle
```
User Creates Key → Generate Random Key → Hash with HMAC → Store Hash + Prefix
→ Return Raw Key (one-time only) → Client Uses Key → Validate Hash → Track Usage
```

## Database Schema Design

### Tables

**users**
- id (UUID, PK)
- email (VARCHAR, UNIQUE)
- google_id (VARCHAR, UNIQUE, nullable)
- name (VARCHAR)
- created_at, updated_at (TIMESTAMP)

**apps**
- id (UUID, PK)
- user_id (UUID, FK → users)
- name (VARCHAR)
- description (TEXT)
- domain (VARCHAR)
- created_at, updated_at (TIMESTAMP)

**api_keys**
- id (UUID, PK)
- app_id (UUID, FK → apps)
- key_hash (VARCHAR, UNIQUE) - HMAC-SHA256 hash
- key_prefix (VARCHAR) - First 12 chars for display
- name (VARCHAR)
- status (ENUM: active, revoked, expired)
- expires_at (TIMESTAMP, nullable)
- last_used_at (TIMESTAMP)
- usage_count (BIGINT)
- created_at, updated_at (TIMESTAMP)

**events**
- id (UUID, PK)
- app_id (UUID, FK → apps)
- event_type (VARCHAR) - click, page_view, etc.
- user_id (VARCHAR) - Client-provided user identifier
- session_id (VARCHAR)
- url (TEXT)
- referrer (TEXT)
- ip_address (INET)
- user_agent (TEXT)
- browser (VARCHAR) - Parsed from user agent
- os (VARCHAR) - Parsed from user agent
- device (VARCHAR) - Parsed from user agent
- screen_width, screen_height (INTEGER)
- metadata (JSONB) - Flexible custom data
- created_at (TIMESTAMP)

**event_aggregations** (Optional optimization)
- id (UUID, PK)
- app_id (UUID, FK → apps)
- event_type (VARCHAR)
- aggregation_date (DATE)
- aggregation_hour (INTEGER, 0-23)
- total_events (BIGINT)
- unique_users (BIGINT)
- device_breakdown (JSONB)
- browser_breakdown (JSONB)
- os_breakdown (JSONB)
- created_at, updated_at (TIMESTAMP)
- UNIQUE constraint on (app_id, event_type, aggregation_date, aggregation_hour)

### Index Strategy

**Performance Indexes**
- `idx_events_app_id` - Fast filtering by application
- `idx_events_event_type` - Event type queries
- `idx_events_created_at` - Time-based queries
- `idx_events_app_event_time` - Composite for common query pattern
- `idx_events_user_id` - User-specific analytics
- `idx_events_session_id` - Session tracking
- `idx_events_metadata` - GIN index for JSONB queries

**Lookup Indexes**
- `idx_api_keys_key_hash` - Fast API key validation
- `idx_api_keys_app_id` - List keys by app
- `idx_apps_user_id` - User's apps lookup

## Caching Strategy

### Cache Key Structure
```
analytics:summary:{userId}:{appId}:{eventType}:{startDate}:{endDate}
analytics:timeline:{userId}:{appId}:{eventType}:{startDate}:{endDate}:{interval}
analytics:user:{userId}:{targetUserId}:{appId}
analytics:app-overview:{userId}:{appId}
```

### Cache Invalidation
- Pattern-based invalidation on new events: `analytics:{appId}:*`
- TTL-based expiration (default 3600 seconds)
- Manual invalidation on data mutations

### Cache Optimization Techniques
- Serialized JSON storage in Redis
- Parameterized cache key generation
- Conditional caching (only cache successful queries)
- Future: HyperLogLog for approximate unique counts

## Security Architecture

### Authentication & Authorization
- **User Auth**: JWT tokens with 7-day expiration
- **Client Auth**: API keys with HMAC-SHA256 hashing
- **OAuth**: Google OAuth 2.0 for user onboarding

### API Key Security
- Keys generated with crypto.randomBytes (32 bytes)
- Stored as HMAC-SHA256 hash (never plaintext)
- Only prefix (12 chars) displayed after creation
- Automatic expiration and revocation support
- Usage tracking for anomaly detection

### Rate Limiting
- Redis-backed distributed rate limiter
- Per-endpoint limits:
  - Event ingestion: 1000 req/min per API key
  - Analytics: 100 req/min per user
  - Auth: 10 req/15min per IP
- Configurable via environment variables

### Additional Security
- Helmet.js security headers
- CORS configuration
- Input validation and sanitization
- Parameterized SQL queries (SQL injection prevention)
- No sensitive data in logs

## Scalability Considerations

### Horizontal Scaling
- Stateless API design (no in-memory sessions)
- Redis for shared state (rate limits, cache)
- Database connection pooling
- Load balancer ready

### Database Optimization
- Connection pooling (20 max connections)
- Prepared statements for frequent queries
- Composite indexes for common patterns
- Future: Table partitioning by date/app_id

### Async Processing (Future)
- Message queue integration point (RabbitMQ/Kafka)
- Decouple event ingestion from processing
- Background aggregation jobs
- Batch processing for high-volume scenarios

### Performance Targets
- Event ingestion: <50ms p95 latency
- Analytics queries: <200ms p95 (cached), <1s p95 (uncached)
- API key validation: <10ms
- Support: 10,000+ events/second per instance

## Deployment Architecture

### Container Strategy
- Multi-container Docker Compose setup
- Separate containers: App, PostgreSQL, Redis
- Health checks on all services
- Volume persistence for data

### Environment Configuration
- 12-factor app methodology
- Environment variables for all config
- Separate configs for dev/staging/prod
- Secrets management ready

### Cloud Deployment Options

**Render/Railway**
- Docker-based deployment
- Managed PostgreSQL and Redis
- Auto-scaling support
- Built-in SSL/TLS

**AWS ECS**
- Fargate for serverless containers
- RDS for PostgreSQL
- ElastiCache for Redis
- Application Load Balancer
- Auto Scaling Groups

**Kubernetes (Future)**
- Helm charts for deployment
- Horizontal Pod Autoscaling
- StatefulSets for databases
- Ingress for routing

### Monitoring & Observability
- Health check endpoint: `/health`
- Structured logging with Morgan
- Error tracking and alerting ready
- Metrics collection points:
  - Request latency
  - Error rates
  - Database query performance
  - Cache hit rates
  - API key usage

## API Design Principles

### RESTful Conventions
- Resource-based URLs
- HTTP methods: GET, POST, DELETE
- Standard status codes
- JSON request/response bodies

### Response Format
```json
{
  "success": true|false,
  "data": {...},
  "error": "message",
  "cached": true|false
}
```

### Versioning Strategy
- URL-based versioning ready: `/api/v1/...`
- Backward compatibility maintained
- Deprecation notices in headers

### Documentation
- OpenAPI 3.0 specification
- Swagger UI at `/api-docs`
- Request/response examples
- Authentication requirements

## Testing Strategy

### Unit Tests
- Utility functions (crypto, user agent parsing)
- Cache operations
- Data validation

### Integration Tests
- API endpoint testing with Supertest
- Database operations
- Authentication flows
- Rate limiting behavior

### Test Coverage
- Target: 70%+ coverage
- Critical paths: 90%+ coverage
- Automated coverage reports

### Test Data
- Isolated test database
- Seed data for consistent tests
- Cleanup after each test suite

## Future Enhancements

### Phase 2
- Real-time analytics with WebSockets
- Geographic analytics (IP geolocation)
- Custom dashboard builder
- Data export (CSV, JSON, PDF)

### Phase 3
- Machine learning anomaly detection
- Predictive analytics
- A/B testing framework
- Funnel analysis

### Phase 4
- Multi-tenancy with organizations
- Role-based access control
- Webhook notifications
- GraphQL API option

## Performance Benchmarks

### Expected Performance
- Single event ingestion: 30-50ms
- Batch event ingestion (100 events): 200-300ms
- Cached analytics query: 10-20ms
- Uncached analytics query: 200-800ms
- API key validation: 5-10ms

### Load Testing Targets
- 1,000 concurrent users
- 10,000 events/second sustained
- 99.9% uptime
- <1% error rate

## Conclusion

This architecture provides a solid foundation for a production-grade analytics platform with clear paths for scaling, monitoring, and feature expansion. The modular design allows for independent scaling of components and easy integration of additional services.
