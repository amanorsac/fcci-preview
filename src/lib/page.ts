export interface Segment { kind: string; text: string; href?: string; formId?: string }

const isHeading = (s: Segment) => s.kind === 'h1' || s.kind === 'h2' || s.kind === 'h3';

/** First heading becomes the hero title; plain lines before it become eyebrows. */
export function splitHero(segments: Segment[]) {
  const at = segments.findIndex(isHeading);
  if (at === -1) return { heading: '', eyebrow: [], body: segments };
  const before = segments.slice(0, at);
  // A small h3 label directly above an h2 reads as eyebrow + title.
  if (segments[at].kind === 'h3' && segments[at + 1]?.kind === 'h2') {
    return {
      heading: segments[at + 1].text,
      eyebrow: [...before.filter((s) => s.kind === 'p' && !s.href).map((s) => s.text), segments[at].text],
      body: [...before.filter((s) => s.kind !== 'p' || s.href), ...segments.slice(at + 2)],
    };
  }
  return {
    heading: segments[at].text,
    eyebrow: before.filter((s) => s.kind === 'p' && !s.href).map((s) => s.text),
    // Linked or form lines before the heading stay in the body, in order.
    body: [...before.filter((s) => s.kind !== 'p' || s.href), ...segments.slice(at + 1)],
  };
}

/** Splits body segments into sections at each h2 (or h1). */
export function sections(segments: Segment[]): Segment[][] {
  const out: Segment[][] = [];
  for (const s of segments) {
    if ((s.kind === 'h2' || s.kind === 'h1') || out.length === 0) out.push([s]);
    else out[out.length - 1].push(s);
  }
  return out.filter((sec) => sec.length > 0);
}
