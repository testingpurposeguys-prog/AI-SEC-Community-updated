# Security notes

Admin (Vercel project "admin", Root Directory = admin-app) environment variables:
- GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET  (required)
- GITHUB_OAUTH_SCOPE  (default "public_repo"; set to "repo" ONLY if the GitHub repo is private)
- ADMIN_ORIGIN        (optional, e.g. https://admin-gules-zeta-69.vercel.app; pins where the login token may be posted)

Rotate the GitHub client secret if it was ever shared. Give write access on the repo only to real organizers
and turn on 2FA for them: anyone with a valid token can change the live website.
