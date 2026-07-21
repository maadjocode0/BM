/* ═══════════════════════════════════════════════════════════════
   AIESEC in Zagazig — Global Volunteer page interactions
   Reuses the site's motion language: Lenis · GSAP · magnetic · reveals
   plus page-specific timeline, FAQ accordion and lightbox.
   ═══════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const doc = document.documentElement;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    || new URLSearchParams(location.search).has('static');
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── FAQ + lightbox work even without GSAP ────────────────── */
  function initFaq() {
    $$('.faq__item').forEach(item => {
      const q = $('.faq__q', item);
      const a = $('.faq__a', item);
      if (!q || !a) return;
      q.addEventListener('click', () => {
        const open = item.classList.contains('is-open');
        if (open) {
          q.setAttribute('aria-expanded', 'false');
          item.classList.remove('is-open');
          if (window.gsap && !reduced) gsap.to(a, { height: 0, duration: 0.45, ease: 'power3.inOut' });
          else a.style.height = '0px';
        } else {
          q.setAttribute('aria-expanded', 'true');
          item.classList.add('is-open');
          if (window.gsap && !reduced) {
            gsap.set(a, { height: 'auto' });
            gsap.from(a, { height: 0, duration: 0.5, ease: 'power3.inOut' });
          } else {
            a.style.height = 'auto';
          }
        }
      });
    });
  }

  function initLightbox() {
    const lb = $('#lightbox');
    if (!lb) return;
    const kEl = $('[data-lb-k]', lb), tEl = $('[data-lb-t]', lb), dEl = $('[data-lb-d]', lb);
    let lastFocus = null;
    const open = tile => {
      lastFocus = tile;
      kEl.textContent = tile.dataset.k || '';
      tEl.textContent = tile.dataset.title || '';
      dEl.textContent = tile.dataset.desc || '';
      const accent = tile.style.getPropertyValue('--accent');
      if (accent) $('.lightbox__panel', lb).style.setProperty('--accent', accent);
      lb.classList.add('is-open');
      lb.setAttribute('aria-hidden', 'false');
      if (window.__lenis && !reduced) window.__lenis.stop();
      $('.lightbox__close', lb).focus();
    };
    const close = () => {
      lb.classList.remove('is-open');
      lb.setAttribute('aria-hidden', 'true');
      if (window.__lenis && !reduced) window.__lenis.start();
      if (lastFocus) lastFocus.focus();
    };
    $$('[data-lightbox]').forEach(t => t.addEventListener('click', () => open(t)));
    $('.lightbox__close', lb).addEventListener('click', close);
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    window.addEventListener('keydown', e => { if (e.key === 'Escape' && lb.classList.contains('is-open')) close(); });
    $('[data-lb-cta]', lb)?.addEventListener('click', close);
  }

  /* ── Graceful fallback if CDNs failed ─────────────────────── */
  if (!window.gsap || !window.ScrollTrigger) {
    doc.classList.add('reduced');
    $('#preloader')?.remove();
    $$('[data-count]').forEach(el => { el.textContent = (+el.dataset.count).toLocaleString('en-US'); });
    initMenu();
    initFaq();
    initLightbox();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  if (reduced) doc.classList.add('reduced');

  /* ── Smooth scroll ────────────────────────────────────────── */
  let lenis = null;
  if (window.Lenis && !reduced) {
    lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollToTarget = target => {
    if (lenis) lenis.scrollTo(target, { offset: -70, duration: 1.35 });
    else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  };

  /* ── Same-page anchors (cross-page links pass through) ────── */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      closeMenu();
      scrollToTarget(target);
    });
  });

  /* ── Nav scroll state ─────────────────────────────────────── */
  const nav = $('.nav');
  const onScroll = () => nav && nav.classList.toggle('nav--scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Fullscreen menu ──────────────────────────────────────── */
  let menuOpen = false, menuTl = null;
  const menu = $('#menu'), burger = $('.nav__burger');

  function initMenu() {
    if (!menu || !burger) return;
    burger.addEventListener('click', () => (menuOpen ? closeMenu() : openMenu()));
    window.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  }
  function openMenu() {
    if (!menu || menuOpen) return;
    menuOpen = true;
    menu.classList.add('is-active');
    menu.setAttribute('aria-hidden', 'false');
    burger.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    if (lenis) lenis.stop();
    if (menuTl) menuTl.play(); else menu.style.clipPath = 'inset(0 0 0% 0)';
  }
  function closeMenu() {
    if (!menu || !menuOpen) return;
    menuOpen = false;
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    if (lenis) lenis.start();
    if (menuTl) {
      menuTl.reverse();
      menuTl.eventCallback('onReverseComplete', () => {
        menu.classList.remove('is-active'); menu.setAttribute('aria-hidden', 'true');
      });
    } else {
      menu.style.clipPath = 'inset(0 0 100% 0)';
      menu.classList.remove('is-active'); menu.setAttribute('aria-hidden', 'true');
    }
  }
  if (menu) {
    gsap.set(menu, { clipPath: 'inset(0 0 100% 0)', pointerEvents: 'auto' });
    menuTl = gsap.timeline({ paused: true, defaults: { ease: 'power4.inOut' } })
      .to(menu, { clipPath: 'inset(0 0 0% 0)', duration: reduced ? 0 : 0.65 }, 0)
      .fromTo('.menu__link', { yPercent: 120 }, { yPercent: 0, duration: reduced ? 0 : 0.7, ease: 'power3.out', stagger: reduced ? 0 : 0.055 }, reduced ? 0 : 0.22)
      .fromTo('.menu__foot', { opacity: 0 }, { opacity: 1, duration: reduced ? 0 : 0.45 }, reduced ? 0 : 0.5);
  }
  initMenu();

  /* ── Custom cursor + magnetic ─────────────────────────────── */
  if (finePointer && !reduced) {
    doc.classList.add('has-cursor');
    const dotEl = $('.cursor__dot'), ringEl = $('.cursor__ring');
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; gsap.set(dotEl, { x: mx, y: my }); }, { passive: true });
    gsap.ticker.add(() => { rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16; gsap.set(ringEl, { x: rx, y: ry }); });
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

  /* ── Hero intro ───────────────────────────────────────────── */
  let heroTl = null;
  if (!reduced && $('.gv-hero')) {
    gsap.set('.gv-hero .line__inner', { yPercent: 115 });
    gsap.set(['.gv-breadcrumb', '.gv-hero__eyebrow', '.gv-hero__sub', '.gv-hero__cta .btn'], { y: 26, opacity: 0 });
    gsap.set('.gv-shape', { opacity: 0, scale: 0.6 });
    gsap.set('.nav', { y: -24, opacity: 0 });

    heroTl = gsap.timeline({ paused: true, defaults: { ease: 'power4.out' } })
      .to('.gv-breadcrumb', { y: 0, opacity: 1, duration: 0.7 }, 0)
      .to('.gv-hero__eyebrow', { y: 0, opacity: 1, duration: 0.8 }, 0.08)
      .to('.gv-hero .line__inner', { yPercent: 0, duration: 1.1, stagger: 0.12 }, 0.15)
      .to('.gv-shape', { opacity: 1, scale: 1, duration: 1.3, stagger: 0.08, ease: 'power3.out' }, 0.2)
      .to('.gv-hero__sub', { y: 0, opacity: 1, duration: 0.9 }, 0.5)
      .to('.gv-hero__cta .btn', { y: 0, opacity: 1, duration: 0.8, stagger: 0.09 }, 0.62)
      .to('.nav', { y: 0, opacity: 1, duration: 0.8 }, 0.66);
  }

  /* ── Preloader ────────────────────────────────────────────── */
  const preloader = $('#preloader');
  if (preloader && !reduced) {
    if (lenis) lenis.stop();
    document.body.style.overflow = 'hidden';
    const numEl = $('.preloader__num'), barEl = $('.preloader__bar i');
    const state = { v: 0 };
    gsap.timeline()
      .to(state, {
        v: 100, duration: 1.4, ease: 'power2.inOut',
        onUpdate: () => { const n = Math.round(state.v); if (numEl) numEl.textContent = n; if (barEl) barEl.style.transform = `scaleX(${n / 100})`; },
      })
      .to('.preloader__inner', { yPercent: -36, opacity: 0, duration: 0.45, ease: 'power2.in' }, '+=0.1')
      .to(preloader, {
        yPercent: -100, duration: 0.85, ease: 'power4.inOut',
        onComplete: () => { preloader.remove(); document.body.style.overflow = ''; if (lenis) lenis.start(); ScrollTrigger.refresh(); },
      }, '-=0.1')
      .add(() => heroTl && heroTl.play(), '-=0.5');

    setTimeout(() => {
      if (document.getElementById('preloader')) {
        preloader.remove(); document.body.style.overflow = '';
        if (lenis) lenis.start(); if (heroTl) heroTl.progress(1); ScrollTrigger.refresh();
      }
    }, 8000);
  } else {
    if (preloader) preloader.remove();
    if (heroTl) heroTl.progress(1);
  }

  /* ── Reveals ──────────────────────────────────────────────── */
  if (!reduced) {
    $$('[data-reveal]').forEach(el => {
      gsap.fromTo(el, { y: 40, opacity: 0 }, {
        y: 0, opacity: 1, duration: 1, ease: 'power3.out',
        delay: parseFloat(el.dataset.revealDelay || 0),
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });
  }

  /* ── Counters ─────────────────────────────────────────────── */
  $$('[data-count]').forEach(el => {
    const end = parseInt(el.dataset.count, 10) || 0;
    if (reduced) { el.textContent = end.toLocaleString('en-US'); return; }
    const state = { v: 0 };
    gsap.to(state, {
      v: end, duration: 1.7, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: () => { el.textContent = Math.round(state.v).toLocaleString('en-US'); },
    });
  });

  /* ── Floating hero shapes ─────────────────────────────────── */
  if (!reduced) {
    $$('.gv-shape').forEach((el, i) => {
      gsap.to(el, {
        y: (i % 2 ? 1 : -1) * gsap.utils.random(18, 34),
        x: (i % 2 ? -1 : 1) * gsap.utils.random(10, 22),
        duration: gsap.utils.random(4, 7), ease: 'sine.inOut',
        repeat: -1, yoyo: true, delay: i * 0.2,
      });
    });
    if (finePointer) {
      const hero = $('.gv-hero');
      hero?.addEventListener('mousemove', e => {
        const cx = e.clientX / innerWidth - 0.5, cy = e.clientY / innerHeight - 0.5;
        $$('.gv-shape').forEach((el, i) => {
          const depth = (i + 1) * 6;
          gsap.to(el, { xPercent: cx * depth, yPercent: cy * depth, duration: 0.8, ease: 'power2.out', overwrite: 'auto' });
        });
      }, { passive: true });
    }
  }

  /* ── Timeline progress line ───────────────────────────────── */
  if (!reduced) {
    const line = $('.timeline__line i');
    if (line) {
      gsap.to(line, {
        scaleY: 1, ease: 'none',
        scrollTrigger: { trigger: '.timeline__wrap', start: 'top 65%', end: 'bottom 75%', scrub: 0.6 },
      });
    }
    gsap.utils.toArray('.timeline__num').forEach(num => {
      gsap.fromTo(num, { scale: 0.4, opacity: 0 }, {
        scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(2)',
        scrollTrigger: { trigger: num, start: 'top 85%', once: true },
        onStart: () => { num.style.background = 'var(--blue)'; num.style.color = '#fff'; num.style.borderColor = 'var(--blue)'; },
      });
    });
  }

  /* ── FAQ + lightbox ───────────────────────────────────────── */
  initFaq();
  initLightbox();

  /* ── Refresh triggers ─────────────────────────────────────── */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
