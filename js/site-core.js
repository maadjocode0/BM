/* ═══════════════════════════════════════════════════════════════
   AIESEC in Zagazig — shared core for the Opportunities module.
   Reusable chrome (Lenis, nav, menu, cursor, magnetic, preloader,
   reveals, counters, parallax) so listing + detail pages don't
   duplicate code. Exposes window.AZ.
   ═══════════════════════════════════════════════════════════════ */
window.AZ = (function () {
  'use strict';
  const doc = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    || new URLSearchParams(location.search).has('static');
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  let lenis = null;

  function basics() {
    const y = $('#year'); if (y) y.textContent = new Date().getFullYear();

    /* Same-page anchors (cross-page links pass through) */
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href');
        if (id.length < 2) return;
        const target = $(id);
        if (!target) return;
        e.preventDefault();
        closeMenu();
        if (lenis) lenis.scrollTo(target, { offset: -70, duration: 1.35 });
        else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
      });
    });

    /* Nav scroll state */
    const nav = $('.nav');
    const onScroll = () => nav && nav.classList.toggle('nav--scrolled', window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    initMenu();

    /* Cursor + magnetic */
    if (finePointer && !reduced && window.gsap) {
      doc.classList.add('has-cursor');
      const dot = $('.cursor__dot'), ring = $('.cursor__ring');
      let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
      window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; gsap.set(dot, { x: mx, y: my }); }, { passive: true });
      gsap.ticker.add(() => { rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16; gsap.set(ring, { x: rx, y: ry }); });
      const H = 'a, button, [data-magnetic], [data-lightbox]';
      document.addEventListener('mouseover', e => { if (e.target.closest(H)) doc.classList.add('cursor-hover'); });
      document.addEventListener('mouseout', e => { if (e.target.closest(H)) doc.classList.remove('cursor-hover'); });
      $$('[data-magnetic]').forEach(el => {
        el.addEventListener('mousemove', e => {
          const r = el.getBoundingClientRect();
          gsap.to(el, { x: ((e.clientX - r.left) / r.width - 0.5) * 18, y: ((e.clientY - r.top) / r.height - 0.5) * 18, duration: 0.4, ease: 'power3.out' });
        });
        el.addEventListener('mouseleave', () => gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.45)' }));
      });
    }
  }

  /* Fullscreen menu */
  let menuOpen = false, menuTl = null;
  const menu = () => $('#menu'), burger = () => $('.nav__burger');
  function initMenu() {
    const m = menu(), b = burger();
    if (!m || !b) return;
    if (window.gsap) {
      gsap.set(m, { clipPath: 'inset(0 0 100% 0)', pointerEvents: 'auto' });
      menuTl = gsap.timeline({ paused: true, defaults: { ease: 'power4.inOut' } })
        .to(m, { clipPath: 'inset(0 0 0% 0)', duration: reduced ? 0 : 0.65 }, 0)
        .fromTo('.menu__link', { yPercent: 120 }, { yPercent: 0, duration: reduced ? 0 : 0.7, ease: 'power3.out', stagger: reduced ? 0 : 0.055 }, reduced ? 0 : 0.22)
        .fromTo('.menu__foot', { opacity: 0 }, { opacity: 1, duration: reduced ? 0 : 0.45 }, reduced ? 0 : 0.5);
    }
    b.addEventListener('click', () => (menuOpen ? closeMenu() : openMenu()));
    window.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  }
  function openMenu() {
    const m = menu(), b = burger();
    if (!m || menuOpen) return;
    menuOpen = true; m.classList.add('is-active'); m.setAttribute('aria-hidden', 'false');
    b.classList.add('is-open'); b.setAttribute('aria-expanded', 'true');
    if (lenis) lenis.stop();
    if (menuTl) menuTl.play(); else m.style.clipPath = 'inset(0 0 0% 0)';
  }
  function closeMenu() {
    const m = menu(), b = burger();
    if (!m || !menuOpen) return;
    menuOpen = false; b.classList.remove('is-open'); b.setAttribute('aria-expanded', 'false');
    if (lenis) lenis.start();
    if (menuTl) { menuTl.reverse(); menuTl.eventCallback('onReverseComplete', () => { m.classList.remove('is-active'); m.setAttribute('aria-hidden', 'true'); }); }
    else { m.style.clipPath = 'inset(0 0 100% 0)'; m.classList.remove('is-active'); m.setAttribute('aria-hidden', 'true'); }
  }

  function preloader(heroTl) {
    const pre = $('#preloader');
    if (!pre || reduced) { if (pre) pre.remove(); if (heroTl) heroTl.progress(1); return; }
    if (lenis) lenis.stop();
    document.body.style.overflow = 'hidden';
    const num = $('.preloader__num'), bar = $('.preloader__bar i'), st = { v: 0 };
    gsap.timeline()
      .to(st, { v: 100, duration: 1.35, ease: 'power2.inOut', onUpdate: () => { const n = Math.round(st.v); if (num) num.textContent = n; if (bar) bar.style.transform = `scaleX(${n / 100})`; } })
      .to('.preloader__inner', { yPercent: -36, opacity: 0, duration: 0.45, ease: 'power2.in' }, '+=0.1')
      .to(pre, { yPercent: -100, duration: 0.85, ease: 'power4.inOut', onComplete: () => { pre.remove(); document.body.style.overflow = ''; if (lenis) lenis.start(); ScrollTrigger.refresh(); } }, '-=0.1')
      .add(() => heroTl && heroTl.play(), '-=0.5');
    setTimeout(() => { if (document.getElementById('preloader')) { pre.remove(); document.body.style.overflow = ''; if (lenis) lenis.start(); if (heroTl) heroTl.progress(1); ScrollTrigger.refresh(); } }, 8000);
  }

  function reveals() {
    if (reduced) return;
    $$('[data-reveal]').forEach(el => {
      gsap.fromTo(el, { y: 40, opacity: 0 }, {
        y: 0, opacity: 1, duration: 1, ease: 'power3.out',
        delay: parseFloat(el.dataset.revealDelay || 0),
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });
  }

  function counters() {
    $$('[data-count]').forEach(el => {
      const end = parseInt(el.dataset.count, 10) || 0;
      if (reduced || !window.gsap) { el.textContent = end.toLocaleString('en-US'); return; }
      const st = { v: 0 };
      gsap.to(st, {
        v: end, duration: 1.7, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        onUpdate: () => { el.textContent = Math.round(st.v).toLocaleString('en-US'); },
      });
    });
  }

  function parallax() {
    if (reduced || !window.gsap) return;
    $$('[data-parallax]').forEach(el => {
      gsap.fromTo(el, { yPercent: -6 }, {
        yPercent: 14, ease: 'none',
        scrollTrigger: { trigger: el.closest('section') || el, start: 'top top', end: 'bottom top', scrub: true },
      });
    });
  }

  function init(opts = {}) {
    if (!window.gsap || !window.ScrollTrigger) {
      doc.classList.add('reduced');
      $('#preloader')?.remove();
      $$('[data-count]').forEach(el => { el.textContent = (+el.dataset.count).toLocaleString('en-US'); });
      basics();
      return { lenis: null, reduced: true, ok: false, $, $$ };
    }
    gsap.registerPlugin(ScrollTrigger);
    if (reduced) doc.classList.add('reduced');
    if (window.Lenis && !reduced) {
      lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
      window.__lenis = lenis;
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }
    basics();
    const heroTl = (opts.heroIntro && !reduced) ? opts.heroIntro() : null;
    preloader(heroTl);
    reveals();
    counters();
    parallax();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener('load', () => ScrollTrigger.refresh());
    return { lenis, reduced, ok: true, $, $$ };
  }

  return { $, $$, reduced, finePointer, init, closeMenu };
})();
