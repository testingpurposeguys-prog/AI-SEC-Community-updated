/* ==========================================================================
   AI-SEC Community — shared navbar + footer (single source of truth)

   Every page just has:
       <script src="js/site-chrome.js"></script>      (in <head>, no defer)
       <site-header></site-header>                     (where the navbar goes)
       <site-footer></site-footer>                     (where the footer goes)

   To change a menu link, the Register button URL, a social link or any
   styling, edit THIS file only — all pages update together.

   Navbar and footer live in a Shadow DOM, so page-level CSS can never
   change how they look. Pure static JS, no build step, works on any host
   (and on file:// when you open the pages straight from disk).
   ========================================================================== */
(function () {
  'use strict';

  /* ---------------------------------------------------------------- CONFIG */
  var CONFIG = {
    logo: 'assets/images/logo.png',
    home: 'index.html',
    registerUrl: 'https://luma.com/b2uauwct',
    registerLabel: 'Register Now',
    tagline: 'Securing the age of AI, together.',
    themeKey: 'ai-sec-theme',
    nav: [
      { label: 'Home', href: 'index.html' },
      { label: 'About', href: 'about.html' },
      { label: 'Chapters', href: 'Chapters.html' },
      { label: 'Virtual Meetup', href: 'Virtual Meetups.html' },
      { label: 'Hackathon', href: 'Hackathon.html' },
      { label: 'Community Partners', href: 'Community Partners.html' }
    ],
    // Pages that are not in the menu but belong under one of its items
    // (keeps the right menu item highlighted). Keys are lowercase file names.
    parentOf: {
      'past_event.html': 'chapters.html',
      'chennai past event.html': 'chapters.html',
      'hyderabad past event.html': 'chapters.html',
      'pune past event.html': 'chapters.html'
    },
    social: [
      { label: 'LinkedIn', href: 'https://www.linkedin.com/company/ai-sec-community/?viewAsMember=true',
        path: 'M4.98 3.5C4.98 4.881 3.87 6 2.5 6S0 4.881 0 3.5 1.12 1 2.5 1s2.48 1.119 2.48 2.5zM.24 8.25h4.5V23H.24V8.25zM8.02 8.25h4.31v2.01h.06c.6-1.14 2.07-2.34 4.26-2.34 4.56 0 5.4 3 5.4 6.9V23h-4.5v-6.75c0-1.61-.03-3.68-2.24-3.68-2.25 0-2.59 1.75-2.59 3.56V23h-4.5V8.25z' },
      { label: 'YouTube', href: 'https://www.youtube.com/@AI-PentestingRD',
        path: 'M23.498 6.186a2.994 2.994 0 0 0-2.107-2.117C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.391.524A2.994 2.994 0 0 0 .502 6.186 31.26 31.26 0 0 0 0 12a31.26 31.26 0 0 0 .502 5.814 2.994 2.994 0 0 0 2.107 2.117c1.886.524 9.391.524 9.391.524s7.505 0 9.391-.524a2.994 2.994 0 0 0 2.107-2.117A31.26 31.26 0 0 0 24 12a31.26 31.26 0 0 0-.502-5.814zM9.75 15.568V8.432L15.818 12l-6.068 3.568z' },
      { label: 'WhatsApp', href: 'https://chat.whatsapp.com/Je6FdiOAhg59l80TBUSzJm',
        path: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .16 5.304.157 11.893c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.582 0 11.885-5.304 11.888-11.893a11.821 11.821 0 0 0-3.418-8.452' }
    ]
  };

  /* ----------------------------------------------------------------- THEME */
  var root = document.documentElement;
  var ICONS = { dark: '\u263E', light: '\u2600' };

  function storedTheme() {
    try { return window.localStorage.getItem(CONFIG.themeKey); } catch (e) { return null; }
  }
  function saveTheme(t) {
    try { window.localStorage.setItem(CONFIG.themeKey, t); } catch (e) { /* private mode: just don't persist */ }
  }
  function currentTheme() {
    return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }
  // Dark is the brand default; only a saved "light" overrides it.
  root.setAttribute('data-theme', storedTheme() === 'light' ? 'light' : 'dark');

  /* ----------------------------------------------------------------- FONTS */
  // Navbar/footer need Poppins, Inter and JetBrains Mono on every page.
  (function loadFonts() {
    var href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap';
    var l1 = document.createElement('link'); l1.rel = 'preconnect'; l1.href = 'https://fonts.googleapis.com';
    var l2 = document.createElement('link'); l2.rel = 'preconnect'; l2.href = 'https://fonts.gstatic.com'; l2.crossOrigin = '';
    var l3 = document.createElement('link'); l3.rel = 'stylesheet'; l3.href = href;
    document.head.appendChild(l1); document.head.appendChild(l2); document.head.appendChild(l3);
  })();

  /* --------------------------------------------------------------- HELPERS */
  function fileName() {
    var f = location.pathname.split('/').pop() || 'index.html';
    try { f = decodeURIComponent(f); } catch (e) { /* keep raw */ }
    f = f.toLowerCase();
    if (f.indexOf('.') === -1) f += '.html';      // hosts with "clean URLs" (/about)
    return f;
  }
  function activeFile() {
    var f = fileName();
    return CONFIG.parentOf[f] || f;
  }
  function enc(href) { return href.replace(/ /g, '%20'); }

  /* ---------------------------------------------------------------- STYLES */
  var TOKENS = [
    ':host{',
    '  --brand:#9930f6; --brand-deep:#6b1fcc; --brand-hover:#b266f8;',
    '  --bg:#1a1a2e; --surface:#26264a; --border:#3a3a5c; --text:#f5f3fa; --text-2:#ada8c7;',
    '  --shadow-subtle:0 1px 2px rgba(0,0,0,.35);',
    '  --f-bg:#12101b; --f-line:#2b2740; --f-text:#eceaf2; --f-muted:#a7a2bc; --f-accent:#a855f7;',
    '  --ease:cubic-bezier(.4,0,.2,1);',
    '  font-family:"Inter",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;',
    '  font-size:16px; line-height:1.5; font-weight:400; text-align:left;',
    '  -webkit-font-smoothing:antialiased; text-size-adjust:100%;',
    '}',
    ':host([data-theme="light"]){',
    '  --brand-hover:#6b1fcc;',
    '  --bg:#ffffff; --surface:#ffffff; --border:#e3d9f5; --text:#1a1a2e; --text-2:#55506b;',
    '  --shadow-subtle:0 1px 2px rgba(26,26,46,.08);',
    '  --f-bg:#f0ecf7; --f-line:#e3dcf0; --f-text:#1d1730; --f-muted:#675e80;',
    '}',
    '*,*::before,*::after{box-sizing:border-box}',
    'a{color:inherit;text-decoration:none}',
    'img,svg{display:block;max-width:100%}',
    'button{font:inherit;color:inherit;background:none;border:0;margin:0;padding:0;cursor:pointer}',
    'h3,p{margin:0}',
    '.container{width:100%;max-width:1920px;margin-inline:auto;padding-inline:clamp(16px,4.2vw,88px)}',
        ':focus-visible{outline:2px solid var(--brand);outline-offset:3px}'
  ].join('\n');

  var HEADER_CSS = TOKENS + '\n' + [
    ':host{display:block;position:sticky;top:0;z-index:100}',
    '.navbar{position:relative;background-color:var(--bg);',
    '  -webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);',
    '  border-bottom:1px solid var(--border);',
    '  transition:background-color 250ms var(--ease),box-shadow 250ms var(--ease);',
    '  animation:navbar-drop .6s var(--ease) both}',
    '.navbar::before{content:"";position:absolute;top:0;left:0;right:0;height:2px;',
    '  background:linear-gradient(90deg,var(--brand),var(--brand-deep),var(--brand));',
    '  background-size:200% auto;opacity:.9;animation:navbar-accent-pan 8s linear infinite}',
    '@keyframes navbar-accent-pan{to{background-position:200% center}}',
    '@keyframes navbar-drop{from{transform:translateY(-100%);opacity:0}to{transform:translateY(0);opacity:1}}',
    '.navbar--scrolled{background-color:color-mix(in srgb,var(--bg) 90%,transparent);box-shadow:var(--shadow-subtle)}',
    '.navbar--scrolled .navbar__inner{padding-block:.6rem}',
    '.navbar__inner{display:flex;flex-wrap:nowrap;align-items:center;justify-content:space-between;gap:16px;padding-block:1rem;',
    '  transition:padding-block 250ms var(--ease)}',
    '.navbar__logo{display:flex;align-items:center;gap:12px;font-family:"Poppins",sans-serif;font-weight:700;',
    '  font-size:1.25rem;letter-spacing:.01em;color:var(--text);transition:color 150ms var(--ease)}',
    '.navbar__logo:hover{color:var(--brand)}',
    '.navbar__logo img{height:46px;width:auto;transition:transform 250ms var(--ease)}',
    '.navbar__logo:hover img{transform:rotate(-8deg) scale(1.08)}',
    '.navbar__logo,.navbar__actions{flex-shrink:0}',
    '.navbar__wordmark{white-space:nowrap}',
    '.navbar__links{display:flex;align-items:center;gap:clamp(14px,1.7vw,26px);font-size:.92rem;font-weight:500;letter-spacing:.01em}',
    '.navbar__links a{position:relative;color:var(--text-2);padding-block:.35rem;white-space:nowrap;transition:color 150ms var(--ease)}',
    '.navbar__links a::after{content:"";position:absolute;left:50%;bottom:-1px;width:0;height:2px;',
    '  background:linear-gradient(90deg,var(--brand),var(--brand-deep));border-radius:999px;',
    '  transform:translateX(-50%);transition:width 250ms var(--ease)}',
    '.navbar__links a:hover,.navbar__links a.is-active{color:var(--text)}',
    '.navbar__links a:hover::after,.navbar__links a.is-active::after{width:100%}',
    '@media (min-width:1101px){',
    '  .navbar__links a{animation:navlink-in .5s var(--ease) both}',
    '  .navbar__links a:nth-child(1){animation-delay:.08s}.navbar__links a:nth-child(2){animation-delay:.14s}',
    '  .navbar__links a:nth-child(3){animation-delay:.2s}.navbar__links a:nth-child(4){animation-delay:.26s}',
    '  .navbar__links a:nth-child(5){animation-delay:.32s}.navbar__links a:nth-child(6){animation-delay:.38s}',
    '}',
    '@keyframes navlink-in{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}',
    '.navbar__actions{display:flex;align-items:center;gap:1rem}',
    /* Register button */
    '.navbar__cta{display:inline-flex;align-items:center;justify-content:center;padding:.5rem 1.5rem;',
    '  border-radius:999px;border:2px solid transparent;background-color:var(--brand);color:#fff;',
    '  font-family:"Inter",sans-serif;font-weight:500;font-size:.875rem;white-space:nowrap;',
    '  transition:background-color 250ms var(--ease),transform 150ms var(--ease),box-shadow 150ms var(--ease)}',
    '.navbar__cta:hover{background-color:var(--brand-hover);transform:translateY(-2px);',
    '  box-shadow:0 8px 20px color-mix(in srgb,var(--brand) 45%,transparent)}',
    '.navbar__cta--mobile{display:none}',
    /* Theme toggle */
    '.theme-toggle{display:inline-flex;align-items:center;justify-content:center;width:2.25rem;height:2.25rem;',
    '  border-radius:999px;border:1px solid var(--border);color:var(--text);',
    '  transition:border-color 150ms var(--ease),background-color 150ms var(--ease),transform 150ms var(--ease)}',
    '.theme-toggle:hover{background-color:var(--surface);border-color:var(--brand);transform:rotate(15deg)}',
    '.theme-toggle span{display:inline-block;transition:transform 400ms var(--ease)}',
    ':host([data-theme="light"]) .theme-toggle span{transform:rotate(180deg)}',
    /* Hamburger */
    '.navbar__toggle{display:none;flex-direction:column;justify-content:center;gap:5px;width:2.25rem;height:2.25rem;',
    '  transition:transform 150ms var(--ease)}',
    '.navbar__toggle:hover{transform:scale(1.08)}',
    '.navbar__toggle span{display:block;height:2px;width:100%;background-color:var(--text);border-radius:4px;',
    '  transition:transform 150ms var(--ease),opacity 150ms var(--ease),background-color 150ms var(--ease)}',
    '.navbar__toggle:hover span{background-color:var(--brand)}',
    '.navbar__toggle.is-open span:nth-child(1){transform:translateY(7px) rotate(45deg)}',
    '.navbar__toggle.is-open span:nth-child(2){opacity:0}',
    '.navbar__toggle.is-open span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}',
    /* Mobile menu */
    '@media (max-width:768px){.navbar__logo{gap:10px;font-size:20px}.navbar__logo img{height:40px}}',
    '@media (max-width:1100px){',
    '  .navbar__links{position:absolute;top:100%;left:0;right:0;flex-direction:column;align-items:flex-start;',
    '    gap:1rem;padding:1.5rem;background-color:var(--bg);border-bottom:1px solid var(--border);',
    '    transform:translateY(-8px);opacity:0;visibility:hidden;',
    '    transition:transform 250ms var(--ease),opacity 250ms var(--ease),visibility 250ms var(--ease)}',
    '  .navbar__links.is-open{transform:translateY(0);opacity:1;visibility:visible}',
    '  .navbar__links a{opacity:0;transform:translateX(-8px);transition:opacity 250ms var(--ease),transform 250ms var(--ease),color 150ms var(--ease)}',
    '  .navbar__links.is-open a{opacity:1;transform:translateX(0)}',
    '  .navbar__links.is-open a:nth-child(1){transition-delay:.03s}.navbar__links.is-open a:nth-child(2){transition-delay:.07s}',
    '  .navbar__links.is-open a:nth-child(3){transition-delay:.11s}.navbar__links.is-open a:nth-child(4){transition-delay:.15s}',
    '  .navbar__links.is-open a:nth-child(5){transition-delay:.19s}.navbar__links.is-open a:nth-child(6){transition-delay:.23s}',
    '  .navbar__links.is-open a:nth-child(7){transition-delay:.27s}',
    '  .navbar__actions .navbar__cta{display:none}',
    '  .navbar__links .navbar__cta--mobile{display:inline-flex;margin-top:.5rem;color:#fff}',
    '  .navbar__toggle{display:flex}',
    '}',
    '@media (max-width:480px){.navbar__logo img{height:34px}}',
    '@media (max-width:360px){.navbar__wordmark{display:none}}',
    '@media (prefers-reduced-motion:reduce){',
    '  .navbar,.navbar::before,.navbar__links a{animation:none}',
    '  .navbar__logo:hover img,.theme-toggle:hover,.navbar__toggle:hover,.navbar__cta:hover{transform:none}',
    '  .theme-toggle span{transition:none}',
    '}'
  ].join('\n');

  var FOOTER_CSS = TOKENS + '\n' + [
    ':host{display:block;position:relative;z-index:1}',
    '.site-footer{border-top:1px solid var(--f-line);background:var(--f-bg);color:var(--f-text);padding:44px 0 24px}',
    '.footer__grid{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:32px;margin-bottom:32px}',
    '.footer__logo{display:flex;align-items:center;gap:10px;font-weight:700;font-size:1rem;margin-bottom:10px;color:var(--f-text)}',
    '.footer__logo img{width:28px;height:28px;flex-shrink:0}',
    '.footer__tagline{color:var(--f-muted);font-size:.9rem}',
    '.footer__heading{font-family:"JetBrains Mono",ui-monospace,monospace;font-size:.82rem;font-weight:500;',
    '  color:var(--f-muted);margin:0 0 12px;letter-spacing:normal;text-transform:none;line-height:1.5}',
    '.footer__links{display:flex;flex-direction:column;gap:9px}',
    '.footer__links a{color:var(--f-text);font-size:.92rem;width:fit-content;transition:color .2s ease}',
    '.footer__links a:hover{color:var(--f-accent)}',
    '.footer__social{display:flex;gap:14px}',
    '.footer__social a{color:var(--f-muted);transition:color .2s ease,transform .2s ease}',
    '.footer__social a:hover{color:var(--f-accent);transform:translateY(-2px)}',
    '@media (max-width:820px){.footer__grid{grid-template-columns:1fr 1fr}.footer__brand{grid-column:1/-1}}',
    '@media (max-width:520px){.footer__grid{grid-template-columns:1fr;gap:24px}}',
    '@media (prefers-reduced-motion:reduce){.footer__social a:hover{transform:none}}'
  ].join('\n');

  /* ---------------------------------------------------------------- MARKUP */
  function headerHTML() {
    var active = activeFile();
    var links = CONFIG.nav.map(function (n) {
      var on = n.href.toLowerCase() === active;
      return '<a href="' + enc(n.href) + '"' + (on ? ' class="is-active" aria-current="page"' : '') + '>' + n.label + '</a>';
    }).join('');
    return '' +
      '<header class="navbar">' +
        '<div class="container navbar__inner">' +
          '<a href="' + CONFIG.home + '" class="navbar__logo">' +
            '<img src="' + CONFIG.logo + '" alt="AI-SEC Community logo" width="46" height="46">' +
            '<span class="navbar__wordmark">AI-SEC COMMUNITY</span>' +
          '</a>' +
          '<nav class="navbar__links" id="primary-nav" aria-label="Primary">' + links +
            '<a href="' + CONFIG.registerUrl + '" class="navbar__cta navbar__cta--mobile">' + CONFIG.registerLabel + '</a>' +
          '</nav>' +
          '<div class="navbar__actions">' +
            '<a href="' + CONFIG.registerUrl + '" class="navbar__cta">' + CONFIG.registerLabel + '</a>' +
            '<button type="button" class="theme-toggle" data-theme-toggle aria-label="Switch to light mode" aria-pressed="false"><span aria-hidden="true">' + ICONS.dark + '</span></button>' +
            '<button type="button" class="navbar__toggle" data-nav-toggle aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="primary-nav"><span></span><span></span><span></span></button>' +
          '</div>' +
        '</div>' +
      '</header>';
  }

  function footerHTML() {
    var links = CONFIG.nav.map(function (n) {
      return '<a href="' + enc(n.href) + '">' + n.label + '</a>';
    }).join('');
    var social = CONFIG.social.map(function (s) {
      return '<a href="' + s.href + '" target="_blank" rel="noopener" aria-label="AI-SEC Community on ' + s.label + '">' +
        '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="' + s.path + '"/></svg></a>';
    }).join('');
    return '' +
      '<footer class="site-footer">' +
        '<div class="container">' +
          '<div class="footer__grid">' +
            '<div class="footer__brand">' +
              '<a href="' + CONFIG.home + '" class="footer__logo">' +
                '<img src="' + CONFIG.logo + '" alt="AI-SEC Community logo" width="28" height="28">AI-SEC Community' +
              '</a>' +
              '<p class="footer__tagline">' + CONFIG.tagline + '</p>' +
            '</div>' +
            '<nav aria-label="Footer navigation">' +
              '<h3 class="footer__heading">Explore</h3>' +
              '<div class="footer__links">' + links + '</div>' +
            '</nav>' +
            '<div>' +
              '<h3 class="footer__heading">Community</h3>' +
              '<div class="footer__social">' + social + '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</footer>';
  }

  /* ------------------------------------------------------------- BEHAVIOUR */
  // Keep each element's data-theme in sync with <html data-theme> so the
  // Shadow DOM styles can switch light/dark.
  var chromeEls = [];
  function syncTheme() {
    var t = currentTheme();
    chromeEls.forEach(function (el) {
      el.setAttribute('data-theme', t);
      var btn = el.shadowRoot && el.shadowRoot.querySelector('[data-theme-toggle]');
      if (btn) {
        btn.setAttribute('aria-pressed', String(t === 'light'));
        btn.setAttribute('aria-label', 'Switch to ' + (t === 'light' ? 'dark' : 'light') + ' mode');
        btn.querySelector('span').textContent = ICONS[t];
      }
    });
  }
  new MutationObserver(syncTheme).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

  var FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function wireHeader(host, sr) {
    var navbar = sr.querySelector('.navbar');
    var menu = sr.getElementById ? sr.getElementById('primary-nav') : sr.querySelector('#primary-nav');
    var toggle = sr.querySelector('[data-nav-toggle]');
    var themeBtn = sr.querySelector('[data-theme-toggle]');

    themeBtn.addEventListener('click', function () {
      var next = currentTheme() === 'light' ? 'dark' : 'light';
      root.classList.add('theme-transition');   // smooth colour fade (see reset.css)
      window.setTimeout(function () { root.classList.remove('theme-transition'); }, 300);
      root.setAttribute('data-theme', next);   // observer updates the chrome
      saveTheme(next);
    });

    function isOpen() { return menu.classList.contains('is-open'); }
    function onKey(e) {
      if (e.key === 'Escape') { close(true); return; }
      if (e.key !== 'Tab') return;
      var items = Array.prototype.slice.call(menu.querySelectorAll(FOCUSABLE));
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1], cur = sr.activeElement;
      if (e.shiftKey && cur === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && cur === last) { e.preventDefault(); first.focus(); }
    }
    function open() {
      menu.classList.add('is-open'); toggle.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      document.addEventListener('keydown', onKey);
      var items = menu.querySelectorAll(FOCUSABLE); if (items.length) items[0].focus();
    }
    function close(restore) {
      menu.classList.remove('is-open'); toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.removeEventListener('keydown', onKey);
      if (restore) toggle.focus();
    }
    toggle.addEventListener('click', function () { isOpen() ? close() : open(); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) close(); });
    window.addEventListener('resize', function () { if (window.innerWidth > 1100 && isOpen()) close(); });

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return; ticking = true;
      window.requestAnimationFrame(function () {
        navbar.classList.toggle('navbar--scrolled', window.scrollY > 50);
        ticking = false;
      });
    }, { passive: true });
  }

  function define(tag, css, html, wire) {
    if (window.customElements.get(tag)) return;
    window.customElements.define(tag, class extends HTMLElement {
      connectedCallback() {
        if (this.shadowRoot) return;
        var sr = this.attachShadow({ mode: 'open' });
        sr.innerHTML = '<style>' + css + '</style>' + html();
        chromeEls.push(this);
        if (wire) wire(this, sr);
        syncTheme();
      }
    });
  }

  define('site-header', HEADER_CSS, headerHTML, wireHeader);
  define('site-footer', FOOTER_CSS, footerHTML, null);
})();
