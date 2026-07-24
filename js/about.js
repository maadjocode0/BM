/* ═══════════════════════════════════════════════════════════════
   About AIESEC in Zagazig — page interactions.
   Depends on window.AZ (js/site-core.js) for shared chrome and
   Swiper (CDN) for the video + testimonials sliders.
   ═══════════════════════════════════════════════════════════════ */
(() => {
  'use strict';
  const { $, $$, reduced } = window.AZ;

  /* ── Hero intro (after preloader) ─────────────────────────── */
  const heroIntro = () => {
    if (!window.gsap) return null;
    gsap.set('.abz-hero .line__inner', { yPercent: 115 });
    gsap.set(['.abz-hero .gv-breadcrumb', '.abz-hero__eyebrow', '.hero__eyebrow', '.abz-hero__sub', '.abz-hero__cta .btn'], { y: 26, opacity: 0 });
    gsap.set('.abz-shape', { opacity: 0, scale: 0.6 });
    gsap.set('.nav', { y: -24, opacity: 0 });
    return gsap.timeline({ paused: true, defaults: { ease: 'power4.out' } })
      .to('.abz-hero .gv-breadcrumb', { y: 0, opacity: 1, duration: 0.6 }, 0)
      .to(['.abz-hero__eyebrow', '.hero__eyebrow'], { y: 0, opacity: 1, duration: 0.7 }, 0.08)
      .to('.abz-hero .line__inner', { yPercent: 0, duration: 1.1, stagger: 0.12 }, 0.16)
      .to('.abz-shape', { opacity: 1, scale: 1, duration: 1.2, stagger: 0.08 }, 0.2)
      .to('.abz-hero__sub', { y: 0, opacity: 1, duration: 0.8 }, 0.5)
      .to('.abz-hero__cta .btn', { y: 0, opacity: 1, duration: 0.8, stagger: 0.09 }, 0.6)
      .to('.nav', { y: 0, opacity: 1, duration: 0.8 }, 0.55);
  };
  window.AZ.init({ heroIntro });

  /* ── Manifesto word reveal (data-words) ───────────────────── */
  if (window.gsap && !reduced) {
    $$('[data-words]').forEach(p => {
      const text = p.textContent.trim().replace(/\s+/g, ' ');
      p.setAttribute('aria-label', text);
      p.textContent = '';
      const words = text.split(' ').map(w => {
        const s = document.createElement('span');
        s.className = 'word'; s.textContent = w; s.setAttribute('aria-hidden', 'true');
        p.append(s, ' '); return s;
      });
      gsap.fromTo(words, { opacity: 0.13 }, {
        opacity: 1, stagger: 0.03, ease: 'none',
        scrollTrigger: { trigger: p, start: 'top 80%', end: 'bottom 48%', scrub: true },
      });
    });
  }

  /* ── Floating shapes ──────────────────────────────────────── */
  if (window.gsap && !reduced) {
    $$('[data-float]').forEach((el, i) => {
      gsap.to(el, {
        y: (i % 2 ? 1 : -1) * gsap.utils.random(16, 32), x: (i % 2 ? -1 : 1) * gsap.utils.random(10, 20),
        duration: gsap.utils.random(4, 7), ease: 'sine.inOut', repeat: -1, yoyo: true, delay: i * 0.2,
      });
    });
    if (window.matchMedia('(pointer:fine)').matches) {
      $('.abz-hero')?.addEventListener('mousemove', e => {
        const cx = e.clientX / innerWidth - 0.5, cy = e.clientY / innerHeight - 0.5;
        $$('[data-float]').forEach((el, i) => gsap.to(el, { xPercent: cx * (i + 1) * 6, yPercent: cy * (i + 1) * 6, duration: 0.8, ease: 'power2.out', overwrite: 'auto' }));
      }, { passive: true });
    }
  }

  /* ── Journey timeline ─────────────────────────────────────── */
  if (window.gsap && !reduced) {
    const line = $('.abz-tl__line i');
    if (line) gsap.to(line, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.abz-tl', start: 'top 60%', end: 'bottom 80%', scrub: 0.6 } });
    gsap.utils.toArray('.abz-tl__dot').forEach(dot => {
      gsap.fromTo(dot, { scale: 0.4, opacity: 0 }, {
        scale: 1, opacity: 1, duration: 0.55, ease: 'back.out(2)',
        scrollTrigger: { trigger: dot, start: 'top 88%', once: true },
        onStart: () => { dot.style.background = 'var(--blue)'; dot.style.color = '#fff'; dot.style.borderColor = 'var(--blue)'; },
      });
    });
  }

  /* ── Contact avatar ───────────────────────────────────────
     Initials by default (no network probe → no 404). To use a
     photo, add it and set data-photo="assets/amr-aymen.jpg" on
     #contactAvatar. */
  (() => {
    const av = $('#contactAvatar');
    const src = av && av.dataset.photo;
    if (!src) return;
    const img = new Image();
    img.onload = () => { av.textContent = ''; av.appendChild(img); };
    img.alt = 'Amr Aymen'; img.src = src;
  })();

  const ACCENTS = ['#037EF3', '#0CB9C1', '#F48924', '#7552CC', '#00C16E', '#F85A40'];

  /* ── Experience video slider ──────────────────────────────── */
  async function buildExperience() {
    const wrapper = $('#expWrapper');
    const note = $('#expNote');
    if (!wrapper) return;
    let videos = [];
    try { const r = await fetch('data/experience.json'); if (r.ok) videos = (await r.json()).videos || []; } catch (e) {}

    const placeholders = [
      { k: 'Global Village', t: 'Cultures under one roof' },
      { k: 'On exchange', t: 'From Zagazig to the world' },
      { k: 'Team moments', t: 'The people behind it' },
      { k: 'The pyramids trip', t: 'Egypt, together' },
    ];
    const items = videos.length ? videos : placeholders;

    wrapper.innerHTML = items.map((v, i) => {
      const accent = ACCENTS[i % ACCENTS.length];
      const media = v.src
        ? `<video muted loop playsinline preload="metadata" ${v.poster ? `poster="${v.poster}"` : ''}><source src="${v.src}" type="video/mp4"></video>`
        : `<div class="exp-card__ph"></div>`;
      const play = v.src ? '' : `<button class="exp-card__play" aria-label="Play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></button>`;
      return `<div class="swiper-slide exp-slide" style="--accent:${accent}">
        <div class="exp-card" data-has-video="${!!v.src}">
          ${media}<div class="exp-card__overlay"></div>${play}
          <div class="exp-card__label"><p class="exp-card__k">${v.kicker || v.k || 'AIESEC Zagazig'}</p><p class="exp-card__t">${v.title || v.t || 'Experience'}</p></div>
        </div></div>`;
    }).join('');

    if (note) note.hidden = videos.length > 0;

    if (!window.Swiper) { $('#expSwiper').style.overflowX = 'auto'; return; }
    const sw = new Swiper('#expSwiper', {
      slidesPerView: 'auto', spaceBetween: 22, grabCursor: true, loop: items.length > 2,
      speed: 700,
      autoplay: reduced ? false : { delay: 3800, disableOnInteraction: false, pauseOnMouseEnter: true },
      navigation: { prevEl: '.exp-prev', nextEl: '.exp-next' },
      pagination: { el: '#expPagination', clickable: true },
      breakpoints: { 0: { spaceBetween: 14 }, 860: { spaceBetween: 22 } },
    });

    // Real videos: play the active slide, pause others (lazy-ish)
    if (videos.length) {
      const syncVideos = () => {
        $$('.exp-slide video', wrapper).forEach(vd => { try { vd.pause(); } catch (e) {} });
        const active = sw.slides[sw.activeIndex];
        const vd = active && active.querySelector('video');
        if (vd) { const p = vd.play(); if (p && p.catch) p.catch(() => {}); }
      };
      sw.on('slideChangeTransitionEnd', syncVideos);
      sw.on('afterInit', syncVideos);
      syncVideos();
    }
    // Entrance
    if (window.gsap && !reduced) {
      gsap.from('.exp-slide', { opacity: 0, y: 40, duration: 0.8, stagger: 0.08, ease: 'power3.out',
        scrollTrigger: { trigger: '#expSwiper', start: 'top 82%', once: true } });
    }
  }

  /* ── Testimonials slider ──────────────────────────────────── */
  function buildTestimonials() {
    if (!window.Swiper) return;
    new Swiper('#testiSwiper', {
      slidesPerView: 'auto', spaceBetween: 20, grabCursor: true, loop: true, speed: 700,
      autoplay: reduced ? false : { delay: 4600, disableOnInteraction: false, pauseOnMouseEnter: true },
    });
  }

  /* ── Masonry gallery + lightbox ───────────────────────────── */
  async function buildGallery() {
    const grid = $('#galleryGrid');
    if (!grid) return;
    let images = [];
    try { const r = await fetch('data/gallery.json'); if (r.ok) images = (await r.json()).images || []; } catch (e) {}

    const phHeights = [260, 200, 320, 220, 300, 190, 280, 240, 210];
    const phCaps = ['Global Village', 'On exchange', 'Team retreat', 'Community project', 'The pyramids trip',
      'Conference', 'Welcome day', 'Cultural night', 'Volunteers in action'];
    const items = images.length
      ? images.map(im => ({ src: im.src, caption: im.caption || 'AIESEC in Zagazig' }))
      : phHeights.map((h, i) => ({ ph: h, caption: phCaps[i % phCaps.length], accent: ACCENTS[i % ACCENTS.length] }));

    grid.innerHTML = items.map((it, i) => {
      const inner = it.src
        ? `<img src="${it.src}" loading="lazy" decoding="async" alt="${it.caption}">`
        : `<div class="g-tile__ph" style="height:${it.ph}px;background:radial-gradient(circle at 30% 25%, color-mix(in srgb, ${it.accent} 42%, transparent), transparent 62%), linear-gradient(150deg,#0c1628,#0a1120)"></div>`;
      return `<button class="g-tile" data-i="${i}" aria-label="Open ${it.caption}">
        ${inner}
        <span class="g-tile__cap">${it.caption}</span>
        <span class="g-tile__zoom"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M11 8v6M8 11h6"/></svg></span>
      </button>`;
    }).join('');

    /* Lightbox */
    const glb = $('#glb'), glbImg = $('#glbImg');
    let idx = 0;
    const render = () => {
      const it = items[idx];
      glbImg.innerHTML = it.src
        ? `<img src="${it.src}" alt="${it.caption}" style="display:block;max-width:100%;max-height:84vh;border-radius:16px">`
        : `<div style="width:min(80vw,760px);aspect-ratio:4/3;border-radius:16px;background:radial-gradient(circle at 30% 25%, color-mix(in srgb, ${it.accent} 45%, transparent), transparent 62%), linear-gradient(150deg,#0c1628,#0a1120);display:grid;place-items:end;padding:1.5rem"><span style="font-family:var(--font-display);font-weight:600;font-size:1.4rem">${it.caption}</span></div>`;
    };
    const open = i => { idx = i; render(); glb.classList.add('is-open'); glb.setAttribute('aria-hidden', 'false'); if (window.__lenis && !reduced) window.__lenis.stop(); };
    const close = () => { glb.classList.remove('is-open'); glb.setAttribute('aria-hidden', 'true'); if (window.__lenis && !reduced) window.__lenis.start(); };
    const step = d => { idx = (idx + d + items.length) % items.length; render(); };
    grid.querySelectorAll('.g-tile').forEach(t => t.addEventListener('click', () => open(+t.dataset.i)));
    $('.glb__close', glb).addEventListener('click', close);
    $('.glb__nav--prev', glb).addEventListener('click', () => step(-1));
    $('.glb__nav--next', glb).addEventListener('click', () => step(1));
    glb.addEventListener('click', e => { if (e.target === glb) close(); });
    window.addEventListener('keydown', e => {
      if (!glb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    });
  }

  buildExperience();
  buildTestimonials();
  buildGallery();
  if (window.gsap && window.ScrollTrigger) { setTimeout(() => ScrollTrigger.refresh(), 400); }
})();
