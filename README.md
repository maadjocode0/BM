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
index.html          single page — all sections
css/styles.css      design system + responsive + reduced-motion fallbacks
js/main.js          preloader, hero intro, reveals, pin, globe, cursor, menu
assets/             favicon.svg, og.png
```

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
| Impact numbers (200+ exchanges, 500+ members, 30+ countries, 8 cities) | `#impact` | **Placeholders** — replace with the LC's real figures |
| Testimonials (Nour / Omar / Salma / Youssef) | `#stories` | **Sample copy** — replace with real member quotes |
| Social links (Facebook `/AIESECZ`, Instagram `/aiesec_zagazig`, X `/AIESECZagazig`, YouTube) | footer + menu | Taken from the LC's old official site — confirm they're still active |
| Application CTA (`aiesec.org`) | `#join`, CTA | Point to the LC's current recruitment form when one exists |
| Program URLs (`aiesec.org/global-volunteer` etc.) | program cards | Official global pages — verify they still resolve |

Official AIESEC brand assets (logo, fonts): [brand.aiesec.org](https://brand.aiesec.org) —
the site currently uses an original orbit mark + text wordmark instead of the trademarked logo.
