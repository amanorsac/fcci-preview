import type { Segment } from './page';
import { sections } from './page';

const isHeading = (s: Segment) => s.kind === 'h1' || s.kind === 'h2' || s.kind === 'h3';

export interface Pillar { word: string; sub?: string; body: Segment[] }

/**
 * Re-lays out a home page's own segments without adding wording:
 * linked lines before the first heading become announcements, the first
 * heading and its lines form the hero, consecutive h1 groups become pillar
 * panels, and everything after is split into sections.
 */
export function homeModel(segments: Segment[]) {
  const first = segments.findIndex(isHeading);
  const pre = first === -1 ? segments : segments.slice(0, first);
  const announcements = pre.filter((s) => s.href);
  const eyebrow = pre.filter((s) => !s.href && s.kind === 'p').map((s) => s.text);

  let i = first + 1;
  const lines: string[] = [];
  const ctas: Segment[] = [];
  while (i < segments.length && !isHeading(segments[i]) && segments[i].kind !== 'form') {
    const s = segments[i];
    if (s.href) ctas.push(s);
    else lines.push(s.text);
    i += 1;
  }

  const intro: string[] = [];
  const pillars: Pillar[] = [];
  while (i < segments.length && segments[i].kind === 'h1') {
    const word = segments[i].text;
    i += 1;
    let sub: string | undefined;
    if (segments[i]?.kind === 'h2') { sub = segments[i].text; i += 1; }
    const body: Segment[] = [];
    while (i < segments.length && segments[i].kind === 'p') { body.push(segments[i]); i += 1; }
    if (!sub && body.length === 0) intro.push(word);
    else pillars.push({ word, sub, body });
  }

  return {
    announcements,
    eyebrow,
    heading: first === -1 ? '' : segments[first].text,
    lines,
    ctas,
    intro,
    pillars,
    rest: sections(segments.slice(i)),
  };
}
