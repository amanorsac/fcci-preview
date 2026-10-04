// Validates a form submission against the form definitions captured from
// the source site. Only fields the form defines are kept.
const MAX_TEXT = 4000;
const EMAIL = /^[^\s@,;<>"]+@[^\s@,;<>".]+(\.[^\s@,;<>".]+)+$/;
const CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g;

const clean = (v) => String(v ?? '').replace(CONTROL, '').trim();

export function validateSubmission(body, formDefs) {
  const def = body && typeof body.formId === 'string' ? formDefs[body.formId] : undefined;
  if (!def) return { ok: false, errors: { formId: 'unknown_form' } };
  const values = body.values && typeof body.values === 'object' ? body.values : {};
  const errors = {};
  const fields = [];

  for (const f of def.fields) {
    if (f.type === 'note') continue;
    const raw = values[f.name];
    let value;
    if (f.type === 'checkbox') {
      const picked = (Array.isArray(raw) ? raw : raw ? [raw] : []).map(clean).filter(Boolean);
      if (picked.some((p) => !f.options?.includes(p))) { errors[f.name] = 'invalid_option'; continue; }
      value = picked.join(', ');
    } else {
      value = clean(raw);
      if (value.length > MAX_TEXT) { errors[f.name] = 'too_long'; continue; }
      if (value && (f.type === 'radio' || f.type === 'select') && !f.options?.includes(value)) {
        errors[f.name] = 'invalid_option'; continue;
      }
      if (value && f.type === 'email' && !EMAIL.test(value)) { errors[f.name] = 'invalid_email'; continue; }
    }
    if (f.required && !value) { errors[f.name] = 'required'; continue; }
    fields.push({ label: f.label, value });
  }

  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, value: { formId: body.formId, path: def.path, fields } };
}
