import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { extractBuiltSegments, normalize } from './extract.mjs';
import { ALLOWED_EXTRA_TEXT, SHARED_CHROME_TEXT, site } from '../../site.config';
import chrome from '../../src/content/chrome.json' with { type: 'json' };
import { DROPPED_SOURCE_TEXT } from '../../scripts/lib/parse-source.mjs';
import { allDraft } from '../../scripts/lib/draft.mjs';

// New wording written for the redesign (reviewed via docs/draft-copy.md).
const DRAFT_TEXT = allDraft('src/content/draft').map((d) => normalize(d.text));

describe('extractBuiltSegments', () => {
  it('skips aria-hidden, screen-reader-only, hidden and script content', () => {
    const html = `<body><p>Seen  text</p><div aria-hidden="true">no</div><span class="sr-only">no</span>
      <p hidden>no</p><script>no()</script><a href="#">Link</a></body>`;
    expect(extractBuiltSegments(html)).toEqual(['Seen text', 'Link']);
  });
});

// Ground truth: the crawl's verbatim VISIBLE TEXT for each page.
function sourceLines(md) {
  const lines = md.split(/\r?\n/);
  const start = lines.findIndex((l) => l.startsWith('## VISIBLE TEXT'));
  const end = lines.findIndex((l, i) => i > start && /^## (LINKS|IMAGES|EMBEDS|ALL STORAGE)/.test(l));
  return lines.slice(start + 1, end === -1 ? undefined : end)
    .map((l) => normalize(l.replace(/^#{1,3} /, '')))
    .filter((l) => l && !/^#{1,3}$/.test(l));
}

// Permitted, test-visible absences (each one backed by a ledger ruling).
const PERMITTED_COLLAPSE = {
  // The old site repeats the library tab row for small screens; shown once.
  '/sermons': ['Series', 'Topics', 'Speakers', 'Scripture'],
};

const SMS = /(text ([A-Z0-9]{3,}) to ((?:1-)?\d{3}-\d{3}-\d{4}))/;
const builtFile = (path) => join('dist', path === '/' ? '' : path, 'index.html');
const pages = readdirSync('src/content/pages').map((f) => JSON.parse(readFileSync(join('src/content/pages', f), 'utf8')));

/** How many times `line` appears as one text node or as 2-6 adjacent nodes
 *  (split buttons, tap-to-text links, dropdown options captured as one line). */
function occurrences(nodes, line) {
  let n = 0;
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i] === line) { n += 1; continue; }
    for (let k = 2; k <= 6 && i + k <= nodes.length; k++) {
      const run = nodes.slice(i, i + k);
      if (normalize(run.join(' ')) === line || run.join('') === line) { n += 1; break; }
    }
  }
  return n;
}

describe('wording fidelity on every page', () => {
  it('has a build to check', () => {
    expect(existsSync('dist/index.html'), 'run `npm run build` first').toBe(true);
  });

  for (const page of pages) {
    it(`${page.path} shows every source line (with its count) and nothing else`, () => {
      const nodes = extractBuiltSegments(readFileSync(builtFile(page.path), 'utf8'));
      const md = readFileSync(join('source/pages', `${page.slug}.md`), 'utf8');

      // Required: every source line, as often as the source shows it, minus
      // the permitted absences.
      const absent = new Set([
        ...DROPPED_SOURCE_TEXT,
        ...page.forms.flatMap((f) => f.droppedControls ?? []),
      ].map(normalize));
      const need = new Map();
      for (const l of sourceLines(md)) if (!absent.has(l)) need.set(l, (need.get(l) ?? 0) + 1);
      for (const l of PERMITTED_COLLAPSE[page.path] ?? []) if (need.has(l)) need.set(l, 1);
      // The old site's menu is replaced by the v2 menu (spec v2 §4); its labels
      // are chrome, not page content. Subtract exactly those occurrences.
      for (const l of page.navChrome.map(normalize)) if (need.has(l)) need.set(l, need.get(l) - 1);
      for (const [l, n] of need) if (n <= 0) need.delete(l);

      const missing = [];
      for (const [line, count] of need) {
        const have = occurrences(nodes, line);
        if (have < count) missing.push(`${line} (${have}/${count})`);
      }

      // Allowed: exact source lines, form text, shared chrome and preview
      // text, plus the known pieces of lines the design splits up.
      // Form text must come from the source capture too, never from the
      // imported data (which is what this test is checking).
      const src = sourceLines(md);
      const optionPieces = page.forms.flatMap((f) => f.fields)
        .filter((x) => x.type === 'select' && src.includes(normalize((x.options ?? []).join(''))))
        .flatMap((x) => x.options.map(normalize));
      const allowed = new Set([
        ...src, ...optionPieces,
        // A page with its own footer must not also show the shared footer.
        ...(page.chromeMismatch
          ? SHARED_CHROME_TEXT.filter((t) => !chrome.footer.some((s) => s.text === t))
          : SHARED_CHROME_TEXT).map(normalize),
        ...ALLOWED_EXTRA_TEXT.map(normalize),
        ...DRAFT_TEXT,
        ...page.forms.flatMap((f) => [f.successText, site.formDefaultSuccess]).filter(Boolean).map(normalize),
      ]);
      for (const s of page.segments) {
        for (const p of s.parts ?? []) allowed.add(normalize(p.text));
        const m = s.text.match(SMS);
        if (m) {
          const at = s.text.indexOf(m[1]);
          [s.text.slice(0, at), m[1], s.text.slice(at + m[1].length)].map(normalize).filter(Boolean).forEach((x) => allowed.add(x));
        }
      }
      const extra = nodes.filter((t) => !allowed.has(t));

      expect({ path: page.path, missing, extra }).toEqual({ path: page.path, missing: [], extra: [] });
    });
  }
});

// New pages carry only church text (from any page) or reviewable draft text.
describe('new pages use only church or draft wording', () => {
  const corpus = new Set(pages.flatMap((p) => sourceLines(readFileSync(join('source/pages', `${p.slug}.md`), 'utf8'))));
  const formWords = pages.flatMap((p) => p.forms.flatMap((f) => [f.legend, f.submitLabel, f.successText,
    ...f.fields.flatMap((x) => [x.label, ...(x.options ?? [])])])).filter(Boolean).map(normalize);
  const allowed = new Set([...corpus, ...formWords, ...DRAFT_TEXT,
    ...SHARED_CHROME_TEXT.map(normalize), ...ALLOWED_EXTRA_TEXT.map(normalize), normalize(site.formDefaultSuccess)]);
  for (const path of ['/dream-team', '/ministries', '/next-steps']) {
    it(path, () => {
      const nodes = extractBuiltSegments(readFileSync(builtFile(path), 'utf8'));
      expect(nodes.filter((t) => !allowed.has(t))).toEqual([]);
    });
  }
});
