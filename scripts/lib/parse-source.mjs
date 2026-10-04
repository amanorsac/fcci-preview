// Parses one captured page (source/pages/<slug>.md, plus its raw HTML for
// forms) into structured, verbatim content. Text is never rewritten: lines
// are only trimmed at the ends.
import { readFileSync } from 'node:fs';
import * as cheerio from 'cheerio';

const SITE_HOST = 'www.fcci.life';
const FOOTER_START = '### Charlottesville Campus';
// Old-host credit and a stray separator; dropped on purpose (see ledger).
export const DROPPED_SOURCE_TEXT = ['powered by SnapPages', ':'];

const SECTION_MARKERS = [
  '## LINKS / BUTTONS',
  '## IMAGES (src | alt)',
  '## EMBEDS / FORMS',
  '## ALL STORAGE ASSETS',
];
const IMAGE_EXT = /\.(png|jpe?g|gif|webp|svg|avif)(\?|$)/i;

let canonical;
function canonicalChrome() {
  if (!canonical) {
    const home = readFileSync(new URL('../../source/pages/home.md', import.meta.url), 'utf8');
    const lines = visibleLines(home);
    canonical = { nav: navRun(lines), footer: footerRun(lines) };
  }
  return canonical;
}

function section(md, startPrefix) {
  const lines = md.split(/\r?\n/);
  const start = lines.findIndex((l) => l.startsWith(startPrefix));
  if (start === -1) return [];
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((l) => SECTION_MARKERS.some((m) => l.startsWith(m)));
  return end === -1 ? rest : rest.slice(0, end);
}

function visibleLines(md) {
  return section(md, '## VISIBLE TEXT')
    .map((l) => l.trim())
    .filter((l) => l !== '');
}

function navRun(lines) {
  if (lines[0] !== 'Home') return [];
  const end = lines.indexOf('Blog');
  return end === -1 || end > 30 ? [] : lines.slice(0, end + 1);
}

function footerRun(lines) {
  const start = lines.lastIndexOf(FOOTER_START);
  return start === -1 ? [] : lines.slice(start);
}

export function toSegment(line) {
  const m = line.match(/^(#{1,3}) (.*)$/);
  if (m) return { kind: `h${m[1].length}`, text: m[2].trim() };
  return { kind: 'p', text: line };
}

export function localHref(href) {
  try {
    const u = new URL(href);
    if (u.hostname === SITE_HOST) {
      const path = u.pathname.replace(/\/+$/, '') || '/';
      return path + u.hash;
    }
  } catch {
    /* not an absolute URL; keep as is */
  }
  return href;
}

function parseLinks(md) {
  return section(md, '## LINKS / BUTTONS')
    .map((l) => l.match(/^- \[(.*)\] -> (.+)$/))
    .filter(Boolean)
    .map(([, label, href]) => ({ label: label.trim(), href: href.trim() }));
}

function hrefFor(text, links) {
  const bare = text.replace(/^>\s*/, '');
  const hit = links.find((l) => l.label && (l.label === text || l.label === bare || l.label === `> ${bare}`));
  return hit ? localHref(hit.href) : undefined;
}

function parseImages(md) {
  const out = [];
  const add = (src, alt = '') => {
    if (IMAGE_EXT.test(src) && !out.some((i) => i.src === src)) out.push({ src, alt });
  };
  for (const l of section(md, '## IMAGES')) {
    const m = l.match(/^- (?:\(css bg\) )?(\S+)(?: \| alt="(.*)")?/);
    if (m) add(m[1], m[2] ?? '');
  }
  for (const l of section(md, '## ALL STORAGE ASSETS')) {
    const m = l.match(/^- (\S+)/);
    if (m) add(m[1]);
  }
  return out;
}

function parseEmbeds(md) {
  return section(md, '## EMBEDS / FORMS')
    .map((l) => l.match(/^- `(.*)/)?.[1]?.replace(/`$/, ''))
    .filter((t) => t && !t.includes('googletagmanager.com'));
}

const FIELD_TYPES = {
  name: 'text', text: 'text', email: 'email', phone: 'tel', 'number-input': 'tel',
  address: 'text', textarea: 'textarea', radio: 'radio', checkbox: 'checkbox',
  select: 'select', dropdown: 'select', date: 'date',
};

export function parseForms(rawHtml, slug) {
  if (!rawHtml) return [];
  const $ = cheerio.load(rawHtml);
  const forms = [];
  $('form.sp-form').each((i, form) => {
    const fields = [];
    $(form).find('.sp-fieldset').each((_, fs) => {
      const dataType = $(fs).attr('data-type') || 'text';
      const required = $(fs).hasClass('required');
      const cols = $(fs).find('.sp-field-col');
      const hasInput = $(fs).find('input:not([type=hidden]),textarea,select').length > 0;
      if (!hasInput) {
        const text = $(fs).text().replace(/\s+/g, ' ').trim();
        if (text) fields.push({ name: `f${fields.length}`, type: 'note', label: text, required: false });
        return;
      }
      if (dataType === 'radio' || dataType === 'checkbox') {
        const options = $(fs)
          .find(`input[type=${dataType}]`)
          .map((_, inp) => {
            const lab = $(inp).nextAll('label').first().text().trim();
            return lab || $(inp).attr('value') || '';
          })
          .get();
        fields.push({
          name: `f${fields.length}`, type: dataType, required,
          label: $(fs).find('.sp-field-label').first().text().trim(), options,
        });
        return;
      }
      if (dataType === 'select' || dataType === 'dropdown') {
        const options = $(fs).find('option').map((_, o) => $(o).text().trim()).get().filter(Boolean);
        fields.push({
          name: `f${fields.length}`, type: 'select', required,
          label: $(fs).find('.sp-field-label').first().text().trim(), options,
        });
        return;
      }
      cols.each((_, col) => {
        const label = $(col).find('.sp-field-label').first().text().trim();
        if (!label) return;
        const isArea = $(col).find('textarea').length > 0;
        fields.push({
          name: `f${fields.length}`,
          type: isArea ? 'textarea' : FIELD_TYPES[dataType] || 'text',
          label, required,
        });
      });
    });
    const submitLabel =
      $(form).find('.sp-button').first().attr('data-label') ||
      $(form).find('.sp-button').first().text().trim() || '';
    forms.push({ id: `${slug}-${i + 1}`, fields, submitLabel });
  });
  return forms;
}

function formTexts(form) {
  const t = [];
  for (const f of form.fields) {
    t.push(f.label);
    if (f.options) {
      // Dropdowns are captured either one option per line or as one joined line.
      if (f.type === 'select') t.push(f.options.join(''));
      t.push(...f.options);
    }
  }
  if (form.submitLabel) t.push(form.submitLabel);
  return t;
}

function replaceFormText(segments, form) {
  const texts = formTexts(form);
  const first = form.fields[0]?.label;
  const start = segments.findIndex((s) => s.text === first);
  if (start === -1) return segments;
  let end = start;
  let ti = 0;
  while (end < segments.length && ti < texts.length) {
    const at = texts.indexOf(segments[end].text, ti);
    if (at === -1) break;
    ti = at + 1;
    end += 1;
  }
  return [
    ...segments.slice(0, start),
    { kind: 'form', formId: form.id, text: '' },
    ...segments.slice(end),
  ];
}

export function parseSourcePage(md, rawHtml) {
  const lines = md.split(/\r?\n/);
  const title = (lines[0] || '').replace(/^# /, '').trim();
  const url = (lines.find((l) => l.startsWith('URL: ')) || '').slice(5).trim();
  const path = localHref(url);
  const description =
    (section(md, '## META').find((l) => l.startsWith('- description:')) || '')
      .replace('- description:', '').trim();

  const links = parseLinks(md);
  const all = visibleLines(md);
  const chrome = canonicalChrome();

  const nav = navRun(all);
  const footer = footerRun(all);
  const body = all.slice(nav.length, all.length - footer.length);

  let chromeMismatch = nav.join('\n') !== chrome.nav.join('\n');
  const extraFooter = footer.filter(
    (l) => !chrome.footer.includes(l) && !DROPPED_SOURCE_TEXT.includes(l)
  );
  if (extraFooter.length || chrome.footer.some((l) => !footer.includes(l))) chromeMismatch = true;

  const toSeg = (l) => {
    const s = toSegment(l);
    const href = hrefFor(s.text, links);
    return href ? { ...s, href } : s;
  };

  let segments = [...body, ...extraFooter]
    .filter((l) => !DROPPED_SOURCE_TEXT.includes(l))
    .map(toSeg);
  const forms = parseForms(rawHtml, slugFromPath(path));
  for (const f of forms) segments = replaceFormText(segments, f);

  return {
    url,
    path,
    slug: slugFromPath(path),
    title,
    description,
    segments,
    navChrome: nav,
    footerChrome: footer.filter((l) => !DROPPED_SOURCE_TEXT.includes(l)).map(toSeg),
    chromeMismatch,
    links: links.map((l) => ({ label: l.label, href: localHref(l.href) })),
    images: parseImages(md),
    embeds: parseEmbeds(md),
    forms,
  };
}

export function slugFromPath(path) {
  if (path === '/' || path === '') return 'home';
  return path.replace(/^\//, '').replace(/\//g, '_');
}
