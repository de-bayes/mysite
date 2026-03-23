const DEFAULT_NAV_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/experience', label: 'Experience' },
  { href: '/writing', label: 'Writing' },
  { href: '/press', label: 'Press' },
  { href: '/now', label: 'Now' }
];

// Shared navigation logic
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('site-nav');
  if (!nav) return;

  const prefersReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const siteData = window.SITE_DATA || {};
  const navItems = Array.isArray(siteData.navLinks) && siteData.navLinks.length ? siteData.navLinks : DEFAULT_NAV_LINKS;
  const main = document.querySelector('main');

  if (main && !main.id) {
    main.id = 'main-content';
  }

  if (!document.querySelector('.skip-link') && main) {
    const skipLink = document.createElement('a');
    skipLink.className = 'skip-link';
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to content';
    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  nav.innerHTML = `
    <a href="/" class="nav-name"><span class="brace">{</span><span class="ni">R</span><span class="nx nx1">yan</span><span class="nx nx2"> </span><span class="ni">J</span><span class="nx nx3">.</span><span class="nx nx4"> </span><span class="ni">M</span><span class="nx nx5">c</span><span class="ni">C</span><span class="nx nx6">omb</span><span class="brace">}</span></a>
    <button type="button" class="nav-hamburger" aria-label="Open menu" aria-controls="nav-menu" aria-expanded="false"><span></span><span></span><span></span></button>
    <div class="nav-links" id="nav-menu" role="navigation" aria-label="Site">
      ${navItems.map(item => `<a href="${item.href}">${item.label}</a>`).join('')}
    </div>
  `;

  // Highlight current page
  const path = window.location.pathname;
  const page = path === '/' ? '/' : path.replace(/\.html$/, '').replace(/\/$/, '');
  nav.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href').replace(/\.html$/, '').replace(/\/$/, '');
    if (href === page || (href !== '/' && page.startsWith(href + '/')) || (page === '' && href === '/')) {
      a.classList.add('active');
    }
  });

  // Mobile hamburger toggle (accessible disclosure pattern)
  const hamburger = nav.querySelector('.nav-hamburger');
  const links = nav.querySelector('.nav-links');
  const navLinks = () => Array.from(links.querySelectorAll('a'));

  function setMenuOpen(open) {
    if (!hamburger || !links) return;
    links.classList.toggle('open', open);
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    hamburger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (!open) {
      document.removeEventListener('keydown', onMenuKeydown);
    }
  }

  function focusTrap(e) {
    if (!links.classList.contains('open')) return;
    const focusables = [hamburger, ...navLinks()];
    const i = focusables.indexOf(document.activeElement);
    if (i < 0) return;
    if (e.key === 'Tab') {
      if (e.shiftKey && i === 0) {
        e.preventDefault();
        focusables[focusables.length - 1].focus();
      } else if (!e.shiftKey && i === focusables.length - 1) {
        e.preventDefault();
        focusables[0].focus();
      }
    }
  }

  function onMenuKeydown(e) {
    if (e.key === 'Escape') {
      setMenuOpen(false);
      hamburger.focus();
      return;
    }
    focusTrap(e);
  }

  if (hamburger && links) {
    hamburger.addEventListener('click', () => {
      const willOpen = !links.classList.contains('open');
      setMenuOpen(willOpen);
      if (willOpen) {
        document.addEventListener('keydown', onMenuKeydown);
        const first = navLinks()[0];
        if (first) first.focus();
      }
    });

    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        setMenuOpen(false);
      });
    });

    document.addEventListener('click', (e) => {
      if (links.classList.contains('open') && !nav.contains(e.target)) {
        setMenuOpen(false);
      }
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
        target.scrollIntoView({ behavior: prefersReduceMotion ? 'auto' : 'smooth' });
      }
    });
  });

  // Page transitions
  // Browsers with cross-document View Transitions handle this via CSS @view-transition.
  // For all others, fade out the content (not the nav) before navigating,
  // and fade in on the new page.
  const hasCrossDocVT = 'onpagereveal' in window;

  if (!hasCrossDocVT && !prefersReduceMotion) {
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
