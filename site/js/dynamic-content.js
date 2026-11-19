/* ==========================================================================
   AI-SEC Community — dynamic content
   Reads the JSON files that the admin dashboard (admin-app, Decap CMS) edits
   and applies them to the static pages. If a file can't be loaded, the page
   keeps its built-in HTML, so nothing breaks.

   data/settings.json         -> Register link, announcement bar, social links, home stats
   data/upcoming-events.json  -> "Next summit" cards on the home page
   data/monthly-updates.json  -> new months at the top of Past_Event.html
   data/partners.json         -> partner list on "Community Partners.html"

   Load this in <head> (no defer) right after js/site-chrome.js.
   ========================================================================== */
(function () {
  'use strict';

  var resolvePartners;
  window.AISEC_PARTNERS_READY = new Promise(function (r) { resolvePartners = r; });
  setTimeout(function () { resolvePartners(); }, 4000); // never block the page

  /* ------------------------------------------------------------ helpers */
  function getJSON(path) {
    return fetch(path + '?v=' + Date.now(), { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error(path + ' ' + r.status);
      return r.json();
    });
  }
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k];
      else if (attrs[k] != null && attrs[k] !== false) n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  function str(x) { return x == null ? '' : String(x).trim(); }
  function isHttp(u) { return /^https?:\/\//i.test(str(u)); }
  function img(p) { // admin stores "/Images/..."; keep it, encode spaces
    p = str(p);
    if (!p || isHttp(p)) return p;
    try { p = encodeURI(decodeURI(p)); } catch (e) { /* keep as is */ }
    return p.replace(/^\/+/, '');
  }
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  /* ---------------------------------------------------- settings: chrome */
  var XPATH = 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z';

  function patchChrome(s) {
    var tries = 0;
    (function run() {
      var heads = document.querySelectorAll('site-header'), foots = document.querySelectorAll('site-footer');
      var ready = Array.prototype.every.call(heads, function (h) { return h.shadowRoot; }) &&
                  Array.prototype.every.call(foots, function (f) { return f.shadowRoot; });
      if (!ready && tries++ < 40) return setTimeout(run, 100);

      Array.prototype.forEach.call(heads, function (h) {
        var sr = h.shadowRoot; if (!sr) return;
        if (isHttp(s.registerUrl)) {
          Array.prototype.forEach.call(sr.querySelectorAll('a.navbar__cta'), function (a) {
            a.setAttribute('href', s.registerUrl);
          });
        }
        var old = sr.querySelector('.aisec-banner'); if (old) old.remove();
        var b = s.banner;
        if (b && b.enabled && str(b.text)) {
          var bar = el('div', { 'class': 'aisec-banner', role: 'region', 'aria-label': 'Announcement',
            style: 'background:#9930F6;color:#fff;text-align:center;padding:.55rem 1rem;font:500 .9rem/1.4 Inter,system-ui,sans-serif;' });
          bar.appendChild(document.createTextNode(str(b.text) + ' '));
          if (str(b.linkText) && isHttp(b.linkUrl)) {
            bar.appendChild(el('a', { href: str(b.linkUrl), text: str(b.linkText),
              style: 'color:#fff;font-weight:700;text-decoration:underline;' }));
          }
          sr.insertBefore(bar, sr.querySelector('header') || sr.firstChild);
        }
      });

      Array.prototype.forEach.call(foots, function (f) {
        var sr = f.shadowRoot; if (!sr) return;
        var box = sr.querySelector('.footer__social'); if (!box || !s.social) return;
        var map = { linkedin: 'LinkedIn', youtube: 'YouTube', whatsapp: 'WhatsApp', twitter: 'X' };
        Object.keys(map).forEach(function (k) {
          var url = str(s.social[k]); var label = map[k];
          var a = box.querySelector('a[aria-label$="on ' + label + '"]');
          if (!isHttp(url)) { if (a && k !== 'linkedin') a.style.display = 'none'; return; }
          if (!a && k === 'twitter') {
            a = el('a', { target: '_blank', rel: 'noopener', 'aria-label': 'AI-SEC Community on X' });
            a.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="' + XPATH + '"/></svg>';
            box.appendChild(a);
          }
          if (a) { a.setAttribute('href', url); a.style.display = ''; }
        });
      });
    })();
  }

  /* ----------------------------------------------- settings: page parts */
  function applyHome(s) {
    if (isHttp(s.registerUrl)) {
      var hero = document.querySelector('.hero__btn-main');
      if (hero) { hero.setAttribute('href', s.registerUrl); hero.setAttribute('target', '_blank'); hero.setAttribute('rel', 'noopener'); }
    }
    var items = document.querySelectorAll('.stats-bar .stat-item');
    if (items.length && Array.isArray(s.stats)) {
      s.stats.slice(0, items.length).forEach(function (st, i) {
        var num = items[i].querySelector('.stat-item__number'), lab = items[i].querySelector('.stat-item__label');
        if (lab && str(st.label)) lab.textContent = str(st.label);
        if (!num) return;
        var v = Number(st.value) || 0, suf = str(st.suffix);
        if (num.textContent.trim() !== '0') { // counter already ran: replace with final value
          var c = num.cloneNode(false);
          c.setAttribute('data-count-to', v); c.setAttribute('data-suffix', suf); c.textContent = v + suf;
          num.parentNode.replaceChild(c, num);
        } else { num.setAttribute('data-count-to', v); num.setAttribute('data-suffix', suf); }
      });
    }
  }

  /* ------------------------------------------------------ upcoming cards */
  function applyUpcoming(data) {
    var cards = document.querySelectorAll('.tickets .ticket'); if (!cards.length) return;
    var events = (data && data.events) || [];
    var byChapter = {};
    events.forEach(function (e) { if (e && e.chapter && !byChapter[e.chapter]) byChapter[e.chapter] = e; });
    Array.prototype.forEach.call(cards, function (card) {
      var chap = (card.querySelector('.ticket__chapter') || {}).textContent || '';
      var key = chap.toLowerCase().split(' ')[0];
      var ev = byChapter[key]; if (!ev) return; // keep the TBA card
      var media = card.querySelector('.ticket__media img');
      if (media && str(ev.image)) { media.setAttribute('src', img(ev.image)); media.setAttribute('alt', str(ev.title) + ' banner'); }
      var t = card.querySelector('.ticket__title'); if (t && str(ev.title)) t.textContent = str(ev.title);
      var facts = card.querySelector('.ticket__facts');
      if (facts) {
        facts.textContent = '';
        facts.appendChild(el('li', { text: '\uD83D\uDCC5 Date: ' + (str(ev.dateLabel) || 'TBA') }));
        facts.appendChild(el('li', { text: '\uD83D\uDCCD Venue: ' + (str(ev.venue) || 'TBA') }));
      }
      var sub = card.querySelector('.ticket__subtitle');
      if (str(ev.subtitle)) {
        if (!sub) { sub = el('p', { 'class': 'ticket__subtitle' }); if (facts) facts.parentNode.insertBefore(sub, facts); }
        sub.textContent = str(ev.subtitle);
      } else if (sub) sub.remove();
      var btn = card.querySelector('a.btn');
      if (btn && isHttp(ev.lumaUrl)) { btn.setAttribute('href', str(ev.lumaUrl)); }
      if (ev.dateISO && /^\d{4}-\d{2}-\d{2}$/.test(str(ev.dateISO))) card.setAttribute('data-date', ev.dateISO);
    });
  }

  /* ------------------------------------------------------ monthly updates */
  function person(p, label, withTopic) {
    var a = el('article', { 'class': 'card speaker-card' });
    var photo;
    if (str(p.image)) photo = el('img', { 'class': 'speaker-card__avatar', src: img(p.image), alt: 'Portrait of ' + str(p.name), loading: 'lazy' });
    else {
      var ini = str(p.name).split(/\s+/).map(function (w) { return w.charAt(0); }).join('').slice(0, 2).toUpperCase();
      photo = el('div', { 'class': 'speaker-card__avatar', 'aria-hidden': 'true',
        style: 'display:grid;place-items:center;background:#F0E4FE;color:#6B1FCC;font-weight:700;', text: ini });
    }
    a.appendChild(photo);
    var body = el('div', { 'class': 'card__body' }, [
      el('h3', { 'class': 'card__title', text: str(p.name) }),
      el('span', { 'class': 'badge' + (withTopic === 'mentor' ? ' badge--muted' : (label === 'Speaker' ? ' badge--accent' : '')), text: str(p.role) || label })
    ]);
    if (isHttp(p.linkedin)) {
      var link = el('a', { href: str(p.linkedin), target: '_blank', rel: 'noopener', 'class': 'icon-link' });
      link.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><use href="#icon-linkedin"/></svg>LinkedIn';
      body.appendChild(el('p', { 'class': 'card__text' }, [link]));
    }
    if (str(p.topic)) {
      body.appendChild(el('p', { 'class': 'talk' }, [
        el('span', { 'class': 'talk__tag', text: withTopic === 'mentor' ? 'Topic' : 'Talk' }),
        document.createTextNode('\u201C' + str(p.topic) + '\u201D')
      ]));
    }
    a.appendChild(body);
    return a;
  }
  function group(titleNode, people, label, cols, mode) {
    if (!people || !people.length) return null;
    var g = el('div', { 'class': 'event-group' }, [
      el('div', { 'class': 'event-group__header' }, [titleNode]),
      el('div', { 'class': 'grid ' + cols }, people.map(function (p) { return person(p, label, mode); }))
    ]);
    return g;
  }
  function monthBlock(u, idx) {
    var d = new Date(str(u.month) + 'T00:00:00');
    if (isNaN(d)) return null;
    var name = MONTHS[d.getMonth()], year = d.getFullYear();
    var id = 'update-' + year + '-' + String(d.getMonth() + 1).padStart(2, '0');
    var host = str(u.host);
    var sec = el('section', { 'class': 'section section--tint month-block', id: id, 'aria-labelledby': id + '-title', 'data-dynamic': '1' });
    sec.appendChild(el('span', { 'class': 'month-block__ghost', 'aria-hidden': 'true', text: name.slice(0, 3) }));
    var wrap = el('div', { 'class': 'container' });

    var counts = [];
    var talks = (u.speakers || []).length, panel = (u.panel || []).length, ment = (u.mentors || []).length;
    if (talks) counts.push([talks, talks === 1 ? 'Talk' : 'Talks']);
    if (panel) counts.push([panel, 'On the panel']);
    if (ment) counts.push([ment, 'Flash mentors']);
    var header = el('div', { 'class': 'month-block__header is-in' }, [
      el('div', { 'class': 'month-block__meta' }, [
        el('span', { 'class': 'badge badge--accent', text: str(u.chapter) || 'Past Event' }),
        host ? el('span', { 'class': 'badge', text: host }) : null
      ]),
      el('h2', { 'class': 'section__title month-title', id: id + '-title' }, [
        el('span', { 'class': 'month-title__name', text: name }), document.createTextNode(' '),
        el('span', { 'class': 'month-title__year', text: String(year) })
      ]),
      str(u.summary) ? el('p', { 'class': 'section__subtitle', text: str(u.summary) }) : null,
      counts.length ? el('ul', { 'class': 'recap-chips', 'aria-label': 'Meetup at a glance' }, counts.map(function (c) {
        return el('li', {}, [el('strong', { text: String(c[0]) }), el('span', { text: c[1] })]);
      })) : null
    ]);
    wrap.appendChild(header);

    if (str(u.groupPhoto)) {
      wrap.appendChild(el('article', { 'class': 'card', style: 'margin-bottom:2.5rem;' }, [
        el('img', { 'class': 'card__image', src: img(u.groupPhoto), alt: 'Group photo of attendees at the ' + name + ' ' + year + ' AI-SEC Community meetup', loading: 'lazy' })
      ]));
    }
    var g1 = group(el('h3', { 'class': 'event-group__title', text: 'On the stage' }), u.speakers, 'Speaker', 'grid-2c', 'talk');
    var panelTitle = el('h3', { 'class': 'event-group__title' }, [el('span', { 'class': 'event-group__label', text: 'Panel' })]);
    if (str(u.panelTitle)) panelTitle.appendChild(el('span', { 'class': 'event-group__topic', text: '\u201C' + str(u.panelTitle) + '\u201D' }));
    var g2 = group(panelTitle, u.panel, 'Panelist', 'grid-4c', 'panel');
    var g3 = group(el('h3', { 'class': 'event-group__title', text: 'Flash mentoring, one to one' }), u.mentors, 'Flash mentor', 'grid-4c', 'mentor');
    [g1, g2, g3].forEach(function (g) { if (g) wrap.appendChild(g); });

    if (isHttp(u.youtubeUrl)) {
      wrap.appendChild(el('p', { style: 'margin-top:1.5rem;' }, [
        el('a', { 'class': 'btn btn-secondary', href: str(u.youtubeUrl), target: '_blank', rel: 'noopener', text: 'Watch the recording \u2192' })
      ]));
    }
    sec.appendChild(wrap);
    return { node: sec, id: id, label: name.slice(0, 3) + ' ' + year, host: host, date: d };
  }
  function applyMonthly(data) {
    var list = ((data && data.updates) || []).map(monthBlock).filter(Boolean);
    if (!list.length) return;
    list.sort(function (a, b) { return b.date - a.date; });
    var first = document.querySelector('section.month-block'); if (!first) return;
    var nav = document.querySelector('.archive-nav');
    var navFirst = nav && nav.firstChild;
    list.forEach(function (m) {
      first.parentNode.insertBefore(m.node, first);
      if (nav) {
        var a = el('a', { href: '#' + m.id }, [el('b', { text: m.label }), el('small', { text: m.host })]);
        nav.insertBefore(a, navFirst);
      }
    });
  }

  /* ------------------------------------------------------------ partners */
  function applyPartners(data) {
    var ul = document.querySelector('[data-pnet] .pnet__data'); if (!ul) return;
    var items = (data && data.partners) || []; if (!items.length) return;
    var host = function (u) { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return str(u); } };
    var known = {};
    Array.prototype.forEach.call(ul.querySelectorAll('li'), function (li) {
      var a = li.querySelector('a'); if (!a) return;
      known[host(a.getAttribute('href'))] = { type: li.getAttribute('data-type'), short: li.getAttribute('data-short') };
    });
    var frag = document.createDocumentFragment();
    items.forEach(function (p) {
      if (!str(p.name)) return;
      var k = known[host(p.url)] || {};
      var li = el('li', { 'class': 'partner-row', 'data-type': k.type || 'community', 'data-short': k.short || str(p.name) });
      li.appendChild(el('div', { 'class': 'partner-row__logo' }, [
        el('img', { src: img(p.logo), alt: str(p.name) + ' logo', loading: 'lazy' })
      ]));
      li.appendChild(el('div', { 'class': 'partner-row__body' }, [
        el('h3', { text: str(p.name) }),
        el('p', { text: str(p.description) }),
        el('a', { href: isHttp(p.url) ? str(p.url) : '#', 'class': 'partner-row__link', target: '_blank', rel: 'noopener', text: 'Find out more \u2192' })
      ]));
      frag.appendChild(li);
    });
    ul.textContent = '';
    ul.appendChild(frag);
  }

  /* ---------------------------------------------------------------- init */
  function init() {
    var tasks = [];
    tasks.push(getJSON('data/settings.json').then(function (s) { patchChrome(s); applyHome(s); }).catch(function () {}));
    if (document.querySelector('.tickets .ticket')) tasks.push(getJSON('data/upcoming-events.json').then(applyUpcoming).catch(function () {}));
    if (/\/past_event(\.html)?\/?$/i.test(location.pathname) && document.querySelector('section.month-block')) tasks.push(getJSON('data/monthly-updates.json').then(applyMonthly).catch(function () {}));
    if (document.querySelector('[data-pnet]')) {
      getJSON('data/partners.json').then(applyPartners).catch(function () {}).then(function () { resolvePartners(); });
    } else resolvePartners();
    return tasks;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
