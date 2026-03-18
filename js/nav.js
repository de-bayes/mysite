// Shared navigation logic
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('site-nav');
  if (!nav) return;

  nav.innerHTML = `
    <a href="/" class="nav-name"><span class="brace">{</span><span class="ni">R</span><span class="nx nx1">yan</span><span class="nx nx2"> </span><span class="ni">J</span><span class="nx nx3">.</span><span class="nx nx4"> </span><span class="ni">M</span><span class="nx nx5">c</span><span class="ni">C</span><span class="nx nx6">omb</span><span class="brace">}</span></a>
    <button class="nav-hamburger" aria-label="Menu"><span></span><span></span><span></span></button>
    <div class="nav-links">
      <a href="/about">About</a>
      <a href="/experience">Experience</a>
      <a href="/writing">Writing</a>
      <a href="/press">Press</a>
      <a href="/now">Now</a>
    </div>
  `;

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
      hamburger.classList.toggle('open');
    });

    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        links.classList.remove('open');
        hamburger.classList.remove('open');
      });
    });
  }

  // Scroll shadow on nav
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });

  // Smooth scroll for anchor links on same page
  nav.querySelectorAll('a[href^="/#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const hash = a.getAttribute('href').replace('/', '');
      const target = document.querySelector(hash);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Page transitions
  // Browsers with cross-document View Transitions handle this via CSS @view-transition.
  // For all others, fade out the content (not the nav) before navigating,
  // and fade in on the new page.
  const hasCrossDocVT = 'onpagereveal' in window;

  if (!hasCrossDocVT) {
    // Entry animation on page load
    document.body.classList.add('page-enter');
    setTimeout(() => document.body.classList.remove('page-enter'), 300);

    // Exit animation on nav clicks
    nav.querySelectorAll('a').forEach(a => {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('/#') || href.startsWith('http')) return;
      if (href.startsWith('/') || href.endsWith('.html')) {
        a.addEventListener('click', (e) => {
          e.preventDefault();
          document.body.classList.add('page-exit');
          setTimeout(() => { window.location.href = href; }, 160);
        });
      }
    });
  }
});
