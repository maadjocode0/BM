/* ═══════════════════════════════════════════════════════════════
   Opportunity detail — progress bar, timeline, FAQ, lightbox,
   sticky mobile apply bar. Depends on window.AZ (js/site-core.js).
   ═══════════════════════════════════════════════════════════════ */
(() => {
  'use strict';
  const { $, $$, reduced } = window.AZ;

  const heroIntro = () => {
    if (!window.gsap) return null;
    gsap.set(['.opps-breadcrumb', '.od-hero .sdg-badge', '.od-hero__title', '.od-hero__cat', '.od-hero__lead', '.od-spec'], { y: 26, opacity: 0 });
    gsap.set('.nav', { y: -24, opacity: 0 });
    return gsap.timeline({ paused: true, defaults: { ease: 'power4.out' } })
      .to('.opps-breadcrumb', { y: 0, opacity: 1, duration: 0.6 }, 0)
      .to('.od-hero .sdg-badge', { y: 0, opacity: 1, duration: 0.6 }, 0.08)
      .to('.od-hero__title', { y: 0, opacity: 1, duration: 0.9 }, 0.16)
      .to('.od-hero__cat', { y: 0, opacity: 1, duration: 0.7 }, 0.3)
      .to('.od-hero__lead', { y: 0, opacity: 1, duration: 0.8 }, 0.38)
      .to('.od-spec', { y: 0, opacity: 1, duration: 0.7, stagger: 0.07 }, 0.46)
      .to('.nav', { y: 0, opacity: 1, duration: 0.8 }, 0.4);
  };

  window.AZ.init({ heroIntro });

  /* ── FAQ accordion ────────────────────────────────────────── */
  $$('.od-faq__item').forEach(item => {
    const q = $('.od-faq__q', item), a = $('.od-faq__a', item);
    if (!q || !a) return;
    q.addEventListener('click', () => {
      const open = item.classList.contains('is-open');
      if (open) {
        q.setAttribute('aria-expanded', 'false'); item.classList.remove('is-open');
        if (window.gsap && !reduced) gsap.to(a, { height: 0, duration: 0.45, ease: 'power3.inOut' });
        else a.style.height = '0px';
      } else {
        q.setAttribute('aria-expanded', 'true'); item.classList.add('is-open');
        if (window.gsap && !reduced) { gsap.set(a, { height: 'auto' }); gsap.from(a, { height: 0, duration: 0.5, ease: 'power3.inOut' }); }
        else a.style.height = 'auto';
      }
    });
  });

  /* ── Lightbox ─────────────────────────────────────────────── */
  const lb = $('#lightbox');
  if (lb) {
    const kEl = $('[data-lb-k]', lb), tEl = $('[data-lb-t]', lb), dEl = $('[data-lb-d]', lb);
    let last = null;
    const open = tile => {
      last = tile;
      kEl.textContent = tile.dataset.k || '';
      tEl.textContent = tile.dataset.title || '';
      dEl.textContent = tile.dataset.desc || '';
      lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false');
      if (window.__lenis && !reduced) window.__lenis.stop();
      $('.lightbox__close', lb).focus();
    };
    const close = () => {
      lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true');
      if (window.__lenis && !reduced) window.__lenis.start();
      if (last) last.focus();
    };
    $$('[data-lightbox]').forEach(t => t.addEventListener('click', () => open(t)));
    $('.lightbox__close', lb).addEventListener('click', close);
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    window.addEventListener('keydown', e => { if (e.key === 'Escape' && lb.classList.contains('is-open')) close(); });
  }

  if (!window.gsap) return;

  /* ── Scroll progress bar ──────────────────────────────────── */
  const prog = $('.od-progress i');
  if (prog && !reduced) {
    gsap.to(prog, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
  }

  /* ── Timeline fill + step pops ────────────────────────────── */
  if (!reduced) {
    const line = $('.od-timeline__line i');
    if (line) gsap.to(line, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.od-timeline', start: 'top 62%', end: 'bottom 78%', scrub: 0.6 } });
    gsap.utils.toArray('.od-step__n').forEach(n => {
      gsap.fromTo(n, { scale: 0.4, opacity: 0 }, {
        scale: 1, opacity: 1, duration: 0.55, ease: 'back.out(2)',
        scrollTrigger: { trigger: n, start: 'top 86%', once: true },
        onStart: () => { n.style.background = 'var(--accent)'; n.style.color = '#fff'; n.style.borderColor = 'var(--accent)'; },
      });
    });
  }

  /* ── Sticky mobile apply bar ──────────────────────────────── */
  const bar = $('.od-mobilebar'), hero = $('.od-hero');
  if (bar && hero) {
    new IntersectionObserver(entries => {
      entries.forEach(en => bar.classList.toggle('is-visible', !en.isIntersecting));
    }, { threshold: 0 }).observe(hero);
  }
})();
