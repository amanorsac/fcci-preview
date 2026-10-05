import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.use({ reducedMotion: 'reduce' });
const AGES = [
  'FAITH KIDZ Nursery (Birth to 16 mos.)',
  'FAITH KIDZ Toddlers (17 mos. to 35 mos.)',
  'FAITH KIDZ Preschool (3 yrs. & potty trained to Kindergarten)',
  'FAITH KIDZ Church (1st grade to 5th grade)',
];

test('FAITH KIDZ: gradient hero, age cards, first Sunday, safety, youth and college', async ({ page }) => {
  await page.goto('/kidz-amp-youth');
  await expect(page.locator('h1')).toHaveText('FAITH KIDZ!');
  await expect(page.locator('.kids-hero')).toBeVisible();
  await expect(page.getByText('Sundays @ 10 AM').first()).toBeVisible();
  expect((await page.locator('[data-age] .age-name').allTextContents()).map((t) => t.trim())).toEqual(AGES);
  await expect(page.locator('[data-section="first-sunday"] li')).toHaveCount(3);
  await expect(page.locator('[data-section="safety"]')).toBeVisible();
  await expect(page.locator('[data-section="youth"]')).toContainText('Infusion Youth & G-One Teens');
  await expect(page.locator('[data-section="youth"]')).toContainText('Wednesdays @ 7PM');
  await expect(page.locator('[data-section="college"]')).toContainText('College/Young Adult Ministry');
  await expect(page.locator('[data-section="visit"] a[href="/i-m-new"]')).toBeVisible();
});

test('FAITH KIDZ passes axe and has no horizontal scroll at 375', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/kidz-amp-youth');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const axe = await new AxeBuilder({ page }).analyze();
  expect(axe.violations.filter((v) => ['serious', 'critical'].includes(v.impact))).toEqual([]);
});
