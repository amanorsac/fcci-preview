import { test, expect } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';

const pages = readdirSync('src/content/pages').map((f) => JSON.parse(readFileSync(`src/content/pages/${f}`, 'utf8')));
// Old-host links the redesign deliberately does not carry over.
// /about and /connect are 404 menu-group parents on the old site (spec: non-link groups).
const NOT_CARRIED = [/snappages\.com/, /^https:\/\/connect@/, /^https:\/\/www\.fcci\.life\/(about|connect)$/];

test.use({ reducedMotion: 'reduce' });
test.describe.configure({ mode: 'serial' });

test('every source path returns 200 with no horizontal scroll at 375px', async ({ page }) => {
  test.setTimeout(300000);
  await page.setViewportSize({ width: 375, height: 800 });
  for (const p of pages) {
    const res = await page.goto(p.path);
    expect(res.status(), p.path).toBe(200);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), p.path).toBe(true);
  }
});

test('internal links resolve and source external links are present', async ({ page, request }) => {
  test.setTimeout(300000);
  const checked = new Map();
  for (const p of pages) {
    await page.goto(p.path);
    const hrefs = await page.locator('a[href]').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
    for (const h of hrefs.filter((h) => h.startsWith('/'))) {
      const path = h.split('#')[0] || '/';
      if (!checked.has(path)) checked.set(path, (await request.get(path)).status());
      expect(checked.get(path), `${p.path} -> ${h}`).toBe(200);
    }
    const external = p.links.map((l) => l.href).filter((h) => /^https?:/.test(h) && !NOT_CARRIED.some((r) => r.test(h)));
    for (const h of new Set(external)) expect(hrefs, `${p.path} keeps ${h}`).toContain(h);
  }
});

test('the footer email is a mailto link', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('footer a[href="mailto:connect@fccintl.org"]')).toHaveCount(1);
});
