# FCCI Redesign v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-skin the FCCI preview white with the church's real fonts and colors, add a church-photos / AI-images toggle, and add Dream Team, Ministries and Next Steps pages, a new home page and an expanded FAITH KIDZ page. New wording lives in reviewable draft files.

**Architecture:** This builds on the merged v1 Astro site. Theme tokens move to Abril Fatface, Lato and a white palette. A new `ImageSlot` component renders a church image and an AI image, and a class on `<html>` picks which one shows. Draft copy lives in a `draft` content collection, checked by a cliché lint and a generated review document. New pages are Astro routes built from draft and church content. The fidelity test still guarantees every church line.

**Tech Stack:** Astro, Cloudflare Worker, vitest, Playwright plus axe, sharp, `@fontsource/abril-fatface`, `@fontsource/lato`, and Higgsfield Nano Banana Pro (through the connected MCP) for the AI images.

**Spec:** `docs/superpowers/specs/2026-10-04-fcci-redesign-v2-design.md`

## Global Constraints

- **Branch** `build/fcci-v2`. Never push without the owner's OK. Commits end with a blank line, then `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Fonts:** Abril Fatface (display) and Lato 300/400/700/900 (text), self-hosted woff2. No Bebas Neue or Montserrat left.
- **Colors:** `--accent #ee7b1a`, `--accent-hover #d8660f`, `--blue #2b7bb9`, `--ink #111111`, `--paper #ffffff`, `--paper-2 #f7f5f2`, and `--grad` from orange to the sampled pink. All text and background pairs must pass AA.
- **Dark sections** only in the footer and at most one band per page.
- **Church wording:** every existing church line stays, enforced by the v1 fidelity coverage. New visible text comes only from `src/content/draft/*.json`.
- **AI images:** no text or logos in the images. Alt text starts with `AI image:`. About 20 images, all Nano Banana Pro.
- **Unchanged from v1:** the client-neutral components rule, noindex, no GTM, and forms going to the preview inbox only.
- **Gates:** 375px with no horizontal scroll; Lighthouse Performance ≥ 90 and Accessibility ≥ 95 on `/`, `/dream-team`, `/kidz-amp-youth` and `/give`.

## Review Focus

1. **The toggle with storage blocked** must still switch images, falling back to in-memory state. *Test in Task 2.*
2. **A slot with no church photo** must show the AI image in church mode, never a broken image. *Test in Task 2.*
3. **Draft text duplicating church text** must not trip fidelity or count twice. *Test in Task 4.*
4. **Long draft team names on 375px cards** must not overflow. *Test in Task 5.*
5. **Every existing path still returns 200** after the menu is restructured. *Test in Task 8.*

---

### Task 1: White theme and real fonts

**Files:**
- Modify: `site.config.ts` (colors and nav), `src/styles/base.css`, `src/layouts/Base.astro`, `src/components/{Header,Footer,Hero,Blocks,PreviewStrip,ServiceTimes,FormRenderer}.astro`
- Create: `public/fonts/abril-*.woff2`, `public/fonts/lato-*.woff2`
- Test: `tests/e2e/theme.spec.js`

**Interfaces:**
- CSS variables: `--font-display: 'Abril Fatface'`, `--font-body: 'Lato'`, plus the color tokens above and `--grad`.
- `.tone-light` / `.tone-light-2` are the defaults. `.tone-dark` is kept for the footer only. `.grad-band` is the gradient section class.
- The new nav tree goes in `site.config.ts`, as in spec §4. Labels come from the church nav or from draft (`Next Steps`, `Ministries`, `Dream Team`, `Watch`).

- [ ] **Step 1: Sample the pink.** Read the computed background of the REACH section on www.fcci.life with Playwright, and record it in the config with a comment.
- [ ] **Step 2: Write a failing test** `theme.spec.js`:
  - `getComputedStyle(h1).fontFamily` contains `Abril Fatface`, and the body font contains `Lato`
  - the body background is `rgb(255, 255, 255)`
  - the header background is light
  - no element outside the footer has a computed background of `#111111` covering more than 50% of the viewport, except one allowed band
  - axe finds 0 serious violations on `/`, `/mission-and-vision` and `/give`
- [ ] **Step 3: Run it.** Expected: FAIL.
- [ ] **Step 4: Implement** the fonts, tokens and component re-skin.
  - Header: white with a hairline border, dark text, orange CTA, and Give as an outline.
  - Hero: a light variant with the photo in a rounded frame, or a full-bleed photo with a light scrim.
  - Footer: stays dark.
  - Update the v1 tests that assert dark styles.
- [ ] **Step 5: Run the full suites.** Expected: PASS.
- [ ] **Step 6: Commit** `feat: white theme with the church's fonts and colors`.

---

### Task 2: Image slots and the photo toggle

**Files:**
- Create: `src/lib/slots.ts`, `src/components/ImageSlot.astro`, `src/content/image-slots.json`, `tests/e2e/toggle.spec.js`
- Modify: `PreviewStrip.astro`, `Base.astro`, and every layout and component that shows images

**Interfaces:**
- `image-slots.json`: `{ "<slotId>": { "church"?: "<church upload id>", "ai"?: "<ai file name>", "alt": "<church-mode alt>", "aiAlt": "AI image: ..." } }`
- `ImageSlot.astro` props: `{ slot: string, sizes: string, eager?: boolean, class?: string }`.
  - It renders the church `<picture data-variant="church">` and the AI `<picture data-variant="ai">`.
  - When one source is missing, the other renders in both modes.
- `html.img-ai` shows `[data-variant=ai]` and hides `[data-variant=church]`; the default is the reverse.
- The toggle has two buttons with `aria-pressed`. The choice is saved in `sessionStorage` key `fcci-img` (try/catch); with storage blocked, an in-memory value is used. An inline head script applies the class before paint.

- [ ] **Step 1: Write a failing test** `toggle.spec.js`:
  - clicking "AI images" shows the AI pictures and hides the church ones on `/`
  - the choice survives navigating to `/dream-team`
  - with storage blocked (an `addInitScript` that throws), the toggle still works
  - a slot with no church source shows its AI image in church mode
  - no visible `img` has `naturalWidth` 0 in either mode
- [ ] **Step 2: Run it.** Expected: FAIL.
- [ ] **Step 3: Implement it.** Convert the hero, pillar, ministry, blog and media images to slots. Their church sources are the v1 images; AI sources are filled in by Task 3.
- [ ] **Step 4: Run it.** Expected: PASS.
- [ ] **Step 5: Commit** `feat: church photos / AI images toggle`.

---

### Task 3: Generate the AI images

**Files:**
- Create: `docs/ai-images.md` (prompt per slot), `src/assets/ai/*.webp`
- Modify: `src/content/image-slots.json`

- [ ] **Step 1: Write about 20 prompts** in `docs/ai-images.md`, one per slot:
  - home hero
  - REACH, TEACH and TRANSFORM
  - tiles: new here, kids, youth, groups
  - the kids spotlight and 4 kids age groups
  - 6 Dream Team scenes: worship, media, guest services, café, ushers, prayer
  - the next-steps band
  - an exterior

  Every prompt follows the same style rules: warm natural light, a modern church in Virginia, diverse congregation, candid, 35mm photo, no text, no logos, no signage.
- [ ] **Step 2: Generate them** with `generate_image_batch` using model `nano_banana_pro`, resolution `2k`, and the aspect ratio each slot needs.
- [ ] **Step 3: Download and check.** Download each result, convert it to WebP with sharp at max 2400px, and look at every image. Regenerate any with text, distorted hands or faces, or off-brand color (at most one retry each).
- [ ] **Step 4: Register the files** in `image-slots.json` with `aiAlt` text. Run `npx playwright test tests/e2e/toggle.spec.js`. Expected: PASS.
- [ ] **Step 5: Commit** `feat: AI image set`.

---

### Task 4: Draft copy system

**Files:**
- Create:
  - `src/content/draft/*.json`
  - the `draft` collection in `src/content.config.ts`
  - `scripts/draft-copy.mjs` (generates `docs/draft-copy.md`)
  - `tests/unit/draft.test.js`
- Modify: `tests/fidelity/fidelity.test.js` (allow draft text)

**Interfaces:**
- Draft entry: `{ id: string, page: string, items: { key: string, text: string }[] }`.
- `draftText(page: string, key: string) → string` in `src/lib/draft.ts`. It throws at build time on a missing key.
- `CLICHES` list (lowercase): `vibrant community`, `journey of faith`, `embark`, `unlock your potential`, `cutting-edge`, `in today's fast-paced world`, `tapestry`, `elevate`, `seamless`.

- [ ] **Step 1: Write failing tests** `draft.test.js`:
  - every draft text is non-empty and ≤ 400 characters
  - no draft text contains a cliché (case-insensitive)
  - `docs/draft-copy.md` lists every draft text exactly
  - a draft line identical to a church line is allowed and counted once by fidelity
- [ ] **Step 2: Run it.** Expected: FAIL.
- [ ] **Step 3: Implement** the collection, `draftText`, the generator (`npm run draft-copy`), and the fidelity change: extras may now also be draft text.
- [ ] **Step 4: Run it.** Expected: PASS.
- [ ] **Step 5: Commit** `feat: draft copy collection, cliché lint and review doc`.

---

### Task 5: Dream Team, Ministries and Next Steps pages

**Files:**
- Create: `src/pages/dream-team.astro`, `src/pages/ministries.astro`, `src/pages/next-steps.astro`, `src/content/draft/{dream-team,ministries,next-steps}.json`, `tests/e2e/new-pages.spec.js`

**Interfaces:**
- **Dream Team team list:** the 14 options of `volunteer-signup-1` field `f2`, read from `form-defs.json`, so the names stay verbatim.
- **Each team card:** the team name (church), a one-line purpose (draft), an image slot (AI when available) and an icon.
- **"Join the Dream Team":** renders the existing `volunteer-signup-1` form through `FormRenderer`.

- [ ] **Step 1: Write a failing test** `new-pages.spec.js`:
  - the three pages return 200 with one h1
  - `/dream-team` shows 14 team cards whose titles equal the form options
  - the volunteer form is present
  - `/ministries` links to `/kidz-amp-youth`, `/men`, `/women`, `/students`, `/connect-groups` and `/dream-team`
  - `/next-steps` shows a numbered list of 6 steps with links
  - 375px with no horizontal scroll (long team names); axe finds 0 serious violations
- [ ] **Step 2: Run it.** Expected: FAIL.
- [ ] **Step 3: Implement** the pages and draft copy, in the church's voice and reusing its phrases.
- [ ] **Step 4: Run it.** Expected: PASS.
- [ ] **Step 5: Commit** `feat: dream team, ministries and next steps pages`.

---

### Task 6: Home page v2

**Files:**
- Modify: `src/layouts/Home.astro` (for `/`; `home-v2` and `home-app` keep the v1 home layout re-skinned)
- Create: `src/content/draft/home.json`
- Test: `tests/e2e/home.spec.js` (rewrite)

- [ ] **Step 1: Write a failing test.** The sections appear in spec §4 order, checked by `data-section`: `hero`, `pillars`, `tailor`, `kids`, `sermon`, `events`, `dream-team`, `next-steps`, `visit`. Also check:
  - the hero shows `WELCOME HOME`, the service times and the `Plan Your Visit` and `Watch Live` links
  - the pillars render REACH, TEACH and Transform in Abril Fatface
  - 4 tailor tiles link to `/i-m-new`, `/kidz-amp-youth`, `/students` and `/connect-groups`
  - the Dream Team call to action links to `/dream-team`
  - the church fidelity for `/` still passes
- [ ] **Step 2: Run it.** Expected: FAIL.
- [ ] **Step 3: Implement it.** Events use the church calendar link (no invented events). The "events" section shows the existing announcement plus a link to the calendar.
- [ ] **Step 4: Run it.** Expected: PASS.
- [ ] **Step 5: Commit** `feat: home page v2`.

---

### Task 7: FAITH KIDZ page

**Files:**
- Create: `src/layouts/Kids.astro`, `src/content/draft/kids.json`, `tests/e2e/kids.spec.js`
- Modify: `scripts/import-content.mjs` (`kidz-amp-youth` → layout `kids`)

- [ ] **Step 1: Write a failing test** `kids.spec.js`:
  - a gradient hero with h1 `FAITH KIDZ!`
  - 4 age cards whose text equals the church lines `FAITH KIDZ Nursery (Birth to 16 mos.)`, …, `FAITH KIDZ Church (1st grade to 5th grade)`
  - `Sundays @ 10 AM` is visible
  - the "first Sunday" and "safety & check-in" sections (draft) exist
  - the youth and college blocks appear with the church text
  - the fidelity for `/kidz-amp-youth` passes
- [ ] **Step 2: Run it.** Expected: FAIL.
- [ ] **Step 3: Implement it.**
- [ ] **Step 4: Run it.** Expected: PASS.
- [ ] **Step 5: Commit** `feat: FAITH KIDZ page`.

---

### Task 8: Re-skin the rest, menu check, QA

**Files:**
- Modify: `src/layouts/{Standard,Ministry,Media,Blog}.astro`
- Create: `docs/draft-copy.md` (generated), `docs/preview-checklist.md` (updated)

- [ ] **Step 1: Re-skin** the remaining layouts to the white design, using `ImageSlot`.
- [ ] **Step 2: Run the full suites,** `npm test` and `npx playwright test`. Both must pass, including routes and links for all 46 old paths plus the 3 new ones.
- [ ] **Step 3: Run Lighthouse** on `/`, `/dream-team`, `/kidz-amp-youth` and `/give`, desktop and mobile. The gates are in Global Constraints.
- [ ] **Step 4: Take screenshots** of key pages in both image modes at 375 / 768 / 1280, look at them, and fix any real issues.
- [ ] **Step 5: Regenerate `docs/draft-copy.md`,** update the checklist, and commit `docs: v2 QA, draft copy review list`.
