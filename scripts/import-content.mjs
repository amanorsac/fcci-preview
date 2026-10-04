// Turns the captured site in source/ into content JSON for Astro.
// Run with `npm run import`. Output is committed; never hand-edit it.
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseSourcePage } from './lib/parse-source.mjs';

const SITE_ORIGIN = 'https://www.fcci.life';
const group = (layout, slugs) => Object.fromEntries(slugs.map((s) => [s, layout]));

// Spec §4: which layout renders each source page (keyed by file stem).
export const LAYOUT_BY_SLUG = {
  ...group('home', ['home', 'home-v2', 'home-app']),
  ...group('standard', [
    'mission-and-vision', 'what-we-believe', 'leadership', 'our-story', 'jesus',
    'growth-track', 'connect-groups', 'scriptures', 'fasting', 'loveandserve',
    'easter', 'wop', 'messaging', 'sanctuarytap', 'i-m-new', 'contact', 'testimonies',
    'pastor-s-blog',
  ]),
  ...group('ministry', ['kidz-amp-youth', 'men', 'women', 'students', 'preschool']),
  ...group('media', ['sermons', 'media_live', 'watch-live', 'watch', 'give', 'calendar']),
  ...group('blog', [
    'blog',
    'blog_2025_10_25_unlocking-the-power-of-biblical-meditation-a-path-to-spiritual-growth',
    'blog_tag_faith', 'blog_tag_fcci', 'blog_tag_fccination', 'blog_tag_reachteachtransform',
  ]),
  ...group('form', [
    'prayer-request', 'connect-card', 'volunteer-signup', 'event-signup', 'baptism-signup',
    'bible-reading-group-signup', 'small-groups-20-groups', 'small-groups-less-than-20-groups',
  ]),
};

// Pages known to carry their own nav/footer instead of the shared chrome.
export const CHROME_ALLOWLIST = ['home-v2'];

export function importAll({ srcDir, outDir, formsOut, chromeOut = join(outDir, 'chrome.json'), chromeAllowlist = CHROME_ALLOWLIST }) {
  const pagesDir = join(srcDir, 'pages');
  const rawDir = join(srcDir, 'raw');
  mkdirSync(outDir, { recursive: true });
  mkdirSync(dirname(formsOut), { recursive: true });

  const formDefs = {};
  const chromeMismatches = [];
  let count = 0;
  let homePage;

  const parsed = readdirSync(pagesDir).filter((f) => f.endsWith('.md')).sort().map((file) => {
    const stem = basename(file, '.md');
    const rawPath = join(rawDir, `${stem}.html`);
    const raw = existsSync(rawPath) ? readFileSync(rawPath, 'utf8') : undefined;
    return { stem, page: parseSourcePage(readFileSync(join(pagesDir, file), 'utf8'), raw) };
  });

  // Local links only for pages that exist in the preview; anything else on
  // the old site (sermon library routes, broken links) points back to it.
  const known = new Set(parsed.map(({ page }) => page.path));
  const fixHref = (href) => {
    if (!href || !href.startsWith('/')) return href;
    const path = href.split('#')[0] || '/';
    return known.has(path) ? href : SITE_ORIGIN + href;
  };
  const fixSeg = (seg) => ({
    ...seg,
    ...(seg.href ? { href: fixHref(seg.href) } : {}),
    ...(seg.parts ? { parts: seg.parts.map((p) => (p.href ? { ...p, href: fixHref(p.href) } : p)) } : {}),
  });

  for (const { stem, page: rawPage } of parsed) {
    const page = {
      ...rawPage,
      segments: rawPage.segments.map(fixSeg),
      footerChrome: rawPage.footerChrome.map(fixSeg),
      links: rawPage.links.map((l) => ({ ...l, href: fixHref(l.href) })),
    };
    const layout = LAYOUT_BY_SLUG[stem];
    if (!layout) throw new Error(`No layout mapped for source page "${stem}"`);

    const out = { ...page, slug: stem, layout };
    writeFileSync(join(outDir, `${stem}.json`), JSON.stringify(out, null, 2) + '\n');
    if (page.chromeMismatch) chromeMismatches.push(stem);
    for (const f of page.forms) formDefs[f.id] = { path: page.path, ...f };
    if (stem === 'home') homePage = page;
    count += 1;
  }

  const unexpected = chromeMismatches.filter((s) => !chromeAllowlist.includes(s));
  if (unexpected.length) {
    throw new Error(`Pages whose nav/footer differ from the shared chrome: ${unexpected.join(', ')}. Review them, then add to CHROME_ALLOWLIST.`);
  }
  const chrome = { nav: homePage.navChrome, footer: homePage.footerChrome };
  writeFileSync(chromeOut, JSON.stringify(chrome, null, 2) + '\n');
  writeFileSync(formsOut, JSON.stringify(formDefs, null, 2) + '\n');
  return { pages: count, chromeMismatches };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const result = importAll({
    srcDir: 'source',
    outDir: 'src/content/pages',
    formsOut: 'src/form/form-defs.json',
    chromeOut: 'src/content/chrome.json',
  });
  console.log(`Imported ${result.pages} pages.`);
  console.log(`Chrome mismatches: ${result.chromeMismatches.join(', ') || 'none'}`);
}
