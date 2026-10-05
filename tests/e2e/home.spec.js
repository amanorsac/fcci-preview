import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.use({ reducedMotion: 'reduce' });
const ORDER = ['hero', 'pillars', 'tailor', 'kids', 'sermon', 'events', 'dream-team', 'next-steps', 'visit'];

test('home sections appear in order', async ({ page }) => {
  await page.goto('/');
  const order = await page.locator('main [data-section]').evaluateAll((els) => els.map((e) => e.dataset.section));
  expect(order).toEqual(ORDER);
});

test('hero: WELCOME HOME, service times, Plan Your Visit and Watch Live', async ({ page }) => {
  await page.goto('/');
  const hero = page.locator('[data-section="hero"]');
  await expect(hero.locator('h1')).toHaveText('WELCOME HOME');
  await expect(hero).toContainText('Sunday- 10:00am');
  await expect(hero).toContainText('Wednesday-7:00pm');
  await expect(hero.getByRole('link', { name: 'Plan Your Visit' })).toHaveAttribute('href', '/i-m-new');
  await expect(hero.getByRole('link', { name: 'Watch Live' })).toHaveAttribute('href', '/media/live');
  await expect(hero.locator('.hero-img').first()).toHaveAttribute('fetchpriority', 'high');
});

test('REACH, TEACH and Transform in Abril Fatface italic', async ({ page }) => {
  await page.goto('/');
  const words = page.locator('[data-section="pillars"] .pillar-word');
  expect((await words.allTextContents()).map((t) => t.trim())).toEqual(['REACH', 'TEACH', 'Transform']);
  const style = await words.first().evaluate((e) => [getComputedStyle(e).fontFamily, getComputedStyle(e).fontStyle]);
  expect(style[0]).toContain('Abril Fatface');
  expect(style[1]).toBe('italic');
});

test('tailor tiles, kids spotlight, sermon, dream team and next steps link correctly', async ({ page }) => {
  await page.goto('/');
  const tiles = page.locator('[data-section="tailor"] a');
  expect(await tiles.evaluateAll((as) => as.map((a) => a.getAttribute('href')))).toEqual(['/i-m-new', '/kidz-amp-youth', '/students', '/connect-groups']);
  await expect(page.locator('[data-section="kids"] a[href="/kidz-amp-youth"]')).toBeVisible();
  await expect(page.locator('[data-section="sermon"] iframe[src*="media/embed"]')).toHaveAttribute('loading', 'lazy');
  await expect(page.locator('[data-section="sermon"] a[href="/sermons"]')).toBeVisible();
  await expect(page.locator('[data-section="events"] a[href="/calendar"]')).toBeVisible();
  await expect(page.locator('[data-section="dream-team"] a[href="/dream-team"]')).toBeVisible();
  await expect(page.locator('[data-section="next-steps"] a')).toHaveCount(3);
  await expect(page.locator('#service-times')).toContainText('2186 Richmond Road');
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
