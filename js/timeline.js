// Experience timeline — scroll animations + expand/collapse
document.addEventListener('DOMContentLoaded', () => {
  const entries = document.querySelectorAll('.timeline-entry');

  // Intersection Observer for scroll-reveal
  const observer = new IntersectionObserver((items) => {
    items.forEach(item => {
      if (item.isIntersecting) {
        item.target.classList.add('visible');
        observer.unobserve(item.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  entries.forEach((entry, i) => {
    entry.style.transitionDelay = `${i * 0.08}s`;
    observer.observe(entry);
  });

  // Click to expand/collapse detail text
  document.querySelectorAll('.timeline-card').forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('expanded');
      const hint = card.querySelector('.expand-hint');
      if (hint) {
        hint.textContent = card.classList.contains('expanded') ? 'Click to collapse' : 'Click to expand';
      }
    });
  });

  // Animate timeline line drawing
  const line = document.querySelector('.timeline-line');
  if (line) {
    line.style.transformOrigin = 'top';
    line.style.transform = 'scaleY(0)';
    line.style.transition = 'transform 1.2s ease';
    requestAnimationFrame(() => {
      line.style.transform = 'scaleY(1)';
    });
  }

  // Education section stats counter
  const statEls = document.querySelectorAll('[data-count]');
  if (statEls.length) {
    const statObserver = new IntersectionObserver((items) => {
      items.forEach(item => {
        if (item.isIntersecting) {
          animateCount(item.target);
          statObserver.unobserve(item.target);
        }
      });
    }, { threshold: 0.5 });

    statEls.forEach(el => statObserver.observe(el));
  }

  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const decimals = (target % 1 !== 0) ? 2 : 0;
    const duration = 1200;
    const start = performance.now();

    function step(now) {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3); // ease-out cubic
      const val = (target * ease).toFixed(decimals);
      el.textContent = val;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
});
