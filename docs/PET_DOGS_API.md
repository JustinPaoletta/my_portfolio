# Pet Dogs API

The Pet Dogs feature stores treat and scritch counts locally for instant UI updates and can optionally persist shared counts in Upstash Redis through the Vercel function at `/api/pet-dogs`.

## Current Implementation

- Frontend hook: `src/hooks/usePetDogs.ts`
- Serverless endpoint: `api/pet-dogs.ts`
- Redis client: `@upstash/redis`

The API does not use `@vercel/kv`.

## API Surface

### `GET /api/pet-dogs`

Returns the current stats object:

```json
{
  "stats": {
    "Nala": { "treats": 0, "scritches": 0 },
    "Rosie": { "treats": 0, "scritches": 0 },
    "Tito": { "treats": 0, "scritches": 0 }
  }
}
```

### `POST /api/pet-dogs`

Request body:

```json
{
  "dogName": "Nala",
  "action": "treat"
}
```

Valid actions are `treat` and `scritch`.

## Required Server Variables

Set these in Vercel when you want persistence:

```env
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
```

Only those two variables are read by `api/pet-dogs.ts`. A read-only token is not used by the current implementation.

## Fallback Behavior

If Redis is unavailable or the KV credentials are missing:

- `GET /api/pet-dogs` returns zeroed stats for all three dogs
- `POST /api/pet-dogs` returns success but does not persist anything
- the UI still keeps optimistic counts in `localStorage`

That means the feature is usable without Redis, but the counts will not be shared across browsers or devices.

## Local Development

`npm run start:dev` does not serve the Vercel function. Use:

```bash
npm run start:vercel
```

or:

```bash
npx vercel dev
```

if you want `/api/pet-dogs` available locally.

## Data Flow

1. `usePetDogs` loads cached counts from `localStorage`.
2. The hook fetches `/api/pet-dogs` and replaces local state if server data exists.
3. Clicking a treat or scritch updates the UI immediately.
4. The hook sends a fire-and-forget `POST` to `/api/pet-dogs`.
5. If the request fails, the local optimistic state remains in place.

## Troubleshooting

### Counts never persist

- Confirm `KV_REST_API_URL` and `KV_REST_API_TOKEN` are set in Vercel
- Check the function logs in Vercel
- Make sure you are testing through `vercel dev` locally, not plain Vite dev

### The API always returns zeroes locally

- Plain `npm run start:dev` cannot execute `api/pet-dogs.ts`
- Start the app with `npm run start:vercel`

### Requests fail with validation errors

The body must include:

- `dogName` as a string
- `action` as either `treat` or `scritch`

## Related Files

- `src/hooks/usePetDogs.ts`
- `api/pet-dogs.ts`
- `docs/VERCEL_DEPLOYMENT.md`
- `docs/ENV.md`
