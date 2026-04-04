// Experience timeline: scroll animations + expand/collapse
document.addEventListener('DOMContentLoaded', () => {
  const entries = document.querySelectorAll('.timeline-entry');

  // Intersection Observer for scroll-reveal
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

  entries.forEach((entry, i) => {
    entry.style.transitionDelay = `${i * 0.08}s`;
    observer.observe(entry);
  });

  // Click to expand/collapse detail text
  document.querySelectorAll('.timeline-card').forEach((card) => {
    card.addEventListener('click', () => {
      card.classList.toggle('expanded');
      const hint = card.querySelector('.expand-hint');
      if (hint) {
        hint.textContent = card.classList.contains('expanded')
          ? 'Click to collapse'
          : 'Click to expand';
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
});
// [data-count] animation is handled by effects.js to avoid duplicate observers
