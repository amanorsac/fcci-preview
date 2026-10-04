import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseSourcePage, parseForms } from '../../scripts/lib/parse-source.mjs';

const src = (slug) => readFileSync(new URL(`../../source/pages/${slug}.md`, import.meta.url), 'utf8');
const raw = (slug) => readFileSync(new URL(`../../source/raw/${slug}.html`, import.meta.url), 'utf8');
const texts = (page) => page.segments.map((s) => s.text);

describe('parseSourcePage', () => {
  it('reads title, path and the first content heading of mission-and-vision', () => {
    const p = parseSourcePage(src('mission-and-vision'));
    expect(p.title).toBe('Faith Christian Center International - Mission and Vision');
    expect(p.path).toBe('/mission-and-vision');
    expect(p.segments[0]).toEqual({ kind: 'h1', text: 'Mission & Vision' });
    expect(texts(p).some((t) => t.startsWith('Faith Christian Center International is a thriving'))).toBe(true);
  });

  it('removes nav chrome from page segments', () => {
    const p = parseSourcePage(src('mission-and-vision'));
    expect(texts(p)).not.toContain("Pastor's Blog");
    expect(p.navChrome[0]).toBe('Home');
    expect(p.navChrome.at(-1)).toBe('Blog');
  });

  it('removes footer chrome and keeps it separately', () => {
    const p = parseSourcePage(src('mission-and-vision'));
    expect(texts(p)).not.toContain('2186 Richmond Road');
    expect(p.footerChrome.map((s) => s.text)).toContain('2186 Richmond Road');
    expect(p.footerChrome.map((s) => s.text)).not.toContain('powered by SnapPages');
  });

  it('maps the home page to "/" and keeps its headings', () => {
    const p = parseSourcePage(src('home'));
    expect(p.path).toBe('/');
    expect(p.segments).toContainEqual({ kind: 'h2', text: 'WELCOME HOME' });
    expect(p.segments).toContainEqual({ kind: 'h2', text: 'Latest Teaching' });
  });

  it('attaches hrefs to segments that are link labels', () => {
    const p = parseSourcePage(src('home'));
    const browse = p.segments.find((s) => s.text === 'Browse Sermons');
    expect(browse.href).toBe('/sermons');
  });

  it('round-trips special characters byte-for-byte', () => {
    const md = src('mission-and-vision').replace(
      '## The Mission',
      '## The Mission\n\n“curly” & café — emoji 🙏 and nbsp'
    );
    const p = parseSourcePage(md);
    expect(texts(p)).toContain('“curly” & café — emoji 🙏 and nbsp');
  });

  it('keeps a differing footer line as page content and reports it', () => {
    const md = src('mission-and-vision').replace('### Social Pages', 'An extra footer line\n\n### Social Pages');
    const p = parseSourcePage(md);
    expect(texts(p)).toContain('An extra footer line');
    expect(p.chromeMismatch).toBe(true);
  });

  it('lists the page images from both image sections', () => {
    const p = parseSourcePage(src('home'));
    expect(p.images.some((i) => i.src.endsWith('11503942_596x300_500.png'))).toBe(true);
    expect(p.images.every((i) => !i.src.endsWith('.ttf'))).toBe(true);
  });
});

describe('parseForms', () => {
  it('reads prayer-request labels, options, required flags and submit label verbatim', () => {
    const [form] = parseForms(raw('prayer-request'), 'prayer-request');
    expect(form.id).toBe('prayer-request-1');
    expect(form.submitLabel).toBe('Send');
    const labels = form.fields.map((f) => f.label);
    expect(labels).toEqual([
      'How can we pray for you?',
      'Would you like someone to follow up with you?',
      'First Name (optional)',
      'Last Name (optional)',
      'Email Address (optional)',
      'Phone Number (optional)',
    ]);
    expect(form.fields[0]).toMatchObject({ type: 'textarea', required: true });
    expect(form.fields[1]).toMatchObject({ type: 'radio', required: true, options: ['Yes', 'No'] });
    expect(form.fields[4].type).toBe('email');
    expect(form.fields[5].type).toBe('tel');
  });

  it('removes form text from the page segments and leaves a marker', () => {
    const p = parseSourcePage(src('prayer-request'), raw('prayer-request'));
    expect(texts(p)).not.toContain('How can we pray for you?');
    expect(texts(p)).not.toContain('Send');
    expect(p.segments).toContainEqual({ kind: 'form', formId: 'prayer-request-1', text: '' });
  });
});

describe('edge cases found during import', () => {
  it('removes a dropdown whose options were captured as one joined line', () => {
    const p = parseSourcePage(src('small-groups-less-than-20-groups'), raw('small-groups-less-than-20-groups'));
    expect(texts(p)).not.toContain('First Name');
    expect(texts(p).some((t) => t.startsWith('Downtown Group (Mondays @ 7:00pm)Ballard'))).toBe(false);
  });

  it('drops the old-host credit even when the page has its own footer', () => {
    const p = parseSourcePage(src('home-v2'));
    expect(texts(p)).not.toContain('powered by SnapPages');
    expect(texts(p)).not.toContain(':');
  });
});
