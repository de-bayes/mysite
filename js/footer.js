/** Single-line footer: copyright, inline page links, back to top. */
const FOOTER_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/experience', label: 'Experience' },
  { href: '/writing', label: 'Writing' },
  { href: '/press', label: 'Press' },
  { href: '/now', label: 'Now' },
  { href: '/resume', label: 'Resume' },
  { href: '/racecalls', label: 'Race calls' }
];

function sep() {
  return '<span class="footer-minimal-sep" aria-hidden="true">·</span>';
}

const footer = document.querySelector('.site-footer');
if (footer) {
  const linksHtml = FOOTER_LINKS.map(
    (item, i) => (i ? sep() : '') + `<a href="${item.href}">${item.label}</a>`
  ).join('');

  footer.innerHTML = `
    <div class="footer-minimal">
      <p class="footer-minimal-line">
        <span class="footer-copy">&copy; 2026 Ryan McComb</span>${sep()}${linksHtml}${sep()}<a href="https://x.com/RyanMcComb" target="_blank" rel="noopener noreferrer">@RyanMcComb</a>
      </p>
      <a href="#" class="footer-top" aria-label="Back to top">↑</a>
    </div>
  `;

  footer.querySelector('.footer-top').addEventListener('click', function (e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
