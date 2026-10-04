import { describe, it, expect } from 'vitest';
import { mkdtempSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { importAll, LAYOUT_BY_SLUG } from '../../scripts/import-content.mjs';

describe('importAll', () => {
  const out = mkdtempSync(join(tmpdir(), 'fcci-import-'));
  const formsOut = join(out, 'form-defs.json');
  const result = importAll({ srcDir: 'source', outDir: out, formsOut });

  it('writes one json file per source page plus chrome.json', () => {
    expect(result.pages).toBe(46);
    const files = readdirSync(out).filter((f) => f.endsWith('.json') && f !== 'chrome.json' && f !== 'form-defs.json');
    expect(files).toHaveLength(46);
  });

  it('gives every page a known layout', () => {
    expect(Object.keys(LAYOUT_BY_SLUG)).toHaveLength(46);
    const page = JSON.parse(readFileSync(join(out, 'give.json'), 'utf8'));
    expect(page.layout).toBe('media');
  });

  it('writes the shared chrome from the home page', () => {
    const chrome = JSON.parse(readFileSync(join(out, 'chrome.json'), 'utf8'));
    expect(chrome.nav[0]).toBe('Home');
    expect(chrome.footer.map((s) => s.text)).toContain('Sunday- 10:00am');
  });

  it('writes form definitions keyed by form id', () => {
    const defs = JSON.parse(readFileSync(formsOut, 'utf8'));
    expect(defs['prayer-request-1'].path).toBe('/prayer-request');
    expect(defs['prayer-request-1'].fields.length).toBeGreaterThan(3);
  });
});

describe('links outside the captured pages', () => {
  const out = mkdtempSync(join(tmpdir(), 'fcci-import-ext-'));
  importAll({ srcDir: 'source', outDir: out, formsOut: join(out, 'f.json'), chromeOut: join(out, 'c.json') });
  const page = (s) => JSON.parse(readFileSync(join(out, `${s}.json`), 'utf8'));

  it('point back to the live site', () => {
    const seg = page('sermons').segments.find((s) => s.text === 'Built Different');
    expect(seg.href).toBe('https://www.fcci.life/media/series/6n9ctk3/built-different');
  });

  it('keep captured pages local', () => {
    const seg = page('home').segments.find((s) => s.text === 'Browse Sermons');
    expect(seg.href).toBe('/sermons');
  });
});

describe('chrome mismatches', () => {
  it('fail the import unless the page is on the allowlist', () => {
    const out = mkdtempSync(join(tmpdir(), 'fcci-import-cm-'));
    expect(() => importAll({ srcDir: 'source', outDir: out, formsOut: join(out, 'f.json'), chromeOut: join(out, 'c.json'), chromeAllowlist: [] }))
      .toThrow(/home-v2/);
  });
});
