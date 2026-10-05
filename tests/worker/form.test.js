import { describe, it, expect, vi, afterEach } from 'vitest';
import worker from '../../src/worker.js';
import defs from '../../src/form/form-defs.json';

const env = { ASSETS: { fetch: async () => new Response('x') }, PREVIEW_INBOX: 'inbox@example.com', RESEND_API_KEY: 'k', SITE_SHORT_NAME: 'FCCI' };
const formId = 'prayer-request-1';
const required = Object.fromEntries(defs[formId].fields.filter((f) => f.required).map((f) => [f.name, f.options ? f.options[0] : 'Please pray']));
const post = (body, e = env, ctx = { waitUntil: (p) => p }) =>
  worker.fetch(new Request('http://x/api/form', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }), e, ctx);

afterEach(() => vi.restoreAllMocks());

describe('POST /api/form', () => {
  it('emails the preview inbox, never the church', async () => {
    const calls = [];
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => { calls.push({ url: String(url), body: JSON.parse(init.body) }); return new Response('{}', { status: 200 }); });
    const res = await post({ formId, values: required });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe('https://api.resend.com/emails');
    expect(calls[0].body.to).toEqual(['inbox@example.com']);
    expect(JSON.stringify(calls[0].body)).not.toContain('fccintl.org');
    expect(calls[0].body.subject).toBe('[FCCI preview] prayer-request-1 — /prayer-request');
  });
  it('escapes HTML typed into a field', async () => {
    let html = '';
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (_u, init) => { html = JSON.parse(init.body).html; return new Response('{}'); });
    const first = defs[formId].fields.find((f) => f.type === 'textarea').name;
    await post({ formId, values: { ...required, [first]: '<img src=x onerror=alert(1)>' } });
    expect(html).toContain('&lt;img');
    expect(html).not.toContain('<img src=x');
  });
  it('treats a filled honeypot as success without sending', async () => {
    const spy = vi.spyOn(globalThis, 'fetch');
    const res = await post({ formId, values: required, company_hp: 'bot' });
    expect(res.status).toBe(200);
    expect(spy).not.toHaveBeenCalled();
  });
  it('rejects unknown forms without sending', async () => {
    const spy = vi.spyOn(globalThis, 'fetch');
    const res = await post({ formId: 'nope', values: {} });
    expect(res.status).toBe(400);
    expect(spy).not.toHaveBeenCalled();
  });
  it('returns 500 when the email key is missing', async () => {
    const res = await post({ formId, values: required }, { ...env, RESEND_API_KEY: '' });
    expect(res.status).toBe(500);
  });
  it('answers a JSON null body with 400', async () => {
    const res = await worker.fetch(new Request('http://x/api/form', { method: 'POST', body: 'null' }), env, {});
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ ok: false, error: 'bad_json' });
  });
  it('returns 413 for oversized bodies', async () => {
    const res = await post({ formId, values: { f0: 'x'.repeat(40000) } });
    expect(res.status).toBe(413);
  });
});
