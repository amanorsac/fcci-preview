export const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function submissionEmail(sub, siteName) {
  const subject = `[${siteName} preview] ${sub.formId} — ${sub.path}`.replace(/[\r\n]+/g, ' ');
  const rows = sub.fields
    .map((f) => `<tr><th align="left" style="padding:6px 12px 6px 0;vertical-align:top">${escapeHtml(f.label)}</th><td style="padding:6px 0;white-space:pre-wrap">${escapeHtml(f.value || '—')}</td></tr>`)
    .join('');
  const html = `<p>Form <strong>${escapeHtml(sub.formId)}</strong> on <strong>${escapeHtml(sub.path)}</strong> (preview site).</p><table>${rows}</table>`;
  const text = sub.fields.map((f) => `${f.label}: ${f.value || '—'}`).join('\n');
  return { subject, html, text };
}
