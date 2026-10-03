// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import contact from '../api/contact';
import pets from '../api/pet-dogs';
import github from '../api/github';

const { evalMock } = vi.hoisted(() => ({ evalMock: vi.fn() }));
vi.mock('@upstash/redis', () => ({
  Redis: class {
    eval = evalMock;
  },
}));

function request(body: unknown = {}, headers: Record<string, string> = {}) {
  return {
    method: 'POST',
    body,
    headers: { 'content-type': 'application/json', ...headers },
    socket: { remoteAddress: '192.0.2.5' },
    query: {},
  } as VercelRequest;
}
function response() {
  const res = {
    setHeader: vi.fn(),
    status: vi.fn(),
    json: vi.fn(),
    end: vi.fn(),
  };
  res.status.mockReturnValue(res);
  return res as unknown as VercelResponse;
}

beforeEach(() => {
  vi.stubEnv('KV_REST_API_URL', 'https://redis.example');
  vi.stubEnv('KV_REST_API_TOKEN', 'test-token');
  vi.stubEnv('RESEND_API_KEY', 'test-key');
  vi.stubEnv('CONTACT_EMAIL', 'owner@example.com');
  evalMock.mockReset().mockResolvedValue(1);
  vi.stubGlobal('fetch', vi.fn());
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('API security integration', () => {
  it('rejects foreign-origin contact requests before sending email', async () => {
    const res = response();
    await contact(
      request(
        {},
        { host: 'jpengineering.dev', origin: 'https://evil.example' }
      ),
      res
    );
    expect(res.status).toHaveBeenCalledWith(403);
    expect(fetch).not.toHaveBeenCalled();
  });
  it('blocks excess contact submissions before calling Resend', async () => {
    evalMock.mockResolvedValue(6);
    const res = response();
    await contact(
      request({
        name: 'Test User',
        email: 'test@example.com',
        message: 'A valid contact message.',
      }),
      res
    );
    expect(res.status).toHaveBeenCalledWith(429);
    expect(fetch).not.toHaveBeenCalled();
  });
  it('keeps valid contact submissions working and escapes their HTML', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ id: 'email-id' }), { status: 200 })
    );
    const res = response();
    await contact(
      request({
        name: '<Test>',
        email: 'test@example.com',
        message: '<script>hello</script>',
      }),
      res
    );
    expect(res.status).toHaveBeenCalledWith(200);
    const payload = JSON.parse(
      vi.mocked(fetch).mock.calls[0][1]?.body as string
    );
    expect(payload.html).toContain('&lt;script&gt;hello&lt;/script&gt;');
    expect(payload.reply_to).toBe('test@example.com');
  });
  it('rejects unknown dogs before creating persistent keys', async () => {
    const res = response();
    await pets(request({ dogName: 'unbounded-key', action: 'treat' }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(evalMock).toHaveBeenCalledTimes(1); // limiter only
  });
  it('updates known dogs atomically without changing the response format', async () => {
    evalMock
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce({ treats: 4, scritches: 2 });
    const res = response();
    await pets(request({ dogName: ' Nala ', action: 'treat' }), res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      stats: { treats: 4, scritches: 2 },
    });
    expect(evalMock.mock.calls[1][1]).toEqual(['pet-dogs:Nala']);
    expect(evalMock.mock.calls[1][2]).toEqual(['treats']);
  });
  it('limits pet reads before querying Redis records', async () => {
    evalMock.mockResolvedValue(121);
    const req = request();
    req.method = 'GET';
    const res = response();
    await pets(req, res);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(evalMock).toHaveBeenCalledTimes(1);
  });
  it('bounds GitHub usernames before spending token quota', async () => {
    const req = request();
    req.method = 'GET';
    req.query = { username: 'a'.repeat(1000) };
    const res = response();
    await github(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(fetch).not.toHaveBeenCalled();
  });
});
