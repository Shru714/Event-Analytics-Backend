# Deployment Guide

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for local development)
- PostgreSQL 15+ (if not using Docker)
- Redis 7+ (if not using Docker)
- Git

## Local Development Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd unified-event-analytics-backend
npm install
```

### 2. Environment Configuration

```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- Set strong secrets for JWT_SECRET and API_KEY_SECRET
- Configure Google OAuth credentials (optional)
- Adjust rate limits as needed

### 3. Start Services with Docker Compose

```bash
docker-compose up -d
```

This starts:
- PostgreSQL on port 5432
- Redis on port 6379
- Application on port 3000

### 4. Verify Setup

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{"status":"healthy","timestamp":"2024-..."}
```

### 5. Access API Documentation

Open browser: `http://localhost:3000/api-docs`

## Production Deployment

### Option 1: Render

1. Create new Web Service
2. Connect GitHub repository
3. Configure:
   - Environment: Docker
   - Build Command: (automatic)
   - Start Command: (automatic from Dockerfile)
4. Add PostgreSQL database (managed)
5. Add Redis instance (managed)
6. Set environment variables
7. Deploy

### Option 2: Railway

1. Create new project
2. Add PostgreSQL plugin
3. Add Redis plugin
4. Deploy from GitHub
5. Configure environment variables
6. Set custom domain (optional)

### Option 3: AWS ECS

1. Build and push Docker image to ECR
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com
docker build -t analytics-backend .
docker tag analytics-backend:latest <account>.dkr.ecr.us-east-1.amazonaws.com/analytics-backend:latest
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/analytics-backend:latest
```

2. Create RDS PostgreSQL instance
3. Create ElastiCache Redis cluster
4. Create ECS Task Definition
5. Create ECS Service with Application Load Balancer
6. Configure Auto Scaling
7. Set up CloudWatch monitoring

### Option 4: DigitalOcean App Platform

1. Create new app from GitHub
2. Select Dockerfile deployment
3. Add PostgreSQL managed database
4. Add Redis managed database
5. Configure environment variables
6. Deploy

## Environment Variables

### Required
```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host:5432/dbname
REDIS_URL=redis://host:6379
JWT_SECRET=<strong-random-secret>
API_KEY_SECRET=<strong-random-secret>
```

### Optional
```
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CACHE_TTL=3600
```

## Database Migration

After deployment, run migrations:

```bash
npm run migrate
```

Or manually execute `src/database/init.sql` against your database.

## Health Checks

Configure health check endpoint: `GET /health`

- Interval: 30 seconds
- Timeout: 3 seconds
- Healthy threshold: 2
- Unhealthy threshold: 3

## Scaling Considerations

### Horizontal Scaling
- Deploy multiple app instances behind load balancer
- Ensure DATABASE_URL and REDIS_URL point to shared resources
- No sticky sessions required (stateless design)

### Database Scaling
- Enable connection pooling (already configured)
- Consider read replicas for analytics queries
- Implement table partitioning for large datasets

### Redis Scaling
- Use Redis Cluster for high availability
- Configure Redis persistence (AOF or RDB)
- Monitor memory usage

## Monitoring

### Metrics to Track
- Request rate and latency
- Error rate
- Database connection pool usage
- Redis cache hit rate
- API key usage patterns

### Logging
- Application logs via Morgan
- Database query logs
- Error tracking (integrate Sentry/Rollbar)

### Alerts
- High error rate (>1%)
- Slow response times (>1s p95)
- Database connection failures
- Redis connection failures

## Security Checklist

- [ ] Strong JWT_SECRET and API_KEY_SECRET set
- [ ] HTTPS enabled (SSL/TLS certificate)
- [ ] Database credentials secured
- [ ] Redis password set (if exposed)
- [ ] CORS configured for allowed origins
- [ ] Rate limiting enabled
- [ ] Firewall rules configured
- [ ] Regular security updates

## Backup Strategy

### Database Backups
- Automated daily backups
- Point-in-time recovery enabled
- Test restore procedures monthly

### Redis Backups
- Enable AOF persistence
- Regular snapshots
- Backup to S3 or equivalent

## Rollback Procedure

1. Identify issue
2. Stop new deployments
3. Revert to previous Docker image
4. Verify health checks pass
5. Monitor for stability
6. Investigate root cause

## Performance Optimization

### Database
- Monitor slow queries
- Add indexes as needed
- Vacuum and analyze regularly
- Consider materialized views for aggregations

### Application
- Enable compression (gzip)
- Optimize cache TTL values
- Implement request batching
- Use CDN for static assets (if any)

### Redis
- Monitor memory usage
- Adjust maxmemory-policy
- Use appropriate data structures
- Implement cache warming for critical queries

## Troubleshooting

### Application won't start
- Check environment variables
- Verify database connectivity
- Check Redis connectivity
- Review application logs

### High latency
- Check database query performance
- Verify Redis cache hit rate
- Monitor network latency
- Check resource utilization (CPU, memory)

### Database connection errors
- Verify connection string
- Check connection pool settings
- Ensure database is accessible
- Review firewall rules

### Rate limiting issues
- Verify Redis connectivity
- Check rate limit configuration
- Review client request patterns
- Adjust limits if needed

## Support

For deployment issues:
1. Check application logs
2. Review health check endpoint
3. Verify environment configuration
4. Consult ARCHITECTURE.md for system design
5. Open GitHub issue with details
