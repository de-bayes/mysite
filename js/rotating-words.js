// Rotating words animation for \begin{word}
(function () {
  const words = [
    'forecasting',
    'elections',
    'data science',
    'politics',
    'prediction markets',
    'web design',
    'hockey',
  ];

  const el = document.querySelector('.rotating-word');
  if (!el) return;

  let current = 0;

  function swap() {
    // Fade out
    el.classList.remove('visible');

    setTimeout(function () {
      current = (current + 1) % words.length;
      el.textContent = words[current];
      // Fade in
      el.classList.add('visible');
    }, 400);
  }

  // Initial word
  el.textContent = words[0];
  // Force reflow then add visible class
  requestAnimationFrame(function () {
    el.classList.add('visible');
  });

  setInterval(swap, 2400);
})();
