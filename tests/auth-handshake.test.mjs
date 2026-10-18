import test from 'node:test';
import assert from 'node:assert/strict';
import { csrfFetch, clearCachedCsrfToken } from '../resources/js/config/api.js';
import { authFetch } from '../resources/js/services/auth/authRequest.js';
import { apiRequest, logoutRequest } from '../resources/js/services/super-admin/superAdminApi.js';

const json = (status, body = {}) => new Response(JSON.stringify(body), {status, headers: {'Content-Type':'application/json'}});
function mock(t, handler) {
  clearCachedCsrfToken();
  const original = globalThis.fetch;
  const windowBefore = globalThis.window;
  const events = [];
  globalThis.window = {setTimeout, clearTimeout, dispatchEvent: (event) => events.push(event.type)};
  globalThis.fetch = handler;
  t.after(() => { globalThis.fetch = original; globalThis.window = windowBefore; clearCachedCsrfToken(); });
  return events;
}

test('expired CSRF is refreshed once and preserves JSON method, body and cookies', async (t) => {
  let tokens = 0, writes = 0;
  mock(t, async (url, options) => {
    assert.equal(options.credentials, 'include');
    if (url.endsWith('/api/csrf-token')) return json(200, {token: ++tokens === 1 ? 'old' : 'new'});
    writes++;
    assert.equal(options.method, 'PUT');
    assert.equal(options.body, '{"rating":4}');
    assert.equal(options.headers.get('X-CSRF-TOKEN'), writes === 1 ? 'old' : 'new');
    return json(writes === 1 ? 419 : 200);
  });
  assert.equal((await csrfFetch('/api/user/reviews/1', {method:'PUT', body:'{"rating":4}'})).status, 200);
  assert.equal(tokens, 2); assert.equal(writes, 2);
});

test('unauthenticated and forbidden responses never replay mutations', async (t) => {
  let writes = 0, status = 401;
  mock(t, async (url) => url.endsWith('/api/csrf-token') ? json(200, {token:'x'}) : (++writes, json(status)));
  assert.equal((await csrfFetch('/protected', {method:'DELETE'})).status, 401);
  status = 403;
  assert.equal((await csrfFetch('/protected', {method:'DELETE'})).status, 403);
  assert.equal(writes, 2);
});

test('persistent CSRF failure stops after one retry; GET does not fetch a token', async (t) => {
  let writes = 0, tokens = 0;
  mock(t, async (url) => url.endsWith('/api/csrf-token') ? (++tokens, json(200, {token:'x'})) : (++writes, json(419)));
  assert.equal((await csrfFetch('/protected', {method:'POST'})).status, 419);
  assert.equal(writes, 2); assert.equal(tokens, 2);
  await csrfFetch('/api/session/status'); assert.equal(tokens, 2);
});

test('login wrapper recovers a stale token and returns successful authentication', async (t) => {
  let writes = 0;
  mock(t, async (url) => url.endsWith('/api/csrf-token') ? json(200, {token:'fresh'}) : json(++writes === 1 ? 419 : 200, {authenticated:true}));
  const response = await authFetch('/login/verify-otp', {method:'POST', body:'{}'});
  assert.equal(response.status, 200); assert.equal((await response.json()).authenticated, true);
  assert.equal(writes, 2);
});

test('admin uploads preserve FormData and browser multipart boundary on retry', async (t) => {
  const body = new FormData(); body.set('name', 'Demo');
  let writes = 0;
  mock(t, async (url, options) => {
    if (url.endsWith('/api/csrf-token')) return json(200, {token:'fresh'});
    assert.equal(options.body, body); assert.equal(options.headers.has('Content-Type'), false);
    return json(++writes === 1 ? 419 : 200, {success:true});
  });
  assert.deepEqual(await apiRequest('/api/super-admin/products', {method:'POST', body, formData:true}), {success:true});
  assert.equal(writes, 2);
});

test('failed logout keeps presence monitoring active; successful logout signals completion', async (t) => {
  let status = 500;
  const events = mock(t, async (url) => url.endsWith('/api/csrf-token') ? json(200, {token:'x'}) : json(url.endsWith('/logout') ? status : 200));
  await assert.rejects(logoutRequest(), /Logout failed/);
  assert.deepEqual(events, []);
  status = 200; await logoutRequest();
  assert.deepEqual(events, ['wbo:logout-started']);
});

test('login timeout also applies while waiting for the CSRF handshake', async (t) => {
  mock(t, () => new Promise(() => {}));
  const response = await authFetch('/login', {method:'POST', body:'{}'}, 20);
  assert.equal(response.status, 408);
});
