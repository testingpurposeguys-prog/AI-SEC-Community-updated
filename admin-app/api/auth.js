// Starts GitHub OAuth for the /admin dashboard (Vercel serverless function)
const crypto = require('crypto');

module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!process.env.GITHUB_CLIENT_ID) {
    res.status(500).send('OAuth is not configured.');
    return;
  }
  const state = crypto.randomBytes(24).toString('hex');
  res.setHeader('Set-Cookie',
    `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/api; Max-Age=600`);
  const p = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    // Least privilege: public_repo is enough for a public repo.
    // Set GITHUB_OAUTH_SCOPE=repo in Vercel ONLY if the repo is private.
    scope: process.env.GITHUB_OAUTH_SCOPE || 'public_repo',
    allow_signup: 'false',
    state
  });
  res.redirect(302, 'https://github.com/login/oauth/authorize?' + p);
};
