// Experience timeline: scroll animations + expand/collapse
document.addEventListener('DOMContentLoaded', () => {
  const entries = document.querySelectorAll('.timeline-entry');

  entries.forEach((entry, i) => {
    entry.style.transitionDelay = `${i * 0.08}s`;
    if (typeof window.IntersectionObserver !== 'function') {
      entry.classList.add('visible');
    }
  });

  if (typeof window.IntersectionObserver === 'function') {
    // Keep entries visible when the observer API is missing so the page never degrades to an empty timeline.
    const observer = new IntersectionObserver(
      (items) => {
        items.forEach((item) => {
          if (item.isIntersecting) {
            item.target.classList.add('visible');
            observer.unobserve(item.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    entries.forEach((entry) => {
      observer.observe(entry);
    });
  }

  function toggleCard(card) {
    const expanded = !card.classList.contains('expanded');
    card.classList.toggle('expanded', expanded);
    card.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    const hint = card.querySelector('.expand-hint');
    if (hint) {
      hint.textContent = expanded ? 'Click to collapse' : 'Click to expand';
    }
  }

  function isNestedInteractive(target, card) {
    return (
      target instanceof Element &&
      target !== card &&
      !!target.closest('a, button, input, select, textarea, summary')
    );
  }

  // Click to expand/collapse detail text
  document.querySelectorAll('.timeline-card').forEach((card, i) => {
    const detail = card.querySelector('.detail');
    const detailId = detail?.id || `timeline-detail-${i + 1}`;
    if (detail) {
      detail.id = detailId;
    }

    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-expanded', 'false');
    if (detail) {
      card.setAttribute('aria-controls', detailId);
    }

    card.addEventListener('click', (event) => {
      if (isNestedInteractive(event.target, card)) return;
      toggleCard(card);
    });

    card.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      if (isNestedInteractive(event.target, card)) return;
      event.preventDefault();
      toggleCard(card);
    });

    card.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.stopPropagation();
      });
      link.addEventListener('keydown', (event) => {
        event.stopPropagation();
      });
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
});
// [data-count] animation is handled by effects.js to avoid duplicate observers
