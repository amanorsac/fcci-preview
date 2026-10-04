import * as cheerio from 'cheerio';

export const normalize = (s) => String(s).replace(/\s+/g, ' ').trim();

const EXCLUDE = 'script, style, iframe, noscript, template, [aria-hidden="true"], .sr-only, [hidden]';

/** Visible text nodes of a built page, in document order, whitespace-normalized. */
export function extractBuiltSegments(html) {
  const $ = cheerio.load(html);
  $(EXCLUDE).remove();
  const out = [];
  const walk = (node) => {
    if (node.type === 'text') {
      const t = normalize(node.data);
      if (t) out.push(t);
      return;
    }
    if (node.children) for (const c of node.children) walk(c);
  };
  walk($('body').get(0));
  return out;
}
