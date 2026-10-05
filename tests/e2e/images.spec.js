import { test, expect } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';

const paths = readdirSync('src/content/pages').map((f) => JSON.parse(readFileSync(`src/content/pages/${f}`, 'utf8')).path);

test('no page loads images from the old host, and every img has alt', async ({ page }) => {
  test.setTimeout(180000);
  for (const path of paths) {
    await page.goto(path);
    const imgs = await page.locator('img').evaluateAll((els) =>
      els.map((e) => ({ src: e.currentSrc || e.src, alt: e.getAttribute('alt'), hidden: !!e.closest('[aria-hidden="true"]'), decorative: e.closest('.hero, .pillar, .media-hero, .thumb, .hero-media, .tile, .pillar-media, .kids-media, .dream-media, .team-media, .media, .event-card') !== null, inNamedLink: !!e.closest('a[aria-label]') }))
    );
    for (const i of imgs) {
      expect(i.src, path).not.toContain('snappages.site');
      expect(i.alt, `${path} ${i.src}`).not.toBeNull();
      if (i.alt === '') expect(i.hidden || i.decorative || i.inNamedLink, `${path} ${i.src} needs alt text`).toBe(true);
    }
  }
});

test('content photos carry real descriptions', async ({ page }) => {
  await page.goto('/blog/2025/10/25/unlocking-the-power-of-biblical-meditation-a-path-to-spiritual-growth');
  const alt = await page.locator('.cover-wrap img').getAttribute('alt');
  expect(alt && alt.length).toBeGreaterThan(5);
});

test('the home hero ships a modern image format', async ({ page }) => {
  await page.goto('/');
  const sources = await page.locator('.hero picture source').evaluateAll((s) => s.map((e) => e.getAttribute('type')));
  expect(sources.some((t) => t === 'image/avif' || t === 'image/webp')).toBe(true);
});
