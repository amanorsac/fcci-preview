import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';

const POST = '/blog/2025/10/25/unlocking-the-power-of-biblical-meditation-a-path-to-spiritual-growth';
const postData = JSON.parse(readFileSync('src/content/pages/blog_2025_10_25_unlocking-the-power-of-biblical-meditation-a-path-to-spiritual-growth.json', 'utf8'));
const LISTS = ['/blog', '/blog/tag/faith', '/blog/tag/fcci', '/blog/tag/fccination', '/blog/tag/reachteachtransform'];

test.use({ reducedMotion: 'reduce' });

for (const path of [...LISTS, POST]) {
  test(`${path} responds and is accessible`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations.filter((v) => ['serious', 'critical'].includes(v.impact))).toEqual([]);
  });
}

test('the post shows its source title, date and author', async ({ page }) => {
  await page.goto(POST);
  await expect(page.locator('h1')).toHaveText(postData.segments[0].text);
  await expect(page.locator('.post-head').getByText('October 25th, 2025')).toBeVisible();
  await expect(page.locator('.post-head').getByText('by Pastor Wayne Frye')).toBeVisible();
});

test('list cards link to the post', async ({ page }) => {
  for (const path of LISTS) {
    await page.goto(path);
    await expect(page.locator(`a[href="${POST}"]`).first()).toBeVisible();
  }
});
