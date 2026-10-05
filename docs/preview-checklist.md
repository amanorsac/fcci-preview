# FCCI Preview: Go-Live Checklist

A working preview of a redesigned fcci.life, built by CTSD. The real fcci.life is not touched.

## What's in it
- **All 46 pages** of fcci.life, with the church's exact wording. An automatic check compares every page against the original.
- **Subsplash pieces:** sermons, the live stream and giving use the real Subsplash players.
- **Forms:** all 16 work, but they send to **your** email (amanorsac@gmail.com), never the church's.
- **Search engines:** the preview is hidden from Google (noindex plus robots.txt), and there's no Google Tag Manager.
- **Version 2 look:** white pages, the church's own fonts (Abril Fatface and Lato), and its orange-to-pink gradient. There are three new pages: **Dream Team**, **Ministries** and **Next Steps**. The **FAITH KIDZ** page has been rebuilt as a spotlight.
- **Two image sets:** the strip at the top switches between **Church photos** (from fcci.life) and **AI images** (made for this preview). The choice lasts for the visit.
- **Preview strip:** a dismissible dark strip at the top says it's a preview. To turn it off, set `preview.enabled` to `false` in `site.config.ts`.

## Things to mention to the church
These are on the current fcci.life and were kept word for word:
- **Placeholder text:** the hidden pages Men, Women, Students, Preschool and Our Story still contain template **"Lorem ipsum"** text.
- **Broken links:** the draft home page (`home-v2`) links to `/kidz-youth`, `/im-new`, `/mission-vision` and `/media`, which are broken on the live site too.
- **Calendar:** the events load by script on the old site, so the preview's Calendar page links to the live calendar.

## Before showing the pastor
- **New wording to approve:** v2 adds a small amount of new wording (Dream Team, Ministries, Next Steps, and parts of the home and FAITH KIDZ pages). All of it is listed in `docs/draft-copy.md` for the pastor to approve or change. Everything else is still the church's exact wording.
- **3 AI images still to make:** Higgsfield credits ran out before *kids-church*, *team-ushers* and *team-prayer*. For now those spots reuse other images. The prompts are in `docs/ai-images.md`. Generate them when credits refill and save them to `src/assets/ai/`.
- **Dream Team cards:** teams without a photo show the gradient instead. Real photos of each team would be the best upgrade.

## Quality results (local, 2026-10-04)

| Page | Desktop (Perf/A11y/BP/SEO) | Mobile |
|---|---|---|
| `/` | 100 / 100 / 96 / 66 | 99 / 100 / 100 / 66 |
| `/dream-team` | 98 / 100 / 100 / 66 | 98 / 100 / 100 / 66 |
| `/kidz-amp-youth` | 100 / 100 / 100 / 66 | 99 / 100 / 100 / 66 |
| `/give` | 100 / 98 / 77 / 66 | 96–100 / 98 / 77 / 66 |

- **SEO 66** is intentional: the preview tells search engines not to index it.
- **Give's Best Practices (77)** comes from the Subsplash giving iframe (third-party cookies), not our code.
- **Give** waits until the page has loaded before it starts the Subsplash giving form, which keeps the page fast on phones.
- **Tests:** 121 unit and wording tests, plus 152 browser tests (Chrome engine and Safari engine). Firefox couldn't run on this computer, so check it by hand.

## Put it online (about 10 minutes)
1. **Create a private GitHub repo** named `fcci-preview` and push this folder (Claude can do this when you say so).
2. **In Cloudflare,** go to Workers & Pages → Create → Import a repository → pick `fcci-preview`.
   - Build command: `npm run build`
   - Deploy command: `npx wrangler deploy`
3. **Add the email key:** in the new Worker, open **Settings → Variables and Secrets**. Add a **Secret** named `RESEND_API_KEY` with the same Resend key as the CTSD site.
4. **Test it:** open the `fcci-preview.<your-account>.workers.dev` link on your phone. Submit the Prayer Request form, and check that the email reaches amanorsac@gmail.com.
5. **Share it:** send the link to the pastor and leadership.

## If the church says yes (phase 2)
- **A staff editor,** so the church can update pages themselves.
- **Forms go to the church:** route them to the church's inbox or Subsplash, and pull in a live events feed.
- **Move fcci.life over** from SnapPages, with redirects and their analytics.
- **Fix the issues above** (Lorem ipsum, broken links) with the church.
