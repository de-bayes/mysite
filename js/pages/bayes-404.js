(function () {
  'use strict';

  var prior = document.getElementById('bayes-prior');
  var peg = document.getElementById('bayes-peg');
  var peng = document.getElementById('bayes-peng');
  var outPost = document.getElementById('bayes-posterior');
  var outPE = document.getElementById('bayes-pe');
  if (!prior || !peg || !peng || !outPost) return;

  function pct(el) { return parseInt(el.value, 10) / 100; }

  function update() {
    document.getElementById('val-prior').textContent = prior.value + '%';
    document.getElementById('val-peg').textContent = peg.value + '%';
    document.getElementById('val-peng').textContent = peng.value + '%';

    var g = pct(prior), eg = pct(peg), eng = pct(peng);
    var pe = eg * g + eng * (1 - g);
    if (pe <= 0) {
      outPost.textContent = 'n/a';
      if (outPE) outPE.textContent = '0%';
      return;
    }
    var posterior = (eg * g) / pe;
    outPost.textContent = (posterior * 100).toFixed(1) + '%';
    if (outPE) outPE.textContent = (pe * 100).toFixed(1) + '%';
  }

  [prior, peg, peng].forEach(function (el) { el.addEventListener('input', update); });
  update();
})();
