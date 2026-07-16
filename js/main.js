/* ═══════════════════════════════════════════════════════════════
   AIESEC in Zagazig — interactions
   Lenis smooth scroll · GSAP storytelling · dot-globe canvas
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

  /* ── Graceful fallback if CDNs failed ─────────────────────── */
  if (!window.gsap || !window.ScrollTrigger) {
    doc.classList.add('reduced');
    $('#preloader')?.remove();
    $$('[data-count]').forEach(el => { el.textContent = (+el.dataset.count).toLocaleString('en-US'); });
    initMenu(null);
    initStoriesRail();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  if (reduced) doc.classList.add('reduced');

  /* ── Smooth scroll (Lenis) ────────────────────────────────── */
  let lenis = null;
  if (window.Lenis && !reduced) {
    lenis = new Lenis({
      duration: 1.15,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  const scrollToTarget = target => {
    if (lenis) lenis.scrollTo(target, { offset: -70, duration: 1.35 });
    else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  };

  /* ── Anchor navigation ────────────────────────────────────── */
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

  /* ── Nav state on scroll ──────────────────────────────────── */
  const nav = $('.nav');
  const onScroll = () => nav && nav.classList.toggle('nav--scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Fullscreen menu ──────────────────────────────────────── */
  let menuOpen = false;
  let menuTl = null;
  const menu = $('#menu');
  const burger = $('.nav__burger');

  function initMenu(tl) {
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
    burger.setAttribute('aria-label', 'Close menu');
    if (lenis) lenis.stop();
    if (menuTl) menuTl.play();
    else menu.style.clipPath = 'inset(0 0 0% 0)';
  }

  function closeMenu() {
    if (!menu || !menuOpen) return;
    menuOpen = false;
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
    if (lenis) lenis.start();
    if (menuTl) {
      menuTl.reverse();
      menuTl.eventCallback('onReverseComplete', () => {
        menu.classList.remove('is-active');
        menu.setAttribute('aria-hidden', 'true');
      });
    } else {
      menu.style.clipPath = 'inset(0 0 100% 0)';
      menu.classList.remove('is-active');
      menu.setAttribute('aria-hidden', 'true');
    }
  }

  if (menu) {
    gsap.set(menu, { clipPath: 'inset(0 0 100% 0)', pointerEvents: 'auto' });
    menuTl = gsap.timeline({ paused: true, defaults: { ease: 'power4.inOut' } })
      .to(menu, { clipPath: 'inset(0 0 0% 0)', duration: reduced ? 0 : 0.65 }, 0)
      .fromTo('.menu__link', { yPercent: 120 }, {
        yPercent: 0, duration: reduced ? 0 : 0.7, ease: 'power3.out', stagger: reduced ? 0 : 0.055,
      }, reduced ? 0 : 0.22)
      .fromTo('.menu__foot', { opacity: 0 }, { opacity: 1, duration: reduced ? 0 : 0.45 }, reduced ? 0 : 0.5);
  }
  initMenu(menuTl);

  /* ── Custom cursor + magnetic buttons ─────────────────────── */
  if (finePointer && !reduced) {
    doc.classList.add('has-cursor');
    const dotEl = $('.cursor__dot');
    const ringEl = $('.cursor__ring');
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    window.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      gsap.set(dotEl, { x: mx, y: my });
    }, { passive: true });
    gsap.ticker.add(() => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      gsap.set(ringEl, { x: rx, y: ry });
    });
    const HOVERABLE = 'a, button, [data-magnetic]';
    document.addEventListener('mouseover', e => {
      if (e.target.closest(HOVERABLE)) doc.classList.add('cursor-hover');
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest(HOVERABLE)) doc.classList.remove('cursor-hover');
    });

    $$('[data-magnetic]').forEach(el => {
      const strength = 18;
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        gsap.to(el, {
          x: ((e.clientX - r.left) / r.width - 0.5) * strength,
          y: ((e.clientY - r.top) / r.height - 0.5) * strength,
          duration: 0.4, ease: 'power3.out',
        });
      });
      el.addEventListener('mouseleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.45)' });
      });
    });
  }

  /* ── Hero intro timeline (played after preloader) ─────────── */
  let heroTl = null;
  if (!reduced) {
    gsap.set('.hero .line__inner', { yPercent: 115 });
    gsap.set(['.hero__eyebrow', '.hero__sub', '.hero__cta .btn', '.hero__hint'], { y: 26, opacity: 0 });
    gsap.set('.hero__globe', { opacity: 0, scale: 0.94 });
    gsap.set('.nav', { y: -24, opacity: 0 });

    heroTl = gsap.timeline({ paused: true, defaults: { ease: 'power4.out' } })
      .to('.hero .line__inner', { yPercent: 0, duration: 1.15, stagger: 0.12 }, 0)
      .to('.hero__eyebrow', { y: 0, opacity: 1, duration: 0.8 }, 0.15)
      .to('.hero__globe', { opacity: 1, scale: 1, duration: 1.5, ease: 'power3.out' }, 0.2)
      .to('.hero__sub', { y: 0, opacity: 1, duration: 0.9 }, 0.42)
      .to('.hero__cta .btn', { y: 0, opacity: 1, duration: 0.8, stagger: 0.09 }, 0.55)
      .to('.nav', { y: 0, opacity: 1, duration: 0.8 }, 0.6)
      .to('.hero__hint', { y: 0, opacity: 1, duration: 0.8 }, 0.85);
  }

  /* ── Preloader ────────────────────────────────────────────── */
  const preloader = $('#preloader');
  if (preloader && !reduced) {
    if (lenis) lenis.stop();
    document.body.style.overflow = 'hidden';
    const numEl = $('.preloader__num');
    const barEl = $('.preloader__bar i');
    const state = { v: 0 };

    gsap.timeline()
      .to(state, {
        v: 100, duration: 1.55, ease: 'power2.inOut',
        onUpdate: () => {
          const n = Math.round(state.v);
          if (numEl) numEl.textContent = n;
          if (barEl) barEl.style.transform = `scaleX(${n / 100})`;
        },
      })
      .to('.preloader__inner', { yPercent: -36, opacity: 0, duration: 0.45, ease: 'power2.in' }, '+=0.12')
      .to(preloader, {
        yPercent: -100, duration: 0.85, ease: 'power4.inOut',
        onComplete: () => {
          preloader.remove();
          document.body.style.overflow = '';
          if (lenis) lenis.start();
          ScrollTrigger.refresh();
        },
      }, '-=0.1')
      .add(() => heroTl && heroTl.play(), '-=0.5');

    // Failsafe: never trap users behind the intro (throttled/background tabs)
    setTimeout(() => {
      if (document.getElementById('preloader')) {
        preloader.remove();
        document.body.style.overflow = '';
        if (lenis) lenis.start();
        if (heroTl) heroTl.progress(1);
        ScrollTrigger.refresh();
      }
    }, 8000);
  } else {
    if (preloader) preloader.remove();
    if (heroTl) heroTl.progress(1);
  }

  /* ── Generic scroll reveals ───────────────────────────────── */
  if (!reduced) {
    $$('[data-reveal]').forEach(el => {
      gsap.fromTo(el,
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1, ease: 'power3.out',
          delay: parseFloat(el.dataset.revealDelay || 0),
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
    });
  }

  /* ── Manifesto word-by-word reveal ────────────────────────── */
  if (!reduced) {
    $$('[data-words]').forEach(p => {
      const text = p.textContent.trim().replace(/\s+/g, ' ');
      p.setAttribute('aria-label', text);
      p.textContent = '';
      const words = text.split(' ').map(w => {
        const s = document.createElement('span');
        s.className = 'word';
        s.textContent = w;
        s.setAttribute('aria-hidden', 'true');
        p.append(s, ' ');
        return s;
      });
      gsap.fromTo(words, { opacity: 0.13 }, {
        opacity: 1, stagger: 0.035, ease: 'none',
        scrollTrigger: { trigger: p, start: 'top 80%', end: 'bottom 46%', scrub: true },
      });
    });
  }

  /* ── Programs: pinned horizontal gallery (desktop) ────────── */
  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
    const track = $('.programs__track');
    const progress = $('.programs__progress i');
    if (!track) return;
    const amount = () => Math.max(0, track.scrollWidth - window.innerWidth);
    gsap.to(track, {
      x: () => -amount(),
      ease: 'none',
      scrollTrigger: {
        trigger: '#programs',
        start: 'top top',
        end: () => '+=' + amount(),
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: self => {
          if (progress) progress.style.transform = `scaleX(${self.progress})`;
        },
      },
    });
  });

  /* ── Impact counters ──────────────────────────────────────── */
  $$('[data-count]').forEach(el => {
    const end = parseInt(el.dataset.count, 10) || 0;
    if (reduced) { el.textContent = end.toLocaleString('en-US'); return; }
    const state = { v: 0 };
    gsap.to(state, {
      v: end, duration: 1.9, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      onUpdate: () => { el.textContent = Math.round(state.v).toLocaleString('en-US'); },
    });
  });

  /* ── CTA line reveal ──────────────────────────────────────── */
  if (!reduced) {
    const ctaLines = $$('[data-cta-line]');
    if (ctaLines.length) {
      gsap.set(ctaLines, { yPercent: 115 });
      gsap.to(ctaLines, {
        yPercent: 0, duration: 1.1, stagger: 0.12, ease: 'power4.out',
        scrollTrigger: { trigger: '.cta', start: 'top 72%', once: true },
      });
    }
  }

  /* ── Stories rail ─────────────────────────────────────────── */
  function initStoriesRail() {
    const rail = $('.stories__rail');
    if (!rail) return;
    const step = () => Math.min(rail.clientWidth * 0.72, 480);
    $('.stories__btn--prev')?.addEventListener('click', () =>
      rail.scrollBy({ left: -step(), behavior: reduced ? 'auto' : 'smooth' }));
    $('.stories__btn--next')?.addEventListener('click', () =>
      rail.scrollBy({ left: step(), behavior: reduced ? 'auto' : 'smooth' }));
  }
  initStoriesRail();

  /* ── Dot-globe canvas ─────────────────────────────────────── */
  (function initGlobe() {
    const canvas = $('#globe-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const wrap = canvas.parentElement;

    const COUNT = 620;
    const GA = Math.PI * (3 - Math.sqrt(5));
    const pts = [];
    for (let i = 0; i < COUNT; i++) {
      const y = 1 - (i / (COUNT - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const t = GA * i;
      pts.push([Math.cos(t) * r, y, Math.sin(t) * r]);
    }
    // "exchange" pings that pulse from points on the sphere
    const pulses = [42, 150, 265, 380, 505].map((idx, i) => ({ idx, t: i * 0.22 }));
    const PULSE_COLORS = ['#037EF3', '#0CB9C1', '#F85A40', '#FFC845', '#00C16E'];

    let W = 0, H = 0, R = 0, cx = 0, cy = 0;
    let rot = 0, raf = null, running = false;
    let mxT = 0, myT = 0, mx = 0, my = 0;

    function resize() {
      const b = wrap.getBoundingClientRect();
      if (!b.width) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = b.width; H = b.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = W / 2; cy = H / 2;
      R = Math.min(W, H) * 0.42;
    }

    function project(p, cosR, sinR, cosT, sinT) {
      const x = p[0] * cosR + p[2] * sinR;
      const z = -p[0] * sinR + p[2] * cosR;
      const y = p[1] * cosT - z * sinT;
      const z2 = p[1] * sinT + z * cosT;
      return [cx + x * R, cy + y * R, z2];
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      rot += 0.0022;
      mx += (mxT - mx) * 0.04;
      my += (myT - my) * 0.04;

      const ry = rot + mx * 0.35;
      const tx = -0.32 + my * 0.18;
      const cosR = Math.cos(ry), sinR = Math.sin(ry);
      const cosT = Math.cos(tx), sinT = Math.sin(tx);

      for (let i = 0; i < COUNT; i++) {
        const [sx, sy, z] = project(pts[i], cosR, sinR, cosT, sinT);
        const depth = (z + 1) / 2; // 0 = back, 1 = front
        const alpha = 0.06 + depth * 0.58;
        const size = 0.55 + depth * 1.45;
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 187, 255, ${alpha})`;
        ctx.fill();
      }

      pulses.forEach((pl, i) => {
        pl.t += 0.0065;
        if (pl.t > 1) { pl.t = 0; pl.idx = (pl.idx + 97) % COUNT; }
        const [sx, sy, z] = project(pts[pl.idx], cosR, sinR, cosT, sinT);
        if (z < 0.05) return;
        const col = PULSE_COLORS[i % PULSE_COLORS.length];
        ctx.beginPath();
        ctx.arc(sx, sy, 2.4, 0, Math.PI * 2);
        ctx.fillStyle = col;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(sx, sy, 3 + pl.t * 26, 0, Math.PI * 2);
        ctx.strokeStyle = col + Math.round((1 - pl.t) * 140).toString(16).padStart(2, '0');
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });
    }

    function frame() {
      draw();
      raf = requestAnimationFrame(frame);
    }
    function start() {
      if (running || reduced) return;
      running = true;
      raf = requestAnimationFrame(frame);
    }
    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
    }

    resize();
    if (reduced) { draw(); } // single static frame
    else {
      const io = new IntersectionObserver(
        entries => entries.forEach(en => (en.isIntersecting ? start() : stop())),
        { threshold: 0.02 }
      );
      io.observe(wrap);
      if (finePointer) {
        $('.hero')?.addEventListener('mousemove', e => {
          mxT = (e.clientX / innerWidth - 0.5);
          myT = (e.clientY / innerHeight - 0.5);
        }, { passive: true });
      }
    }
    new ResizeObserver(() => { resize(); if (reduced) draw(); }).observe(wrap);
  })();

  /* ── Refresh triggers once fonts settle ───────────────────── */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
