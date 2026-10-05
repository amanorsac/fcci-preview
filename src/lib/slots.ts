import type { ImageMetadata } from 'astro';
import slots from '../content/image-slots.json';
import { imageById, pageImages } from './images';

// AI images, keyed by file name without extension.
const aiFiles = import.meta.glob<{ default: ImageMetadata }>('../assets/ai/*.webp', { eager: true });
const aiByName = new Map(
  Object.entries(aiFiles).map(([p, m]) => [p.split('/').pop()!.replace(/\.webp$/, ''), m.default]),
);

export interface Pair { church?: ImageMetadata; ai?: ImageMetadata; aiAlt: string }
interface SlotDef { church?: string; ai?: string; aiAlt?: string }
const defs = slots as Record<string, SlotDef>;

function toPair(def: SlotDef | undefined, church?: ImageMetadata): Pair {
  return {
    church: church ?? (def?.church ? imageById(def.church) : undefined),
    ai: def?.ai ? aiByName.get(def.ai) : undefined,
    aiAlt: def?.aiAlt ?? '',
  };
}

/** A named slot from image-slots.json. */
export function slot(id: string): Pair {
  if (!defs[id]) throw new Error(`Unknown image slot "${id}"`);
  return toPair(defs[id]);
}

/** A page's lead image: its own first church photo, plus an AI image if mapped. */
export function pagePair(page: { slug: string; images: { src: string }[] }): Pair {
  return toPair(defs[`page:${page.slug}`], pageImages(page.images)[0]);
}

export const hasImage = (p: Pair) => !!(p.church || p.ai);
