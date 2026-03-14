// effects.js — Premium interactive effects
(function () {
  'use strict';
  const isMobile = window.matchMedia('(hover: none)').matches;


  // ===== 2. PARTICLE CONSTELLATION — Floating network on inner pages =====
  function initParticles() {
    if (document.querySelector('.hero') || isMobile) return;
    const cvs = document.createElement('canvas');
    cvs.id = 'particle-bg';
    document.body.prepend(cvs);
    const ctx = cvs.getContext('2d');
    let w, h, mx = -1000, my = -1000;
    function resize() { w = cvs.width = window.innerWidth; h = cvs.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

    const N = 45;
    const pts = Array.from({ length: N }, () => ({
      x: Math.random() * 3000 - 500, y: Math.random() * 2000 - 300,
      vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2,
      r: Math.random() * 1.2 + 0.3, a: Math.random() * 0.2 + 0.05,
    }));

    (function frame() {
      requestAnimationFrame(frame);
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -30) p.x = w + 30; if (p.x > w + 30) p.x = -30;
        if (p.y < -30) p.y = h + 30; if (p.y > h + 30) p.y = -30;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fillStyle = `rgba(99,102,241,${p.a * 0.7})`; ctx.fill();
      }
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 22500) {
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(99,102,241,${(1 - Math.sqrt(d2) / 150) * 0.06})`;
            ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
        const mdx = pts[i].x - mx, mdy = pts[i].y - my, md2 = mdx * mdx + mdy * mdy;
        if (md2 < 40000) {
          const md = Math.sqrt(md2);
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(mx, my);
          ctx.strokeStyle = `rgba(99,102,241,${(1 - md / 200) * 0.15})`;
          ctx.lineWidth = 0.6; ctx.stroke();
          // Gentle repel
          pts[i].vx += (mdx / md) * 0.01; pts[i].vy += (mdy / md) * 0.01;
          pts[i].vx *= 0.995; pts[i].vy *= 0.995;
        }
      }
    })();
  }

  // ===== 3. CHARACTER REVEAL — Hero h1 types in char-by-char =====
  function initCharReveal() {
    const h1 = document.querySelector('.hero-title');
    if (!h1) return;
    const text = h1.textContent;
    h1.textContent = '';
    h1.style.animation = 'none';
    h1.style.opacity = '1';

    text.split('').forEach((ch, i) => {
      const span = document.createElement('span');
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      span.className = 'char-reveal';
      span.style.animationDelay = `${0.12 + i * 0.032}s`;
      h1.appendChild(span);
    });

  }

  // ===== 4. CARD GLOW — Mouse-position radial gradient =====
  function initCardGlow() {
    if (isMobile) return;
    const sel = '.timeline-card, .writing-card, .contact-item, .press-item, .edu-card, .passion-card';
    document.addEventListener('mousemove', e => {
      document.querySelectorAll(sel).forEach(c => {
        const r = c.getBoundingClientRect();
        c.style.setProperty('--glow-x', `${e.clientX - r.left}px`);
        c.style.setProperty('--glow-y', `${e.clientY - r.top}px`);
      });
    }, { passive: true });
  }

  // ===== 5. 3D PORTRAIT TILT — Perspective rotation following mouse =====
  function initPortraitTilt() {
    const img = document.querySelector('.portrait');
    if (!img || isMobile) return;
    let hover = false;

    img.addEventListener('mouseenter', () => { hover = true; });
    img.addEventListener('mouseleave', () => {
      hover = false;
      img.style.transition = 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)';
      img.style.transform = '';
      setTimeout(() => { img.style.transition = ''; }, 700);
    });
    img.addEventListener('mousemove', e => {
      if (!hover) return;
      const r = img.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      img.style.transition = 'transform 0.1s ease-out';
      img.style.transform = `perspective(800px) rotateY(${x * 16}deg) rotateX(${-y * 16}deg) scale3d(1.05, 1.05, 1.05)`;
    });
  }

  // ===== 6. MAGNETIC HOVER — Elements subtly follow cursor =====
  function initMagnetic() {
    if (isMobile) return;
    document.querySelectorAll('.hero-pill, .filter-btn').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        el.style.transform = '';
        setTimeout(() => { el.style.transition = ''; }, 500);
      });
    });
  }

  // ===== 7. NUMBER COUNTER — Animate data-count values on scroll =====
  function initCounters() {
    const els = document.querySelectorAll('[data-count]');
    if (!els.length) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const dec = (el.dataset.count.split('.')[1] || '').length;
        const start = performance.now();
        const dur = 1400;
        (function tick(now) {
          const t = Math.min((now - start) / dur, 1);
          el.textContent = (target * (1 - Math.pow(1 - t, 4))).toFixed(dec);
          if (t < 1) requestAnimationFrame(tick);
        })(start);
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });
    els.forEach(el => obs.observe(el));
  }

  // ===== 8. SCROLL PROGRESS — Accent bar at bottom of nav =====
  function initScrollProgress() {
    const nav = document.querySelector('.site-nav');
    if (!nav) return;
    const bar = document.createElement('div');
    bar.id = 'scroll-progress';
    nav.appendChild(bar);
    window.addEventListener('scroll', () => {
      const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      bar.style.transform = `scaleX(${Math.min(pct, 1)})`;
    }, { passive: true });
  }

  // ===== INIT =====
  document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initCharReveal();
    initCardGlow();
    initPortraitTilt();
    initMagnetic();
    initCounters();
    initScrollProgress();
  });
})();
