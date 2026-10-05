// Draft (new) wording by page and key. Unknown keys fail the build.
const files = import.meta.glob<{ default: { page: string; items: { key: string; text: string }[] } }>(
  '../content/draft/*.json', { eager: true },
);
const byFile = new Map(
  Object.entries(files).map(([p, m]) => [p.split('/').pop()!.replace(/\.json$/, ''), m.default]),
);

export function draft(file: string, key: string): string {
  const item = byFile.get(file)?.items.find((i) => i.key === key);
  if (!item) throw new Error(`Missing draft text ${file}.${key}`);
  return item.text;
}

/** Every draft line (used to allow-list new wording). */
export const ALL_DRAFT_TEXT = [...byFile.values()].flatMap((f) => f.items.map((i) => i.text));
