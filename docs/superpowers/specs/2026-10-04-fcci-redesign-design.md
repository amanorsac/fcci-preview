# FCCI Website Redesign (Pitch Preview): Design Spec

**Date:** 2026-10-04
**Client:** Faith Christian Center International (FCCI), Charlottesville, VA. Current site: https://www.fcci.life/
**Built by:** CTSD, as its first test client (the owner is a church member)
**Status:** Design approved in conversation; written spec awaiting review

---

## 1. Purpose

Build a **working preview** of a redesigned fcci.life that the owner can show to the pastor and church leadership.

- The current site stays live and unchanged.
- If leadership approves, the same build is upgraded into the real site in phase 2.
- It also becomes CTSD's first real portfolio piece and the foundation of the reusable **client starter**.

### Non-negotiables (from the owner)
1. **All 46 pages** of the current site are rebuilt.
2. **The original wording is kept exactly.**
   - No rewriting, no "improving" copy, no generic AI phrasing. Typos are kept too; the owner can fix those with the church later.
   - The only text we add is non-visible accessibility text (image alt text, aria labels), plus the preview strip in §7.
3. **Design only:** modern, in the spirit of trbc.org (structure and welcome flow) and amanorsac.studio (cinematic, big type, Apple-like tiles).
4. **Keep FCCI's colors as much as possible.**

### Success criteria
- Every one of the 46 source URLs has a page at the same path in the preview.
- The automated wording-fidelity check passes on every page (§6).
- Subsplash sermons, live stream and giving work inside the preview.
- Mobile at 375px has no horizontal scroll. Lighthouse Performance ≥ 90 and Accessibility ≥ 95 on Home, Sermons, Give and one form page.
- Leadership can click through it on a phone and it feels premium and unmistakably FCCI.

---

## 2. Source material (already captured)

`source/` holds the 2026-10-04 crawl of fcci.life:

| Item | What it is |
|---|---|
| `source/pages/*.md` | 46 pages: verbatim text, link and button targets, images, embeds and forms |
| `source/raw/` | The original HTML, used as the ground truth for the fidelity check |
| `source/assets/` | 48 original images, including the logo `11503942_596x300_500.png` |
| `source/inventory.md` | Site map, platform, brand, contact details, integrations and forms |
| `source/trbc-design.md` | Design study of trbc.org (patterns only; none of its content is used) |

**Platform today:** SnapPages, with Subsplash (account BPM5XF) for sermons, the live stream, giving, the app and some forms.

---

## 3. Architecture

- **Astro** (free, open-source) static site generator, deployed to **Cloudflare Workers static assets** on the owner's account, like the CTSD site. It ships zero JavaScript by default; small islands of JS only where needed (menu, sliders, forms).
- **A tiny Worker endpoint** `POST /api/form` handles all 15 forms. In preview mode it emails the submission to `PREVIEW_INBOX` (amanorsac@gmail.com) through Resend, reusing CTSD's escaping and validation patterns. There is no database in the preview.
- **New repo** `fcci-preview`, with its own Cloudflare Worker `fcci-preview` and a `*.workers.dev` address.

### Scalable split (this becomes the CTSD client starter)

| Layer | Location | Changes per client? |
|---|---|---|
| Content | `src/content/pages/<slug>.md`: one file per page, frontmatter plus the verbatim body as structured blocks | Yes |
| Settings | `site.config.ts`: name, logo, colors, fonts, nav tree, footer, service times, contact, socials, Subsplash IDs, form inbox | Yes |
| Layouts | `src/layouts/*` | No |
| Components | `src/components/*` | No |
| Theme | CSS custom properties generated from `site.config.ts` | No (values come from config) |

**Rule:** no client-specific string ever lives in a component or layout. A grep test enforces this (§8).

---

## 4. Page types (46 pages → 6 layouts)

| Layout | Pages |
|---|---|
| **Home** | `/` (plus the draft homes `home-v2` and `home-app`, rendered with the same layout from their own content) |
| **Standard** | mission-and-vision, what-we-believe, leadership, our-story, jesus, growth-track, connect-groups, scriptures, fasting, loveandserve, easter, wop, messaging, sanctuarytap, i-m-new, contact, testimonies |
| **Ministry** | kidz-amp-youth, men, women, students, preschool |
| **Media** | sermons, media/live, watch-live, watch, give, calendar |
| **Blog** | blog, the post, and the 4 tag pages (blog/tag/*) |
| **Form** | prayer-request, connect-card, volunteer-signup, event-signup, baptism-signup, bible-reading-group-signup, small-groups-20-groups, small-groups-less-than-20-groups, pastor-s-blog (if it is a form or list, it follows its source) |

The exact layout for each page is decided from its source file during the build. Any page with a form also gets the Form component, whatever its layout.

**URLs:**
- Each page keeps its exact source path (e.g. `/kidz-amp-youth`, `/media/live`, `/blog/2025/10/25/...`).
- The source's 404 parents (`/about`, `/connect`) stay as non-clickable menu groups, exactly as today.

---

## 5. Visual design

### Direction: hybrid (owner chose option C)
- **Dark sections** use FCCI near-black `#111111`. They are used for the home hero, Watch Live and sermons, section breaks, and the footer.
- **Light sections** are white or a warm off-white. They are used for reading pages, the blog and forms.
- FCCI orange is the accent throughout.

### Colors (FCCI's own)

| Token | Value | Use |
|---|---|---|
| `--accent` | `#ee7b1a` | Buttons, links, highlights |
| `--accent-hover` | `#d8660f` | Hover and active states |
| `--ink` | `#111111` | Dark sections; text on light |
| `--ink-2` | `#2c2c2c` | Surfaces on dark |
| `--gray` | `#444444` | Secondary text on light |
| `--paper` | `#ffffff` | Light sections |
| `--paper-2` | `#f6f4f1` | Alternating light sections |

All text pairs must pass WCAG AA. White on `#ee7b1a` fails for small text, so buttons use `#111111` text on orange, or orange on dark. The final pairs are verified in the build.

### Type
- **Bebas Neue** (FCCI's heading font, self-hosted woff2) for display headings.
- **Montserrat** (the closest free match to their Gotham) for body and UI.

### Borrowed patterns
- **From trbc.org:**
  - a sticky header with **Plan Your Visit** and **Give** always visible
  - a full-bleed photo hero with a directional scrim, the service times as the headline element, and two buttons
  - "start here" audience tiles
  - a latest-sermon block with one Watch button
  - date-badge event cards
  - restrained motion
- **From amanorsac.studio:**
  - large type
  - cinematic full-width photo sections
  - Apple-style stacked tiles for ministries
  - a slim dark header that gets a blur on scroll

### Home page composition
Built only from the home page's own content blocks, re-laid out.

**Constraint:** we may reorder and restyle the existing blocks, but we never invent sections with new wording. A pattern such as "start here" tiles is used only if it can be built from existing labels and links, for example the nav items "I'm New", "Kidz & Youth", "Connect Groups" and "Watch Live".

### Images
- The church's own 48 photos and the logo are used, optimised to WebP or AVIF with responsive sizes.
- Where a layout needs an image the source lacks (e.g. a background texture), an AI-generated, non-people abstract image may fill it. Never use fake people.

### Motion
- Subtle scroll reveals and a hero fade.
- Everything respects `prefers-reduced-motion`.

---

## 6. Content fidelity (the key guarantee)

- **Content files:** written by a script from `source/pages/*.md`, never typed by hand.
- **Fidelity test:** for every page, extract the visible text from the **built** HTML and from the **original** `source/raw` HTML, normalise whitespace only, then assert:
  1. Every source text segment (heading, paragraph, list item, button label) appears in the built page **verbatim**.
  2. The built page contains no visible text beyond the source segments, apart from an allowlist: the preview strip and the shared nav/footer labels taken from the source nav/footer.
- **Failure reporting:** the test prints the missing or extra segments per page. It runs in CI and blocks the build.
- **Links and contact details:** every link target from the source is preserved, and external links stay external. The malformed footer email link (`https://connect@fccintl.org`) is corrected to `mailto:connect@fccintl.org`. That fixes the link target, not the wording.

---

## 7. Integrations and preview safety

| Feature | Preview behaviour |
|---|---|
| Sermons, Watch Live, Give | Real Subsplash embeds (iframes), lazy-loaded, styled frames, accessible titles |
| Text-to-give, app store links, Partner Login, Faith Christian Academy link | Kept exactly as in the source |
| 15 forms | Redesigned with the exact same labels and options. They submit to `/api/form`, which emails `PREVIEW_INBOX` and **never** contacts the church. Turnstile is optional, off by default, plus a honeypot. Subsplash-hosted forms (I'm New, baptism) stay as their Subsplash embeds or links, as in the source |
| Calendar | The source list is rendered by script and could not be captured. The preview shows a styled section with the page's own heading and a link to the current calendar. No invented events |
| Google Tag Manager | **Not** included in the preview, so the church's analytics aren't polluted |
| SEO | `noindex, nofollow` on every page plus `robots.txt` disallow, so the preview never competes with fcci.life |
| Preview strip | A slim, dismissible top strip, for example "Preview of a redesigned fcci.life by CTSD". This is the one added visible line; the owner can turn it off in `site.config.ts` |

---

## 8. Testing

- **Fidelity test** (§6) on all 46 pages.
- **Route test:** all 46 source paths return 200.
- **Link test:** every internal link resolves, and every source external link is present.
- **Playwright on chromium and webkit:**
  - the nav and mobile menu
  - no horizontal scroll at 375 / 768 / 1280
  - axe finds 0 serious issues
  - forms validate and submit (mocked)
  - embeds lazy-load
- **Grep test:** no client strings in `src/components` or `src/layouts`. This is the scalability rule.
- **Lighthouse targets** per §1.

---

## 9. Out of scope (phase 2, after leadership approves)

- A staff editor (CMS) so the church can update pages themselves.
- Forms going to the church's inbox or Subsplash, and a live events feed.
- The domain switch from SnapPages, redirects, and Google Tag Manager.
- Content fixes the church requests (typos, outdated pages).
- Extracting the shared layouts and components into a standalone `ctsd-starter` template repo.

---

## 10. Owner inputs (non-blocking)

1. **GitHub repo** `fcci-preview`: the owner creates it, or approves Claude creating it with `gh`.
2. **Cloudflare Worker** `fcci-preview`: connect the repo in the dashboard, as before.
3. **Resend:** reuse the CTSD API key as the `RESEND_API_KEY` secret on the new Worker.
4. **The preview strip wording,** or whether to show it at all.
