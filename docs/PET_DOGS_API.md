# Pet Dogs API Setup Guide

This document explains how to set up the Pet Dogs API to track treats and scritches counts server-side using Vercel KV.

## Overview

The Pet Dogs feature tracks click counts for treats and scritches using:

- **Client-side**: localStorage (for instant UI updates)
- **Server-side**: Vercel KV (Redis-like key-value store) for persistent, shared stats

## Setup Steps

### 1. Install Required Dependencies

Install the Vercel KV package:

```bash
npm install @vercel/kv
```

### 2. Set Up Vercel KV

1. **Go to your Vercel Dashboard**: [vercel.com/dashboard](https://vercel.com/dashboard)
2. **Navigate to your project** → **Storage** tab
3. **Click "Create Database"**
4. **Select "KV"** (Redis-compatible key-value store)
5. **Create the KV store** (choose a name, e.g., "pet-dogs-kv")
6. **Copy the connection details** - you'll see environment variables like:
   - `KV_URL`
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN`

### 3. Add Environment Variables to Vercel

In your Vercel project settings:

1. Go to **Settings** → **Environment Variables**
2. Add the KV environment variables from step 2
3. Make sure they're available in **Production**, **Preview**, and **Development** environments

**Note**: Vercel KV automatically provides these environment variables when you create a KV store, so you may not need to manually add them. Check your Vercel project's environment variables section.

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
2. **API call sent** → Server updates Vercel KV with new count
3. **On page load** → Frontend fetches stats from API to sync with server state

### Fallback Behavior

- If Vercel KV is not configured, the API will still return success (but won't persist)
- localStorage acts as a client-side fallback
- The UI updates immediately regardless of API success/failure

## Vercel KV Pricing

- **Free Tier**:
  - 256 MB storage
  - 30,000 commands per day
  - Perfect for a portfolio site tracking clicks

- **Pro Tier**:
  - 1 GB storage
  - 5 million commands per day
  - $5/month (only needed if you exceed free tier)

## Troubleshooting

### API returns errors

1. **Check environment variables**: Make sure KV credentials are set in Vercel
2. **Check KV store exists**: Verify the KV store was created in your Vercel project
3. **Check package installation**: Ensure `@vercel/kv` is installed

### Local development not working

1. **Link your project**: Run `npx vercel link` to connect to your Vercel project
2. **Use vercel dev**: Run `npx vercel dev` instead of `npm run start:dev` to get environment variables
3. **Check .env.local**: For local testing, you may need to manually add KV credentials

### Stats not persisting

- Check Vercel function logs for errors
- Verify the KV store is accessible in your Vercel dashboard
- Check that environment variables are set for all environments (Production, Preview, Development)

## Alternative Storage Options

If you prefer not to use Vercel KV, you can modify the API to use:

1. **Vercel Postgres** - Full SQL database (more complex, but more features)
2. **Upstash Redis** - Alternative Redis provider
3. **Supabase** - Full-featured backend-as-a-service
4. **Airtable API** - Spreadsheet-like database

The API is designed to gracefully handle missing KV configuration, so the feature will still work with localStorage fallback.
