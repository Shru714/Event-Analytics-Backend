# Easiest Setup (5 Minutes) - No Docker Required

This guide gets you running with free cloud databases - perfect for development and testing.

## Step 1: Get a Free PostgreSQL Database

### Using Neon (Recommended - Fastest)

1. Go to https://neon.tech
2. Click "Sign Up" (use GitHub or email)
3. Create a new project (name it "analytics")
4. Copy the connection string that looks like:
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### Alternative: Supabase

1. Go to https://supabase.com
2. Sign up and create new project
3. Go to Settings > Database
4. Copy "Connection string" (URI format)

### Alternative: ElephantSQL

1. Go to https://www.elephantsql.com
2. Sign up and create "Tiny Turtle" (free) instance
3. Copy the URL from details page

## Step 2: Get Free Redis (Optional but Recommended)

### Using Upstash

1. Go to https://upstash.com
2. Sign up (GitHub or email)
3. Create Redis database
4. Copy the connection string:
   ```
   redis://default:password@xxx.upstash.io:6379
   ```

**Note:** App works without Redis, but caching and rate limiting will be less efficient.

## Step 3: Configure Your App

1. **Copy environment file:**
```bash
copy .env.example .env
```

2. **Edit `.env` file** with your connection strings:
```env
NODE_ENV=development
PORT=3000

# Paste your Neon connection string here:
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require

# Paste your Upstash connection string here (or leave commented out):
REDIS_URL=redis://default:password@xxx.upstash.io:6379

# These can stay as-is for development:
JWT_SECRET=your-super-secret-jwt-key-change-in-production
API_KEY_SECRET=your-api-key-hashing-secret

# Leave these commented out unless you want Google OAuth:
# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=
# GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CACHE_TTL=3600
```

## Step 4: Install and Run

```bash
# Install dependencies
npm install

# Create database tables
npm run migrate

# (Optional) Add demo data
npm run seed

# Start the server
npm start
```

## Step 5: Test It Works

Open your browser to: http://localhost:3000/health

You should see:
```json
{"status":"healthy","timestamp":"2024-..."}
```

Visit API docs: http://localhost:3000/api-docs

## Step 6: Create Your First Event

### 1. Register a user:
```bash
curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"name\":\"Test User\"}"
```

Save the `token` from the response.

### 2. Create an app (replace YOUR_TOKEN):
```bash
curl -X POST http://localhost:3000/api/keys -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d "{\"appId\":\"APP_ID_FROM_SEED\",\"name\":\"My App Key\"}"
```

Save the `apiKey` from the response.

### 3. Track an event (replace YOUR_API_KEY):
```bash
curl -X POST http://localhost:3000/api/events/track -H "X-API-Key: YOUR_API_KEY" -H "Content-Type: application/json" -d "{\"eventType\":\"page_view\",\"userId\":\"user123\",\"url\":\"https://example.com\"}"
```

### 4. View analytics (replace YOUR_TOKEN):
```bash
curl http://localhost:3000/api/analytics/events/summary -H "Authorization: Bearer YOUR_TOKEN"
```

## That's It! 🎉

You now have a fully functional analytics backend running!

## What's Next?

- **Integrate with your website**: See API_EXAMPLES.md for JavaScript SDK
- **Deploy to production**: See DEPLOYMENT.md for Render/Railway deployment
- **Explore features**: Check out API_EXAMPLES.md for all endpoints

## Troubleshooting

### "Database connection failed"

- Check your DATABASE_URL is correct
- Make sure you copied the full connection string including `?sslmode=require`
- Verify your Neon/Supabase project is active

### "Redis not available"

- This is OK! The app works without Redis
- To fix: Add REDIS_URL to .env with your Upstash connection string

### "Migration failed"

- Make sure DATABASE_URL is correct
- Try running migration again: `npm run migrate`
- Check Neon dashboard to see if tables were created

### Port 3000 already in use

Change port in `.env`:
```
PORT=3001
```

## Free Tier Limits

**Neon:**
- 10 GB storage
- 100 hours compute per month
- Perfect for development and small projects

**Upstash:**
- 10,000 commands per day
- 256 MB storage
- More than enough for testing

## Cost for Production

Both services have generous free tiers. For production:
- Neon: ~$20/month for always-on database
- Upstash: ~$10/month for higher limits

Or deploy your own with Docker on any VPS for ~$5/month.

## Need Help?

- Check WINDOWS_SETUP.md for more detailed Windows instructions
- See DEPLOYMENT.md for production deployment
- Review API_EXAMPLES.md for API usage
