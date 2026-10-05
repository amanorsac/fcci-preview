import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';

const page = (slug) => JSON.parse(readFileSync(`src/content/pages/${slug}.json`, 'utf8'));
const firstHeading = (p) => p.segments.find((s) => /^h[123]$/.test(s.kind)).text;
const PAGES = ['mission-and-vision', 'what-we-believe', 'leadership', 'men', 'kidz-amp-youth'];

test.use({ reducedMotion: 'reduce' });

for (const slug of PAGES) {
  test(`${slug} renders its source heading as the page h1`, async ({ page: pw }) => {
    const p = page(slug);
    const res = await pw.goto(p.path);
    expect(res.status()).toBe(200);
    await expect(pw.locator('h1')).toHaveCount(1);
    await expect(pw.locator('h1')).toHaveText(firstHeading(p));
    const axe = await new AxeBuilder({ page: pw }).analyze();
    expect(axe.violations.filter((v) => ['serious', 'critical'].includes(v.impact))).toEqual([]);
  });
}

test('blocks keep source order and the first paragraph is visible', async ({ page: pw }) => {
  const p = page('mission-and-vision');
  await pw.goto(p.path);
  const firstPara = p.segments.find((s) => s.kind === 'p').text;
  await expect(pw.getByText(firstPara)).toBeVisible();
  const headings = (await pw.locator('main :is(h2,h3)').allTextContents()).map((t) => t.trim());
  const sourceHeadings = p.segments.slice(1).filter((s) => s.kind === 'h2' || s.kind === 'h3').map((s) => s.text);
  expect(headings).toEqual(sourceHeadings);
});

test('no horizontal scroll at 375px on standard and ministry pages', async ({ page: pw }) => {
  await pw.setViewportSize({ width: 375, height: 800 });
  for (const slug of PAGES) {
    await pw.goto(page(slug).path);
    expect(await pw.evaluate(() => document.documentElement.scrollWidth <= innerWidth), slug).toBe(true);
  }
});

test('unknown paths return the 404 page', async ({ page: pw }) => {
  const res = await pw.goto('/this-page-does-not-exist');
  expect(res.status()).toBe(404);
});
