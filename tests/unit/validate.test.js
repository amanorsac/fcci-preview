import { describe, it, expect } from 'vitest';
import { validateSubmission } from '../../src/form/validate.js';

const defs = {
  'prayer-request-1': {
    path: '/prayer-request',
    fields: [
      { name: 'f0', type: 'textarea', label: 'How can we pray for you?', required: true },
      { name: 'f1', type: 'radio', label: 'Follow up?', required: true, options: ['Yes', 'No'] },
      { name: 'f2', type: 'email', label: 'Email Address (optional)', required: false },
      { name: 'f3', type: 'checkbox', label: 'Interests', required: false, options: ['A', 'B'] },
      { name: 'f4', type: 'note', label: 'A note', required: false },
    ],
  },
};
const ok = { formId: 'prayer-request-1', values: { f0: 'Please pray', f1: 'Yes', f2: '', f3: ['A'] } };

describe('validateSubmission', () => {
  it('accepts a valid submission and labels the values', () => {
    const r = validateSubmission(ok, defs);
    expect(r.ok).toBe(true);
    expect(r.value.path).toBe('/prayer-request');
    expect(r.value.fields[0]).toEqual({ label: 'How can we pray for you?', value: 'Please pray' });
    expect(r.value.fields[3]).toEqual({ label: 'Interests', value: 'A' });
  });
  it('rejects an unknown form id', () => {
    expect(validateSubmission({ ...ok, formId: 'nope' }, defs)).toEqual({ ok: false, errors: { formId: 'unknown_form' } });
  });
  it('drops fields that are not part of the form', () => {
    const r = validateSubmission({ ...ok, values: { ...ok.values, evil: 'x' } }, defs);
    expect(r.value.fields.map((f) => f.label)).not.toContain('evil');
  });
  it('requires required fields', () => {
    const r = validateSubmission({ ...ok, values: { ...ok.values, f0: '  ' } }, defs);
    expect(r.errors.f0).toBe('required');
  });
  it('rejects a bad email', () => {
    expect(validateSubmission({ ...ok, values: { ...ok.values, f2: 'not-an-email' } }, defs).errors.f2).toBe('invalid_email');
  });
  it('rejects options that are not offered', () => {
    expect(validateSubmission({ ...ok, values: { ...ok.values, f1: 'Maybe' } }, defs).errors.f1).toBe('invalid_option');
    expect(validateSubmission({ ...ok, values: { ...ok.values, f3: ['Z'] } }, defs).errors.f3).toBe('invalid_option');
  });
  it('strips control characters but keeps line breaks', () => {
    const r = validateSubmission({ ...ok, values: { ...ok.values, f0: 'a\u0000b\nc\td' } }, defs);
    expect(r.value.fields[0].value).toBe('ab\nc\td');
  });
  it('rejects text over 4000 characters', () => {
    expect(validateSubmission({ ...ok, values: { ...ok.values, f0: 'x'.repeat(4001) } }, defs).errors.f0).toBe('too_long');
  });
});
