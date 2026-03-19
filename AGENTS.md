# AGENTS.md

## Cursor Cloud specific instructions

This is a single-service Node.js personal website (Express). See `README.md` for full documentation.

### Quick reference

- **Install deps:** `npm install`
- **Run server:** `npm start` (port 3000 by default, override with `PORT=XXXX`)
- **No build step required** — static HTML/CSS/JS served directly by Express.
- **No database** — data persists to `data/racecalls.json` (auto-created on first run).
- **No lint/test framework configured** — the codebase has no ESLint config or test runner.

### Auth in development

When `CLOUD_PASSWORD` is unset and requests come from `localhost`, mutating API routes (`POST/PUT/DELETE /api/racecalls`, `/api/resume`) work without authentication. No secrets are needed for local development.

### Caveats

- The `data/` directory is gitignored; the server creates it and seeds `racecalls.json` automatically on startup if missing.
- `npm run seo:inject` only needs to be run if `site-origin.json` is changed (not part of normal dev workflow).
- Writing style rules are in `style.md` (notably: no em dashes).
