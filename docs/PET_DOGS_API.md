# Pet Dogs API

The pet section keeps optimistic treat and scritch counts in browser storage.
The optional `/api/pet-dogs` Vercel function stores shared counts in Upstash Redis.
Engineer and Cosmic show **Can I pet that Dawg?**. Minimal omits the section.
CLI retains the `dogs` directory and pet commands described in [JP-CLI](JP_CLI.md).

## Source

- `src/hooks/usePetDogs.ts`: local state, storage, initial fetch, and background mutation requests.
- `api/pet-dogs.ts`: request validation and Redis records.
- `server/request-security.ts`: origins, body limits, and rate limits.

## Requests

`GET /api/pet-dogs` returns the stats object:

```json
{
  "stats": {
    "Nala": { "treats": 0, "scritches": 0 },
    "Rosie": { "treats": 0, "scritches": 0 },
    "Tito": { "treats": 0, "scritches": 0 }
  }
}
```

`POST /api/pet-dogs` accepts JSON:

```json
{
  "dogName": "Nala",
  "action": "treat"
}
```

Names are case-sensitive: `Nala`, `Rosie`, or `Tito`. Surrounding name whitespace is removed.
Actions are exactly `treat` or `scritch`.
Successful Redis mutations return `{ "success": true, "stats": ... }` for that dog.
The server updates the existing `pet-dogs:<name>` JSON value with an atomic Redis script.

## Configuration and failures

Set both server-only variables for shared persistence:

```env
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
```

The same credentials enable deployment-wide API rate limits. The API uses `@upstash/redis`, not `@vercel/kv`.

| Condition                                       | Behavior                                                               |
| ----------------------------------------------- | ---------------------------------------------------------------------- |
| Either Redis credential is missing              | GET returns zeroed stats; POST acknowledges without shared persistence |
| Configured Redis rate limiter fails             | HTTP 503; request does not reach storage                               |
| Configured Redis storage operation fails        | HTTP 500                                                               |
| Per-client rate limit exceeded                  | HTTP 429 with `Retry-After`                                            |
| Unknown dog or action                           | HTTP 400                                                               |
| Disallowed browser origin                       | HTTP 403                                                               |
| Reserialized mutation body exceeds 16 KiB       | HTTP 413                                                               |
| Mutation content type is not `application/json` | HTTP 415                                                               |
| Unsupported method                              | HTTP 405                                                               |

Mutation-body size is the UTF-8 byte length of `JSON.stringify(req.body)` after parsing.
The check does not measure raw request bytes. Content-type parameters are permitted.
GET and OPTIONS do not require a JSON body.

GET permits 120 requests per client IP per minute. POST permits 60.
Without Redis credentials, limits use bounded per-function memory and reset on cold starts.
These fallback limits are not deployment-wide.

## Browser state

1. The hook loads saved counts from `localStorage`.
2. It requests server stats on mount.
3. A successful response replaces matching local counts and updates storage.
4. A pet interaction updates local state and storage immediately.
5. A background POST attempts shared persistence.

Failed requests leave the optimistic browser counts in place. They are not queued for later replay.
A later successful GET can overwrite those counts, including with zeroes when Redis is unconfigured.
Local storage can be unavailable; the UI still keeps its in-memory state.

## Local development

Plain Vite does not serve Vercel functions. Use:

```sh
npm run start:vercel
```

Open `http://localhost:6173`.
Check the function response and server logs when shared counts fail to persist.
Do not infer successful persistence from the immediate optimistic counter.

Related: [environment variables](ENV.md), [security maintenance](security-maintenance.md), and [Vercel deployment](VERCEL_DEPLOYMENT.md).
