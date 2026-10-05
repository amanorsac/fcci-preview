import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';

const data = (slug) => JSON.parse(readFileSync(`src/content/pages/${slug}.json`, 'utf8'));
const srcOf = (tag) => tag.match(/src="([^"]+)"/)?.[1]?.replace(/&amp;/g, '&');
const PAGES = ['sermons', 'media_live', 'watch-live', 'watch', 'give', 'calendar'];

test.use({ reducedMotion: 'reduce' });

for (const slug of PAGES) {
  test(`${slug}: 200, embeds match source, accessible, no scroll at 375`, async ({ page }) => {
    const p = data(slug);
    await page.setViewportSize({ width: 375, height: 800 });
    const res = await page.goto(p.path);
    expect(res.status()).toBe(200);
    for (const e of p.embeds.map(srcOf).filter((s) => s && s.includes('subsplash'))) {
      await expect(page.locator(`iframe[src="${e}"]`)).toHaveCount(1);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator('h1')).toHaveCount(1);
    const axe = await new AxeBuilder({ page }).exclude('iframe').analyze();
    expect(axe.violations.filter((v) => ['serious', 'critical'].includes(v.impact))).toEqual([]);
  });
}

test('pages stay usable when Subsplash is blocked', async ({ page }) => {
  await page.route('**/subsplash.com/**', (r) => r.abort());
  await page.goto('/sermons');
  await expect(page.getByRole('link', { name: 'Built Different' })).toBeVisible();
  await page.goto('/media/live');
  await expect(page.getByText('All for His Glory! - Part 6')).toBeVisible();
  await page.goto('/give');
  await expect(page.getByText(/FCCINTL/).first()).toBeVisible();
});

test('empty watch pages stay usable when Subsplash is blocked', async ({ page }) => {
  await page.route('**/subsplash.com/**', (r) => r.abort());
  for (const path of ['/watch', '/watch-live']) {
    await page.goto(path);
    await expect(page.locator('main a[href="/sermons"]')).toBeVisible();
  }
});

test('the giving form in the hero starts loading only after the page has loaded', async ({ page, request }) => {
  const html = await (await request.get('/give')).text();
  const live = html.replace(/<noscript>[\s\S]*?<\/noscript>/g, '');
  expect(live).toMatch(/<iframe[^>]*data-src="https:\/\/subsplash\.com[^"]*give/);
  expect(live).not.toMatch(/<iframe[^>]*\ssrc="https:\/\/subsplash/);
  await page.goto('/give');
  await expect(page.locator('.player iframe[src*="subsplash.com"]')).toHaveCount(1);
});

test('the giving form is tall enough on a phone not to be cut off', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/give');
  const box = await page.locator('.player .embed').boundingBox();
  expect(box.height).toBeGreaterThanOrEqual(660);
});

test('give keeps the text-to-give wording and makes it tappable', async ({ page }) => {
  await page.goto('/give');
  const para = data('give').segments.find((s) => s.text.includes('FCCINTL')).text;
  await expect(page.getByText(para)).toBeVisible();
  await expect(page.locator('a[href^="sms:"]')).toHaveCount(1);
});

test('sermon library links point to the live site', async ({ page }) => {
  await page.goto('/sermons');
  await expect(page.getByRole('link', { name: 'Built Different' })).toHaveAttribute('href', 'https://www.fcci.life/media/series/6n9ctk3/built-different');
});

test('calendar links to the live calendar under its own heading', async ({ page }) => {
  await page.goto('/calendar');
  await expect(page.locator('h1')).toHaveText('Upcoming Events');
  await expect(page.locator('a[href="https://www.fcci.life/calendar"]')).toHaveCount(1);
});
