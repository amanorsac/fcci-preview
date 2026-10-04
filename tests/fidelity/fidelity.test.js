import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { extractBuiltSegments, normalize } from './extract.mjs';
import { ALLOWED_EXTRA_TEXT, SHARED_CHROME_TEXT, site } from '../../site.config';

describe('extractBuiltSegments', () => {
  it('skips aria-hidden, screen-reader-only, hidden and script content', () => {
    const html = `<body><p>Seen  text</p><div aria-hidden="true">no</div><span class="sr-only">no</span>
      <p hidden>no</p><script>no()</script><a href="#">Link</a></body>`;
    expect(extractBuiltSegments(html)).toEqual(['Seen text', 'Link']);
  });
});

const PAGES_DIR = 'src/content/pages';
const builtFile = (path) => join('dist', path === '/' ? '' : path, 'index.html');
const pages = readdirSync(PAGES_DIR).map((f) => JSON.parse(readFileSync(join(PAGES_DIR, f), 'utf8')));

// Text a form shows before it is submitted.
const formTexts = (page) =>
  page.forms.flatMap((f) => [
    f.legend, f.submitLabel,
    ...f.fields.flatMap((x) => [x.label, ...(x.options ?? [])]),
  ]).filter(Boolean);
// Text a form shows only after submitting (the church's own confirmation).
const afterSubmitTexts = (page) =>
  page.forms.flatMap((f) => [f.successText, site.formDefaultSuccess]).filter(Boolean);

describe('wording fidelity on every page', () => {
  it('has a build to check', () => {
    expect(existsSync('dist/index.html'), 'run `npm run build` first').toBe(true);
  });

  for (const page of pages) {
    it(`${page.path} shows every source line and nothing else`, () => {
      const built = extractBuiltSegments(readFileSync(builtFile(page.path), 'utf8'));
      const joined = normalize(built.join(' '));

      const required = [...page.segments.filter((s) => s.kind !== 'form').map((s) => s.text), ...formTexts(page)]
        .map(normalize).filter(Boolean);
      const missing = required.filter((t) => !joined.includes(t));

      const allowed = [...page.segments.map((s) => s.text), ...formTexts(page), ...afterSubmitTexts(page), ...SHARED_CHROME_TEXT, ...ALLOWED_EXTRA_TEXT]
        .map(normalize).filter(Boolean);
      const extra = built.filter((t) => !allowed.some((a) => a.includes(t)));

      expect({ path: page.path, missing, extra }).toEqual({ path: page.path, missing: [], extra: [] });
    });
  }
});
