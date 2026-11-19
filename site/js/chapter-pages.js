/* AI-SEC Community — chapter pages: scroll progress, month scroll-spy rail,
   staggered reveals, card tilt, parallax, photo lightbox. Vanilla, no deps. */
(() => {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---- 1. Scroll progress bar + ghost-month parallax ---- */
  const bar = document.createElement('div');
  bar.className = 'cp-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);

  const ghosts = $$('.month-block__ghost');
  const railEl = $('.month-rail');
  const siteHeader = $('site-header');
  // keep the sticky rail flush under the (shrinking) site header
  const syncRail = () => { if (railEl && siteHeader) railEl.style.top = `${siteHeader.getBoundingClientRect().height}px`; };
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      syncRail();
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(scrollY / max, 1) : 0})`;
      if (!reduce) {
        ghosts.forEach((g) => {
          const r = g.parentElement.getBoundingClientRect();
          if (r.bottom < 0 || r.top > innerHeight) return;
          g.style.setProperty('--ghost-y', `${(r.top * -0.08).toFixed(1)}px`);
        });
      }
      ticking = false;
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  addEventListener('resize', syncRail);
  addEventListener('load', syncRail);

  /* ---- 1b. Tall groups (photo walls) never reach the 15% threshold used by
         animations.js, so they stayed invisible. Reveal them on first touch. ---- */
  const groups = $$('[data-animate="fade-up"]');
  if ('IntersectionObserver' in window) {
    const gio = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-visible'); gio.unobserve(e.target); } });
    }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
    groups.forEach((g) => gio.observe(g));
  } else { groups.forEach((g) => g.classList.add('is-visible')); }

  /* ---- 2. Reveal: tag things, then observe ---- */
  const revealTargets = [
    ...$$('.month-block__header'),
    ...$$('.speaker-card'),
    ...$$('.highlight-card'),
    ...$$('.chapter-next__link'),
    ...$$('.soon-card'),
  ];
  // stagger index = position among siblings (capped)
  revealTargets.forEach((el) => {
    const idx = Array.from(el.parentElement.children).indexOf(el);
    el.style.setProperty('--i', Math.min(idx, 8));
    el.classList.add('cp-reveal');
  });
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('is-in'));
  }

  /* ---- 3. Month rail: smooth jump + scroll-spy + sliding indicator ---- */
  const rail = $('.month-rail');
  if (rail) {
    const links = $$('.archive-nav a', rail);
    const scroller = $('.month-rail__scroller', rail);
    const ind = $('.month-rail__ind', rail);
    const map = new Map();
    links.forEach((a) => {
      const t = $(a.getAttribute('href'));
      if (t) map.set(t, a);
      a.addEventListener('click', (e) => {
        if (!t) return;
        e.preventDefault();
        t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        history.replaceState(null, '', a.getAttribute('href'));
      });
    });

    function setActive(a) {
      links.forEach((l) => { l.classList.toggle('is-active', l === a); if (l === a) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current'); });
      if (ind) {
        ind.style.setProperty('--ind-x', `${a.offsetLeft}px`);
        ind.style.setProperty('--ind-w', `${a.offsetWidth}px`);
      }
      if (scroller && scroller.scrollWidth > scroller.clientWidth) {
        const target = a.offsetLeft - (scroller.clientWidth - a.offsetWidth) / 2;
        scroller.scrollTo({ left: target, behavior: reduce ? 'auto' : 'smooth' });
      }
    }

    // scroll-spy: the active month is the last section whose top has passed the rail
    const sections = Array.from(map.keys());
    let current = null;
    function spy() {
      const line = rail.getBoundingClientRect().bottom + 32;
      let hit = sections[0];
      sections.forEach((sec) => { if (sec.getBoundingClientRect().top <= line) hit = sec; });
      if (hit !== current) { current = hit; setActive(map.get(hit)); }
    }
    addEventListener('scroll', () => requestAnimationFrame(spy), { passive: true });
    window.__cpSpy = spy;
    // initial position (hash or first)
    const initial = (location.hash && links.find((l) => l.getAttribute('href') === location.hash)) || links[0];
    if (initial) requestAnimationFrame(() => { current = map.get ? [...map.entries()].find(([, v]) => v === initial)?.[0] : null; setActive(initial); spy(); });
    addEventListener('resize', () => { const a = $('.is-active', rail); if (a) setActive(a); });
  }

  /* ---- 4. Hero: orbs follow the pointer a little ---- */
  const hero = $('.chapter-hero');
  if (hero && fine && !reduce) {
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      hero.style.setProperty('--px', `${(x * 40).toFixed(1)}px`);
      hero.style.setProperty('--py', `${(y * 30).toFixed(1)}px`);
    });
  }

  /* ---- 5. Speaker cards: glow follows cursor + gentle 3D tilt ---- */
  if (fine && !reduce) {
    $$('.speaker-card').forEach((card) => {
      let raf = 0;
      card.addEventListener('pointermove', (e) => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width;
          const py = (e.clientY - r.top) / r.height;
          card.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
          card.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
          card.style.setProperty('--ry', `${((px - 0.5) * 7).toFixed(2)}deg`);
          card.style.setProperty('--rx', `${((0.5 - py) * 7).toFixed(2)}deg`);
        });
      });
      card.addEventListener('pointerleave', () => {
        cancelAnimationFrame(raf);
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ---- 6. Photo lightbox (links still work without JS) ---- */
  const photos = $$('a.highlight-card');
  if (photos.length) {
    const box = document.createElement('div');
    box.className = 'cp-lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Photo viewer');
    box.innerHTML =
      '<button type="button" class="cp-lightbox__close" aria-label="Close">&times;</button>' +
      '<button type="button" class="cp-lightbox__prev" aria-label="Previous photo">&#8249;</button>' +
      '<img alt="" />' +
      '<button type="button" class="cp-lightbox__next" aria-label="Next photo">&#8250;</button>' +
      '<span class="cp-lightbox__count" aria-live="polite"></span>';
    document.body.appendChild(box);
    const img = $('img', box);
    const count = $('.cp-lightbox__count', box);
    let group = [], idx = 0, opener = null;

    function show(i) {
      idx = (i + group.length) % group.length;
      const src = group[idx].getAttribute('href');
      const alt = $('img', group[idx])?.alt || '';
      img.src = src; img.alt = alt;
      count.textContent = `${idx + 1} / ${group.length}`;
    }
    function open(a) {
      opener = a;
      group = $$('a.highlight-card', a.closest('.highlights-grid') || document);
      show(group.indexOf(a));
      box.classList.add('is-open');
      document.documentElement.style.overflow = 'hidden';
      $('.cp-lightbox__close', box).focus();
    }
    function close() {
      box.classList.remove('is-open');
      document.documentElement.style.overflow = '';
      if (opener) opener.focus();
    }
    photos.forEach((a) => a.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return; // let new-tab clicks through
      e.preventDefault(); open(a);
    }));
    box.addEventListener('click', (e) => { if (e.target === box) close(); });
    $('.cp-lightbox__close', box).addEventListener('click', close);
    $('.cp-lightbox__prev', box).addEventListener('click', () => show(idx - 1));
    $('.cp-lightbox__next', box).addEventListener('click', () => show(idx + 1));
    addEventListener('keydown', (e) => {
      if (!box.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }
  /* ==================================================================
     v2 — signature animations
     ================================================================== */

  /* ---- A. Hero: third orb, spotlight dot-grid, letter-wave title, word ticker ---- */
  if (hero) {
    const orb = document.createElement('span');
    orb.className = 'chapter-hero__orb chapter-hero__orb--c';
    orb.setAttribute('aria-hidden', 'true');
    hero.insertBefore(orb, hero.firstChild);

    if (fine && !reduce) {
      hero.addEventListener('pointermove', (e) => {
        const r = hero.getBoundingClientRect();
        hero.style.setProperty('--sx', `${e.clientX - r.left}px`);
        hero.style.setProperty('--sy', `${e.clientY - r.top}px`);
      });
    }

    const first = $('.chapter-hero__title .line:first-child > span');
    if (first && !reduce) {
      const word = first.textContent.trim();
      first.setAttribute('aria-label', word);
      first.style.animation = 'none';
      first.style.transform = 'none';
      first.innerHTML = Array.from(word)
        .map((ch, i) => `<span class="ch" style="--n:${i}" aria-hidden="true">${ch.replace(/[&<>"']/g, (c) => '&#' + c.charCodeAt(0) + ';')}</span>`).join('');
    }

    const lead = $('.chapter-hero__lead', hero);
    if (lead) {
      // pages can override the ticker with data-ticker-label / data-ticker-words="A|B|C" on the hero
      const words = (hero.dataset.tickerWords || 'Talks|Panels|Flash mentoring|Recordings').split('|');
      const label = hero.dataset.tickerLabel || 'Inside every meetup:';
      const t = document.createElement('p');
      t.className = 'cp-ticker';
      t.setAttribute('aria-hidden', 'true');
      t.innerHTML = '<span>' + String(label).replace(/[&<>"']/g, (c) => '&#' + c.charCodeAt(0) + ';') + '</span><span class="cp-ticker__win"><span class="cp-ticker__col">' +
        words.concat(words[0]).map((w) => `<span>${String(w).replace(/[&<>"']/g, (c) => '&#' + c.charCodeAt(0) + ';')}</span>`).join('') + '</span></span>';
      lead.insertAdjacentElement('afterend', t);
    }
  }

  /* ---- B. Host marquee (built from the month rail) ---- */
  if (hero && rail) {
    const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const hosts = Array.from(new Set($$('.archive-nav a small', rail).map((n) => n.textContent.trim()).filter(Boolean)));
    if (hosts.length >= 2) {
      const items = hosts.map((h) => `<span>${esc(h)}</span>`).join('');
      const rep = hosts.length < 6 ? 4 : 2; // keep the loop wider than the screen
      const half = Array(rep).fill(items).join('');
      const m = document.createElement('div');
      m.className = 'cp-marquee';
      m.setAttribute('aria-hidden', 'true');
      m.innerHTML = `<span class="cp-marquee__label">Hosted by</span><div class="cp-marquee__viewport"><div class="cp-marquee__track">${half}${half}</div></div>`;
      hero.insertAdjacentElement('afterend', m);
    }
  }

  /* ---- C. Timeline spine that fills as you scroll ---- */
  const monthBlocks = $$('.month-block');
  const mainEl = $('main');
  if (monthBlocks.length > 1 && mainEl) {
    const spine = document.createElement('div');
    spine.className = 'cp-spine';
    spine.setAttribute('aria-hidden', 'true');
    spine.innerHTML = '<i></i>';
    mainEl.appendChild(spine);
    const fill = $('i', spine);
    let top0 = 0, h = 0;
    function place() {
      const mr = mainEl.getBoundingClientRect();
      const heads = monthBlocks.map((b) => $('.month-block__header', b)).filter(Boolean);
      if (!heads.length) return;
      const f = heads[0].getBoundingClientRect();
      const l = heads[heads.length - 1].getBoundingClientRect();
      top0 = f.top - mr.top + 14;
      h = Math.max(l.top - f.top, 0);
      spine.style.left = `${f.left - mr.left - 34}px`;
      spine.style.top = `${top0}px`;
      spine.style.height = `${h}px`;
      update();
    }
    function update() {
      const mr = mainEl.getBoundingClientRect();
      const y = innerHeight * 0.45 - (mr.top + top0);
      fill.style.setProperty('--fill', `${Math.max(0, Math.min(h, y))}px`);
    }
    place();
    addEventListener('load', place);
    addEventListener('resize', place);
    addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    setTimeout(place, 1200); // images settle
  }

  /* ---- D. Back-to-top button with progress ring ---- */
  const topBtn = document.createElement('button');
  topBtn.type = 'button';
  topBtn.className = 'cp-top';
  topBtn.setAttribute('aria-label', 'Back to top');
  topBtn.innerHTML = '<svg viewBox="0 0 48 48" aria-hidden="true"><circle class="trk" cx="24" cy="24" r="22"/><circle class="bar" cx="24" cy="24" r="22"/></svg>' +
    '<svg class="arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M12 19V6M6 11l6-6 6 6"/></svg>';
  document.body.appendChild(topBtn);
  function topUpdate() {
    const max = document.documentElement.scrollHeight - innerHeight;
    topBtn.style.setProperty('--p', max > 0 ? Math.min(scrollY / max, 1).toFixed(3) : 0);
    topBtn.classList.toggle('is-on', scrollY > 600);
  }
  addEventListener('scroll', () => requestAnimationFrame(topUpdate), { passive: true });
  topUpdate();
  topBtn.addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));
})();
