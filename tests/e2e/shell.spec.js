import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const TOP = ['Home', 'About', 'Connect', 'Watch Live', 'Sermons', 'Give', 'Blog'];

for (const width of [375, 1280]) {
  test.describe(`shell at ${width}px`, () => {
    test.use({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });

    test('header nav, CTAs, skip link and preview safety', async ({ page }) => {
      const requests = [];
      // Third-party embeds (Subsplash) may load their own analytics inside
      // their iframe; only requests made by our own page count here.
      page.on('request', (r) => { if (r.frame() === page.mainFrame()) requests.push(r.url()); });
      await page.goto('/');
      if (width < 900) await page.getByRole('button', { name: 'Menu' }).click();
      const nav = page.getByRole('navigation', { name: 'Main' });
      await expect(nav.getByRole('link', { name: 'Home' })).toBeVisible();
      const tops = await nav.locator(':scope > ul > li > :is(a,button)').allTextContents();
      expect(tops.map((t) => t.trim())).toEqual(TOP);
      await nav.getByRole('button', { name: 'About' }).click();
      await expect(nav.getByRole('link', { name: 'What We Believe' })).toBeVisible();
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
      expect(requests.some((u) => u.includes('googletagmanager.com'))).toBe(false);
    });

    test('CTAs, skip link and preview strip', async ({ page }) => {
      await page.goto('/');
      const header = page.locator('header.site-header');
      await expect(header.getByRole('link', { name: 'Plan Your Visit' })).toHaveAttribute('href', '/i-m-new');
      await expect(header.locator('a.cta-give')).toHaveAttribute('href', '/give');
      await page.keyboard.press('Tab');
      if (test.info().project.name === 'chromium') {
        await expect(page.locator(':focus')).toHaveText('Skip to content');
      }
      const strip = page.locator('.preview-strip');
      await expect(strip).toBeVisible();
      await strip.getByRole('button', { name: 'Dismiss' }).click();
      await expect(strip).toBeHidden();
    });

    test('accessible, no horizontal scroll, menu survives scroll', async ({ page }) => {
      await page.goto('/');
      const axe = await new AxeBuilder({ page }).analyze();
      expect(axe.violations.filter((v) => ['serious', 'critical'].includes(v.impact))).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (width < 900) {
        await page.evaluate(() => { document.body.style.minHeight = '3000px'; scrollTo(0, 400); });
        await page.getByRole('button', { name: 'Menu' }).click();
        const box = await page.locator('#mobile-menu').boundingBox();
        expect(box.height).toBeGreaterThanOrEqual(300);
      }
    });
  });
}

test('robots.txt disallows everything', async ({ request }) => {
  const res = await request.get('/robots.txt');
  expect(await res.text()).toContain('Disallow: /');
});
