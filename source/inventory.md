# FCCI (Faith Christian Center International) — site inventory
Source: https://www.fcci.life/ (crawled 2026-10-04). Pages captured: **46** (see pages/; includes 4 blog tag pages and one post). Raw HTML in raw/. Full list of crawled URLs with titles is in the "All pages crawled" section at the end.

## Platform
**SnapPages** (snappages.com; footer "powered by SnapPages"; scripts from assets2.snappages.site, images/fonts from storage1.snappages.site/BPM5XF/). Media, giving, forms, events and live video are **Subsplash** (account BPM5XF / faithchristiancenterinte) embedded in the SnapPages site. No meta generator tag. jQuery 3.7.1 (Google CDN), Font Awesome, Pixeden icons, Typicons, Adobe Typekit (kit hqk1yln, Proxima Nova), Google Tag Manager GTM-PX5RG64.

## Site map
Main nav (dropdown grouping inferred from nav order and `sp-second-nav`):
- Home (/)
- About (/about = 404, parent label only)
  - Mission and Vision (/mission-and-vision)
  - What We Believe (/what-we-believe)
  - Leadership (/leadership)
  - Kidz & Youth (/kidz-amp-youth)
- Connect (/connect = 404, parent label only)
  - Calendar (/calendar)
  - Connect Groups (/connect-groups)
  - Growth Track (/growth-track)
  - Jesus (/jesus)
  - Pastor's Blog (/pastor-s-blog)
  - I'm New (/i-m-new)
- Watch Live (/media/live)
- Sermons (/sermons)
- Give (/give)
- Blog (/blog) — post /blog/2025/10/25/unlocking-the-power-of-biblical-meditation-a-path-to-spiritual-growth; tags fcci, fccination, reachteachtransform, faith

Unlinked pages found only in sitemap (hidden/utility/legacy): home-v2 (newer draft home: "Meet Jesus. Find Community. Live with Purpose.", Plan Your Visit, Google Map; lastmod 2026-07-09), home-app, scriptures, testimonies, connect-card, wop, messaging, watch, watch-live, students, our-story, contact, preschool, men, women, easter, fasting, loveandserve, sanctuarytap, volunteer-signup, small-groups-less-than-20-groups, small-groups-20-groups, prayer-request, event-signup, bible-reading-group-signup, baptism-signup.

404s: /about, /connect, /im-new, /mission-vision, /kidz-youth, /media.

## Brand
- Logo: https://storage1.snappages.site/BPM5XF/assets/images/11503942_596x300_500.png (assets/11503942_596x300_500.png). Favicon: https://storage1.snappages.site/BPM5XF/assets/favicon.png
- Colors in inline CSS: orange #ee7b1a (main accent), darker orange #d8660f (hover), near-black #111111 / #000000 / #2c2c2c, gray #444444, white #ffffff, default blue #3498db / #2980b9 (form defaults). Overlay rgba(0,0,0,.82).
- Fonts: Bebas Neue Bold 700 (headings, self-hosted .ttf), Gotham Light 300 (body, self-hosted .ttf), Typekit Proxima Nova family (proxima-nova, -condensed, -extra-condensed).
  - https://storage1.snappages.site/BPM5XF/assets/files/Bebas-Neue-Bold-700.ttf
  - https://storage1.snappages.site/BPM5XF/assets/files/Gotham-Light.ttf
- Home pattern: big word + subheading: REACH / TEACH / Transform.

## Contact (as shown)
- Charlottesville Campus, 2186 Richmond Road, Charlottesville, Virginia 22911
- Service Times: "Sunday- 10:00am", "Wednesday-7:00pm"
- Phone: (434) 979-1700
- Email: connect@fccintl.org (footer link href is the malformed `https://connect@fccintl.org`)
- Text-to-give: "text FCCINTL to 1-888-364-4483"
- Socials: Facebook https://www.facebook.com/fccintl ; Instagram https://www.instagram.com/fccintl ; Twitter/X https://www.twitter.com/fccintl1
- Meta description: "Church in Charlottesville, Virginia"
- Footer "Let's Connect": Water Baptism Sign Up (Subsplash form), Partner Login (https://dashboard.subsplash.com), Faith Christian Academy (https://fcacdc.org/), Download App (iOS) https://apps.apple.com/us/app/id823372347, Download App (Android) https://play.google.com/store/apps/details?id=io.pushpay.fccintl
- Home banner: "Click Here for more information about STRETCH LEADERSHIP SUMMIT." -> https://faithchristiancenterinte.subspla.sh/85jt7cx

## Third-party integrations
- Subsplash: giving embed (https://subsplash.com/u/-BPM5XF/give?embed=true), media/sermon embeds (/media/embed/d/*?, ...cmtf8ws, *next-live, *recent), live stream, calendar/events, forms (I'm New, baptism), church app, Partner Login dashboard
- Pushpay (app package id io.pushpay.fccintl; text-to-give)
- Google Tag Manager GTM-PX5RG64
- Adobe Typekit; Google jQuery CDN; Font Awesome
- Google Maps embed (home-v2 only)
- Apple App Store / Google Play links
- Faith Christian Academy external site (fcacdc.org)
- No YouTube/Vimeo/Mailchimp/Planning Center found.

## Forms (SnapPages sp-form, no action attribute, submitted by SnapPages JS) and what they collect
- /contact, /men, /women, /students, /preschool: First Name, Last Name, Email, Message
- /connect-card: name, email, phone, full address, visit frequency, interests checkboxes (Baptism, Volunteering, Membership, Community Groups, Jesus)
- /i-m-new (Subsplash form): First/Last name, Email, Phone Number
- /jesus: First, Last, Email, Decision
- /prayer-request: prayer text, follow-up yes/no, optional name/email/phone
- /testimonies: testimony text, follow-up yes/no, name, email, phone
- /baptism-signup: name, email, phone, "Tell us your story.", extras
- /event-signup: name, email, phone, guests (Just me / +1 / +2 / More than 2), extras
- /volunteer-signup: frequency, member status, serving teams (Altar Care/Prayer Team, Audio/Video Team, Banquet Services Team, Bookstore Team, Cafe' Team, Drama Team, Event Planning Team, Faith Kidz Ministry Team, Guest Services Team, Music Team ...), contact info
- /small-groups-20-groups and /bible-reading-group-signup: ZIP, days available, childcare interest, name, email, phone, extras
- /small-groups-less-than-20-groups: which group, name, email, phone, extras
Exact labels are in each pages/*.md EMBEDS / FORMS section.

## Dynamic content
- Sermons (/sermons, /media/live "Recent Media", home "Latest Teaching"): Subsplash media embed (iframe). Titles/dates/speaker (e.g. "All for His Glory! - Part 7, Sep 27, 2026, Pastor Wayne Frye") appear in server HTML on /sermons and /media/live; the library with Series/Topics filters is iframe-only.
- Live stream: Subsplash `next-live` embed ("Live on Sun, Oct 11, 09:57am EDT").
- Events (/calendar "Upcoming Events"): JS-rendered; no event items in static HTML.
- Giving: Subsplash iframe.
- Blog: SnapPages native blog (/blog, tags, dated post URLs).

## Assets (assets/, highest-res variant of each, original filenames, all under 10MB; 48 files, about 13MB)
Logo: 11503942_596x300_500.png. Favicon: favicon.png.
Heroes/banners: 25930568_1920x1200 (home hero), 26093477_1920x1080 (leadership), 12128081_2048x994 (what we believe), 12132664_1920x1000 (give), 12132908_1920x1200 (growth track), 12703631_1920x1200 (home-app), 16763867_1920x1200 (connect groups), 17388498_1920x1200 (loveandserve), 21725155_1920x1080 (blog), 12298723_1631x794 (kidz & youth), 12299046_1616x798 (pastor's blog), 12343384_2858x986 (jesus), 14452536 (easter), 13792251 (wop).
Home-v2 photos: 17388643, 19289338, 23030723, 23035152, 23035221, 24975047.
Others: 12132918/23/28/43 (growth track), 12298940/14477825/14479220 (I'm New), 12299076/86, 14455xxx (easter), 15085281 (scriptures), 16764074/16764229/19289247 (connect groups), 17388638/78/99 (loveandserve), 25271666/939/959 and 25444592/602 (fasting).
Alt text is empty on all images. No identifiable staff portraits (leadership page uses only the banner 26093477 plus text). Images are CSS/data-attribute backgrounds, so each page md lists them under "ALL STORAGE ASSETS REFERENCED IN HTML". Use `ls assets/` for the full set.

## Not fully captured
- Subsplash iframe content (sermon library, live player, giving form, event calendar) is cross-origin JS and not in the HTML.
- Dropdown parent grouping is inferred; /about and /connect return 404.
- Source images have no alt text.

## All pages crawled (URL, title, saved file)
See raw/rows.txt (generated list) and the pages/ folder; each pages/*.md begins with its title and URL.
- https://www.fcci.life/scriptures — "Faith Christian Center International - Scriptures" -> pages/scriptures.md
- https://www.fcci.life/home-v2 — "Faith Christian Center International - Home V2" -> pages/home-v2.md
- https://www.fcci.life/testimonies — "Faith Christian Center International - Testimonies" -> pages/testimonies.md
- https://www.fcci.life/connect-card — "Faith Christian Center International - Connect Card" -> pages/connect-card.md
- https://www.fcci.life/wop — "Faith Christian Center International - wop" -> pages/wop.md
- https://www.fcci.life/home-app — "Faith Christian Center International - Home app" -> pages/home-app.md
- https://www.fcci.life/messaging — "Faith Christian Center International - Messaging" -> pages/messaging.md
- https://www.fcci.life/watch — "Faith Christian Center International - Watch" -> pages/watch.md
- https://www.fcci.life/students — "Faith Christian Center International - Students" -> pages/students.md
- https://www.fcci.life/mission-and-vision — "Faith Christian Center International - Mission and Vision" -> pages/mission-and-vision.md
- https://www.fcci.life/what-we-believe — "Faith Christian Center International - What We Believe" -> pages/what-we-believe.md
- https://www.fcci.life/leadership — "Faith Christian Center International - Leadership" -> pages/leadership.md
- https://www.fcci.life/kidz-amp-youth — "Faith Christian Center International - Kidz & Youth" -> pages/kidz-amp-youth.md
- https://www.fcci.life/our-story — "Faith Christian Center International - Our Story" -> pages/our-story.md
- https://www.fcci.life/contact — "Faith Christian Center International - Contact" -> pages/contact.md
- https://www.fcci.life/calendar — "Faith Christian Center International - Calendar" -> pages/calendar.md
- https://www.fcci.life/preschool — "Faith Christian Center International - Preschool" -> pages/preschool.md
- https://www.fcci.life/connect-groups — "Faith Christian Center International - Connect Groups" -> pages/connect-groups.md
- https://www.fcci.life/growth-track — "Faith Christian Center International - Growth Track" -> pages/growth-track.md
- https://www.fcci.life/men — "Faith Christian Center International - Men" -> pages/men.md
- https://www.fcci.life/jesus — "Faith Christian Center International - Jesus" -> pages/jesus.md
- https://www.fcci.life/women — "Faith Christian Center International - Women" -> pages/women.md
- https://www.fcci.life/pastor-s-blog — "Faith Christian Center International - Pastor's Blog" -> pages/pastor-s-blog.md
- https://www.fcci.life/i-m-new — "Faith Christian Center International - I'm New" -> pages/i-m-new.md
- https://www.fcci.life/sermons — "Faith Christian Center International - Sermons" -> pages/sermons.md
- https://www.fcci.life/give — "Faith Christian Center International - Give" -> pages/give.md
- https://www.fcci.life/loveandserve — "Faith Christian Center International - LoveandServe" -> pages/loveandserve.md
- https://www.fcci.life/fasting — "Faith Christian Center International - fasting" -> pages/fasting.md
- https://www.fcci.life/blog — "Faith Christian Center International - Blog" -> pages/blog.md
- https://www.fcci.life/easter — "Faith Christian Center International - Easter" -> pages/easter.md
- https://www.fcci.life/sanctuarytap — "Faith Christian Center International - SanctuaryTap" -> pages/sanctuarytap.md
- https://www.fcci.life/volunteer-signup — "Faith Christian Center International - Volunteer Signup" -> pages/volunteer-signup.md
- https://www.fcci.life/small-groups-less-than-20-groups — "Faith Christian Center International - Small Groups (Less than 20 groups)" -> pages/small-groups-less-than-20-groups.md
- https://www.fcci.life/small-groups-20-groups — "Faith Christian Center International - Small Groups (20+ groups)" -> pages/small-groups-20-groups.md
- https://www.fcci.life/prayer-request — "Faith Christian Center International - Prayer Request" -> pages/prayer-request.md
- https://www.fcci.life/event-signup — "Faith Christian Center International - Event Signup" -> pages/event-signup.md
- https://www.fcci.life/bible-reading-group-signup — "Faith Christian Center International - Bible Reading Group Signup" -> pages/bible-reading-group-signup.md
- https://www.fcci.life/baptism-signup — "Faith Christian Center International - Baptism Signup" -> pages/baptism-signup.md
- https://www.fcci.life/blog/2025/10/25/unlocking-the-power-of-biblical-meditation-a-path-to-spiritual-growth — "Unlocking the Power of Biblical Meditation: A Path to Spiritual Growth | Faith Christian Center International" -> pages/blog_2025_10_25_unlocking-the-power-of-biblical-meditation-a-path-to-spiritual-growth.md
- https://www.fcci.life/ — "Faith Christian Center International - Home" -> pages/home.md
- https://www.fcci.life/media/live — "Live | Faith Christian Center International" -> pages/media_live.md
- https://www.fcci.life/watch-live — "Faith Christian Center International - Watch Live" -> pages/watch-live.md
- https://www.fcci.life/blog/tag/fcci — "Faith Christian Center International - Blog" -> pages/blog_tag_fcci.md
- https://www.fcci.life/blog/tag/fccination — "Faith Christian Center International - Blog" -> pages/blog_tag_fccination.md
- https://www.fcci.life/blog/tag/reachteachtransform — "Faith Christian Center International - Blog" -> pages/blog_tag_reachteachtransform.md
- https://www.fcci.life/blog/tag/faith — "Faith Christian Center International - Blog" -> pages/blog_tag_faith.md