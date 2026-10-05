import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.use({ reducedMotion: 'reduce' });

test('the church fonts are used: Abril Fatface for display, Lato for text', async ({ page }) => {
  await page.goto('/mission-and-vision');
  expect(await page.locator('h1').evaluate((e) => getComputedStyle(e).fontFamily)).toContain('Abril Fatface');
  expect(await page.locator('body').evaluate((e) => getComputedStyle(e).fontFamily)).toContain('Lato');
  const fonts = await page.evaluate(async () => { await document.fonts.ready; return [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family); });
  expect(fonts.join(' ')).not.toMatch(/Bebas|Montserrat/);
});

for (const path of ['/', '/mission-and-vision', '/give', '/sermons']) {
  test(`${path} is white and welcoming`, async ({ page }) => {
    await page.goto(path);
    expect(await page.locator('body').evaluate((e) => getComputedStyle(e).backgroundColor)).toBe('rgb(255, 255, 255)');
    const header = await page.locator('header.site-header').evaluate((e) => getComputedStyle(e, '::before').backgroundColor);
    expect(header).toMatch(/rgba?\(255, 255, 255/);
    // Dark sections are limited to the footer plus at most one band.
    const darkBands = await page.locator('main > *').evaluateAll((els) => els.filter((e) => {
      const m = getComputedStyle(e).backgroundColor.match(/\d+/g);
      return m && +m[0] < 60 && +m[1] < 60 && +m[2] < 60 && m.length === 3;
    }).length);
    expect(darkBands).toBeLessThanOrEqual(1);
    const axe = await new AxeBuilder({ page }).exclude('iframe').analyze();
    expect(axe.violations.filter((v) => ['serious', 'critical'].includes(v.impact))).toEqual([]);
  });
}
