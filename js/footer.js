const DEFAULT_NAV_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/experience', label: 'Experience' },
  { href: '/writing', label: 'Writing' },
  { href: '/press', label: 'Press' },
  { href: '/now', label: 'Now' },
  { href: '/resume', label: 'Resume' },
  { href: '/racecalls', label: 'Race Calls' }
];

const footer = document.querySelector('.site-footer');
if (footer) {
  const siteData = window.SITE_DATA || {};
  const navItems = Array.isArray(siteData.navLinks) && siteData.navLinks.length ? siteData.navLinks : DEFAULT_NAV_LINKS;

  footer.innerHTML = `
    <div class="footer-inner">
      <div class="footer-left">
        <div class="footer-name">Ryan McComb</div>
        <div class="footer-meta">Evanston, IL &middot; <a href="mailto:rymccomb1@icloud.com">rymccomb1@icloud.com</a></div>
      </div>
      <nav class="footer-links" aria-label="Footer navigation">
        ${navItems.map(item => `<a href="${item.href}">${item.label}</a>`).join('')}
      </nav>
    </div>
    <div class="footer-copy">&copy; 2026 Ryan McComb</div>
  `;
}
