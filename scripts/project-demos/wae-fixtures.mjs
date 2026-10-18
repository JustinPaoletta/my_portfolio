// Offline REST responses for the real export CLI. Unknown requests fail closed.
import fs from 'node:fs';
import process from 'node:process';
import { URL } from 'node:url';
const fixtures = JSON.parse(
  fs.readFileSync(process.env.WAE_DEMO_FIXTURES, 'utf8')
);
const localFetch = globalThis.fetch;

globalThis.fetch = async (input, init) => {
  const url = new URL(
    typeof input === 'string' ? input : (input.url ?? input.href)
  );
  if (url.origin === process.env.WAE_DEMO_WEBDAV)
    return localFetch(input, init);
  let data;
  if (url.href === 'https://oauth.wildapricot.org/auth/token') {
    data = { access_token: 'offline-demo-token', expires_in: 1800 };
  } else if (url.origin === 'https://api.wildapricot.org') {
    if (url.pathname === '/v2.2/accounts/123456/contacts') {
      data = { Contacts: fixtures.contacts };
    } else if (url.pathname === '/v2.2/accounts/123456/events') {
      data = { Events: fixtures.events };
    } else {
      data = fixtures.events.find(
        (event) => url.pathname === `/v2.2/accounts/123456/events/${event.Id}`
      );
    }
  }
  if (data === undefined)
    throw new Error(
      `Demo blocked unexpected request: ${url.origin}${url.pathname}`
    );
  return new globalThis.Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
};
