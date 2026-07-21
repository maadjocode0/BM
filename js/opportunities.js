/* ═══════════════════════════════════════════════════════════════
   Opportunities listing — filtering + staggered reveal.
   Depends on window.AZ (js/site-core.js) for shared chrome.
   ═══════════════════════════════════════════════════════════════ */
(() => {
  'use strict';
  const { $, $$, reduced } = window.AZ;

  /* Hero intro (played after preloader) */
  const heroIntro = () => {
    if (!window.gsap) return null;
    gsap.set(['.opps-breadcrumb', '.opps-hero__eyebrow', '.opps-hero__title', '.opps-hero__sub', '.opps-stats > div'], { y: 26, opacity: 0 });
    gsap.set('.nav', { y: -24, opacity: 0 });
    return gsap.timeline({ paused: true, defaults: { ease: 'power4.out' } })
      .to('.opps-breadcrumb', { y: 0, opacity: 1, duration: 0.7 }, 0)
      .to('.opps-hero__eyebrow', { y: 0, opacity: 1, duration: 0.7 }, 0.08)
      .to('.opps-hero__title', { y: 0, opacity: 1, duration: 0.9 }, 0.16)
      .to('.opps-hero__sub', { y: 0, opacity: 1, duration: 0.8 }, 0.32)
      .to('.opps-stats > div', { y: 0, opacity: 1, duration: 0.7, stagger: 0.08 }, 0.42)
      .to('.nav', { y: 0, opacity: 1, duration: 0.8 }, 0.4);
  };

  window.AZ.init({ heroIntro });

  /* ── Filtering ────────────────────────────────────────────── */
  const cards = $$('[data-opp]');
  const grid = $('#oppGrid');
  const countEl = $('#oppCount');
  const emptyEl = $('#oppEmpty');
  const search = $('#oppSearch');
  const countrySel = $('#oppCountry');
  const durationSel = $('#oppDuration');
  const chips = $$('[data-sdg-filter]');

  const state = { sdg: 'all', country: 'all', duration: 'all', q: '' };

  function apply() {
    let shown = 0;
    cards.forEach(card => {
      const ok =
        (state.sdg === 'all' || card.dataset.sdg === state.sdg) &&
        (state.country === 'all' || card.dataset.country === state.country) &&
        (state.duration === 'all' || card.dataset.duration === state.duration) &&
        (!state.q || card.dataset.name.toLowerCase().includes(state.q));
      if (ok) {
        const wasHidden = card.hidden;
        card.hidden = false;
        card.style.display = '';
        if (wasHidden && window.gsap && !reduced) {
          gsap.fromTo(card, { opacity: 0, scale: 0.94, y: 14 }, { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'power3.out' });
        }
        shown++;
      } else {
        card.hidden = true;
        card.style.display = 'none';
      }
    });
    if (countEl) countEl.innerHTML = `<b>${shown}</b> ${shown === 1 ? 'opportunity' : 'opportunities'}`;
    if (emptyEl) emptyEl.hidden = shown !== 0;
  }

  chips.forEach(chip => chip.addEventListener('click', () => {
    chips.forEach(c => c.classList.remove('is-active'));
    chip.classList.add('is-active');
    state.sdg = chip.dataset.sdgFilter;
    apply();
  }));
  countrySel && countrySel.addEventListener('change', () => { state.country = countrySel.value; apply(); });
  durationSel && durationSel.addEventListener('change', () => { state.duration = durationSel.value; apply(); });

  let t;
  search && search.addEventListener('input', () => {
    clearTimeout(t);
    t = setTimeout(() => { state.q = search.value.trim().toLowerCase(); apply(); }, 140);
  });
})();
