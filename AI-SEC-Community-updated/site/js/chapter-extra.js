/* AI-SEC Community — chapter-extra.js
   Extra motion for the Bangalore + Pune chapter pages. Vanilla, no deps.
   Runs after chapter-pages.js. Everything degrades to "just visible" without JS
   or under prefers-reduced-motion. */
(() => {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* Small helper: add a class once an element is ~visible */
  function onSeen(els, fn, opts) {
    if (!els.length) return;
    if (!('IntersectionObserver' in window) || reduce) { els.forEach(fn); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { fn(e.target); io.unobserve(e.target); } });
    }, opts || { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    els.forEach((el) => io.observe(el));
  }

  /* ---------------- Bangalore ---------------- */

  // recap chips: stagger index
  $$('.recap-chips').forEach((ul) => Array.from(ul.children).forEach((li, i) => li.style.setProperty('--k', i)));

  // talk titles: wrap the quoted text so the marker sweep has something to paint
  $$('.talk').forEach((p) => {
    Array.from(p.childNodes).forEach((n) => {
      if (n.nodeType === 3 && n.textContent.trim()) {
        const span = document.createElement('span');
        span.className = 'talk__text';
        span.textContent = n.textContent;
        p.replaceChild(span, n);
      }
    });
  });

  // speaker cards: mark as seen (drives the marker sweep)
  onSeen($$('.speaker-card'), (c) => c.classList.add('is-seen'), { threshold: 0.35 });

  // moderators get a soft pulse so the panel has a visible "host"
  $$('.speaker-card .badge').forEach((b) => { if (b.textContent.trim() === 'Moderator') b.classList.add('badge-pulse'); });

  // hero: scroll cue to the first meetup
  const firstLink = $('.month-rail .archive-nav a');
  const stats = $('.chapter-hero__stats');
  if (firstLink && stats) {
    const cue = document.createElement('a');
    cue.className = 'cp-cue';
    cue.href = firstLink.getAttribute('href');
    cue.innerHTML = '<i aria-hidden="true"></i><span>Latest meetup</span>';
    cue.addEventListener('click', (e) => {
      const t = $(cue.getAttribute('href'));
      if (!t) return;
      e.preventDefault();
      t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    });
    stats.insertAdjacentElement('afterend', cue);
  }

  /* ---------------- Pune ---------------- */

  // reveal blocks (same recipe as chapter-pages.js, for the new Pune sections)
  const reveals = $$('.pune-reveal');
  reveals.forEach((el) => {
    const idx = Array.from(el.parentElement.children).indexOf(el);
    el.style.setProperty('--i', Math.min(idx, 8));
    el.classList.add('cp-reveal');
  });
  onSeen(reveals, (el) => el.classList.add('is-in'), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  // role cards: glow + gentle tilt that follow the pointer
  if (fine && !reduce) {
    $$('.pune-role').forEach((card) => {
      let raf = 0;
      card.addEventListener('pointermove', (e) => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width;
          const py = (e.clientY - r.top) / r.height;
          card.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
          card.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
          card.style.setProperty('--ry', `${((px - 0.5) * 6).toFixed(2)}deg`);
          card.style.setProperty('--rx', `${((0.5 - py) * 6).toFixed(2)}deg`);
        });
      });
      card.addEventListener('pointerleave', () => {
        cancelAnimationFrame(raf);
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  // roadmap: connector fills as the section scrolls through, steps light up in turn
  const road = $('.pune-road');
  if (road) {
    const steps = $$('.pune-step', road);
    const vertical = () => window.matchMedia('(max-width: 760px)').matches;
    function update() {
      const r = road.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (innerHeight * 0.72 - r.top) / (r.height + innerHeight * 0.1)));
      const v = reduce ? 1 : p;
      road.style.setProperty('--road', v.toFixed(3));
      steps.forEach((s, i) => {
        const threshold = steps.length === 1 ? 0 : i / (steps.length - 1);
        s.classList.toggle('is-lit', reduce || v >= threshold * 0.92 + 0.02);
      });
    }
    let ticking = false;
    addEventListener('scroll', () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { update(); ticking = false; }); }, { passive: true });
    addEventListener('resize', update);
    update();
  }
})();
