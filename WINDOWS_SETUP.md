# Windows Setup Guide (Without Docker)

## Prerequisites

- Node.js 18+ installed ✓
- PostgreSQL 15+ (needs installation)
- Redis (optional, app will work without it)

## Option 1: Quick Setup with PostgreSQL Installer

### 1. Install PostgreSQL

Download and install PostgreSQL from:
https://www.postgresql.org/download/windows/

During installation:
- Set password for postgres user (remember this!)
- Port: 5432 (default)
- Locale: Default

### 2. Create Database

Open Command Prompt or PowerShell as Administrator:

```powershell
# Login to PostgreSQL
psql -U postgres

# In psql prompt:
CREATE DATABASE analytics_db;
CREATE USER analytics_user WITH PASSWORD 'analytics_pass';
GRANT ALL PRIVILEGES ON DATABASE analytics_db TO analytics_user;
\q
```

### 3. Configure Environment

Edit `.env` file:
```
DATABASE_URL=postgresql://analytics_user:analytics_pass@localhost:5432/analytics_db
REDIS_URL=redis://localhost:6379
```

### 4. Run Migration

```bash
npm run migrate
```

### 5. Start Application

```bash
npm start
```

## Option 2: Use Cloud Database (Easiest)

### Free PostgreSQL Options:

**Neon (Recommended):**
1. Go to https://neon.tech
2. Sign up (free tier available)
3. Create a new project
4. Copy the connection string
5. Update `.env`:
```
DATABASE_URL=postgresql://user:pass@host.neon.tech/dbname?sslmode=require
```

**Supabase:**
1. Go to https://supabase.com
2. Create a new project
3. Get connection string from Settings > Database
4. Update `.env`

**ElephantSQL:**
1. Go to https://www.elephantsql.com
2. Create free instance
3. Copy connection URL
4. Update `.env`

### Free Redis Options:

**Upstash (Recommended):**
1. Go to https://upstash.com
2. Create Redis database
3. Copy connection string
4. Update `.env`:
```
REDIS_URL=redis://default:password@host.upstash.io:6379
```

**Redis Cloud:**
1. Go to https://redis.com/try-free
2. Create free database
3. Get connection string
4. Update `.env`

## Option 3: Run Without Redis

The application can run without Redis (it will use in-memory rate limiting):

1. Comment out or remove REDIS_URL from `.env`
2. The app will automatically fall back to memory-based rate limiting
3. Caching will be disabled (queries will hit database directly)

## Complete Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database

Choose one:
- Install PostgreSQL locally (Option 1)
- Use cloud database (Option 2 - Easiest)

### 3. Configure .env

```bash
copy .env.example .env
```

Edit `.env` with your database credentials.

### 4. Run Migration

```bash
npm run migrate
```

Expected output:
```
Starting database migration...
Migration completed successfully!
```

### 5. (Optional) Seed Demo Data

```bash
npm run seed
```

### 6. Start Application

```bash
npm start
```

Expected output:
```
Database connected successfully
Redis connected (or: Redis not available, using memory store)
Server running on port 3000
API Documentation: http://localhost:3000/api-docs
```

### 7. Test Installation

Open browser: http://localhost:3000/health

Should see:
```json
{"status":"healthy","timestamp":"2024-..."}
```

## Troubleshooting

### PostgreSQL Connection Issues

**Error: ECONNREFUSED**

Check if PostgreSQL is running:
```powershell
# Check service status
Get-Service -Name postgresql*

# Start service if stopped
Start-Service postgresql-x64-15
```

**Error: password authentication failed**

Reset password:
```powershell
psql -U postgres
ALTER USER analytics_user WITH PASSWORD 'new_password';
```

Update `.env` with new password.

**Error: database does not exist**

Create database:
```powershell
psql -U postgres
CREATE DATABASE analytics_db;
GRANT ALL PRIVILEGES ON DATABASE analytics_db TO analytics_user;
```

### Port Already in Use

**Port 3000 in use:**

Change in `.env`:
```
PORT=3001
```

**Port 5432 in use:**

Either stop the other PostgreSQL instance or use a different port.

### Module Not Found Errors

Reinstall dependencies:
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

## Development Workflow

### Start Development Server

```bash
npm run dev
```

This uses nodemon for auto-reload on file changes.

### Run Tests

```bash
npm test
```

### Check Database

```powershell
# Connect to database
psql -U analytics_user -d analytics_db

# List tables
\dt

# Query events
SELECT COUNT(*) FROM events;

# Exit
\q
```

## Recommended: Install Docker Desktop

For the best development experience, install Docker Desktop:

1. Download from: https://www.docker.com/products/docker-desktop
2. Install and restart computer
3. Start Docker Desktop
4. Run: `docker-compose up -d`
5. Everything will work automatically!

## Next Steps

Once the server is running:

1. Visit API docs: http://localhost:3000/api-docs
2. Follow API_EXAMPLES.md to test endpoints
3. Create your first app and start tracking events!

## Getting Help

- Check QUICKSTART.md for Docker setup
- See DEPLOYMENT.md for production deployment
- Review API_EXAMPLES.md for usage examples
- Check TROUBLESHOOTING.md for common issues
