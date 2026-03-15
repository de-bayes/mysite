// Shared navigation logic
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('site-nav');
  if (!nav) return;

  nav.innerHTML = `
    <a href="/" class="nav-name"><span class="brace">{</span><span class="ni">R</span><span class="nx nx1">yan</span><span class="nx nx2"> </span><span class="ni">J</span><span class="nx nx3">.</span><span class="nx nx4"> </span><span class="ni">M</span><span class="nx nx5">c</span><span class="ni">C</span><span class="nx nx6">omb</span><span class="brace">}</span></a>
    <button class="nav-hamburger" aria-label="Menu">&#9776;</button>
    <div class="nav-links">
      <a href="/about">About</a>
      <a href="/experience">Experience</a>
      <a href="/projects">Projects</a>
      <a href="/writing">Writing</a>
      <a href="/contact">Contact</a>
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
    });

    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => links.classList.remove('open'));
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

  // Page transition on nav clicks (non-anchor links)
  nav.querySelectorAll('a').forEach(a => {
    const href = a.getAttribute('href');
    if (href.startsWith('/#')) return; // handled above
    if (href.startsWith('/') || href.endsWith('.html')) {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.2s ease';
        setTimeout(() => {
          window.location.href = href;
        }, 200);
      });
    }
  });
});
