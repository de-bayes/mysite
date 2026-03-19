/**
 * Interactive Bayes posterior for the 404 page: P(G|E) with binary hypothesis G.
 */
(function () {
  'use strict';

  function clamp01(x) {
    return Math.min(1, Math.max(0, x));
  }

  function fmtPct(x) {
    if (!Number.isFinite(x)) return 'n/a';
    return (x * 100).toFixed(1) + '%';
  }

  function compute(prior, pEg, pEng) {
    const pG = clamp01(prior);
    const pEG = clamp01(pEg);
    const pEnG = clamp01(pEng);
    const pE = pEG * pG + pEnG * (1 - pG);
    if (pE <= 0) return { posterior: null, pE: 0 };
    const posterior = (pEG * pG) / pE;
    return { posterior: clamp01(posterior), pE };
  }

  function sliderToProb(el) {
    return clamp01(parseInt(el.value, 10) / 100);
  }

  function updateAriaValueText(el, prob) {
    el.setAttribute('aria-valuetext', fmtPct(prob));
  }

  function init() {
    const priorEl = document.getElementById('bayes-prior');
    const pEgEl = document.getElementById('bayes-peg');
    const pEngEl = document.getElementById('bayes-peng');
    const outPosterior = document.getElementById('bayes-posterior');
    const outPE = document.getElementById('bayes-pe');
    const live = document.getElementById('bayes-live');

    if (!priorEl || !pEgEl || !pEngEl || !outPosterior || !outPE || !live) return;

    function refresh() {
      const prior = sliderToProb(priorEl);
      const pEg = sliderToProb(pEgEl);
      const pEng = sliderToProb(pEngEl);
      [priorEl, pEgEl, pEngEl].forEach((el) => {
        el.setAttribute('aria-valuenow', el.value);
      });
      updateAriaValueText(priorEl, prior);
      updateAriaValueText(pEgEl, pEg);
      updateAriaValueText(pEngEl, pEng);

      const { posterior, pE } = compute(prior, pEg, pEng);
      const postText =
        posterior === null ? 'undefined (evidence has zero probability)' : fmtPct(posterior);
      outPosterior.textContent = postText;
      outPE.textContent = fmtPct(pE);

      const summary =
        posterior === null
          ? 'Posterior undefined; total probability of evidence is zero.'
          : `Posterior probability Ryan is a good programmer given this evidence is ${postText}. Marginal probability of the evidence is ${fmtPct(pE)}.`;
      live.textContent = summary;
    }

    [priorEl, pEgEl, pEngEl].forEach((el) => el.addEventListener('input', refresh));
    refresh();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
