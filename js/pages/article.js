document.addEventListener('DOMContentLoaded', () => {
  const articleView = document.querySelector('.article-view');
  if (!articleView) return;

  let progressBar = document.querySelector('.reading-progress');
  if (!progressBar) {
    progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    document.body.appendChild(progressBar);
  }

  const updateProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollable <= 0) {
      progressBar.style.width = '100%';
      return;
    }
    const pct = Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100));
    progressBar.style.width = pct + '%';
  };

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
});
