document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.writing-card-outline').forEach((outline) => {
    const card = outline.querySelector('.press-card[data-href]');
    if (!card) return;

    outline.style.cursor = 'pointer';
    outline.addEventListener('click', (event) => {
      if (event.target.closest('.writing-card-link')) return;
      window.open(card.dataset.href, '_blank', 'noopener');
    });
  });
});
