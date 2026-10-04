import type { ImageMetadata } from 'astro';

// Local copies of the source images, keyed by file name.
const files = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/images/*.{jpg,jpeg,JPG,png,webp}',
  { eager: true },
);
const byName = new Map(
  Object.entries(files).map(([path, mod]) => [path.split('/').pop()!, mod.default]),
);

// Source URLs come in several sizes of one upload ("12128081_2048x994_1000.jpg"
// and "..._2500.jpg"); the numeric id before the first "_" identifies it.
const idOf = (name: string) => name.split('_')[0];
const byId = new Map<string, ImageMetadata>();
for (const [name, img] of byName) {
  const prev = byId.get(idOf(name));
  if (!prev || img.width > prev.width) byId.set(idOf(name), img);
}

export function imageFor(src: string): ImageMetadata | undefined {
  const name = decodeURIComponent(src.split('/').pop() || '').split('?')[0];
  return byName.get(name) ?? byId.get(idOf(name));
}

/** The page's own images in source order, one per upload, skipping brand marks. */
export function pageImages(images: { src: string }[], skipIds: string[] = []): ImageMetadata[] {
  const seen = new Set<string>();
  const out: ImageMetadata[] = [];
  for (const { src } of images) {
    const name = src.split('/').pop() || '';
    const id = idOf(name);
    if (seen.has(id) || skipIds.includes(id)) continue;
    const img = imageFor(src);
    if (img) { seen.add(id); out.push(img); }
  }
  return out;
}

export function imageById(id: string): ImageMetadata | undefined {
  return byId.get(id);
}
