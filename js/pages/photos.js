(function () {
  'use strict';

  var stage = document.getElementById('photo-stage');
  if (!stage) return;

  var cards = Array.prototype.slice.call(stage.querySelectorAll('.photo-card'));
  if (cards.length === 0) return;

  var counter = document.getElementById('photo-counter');
  var prevBtn = document.querySelector('.photo-deck-arrow--prev');
  var nextBtn = document.querySelector('.photo-deck-arrow--next');

  var index = 0;
  var total = cards.length;

  var dragging = false;
  var pointerId = null;
  var startX = 0;
  var dragX = 0;
  var SWIPE_THRESHOLD = 60;

  function clampIndex(i) {
    return ((i % total) + total) % total;
  }

  function updateCounter() {
    if (counter) counter.textContent = index + 1 + ' / ' + total;
  }

  function layout() {
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var rel = (i - index + total) % total;
      // Treat the two entries behind as negative offsets so they sit under the top card.
      if (rel > total / 2) rel -= total;
      card.classList.remove('is-top', 'is-next', 'is-prev', 'is-behind');
      card.style.removeProperty('transform');
      if (rel === 0) {
        card.classList.add('is-top');
        card.style.zIndex = 4;
      } else if (rel === 1) {
        card.classList.add('is-next');
        card.style.zIndex = 3;
      } else if (rel === 2) {
        card.classList.add('is-behind');
        card.style.zIndex = 2;
      } else {
        card.classList.add('is-prev');
        card.style.zIndex = 1;
      }
    }
    updateCounter();
  }

  function go(delta) {
    index = clampIndex(index + delta);
    layout();
  }

  layout();

  if (prevBtn)
    prevBtn.addEventListener('click', function () {
      go(-1);
    });
  if (nextBtn)
    nextBtn.addEventListener('click', function () {
      go(1);
    });

  document.addEventListener('keydown', function (e) {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    if (e.key === 'ArrowLeft') {
      go(-1);
      e.preventDefault();
    } else if (e.key === 'ArrowRight') {
      go(1);
      e.preventDefault();
    }
  });

  function topCard() {
    return cards[index];
  }

  stage.addEventListener('pointerdown', function (e) {
    var top = topCard();
    if (!top || !top.contains(e.target)) return;
    dragging = true;
    pointerId = e.pointerId;
    startX = e.clientX;
    dragX = 0;
    top.classList.add('is-dragging');
    if (top.setPointerCapture) {
      try {
        top.setPointerCapture(pointerId);
      } catch (err) {
        void err;
      }
    }
  });

  stage.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    dragX = e.clientX - startX;
    var rot = dragX / 30;
    var top = topCard();
    if (top) {
      top.style.transform = 'translate3d(' + dragX + 'px, 0, 0) rotate(' + rot + 'deg)';
    }
  });

  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    var top = topCard();
    if (top) {
      top.classList.remove('is-dragging');
      top.style.removeProperty('transform');
      if (pointerId != null && top.releasePointerCapture) {
        try {
          top.releasePointerCapture(pointerId);
        } catch (err) {
          void err;
        }
      }
    }
    pointerId = null;
    if (Math.abs(dragX) > SWIPE_THRESHOLD) {
      go(dragX < 0 ? 1 : -1);
    } else {
      layout();
    }
    dragX = 0;
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
  }

  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);
})();
