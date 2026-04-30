document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.writing-card-outline').forEach((outline) => {
    const card = outline.querySelector('.writing-card[data-href]');
    if (!card) return;

    outline.style.cursor = 'pointer';
    const onActivate = (event) => {
      if (event && event.target.closest('.writing-card-link')) return;
      window.open(card.dataset.href, '_blank', 'noopener');
    };
    outline.addEventListener('click', onActivate);
    outline.setAttribute('role', 'link');
    outline.setAttribute('tabindex', '0');
    outline.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onActivate(event);
      }
    });
  });
});
