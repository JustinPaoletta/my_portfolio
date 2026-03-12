# Offline Data and Contact Reliability Plan

## Objective

Create an offline-resilient experience where:

- Read-only content (GitHub profile data and avatar) still renders predictably.
- Write actions (contact form email) never fail silently and can recover after reconnect.
- Users always see accurate status messaging for offline, queued, sending, sent, or failed states.

## Scope

- Frontend app behavior (React + PWA service worker).
- Client-side caching and retry strategy.
- Contact API compatibility for retries and duplicate protection.
- Testing and rollout checklist.

## Non-Goals

- Guaranteeing message delivery when the browser never comes back online.
- Replacing email provider behavior (Resend) or adding CRM workflows.
- Building a fully custom service worker from scratch unless runtime config is insufficient.

## Current State Summary

- GitHub stats are cached in localStorage for 1 hour:
  - `src/hooks/useGitHub.ts`
- GitHub avatar uses `user.avatar_url` directly:
  - `src/components/sections/GitHub/index.tsx`
- Runtime image caching only matches URLs with image extensions:
  - `src/pwa-config.ts`
  - This misses common GitHub avatar URLs like `avatars.githubusercontent.com/u/123?v=4`.
- Contact form submits directly to `/api/contact` with no offline queue:
  - `src/components/sections/Contact/index.tsx`
- Contact API validates and sends via Resend:
  - `api/contact.ts`

## Product Behavior Requirements

1. GitHub section should render cached data even when offline.
2. GitHub avatar should continue to show offline after it has been fetched once.
3. Contact form should not show generic failure when user is offline.
4. Offline contact submissions should be queued locally and retried automatically once online.
5. Users should receive explicit status feedback at every stage.
6. Retries should avoid duplicate emails where possible.

## Architecture Decisions

## 1) Read Path (GitHub data + avatar)

- Data strategy: `Network first, cached fallback` with stale-if-offline behavior.
- Avatar strategy: cache by host rule, not only by file extension.
- UI fallback strategy: local fallback avatar image if remote avatar fails.

## 2) Write Path (Contact form)

- Transport strategy: outbox queue with eventual send.
- Queue storage: local persistent store (localStorage initially; IndexedDB if needed later).
- Retry trigger: app start + `online` event + optional periodic retry while app is open.
- Retry policy: bounded attempts with exponential backoff and visible error state.

## 3) Service Worker

- Keep existing `vite-plugin-pwa` approach.
- Add targeted runtime cache rule(s) for GitHub avatars.
- Optionally add Workbox Background Sync for POST `/api/contact` after local outbox is stable.

## Implementation Plan

## Phase 1: Fast Reliability Wins (Low Risk)

### A. Fix GitHub avatar offline caching

- Update `src/pwa-config.ts` runtime caching:
  - Add a rule for `https://avatars.githubusercontent.com/*`.
  - Optional: also include `https://*.githubusercontent.com/*` where appropriate.
  - Use `CacheFirst` with expiration cap (for example 30 days, max 50 entries).

Why:

- Host-based avatar URLs often have query params and no file extension.
- Current regex misses those URLs.

### B. Add UI fallback image for avatar load failures

- Update `src/components/sections/GitHub/index.tsx`:
  - Add `onError` handler for `<img>`.
  - Swap to local fallback asset (for example `/images/avatar-fallback.webp`).
  - Prevent error loops by clearing the handler once fallback is applied.

Why:

- Even with cache rules, first-time offline users need graceful fallback behavior.

### C. Improve stale data behavior in `useGitHub`

- Update `src/hooks/useGitHub.ts` cache policy:
  - Keep using cached data if network fails, even when cache TTL is exceeded.
  - Mark stale cache metadata in state if needed (optional).

Why:

- Better to show old profile data than show an error-only state offline.

## Phase 2: Contact Outbox Queue (Primary User Impact)

### A. Add a lightweight outbox module

Create a module (example path: `src/services/contactOutbox.ts`) with:

- `enqueue(message)`
- `dequeue(id)`
- `listQueue()`
- `flushQueue()`
- `subscribe(listener)` (optional)

Suggested queue item shape:

```ts
type ContactQueueItem = {
  id: string; // uuid
  createdAt: string; // ISO string
  payload: {
    name: string;
    email: string;
    message: string;
  };
  attempts: number;
  nextAttemptAt?: string;
  lastError?: string;
  status: 'queued' | 'sending' | 'failed';
};
```

Storage details:

- Key: `contact_outbox_v1`
- Max queue size: e.g. 25 items
- Drop oldest or block new submissions with clear user message if limit reached

### B. Update contact form submit behavior

In `src/components/sections/Contact/index.tsx`:

- Detect offline using `navigator.onLine`.
- On submit:
  - If offline: queue item immediately and show queued success-style message.
  - If online: attempt immediate send.
  - On network failure (fetch throw or timeout): queue item and show queued message.
  - On 4xx validation errors: do not queue, show actionable error.
  - On 5xx: queue with retry.

New UI statuses (replace current `idle/success/error` only model):

- `idle`
- `sending`
- `queued`
- `sent`
- `failed`

### C. Flush queue on reconnect

- Register listeners:
  - `window.addEventListener('online', flushQueue)`
  - flush once on mount
- During flush:
  - Send one-at-a-time to reduce bursts.
  - Stop on repeated transient failures and schedule backoff.
  - Remove item only after confirmed success.

Backoff suggestion:

- `min(2 ** attempts * 1000, 5 * 60 * 1000)` milliseconds.

## Phase 3: Duplicate Protection and Hardening

### A. Add idempotency key from client

- Each queue item includes `id`.
- Send `X-Idempotency-Key: <id>` with `/api/contact` request.

### B. Implement server-side dedupe (recommended)

In `api/contact.ts`:

- Check/store idempotency key for a TTL window (e.g. 24h).
- If key already processed, return success response without re-sending email.

Possible storage:

- Upstash Redis (best for serverless persistence).
- Avoid in-memory-only dedupe (not reliable across cold starts/instances).

### C. Add request timeout

- Use `AbortController` client-side for `/api/contact` request timeout (e.g. 10s).
- Timeout should be treated as retryable and queued.

## Phase 4: Optional Workbox Background Sync

After Phase 2 is stable, optionally add Workbox Background Sync in `src/pwa-config.ts` for:

- Route: POST `/api/contact`
- Method: `POST`
- Handler: `NetworkOnly`
- Plugin: background sync queue with replay on connectivity

Important:

- Keep local outbox UX even if SW queue is enabled, so users can see status.
- Browser support varies; local outbox remains the baseline reliability layer.

## UX Copy and State Guidance

Recommended user-facing copy:

- Offline detected:
  - "You are offline. Messages will be queued and sent automatically when you reconnect."
- Queued:
  - "Message queued. We’ll send it automatically when connection returns."
- Sending:
  - "Sending message..."
- Sent:
  - "Message sent successfully."
- Failed (non-retryable):
  - "Could not send message. Please check your input and try again."

Button behavior:

- Online idle: `Send Message`
- Offline idle: `Queue Message`
- Sending: disabled + spinner

## Data Retention and Privacy

- Queue stores personally identifiable info (name, email, message) locally.
- Document this in privacy notes if needed.
- Retention policy suggestion:
  - Remove successfully sent items immediately.
  - Auto-expire unsent items after 7 days.

## Validation and Test Plan

Because PWA is disabled in dev (`devOptions.enabled: false`), test with production preview:

1. Build and preview:
   - `npm run build`
   - `npm run start:prod`
2. In browser DevTools:
   - Verify service worker registration.
   - Preload GitHub section online.
   - Toggle Offline mode.
3. Test cases:
   - Avatar remains visible offline after one online load.
   - Cached GitHub data renders offline even after cache TTL expiry.
   - Contact submit offline creates queued state.
   - Reconnect triggers automatic send.
   - 4xx validation errors are not queued.
   - Retryable failures are queued.
   - Duplicate retries do not send duplicate emails (after idempotency implementation).

## Acceptance Criteria

- GitHub avatar no longer disappears offline after first successful load.
- GitHub section shows cached/stale data offline instead of hard error-only state.
- Contact form has explicit queued state when offline or transiently failing.
- Queued messages send automatically on reconnect.
- No duplicate email sends for same queued item (after idempotency layer).
- Clear UI copy for offline/queued/sending/sent/failed states.

## Rollout Order

1. Phase 1 (avatar + stale cache fallback).
2. Phase 2 (contact outbox + reconnect flush + new statuses).
3. Phase 3 (idempotency and timeout hardening).
4. Phase 4 (optional Workbox Background Sync).

## Risks and Mitigations

- Risk: localStorage limits for large queue payloads.
  - Mitigation: queue cap and/or migrate to IndexedDB later.
- Risk: duplicate sends from retries.
  - Mitigation: idempotency key + server dedupe.
- Risk: users close app before reconnect.
  - Mitigation: persisted queue flushed on next app open.
- Risk: stale GitHub profile data.
  - Mitigation: stale-while-offline only; refresh immediately when online.

## Future Enhancements

- Move queue storage from localStorage to IndexedDB for durability and size.
- Add a small "Outbox" UI to display pending message count and retry controls.
- Add telemetry events for:
  - queued submissions
  - replay success/failure
  - average replay latency
