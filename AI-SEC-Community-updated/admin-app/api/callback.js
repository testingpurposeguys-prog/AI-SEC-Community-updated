// Finishes GitHub OAuth and hands the token back to the dashboard window.
// The token is only ever posted to THIS site's own origin (never '*' or the
// sender's origin), and the response page runs under a nonce-based CSP.
const crypto = require('crypto');

const sameStr = (a, b) => {
  const x = Buffer.from(String(a || '')), y = Buffer.from(String(b || ''));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};
const jsLiteral = (v) => JSON.stringify(v)
  .replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')
  .replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

module.exports = async (req, res) => {
  const origin = String(process.env.ADMIN_ORIGIN || ('https://' + req.headers.host)).replace(/\/+$/, '');
  const nonce = crypto.randomBytes(16).toString('base64');

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Security-Policy',
    `default-src 'none'; script-src 'nonce-${nonce}'; base-uri 'none'; frame-ancestors 'none'`);
  // one-time state: clear it whatever happens
  res.setHeader('Set-Cookie', 'oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/api; Max-Age=0');

  const send = (status, msg, content) => {
    const ok = status === 200;
    const payload = 'authorization:github:' + (ok ? 'success' : 'error') + ':' + JSON.stringify(content);
    res.status(status).send(`<!doctype html><meta charset="utf-8"><title>AI-SEC Admin</title>
<script nonce="${nonce}">
(function(){
  var origin = ${jsLiteral(origin)};
  var msg = ${jsLiteral(payload)};
  if (!window.opener) return;
  function receive(e){
    if (e.origin !== origin) return;
    window.opener.postMessage(msg, origin);
    window.removeEventListener('message', receive, false);
  }
  window.addEventListener('message', receive, false);
  window.opener.postMessage('authorizing:github', origin);
})();
</script><p>${msg}</p>`);
  };

  const { code, state } = req.query || {};
  const raw = (req.headers.cookie || '').split(/;\s*/).find((c) => c.startsWith('oauth_state='));
  const saved = raw ? raw.slice('oauth_state='.length) : '';
  if (typeof code !== 'string' || typeof state !== 'string' || !/^[0-9a-f]{48}$/.test(state) || !sameStr(saved, state)) {
    return send(400, 'Login failed (invalid state). Close this window and try again.', { message: 'invalid state' });
  }
  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    return send(500, 'OAuth is not configured.', { message: 'not configured' });
  }
  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 10000);
    const r = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      signal: ctl.signal,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      })
    });
    clearTimeout(timer);
    const d = await r.json();
    if (!d || typeof d.access_token !== 'string') return send(400, 'GitHub login failed.', { message: 'no token' });
    send(200, 'Login successful. You can close this window.', { token: d.access_token, provider: 'github' });
  } catch (e) {
    send(500, 'Server error.', { message: 'server error' });
  }
};
