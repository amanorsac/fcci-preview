import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { site } from '../../site.config';

const lum = (h) => {
  const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const files = (dir) => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? files(join(dir, f)) : [join(dir, f)]));

describe('gradient text stays readable', () => {
  it('both text-gradient stops reach 3:1 on the white and off-white backgrounds', () => {
    const { gradTextFrom, gradTextTo, paper, paper2 } = site.colors;
    for (const stop of [gradTextFrom, gradTextTo]) for (const bg of [paper, paper2]) {
      expect(ratio(stop, bg), `${stop} on ${bg}`).toBeGreaterThanOrEqual(3);
    }
  });

  it('text clipped to a gradient uses the text gradient, not the decorative one', () => {
    for (const f of files('src').filter((p) => /\.(astro|css)$/.test(p))) {
      const rules = readFileSync(f, 'utf8').split('}').filter((r) => /background-clip:\s*text/.test(r));
      for (const r of rules) expect(r, f).not.toMatch(/var\(--grad\)/);
    }
  });
});
