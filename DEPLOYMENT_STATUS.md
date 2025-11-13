# Deployment Status & Quick Fixes

## Current Issue: Database Connection Failed

The deployment is failing because the DATABASE_URL environment variable is not configured on Render.

## Quick Fix Options

### Option 1: Manual Render Setup (Recommended)

1. **Create PostgreSQL Database on Render:**
   - Go to Render Dashboard → New → PostgreSQL
   - Name: `analytics-db`
   - Plan: Free
   - Create database

2. **Get Connection String:**
   - Go to your database → Info tab
   - Copy "External Database URL"
   - Example: `postgresql://user:pass@dpg-xxx.oregon-postgres.render.com/dbname`

3. **Add Environment Variable:**
   - Go to your web service → Environment
   - Add: `DATABASE_URL` = `<your-connection-string>`
   - Add: `JWT_SECRET` = `<random-32-char-string>`
   - Add: `API_KEY_SECRET` = `<random-32-char-string>`

4. **Redeploy:**
   - Click "Manual Deploy" → "Deploy latest commit"

### Option 2: Use External Database (Fastest)

Use a free cloud database instead:

1. **Get Neon Database (Free):**
   - Go to https://neon.tech
   - Create account and new project
   - Copy connection string

2. **Update Render Environment:**
   - Set `DATABASE_URL` to your Neon connection string
   - Redeploy

### Option 3: Fork and Use render.yaml

The project includes a `render.yaml` file that should automatically set up everything:

1. **Fork the repository** to your GitHub account
2. **Connect to Render** using your fork
3. **Deploy** - it should automatically create database and Redis

## Environment Variables Needed

```bash
# Required
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://user:pass@host/dbname
JWT_SECRET=your-32-character-secret
API_KEY_SECRET=your-32-character-secret

# Optional
REDIS_URL=redis://user:pass@host:port
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CACHE_TTL=3600
```

## Generate Secrets

Use this to generate random secrets:

```bash
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('API_KEY_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

## After Successful Deployment

1. **Run Migration:**
   - Go to web service → Shell
   - Run: `npm run migrate`

2. **Test Health:**
   - Visit: `https://your-app.onrender.com/health`
   - Should return: `{"status":"healthy"}`

3. **View API Docs:**
   - Visit: `https://your-app.onrender.com/api-docs`

## Alternative Deployment Options

### Railway (Often Easier)

1. Go to https://railway.app
2. Connect GitHub repository
3. Add PostgreSQL plugin
4. Deploy automatically handles environment variables

### Heroku

1. Use the "Deploy to Heroku" button (if available)
2. Or manually create app and add PostgreSQL addon

### Vercel + PlanetScale

1. Deploy to Vercel for the app
2. Use PlanetScale for MySQL database
3. Modify code for MySQL instead of PostgreSQL

## Troubleshooting Common Issues

### "Redis not available"
- This is OK! App works without Redis
- To fix: Add Redis instance on Render and set REDIS_URL

### "Migration failed"
- Ensure DATABASE_URL is correct
- Try running migration manually in Shell
- Check database permissions

### "Build failed"
- Check Node.js version (should be 18+)
- Verify package.json is correct
- Check build logs for specific errors

### "App crashes on startup"
- Check all environment variables are set
- Verify database connection string format
- Look at deployment logs for specific errors

## Current Deployment Logs Analysis

From your logs:
```
Database connection failed: AggregateError [ECONNREFUSED]
connect ECONNREFUSED ::1:5432
connect ECONNREFUSED 127.0.0.1:5432
```

This means:
- App is trying to connect to localhost:5432
- No DATABASE_URL environment variable is set
- Using default .env values instead of production values

## Immediate Action Required

1. **Set DATABASE_URL** in Render environment variables
2. **Set JWT_SECRET** and **API_KEY_SECRET**
3. **Redeploy** the service

The app will then start successfully and you can run the migration.

## Success Indicators

When deployment works, you'll see:
```
Database connected successfully
Server running on port 10000
API Documentation: https://your-app.onrender.com/api-docs
```

## Need Help?

1. Check RENDER_DEPLOYMENT.md for detailed steps
2. Use EASY_SETUP.md for cloud database setup
3. See WINDOWS_SETUP.md for local development

The most common issue is missing environment variables - once those are set, the deployment should work perfectly!