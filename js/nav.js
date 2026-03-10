// Shared navigation logic
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.site-nav');
  if (!nav) return;

  // Highlight current page
  const path = window.location.pathname;
  const page = path === '/' ? '/' : path.replace(/\.html$/, '').replace(/\/$/, '');
  nav.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href').replace(/\.html$/, '').replace(/\/$/, '');
    if (href === page || (page === '' && href === '/')) {
      a.classList.add('active');
    }
  });

  // Mobile hamburger toggle
  const hamburger = nav.querySelector('.nav-hamburger');
  const links = nav.querySelector('.nav-links');
  if (hamburger && links) {
    hamburger.addEventListener('click', () => {
      links.classList.toggle('open');
    });

    // Close menu when clicking a link
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => links.classList.remove('open'));
    });
  }

  // Smooth page transition on nav clicks
  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href.startsWith('/') || href.endsWith('.html')) {
        e.preventDefault();
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.2s ease';
        setTimeout(() => {
          window.location.href = href;
        }, 200);
      }
    });
  });
});
