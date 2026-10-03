// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  allowBrowserRequest,
  allowRequestBody,
  enforceRateLimit,
} from './request-security.js';

const { evalMock } = vi.hoisted(() => ({ evalMock: vi.fn() }));
vi.mock('@upstash/redis', () => ({
  Redis: class {
    eval = evalMock;
  },
}));

function request(headers: Record<string, string> = {}, body: unknown = {}) {
  return {
    headers,
    body,
    socket: { remoteAddress: '192.0.2.1' },
  } as VercelRequest;
}
function response() {
  const res = { setHeader: vi.fn(), status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  return res as unknown as VercelResponse;
}

beforeEach(() => {
  vi.stubEnv('VERCEL', '');
  vi.stubEnv('VITE_SITE_URL', 'https://jpengineering.dev');
  vi.stubEnv('KV_REST_API_URL', '');
  vi.stubEnv('KV_REST_API_TOKEN', '');
  vi.clearAllMocks();
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe('browser and body protection', () => {
  it('allows the current preview origin and configured production origin', () => {
    vi.stubEnv('VERCEL', '1');
    const res = response();
    expect(
      allowBrowserRequest(
        request({
          host: 'preview.vercel.app',
          origin: 'https://preview.vercel.app',
        }),
        res
      )
    ).toBe(true);
    expect(res.setHeader).toHaveBeenCalledWith(
      'Access-Control-Allow-Origin',
      'https://preview.vercel.app'
    );
    expect(
      allowBrowserRequest(
        request({
          host: 'preview.vercel.app',
          origin: 'https://jpengineering.dev',
        }),
        response()
      )
    ).toBe(true);
  });
  it('rejects unrelated origins, opaque origins, and insecure deployment origins', () => {
    vi.stubEnv('VERCEL', '1');
    for (const origin of [
      'https://evil.example',
      'null',
      'http://preview.vercel.app',
    ]) {
      const res = response();
      expect(
        allowBrowserRequest(
          request({ host: 'preview.vercel.app', origin }),
          res
        )
      ).toBe(false);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.setHeader).not.toHaveBeenCalledWith(
        'Access-Control-Allow-Origin',
        origin
      );
    }
  });
  it('permits local development and requests without Origin', () => {
    expect(
      allowBrowserRequest(
        request({ host: 'localhost:6173', origin: 'http://localhost:6173' }),
        response()
      )
    ).toBe(true);
    expect(allowBrowserRequest(request(), response())).toBe(true);
  });
  it('requires JSON and bounds the actual body even without content-length', () => {
    const res = response();
    expect(
      allowRequestBody(request({ 'content-type': 'text/plain' }), res)
    ).toBe(false);
    expect(res.status).toHaveBeenCalledWith(415);
    expect(
      allowRequestBody(
        request(
          { 'content-type': 'application/json; charset=utf-8' },
          { text: 'ok' }
        ),
        response()
      )
    ).toBe(true);
    const large = response();
    expect(
      allowRequestBody(
        request(
          { 'content-type': 'application/json' },
          { text: 'a'.repeat(20_000) }
        ),
        large
      )
    ).toBe(false);
    expect(large.status).toHaveBeenCalledWith(413);
  });
});

describe('rate limits', () => {
  it('limits requests, separates scopes, and resets expired local windows', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-03T00:00:00Z'));
    const req = request();
    expect(await enforceRateLimit(req, response(), 'test-local', 2, 60)).toBe(
      true
    );
    expect(await enforceRateLimit(req, response(), 'test-local', 2, 60)).toBe(
      true
    );
    const blocked = response();
    expect(await enforceRateLimit(req, blocked, 'test-local', 2, 60)).toBe(
      false
    );
    expect(blocked.status).toHaveBeenCalledWith(429);
    expect(blocked.setHeader).toHaveBeenCalledWith('Retry-After', '60');
    expect(await enforceRateLimit(req, response(), 'test-other', 2, 60)).toBe(
      true
    );
    vi.advanceTimersByTime(60_000);
    expect(await enforceRateLimit(req, response(), 'test-local', 2, 60)).toBe(
      true
    );
  });
  it('uses shared Redis counts and hashes the trusted platform IP', async () => {
    vi.stubEnv('VERCEL', '1');
    vi.stubEnv('KV_REST_API_URL', 'https://redis.example');
    vi.stubEnv('KV_REST_API_TOKEN', 'test-token');
    evalMock.mockResolvedValue(6);
    const res = response();
    expect(
      await enforceRateLimit(
        request({ 'x-forwarded-for': '198.51.100.2' }),
        res,
        'contact',
        5,
        600
      )
    ).toBe(false);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(evalMock.mock.calls[0][1][0]).toMatch(
      /^rate-limit:contact:\d+:[a-f0-9]{64}$/
    );
    expect(evalMock.mock.calls[0][0]).toContain("redis.call('EXPIRE'");
  });
  it('ignores spoofed forwarded headers outside Vercel', async () => {
    expect(
      await enforceRateLimit(
        request({ 'x-forwarded-for': '198.51.100.3' }),
        response(),
        'test-spoof',
        1,
        60
      )
    ).toBe(true);
    const res = response();
    expect(
      await enforceRateLimit(
        request({ 'x-forwarded-for': '198.51.100.4' }),
        res,
        'test-spoof',
        1,
        60
      )
    ).toBe(false);
    expect(res.status).toHaveBeenCalledWith(429);
  });
  it('rejects requests when a configured shared limiter fails', async () => {
    vi.stubEnv('KV_REST_API_URL', 'https://redis.example');
    vi.stubEnv('KV_REST_API_TOKEN', 'test-token');
    evalMock.mockRejectedValue(new Error('Redis unavailable'));
    const res = response();
    expect(await enforceRateLimit(request(), res, 'contact', 5, 600)).toBe(
      false
    );
    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.setHeader).toHaveBeenCalledWith('Retry-After', '30');
  });
});
