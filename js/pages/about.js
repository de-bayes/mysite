document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-copy]').forEach((el) => {
    el.addEventListener('click', (event) => {
      event.preventDefault();
      const text = el.dataset.copy;
      if (!text) return;
      if (!navigator.clipboard?.writeText) {
        window.location.href = 'mailto:' + text;
        return;
      }

      navigator.clipboard
        .writeText(text)
        .then(() => {
          const toast = el.querySelector('.copied-toast');
          if (toast) {
            toast.classList.add('show');
            window.setTimeout(() => toast.classList.remove('show'), 1500);
          }
        })
        .catch(() => {
          window.location.href = 'mailto:' + text;
        });
    });
  });
});
