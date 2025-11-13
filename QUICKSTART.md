# Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- Docker Desktop installed and running

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Database Services

Start PostgreSQL and Redis using Docker Compose:

```bash
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- Redis on port 6379

Verify services are running:
```bash
docker-compose ps
```

### 3. Configure Environment

```bash
copy .env.example .env
```

The default `.env.example` is already configured for local development with Docker.

### 4. Run Database Migration

```bash
npm run migrate
```

### 5. (Optional) Seed Demo Data

```bash
npm run seed
```

This creates a demo user and app for testing.

### 6. Start the Application

```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

### 7. Verify Installation

Open your browser to:
- API Health: http://localhost:3000/health
- API Docs: http://localhost:3000/api-docs

## Troubleshooting

### Docker Services Not Starting

**Check Docker Desktop is running:**
```bash
docker --version
docker-compose --version
```

**View service logs:**
```bash
docker-compose logs db
docker-compose logs redis
```

**Restart services:**
```bash
docker-compose down
docker-compose up -d
```

### Port Already in Use

If port 5432 or 6379 is already in use, you can either:

1. Stop the conflicting service
2. Change ports in `docker-compose.yml` and `.env`

### Database Connection Failed

**Check if PostgreSQL is running:**
```bash
docker-compose ps
```

**Test database connection:**
```bash
docker exec -it analytics-db-1 psql -U analytics_user -d analytics_db
```

### Redis Connection Failed

**Check if Redis is running:**
```bash
docker exec -it analytics-redis-1 redis-cli ping
```

Should return: `PONG`

## Next Steps

1. **Create an account:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'
```

2. **Create an app and API key** (see API_EXAMPLES.md)

3. **Start tracking events** (see API_EXAMPLES.md)

## Stopping Services

```bash
# Stop application
Ctrl+C

# Stop Docker services
docker-compose down

# Stop and remove volumes (deletes data)
docker-compose down -v
```

## Development Mode

For development with auto-reload:

```bash
npm run dev
```

This uses nodemon to automatically restart the server when files change.

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test
npm test -- tests/auth.test.js
```

## Common Commands

```bash
# View application logs
docker-compose logs app

# View database logs
docker-compose logs db

# View Redis logs
docker-compose logs redis

# Access database shell
docker exec -it analytics-db-1 psql -U analytics_user -d analytics_db

# Access Redis CLI
docker exec -it analytics-redis-1 redis-cli

# Rebuild Docker images
docker-compose build

# Start fresh (removes all data)
docker-compose down -v
docker-compose up -d
npm run migrate
```

## Production Deployment

See DEPLOYMENT.md for production deployment instructions.
