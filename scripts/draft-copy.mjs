// Writes docs/draft-copy.md: every new sentence, grouped by page, for review.
import { writeFileSync } from 'node:fs';
import { allDraft } from './lib/draft.mjs';

const entries = allDraft('src/content/draft');
const pages = [...new Set(entries.map((e) => e.page))];
let md = `# Draft wording for review\n\nEvery line below is **new wording** written for the redesign. The church's\nexisting text is not listed here; it is kept word for word. Please approve,\nedit or remove each line. To change one, edit the matching file in\n\`src/content/draft/\` and run \`npm run draft-copy\`.\n`;
for (const page of pages) {
  md += `\n## ${page}\n\n| Where | Draft text |\n|---|---|\n`;
  for (const e of entries.filter((x) => x.page === page)) {
    md += `| \`${e.file.replace('.json', '')}.${e.key}\` | ${e.text.replace(/\|/g, '\|')} |\n`;
  }
}
writeFileSync('docs/draft-copy.md', md);
console.log(`docs/draft-copy.md: ${entries.length} lines on ${pages.length} pages`);
