import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import defs from '../../src/form/form-defs.json' with { type: 'json' };

test.use({ reducedMotion: 'reduce' });
const TEAMS = defs['volunteer-signup-1'].fields.find((f) => f.name === 'f2').options.filter((o) => o !== 'Other');

for (const path of ['/dream-team', '/ministries', '/next-steps']) {
  test(`${path} responds, has one h1, no scroll at 375, passes axe`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    const res = await page.goto(path);
    expect(res.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations.filter((v) => ['serious', 'critical'].includes(v.impact))).toEqual([]);
  });
}

test('dream team shows every serving team from the church form, and the sign-up form', async ({ page }) => {
  await page.goto('/dream-team');
  const titles = (await page.locator('[data-team] .team-name').allTextContents()).map((t) => t.trim());
  expect(titles).toEqual(TEAMS);
  await expect(page.locator('form[data-form-id="volunteer-signup-1"]')).toHaveCount(1);
});

test('ministries links to every ministry', async ({ page }) => {
  await page.goto('/ministries');
  for (const href of ['/kidz-amp-youth', '/men', '/women', '/students', '/connect-groups', '/dream-team']) {
    await expect(page.locator(`main a[href="${href}"]`).first(), href).toBeVisible();
  }
});

test('next steps is a numbered path of six linked steps', async ({ page }) => {
  await page.goto('/next-steps');
  const steps = page.locator('ol.path > li');
  await expect(steps).toHaveCount(6);
  for (const li of await steps.all()) await expect(li.locator('a')).toHaveCount(1);
});

test('the menu offers the new sections', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Main' });
  await expect(nav.getByRole('link', { name: 'Dream Team' })).toHaveAttribute('href', '/dream-team');
  await nav.getByRole('button', { name: 'Ministries' }).click();
  await expect(nav.getByRole('link', { name: 'Kidz & Youth' })).toBeVisible();
  await nav.getByRole('button', { name: 'Next Steps' }).click();
  await expect(nav.getByRole('link', { name: "I'm New" })).toBeVisible();
});
