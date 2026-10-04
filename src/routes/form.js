import formDefs from '../form/form-defs.json';
import { validateSubmission } from '../form/validate.js';
import { submissionEmail } from '../form/email.js';

const MAX_BODY = 32 * 1024;
const TIMEOUT = 8000;
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });

async function verifyTurnstile(env, token, ip) {
  const form = new FormData();
  form.append('secret', env.TURNSTILE_SECRET);
  form.append('response', String(token || ''));
  if (ip) form.append('remoteip', ip);
  try {
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', body: form, signal: AbortSignal.timeout(TIMEOUT),
    });
    return r.ok && (await r.json()).success === true;
  } catch {
    return false;
  }
}

export async function handleForm(request, env) {
  const text = await request.text();
  if (text.length > MAX_BODY) return json({ ok: false, error: 'too_large' }, 413);
  let body;
  try { body = JSON.parse(text); } catch { return json({ ok: false, error: 'bad_json' }, 400); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ ok: false, error: 'bad_json' }, 400);

  if (body.company_hp) {
    console.warn('[form] honeypot hit');
    return json({ ok: true });
  }
  if (env.TURNSTILE_SECRET && !(await verifyTurnstile(env, body.turnstile, request.headers.get('cf-connecting-ip')))) {
    return json({ ok: false, error: 'captcha' }, 403);
  }
  const result = validateSubmission(body, formDefs);
  if (!result.ok) return json({ ok: false, errors: result.errors }, 400);
  if (!env.RESEND_API_KEY || !env.PREVIEW_INBOX) {
    console.error('[form] missing RESEND_API_KEY or PREVIEW_INBOX');
    return json({ ok: false, error: 'server' }, 500);
  }

  const mail = submissionEmail(result.value, env.SITE_SHORT_NAME || 'Site');
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${env.RESEND_API_KEY}` },
      body: JSON.stringify({ from: env.MAIL_FROM || 'Preview Forms <onboarding@resend.dev>', to: [env.PREVIEW_INBOX], ...mail }),
      signal: AbortSignal.timeout(TIMEOUT),
    });
    if (!r.ok) {
      console.error('[form] email failed with status', r.status);
      return json({ ok: false, error: 'server' }, 500);
    }
  } catch {
    console.error('[form] email request failed');
    return json({ ok: false, error: 'server' }, 500);
  }
  return json({ ok: true });
}
