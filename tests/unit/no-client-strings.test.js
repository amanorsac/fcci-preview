import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const FORBIDDEN = ['FCCI', 'Faith Christian', 'Charlottesville', 'fccintl', '#ee7b1a', 'subsplash.com',
  // the accent as rgb, and hand-darkened shades of it
  '238, 123, 26', '238,123,26', '#b4570d', '#8a4a12', '#d8660f'];

function files(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : [p];
  });
}

describe('components and layouts stay client-neutral', () => {
  for (const file of [...files('src/components'), ...files('src/layouts')]) {
    it(`${file} has no client-specific strings`, () => {
      const text = readFileSync(file, 'utf8');
      for (const s of FORBIDDEN) expect(text.toLowerCase()).not.toContain(s.toLowerCase());
    });
  }
});

import { site } from '../../site.config';
import { allDraft } from '../../scripts/lib/draft.mjs';

describe('menu labels are church or draft wording', () => {
  it('every nav label comes from the church site or the draft files', () => {
    const corpus = new Set(readdirSync('source/pages').flatMap((f) =>
      readFileSync(`source/pages/${f}`, 'utf8').split(/\r?\n/).map((l) => l.replace(/^#{1,3} /, '').trim())));
    const draft = new Set(allDraft('src/content/draft').map((d) => d.text));
    const labels = site.nav.flatMap((n) => [n.label, ...(n.children ?? []).map((c) => c.label)]);
    for (const l of labels) expect(corpus.has(l) || draft.has(l), l).toBe(true);
  });
});
