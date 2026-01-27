# Pet Dogs API Setup Guide

This document explains how to set up the Pet Dogs API to track treats and scritches counts server-side using Upstash Redis (via Vercel Integration).

## Overview

The Pet Dogs feature tracks click counts for treats and scritches using:

- **Client-side**: localStorage (for instant UI updates)
- **Server-side**: Upstash Redis (via Vercel Integration) for persistent, shared stats

## Setup Steps

### 1. Install Required Dependencies

The `@vercel/kv` package is already installed (though deprecated, it still works with Upstash Redis). For new projects, Vercel recommends using Upstash Redis directly via their marketplace integration.

### 2. Set Up Upstash Redis via Vercel Integration

**Option A: Via Vercel Marketplace (Recommended)**

1. **Go to your Vercel Dashboard**: [vercel.com/dashboard](https://vercel.com/dashboard)
2. **Navigate to your project** → **Integrations** tab
3. **Click "Browse Marketplace"** or search for "Redis"
4. **Select "Upstash Redis"** from the marketplace
5. **Click "Add Integration"** and follow the setup wizard
6. **Create a new Redis database** (choose a name, e.g., "pet-dogs-redis")
7. Environment variables will be automatically added:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN`

**Option B: Direct Upstash Setup**

1. **Go to Upstash**: [upstash.com](https://upstash.com)
2. **Create a free account** and create a Redis database
3. **Copy the REST API credentials** from the Upstash dashboard
4. **Add to Vercel**: Go to your Vercel project → **Settings** → **Environment Variables**
5. **Add these variables**:
   - `KV_REST_API_URL` (your Upstash REST API URL)
   - `KV_REST_API_TOKEN` (your Upstash REST API token)
   - `KV_REST_API_READ_ONLY_TOKEN` (optional, for read-only access)

**Note**: The API code uses `@vercel/kv` which works with Upstash Redis via the REST API. The environment variables are automatically detected.

### 4. Local Development Setup

For local development with `vercel dev`:

The environment variables should be automatically available when running `vercel dev` if you've linked your project:

```bash
npx vercel link
npx vercel dev
```

Alternatively, you can create a `.env.local` file (don't commit this) with the KV credentials for local testing.

## How It Works

### API Endpoint: `/api/pet-dogs`

**POST Request** - Increment a counter:

```typescript
POST /api/pet-dogs
Content-Type: application/json

{
  "dogName": "Nala",
  "action": "treat" // or "scritch"
}
```

**GET Request** - Fetch current stats:

```typescript
GET / api / pet - dogs;
```

Returns:

```json
{
  "stats": {
    "Nala": { "treats": 5, "scritches": 3 },
    "Rosie": { "treats": 2, "scritches": 1 },
    "Tito": { "treats": 10, "scritches": 7 }
  }
}
```

### Data Flow

1. **User clicks button** → Frontend immediately updates localStorage (optimistic update)
2. **API call sent** → Server updates Upstash Redis with new count
3. **On page load** → Frontend fetches stats from API to sync with server state

### Fallback Behavior

- If Upstash Redis is not configured, the API will still return success (but won't persist)
- localStorage acts as a client-side fallback
- The UI updates immediately regardless of API success/failure

## Upstash Redis Pricing (via Vercel Integration)

- **Free Tier**:
  - 256 MB storage
  - 500,000 commands per month (vs 30K/day with old Vercel KV)
  - 10 GB bandwidth per month
  - Perfect for a portfolio site tracking clicks

- **Pay-as-you-go**:
  - $0.20 per 100K requests after free tier
  - $0.25 per GB storage after free tier
  - Very affordable for small to medium traffic

## Troubleshooting

### API returns errors

1. **Check environment variables**: Make sure Upstash Redis credentials are set in Vercel
2. **Check Redis database exists**: Verify the Redis database was created in Upstash or via Vercel Integration
3. **Check package installation**: Ensure `@vercel/kv` is installed (works with Upstash Redis)
4. **Check REST API URL format**: Should be `https://your-db.upstash.io`

### Local development not working

1. **Link your project**: Run `npx vercel link` to connect to your Vercel project
2. **Use vercel dev**: Run `npx vercel dev` instead of `npm run start:dev` to get environment variables
3. **Check .env.local**: For local testing, you may need to manually add Upstash Redis credentials:
   ```
   KV_REST_API_URL=https://your-db.upstash.io
   KV_REST_API_TOKEN=your-token-here
   ```

### Stats not persisting

- Check Vercel function logs for errors
- Verify the Redis database is accessible in Upstash dashboard or Vercel Integrations
- Check that environment variables are set for all environments (Production, Preview, Development)
- Verify the REST API URL and token are correct

## Alternative Storage Options

If you prefer not to use Vercel KV, here are other cost-effective or free options:

### 1. **Upstash Redis** (Recommended Alternative)

- **Free Tier**: 256MB storage, 500K commands/month, 10GB bandwidth
- **Pros**: REST API, global replication, pay-as-you-go pricing ($0.20/100K requests)
- **Setup**: Similar to Vercel KV, just swap the client library
- **Best for**: High-traffic sites needing more than Vercel KV's free tier

### 2. **Supabase** (PostgreSQL)

- **Free Tier**: 500MB database, 2GB bandwidth, 50K monthly active users
- **Pros**: Full SQL database, real-time subscriptions, built-in auth
- **Setup**: Requires schema setup, more complex but more powerful
- **Best for**: If you need more complex queries or relationships

### 3. **Firebase Realtime Database**

- **Free Tier**: 1GB storage, 10GB/month transfer, 100 concurrent connections
- **Pros**: Real-time sync, easy setup, Google-backed
- **Setup**: Requires Firebase project setup
- **Best for**: Real-time features or if already using Firebase

### 4. **JSONBin.io**

- **Free Tier**: Unlimited bins, 10 requests/minute, 5MB per bin
- **Pros**: Simple REST API, no setup required, perfect for small data
- **Setup**: Just API calls, no database setup
- **Best for**: Simple key-value storage with minimal setup

### 5. **Airtable**

- **Free Tier**: 1,200 records/base, 1,000 API requests/month
- **Pros**: Spreadsheet-like interface, easy to view/edit data manually
- **Setup**: Requires Airtable base setup and API key
- **Best for**: Non-technical users who want to view/edit data easily

### 6. **Vercel Postgres**

- **Free Tier**: 256MB storage, 60 hours compute/month
- **Pros**: Full PostgreSQL, integrates with Vercel, serverless
- **Setup**: Similar to Vercel KV, but requires SQL schema
- **Best for**: If you need SQL queries or relationships

### Recommendation

**For this portfolio project**, **Upstash Redis via Vercel Integration is the best choice** because:

- ✅ Already integrated and ready to use (code works with `@vercel/kv`)
- ✅ Free tier is generous (500K commands/month is plenty)
- ✅ Easy setup via Vercel Marketplace
- ✅ Simple key-value storage matches the use case perfectly
- ✅ Better free tier than the old Vercel KV (500K/month vs 30K/day)

**If you exceed Upstash Redis's free tier**, the pay-as-you-go pricing is very affordable ($0.20 per 100K requests).

The API is designed to gracefully handle missing KV configuration, so the feature will still work with localStorage fallback.
