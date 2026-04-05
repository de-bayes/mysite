/* Runs in <head> without defer so the hint exists before the body paints. Keep key in sync with nav.js. */
(function () {
  document.documentElement.setAttribute('data-js', '');

  function normalizeNavPath(pathname) {
    if (!pathname || pathname === '/index.html') return '/';
    if (pathname.length > 1 && pathname.endsWith('/')) return pathname.slice(0, -1);
    return pathname;
  }

  try {
    var raw = window.sessionStorage.getItem('nav-name-sticky-open');
    if (!raw) return;
    var parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return;
    if (typeof parsed.path !== 'string' || typeof parsed.ts !== 'number') return;
    if (Date.now() - parsed.ts > 10000) return;
    if (normalizeNavPath(parsed.path) !== normalizeNavPath(window.location.pathname)) return;
    document.documentElement.setAttribute('data-nav-name-sticky', '');
  } catch {
    /* private mode or invalid JSON */
  }
})();
