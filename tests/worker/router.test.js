import { describe, it, expect } from 'vitest';
import worker from '../../src/worker.js';

const assets = { fetch: async () => new Response('asset', { status: 200 }) };
const env = { ASSETS: assets, PREVIEW_INBOX: 'inbox@example.com' };

describe('router', () => {
  it('passes page requests to ASSETS', async () => {
    const res = await worker.fetch(new Request('http://x/'), env, {});
    expect(await res.text()).toBe('asset');
  });
  it('returns JSON 404 for unknown api paths', async () => {
    const res = await worker.fetch(new Request('http://x/api/nope'), env, {});
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ ok: false, error: 'not_found' });
  });
  it('rejects GET on /api/form with 405', async () => {
    const res = await worker.fetch(new Request('http://x/api/form'), env, {});
    expect(res.status).toBe(405);
    expect(res.headers.get('allow')).toBe('POST');
  });
});
