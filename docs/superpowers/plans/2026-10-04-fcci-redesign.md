# FCCI Redesign (Pitch Preview) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild all 46 pages of fcci.life in Astro with a modern hybrid dark/light design in FCCI colors. The wording stays exactly the same, enforced by tests. Deploy it as a noindexed preview on Cloudflare.

**Architecture:** An import script turns the captured `source/pages/*.md` into JSON content files. An Astro static site renders them through six layouts and shared components, driven by one `site.config.ts`. A small Worker serves `dist/` and handles `POST /api/form` (email to the preview inbox via Resend). A fidelity test compares the built HTML text with the source text for every page.

**Tech Stack:**
- Astro 5 (static output) with `astro:assets` for images
- Cloudflare Workers static assets (wrangler 4)
- vitest, plus `@cloudflare/vitest-pool-workers` for the Worker
- Playwright with `@axe-core/playwright`
- cheerio, used in tests only
- Node 24

**Spec:** `docs/superpowers/specs/2026-10-04-fcci-redesign-design.md`

## Global Constraints

- **Wording.** Every visible text segment must come verbatim from `source/pages/*.md` → `## VISIBLE TEXT`. No new visible copy. The only exceptions are the preview strip text and the skip link, both listed in `ALLOWED_EXTRA_TEXT` in `site.config.ts`. Typos are kept.
- **Icons instead of text.** Components render no visible literal text. Controls such as the menu button, close and carousel arrows use icons with `aria-label`. `aria-label`/alt text is allowed and does not count as visible text.
- **Colors.** `--accent #ee7b1a`, `--accent-hover #d8660f`, `--ink #111111`, `--ink-2 #2c2c2c`, `--gray #444444`, `--paper #ffffff`, `--paper-2 #f6f4f1`. Small text on orange is `#111111`, never white. All pairs must pass WCAG AA.
- **Fonts.** Bebas Neue (display headings) and Montserrat 400/500/600/700 (body and UI), both self-hosted woff2 with `font-display: swap`.
- **URLs.** Every one of the 46 source URLs keeps its exact path. `/about` and `/connect` are non-link menu groups.
- **No client strings in components.** `src/components/**` and `src/layouts/**` contain no FCCI names, addresses, colors or URLs; all of those come from `site.config.ts` or content.
- **Preview safety.**
  - `<meta name="robots" content="noindex, nofollow">` on every page, and `robots.txt` with `Disallow: /`.
  - No Google Tag Manager or analytics.
  - Forms email `PREVIEW_INBOX` only, never the church.
- **Layout.** No horizontal scroll at 375/768/1280. Respect `prefers-reduced-motion`.
- **Lighthouse.** Performance ≥ 90 and Accessibility ≥ 95 on `/`, `/sermons`, `/give` and `/prayer-request`.
- **Git.** Work on branch `build/fcci-v1`; never push without the owner's OK. Commits end with a blank line, then `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Chrome text that differs between pages.** A page whose nav or footer text differs from the shared chrome must keep its own text, not have it silently replaced. *Test in Task 2.*
2. **Characters in source text.** Smart quotes, `&`, emoji and non-breaking spaces must survive import and rendering byte-for-byte, after whitespace normalisation only. *Test in Task 2 (import) and Task 11 (fidelity).*
3. **Form submissions.**
   - A submission with an unknown form id or extra fields must be rejected without email.
   - HTML typed into a form must arrive escaped in the email.

   *Tests in Task 9.*
4. **A Subsplash embed that fails to load** (blocked or offline) must leave the page usable, with the source's own link or button still visible. *Test in Task 7.*
5. **Long or unbroken words** (URLs, Bebas headings) must not cause horizontal scroll at 375px. *Test in Task 11.*

---

## File Structure

```
astro.config.mjs        static output, site URL from env, image service
wrangler.jsonc          name fcci-preview, main src/worker.js, assets ./dist
site.config.ts          SiteConfig: brand, colors, fonts, nav, footer, contact,
                        subsplash ids, preview strip, ALLOWED_EXTRA_TEXT
scripts/import-content.mjs   source/pages/*.md -> src/content/pages/*.json
scripts/lib/parse-source.mjs pure parser (unit-tested)
src/content/pages/*.json     generated, committed
src/content.config.ts        collection schema (zod)
src/pages/[...path].astro    one route rendering every page via layout map
src/pages/404.astro
src/layouts/{Base,Home,Standard,Ministry,Media,Blog,Form}.astro
src/components/  Header, MobileNav, Footer, PreviewStrip, Hero, Section,
                 Blocks (renders content blocks), TileStack, ServiceTimes,
                 SubsplashEmbed, CalendarLink, FormRenderer, Figure, Button
src/styles/{tokens.css,base.css}
src/assets/images/       optimised copies of source/assets
src/worker.js            static passthrough + POST /api/form
src/form/{validate.js,email.js}
tests/unit/  tests/worker/  tests/e2e/  tests/fidelity/
```

---

### Task 1: Scaffold Astro, Worker and tooling

**Files:**
- Create: `package.json`, `astro.config.mjs`, `wrangler.jsonc`, `vitest.config.mjs`, `playwright.config.mjs`, `src/pages/index.astro` (temporary), `src/worker.js`, `tests/worker/router.test.js`, `tests/e2e/smoke.spec.js`

**Interfaces:**
- Produces: `npm run build` → `dist/`; `npm run dev:worker` = `astro build && wrangler dev` on :8788; `src/worker.js` exports `{ fetch(request, env, ctx) }`, which routes `POST /api/form`, sends other `/api/*` to 404 JSON, and passes everything else to `env.ASSETS.fetch`.
- `wrangler.jsonc`:
  - `name: "fcci-preview"`
  - `assets: { directory: "./dist", binding: "ASSETS", not_found_handling: "404-page" }`
  - `vars: { PREVIEW_INBOX: "amanorsac@gmail.com" }`
  - a `previews` block with the same vars
- Copy the CTSD repo's tooling choices: vitest projects `unit` (node) and `worker` (pool-workers), and Playwright chromium + webkit, with firefox opt-in via `PW_FIREFOX=1`. Reference: `../IT Solutions/vitest.config.mjs`, `../IT Solutions/playwright.config.mjs`. Apply its `overrides.workerd` pin only if pool-workers rejects the compatibility date.

- [ ] **Step 1:** Create branch `build/fcci-v1`. Install `astro`, `wrangler@^4`, `vitest`, `@cloudflare/vitest-pool-workers`, `@playwright/test`, `@axe-core/playwright`, `cheerio`, `@fontsource/bebas-neue` and `@fontsource/montserrat`. Run `npx playwright install chromium webkit`.
- [ ] **Step 2: Write failing tests.**
  - `router.test.js`: `GET /` returns what `ASSETS` returns; `GET /api/nope` → 404 `{ok:false,error:"not_found"}`; `GET /api/form` → 405.
  - `smoke.spec.js`: `/` returns 200 and `html` has `lang="en"`.
- [ ] **Step 3: Run** `npx vitest run` and `npx playwright test`. Expected: FAIL.
- [ ] **Step 4: Implement the scaffold.** Playwright's `webServer` runs `npm run dev:worker`.
- [ ] **Step 5: Run both.** Expected: PASS.
- [ ] **Step 6: Commit** `chore: scaffold astro site, worker and tooling`.

---

### Task 2: Content import (source → JSON)

**Files:**
- Create: `scripts/lib/parse-source.mjs`, `scripts/import-content.mjs`, `src/content.config.ts`, `src/content/pages/*.json` (generated), `src/content/chrome.json` (generated), `tests/unit/parse-source.test.js`

**Interfaces:**
- **`parseSourcePage(markdown: string) → SourcePage`**, where:
  ```
  SourcePage = {
    url: string,
    path: string,          // e.g. "/mission-and-vision", "/" for home
    slug: string,          // file stem
    title: string,         // from the "# ..." first line, verbatim
    description: string,
    segments: Segment[],   // VISIBLE TEXT in order, chrome removed
    navChrome: string[],   // leading nav labels found on this page
    footerChrome: Segment[],
    links: {label: string, href: string}[],
    images: {src: string, alt: string}[],
    embeds: string[],      // raw tags from EMBEDS / FORMS
    forms: FormDef[]
  }
  Segment = { kind: "h1"|"h2"|"h3"|"p", text: string, href?: string }
  FormDef = { id: string, fields: {label: string, name: string,
              type: "text"|"email"|"tel"|"textarea"|"checkbox"|"radio"|"select",
              required: boolean, options?: string[]}[] }
  ```
- **`importAll(srcDir, outDir) → {pages: number, chromeMismatches: string[]}`**
  - writes one JSON file per page plus `chrome.json` (`{nav: string[], footer: Segment[]}`, taken from the home page)
  - writes a `layout` field per page, using the mapping table in spec §4
- **Chrome rule:**
  - The nav chrome is the run of lines from `Home` through `Blog` at the start of VISIBLE TEXT.
  - The footer chrome is the block starting at `### Charlottesville Campus` through the end of `### Social Pages`.
  - If a page's nav or footer differs from the home chrome, keep that page's differing segments in its own `segments` and add the page to `chromeMismatches`; never drop text.
- **Heading levels:** markdown `#` → h1, `##` → h2, `###` → h3, and plain paragraphs → p. The text is copied byte-for-byte, with only leading and trailing whitespace trimmed.
- **Forms:** parsed from the raw `<form>`/input tags in EMBEDS / FORMS. Labels and options come verbatim from the source.

- [ ] **Step 1: Write failing tests** in `parse-source.test.js`, using `source/pages/mission-and-vision.md` and `home.md`:
  - mission-and-vision:
    - `title === "Faith Christian Center International - Mission and Vision"`
    - `path === "/mission-and-vision"`
    - the first non-chrome segment is `{kind:"h1", text:"Mission & Vision"}`
    - one segment's text starts with `"Faith Christian Center International is a thriving"`
    - no segment's text equals `"Pastor's Blog"`, because that is nav chrome
  - home:
    - `path === "/"`
    - segments include `{kind:"h2", text:"WELCOME HOME"}` and `{kind:"h2", text:"Latest Teaching"}`
  - characters: a synthetic markdown containing `“curly” & café — emoji 🙏` and a non-breaking space round-trips unchanged
  - chrome mismatch: a synthetic page whose footer has an extra line keeps that line in `segments` and is reported
  - forms: `prayer-request.md` produces a form whose field labels equal the labels in its EMBEDS section
- [ ] **Step 2: Run** `npx vitest run tests/unit/parse-source.test.js`. Expected: FAIL.
- [ ] **Step 3: Implement** the parser and `importAll`. Add `npm run import` → `node scripts/import-content.mjs`. Define the zod schema in `src/content.config.ts` (a `pages` collection with a JSON loader).
- [ ] **Step 4: Run** the tests, then `npm run import`. Expected: PASS; 46 JSON files written. Paste the `chromeMismatches` list in the report.
- [ ] **Step 5: Commit** `feat: import verbatim source content to json`.

---

### Task 3: Site config, theme, base layout, header, footer and preview strip

**Files:**
- Create: `site.config.ts`, `src/styles/tokens.css`, `src/styles/base.css`, `src/layouts/Base.astro`, `src/components/{Header,MobileNav,Footer,PreviewStrip}.astro`, `public/robots.txt`, `public/fonts/*`, `tests/e2e/shell.spec.js`, `tests/unit/no-client-strings.test.js`

**Interfaces:**
- `site.config.ts` exports `site: SiteConfig`:
  - `name`, `logo` (`src/assets/images/logo.png`, copied from `source/assets/11503942_596x300_500.png`)
  - `colors` (the Global Constraints values) and `fonts`
  - `nav`: the source nav tree:
    - Home
    - About (group: Mission and Vision, What We Believe, Leadership, Kidz & Youth)
    - Connect (group: Calendar, Connect Groups, Growth Track, Jesus, Pastor's Blog, I'm New)
    - Watch Live, Sermons, Give, Blog

    Labels are verbatim from `chrome.json`; hrefs are from the source links.
  - `headerCtas: [{label:"Plan Your Visit", href:"/i-m-new"}, {label:"Give", href:"/give"}]`. "Plan Your Visit" exists verbatim in `home-v2`'s source and "Give" in the nav, so it is allowed text. If the implementer finds "Plan Your Visit" absent from the source, use "I'm New" instead.
  - `footer`: from `chrome.json`. The footer email link's href becomes `mailto:connect@fccintl.org`, which fixes the source's malformed `https://connect@fccintl.org`; the label text is unchanged.
  - `contact`, `socials`, `subsplash: { accountId: "BPM5XF", giveEmbed: "https://subsplash.com/u/-BPM5XF/give?embed=true" }`
  - `preview: { enabled: true, text: "Preview of a redesigned fcci.life by CTSD" }`
  - `ALLOWED_EXTRA_TEXT = [preview.text, "Skip to content"]`
- `Base.astro` props: `{ title: string, description: string, tone?: "dark"|"light" }`. It renders:
  - the head: noindex meta, font preloads, theme CSS variables taken from config
  - the skip link and the preview strip (dismissible, remembered per session with try/catch)
  - the header, `<main id="main">` and the footer

**Header:**
- logo on the left, then the nav with About and Connect as disclosure groups (button plus `aria-expanded`), then the two CTAs
- sticky, solid `--ink`, gaining a blur after scroll. Put the blur on a `::before` pseudo-element; a `backdrop-filter` on the header itself would break the fixed mobile menu, as happened in CTSD.
- the mobile menu button is an icon with `aria-label="Menu"`

- [ ] **Step 1: Write failing tests.**
  - `shell.spec.js`, at 375 and 1280:
    - the nav shows the 7 top labels in source order
    - the About group opens and shows its 4 links
    - the CTAs link to `/i-m-new` (or the fallback) and `/give`
    - the skip link is the first focusable element
    - the robots meta contains `noindex`
    - `/robots.txt` contains `Disallow: /`
    - there is no request to `googletagmanager.com`
    - the preview strip is visible and dismissible
    - axe finds 0 serious violations; there is no horizontal scroll
    - the mobile menu still opens and fills the viewport after scrolling 400px
  - `no-client-strings.test.js`: the files under `src/components` and `src/layouts` contain none of `FCCI`, `Faith Christian`, `Charlottesville`, `fccintl`, `#ee7b1a` or `subsplash.com`.
- [ ] **Step 2: Run** them. Expected: FAIL.
- [ ] **Step 3: Implement** the shell.
- [ ] **Step 4: Run** them. Expected: PASS.
- [ ] **Step 5: Commit** `feat: site config, theme and page shell`.

---

### Task 4: Shared components and the content block renderer

**Files:**
- Create: `src/components/{Blocks,Hero,Section,TileStack,ServiceTimes,SubsplashEmbed,CalendarLink,Figure,Button}.astro`, `tests/e2e/components.spec.js`, `src/pages/_dev/components.astro` (dev-only showcase, excluded from the build via a `_` prefix check in the route)

**Interfaces:**
- **`Blocks.astro`** `{ segments: Segment[] }`: renders segments in order with semantic tags. A `p` segment that has an `href` renders as a link.
- **`Hero.astro`** `{ heading: Segment, sub?: Segment[], image?: ImageMetadata, ctas?: {label,href}[], tone: "dark" }`: a full-bleed image with a directional scrim (`linear-gradient(90deg, rgba(17,17,17,.85), rgba(17,17,17,.2))`). Bebas heading with `clamp(3rem, 9vw, 7.5rem)`.
- **`Section.astro`** `{ tone: "dark"|"light"|"light-2", id?: string }`: a slot wrapper.
- **`TileStack.astro`** `{ tiles: {title: Segment, text?: Segment, href: string, image?: ImageMetadata}[] }`: amanorsac-style stacked full-width tiles that alternate dark and light.
- **`ServiceTimes.astro`** `{ segments: Segment[] }`: renders the source's Service Times segments as a prominent block.
- **`SubsplashEmbed.astro`** `{ src: string, title: string, fallback: {label: string, href: string} }`:
  - a lazy iframe in a styled frame
  - the source's fallback link is always rendered below the iframe, so the page stays usable if the embed is blocked
- **`CalendarLink.astro`** `{ heading: Segment, href: string }`: a styled section with the source heading and a button linking to the current fcci.life calendar. It invents no events.
- **`Figure.astro`** `{ image: ImageMetadata, alt: string, sizes: string }`: uses `astro:assets` `<Picture>` (AVIF/WebP).

- [ ] **Step 1: Write a failing test** `components.spec.js` against `/_dev/components` (dev server only):
  - `Blocks` renders the h1/h2/p order of a fixture
  - `SubsplashEmbed` with an aborted iframe request still shows its fallback link
  - `Hero` text has a contrast ratio ≥ 4.5 against the scrim's darkest stop
  - `TileStack` produces no horizontal scroll at 375
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.** Copy `source/assets/*` into `src/assets/images/` with `npm run import` (extend the script).
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Commit** `feat: shared components and block renderer`.

---

### Task 5: Route plus the Standard and Ministry layouts

**Files:**
- Create: `src/pages/[...path].astro`, `src/layouts/Standard.astro`, `src/layouts/Ministry.astro`, `src/pages/404.astro`, `tests/e2e/standard.spec.js`

**Interfaces:**
- **`[...path].astro`:**
  - `getStaticPaths()` returns one entry per content page, keyed by its `path`; the home path `/` maps to `index`.
  - It picks the layout via `LAYOUTS[page.layout]`, where `layout` is one of `"home"|"standard"|"ministry"|"media"|"blog"|"form"`.
  - Pages whose layout isn't built yet temporarily use Standard; tasks 6–9 replace this.
- **Standard:**
  - a dark compact hero from the page's h1, using the first source image if any
  - then the light reading column (max 70ch) with the remaining segments
  - long pages alternate `light` and `light-2` sections at each h2
- **Ministry:**
  - a full-bleed photo hero using the page's source image
  - h2 sections, rendered as a TileStack when they link to subpages
  - any form on the page is rendered by FormRenderer (Task 9). Until then, it is a placeholder section with the form's source heading.

- [ ] **Step 1: Write a failing test** `standard.spec.js` covering `/mission-and-vision`, `/what-we-believe`, `/leadership`, `/men` and `/kidz-amp-youth`:
  - each returns 200
  - the `h1` text equals the source h1
  - the first paragraph of mission-and-vision is visible
  - axe finds 0 serious violations
  - there is no horizontal scroll at 375
  - an unknown path → 404 page
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run.** Expected: PASS. Also run `npm run build` and confirm `dist/` holds 46 page HTML files plus 404.
- [ ] **Step 5: Commit** `feat: page route, standard and ministry layouts`.

---

### Task 6: Home layout

**Files:**
- Create: `src/layouts/Home.astro`, `tests/e2e/home.spec.js`

**Interfaces:**
- **Built only from the home page's segments,** re-laid out in this order:
  1. **Hero** (dark): the first h2 (`WELCOME HOME`) and its following paragraph, with the hero image from the source. The CTAs come from the header CTAs.
  2. **REACH / TEACH / TRANSFORM:** the three source blocks ("PEOPLE FROM ALL WALKS OF LIFE", "THE TRUTH OF GOD'S WORD" and "LIVES WITH THE LOVE AND POWER OF GOD.", each with its big word), shown as three cinematic panels, one per photo.
  3. **Latest Teaching:** a SubsplashEmbed using the source's latest-teaching embed URL, plus its source link.
  4. **Service Times and Charlottesville Campus:** ServiceTimes.
  5. Any remaining home segments, in source order.
- `home-v2` and `home-app` use the same layout with their own segments. Sections whose segments don't exist are skipped.
- **No new text.** The words REACH, TEACH and TRANSFORM appear only where the source has them.

- [ ] **Step 1: Write a failing test** `home.spec.js`:
  - `/` shows "WELCOME HOME" in the hero
  - the three REACH/TEACH/TRANSFORM panels are visible and in order
  - the Latest Teaching iframe has `loading="lazy"` and a title
  - the service times text matches the source
  - `/home-v2` and `/home-app` return 200
  - the hero image has `fetchpriority="high"`
  - axe finds 0 serious violations
  - there is no horizontal scroll at 375
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Commit** `feat: home layout`.

---

### Task 7: Media layout (sermons, live, watch, give, calendar)

**Files:**
- Create: `src/layouts/Media.astro`, `tests/e2e/media.spec.js`

**Interfaces:**
- **Layout:** a dark cinematic page.
  - The h1 sits in a hero, and each source embed is rendered with SubsplashEmbed. The embed URLs are the exact `src` values from `embeds`, with the source's adjacent link as the fallback.
  - Static sermon titles, dates and speakers in the source become styled cards, using the text verbatim.
- **Give:**
  - the giving iframe, a prominent text-to-give block (the source text "text FCCINTL to 1-888-364-4483" verbatim, with an `sms:` link added to the existing text) and the app links
  - the `sms:` href is new link behaviour on existing text, which is allowed
- **Calendar:** CalendarLink to `https://www.fcci.life/calendar`, using the page's own heading.

- [ ] **Step 1: Write a failing test** `media.spec.js`:
  - `/sermons`, `/media/live`, `/watch-live`, `/watch`, `/give` and `/calendar` return 200
  - each embed iframe `src` equals the source `src`
  - with `page.route('**/subsplash.com/**', r => r.abort())`, every embed's fallback link is still visible
  - `/give` contains the text-to-give text verbatim
  - axe finds 0 serious violations; there is no horizontal scroll at 375
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Commit** `feat: media layout with resilient subsplash embeds`.

---

### Task 8: Blog layout

**Files:**
- Create: `src/layouts/Blog.astro`, `tests/e2e/blog.spec.js`

**Interfaces:**
- `/blog` and `/blog/tag/*`: a light card grid of posts (title, date, excerpt), all verbatim from source segments, with tag pills from the source links.
- The post page: a reading layout with a 68ch column, a large Bebas title, and the source date line.
- `pastor-s-blog` uses this layout if its source is a post list; otherwise it uses Standard. The implementer decides from the source and notes the choice in the report.

- [ ] **Step 1: Write a failing test** `blog.spec.js`:
  - `/blog`, the post URL and the four tag URLs return 200
  - the post title matches the source
  - the tag links resolve
  - axe finds 0 serious violations
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Commit** `feat: blog layout`.

---

### Task 9: Forms (renderer plus `/api/form`)

**Files:**
- Create: `src/components/FormRenderer.astro`, `public/js/forms.js`, `src/form/validate.js`, `src/form/email.js`, `src/layouts/Form.astro`, `tests/unit/validate.test.js`, `tests/worker/form.test.js`, `tests/e2e/forms.spec.js`
- Modify: `src/worker.js`, `src/layouts/Ministry.astro` (replace the placeholder)

**Interfaces:**
- **`FormRenderer.astro`** `{ form: FormDef, pagePath: string }`:
  - labels and options are verbatim, with required fields marked by `aria-required` and an asterisk icon (`aria-hidden`), not by text
  - the honeypot `company_hp` is off-screen
  - the submit button label is the source's submit label
- **`public/js/forms.js`:**
  - posts JSON to `/api/form`
  - disables the button while sending
  - success replaces the form with the source's own success text if captured; otherwise it shows the submit label with a check icon and no new wording
  - errors show the field errors, using the browser's built-in validation messages for client checks
- **`validateSubmission(body, formDefs) → {ok:true, value} | {ok:false, errors}`:**
  - `formId` must exist in `formDefs`
  - only fields defined for that form are kept, and unknown fields are dropped
  - required fields must be present
  - email fields must be valid
  - text is at most 4000 characters, with C0 control characters stripped except `\t\n\r`
- **`POST /api/form`:**
  - checks run in this order: JSON parse (413 if over 32KB), honeypot (200 with no side effect), Turnstile only if `env.TURNSTILE_SECRET` is set, validation (400)
  - a missing `RESEND_API_KEY` → 500 `server`
  - otherwise it emails `env.PREVIEW_INBOX` with the subject `[FCCI preview] <form id> — <page path>` and the HTML escaped
  - it returns 200 `{ok:true}`
  - outbound fetches time out after 8s
  - it uses `ctx.waitUntil` only after validation succeeds
  - `formDefs` is imported from a build-generated `src/form/form-defs.json` (written by `npm run import`)

- [ ] **Step 1: Write failing tests.**
  - `validate.test.js`: unknown `formId` → error; an extra field is dropped; a missing required field → error; a bad email → error; a NUL character is stripped.
  - `form.test.js`:
    - a valid submission → 200, and Resend is called with `to: PREVIEW_INBOX`
    - the escape check:

      ```js
      expect(emailHtml).toContain('&lt;img');
      expect(emailHtml).not.toContain('<img src=x');
      ```
    - a filled honeypot → 200 with no fetch
    - no `RESEND_API_KEY` → 500
    - an unknown form → 400 with no fetch
    - `GET` → 405
  - `forms.spec.js` (with `/api/form` mocked):
    - on `/prayer-request` and `/connect-card`, the labels equal the source labels
    - a double-click on submit sends exactly 1 request
    - a mocked 500 keeps the entered values
    - the success state appears
    - axe finds 0 serious violations
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.** Map every page whose `forms.length > 0` to show FormRenderer inside its layout.
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Commit** `feat: forms renderer and preview-inbox endpoint`.

---

### Task 10: Images

**Files:**
- Modify: `scripts/import-content.mjs` (write an image map), every layout that shows images
- Create: `src/content/alt-text.json`, `tests/e2e/images.spec.js`

**Interfaces:**
- **`alt-text.json`** maps `{ "<asset filename>": "<description>" }`.
  - Descriptions are factual, short and written by looking at each image, e.g. "Congregation worshiping with raised hands".
  - Decorative backgrounds get `""` and are rendered inside `aria-hidden` containers.
  - Alt text is non-visible accessibility text, as the spec §1 allows.
- **Rendering:** all page images go through `Figure` or `Hero`, using `astro:assets`, so none reference `storage1.snappages.site` at runtime.

- [ ] **Step 1: Write a failing test** `images.spec.js`. Across all 46 pages:
  - no `img` `src` points to `snappages.site`
  - every `img` has an `alt` attribute (empty allowed only inside `[aria-hidden="true"]`)
  - the largest image on `/` has a WebP or AVIF source
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.** Look at each of the 48 images to write its alt text.
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Commit** `feat: optimised local images with alt text`.

---

### Task 11: Fidelity, routes and links across all 46 pages

**Files:**
- Create: `tests/fidelity/extract.mjs`, `tests/fidelity/fidelity.test.js`, `tests/e2e/routes-links.spec.js`

**Interfaces:**
- **`extractBuiltSegments(html: string) → string[]`:** uses cheerio on a `dist/**/*.html` file. It takes the visible text of headings, paragraphs, list items, links, buttons, labels and options, and excludes:
  - `[aria-hidden="true"]`, `.sr-only`, `script`, `style`, `iframe`, `noscript`
  - attribute values

  Whitespace is collapsed to single spaces and trimmed.
- **`normalize(s)`:** whitespace collapse only.
- **The fidelity test,** for each content JSON:
  1. **Coverage:** every source segment text (normalised) appears as a substring of the page's joined built text.
  2. **No extras:** every built segment is a source segment, a chrome text (nav or footer), a `form` label or option, or in `ALLOWED_EXTRA_TEXT`.

  On failure it prints the page path plus the missing and extra lists. It runs after `npm run build` via `npm run test:fidelity`, which `npm test` includes.
- **`routes-links.spec.js`:**
  - all 46 source paths return 200
  - every internal `a[href]` resolves
  - every external link target from the source `links` appears somewhere on that page
  - the footer email is `mailto:connect@fccintl.org`
  - long-word check: at 375px, every page has `scrollWidth <= innerWidth`

- [ ] **Step 1: Write the tests.** Include a unit test for `extractBuiltSegments` with a fixture: `aria-hidden` text is excluded and a `.sr-only` skip link is excluded.
- [ ] **Step 2: Run** `npm run build && npm run test:fidelity`. Fix layouts until it passes, and never edit the content JSON to make it pass.
- [ ] **Step 3: Run** `npx playwright test tests/e2e/routes-links.spec.js`. Expected: PASS.
- [ ] **Step 4: Commit** `test: wording fidelity, routes and links for all pages`.

---

### Task 12: QA and launch notes

**Files:**
- Create: `docs/preview-checklist.md`

- [ ] **Step 1: Run the full suites:** `npm test` and `npx playwright test`. Both must exit 0.
- [ ] **Step 2: Run Lighthouse** (desktop and mobile) on `/`, `/sermons`, `/give` and `/prayer-request` against `wrangler dev`. Fix anything below the gates, then record the scores in the checklist.
- [ ] **Step 3: Take screenshots** of every page at 375 / 768 / 1280 on chromium and webkit. Look at a sample of each layout and fix real visual bugs.
- [ ] **Step 4: Write `docs/preview-checklist.md`** for the owner, in plain language:
  1. Create a **private** GitHub repo `fcci-preview` and push (Claude can do this on the owner's OK).
  2. In Cloudflare, create a Worker from that repo. The build command is `npm run build` and the deploy command is `npx wrangler deploy`.
  3. Add the secret `RESEND_API_KEY` (the same key as CTSD).
  4. Open the `….workers.dev` link on a phone, and send one test form.
  5. Share the link with leadership.
- [ ] **Step 5: Commit** `docs: preview checklist and QA results`.
