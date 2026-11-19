# AI-SEC Community

- `site/`      : public website (static HTML/CSS/JS) -> Vercel project "site", Root Directory = site
- `admin-app/` : Decap CMS admin dashboard + GitHub OAuth (api/auth.js, api/callback.js) -> Vercel project "admin", Root Directory = admin-app

Admin needs env vars on its Vercel project: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET.
Admin edits write to site/data/*.json and site/Images/uploads (see admin-app/config.yml).
