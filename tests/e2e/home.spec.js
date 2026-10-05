import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.use({ reducedMotion: 'reduce' });

test('hero, pillars, latest teaching and service times on /', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.hero h1')).toHaveText('WELCOME HOME');
  await expect(page.locator('.hero a', { hasText: 'Service Times' })).toHaveAttribute('href', '/#service-times');
  const pillars = page.locator('[data-pillar]');
  await expect(pillars).toHaveCount(3);
  expect((await pillars.locator('.pillar-word').allTextContents()).map((t) => t.trim())).toEqual(['REACH', 'TEACH', 'Transform']);
  const iframe = page.locator('iframe[src*="media/embed"]');
  await expect(iframe).toHaveAttribute('loading', 'lazy');
  await expect(iframe).toHaveAttribute('title', /.+/);
  const times = page.locator('#service-times');
  await expect(times).toContainText('Sunday- 10:00am');
  await expect(times).toContainText('Wednesday-7:00pm');
  await expect(page.locator('.hero .hero-img').first()).toHaveAttribute('fetchpriority', 'high');
});

test('announcement link stays on the home page', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Click Here for more information about STRETCH LEADERSHIP SUMMIT.' }))
    .toHaveAttribute('href', 'https://faithchristiancenterinte.subspla.sh/85jt7cx');
});

for (const path of ['/', '/home-v2', '/home-app']) {
  test(`${path} is accessible and has no horizontal scroll at 375`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    const res = await page.goto(path);
    expect(res.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const axe = await new AxeBuilder({ page }).exclude('iframe').analyze();
    expect(axe.violations.filter((v) => ['serious', 'critical'].includes(v.impact))).toEqual([]);
  });
}
