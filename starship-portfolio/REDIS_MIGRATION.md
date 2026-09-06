# Redis Migration Guide

This guide will help you migrate your portfolio data from `data.json` to Redis on Vercel.

## Prerequisites

- Vercel account with Redis integration connected (already done ✅)
- Node.js installed locally
- Redis package: `npm install redis`

## Step 1: Install Dependencies

```bash
npm install redis
```

## Step 2: Pull Environment Variables

Pull your Vercel environment variables to get the `STORAGE_URL`:

```bash
vercel env pull .env.development.local
```

This will create a `.env.development.local` file with your Redis connection URL.

## Step 3: Run the Migration Script

Execute the migration script to transfer data from `data.json` to Redis:

```bash
node migrate-to-redis.js
```

You should see output like:
```
Starting Redis migration...
Connected to Redis
Read data.json successfully
Stored portfolio data in Redis under key: portfolio:data
✅ Migration successful! Data verified in Redis.
Data size: 3456 bytes
Disconnected from Redis
```

## Step 4: Update Your Application Code

### Option A: API Route (Recommended for Vercel)

Create a new API route at `api/data.js`:

```javascript
import { createClient } from 'redis';

export default async function handler(req, res) {
  const client = createClient({
    url: process.env.STORAGE_URL
  });

  try {
    await client.connect();
    const data = await client.get('portfolio:data');
    await client.disconnect();
    
    if (data) {
      res.status(200).json(JSON.parse(data));
    } else {
      res.status(404).json({ error: 'Data not found' });
    }
  } catch (error) {
    console.error('Redis error:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}
```

### Option B: Update Frontend to Use API

Update your React components to fetch from the API instead of the JSON file:

```javascript
// Before:
// const data = await fetch('/data.json').then(r => r.json());

// After:
const data = await fetch('/api/data').then(r => r.json());
```

## Step 5: Verify Migration

Test your application locally:

```bash
npm run dev
```

Visit your site and verify that all data is loading correctly from Redis.

## Step 6: Deploy to Vercel

```bash
git add .
git commit -m "Migrate data storage from JSON to Redis"
git push
```

Vercel will automatically deploy your changes.

## Data Structure in Redis

The data is stored under the key `portfolio:data` as a JSON string containing:
- `about` - Profile information
- `projects` - Array of projects
- `mission_update` - Array of mission updates
- `contact` - Contact information

## Updating Data

To update data in Redis, you can:

1. **Via Script**: Modify `data.json` and re-run the migration script
2. **Via API**: Create an admin API route to update Redis directly
3. **Via Redis CLI**: Connect to your Redis instance and update directly

## Troubleshooting

### Error: STORAGE_URL environment variable is not set
- Run `vercel env pull .env.development.local` to download environment variables
- Make sure you're in the project directory

### Error: Redis Client Error
- Check your Redis URL is correct
- Verify your Vercel Redis integration is active
- Check Redis connection limits

### Data not showing on website
- Verify migration completed successfully
- Check API route is working: visit `/api/data`
- Check browser console for errors
- Verify environment variables are set in Vercel dashboard

## Benefits of Redis

✅ Faster data access (in-memory storage)
✅ Scalable for high traffic
✅ Easy to update without redeploying
✅ Built-in caching
✅ Integrated with Vercel

## Next Steps

- Consider adding caching headers to your API route
- Implement Redis connection pooling for better performance
- Create an admin interface to update portfolio data
- Set up Redis TTL (time-to-live) if needed
