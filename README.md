# Ryan McComb — personal site

Static HTML/CSS/vanilla JS pages served by a small **Express** app. The server adds JSON APIs (race calls, resume editing), rate limiting, and Helmet; everything else is flat files.

**Live site:** origin is set in [`site-origin.json`](site-origin.json) (currently `https://ryanjmccomb.com`).

---

## Run locally

```bash
npm install
npm start
```

Default port is **3000**. Override with `PORT=1000 npm start` (or any port).

Open `http://localhost:3000/` — extensionless URLs work (e.g. `/about`) because static middleware uses `extensions: ['html']`.

---

## Site map (pages)

| Path | File | Notes |
|------|------|--------|
| `/` | `index.html` | Home, hero, featured links |
| `/about` | `about.html` | Bio, contact grid (email copy, GitHub, LinkedIn, X/Twitter, Manifold), race-call preview |
| `/experience` | `experience.html` | Work and projects |
| `/resume` | `resume.html` | Printable resume layout |
| `/writing` | `writing.html` | Writing index |
| `/writing/:slug` | `writing/*.html` | Hosted essay pages with shareable, indexable URLs |
| `/press` | `press.html` | Press coverage |
| `/now` | `now.html` | “Now” page |
| `/racecalls` | `racecalls.html` | Public race-call record; reads `GET /api/racecalls` |
| `/admin` | `admin.html` | Race-call admin UI (password gate + mutating APIs); `noindex` |
| *anything else* | `404.html` | Custom 404 with interactive Bayes toy (`js/bayes-404.js`) |

Shared UI: [`style.css`](style.css), [`js/nav.js`](js/nav.js) (site nav, mobile menu, hash scroll), [`js/animations.js`](js/animations.js), [`js/effects.js`](js/effects.js), [`js/cmdk.js`](js/cmdk.js) (⌘K / Ctrl+K command palette).

Other JS: [`js/timeline.js`](js/timeline.js) (experience timeline, if used on that page), [`js/writing.js`](js/writing.js), [`js/article.js`](js/article.js), [`js/site-data.js`](js/site-data.js).

Assets include `favicon.ico`, `apple-touch-icon.png`, `portrait.jpg` (and responsive variants), hero art (`SK-A-1892.webp`), etc.

---

## APIs (`server.js`)

All routes under `/api/` are rate-limited (general limiter). **`POST /api/auth`** uses a stricter limiter.

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/api/auth` | Body `password` vs `CLOUD_PASSWORD` (or localhost bypass) | Login check for admin-style flows |
| `GET` | `/api/racecalls` | No | JSON array of race call objects |
| `POST` | `/api/racecalls` | Bearer `CLOUD_PASSWORD` | Add a call |
| `PUT` | `/api/racecalls/:id` | Bearer | Update a call |
| `DELETE` | `/api/racecalls/:id` | Bearer | Remove a call |
| `GET` | `/api/resume` | Bearer | Returns `{ content }` (inner HTML of resume body) |
| `PUT` | `/api/resume` | Bearer | Replaces resume inner HTML |

**Auth behavior**

- If `CLOUD_PASSWORD` is unset and the request host is **localhost** / **127.0.0.1**, mutating routes can succeed without a token in development.
- In **production**, localhost bypass for mutating APIs only applies if `TRUST_LOCALHOST_AUTH=true`.
- If `CLOUD_PASSWORD` is unset and the host is not allowed, mutating APIs respond with **503** (“Cloud storage not configured”).

**Data directory**

- Race calls persist to `data/racecalls.json` in the repo, or **`/data/racecalls.json`** if a `/data` directory exists (typical for a mounted volume in production).
- Rows are meant to be **assigned** VoteHub decision-desk calls (a subset of what the organization projects), not the full desk slate. Public copy on `/racecalls` states this for readers.
- Each call may include optional fields such as `firstCaller` (`votehub` when VoteHub's decision desk called the race before AP, NYT, and DDHQ; otherwise empty; legacy rows may still have `ap` \| `nyt` \| `ddhq`), `sourceUrl` (paste a post or article URL for a public “Open link”: nothing is fetched automatically), and `primaryParty` (`dem` \| `rep` or empty; used with congressional primaries from `XX-C-##-DP` / `-RP` in admin).

---

## SEO and URLs

Canonical links, `og:url`, `og:image`, `twitter:image`, [`robots.txt`](robots.txt), and [`sitemap.xml`](sitemap.xml) are maintained to match [`site-origin.json`](site-origin.json). The inject script’s page list includes: index, about, experience, writing, press, now, racecalls, admin, resume, and 404 (404 canonical points at `/`).

After changing `origin`:

```bash
npm run seo:inject
```

Implementation: [`scripts/seo-inject.mjs`](scripts/seo-inject.mjs).

---

## Writing style

Editorial rules for copy (including **no em dashes**) are in [`style.md`](style.md).

---

## Environment variables

| Variable | Purpose |
|----------|---------|
| `PORT` | HTTP port (default `3000`) |
| `NODE_ENV` | Set to `production` in production (enables `trust proxy` for rate limiting behind a reverse proxy) |
| `CLOUD_PASSWORD` | Bearer secret for mutating `/api/*` and password check for `/api/auth` when not using localhost bypass |
| `TRUST_LOCALHOST_AUTH` | If `true`, allows unauthenticated mutating API access when the host is `localhost` / `127.0.0.1` **even in production** (e.g. SSH tunnel). Default: off. |
| `PUBLIC_SITE_URL` | Not read by the server; public URLs come from `site-origin.json` + `seo:inject`. |

---

## Security notes

- Use a long random `CLOUD_PASSWORD` in production.
- **Helmet** is enabled with safer defaults; **Content-Security-Policy** is off because many pages use inline scripts (tightening CSP would mean external scripts and/or nonces).
- Rate limiting applies to `/api/*`; `/api/auth` is stricter to slow password guessing.
- With `NODE_ENV=production`, the app sets `trust proxy` so client IP for limits can come from `X-Forwarded-For` when behind nginx or similar.

---

## Dependencies

From [`package.json`](package.json): **express**, **express-rate-limit**, **helmet**. Requires **Node ≥ 18**.

---

## Deploying

- **Full stack:** run `node server.js` (or `npm start`) with persistent storage for `data/` or `/data` if you rely on race calls or resume edits from the live APIs.
- **Static-only:** you can host the HTML/CSS/JS/assets on any static host, but **`/api/*`**, dynamic 404 routing, and admin/racecall/resume writes need the Node server (or a replacement that implements the same APIs).
