# Render Deployment Guide

## Quick Deploy Steps

### 1. Create PostgreSQL Database

1. Go to your Render Dashboard
2. Click "New +" → "PostgreSQL"
3. Configure:
   - Name: `analytics-db`
   - Database Name: `analytics_db`
   - User: `analytics_user`
   - Region: Choose closest to you
   - Plan: Free (or paid for production)
4. Click "Create Database"
5. **Save the connection details** - you'll need them!

### 2. Create Redis Instance (Optional)

1. Click "New +" → "Redis"
2. Configure:
   - Name: `analytics-redis`
   - Plan: Free
   - Region: Same as database
3. Click "Create Redis"

### 3. Deploy Web Service

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - Name: `analytics-backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: Free (or paid)

### 4. Set Environment Variables

In your web service settings, add these environment variables:

**Required:**
```
NODE_ENV=production
PORT=3000
DATABASE_URL=<your-postgres-connection-string>
JWT_SECRET=<generate-random-32-char-string>
API_KEY_SECRET=<generate-random-32-char-string>
```

**Optional (for Redis):**
```
REDIS_URL=<your-redis-connection-string>
```

**Optional (for Google OAuth):**
```
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GOOGLE_CALLBACK_URL=https://your-app.onrender.com/api/auth/google/callback
```

**Rate Limiting (optional):**
```
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CACHE_TTL=3600
```

### 5. Get Database Connection String

From your PostgreSQL database dashboard:

1. Go to "Info" tab
2. Copy "External Database URL"
3. It looks like: `postgresql://user:pass@dpg-xxx-a.oregon-postgres.render.com/dbname`

### 6. Deploy

1. Click "Create Web Service"
2. Wait for deployment to complete
3. Your app will be available at: `https://your-app-name.onrender.com`

### 7. Run Database Migration

After successful deployment, you need to create the database tables:

**Option A: Using Render Shell**
1. Go to your web service dashboard
2. Click "Shell" tab
3. Run: `npm run migrate`

**Option B: Using Local Migration**
1. Set DATABASE_URL in your local .env to the Render database URL
2. Run locally: `npm run migrate`

### 8. Test Your Deployment

Visit: `https://your-app-name.onrender.com/health`

Should return:
```json
{"status":"healthy","timestamp":"2024-..."}
```

API Documentation: `https://your-app-name.onrender.com/api-docs`

## Troubleshooting

### Database Connection Failed

**Check environment variables:**
- Ensure DATABASE_URL is set correctly
- Verify the connection string format
- Make sure database is in "Available" status

**Test connection:**
```bash
# In Render shell
node -e "console.log(process.env.DATABASE_URL)"
```

### Redis Connection Issues

Redis is optional. If you see "Redis not available", it's fine - the app will work without it.

To fix:
- Add REDIS_URL environment variable
- Ensure Redis instance is running

### Migration Failed

**Run migration manually:**
1. Go to web service → Shell
2. Run: `npm run migrate`

**Or connect locally:**
1. Copy DATABASE_URL from Render
2. Set in local .env
3. Run: `npm run migrate`

### Build Failed

**Common issues:**
- Node.js version mismatch
- Missing dependencies
- Environment variables not set

**Solutions:**
- Check build logs
- Ensure package.json is correct
- Verify all required env vars are set

### App Crashes on Startup

**Check logs:**
1. Go to web service dashboard
2. Click "Logs" tab
3. Look for error messages

**Common fixes:**
- Set all required environment variables
- Ensure database is accessible
- Check for typos in connection strings

## Environment Variables Reference

### Required
```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host/dbname
JWT_SECRET=your-32-character-secret-key
API_KEY_SECRET=your-32-character-secret-key
```

### Optional
```bash
REDIS_URL=redis://user:pass@host:port
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-app.onrender.com/api/auth/google/callback
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CACHE_TTL=3600
```

## Security Notes

### Generate Strong Secrets

Use a password generator or:
```bash
# Generate random secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Database Security

- Use strong passwords
- Enable SSL (Render does this automatically)
- Restrict access to your app only

### API Security

- Always use HTTPS (Render provides this)
- Set strong JWT secrets
- Configure CORS for your domains

## Performance Tips

### Free Tier Limitations

- Apps sleep after 15 minutes of inactivity
- Database has connection limits
- Limited CPU and memory

### Optimization

- Enable Redis for better performance
- Use connection pooling (already configured)
- Monitor response times
- Consider upgrading to paid plans for production

## Monitoring

### Health Checks

Render automatically monitors: `https://your-app.onrender.com/health`

### Logs

View real-time logs in Render dashboard → Logs tab

### Metrics

Monitor:
- Response times
- Error rates
- Database connections
- Memory usage

## Scaling

### Vertical Scaling

Upgrade to higher plans for:
- More CPU/memory
- Faster databases
- Always-on instances

### Horizontal Scaling

For high traffic:
- Deploy multiple instances
- Use load balancer
- Scale database separately

## Backup Strategy

### Database Backups

Render automatically backs up PostgreSQL databases:
- Daily backups for 7 days (free tier)
- Point-in-time recovery (paid plans)

### Manual Backup

```bash
# Export database
pg_dump $DATABASE_URL > backup.sql

# Import database
psql $DATABASE_URL < backup.sql
```

## Cost Estimation

### Free Tier
- Web Service: Free (with limitations)
- PostgreSQL: Free (1GB storage)
- Redis: Free (25MB)

### Production
- Web Service: $7/month (always-on)
- PostgreSQL: $7/month (1GB) to $90/month (100GB)
- Redis: $3/month (100MB) to $45/month (5GB)

## Next Steps

1. **Test all endpoints** using the API documentation
2. **Set up monitoring** and alerts
3. **Configure custom domain** (paid plans)
4. **Set up CI/CD** for automatic deployments
5. **Scale resources** as needed

## Support

- Render Documentation: https://render.com/docs
- Community Forum: https://community.render.com
- Support: support@render.com (paid plans)

## Alternative: One-Click Deploy

Use this button for automatic setup:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/your-username/unified-event-analytics-backend)

This will automatically:
- Create the web service
- Set up PostgreSQL database
- Configure basic environment variables
- Deploy the application

You'll still need to:
1. Set JWT_SECRET and API_KEY_SECRET
2. Run database migration
3. Test the deployment