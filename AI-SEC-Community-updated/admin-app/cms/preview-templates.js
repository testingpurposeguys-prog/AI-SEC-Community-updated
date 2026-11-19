/* ==========================================================================
   AI-SEC Admin — Live Preview templates for Decap CMS
   Every keystroke in the editor re-renders these, so the right-hand pane is a
   live mock of the real page (same markup + CSS classes as site/js/dynamic-content.js).
   Set window.AISEC_SITE_URL in cms/index.html so existing site photos resolve.
   ========================================================================== */
(function () {
  'use strict';
  if (!window.CMS || !window.h || !window.createClass) return;

  var h = window.h;
  var createClass = window.createClass;
  var SITE = String(window.AISEC_SITE_URL || '').replace(/\/+$/, '');
  var LOGO = new URL('../logo.png', location.href).href;
  var CHAPTERS = ['bangalore', 'hyderabad', 'chennai'];

  /* ------------------------------ helpers ------------------------------ */
  var js = function (x) { return x && x.toJS ? x.toJS() : x; };
  var dataOf = function (props) { return js(props.entry.get('data')) || {}; };
  var str = function (x) { return x == null ? '' : String(x); };
  var isUrl = function (u) { return /^https?:\/\//i.test(str(u).trim()); };
  var safeHref = function (u) { return isUrl(u) ? str(u).trim() : '#'; };
  var cap = function (s) { s = str(s); return s.charAt(0).toUpperCase() + s.slice(1); };

  function initials(name) {
    var t = str(name).replace(/[^A-Za-z0-9 ]/g, '').split(' ').map(function (w) { return w[0] || ''; }).join('').slice(0, 2).toUpperCase();
    return t || '?';
  }

  function fallbackSvg(label) {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#9930f6"/><stop offset="1" stop-color="#6b1fcc"/></linearGradient></defs>' +
      '<rect width="160" height="160" fill="url(#g)"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" ' +
      'font-family="Poppins,Arial,sans-serif" font-weight="700" font-size="52" fill="#fff">' +
      str(label).replace(/[<>&"]/g, '') + '</text></svg>';
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  // Uploaded-but-unsaved images come back from getAsset() as blob: URLs; already-published
  // photos live on the public site, so we prefix the site URL (admin is a separate project).
  function assetUrl(getAsset, p) {
    p = str(p).trim();
    if (!p) return '';
    if (/^(blob:|data:|https?:)/i.test(p)) return p;
    var u = '';
    try { var a = getAsset && getAsset(p); u = a ? String(a) : ''; } catch (e) {}
    if (/^(blob:|data:|https?:)/i.test(u)) return u;
    return SITE + encodeURI(p.charAt(0) === '/' ? p : '/' + p);
  }

  function Img(cls, src, alt, label) {
    return h('img', {
      className: cls,
      alt: alt,
      src: src || fallbackSvg(label),
      onError: function (e) {
        var t = e.target;
        if (t.getAttribute('data-fb')) return;
        t.setAttribute('data-fb', '1');
        t.src = fallbackSvg(label);
      },
      onLoad: function (e) {
        var t = e.target;
        if (t.src.indexOf('data:image/svg') !== 0) t.removeAttribute('data-fb');
      }
    });
  }

  function toIso(v) {
    if (!v) return '';
    if (v instanceof Date) return isNaN(v) ? '' : v.toISOString().slice(0, 10);
    return str(v);
  }
  function monthLabel(v) {
    var s = toIso(v);
    var d = new Date(s.length === 10 ? s + 'T00:00:00Z' : s);
    if (!s || isNaN(d)) return 'Pick a month';
    return d.toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  }

  function icon(path) {
    return h('svg', { viewBox: '0 0 24 24', fill: 'currentColor', 'aria-hidden': 'true' }, h('path', { d: path }));
  }
  var P = {
    linkedin: 'M4.98 3.5a2.5 2.5 0 11-.02 5 2.5 2.5 0 01.02-5zM3 9.75h4V21H3zM9.5 9.75h3.8v1.6h.05c.55-1 1.9-2 3.9-2 4.1 0 4.75 2.7 4.75 6.2V21h-4v-5.1c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V21h-4z',
    youtube: 'M23 7.2a3 3 0 00-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 001 7.2 31 31 0 00.5 12 31 31 0 001 16.8a3 3 0 002.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 002.1-2.1 31 31 0 00.5-4.8 31 31 0 00-.5-4.8zM9.75 15V9l5.5 3z',
    whatsapp: 'M12 2a10 10 0 00-8.6 15L2 22l5.1-1.3A10 10 0 1012 2zm5.2 13.9c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-3.9-4.7-4.1-.1-.2-1.1-1.4-1.1-2.7s.7-1.9.9-2.2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.4.6-.3.3c-.1.1-.3.3-.1.6.2.3.7 1.2 1.5 1.9 1 .9 1.9 1.2 2.2 1.3.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.3z',
    twitter: 'M18.2 2h3.3l-7.2 8.3L22.8 22h-6.6l-5.2-6.8L5 22H1.7l7.7-8.8L1.3 2H8l4.7 6.2zm-1.2 18h1.8L7.1 3.9H5.1z'
  };

  /* ------------------------ shell: toolbar + frame ------------------------ */
  var Shell = createClass({
    getInitialState: function () {
      var s = { theme: 'dark', device: 'desktop' };
      try { var v = JSON.parse(sessionStorage.getItem('aisec-pv') || 'null'); if (v) { s.theme = v.theme || s.theme; s.device = v.device || s.device; } } catch (e) {}
      return s;
    },
    set: function (patch) {
      var self = this;
      this.setState(patch, function () { try { sessionStorage.setItem('aisec-pv', JSON.stringify(self.state)); } catch (e) {} });
    },
    seg: function (key, options) {
      var self = this;
      return h('div', { className: 'pv__group', role: 'group' }, options.map(function (o) {
        return h('button', {
          key: o[0], type: 'button', className: 'pv__btn' + (self.state[key] === o[0] ? ' is-on' : ''),
          onClick: function () { var p = {}; p[key] = o[0]; self.set(p); }
        }, o[1]);
      }));
    },
    render: function () {
      var s = this.state;
      return h('div', {
        className: 'pv', 'data-theme': s.theme,
        onClick: function (e) { var a = e.target.closest && e.target.closest('a'); if (a) e.preventDefault(); }
      },
        h('div', { className: 'pv__bar' },
          h('span', { className: 'pv__live' }, h('span', { className: 'pv__dot' }), 'Live preview'),
          h('span', { className: 'pv__title' }, this.props.label),
          this.seg('theme', [['dark', 'Dark'], ['light', 'Light']]),
          this.seg('device', [['desktop', 'Desktop'], ['tablet', 'Tablet'], ['mobile', 'Mobile']])
        ),
        h('div', { className: 'pv__frame pv__frame--' + s.device },
          h('div', { className: 'pv__chrome' },
            h('span', { className: 'pv__lights' }, h('i'), h('i'), h('i')),
            h('span', { className: 'pv__url' }, (SITE ? SITE.replace(/^https?:\/\//, '') : 'your-site') + '/' + (this.props.path || ''))
          ),
          this.props.children
        )
      );
    }
  });

  /* ---------------------- count-up number (stats bar) ---------------------- */
  var Count = createClass({
    getInitialState: function () { return { v: 0 }; },
    componentDidMount: function () { this.run(); },
    componentDidUpdate: function () { if (this._to !== (Number(this.props.to) || 0)) this.run(); },
    componentWillUnmount: function () { cancelAnimationFrame(this._raf); },
    run: function () {
      var self = this, from = this.state.v, to = Number(this.props.to) || 0, t0 = null;
      this._to = to;
      cancelAnimationFrame(this._raf);
      (function step(ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min((ts - t0) / 650, 1), e = 1 - Math.pow(1 - p, 3);
        self.setState({ v: Math.round(from + (to - from) * e) });
        if (p < 1) self._raf = requestAnimationFrame(step);
      })(performance.now());
    },
    render: function () {
      return h('span', { className: 'stat-item__number' }, this.state.v + str(this.props.suffix));
    }
  });

  /* ------------------------------ mock page parts ------------------------------ */
  function Navbar(registerUrl) {
    return h('header', { className: 'navbar' },
      h('div', { className: 'navbar__inner' },
        h('a', { className: 'navbar__logo' }, h('img', { src: LOGO, alt: 'AI-SEC Community logo' }), h('span', null, 'AI-SEC Community')),
        h('nav', { className: 'navbar__links' }, ['Home', 'Events', 'Get Involved', 'About'].map(function (t) { return h('a', { key: t }, t); })),
        h('div', { className: 'navbar__actions' }, h('a', { className: 'btn btn-primary', href: safeHref(registerUrl) }, 'Register Now'))
      )
    );
  }

  function Note(text, warn) { return h('div', { key: text, className: 'pv-note' + (warn ? ' pv-note--warn' : '') }, h('span', null, warn ? '⚠' : 'ℹ'), h('span', null, text)); }

  /* ================================ SETTINGS ================================ */
  var SettingsPreview = createClass({
    render: function () {
      var d = dataOf(this.props), b = d.banner || {}, so = d.social || {}, stats = d.stats || [];
      var bannerOn = b.enabled && b.text;
      var notes = [];
      if (!b.enabled) notes.push(Note('Announcement bar is OFF — nothing shows at the top of the site.'));
      else if (!b.text) notes.push(Note('Bar is ON but the text is empty, so it will not show.', true));
      if (d.registerUrl && !isUrl(d.registerUrl)) notes.push(Note('Register link must start with https:// — otherwise the button goes nowhere.', true));
      if (b.linkUrl && !isUrl(b.linkUrl)) notes.push(Note('Announcement link URL must start with https://.', true));

      var soc = [['linkedin', 'LinkedIn'], ['youtube', 'YouTube'], ['whatsapp', 'WhatsApp'], ['twitter', 'X / Twitter']];

      return h(Shell, { label: 'Every page · top bar, footer & home numbers', path: 'index.html' },
        bannerOn && h('div', { className: 'banner', role: 'status' }, b.text + ' ',
          b.linkUrl ? h('a', { href: safeHref(b.linkUrl) }, b.linkText || 'Learn more') : null),
        Navbar(d.registerUrl),
        h('section', { className: 'hero-lite' },
          h('h1', null, 'We talk about ', h('b', null, 'AI Security & AI for Security')),
          h('p', null, 'Securing the age of AI, together.'),
          h('div', { className: 'hero-lite__stats' },
            h('div', { className: 'stats-bar', 'aria-label': 'Community stats' },
              stats.map(function (x, i) {
                return h('div', { className: 'stat-item', key: i },
                  h(Count, { to: x.value, suffix: x.suffix }),
                  h('span', { className: 'stat-item__label' }, x.label || 'Label'));
              }))
          )
        ),
        h('div', { className: 'after-hero' }),
        h('section', { className: 'section section--tint' }, h('div', { className: 'container' },
          notes,
          d.registerUrl ? h('div', { style: { textAlign: 'center' } },
            h('a', { className: 'btn btn-primary', href: safeHref(d.registerUrl) }, 'Register Now'),
            h('div', null, h('span', { className: 'pv-chip' }, 'opens → ' + d.registerUrl))) : null
        )),
        h('footer', { className: 'site-footer' },
          h('div', { className: 'footer__row' },
            h('div', null,
              h('div', { className: 'footer__logo' }, h('img', { src: LOGO, width: 28, height: 28, alt: '' }), 'AI-SEC Community'),
              h('p', { className: 'footer__tagline' }, 'Securing the age of AI, together.')),
            h('div', null,
              h('div', { className: 'footer__heading' }, 'Follow us'),
              h('div', { className: 'footer__social' }, soc.map(function (k) {
                var v = so[k[0]];
                return h('a', { key: k[0], href: safeHref(v), title: k[1] + (v ? '' : ' (not set)'), className: v ? 'is-set' : 'is-empty', 'aria-label': k[1] }, icon(P[k[0]]));
              })))
          ),
          h('div', { className: 'footer__bottom' }, 'Built by the community, for the community · © 2025–present AI-SEC Community')
        )
      );
    }
  });

  /* ================================ UPCOMING ================================ */
  var UpcomingPreview = createClass({
    render: function () {
      var d = dataOf(this.props), events = d.events || [], ga = this.props.getAsset;
      var by = {}, extra = 0, noChapter = 0;
      events.forEach(function (e) {
        if (!e.chapter) { noChapter++; return; }
        if (by[e.chapter]) extra++; else by[e.chapter] = e;
      });
      var notes = [];
      if (extra) notes.push(Note(extra + ' extra meetup(s) for a chapter that already has one. The site shows only the FIRST per chapter — delete or change the chapter.', true));
      if (noChapter) notes.push(Note(noChapter + ' meetup(s) have no chapter selected yet, so they will not show.', true));

      return h(Shell, { label: 'Home page · Upcoming Meetups (one card per chapter)', path: 'index.html#upcoming' },
        Navbar(''),
        notes.length ? h('section', { className: 'section' }, h('div', { className: 'container' }, notes)) : null,
        CHAPTERS.map(function (c) {
          var e = by[c], live = !!e; e = e || {};
          var img = e.image ? assetUrl(ga, e.image) : assetUrl(ga, '/Images/TBA.png');
          return h('section', { className: 'section section--tint', key: c },
            h('div', { className: 'container' },
              h('div', { className: 'section__header' },
                h('h2', { className: 'section__title' }, 'Upcoming Event – ' + cap(c) + ' Chapter'),
                h('p', { className: 'section__subtitle' }, live ? (e.subtitle || 'Registrations are open. Reserve your seat.') : 'Stay Tuned for the Announcement of Our Next Summit.')),
              h('article', { className: 'card event-card' },
                Img('card__image', img, e.title || 'Event banner', cap(c)),
                h('div', { className: 'card__body' },
                  h('h3', { className: 'card__title' }, e.title || 'AI-SEC COMMUNITY November Monthly Summit'),
                  h('p', { className: 'card__meta' }, h('time', null, 'Date: ' + (e.dateLabel || 'TBA'))),
                  h('p', { className: 'card__text' }, 'Venue : ' + (e.venue || 'TBA')),
                  h('a', { className: 'btn btn-primary', href: safeHref(e.lumaUrl) }, 'Register Now on Luma'),
                  e.lumaUrl ? h('span', { className: 'pv-chip' }, e.lumaUrl) : null,
                  live ? null : h('span', { className: 'pv-chip' }, 'default TBA card · add a meetup to replace it')
                )))
          );
        })
      );
    }
  });

  /* ================================ MONTHLY ================================ */
  var MonthlyPreview = createClass({
    render: function () {
      var d = dataOf(this.props), ga = this.props.getAsset;
      var list = (d.updates || []).slice().sort(function (a, b) { return toIso(b.month).localeCompare(toIso(a.month)); });

      function person(p, role, cls, key) {
        return h('article', { className: 'card speaker-card', key: key },
          Img('speaker-card__avatar', assetUrl(ga, p.image), 'Portrait of ' + str(p.name), initials(p.name)),
          h('div', { className: 'card__body' },
            h('h3', { className: 'card__title' }, p.name || 'Name'),
            h('span', { className: 'badge ' + cls }, role),
            p.linkedin ? h('p', { className: 'card__text' }, h('a', { className: 'icon-link', href: safeHref(p.linkedin) }, icon(P.linkedin), 'LinkedIn')) : null,
            p.topic ? h('p', { className: 'card__text' }, p.topic) : null));
      }
      function group(title, grid, items, role, cls) {
        if (!items || !items.length) return null;
        return h('div', { className: 'event-group' },
          h('div', { className: 'event-group__header' }, h('h3', { className: 'event-group__title' }, title)),
          h('div', { className: 'grid ' + grid }, items.map(function (p, i) {
            return person(p, (p.role || role) + (p.role ? '' : ' ' + (i + 1)), cls, i);
          })));
      }

      return h(Shell, { label: 'Past Events page · Monthly Updates (newest first)', path: 'Past_Event.html' },
        Navbar(''),
        h('section', { className: 'page-hero' },
          h('h1', null, 'Past Events'),
          h('p', null, 'Recaps, speakers and recordings from every AI-SEC meetup.'),
          list.length ? h('nav', { className: 'archive-nav' }, list.map(function (u, i) {
            return h('a', { key: i, href: '#' }, monthLabel(u.month) + (u.host ? ' · ' + u.host : ''));
          })) : null),
        list.length ? null : h('section', { className: 'section' }, h('div', { className: 'container' },
          h('div', { className: 'pv-empty' }, 'No monthly updates yet. Click “Add monthly meetups +” and fill it — it appears here live.'))),
        list.map(function (u, i) {
          var label = monthLabel(u.month);
          return h('section', { className: 'section section--tint month-block', key: i },
            h('div', { className: 'container' },
              h('div', { className: 'month-block__header' },
                h('div', { className: 'month-block__meta' },
                  h('span', { className: 'badge badge--accent' }, u.chapter || 'Past Event'),
                  u.host ? h('span', { className: 'badge' }, u.host) : null),
                h('h2', { className: 'section__title' }, 'AI-SEC Community — ' + label),
                h('p', { className: 'section__subtitle' }, u.summary || '')),
              u.groupPhoto ? h('article', { className: 'card', style: { marginBottom: '2.5rem' } },
                Img('card__image', assetUrl(ga, u.groupPhoto), 'Group photo of attendees, ' + label, 'Group')) : null,
              group('Session Speakers', 'grid-2c', u.speakers, 'Session Speaker', 'badge--accent'),
              group(u.panelTitle ? 'Panel Discussion: "' + u.panelTitle + '"' : 'Panel Discussion', 'grid-4c', u.panel, 'Panel Speaker', ''),
              group('Flash Mentoring', 'grid-4c', u.mentors, 'Flash Mentor', 'badge--muted'),
              u.youtubeUrl ? h('p', null, h('a', { className: 'btn btn-secondary', href: safeHref(u.youtubeUrl) }, 'Watch Recording')) : null
            ));
        })
      );
    }
  });

  /* ================================ PARTNERS ================================ */
  var PartnersPreview = createClass({
    render: function () {
      var d = dataOf(this.props), ga = this.props.getAsset, list = d.partners || [];
      return h(Shell, { label: 'Community Partners page · ' + list.length + ' partner' + (list.length === 1 ? '' : 's'), path: 'Community Partners.html' },
        Navbar(''),
        h('section', { className: 'page-hero' },
          h('h1', null, 'Our Community Partners'),
          h('p', null, 'Organisations that back hands-on AI security learning across India.')),
        h('section', { className: 'section section--alt' }, h('div', { className: 'container' },
          list.length ? h('div', { className: 'partners-list' }, list.map(function (p, i) {
            return h('div', { className: 'partner-row', key: i },
              h('div', { className: 'partner-row__logo' }, Img('', assetUrl(ga, p.logo), str(p.name) + ' logo', initials(p.name))),
              h('div', { className: 'partner-row__body' },
                h('h3', null, p.name || 'Partner name'),
                h('p', null, p.description || ''),
                h('a', { className: 'partner-row__link', href: safeHref(p.url) }, 'Find out more →'),
                p.url && !isUrl(p.url) ? h('div', null, h('span', { className: 'pv-chip' }, '⚠ website must start with https://')) : null));
          })) : h('div', { className: 'pv-empty' }, 'No partners yet. Click “Add partners +” — each one shows up here as you type.')
        ))
      );
    }
  });

  /* ------------------------------- register ------------------------------- */
  CMS.registerPreviewStyle('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');
  CMS.registerPreviewStyle(new URL('preview.css?v=2', location.href).href);
  CMS.registerPreviewTemplate('settings', SettingsPreview);
  CMS.registerPreviewTemplate('upcoming', UpcomingPreview);
  CMS.registerPreviewTemplate('monthly', MonthlyPreview);
  CMS.registerPreviewTemplate('partners', PartnersPreview);
})();
