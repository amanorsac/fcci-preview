import { test, expect } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

const visibleVariants = (page) => page.locator('[data-variant]').evaluateAll((els) =>
  els.filter((e) => getComputedStyle(e).display !== 'none').map((e) => e.dataset.variant));

test('church photos show by default; the toggle switches to AI images', async ({ page }) => {
  await page.goto('/');
  const before = await visibleVariants(page);
  expect(before.length).toBeGreaterThan(0);
  expect(new Set(before)).toEqual(new Set(['church']));
  await page.getByRole('button', { name: 'AI images' }).click();
  await expect(page.getByRole('button', { name: 'AI images' })).toHaveAttribute('aria-pressed', 'true');
  expect(new Set(await visibleVariants(page))).toEqual(new Set(['ai']));
});

test('the choice survives navigation', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'AI images' }).click();
  await page.goto('/kidz-amp-youth');
  await expect(page.locator('html')).toHaveClass(/img-ai/);
  await expect(page.getByRole('button', { name: 'AI images' })).toHaveAttribute('aria-pressed', 'true');
});

test('the toggle still works when storage is blocked', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'sessionStorage', { get() { throw new Error('blocked'); } });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'AI images' }).click();
  expect(new Set(await visibleVariants(page))).toEqual(new Set(['ai']));
  await page.getByRole('button', { name: 'Church photos' }).click();
  expect(new Set(await visibleVariants(page))).toEqual(new Set(['church']));
});

test('no visible image is broken in either mode', async ({ page }) => {
  test.setTimeout(150000);
  for (const mode of ['Church photos', 'AI images']) {
    await page.goto('/');
    await page.getByRole('button', { name: mode }).click();
    for (let y = 0; y < 8000; y += 700) { await page.evaluate((v) => scrollTo(0, v), y); await page.waitForTimeout(80); }
    // Give images a moment to finish; under heavy parallel test load some may
    // still be in flight, which is not breakage. A finished image with no
    // pixels is.
    await page.waitForTimeout(1500);
    const broken = await page.locator('img').evaluateAll((imgs) => imgs.filter((i) => i.offsetParent && i.complete && i.naturalWidth === 0).map((i) => i.currentSrc));
    expect(broken, mode).toEqual([]);
  }
});
