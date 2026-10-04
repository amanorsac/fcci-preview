# trbc.org design study (patterns only, no content copied)

Platform: WordPress with Divi (child theme "trbc-divi"), WP Rocket for performance. System font stack via CSS variables (--trbc-face = -apple-system / SF Pro / Segoe UI), so type feels clean, native and fast. Palette: white and cool gray text (#1f2937, #374151, #6b7280) with a blue link/accent family (#2ea3f2, #1c6fb4) and a single hot orange-red (#ff4200) used sparingly for emphasis.

**Home page order:** utility bar and mega nav -> full-bleed hero (service times plus two buttons) -> "Events we don't want you to miss" strip -> "Tailor your experience" audience tiles (New Here / Kids / Students / Groups) -> latest sermon block with a Watch button and "view more" -> featured events cards (date badge, title, time, place) -> resources/announcements -> footer with address, phone, email, prayer link and socials.

**Navigation:** Wide mega menu in three columns (About, Get Involved, Resources, with nested ministries by life stage), plus two always-visible action buttons, "Ask" and "Plan Visit". Header is sticky. A simple "Get Involved / Discover / Ministries" link grid repeats on the page, so the paths to Visit, Watch, Events, Groups, Serve and Giving are always one click away. Giving is a top-level item.

**Hero:** Photo background with a left-to-right dark gradient overlay (light on the left, darker on the right) so text stays legible. Height is responsive, min-height clamp(640px, 100svh - 80px, 820px). Large service-time headline, one primary button (Plan Your Visit) and one secondary (Watch Online). There is also a Divi slider (6s auto-advance, 16:9) for featured items.

**Ministries and next steps:** Audience-based tiles (Kids, Students, Young Adults, Adults, Special Needs) rather than program names. A "Let's tailor your experience" prompt makes visitors self-select. The "New Here?" path is the leading tile.

**Sermons and events:** The latest sermon is surfaced on the home page with the title, series label and a single Watch button. Events are cards with a date badge, so the date scans first.

**Motion:** Restrained. The slider auto-rotates, IntersectionObserver reveals content on scroll, and `prefers-reduced-motion` is honored in 12 places.

**Mobile:** Breakpoints at 980, 767 and 480px. Columns collapse to one (24/24 flex columns on tablet and phone). The mega menu becomes a hamburger. The hero uses small-viewport units (svh).

## Patterns worth borrowing
1. Persistent "Plan Visit" button in the header, backed by a prominent "New Here?" tile.
2. Hero with service times front and center plus exactly two CTAs (Visit, Watch).
3. Directional gradient scrim over a photo, so overlaid text reads without a flat dark box.
4. Audience self-selection tiles (New Here / Kids / Students / Groups).
5. Latest sermon module with a single Watch action, plus a link to the full library.
6. Date-badge event cards with time and place.
7. Mega menu that groups ministries by life stage; giving as a top-level nav item.
8. System font stack plus one accent color: fast, trustworthy, minimal.
