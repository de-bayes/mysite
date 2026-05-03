const NAV_NAME_STICKY_KEY = 'nav-name-sticky-open';
const NAV_NAME_STICKY_MAX_AGE_MS = 10000;

document.documentElement.setAttribute('data-nav-ready', '');

function normalizeNavPath(pathname) {
  if (!pathname || pathname === '/index.html') return '/';
  if (pathname.length > 1 && pathname.endsWith('/')) return pathname.slice(0, -1);
  return pathname;
}

function readNavNameStickyStorage() {
  try {
    const raw = sessionStorage.getItem(NAV_NAME_STICKY_KEY);
    if (raw == null || raw === '') return false;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (typeof parsed.path !== 'string' || typeof parsed.ts !== 'number') return null;
    if (Date.now() - parsed.ts > NAV_NAME_STICKY_MAX_AGE_MS) return null;
    return { path: normalizeNavPath(parsed.path), ts: parsed.ts };
  } catch {
    return null;
  }
}

function removeNavNameStickyHintAttr() {
  document.documentElement.removeAttribute('data-nav-name-sticky');
}

function clearNavNameSticky() {
  removeNavNameStickyHintAttr();
  try {
    sessionStorage.removeItem(NAV_NAME_STICKY_KEY);
  } catch {
    /* ignore */
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('site-nav');
  if (!nav) return;

  const prefersReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const main = document.querySelector('main');

  const navName = nav.querySelector('a.nav-name');
  if (navName) {
    let logoNavInProgress = false;
    let logoNavInProgressTimer = 0;

    /** Longer than delayed navigation (160ms) so slow loads do not clear sticky early. */
    const LOGO_NAV_GUARD_MS = 3500;

    function setLogoNavInProgress(on) {
      if (logoNavInProgressTimer) {
        clearTimeout(logoNavInProgressTimer);
        logoNavInProgressTimer = 0;
      }
      logoNavInProgress = on;
      if (on) {
        logoNavInProgressTimer = window.setTimeout(() => {
          logoNavInProgress = false;
          logoNavInProgressTimer = 0;
        }, LOGO_NAV_GUARD_MS);
      }
    }

    window.addEventListener('pagehide', () => {
      setLogoNavInProgress(false);
    });

    function disarmNavNameStickyUi() {
      navName.classList.remove('nav-name--sticky-open');
      clearNavNameSticky();
    }

    function applyNavNameStickyFromStorage() {
      const sticky = readNavNameStickyStorage();
      if (!sticky) {
        removeNavNameStickyHintAttr();
        navName.classList.remove('nav-name--sticky-open');
        return;
      }
      if (sticky.path !== normalizeNavPath(window.location.pathname)) {
        removeNavNameStickyHintAttr();
        navName.classList.remove('nav-name--sticky-open');
        return;
      }
      navName.classList.add('nav-name--sticky-open');
      // One-navigation handoff: keep the UI open on the destination page, but do not let
      // sessionStorage re-arm it on unrelated later navigations or Back/forward restores.
      clearNavNameSticky();
      removeNavNameStickyHintAttr();
    }

    applyNavNameStickyFromStorage();

    window.addEventListener(
      'pageshow',
      () => {
        setLogoNavInProgress(false);
        applyNavNameStickyFromStorage();
      },
      { passive: true }
    );

    function shouldIgnoreNavNameStickyArm(e) {
      return e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
    }

    // Capture so storage is set before other handlers. logoNavInProgress blocks leave events from
    // clearing storage while the delayed navigation runs (pointer may move to another nav link).
    navName.addEventListener(
      'click',
      (e) => {
        if (shouldIgnoreNavNameStickyArm(e)) return;
        const href = navName.getAttribute('href') || '/';
        setLogoNavInProgress(true);
        navName.classList.add('nav-name--sticky-open');
        try {
          sessionStorage.setItem(
            NAV_NAME_STICKY_KEY,
            JSON.stringify({ path: normalizeNavPath(href), ts: Date.now() })
          );
        } catch {
          /* ignore */
        }
      },
      true
    );

    function navLinkFromEventTarget(target) {
      return target instanceof Element ? target.closest('a') : null;
    }

    nav.addEventListener(
      'click',
      (e) => {
        if (!readNavNameStickyStorage()) return;
        const a = navLinkFromEventTarget(e.target);
        if (!a || !nav.contains(a) || navName.contains(a)) return;
        disarmNavNameStickyUi();
      },
      true
    );

    nav.addEventListener('focusin', (e) => {
      if (!readNavNameStickyStorage()) return;
      const t = e.target;
      if (t instanceof Node && navName.contains(t)) return;
      disarmNavNameStickyUi();
    });

    document.addEventListener(
      'click',
      (e) => {
        if (!readNavNameStickyStorage()) return;
        const t = e.target;
        if (t instanceof Node && nav.contains(t)) return;
        disarmNavNameStickyUi();
      },
      true
    );

    function onPointerLeaveNavName() {
      if (logoNavInProgress) return;
      disarmNavNameStickyUi();
    }

    navName.addEventListener('mouseleave', onPointerLeaveNavName);
    navName.addEventListener('pointerleave', onPointerLeaveNavName);
  }

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

  // Nav markup comes from HTML templates, not innerHTML in this file.

  // Hamburger: disclosure pattern + focus trap
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

    links.querySelectorAll('a').forEach((a) => {
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

  // Nav shadow when scrolled (home keeps nav in flow, not fixed)
  if (!document.body.classList.contains('home')) {
    window.addEventListener(
      'scroll',
      () => {
        nav.classList.toggle('scrolled', window.scrollY > 10);
      },
      { passive: true }
    );
  }

  nav.querySelectorAll('a[href^="/#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const hash = a.getAttribute('href').replace('/', '');
      const target = document.querySelector(hash);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: prefersReduceMotion ? 'auto' : 'smooth' });
      }
    });
  });

  // Fade between pages when the browser does not do cross-document view transitions (CSS handles those).
  const hasCrossDocVT = 'onpagereveal' in window;

  if (!hasCrossDocVT && !prefersReduceMotion) {
    document.body.classList.add('page-enter');
    setTimeout(() => document.body.classList.remove('page-enter'), 300);

    nav.querySelectorAll('a').forEach((a) => {
      const href = a.getAttribute('href');
      // Same-site only: do not delay external navigations with the exit animation.
      if (!href || href.startsWith('/#') || href.startsWith('http')) return;
      if (href.startsWith('/') || href.endsWith('.html')) {
        a.addEventListener('click', (e) => {
          e.preventDefault();
          document.body.classList.add('page-exit');
          setTimeout(() => {
            window.location.href = href;
          }, 160);
        });
      }
    });
  }
});
