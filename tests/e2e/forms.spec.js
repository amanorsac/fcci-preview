import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import defs from '../../src/form/form-defs.json' with { type: 'json' };

test.use({ reducedMotion: 'reduce' });
const LABELS = (id) => defs[id].fields.filter((f) => f.type !== 'note').map((f) => f.label);

for (const [path, id] of [['/prayer-request', 'prayer-request-1'], ['/connect-card', 'connect-card-1']]) {
  test(`${path} shows the source labels and passes axe`, async ({ page }) => {
    await page.goto(path);
    const form = page.locator(`form[data-form-id="${id}"]`);
    await expect(form).toBeVisible();
    const shown = (await form.locator('.f-label').allTextContents()).map((t) => t.trim());
    expect(shown).toEqual(LABELS(id));
    await expect(form.locator('button[type=submit]')).toHaveText(defs[id].submitLabel);
    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations.filter((v) => ['serious', 'critical'].includes(v.impact))).toEqual([]);
  });
}

async function fillPrayer(page) {
  const form = page.locator('form[data-form-id="prayer-request-1"]');
  await form.locator('textarea').first().fill('Please pray for my family <b>now</b>');
  await form.getByLabel('Yes', { exact: true }).check();
  return form;
}

test('a double click sends exactly one request, then shows the church message', async ({ page }) => {
  let calls = 0;
  await page.route('**/api/form', async (r) => { calls += 1; await new Promise((res) => setTimeout(res, 400)); await r.fulfill({ json: { ok: true } }); });
  await page.goto('/prayer-request');
  const form = await fillPrayer(page);
  await form.locator('button[type=submit]').dblclick();
  await expect(page.getByText(defs['prayer-request-1'].successText)).toBeVisible();
  expect(calls).toBe(1);
});

test('a server failure keeps the entered values', async ({ page }) => {
  await page.route('**/api/form', (r) => r.fulfill({ status: 500, json: { ok: false, error: 'server' } }));
  await page.goto('/prayer-request');
  const form = await fillPrayer(page);
  await form.locator('button[type=submit]').click();
  await expect(form.locator('.f-status')).toBeVisible();
  await expect(form.locator('textarea').first()).toHaveValue('Please pray for my family <b>now</b>');
  await expect(form.locator('button[type=submit]')).toBeEnabled();
});

test('the browser blocks an empty required field', async ({ page }) => {
  let calls = 0;
  await page.route('**/api/form', (r) => { calls += 1; r.fulfill({ json: { ok: true } }); });
  await page.goto('/prayer-request');
  await page.locator('form[data-form-id="prayer-request-1"] button[type=submit]').click();
  expect(calls).toBe(0);
});

test('every page with a form renders it', async ({ page }) => {
  for (const [id, def] of Object.entries(defs)) {
    await page.goto(def.path);
    await expect(page.locator(`form[data-form-id="${id}"]`), id).toHaveCount(1);
  }
});
