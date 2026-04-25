(function () {
  'use strict';

  var dialog = document.getElementById('photo-lightbox');
  if (!dialog || typeof dialog.showModal !== 'function') return;

  var tiles = document.querySelectorAll('.photo-gallery__open');
  if (tiles.length === 0) return;

  var sourceEl = dialog.querySelector('.photo-lightbox__source');
  var img = dialog.querySelector('.photo-lightbox__img');
  var countN = dialog.querySelector('.photo-lightbox__n');
  var caption = document.getElementById('photo-lightbox-caption');
  var closeBtn = document.getElementById('photo-lightbox-close');
  var prevBtn = document.getElementById('photo-lightbox-prev');
  var nextBtn = document.getElementById('photo-lightbox-next');
  if (!sourceEl || !img) return;

  var total = tiles.length;
  var current = 0;
  var lastFocus = null;

  var kickerN = document.querySelector('.photo-gallery__kicker-n');
  if (kickerN) {
    kickerN.textContent = String(total);
  }

  function setSlide(i) {
    var idx = ((i % total) + total) % total;
    var btn = tiles[idx];
    if (!btn) return;
    var w = btn.getAttribute('data-lbw') || '';
    var j = btn.getAttribute('data-lbj') || '';
    var al = btn.getAttribute('data-alt') || '';
    sourceEl.setAttribute('srcset', w);
    img.setAttribute('src', j);
    img.setAttribute('alt', al);
    if (countN) {
      countN.textContent = String(idx + 1);
    }
    if (caption) {
      caption.textContent = al;
    }
    current = idx;
  }

  function openAt(i) {
    var idx = ((i % total) + total) % total;
    lastFocus = document.activeElement;
    setSlide(idx);
    dialog.showModal();
    window.requestAnimationFrame(function () {
      if (closeBtn && typeof closeBtn.focus === 'function') {
        closeBtn.focus();
      }
    });
  }

  function close() {
    if (dialog.open) {
      dialog.close();
    }
  }

  dialog.addEventListener('close', function () {
    if (lastFocus && typeof lastFocus.focus === 'function') {
      lastFocus.focus();
    }
    lastFocus = null;
  });

  function step(delta) {
    setSlide(current + delta);
  }

  for (var t = 0; t < tiles.length; t++) {
    (function (index) {
      tiles[index].addEventListener('click', function () {
        openAt(index);
      });
    })(t);
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', function () {
      close();
    });
  }
  if (prevBtn) {
    prevBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      step(-1);
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      step(1);
    });
  }

  dialog.addEventListener('click', function (e) {
    if (e.target === dialog) {
      close();
    }
  });

  dialog.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      step(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      step(1);
    }
  });
})();
