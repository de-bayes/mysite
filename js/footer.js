const footer = document.querySelector('.site-footer');
if (footer) {
  footer.innerHTML = `
    <div class="footer-inner">
      <div class="footer-left">
        <div class="footer-name">Ryan McComb</div>
        <div class="footer-meta">Evanston, IL &middot; <a href="mailto:rymccomb1@icloud.com">rymccomb1@icloud.com</a></div>
      </div>
      <nav class="footer-links" aria-label="Footer navigation">
        <a href="/about">About</a>
        <a href="/experience">Experience</a>
        <a href="/writing">Writing</a>
        <a href="/press">Press</a>
        <a href="/now">Now</a>
      </nav>
    </div>
    <div class="footer-copy">&copy; 2026 Ryan McComb</div>
  `;
}
