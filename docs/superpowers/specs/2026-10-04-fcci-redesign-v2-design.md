# FCCI Redesign v2: Design Spec

**Date:** 2026-10-04
**Builds on:** `2026-10-04-fcci-redesign-design.md` (v1, merged as PR #1)
**Status:** Design approved in conversation; written spec awaiting review

## 1. Why v2

After seeing v1, the owner asked for four changes:
1. **A white, welcoming look** instead of mostly black.
2. **The church's real fonts and themes.**
3. **Two image versions:** the church's real photos, and high-quality AI images.
4. **Innovation, not a copy:**
   - new content the current site lacks, especially a **Dream Team** page (ministries and serving teams) and a strong **Children's Ministry** spotlight
   - structure borrowed from **trbc.org**, **citychurchcville.com** and **remnantrva.com**

v1's rule of "no new wording" is replaced by the rule in §5.

## 2. Look

- **Backgrounds:** white (`#ffffff`) and warm off-white (`#f7f5f2`) dominate. Near-black `#111111` only for the footer and one optional live-stream band.
- **Fonts** (verified on the live site's loaded faces, 2026-10-04):
  - **Abril Fatface:** big statements (REACH / TEACH / TRANSFORM, page titles, section headlines). Italic as on the current site.
  - **Lato** (300/400/700/900): body, navigation, UI.
  - Both self-hosted woff2. Bebas Neue and Montserrat are removed.
- **Colors** (from fcci.life):

  | Token | Value | Use |
  |---|---|---|
  | `--accent` | `#ee7b1a` | Buttons, highlights |
  | `--accent-hover` | `#d8660f` | Hover and active |
  | `--grad` | `linear-gradient(135deg, #ee7b1a, #ff5fc4)` | Spotlights: REACH/TEACH/TRANSFORM, FAITH KIDZ |
  | `--blue` | `#2b7bb9` | Secondary headings and links |
  | `--ink` | `#111111` | Text, footer |
  | `--paper` | `#ffffff` | Main background |
  | `--paper-2` | `#f7f5f2` | Alternating sections |

  The pink end is sampled from the live site's REACH gradient when it is built. Every text and background pair must pass WCAG AA.
- **Feel:** airy spacing, rounded image cards, soft shadows, and bold Abril statements. Motion stays subtle and respects reduced-motion.

## 3. Two image versions, one link

- **Switch:** a toggle in the preview strip, **Church photos | AI images**, remembered per session with a safe fallback.
- **How it works:** every image slot names two sources, `church` and `ai`. Both are optimised by `astro:assets`, and the toggle swaps them with a class on `<html>`, with no reload.
- **Fallback:** when a slot has no church photo, the church version shows the AI image, or a clean gradient panel.
- **AI images:** about 20, made with Nano Banana Pro in the owner's Higgsfield account (2 credits each, about 40 credits; approved). Scenes:
  - a modern worship hall
  - welcoming greeters
  - families, kids' ministry (bright and joyful)
  - youth, small groups
  - the serving teams (worship, media, guest services, café, ushers, prayer)
  - Charlottesville exteriors

  Rules:
  - realistic and diverse
  - **no text inside images, no logos**
  - consistent warm, natural light
- **Labelling:** AI images are labelled in the alt text, and the toggle itself says they are AI.

## 4. Information architecture

**New menu** (every v1 page stays reachable at the same path):
- **About:** Mission and Vision, What We Believe, Leadership, Our Story
- **Next Steps:** I'm New, Jesus, Growth Track, Baptism, Connect Card
- **Ministries:** **FAITH KIDZ**, Youth, Men, Women, Connect Groups
- **Dream Team** *(new top-level item)*
- **Watch:** Watch Live, Sermons, Pastor's Blog, Blog
- **Calendar**
- Buttons: **Plan Your Visit**, **Give**

**New pages**
- `/dream-team`
- `/ministries` (overview)
- `/next-steps`

**Redesigned key pages**

| Page | Sections |
|---|---|
| **Home** | Hero ("WELCOME HOME", service times, Plan Your Visit + Watch Live, church welcome line) → REACH · TEACH · TRANSFORM band (Abril on the gradient) → "Let's tailor your experience" tiles (I'm New, FAITH KIDZ, Youth, Connect Groups) → FAITH KIDZ spotlight → latest sermon → events → Dream Team call to action → Next Steps band (Plan a Visit · Join a Connect Group · Join the Dream Team) → visit info |
| **Dream Team** | Hero ("Serving is …" draft) → why we serve → 14 team cards (image + one-line purpose) → how to join (3 steps) → the existing volunteer form |
| **FAITH KIDZ** (`/kidz-amp-youth`) | Gradient hero → the church's existing kids text → 4 age-group cards (Nursery, Toddlers, Preschool, Kids Church, with the church's ages and times) → "Your first Sunday" (draft) → safety & check-in (draft) → Youth (Infusion / G-One) and College/Young Adult blocks → plan-your-visit call to action |
| **Ministries** | Cards for FAITH KIDZ, Youth, College/Young Adults, Men, Women, Connect Groups, Dream Team |
| **Next Steps** | Plan a Visit → Meet Jesus → Growth Track → Baptism → Connect Group → Dream Team, as a numbered path |

The **14 Dream Team teams** (from the church's volunteer form): Altar Care/Prayer, Audio/Video, Banquet Services, Bookstore, Café, Drama, Event Planning, Faith Kidz, Guest Services, Music, Photography, Temple Cleaning, Usher, Worship Arts.

**Other pages** keep their content in the new white design (v1 layouts re-skinned).

## 5. Wording rules

1. **Existing church wording is never altered or removed.** The v1 fidelity test still runs on all 46 pages: coverage with occurrence counts, against the original capture. Where a page is redesigned, the church's text still appears in full.
2. **New wording** lives only in `src/content/draft/*.json`, one file per page or section, each entry marked `draft: true`.
   - It is written in the church's voice and reuses its phrases (REACH / TEACH / TRANSFORM, "WELCOME HOME", "WITH JESUS you are destined to win!", "Join us for one of our services!").
   - No generic filler ("vibrant community", "journey of faith"): a lint test rejects a list of clichés.
3. **The fidelity "extra" check** allows the church's capture plus the draft files, so every visible word is either the church's or reviewable draft copy.
4. **Review list:** `docs/draft-copy.md`, generated from the draft files, lists every new sentence for the pastor to approve or edit.

## 6. Technology

- **Same stack:** Astro, Cloudflare Worker, `/api/form`. Same repo `amanorsac/fcci-preview`, new branch `build/fcci-v2`.
- **`site.config.ts`** gains the fonts, colors, `--grad`, the new nav, and image slots.
- **Kept from v1:** forms (preview inbox only), noindex, the no-GTM setup and the scalable split.

## 7. Testing

- **v1 suites keep passing,** updated for the new design: fidelity coverage, routes and links, forms, accessibility at 375 / 768 / 1280, Lighthouse targets.
- **New:**
  - the image toggle switches every slot and persists for the session
  - both image sets load with no broken images
  - new pages return 200
  - every draft string is listed in `docs/draft-copy.md`
  - the cliché lint passes
  - Dream Team shows all 14 teams
  - FAITH KIDZ shows its age groups with the church's ages and times verbatim

## 8. Out of scope

- A staff editor (CMS)
- Real event feeds
- Moving the domain
- Final copy approval (the pastor's job, using `docs/draft-copy.md`)
