/* ═══════════════════════════════════════════════════════════════
   Static generator for the Opportunities module.
   Reads data/opportunities.json and emits:
     opportunities.html                (pre-rendered listing + filters)
     opportunities/<slug>.html         (SEO-complete detail pages)
   Run: node tools/build-opportunities.mjs
   No runtime build — output is committed static HTML.
   ═══════════════════════════════════════════════════════════════ */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASE_URL = 'https://aiesec-zagazig.vercel.app'; // canonical base for OG/JSON-LD — change on deploy
const DATE = '2026-07-21';

const data = JSON.parse(readFileSync(join(ROOT, 'data', 'opportunities.json'), 'utf8'));
const { shared, opportunities } = data;

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const attr = s => esc(s).replace(/'/g, '&#39;');

/* ── Shared partials ───────────────────────────────────────── */
/* Official AIESEC logo lockup (assets/aiesec-logo.png) */
const logo = (prefix) => `<img class="nav__logo-img" src="${prefix}assets/aiesec-logo.png" alt="AIESEC" width="1265" height="259" decoding="async">`;

const preloader = (tag, prefix) => `<div id="preloader" aria-hidden="true">
    <div class="preloader__inner">
      <img class="preloader__logo" src="${prefix}assets/aiesec-logo.png" alt="AIESEC" width="1265" height="259">
      <p class="preloader__brand">in <span>Zagazig</span></p>
      <p class="preloader__num">0</p>
      <p class="preloader__tag">${tag}</p>
    </div>
    <span class="preloader__bar"><i></i></span>
  </div>`;

const chrome = `<div class="grain" aria-hidden="true"></div>
  <div class="cursor" aria-hidden="true"><div class="cursor__dot"></div><div class="cursor__ring"><span></span></div></div>`;

const nav = (prefix) => `<header class="nav">
    <div class="nav__inner container">
      <a href="${prefix}index.html" class="nav__logo" aria-label="AIESEC in Zagazig — home">${logo(prefix)}<span class="nav__entity">in Zagazig</span></a>
      <nav class="nav__links" aria-label="Primary">
        <a href="${prefix}index.html#about">About</a>
        <a href="${prefix}index.html#values">Values</a>
        <a href="${prefix}index.html#programs">Programs</a>
        <a href="${prefix}index.html#impact">Impact</a>
        <a href="${prefix}index.html#stories">Stories</a>
      </nav>
      <div class="nav__actions">
        <a href="${prefix}index.html#join" class="btn btn--solid nav__cta" data-magnetic><span>Join us</span></a>
        <button class="nav__burger" aria-label="Open menu" aria-expanded="false" aria-controls="menu"><span></span><span></span></button>
      </div>
    </div>
  </header>`;

const menu = (prefix) => `<div class="menu" id="menu" aria-hidden="true">
    <nav class="menu__links" aria-label="Menu">
      <a class="menu__item" href="${prefix}index.html#about"><small>01</small><span class="menu__link">About</span></a>
      <a class="menu__item" href="${prefix}index.html#values"><small>02</small><span class="menu__link">Values</span></a>
      <a class="menu__item" href="${prefix}index.html#programs"><small>03</small><span class="menu__link">Programs</span></a>
      <a class="menu__item" href="${prefix}index.html#impact"><small>04</small><span class="menu__link">Impact</span></a>
      <a class="menu__item" href="${prefix}index.html#stories"><small>05</small><span class="menu__link">Stories</span></a>
      <a class="menu__item" href="${prefix}index.html#join"><small>06</small><span class="menu__link">Join us</span></a>
    </nav>
    <div class="menu__foot">
      <p>Zagazig University · Sharqia, Egypt</p>
      <div class="menu__socials">
        <a href="https://www.facebook.com/AIESECZ" target="_blank" rel="noopener">Facebook</a>
        <a href="https://www.instagram.com/icxzagazig" target="_blank" rel="noopener">Instagram</a>
        <a href="https://x.com/AIESECZagazig" target="_blank" rel="noopener">X</a>
      </div>
    </div>
  </div>`;

const footer = (prefix) => `<footer class="footer">
    <p class="footer__watermark" aria-hidden="true">OPPORTUNITIES</p>
    <div class="container footer__grid">
      <div class="footer__brand">
        <a href="${prefix}index.html" class="nav__logo" aria-label="Back to home">${logo(prefix)}<span class="nav__entity">in Zagazig</span></a>
        <p class="footer__blurb">The Zagazig University chapter of the world's largest youth-led organization — and Egypt's #1 local committee for incoming Global Volunteer. Come make an impact where you're treated like family.</p>
        <div class="footer__socials">
          <a href="https://www.facebook.com/AIESECZ" target="_blank" rel="noopener" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V4.9c-.2 0-1-.1-1.9-.1-1.9 0-3.3 1.2-3.3 3.4V11H8.8v3h2.4v7h2.3z"/></svg></a>
          <a href="https://www.instagram.com/icxzagazig" target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none"/></svg></a>
          <a href="https://x.com/AIESECZagazig" target="_blank" rel="noopener" aria-label="X (Twitter)"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.2 3h3l-6.6 7.5L21.5 21h-6.1l-4.8-6.2L5.1 21h-3l7-8L2.8 3H9l4.3 5.7L17.2 3zm-1 16.2h1.7L7.9 4.7H6.1l10.1 14.5z"/></svg></a>
        </div>
      </div>
      <nav class="footer__col" aria-label="Opportunities">
        <h4>Opportunities</h4>
        ${opportunities.map(o => `<a href="${prefix}opportunities/${o.slug}.html">${esc(o.title)}</a>`).join('\n        ')}
      </nav>
      <nav class="footer__col" aria-label="Explore">
        <h4>Explore</h4>
        <a href="${prefix}index.html#about">About us</a>
        <a href="${prefix}global-volunteer.html">Global Volunteer</a>
        <a href="${prefix}opportunities.html">All opportunities</a>
        <a href="${prefix}index.html#programs">All programs</a>
      </nav>
      <div class="footer__col">
        <h4>Find us</h4>
        <p>Zagazig University<br>Sharqia, Egypt</p>
        <a href="https://www.instagram.com/icxzagazig" target="_blank" rel="noopener">@icxzagazig</a>
        <a href="https://aiesec.org/global-volunteer" target="_blank" rel="noopener">aiesec.org</a>
      </div>
    </div>
    <div class="container footer__bottom">
      <p>© <span id="year">2026</span> AIESEC in Zagazig. All rights reserved.</p>
      <p>Youth-led since 1948 <span class="dot"></span> #1 in Egypt for incoming exchange</p>
    </div>
  </footer>`;

const head = ({ title, desc, path, jsonld, ogType = 'website' }) => `<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${attr(desc)}">
  <meta name="theme-color" content="#05070E">
  <link rel="canonical" href="${BASE_URL}/${path}">
  <meta property="og:type" content="${ogType}">
  <meta property="og:title" content="${attr(title)}">
  <meta property="og:description" content="${attr(desc)}">
  <meta property="og:url" content="${BASE_URL}/${path}">
  <meta property="og:image" content="${BASE_URL}/assets/og.png">
  <meta property="og:site_name" content="AIESEC in Zagazig">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${attr(title)}">
  <meta name="twitter:description" content="${attr(desc)}">
  <meta name="twitter:image" content="${BASE_URL}/assets/og.png">
  <link rel="icon" type="image/svg+xml" href="${path.includes('/') ? '../' : ''}assets/favicon.svg">
  <link rel="preconnect" href="https://api.fontshare.com" crossorigin>
  <link href="https://api.fontshare.com/v2/css?f[]=clash-display@500,600,700&f[]=general-sans@400,500,600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${path.includes('/') ? '../' : ''}css/styles.css">
  <link rel="stylesheet" href="${path.includes('/') ? '../' : ''}css/opportunities.css">
  ${jsonld ? `<script type="application/ld+json">${jsonld}</script>` : ''}
  <script>document.documentElement.classList.replace('no-js','js');</script>
  <noscript><style>#preloader,.cursor{display:none!important}.od-faq__a{height:auto!important}</style></noscript>
</head>`;

const ICON = {
  pin: '<path d="M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  activity: '<path d="M3 12h4l2-6 4 12 2-6h4"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.5 3.9 5.6 3.9 9S14.6 18.5 12 21c-2.6-2.5-3.9-5.6-3.9-9S9.4 5.5 12 3z"/>',
  tag: '<path d="M3 11l8-8 10 10-8 8-10-10z"/><circle cx="8" cy="8" r="1.4"/>',
  check: '<path d="M4 12l5 5L20 6"/>',
  chevron: '<path d="M9 6l6 6-6 6"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2 2M16 16l2 2M18 6l-2 2M8 16l-2 2"/>',
  bed: '<path d="M3 12v6a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-6"/><path d="M3 12V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3"/><path d="M7 7V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1"/>',
  food: '<path d="M5 3v8a2 2 0 0 0 2 2h0V3M9 3v18M17 3c-1.5 0-2.5 2-2.5 5s1 4 2.5 4v9"/>',
  bus: '<rect x="4" y="4" width="16" height="12" rx="2"/><path d="M4 11h16M8 20v-2M16 20v-2"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/>',
  ext: '<path d="M7 17 17 7M9 7h8v8"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  file: '<path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v5h5"/>',
};
const svg = (paths, cls = '') => `<svg ${cls ? `class="${cls}" ` : ''}viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

/* ── SDG helper ────────────────────────────────────────────── */
const sdgBadge = o => `<span class="sdg-badge" style="--sdg-color:${o.sdg.color}"><small>SDG ${o.sdg.n}</small> ${esc(o.sdg.label)}</span>`;

/* ── LISTING page ──────────────────────────────────────────── */
function buildListing() {
  const sdgSet = [...new Map(opportunities.map(o => [o.sdg.n, o.sdg])).values()].sort((a, b) => a.n - b.n);
  const durations = [...new Set(opportunities.map(o => o.duration))];
  const countries = [...new Set(opportunities.map(o => o.country))];

  const cards = opportunities.map((o, i) => `
        <a class="opp-card" href="opportunities/${o.slug}.html" style="--accent:${o.accent}"
           data-opp data-sdg="${o.sdg.n}" data-country="${attr(o.country)}" data-duration="${attr(o.duration)}"
           data-name="${attr(o.title + ' ' + o.category)}" data-reveal data-reveal-delay="${(i % 3) * 0.07}">
          <div class="opp-card__top">
            ${sdgBadge(o)}
            <span class="opp-card__ico">${svg(o.iconSvg)}</span>
          </div>
          <h3 class="opp-card__title">${esc(o.title)}</h3>
          <p class="opp-card__cat">${esc(o.category)}</p>
          <div class="opp-card__meta">
            <span>${svg(ICON.clock)} ${esc(o.duration)}</span>
            <span>${svg(ICON.pin)} ${esc(o.city)}, ${esc(o.country)} ${o.flag}</span>
          </div>
          <p class="opp-card__desc">${esc(o.short)}</p>
          <span class="opp-card__link">View Details ${svg(ICON.arrow)}</span>
        </a>`).join('\n');

  const jsonld = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Featured Global Volunteer Opportunities — AIESEC in Zagazig',
    itemListElement: opportunities.map((o, i) => ({
      '@type': 'ListItem', position: i + 1, name: o.title,
      url: `${BASE_URL}/opportunities/${o.slug}.html`,
    })),
  });

  const main = `<main id="top">
    <section class="opps-hero" aria-label="Opportunities intro">
      <div class="opps-hero__bg" data-parallax aria-hidden="true"></div>
      <div class="container">
        <nav class="opps-breadcrumb" aria-label="Breadcrumb">
          <a href="index.html">Home</a>${svg(ICON.chevron)}
          <a href="global-volunteer.html">Global Volunteer</a>${svg(ICON.chevron)}
          <span aria-current="page">Opportunities</span>
        </nav>
        <p class="opps-hero__eyebrow"><span class="dot"></span> Live openings · hosted in Zagazig, Egypt</p>
        <h1 class="opps-hero__title">Featured Global Volunteer <span class="accent">Opportunities.</span></h1>
        <p class="opps-hero__sub">Real projects you can apply to right now with AIESEC in Zagazig — the #1 local committee in Egypt for incoming exchange. Filter by cause, duration or name, and open any card for the full brief.</p>
        <div class="opps-stats">
          <div><p class="opps-stat__num"><span data-count="${opportunities.length}">0</span></p><p class="opps-stat__label">Open opportunities</p></div>
          <div><p class="opps-stat__num"><span data-count="${sdgSet.length}">0</span></p><p class="opps-stat__label">UN SDGs covered</p></div>
          <div><p class="opps-stat__num"><span data-count="${shared.campuses.length}">0</span></p><p class="opps-stat__label">Campus cities</p></div>
          <div><p class="opps-stat__num">$<span data-count="75">0</span></p><p class="opps-stat__label">Starting fee</p></div>
        </div>
      </div>
    </section>

    <section class="section" id="opportunities" style="padding-top:clamp(2rem,5vh,3rem)">
      <div class="container">
        <div class="opps-toolbar" role="search">
          <div class="opps-search-wrap">
            ${svg('<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>')}
            <input class="opps-search" type="search" id="oppSearch" placeholder="Search by opportunity name…" aria-label="Search opportunities by name">
          </div>
          <div class="opps-chips" role="group" aria-label="Filter by SDG">
            <button class="opps-chip is-active" data-sdg-filter="all">All SDGs</button>
            ${sdgSet.map(s => `<button class="opps-chip" data-sdg-filter="${s.n}" style="--chip:${s.color}">SDG ${s.n}</button>`).join('\n            ')}
          </div>
          <div class="opps-selects">
            <select class="opps-select" id="oppCountry" aria-label="Filter by country">
              <option value="all">All countries</option>
              ${countries.map(c => `<option value="${attr(c)}">${esc(c)}</option>`).join('\n              ')}
            </select>
            <select class="opps-select" id="oppDuration" aria-label="Filter by duration">
              <option value="all">Any duration</option>
              ${durations.map(d => `<option value="${attr(d)}">${esc(d)}</option>`).join('\n              ')}
            </select>
          </div>
        </div>
        <p class="opps-count" id="oppCount"><b>${opportunities.length}</b> opportunities</p>

        <div class="opps-grid" id="oppGrid">${cards}
          <div class="opps-empty" id="oppEmpty" hidden>
            ${svg('<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>')}
            <p>No opportunities match those filters yet.<br>Try clearing a filter.</p>
          </div>
        </div>
      </div>
    </section>
  </main>`;

  return `<!DOCTYPE html>
<html lang="en" class="no-js">
${head({
    title: 'Featured Global Volunteer Opportunities — AIESEC in Zagazig',
    desc: 'Browse and filter live Global Volunteer opportunities hosted by AIESEC in Zagazig, Egypt — quality education, health and decent-work projects with accommodation, visa support and a global certificate.',
    path: 'opportunities.html', jsonld,
  })}
<body>
  <a class="skip-link" href="#opportunities">Skip to content</a>
  ${preloader('Live Global Volunteer opportunities', '')}
  ${chrome}
  ${nav('')}
  ${menu('')}
  ${main}
  ${footer('')}
  <script defer src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/lenis@1/dist/lenis.min.js"></script>
  <script defer src="js/site-core.js"></script>
  <script defer src="js/opportunities.js"></script>
</body>
</html>`;
}

/* ── DETAIL page ───────────────────────────────────────────── */
function listBlock(items, variant = '') {
  const icon = variant === 'is-benefit' ? ICON.check : (variant === 'req' ? ICON.check : ICON.chevron);
  const cls = variant === 'is-benefit' ? ' is-benefit' : '';
  return `<ul class="od-list${cls}">${items.map(t => `
          <li>${svg(icon)} ${esc(t)}</li>`).join('')}
        </ul>`;
}

function buildDetail(o) {
  const jd = o.jdType === 'AIESEC'
    ? `<a class="btn btn--ghost" href="${attr(o.applyUrl)}" target="_blank" rel="noopener"><span>View on AIESEC</span></a>`
    : `<a class="btn btn--ghost" href="${attr(o.jdUrl)}" target="_blank" rel="noopener"><span>View Job Description</span></a>`;

  const jsonld = JSON.stringify([
    {
      '@context': 'https://schema.org', '@type': 'JobPosting',
      title: `${o.title} — Global Volunteer`, description: o.overview,
      datePosted: DATE, employmentType: 'VOLUNTEER', industry: o.category,
      hiringOrganization: { '@type': 'Organization', name: 'AIESEC in Zagazig', sameAs: 'https://aiesec.org' },
      jobLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: o.city, addressCountry: 'EG' } },
      url: `${BASE_URL}/opportunities/${o.slug}.html`, directApply: false,
    },
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/index.html` },
        { '@type': 'ListItem', position: 2, name: 'Opportunities', item: `${BASE_URL}/opportunities.html` },
        { '@type': 'ListItem', position: 3, name: o.title, item: `${BASE_URL}/opportunities/${o.slug}.html` },
      ],
    },
    {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: shared.faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ]);

  const specs = [
    ['pin', o.location, 'Location'],
    ['clock', o.duration, 'Duration'],
    ['activity', o.hours, 'Working hours'],
    ['globe', `${o.country} ${o.flag}`, 'Country'],
  ].map(([ic, b, s]) => `<div class="od-spec">${svg(ICON[ic])}<div><b>${esc(b)}</b><span>${esc(s)}</span></div></div>`).join('\n          ');

  const gallery = o.gallery.map((g, i) => `<button class="od-tile" data-lightbox data-k="${attr(g.k)}" data-title="${attr(g.t)}" data-desc="A glimpse of the ${attr(o.title)} experience with AIESEC in Zagazig.">
            <span class="od-tile__ico">${svg(i === 0 ? o.iconSvg : ICON.spark)}</span>
            <span class="od-tile__k">${esc(g.k)}</span><span class="od-tile__t">${esc(g.t)}</span>
          </button>`).join('\n          ');

  const steps = shared.applicationProcess.map(s => `<div class="od-step" data-reveal>
            <span class="od-step__n">${s.n}</span>
            <h3>${esc(s.title)}</h3><p>${esc(s.text)}</p>
          </div>`).join('\n          ');

  const faqs = shared.faqs.map(f => `<div class="od-faq__item">
            <button class="od-faq__q" aria-expanded="false">${esc(f.q)} <span class="od-faq__sign" aria-hidden="true"></span></button>
            <div class="od-faq__a"><div class="od-faq__a-inner">${esc(f.a)}</div></div>
          </div>`).join('\n          ');

  const packages = o.packages ? `<p>${esc(o.packages)}</p>` : '';

  const main = `<main id="top" style="--accent:${o.accent}">
    <div class="od-progress" aria-hidden="true"><i></i></div>

    <section class="od-hero" aria-label="${attr(o.title)}">
      <div class="od-hero__bg" data-parallax aria-hidden="true"></div>
      <div class="container">
        <nav class="opps-breadcrumb" aria-label="Breadcrumb">
          <a href="../index.html">Home</a>${svg(ICON.chevron)}
          <a href="../opportunities.html">Opportunities</a>${svg(ICON.chevron)}
          <span aria-current="page">${esc(o.title)}</span>
        </nav>
        ${sdgBadge(o)}
        <h1 class="od-hero__title">${esc(o.displayTitle)}</h1>
        <p class="od-hero__cat">${esc(o.category)} · ${esc(o.city)}, ${esc(o.country)} ${o.flag}</p>
        <p class="od-hero__lead">${esc(o.short)}</p>
        <div class="od-specs">
          ${specs}
        </div>
      </div>
    </section>

    <div class="container">
      <div class="od-layout">
        <div class="od-main">
          <section class="od-block" data-reveal id="overview">
            <h2><span class="num">01</span>Opportunity overview</h2>
            <p>${esc(o.overview)}</p>
            ${packages}
          </section>

          <section class="od-block" data-reveal id="org">
            <h2><span class="num">02</span>About the organization</h2>
            <p>${esc(o.orgAbout)}</p>
            <p>${esc(shared.org)}</p>
          </section>

          <section class="od-block" data-reveal id="responsibilities">
            <h2><span class="num">03</span>Responsibilities</h2>
            ${listBlock(o.responsibilities)}
          </section>

          <section class="od-block" data-reveal id="requirements">
            <h2><span class="num">04</span>Requirements</h2>
            ${listBlock(o.requirements, 'req')}
          </section>

          <section class="od-block" data-reveal id="benefits">
            <h2><span class="num">05</span>Benefits</h2>
            ${listBlock(o.benefits, 'is-benefit')}
          </section>

          <section class="od-block" data-reveal id="logistics">
            <h2><span class="num">06</span>Accommodation, food &amp; transport</h2>
            <div class="od-cards3">
              <div class="od-mini"><div class="od-mini__ico">${svg(ICON.bed)}</div><h3>Accommodation</h3><p>${esc(o.accommodation)}</p></div>
              <div class="od-mini"><div class="od-mini__ico">${svg(ICON.food)}</div><h3>Food</h3><p>${esc(o.food)}</p></div>
              <div class="od-mini"><div class="od-mini__ico">${svg(ICON.bus)}</div><h3>Transportation</h3><p>${esc(o.transportation)}</p></div>
            </div>
          </section>

          <section class="od-block" data-reveal id="outcomes">
            <h2><span class="num">07</span>Learning outcomes</h2>
            <div class="od-outcomes">
              ${o.outcomes.map(t => `<span class="od-outcome">${svg(ICON.spark)} ${esc(t)}</span>`).join('\n              ')}
            </div>
          </section>

          <section class="od-block" data-reveal id="gallery">
            <h2><span class="num">08</span>Gallery</h2>
            <div class="od-gallery">
          ${gallery}
            </div>
            <p style="color:var(--muted);font-size:.82rem;margin-top:1rem">Real ${esc(o.title)} photos can be dropped straight into these tiles.</p>
          </section>

          <section class="od-block" data-reveal id="process">
            <h2><span class="num">09</span>Application process</h2>
            <div class="od-timeline">
              <div class="od-timeline__line" aria-hidden="true"><i></i></div>
          ${steps}
            </div>
          </section>

          <section class="od-block" id="faq">
            <h2><span class="num">10</span>Frequently asked questions</h2>
            <div class="od-faq">
          ${faqs}
            </div>
          </section>
        </div>

        <aside class="od-aside">
          <div class="od-apply">
            <p class="od-apply__fee">${esc(o.fee)}<span>hosting fee</span></p>
            <div class="od-apply__row">${svg(ICON.clock)} ${esc(o.duration)}</div>
            <div class="od-apply__row">${svg(ICON.pin)} ${esc(o.city)}, ${esc(o.country)}</div>
            <div class="od-apply__row">${svg(ICON.globe)} ${esc(o.sdg.label)}</div>
            <div class="od-apply__btns">
              <a class="btn btn--accent" href="${attr(o.applyUrl)}" target="_blank" rel="noopener" data-magnetic><span>Apply Now ${svg(ICON.ext, 'btn__ext')}</span></a>
              ${jd}
            </div>
            <p class="od-apply__note">Applications open on the official AIESEC platform.</p>
          </div>
        </aside>
      </div>
    </div>
  </main>

  <div class="od-mobilebar" aria-hidden="true">
    <p class="od-mobilebar__fee">${esc(o.fee)}<span>${esc(o.duration)}</span></p>
    <a class="btn btn--accent" href="${attr(o.applyUrl)}" target="_blank" rel="noopener"><span>Apply Now</span></a>
  </div>

  <div class="lightbox" id="lightbox" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Gallery preview">
    <div class="lightbox__panel" style="--accent:${o.accent}">
      <button class="lightbox__close" aria-label="Close preview">${svg('<path d="M6 6l12 12M18 6 6 18"/>')}</button>
      <p class="lightbox__k" data-lb-k></p>
      <h3 class="lightbox__t" data-lb-t></h3>
      <p style="color:var(--muted)" data-lb-d></p>
    </div>
  </div>`;

  return `<!DOCTYPE html>
<html lang="en" class="no-js">
${head({
    title: `${o.title} — Global Volunteer in ${o.city}, Egypt | AIESEC in Zagazig`,
    desc: `${o.short} ${o.duration}, hosted by AIESEC in Zagazig. SDG ${o.sdg.n}: ${o.sdg.label}.`,
    path: `opportunities/${o.slug}.html`, jsonld, ogType: 'article',
  })}
<body>
  <a class="skip-link" href="#overview">Skip to content</a>
  ${preloader(esc(o.title) + ' · Global Volunteer', '../')}
  ${chrome}
  ${nav('../')}
  ${menu('../')}
  ${main}
  ${footer('../')}
  <script defer src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/lenis@1/dist/lenis.min.js"></script>
  <script defer src="../js/site-core.js"></script>
  <script defer src="../js/opportunity-detail.js"></script>
</body>
</html>`;
}

/* ── Emit ──────────────────────────────────────────────────── */
mkdirSync(join(ROOT, 'opportunities'), { recursive: true });
writeFileSync(join(ROOT, 'opportunities.html'), buildListing());
let n = 0;
for (const o of opportunities) {
  writeFileSync(join(ROOT, 'opportunities', `${o.slug}.html`), buildDetail(o));
  n++;
}
console.log(`✓ opportunities.html + ${n} detail pages generated`);
