import { test, expect } from '@playwright/test';

test('home responds with an English document', async ({ page }) => {
  const res = await page.goto('/');
  expect(res.status()).toBe(200);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});
