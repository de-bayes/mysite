// effects.js: Interactive effects
(function () {
  'use strict';
  const isMobile = window.matchMedia('(hover: none)').matches;

  // ===== NUMBER COUNTER: Animate data-count values on scroll =====
  function initCounters() {
    const els = document.querySelectorAll('[data-count]');
    if (!els.length) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const dec = (el.dataset.count.split('.')[1] || '').length;
        if (reduceMotion) {
          el.textContent = target.toFixed(dec);
          obs.unobserve(el);
          return;
        }
        const start = performance.now();
        const dur = 1400;
        (function tick(now) {
          const t = Math.min((now - start) / dur, 1);
          el.textContent = (target * (1 - Math.pow(1 - t, 4))).toFixed(dec);
          if (t < 1) requestAnimationFrame(tick);
        })(start);
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });
    els.forEach(el => obs.observe(el));
  }

  // ===== INIT =====
  document.addEventListener('DOMContentLoaded', () => {
    initCounters();
  });
})();
