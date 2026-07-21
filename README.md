# AIESEC in Zagazig — *From Zagazig to the world.*

A premium, animated one-page experience for **AIESEC in Zagazig** (Zagazig University, Egypt) —
the local chapter of the world's largest youth-led organization.

Dark editorial design built on AIESEC's official brand colors, kinetic typography,
a hand-coded dot-globe canvas, smooth scrolling and scroll-driven storytelling.

## Stack

- **Zero build step** — pure HTML / CSS / JS, deploys anywhere static files run (Vercel, Netlify, GitHub Pages).
- [GSAP 3](https://gsap.com) + ScrollTrigger — intro timeline, scroll reveals, pinned horizontal program gallery, counters.
- [Lenis](https://lenis.darkroom.engineering) — smooth scrolling.
- [Clash Display + General Sans](https://fontshare.com) via Fontshare CDN.
- Custom canvas dot-globe (fibonacci sphere, depth-shaded, "exchange ping" pulses) — no library.

## Structure

```
index.html                  home — all sections
global-volunteer.html       Global Volunteer landing (internal, not a redirect)
css/styles.css              shared design system + responsive + reduced-motion fallbacks
css/global-volunteer.css    page-specific components (projects, timeline, FAQ, SDG, gallery)
js/main.js                  home: preloader, hero intro, reveals, pin, globe, cursor, menu
js/gv.js                    GV page: reveals, counters, floating shapes, timeline, FAQ, lightbox
assets/                     favicon.svg, og.png
```

## Global Volunteer page

Clicking **Global Volunteer** on the home page no longer jumps straight to aiesec.org — it opens
[`global-volunteer.html`](global-volunteer.html), a full internal landing page in the same design
language. Only the final **"Apply on the Official AIESEC Platform"** button (and each project's
*View opportunity* link) leaves for aiesec.org.

Content is **real**, pulled from the LC's public opportunities sheet: AIESEC in Zagazig is the
**#1 LC in Egypt for incoming Global Volunteer (term 25.26)** and hosts seven themed projects —
Global Classroom, Heartbeat, Scale Up!, Skill Up!, On The Map, Fingerprint, Aquatica — each with
its real requirements, fee (TN $75–90), benefits and live `aiesec.org/opportunity/...` link.
Sections: hero → stat strip → what is GV → why Zagazig → 7 projects → how-it-works timeline →
benefits → eligibility → 5 SDGs → gallery (+lightbox) → FAQ (accordion) → testimonials → final CTA.

## Run locally

```bash
npx http-server -p 4173 -c-1 .
# → http://localhost:4173
```

## Notable behavior

- `?static=1` query param (or OS-level *reduced motion*) disables all animation —
  preloader skipped, everything visible immediately, programs stack vertically.
- Preloader has an 8s failsafe so throttled/background tabs never get stuck behind it.
- Works without JavaScript (content is never hidden by CSS) and degrades gracefully if CDNs fail.
- Custom cursor & magnetic buttons only activate on fine pointers, never on touch.

## Section map

Hero (dot-globe) → marquee → About (word-by-word manifesto) → Values (color-flood rows)
→ Programs (pinned horizontal gallery: Global Volunteer / Global Talent / Global Teacher / Membership)
→ Impact (count-up stats) → Stories (snap rail) → Join (3 steps) → CTA → footer.

## ⚠️ Content to verify before wide release

| Item | Where | Status |
|---|---|---|
| Home impact numbers (200+ exchanges, 500+ members, 30+ countries, 8 cities) | `index.html#impact` | **Placeholders** — replace with the LC's real figures |
| Home testimonials (Nour / Omar / Salma / Youssef) | `index.html#stories` | **Sample copy** — replace with real member quotes |
| GV testimonials (labelled *illustrative*, with country flags) | `global-volunteer.html#testimonials` | **Sample copy** — swap for real EP feedback (a Feedback Form exists in the LC sheet) |
| GV gallery tiles | `global-volunteer.html#gallery` | Styled placeholders — drop in real project photos when available |
| Instagram now `/icxzagazig` | footer + menu (both pages) | From the LC (incoming-exchange handle) — confirm it's the primary account |
| Other socials (Facebook `/AIESECZ`, X `/AIESECZagazig`, YouTube) | footer + menu | From the LC's old official site — confirm still active |
| GV project data (names, fees, requirements, opportunity links) | `global-volunteer.html#projects` | **Real, from the LC sheet** — links are live but expire; refresh when a term closes |
| Final apply CTA (`aiesec.org/global-volunteer`) | `global-volunteer.html#apply` | Official GV landing — verify it still resolves |

Official AIESEC brand assets (logo, fonts): [brand.aiesec.org](https://brand.aiesec.org) —
the site currently uses an original orbit mark + text wordmark instead of the trademarked logo.
