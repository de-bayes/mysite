const footer = document.querySelector('.site-footer');
if (footer) {
  const siteData = window.SITE_DATA || {};
  const navItems = Array.isArray(siteData.navLinks) && siteData.navLinks.length
    ? siteData.navLinks
    : [
        { href: '/about', label: 'About' },
        { href: '/experience', label: 'Experience' },
        { href: '/writing', label: 'Writing' },
        { href: '/press', label: 'Press' },
        { href: '/now', label: 'Now' }
      ];

  const navLinksHtml = navItems
    .map(item => `<a href="${item.href}" class="footer-nav-link">${item.label}</a>`)
    .join('');

  footer.innerHTML = `
    <div class="footer-inner">
      <nav class="footer-nav" aria-label="Footer">${navLinksHtml}</nav>
      <div class="footer-social">
        <a href="mailto:rymccomb1@icloud.com" class="footer-link">rymccomb1@icloud.com</a>
        <a href="https://x.com/RyanJMcComb" class="footer-link" target="_blank" rel="noopener noreferrer">@RyanJMcComb</a>
        <a href="https://github.com/de-bayes" class="footer-link" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="https://www.linkedin.com/in/ryan-mccomb-30b029370" class="footer-link" target="_blank" rel="noopener noreferrer">LinkedIn</a>
      </div>
      <p class="footer-copy">&copy; 2026 Ryan McComb &middot; Evanston, IL</p>
    </div>
  `;
}
