// Scroll-triggered animations
document.addEventListener('DOMContentLoaded', () => {
  const els = document.querySelectorAll('.animate-in, .stagger-children');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    els.forEach((el) => el.classList.add('visible'));
    return;
  }

  if (typeof window.IntersectionObserver !== 'function') {
    els.forEach((el) => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    {
      threshold: 0.08,
      rootMargin: '0px 0px -30px 0px',
    }
  );

  els.forEach((el) => observer.observe(el));
});
