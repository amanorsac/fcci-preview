// Draft copy: new wording written for the redesign, kept apart from the
// church's own text so the pastor can review all of it in one place.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// Generic phrases that make church sites sound templated.
export const CLICHES = [
  'vibrant community', 'journey of faith', 'embark', 'unlock your potential', 'cutting-edge',
  "in today's fast-paced world", 'tapestry', 'elevate', 'seamless', 'nestled', 'look no further',
  'game-changer', 'delve',
];

/** Every draft entry as { file, page, key, text }. */
export function allDraft(dir) {
  return readdirSync(dir).filter((f) => f.endsWith('.json')).sort().flatMap((file) => {
    const data = JSON.parse(readFileSync(join(dir, file), 'utf8'));
    return data.items.map((i) => ({ file, page: data.page, key: i.key, text: i.text }));
  });
}
