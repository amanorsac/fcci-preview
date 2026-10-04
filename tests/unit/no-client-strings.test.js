import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const FORBIDDEN = ['FCCI', 'Faith Christian', 'Charlottesville', 'fccintl', '#ee7b1a', 'subsplash.com'];

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
