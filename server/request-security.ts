import { createHash } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

const localWindows = new Map<string, { count: number; expires: number }>();
const MAX_LOCAL_WINDOWS = 10_000;

function header(req: VercelRequest, name: string): string | undefined {
  const value = req.headers[name];
  return typeof value === 'string' ? value : undefined;
}

/** Allow same-origin browsers and explicitly configured site origins, never '*'. */
export function allowBrowserRequest(
  req: VercelRequest,
  res: VercelResponse
): boolean {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Vary', 'Origin');
  const origin = header(req, 'origin');
  if (!origin) return true;

  const host = header(req, 'host');
  const allowed = [
    process.env.VITE_SITE_URL,
    process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`,
    process.env.VERCEL_BRANCH_URL && `https://${process.env.VERCEL_BRANCH_URL}`,
    host && `https://${host}`,
    !process.env.VERCEL && host && `http://${host}`,
  ].filter(Boolean);
  if (!allowed.includes(origin)) {
    res.status(403).json({ error: 'Origin not allowed' });
    return false;
  }
  res.setHeader('Access-Control-Allow-Origin', origin);
  return true;
}

export function allowRequestBody(
  req: VercelRequest,
  res: VercelResponse
): boolean {
  const contentType = header(req, 'content-type')?.split(';')[0].trim();
  if (contentType !== 'application/json') {
    res.status(415).json({ error: 'Content-Type must be application/json' });
    return false;
  }
  if (Buffer.byteLength(JSON.stringify(req.body) ?? '', 'utf8') > 16_384) {
    res.status(413).json({ error: 'Request body too large' });
    return false;
  }
  return true;
}

/** Shared atomic limits with Redis; bounded per-instance fallback without Redis. */
export async function enforceRateLimit(
  req: VercelRequest,
  res: VercelResponse,
  scope: string,
  limit: number,
  windowSeconds: number
): Promise<boolean> {
  // Vercel overwrites this header. Outside Vercel only trust the socket address.
  const address =
    (process.env.VERCEL &&
      header(req, 'x-forwarded-for')?.split(',')[0].trim()) ||
    req.socket?.remoteAddress ||
    'unknown';
  const digest = createHash('sha256').update(address).digest('hex');
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const expires = (Math.floor(now / windowMs) + 1) * windowMs;
  const key = `rate-limit:${scope}:${Math.floor(now / windowMs)}:${digest}`;
  const retryAfter = Math.max(1, Math.ceil((expires - now) / 1000));
  let count: number;
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (url && token) {
    try {
      const redis = new Redis({ url, token });
      count = await redis.eval<[number], number>(
        `local count = redis.call('INCR', KEYS[1])
         if count == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
         return count`,
        [key],
        [retryAfter]
      );
    } catch {
      // A configured limiter outage must not silently remove abuse protection.
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('Retry-After', '30');
      res
        .status(503)
        .json({ error: 'Temporarily unavailable. Please try again.' });
      return false;
    }
  } else {
    for (const [entryKey, entry] of localWindows) {
      if (entry.expires <= now) localWindows.delete(entryKey);
    }
    if (!localWindows.has(key) && localWindows.size >= MAX_LOCAL_WINDOWS) {
      res.setHeader('Retry-After', String(windowSeconds));
      res
        .status(503)
        .json({ error: 'Temporarily unavailable. Please try again.' });
      return false;
    }
    const entry = localWindows.get(key) ?? { count: 0, expires };
    count = ++entry.count;
    localWindows.set(key, entry);
  }

  if (count > limit) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Retry-After', String(retryAfter));
    res
      .status(429)
      .json({ error: 'Too many requests. Please try again later.' });
    return false;
  }
  return true;
}
