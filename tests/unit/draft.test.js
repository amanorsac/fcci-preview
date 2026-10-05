import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { CLICHES, allDraft } from '../../scripts/lib/draft.mjs';

const drafts = allDraft('src/content/draft');

describe('draft copy', () => {
  it('has entries', () => {
    expect(drafts.length).toBeGreaterThan(0);
  });

  it('keeps every entry short and non-empty', () => {
    for (const d of drafts) {
      expect(d.text.trim(), `${d.file}:${d.key}`).not.toBe('');
      expect(d.text.length, `${d.file}:${d.key}`).toBeLessThanOrEqual(400);
    }
  });

  it('avoids generic church-website clichés', () => {
    for (const d of drafts) {
      const t = d.text.toLowerCase();
      for (const c of CLICHES) expect(t, `${d.file}:${d.key} uses "${c}"`).not.toContain(c);
    }
  });

  it('has unique keys per file', () => {
    for (const f of readdirSync('src/content/draft')) {
      const keys = JSON.parse(readFileSync(`src/content/draft/${f}`, 'utf8')).items.map((i) => i.key);
      expect(new Set(keys).size, f).toBe(keys.length);
    }
  });

  it('lists every draft line in docs/draft-copy.md for review', () => {
    const doc = readFileSync('docs/draft-copy.md', 'utf8');
    for (const d of drafts) expect(doc, `${d.file}:${d.key}`).toContain(d.text);
  });
});
