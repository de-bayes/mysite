# Ryan McComb: personal site

Static HTML/CSS/vanilla JS pages served by a small **Express** app. The server adds resume JSON APIs, OG image generation, rate limiting, and Helmet security headers. Everything else is flat files.

**Production:** the site runs on [**Vercel**](https://vercel.com/) (see [Deployment (Vercel)](#deployment-vercel)). Configure secrets and env in the Vercel project dashboard, not only in local `.env`.

**Domains:** [mccomb.ca](https://mccomb.ca) (primary) and [ryanjmccomb.com](https://ryanjmccomb.com) (secondary) both serve this deployment. The canonical origin is set in [`site-data/site-origin.json`](site-data/site-origin.json).

---

## Documentation

- **[AGENTS.md](AGENTS.md):** minimal entry for **coding agents**; links to the docs hub and maintenance log.
- **[Docs hub](docs/README.md):** index for humans and **coding agents** (read-first checklist, document map, common tasks, how to extend the maintenance log).
- **[Maintenance log](docs/maintenance-log.md):** timeline, session notes (including **Session 4**, 2026-04-03: static race-call copy, admin removal), verification commands, and project facts.
- **[Style guide](style.md):** punctuation and voice (including **no em dashes**).

---

## Quick start

```bash
npm install
cp .env.example .env    # then fill in CLOUD_PASSWORD if you need resume API access
npm start               # http://localhost:1123
```

Override the port with `PORT=3000 npm start`. Extensionless URLs work (e.g. `/about`) because Express static middleware uses `extensions: ['html']`.

---

## Project structure

```
mysite/
  index.html, about.html, ...   root HTML pages
  style.css                     Single stylesheet (~2,500 lines, all pages)
  js/
    shared/                     Scripts loaded on most pages (site-data, nav, animations, effects)
    pages/                      Page-specific scripts (timeline, writing, article, bayes-404, about, press, photos)
  fonts/                        Self-hosted Inter + DM Sans (woff2)
  images/
    heroes/                     Page hero images with responsive variants (char-swiss, experience-hero, writing-hero)
    portraits/                  Portrait photos (about-portrait, portrait, portrait-press)
    og/                         Social media OG images (og-home)
    logos/                      Active logos (votehub-logo)
    _unused/                    Deprecated assets (art, heroes, logos, portraits)
  writing/                      Hosted essay subpages (each is a folder with index.html)
  site-data/                    Site config JSON (canonical origin, race-call summary); not browsable at `/site-data/*`
  scripts/                      Build/maintenance scripts
  test/                         Node.js test runner tests
  AGENTS.md                     Short pointer for coding agents (see docs/README.md)
  docs/                         docs/README.md (hub) + maintenance-log.md for agents and maintainers
  server.js                     Express app (APIs, static serving, Helmet, rate limiting)
  vercel.json                   Vercel deployment config
  style.md                      Writing and punctuation style guide
  resume.md                     Resume source content (Markdown)
  .env.example                  Environment variable template
```

---

## Pages

| Path             | File                   | Description                                                                                                                              |
| ---------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `/`              | `index.html`           | Home. Full-bleed hero photo (airplane/Switzerland), floating name card, featured links.                                                  |
| `/about`         | `about.html`           | Bio, portrait, contact grid (email, GitHub, LinkedIn, X/Twitter, Manifold).                                                              |
| `/experience`    | `experience.html`      | Timeline layout with VoteHub, IL9Cast, campaigns, photography, podcast. Expandable cards.                                                |
| `/resume`        | `resume.html`          | Printable resume. Editable via `/api/resume` when `CLOUD_PASSWORD` is set. Print stylesheet included.                                    |
| `/writing`       | `writing.html`         | Article index with category/tag/publication filters. Cards link to hosted essays or external URLs.                                       |
| `/writing/:slug` | `writing/*/index.html` | Individual hosted essays with reading progress bar. Currently: il9cast-postmortem, peoples-edict, median-voter-theory, nsa-surveillance. |
| `/press`         | `press.html`           | Press coverage and media features.                                                                                                       |
| `/photos`        | `photos.html`          | Photography portfolio: 6 photos (Canon R8, prime lenses), navigable by swipe, click arrows, or keyboard.                                 |
| `/projects`      | `projects.html`        | Projects index: Bayes64, IL9Cast, and Project 2028.                                                                                      |
| `*`              | `404.html`             | Custom 404 with an interactive Bayes' theorem calculator.                                                                                |

**Retired URLs:** `GET /now`, `/now/`, `/now.html`, `/racecalls`, and `/admin` respond with **301** to **`/`**.

---

## JavaScript files

All scripts are vanilla JS with no build step or bundler. They load via `<script>` tags at the bottom of each HTML page.

### Shared (loaded on every page)

| File                               | Purpose                                                                                                                                                                                                                                                                     |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `js/shared/nav-name-paint-hint.js` | **Loaded in `<head>` (no defer).** Reads `sessionStorage` and sets `data-nav-name-sticky` on `<html>` before first paint, preventing nav-name animation flash on same-page navigation.                                                                                      |
| `js/shared/site-data.js`           | **Single source of truth** for nav links and hosted essay metadata. Exposes `window.SITE_DATA` (consumed by nav).                                                                                                                                                           |
| `js/shared/nav.js`                 | Site navigation: mobile hamburger menu with focus trap and escape-to-close, scroll shadow on nav, smooth anchor scrolling, page transition animations (fade out/in for browsers without cross-document View Transitions). Injects a skip-to-content link for accessibility. |
| `js/shared/animations.js`          | Scroll-triggered `.animate-in` and `.stagger-children` reveal via IntersectionObserver. Respects `prefers-reduced-motion`.                                                                                                                                                  |
| `js/shared/effects.js`             | Animated number counters for `[data-count]` elements. Eases in with a quartic curve over 1.4s. Respects reduced motion.                                                                                                                                                     |

### Page-specific

| File                    | Used on             | Purpose                                                                                                                               |
| ----------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `js/pages/timeline.js`  | `/experience`       | Timeline entry scroll-reveal with staggered delays, click-to-expand cards, animated vertical line.                                    |
| `js/pages/writing.js`   | `/writing`          | Article filtering (category tabs, tag dropdown, publication dropdown), URL state persistence, newest-first sort, card click handlers. |
| `js/pages/article.js`   | `/writing/*` essays | Reading progress bar (thin orange line at top of viewport, tracks scroll position).                                                   |
| `js/pages/bayes-404.js` | `404.html`          | Interactive Bayes' theorem calculator: three sliders (prior and likelihoods) and live posterior output.                               |
| `js/pages/about.js`     | `/about`            | Email copy-to-clipboard with toast feedback.                                                                                          |
| `js/pages/press.js`     | `/press`            | Click-to-open handler for press cards (opens external links in a new tab).                                                            |
| `js/pages/photos.js`    | `/photos`           | Photo deck carousel: swipe, click-arrow, and keyboard-arrow navigation across 6 photo cards with CSS transform transitions.           |

### Script load order

`nav-name-paint-hint.js` loads in `<head>` (no defer) so it runs before first paint. `site-data.js` must load before `nav.js` since it reads `window.SITE_DATA`. The HTML files load them in this order:

```html
<!-- In <head>, no defer: -->
<script src="/js/shared/nav-name-paint-hint.js"></script>

<!-- At end of <body>: -->
<script src="js/shared/site-data.js"></script>
<script src="js/shared/nav.js"></script>
<script src="js/shared/animations.js"></script>
<script src="js/shared/effects.js"></script>
```

---

## CSS architecture

`style.css` is a single ~2,500-line file organized into named sections:

```
Fonts                    @font-face declarations + metric-adjusted fallbacks (top of file, no header)
Tokens                   CSS custom properties in :root (colors, spacing, typography, shadows)
Reset & Base             Box-sizing, base typography, smooth scrolling, focus styles
Navigation: Stained Glass Fixed nav, scroll shadow, mobile hamburger menu, page transitions
Hero                     Full-bleed hero image, gradient overlay, floating card
About Page               About page hero, contact grid
Page Layout: Subpages    Shared header pattern for experience/writing/press pages
Animations               Scroll-triggered reveal keyframes and classes
Experience: Timeline     Timeline layout, expandable cards, data counters
Writing Page             Writing cards, filter tabs, press cards, hosted essay layout
Photos page (deck)       Photo deck carousel layout and transitions
Contact Section          Contact grid used in About page
404 Page                 Error page, Bayes calculator
Premium Effects          Scroll animations, character reveal, stagger children
Reading Progress Bar     Thin progress bar for essay pages
Responsive               @media (max-width: 768px) overrides
Print                    @media print overrides
Resume page              Printable resume layout with @media print
```

### Design tokens (`:root`)

| Token                    | Value                    | Use                                               |
| ------------------------ | ------------------------ | ------------------------------------------------- |
| `--bg`                   | `#151515`                | Page background (charcoal dark)                   |
| `--surface`              | `#191919`                | Card/panel backgrounds                            |
| `--text`                 | `#e8e8e8`                | Primary text                                      |
| `--text-light`           | `#b3b3b3`                | Secondary text                                    |
| `--text-muted`           | `#888`                   | Tertiary/meta text                                |
| `--accent`               | `#fff`                   | Links, emphasis                                   |
| `--accent-orange`        | `#e06b1f`                | Selection highlight, progress bar, resume accents |
| `--border`               | `rgba(255,255,255,0.08)` | Subtle borders                                    |
| `--radius`               | `8px`                    | Standard corner radius                            |
| `--shadow-sm/md/lg`      | Various                  | Elevation levels                                  |
| `--font-main`            | Inter + fallbacks        | Primary typeface                                  |
| `--fs-*`                 | `0.67rem` to `1.05rem`   | Font size scale                                   |
| `--dur-fast/normal/slow` | `0.15s/0.3s/0.5s`        | Animation durations                               |

### Font strategy

Self-hosted Inter and DM Sans (woff2) with `font-display: swap` and metric-adjusted fallback `@font-face` declarations that match Arial to Inter/DM Sans metrics. This means zero layout shift on font load. Fonts are preloaded via `<link rel="preload">` in each HTML `<head>`.

### Responsive breakpoints

- **768px**: Primary mobile breakpoint. Nav switches to hamburger, hero adjusts, grids go single-column.
- **600px**: Minor adjustments (smaller paddings, tighter spacing).
- **Print**: Strips backgrounds, animations, nav. Forces black-on-white.

### Animation system

All animations respect `prefers-reduced-motion: reduce` (CSS and JS).

| Animation   | Used for                                         |
| ----------- | ------------------------------------------------ |
| `cardIn`    | Card entrance: 30px translate + fade (staggered) |
| `imgReveal` | Hero image: 1.04x scale down + fade              |

---

## Server (`server.js`)

Express app with three responsibilities: static file serving, JSON APIs, and security middleware.

### Middleware stack (in order)

1. **Helmet** with CSP, HSTS, and other security headers
2. **`express.json()`** for parsing request bodies
3. **Rate limiters**: general cap on `/api/*` (see `server.js` for window and max)
4. **API routes** (see below)
5. **File-blocking and redirect middleware**: blocks repo-internal paths, normalizes URLs (strips `.html`, trailing slashes)
6. **Express static** with `extensions: ['html']` for clean URLs
7. **500 error handler**
8. **404 handler** serving `404.html`

### API routes

| Method | Path          | Auth         | Purpose                    |
| ------ | ------------- | ------------ | -------------------------- |
| `GET`  | `/api/resume` | Bearer token | Read resume HTML content   |
| `PUT`  | `/api/resume` | Bearer token | Update resume HTML content |
| `GET`  | `/api/og`     | None         | Dynamic Open Graph PNG     |

### Authentication

- Bearer token checked against `CLOUD_PASSWORD` env var using `crypto.timingSafeEqual` (timing-safe comparison)
- **Localhost bypass**: If `CLOUD_PASSWORD` is unset and host is `localhost`/`127.0.0.1`, mutating routes succeed without auth (development only). In production, requires `TRUST_LOCALHOST_AUTH=true`.
- If `CLOUD_PASSWORD` is unset and host is not localhost, mutating routes return **503** ("Cloud storage not configured").

### Data persistence

`site-data/racecalls-summary.json` is still served at **`GET /racecalls-summary.json`** for external consumers (`aboutContactValue`, `nowRecord`, `nowAccuracy`). No page on the site currently reads it. Legacy `/racecalls` URLs **301** to **`/`**. Resume edits write directly to `resume.html` via regex replacement of the inner content div. Resume route file I/O uses `fs.promises`.

### Writing page discovery

`getWritingPages()` scans the `writing/` directory for subdirectories containing `index.html`. These are exposed as links on the writing page and included in SEO injection.

---

## Build scripts

### `npm run seo:inject` (scripts/seo-inject.mjs)

Reads `site-data/site-origin.json` and injects/updates across all HTML pages:

- `<link rel="canonical">` with correct origin
- `og:url`, `og:image`, `og:site_name` Open Graph tags
- `twitter:card`, `twitter:image`, `twitter:title`, `twitter:description`, `twitter:creator` tags
- `author` meta tag
- Regenerates `sitemap.xml` (with per-page lastmod from file mtime)
- Regenerates `robots.txt` (disallows `/api/`)

Run after changing the origin URL or adding new pages.

---

## Images

### Hero and page images

All hero/page images have responsive WebP variants (600w, 1200w) with JPG fallbacks, served via `<picture>` and `<source srcset>`:

| Image set                                  | Directory               | Used on                    | Subject                                                 |
| ------------------------------------------ | ----------------------- | -------------------------- | ------------------------------------------------------- |
| `char-swiss.*`                             | `images/heroes/`        | Home hero                  | Ryan on airplane, working on laptop (La Chaux-de-Fonds) |
| `about-portrait-*`                         | `images/portraits/`     | About hero                 | Portrait photo                                          |
| `experience-hero.*`                        | `images/heroes/`        | Experience header          | Hero photo                                              |
| `writing-hero.*`                           | `images/heroes/`        | Writing header             | Hero photo                                              |
| `portrait-press.*`                         | `images/portraits/`     | Press                      | Interview photo                                         |
| `portrait.*`                               | `images/portraits/`     | OG meta tags (default)     | Portrait photo                                          |
| `og-home.*`                                | `images/og/`            | Home OG meta tag           | Social preview image                                    |
| `votehub-logo.jpeg`                        | `images/logos/`         | Experience                 | VoteHub logo                                            |
| `SK-A-1892.*`, `SK-A-5003.*`, `SK-C-165.*` | `images/_unused/art/`   | (unused) Art/museum pieces | High-res art archived for reference                     |
| `sig.*`, `signature.*`                     | `images/_unused/logos/` | (unused) Logos             | Signature assets archived for reference                 |

### Favicons

Active PNG favicons (16, 32, 48, 192, 512) plus `favicon.ico` and `apple-touch-icon.png`. All pages include `<link rel="icon">` tags for the key sizes. Sizes 64, 128, and 256 are in `favicons/_unused/`.

---

## Deployment (Vercel)

Configured in `vercel.json`:

- **No framework, no build command** (static site with Express server)
- **Clean URLs** enabled (extensionless)
- **No trailing slash**
- **Redirects**: `/now` and `/now.html` **301** to **`/`** (matches `server.js`; legacy `/racecalls` **301** to **`/`** in `server.js` when the Node server runs)
- **Cache headers**: images, fonts, and favicons get `public, max-age=31536000, immutable`; JS and CSS get `no-cache, must-revalidate`.

**Env and secrets:** set `CLOUD_PASSWORD`, `NODE_ENV`, `TRUST_LOCALHOST_AUTH`, and any other variables in **Vercel → Project → Settings → Environment Variables** for Production / Preview as needed. Local `.env` is for development only.

**CI:** [`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs `npm run verify` on pushes and pull requests. That complements Vercel (preview and production deploys still come from the Vercel Git integration when the repo is linked).

---

## Environment variables

| Variable               | Default       | Purpose                                                                         |
| ---------------------- | ------------- | ------------------------------------------------------------------------------- |
| `PORT`                 | `1123`        | HTTP port (local dev; Vercel sets this automatically)                           |
| `NODE_ENV`             | `development` | Set `production` to enable `trust proxy` for rate limiting behind reverse proxy |
| `CLOUD_PASSWORD`       | (unset)       | Bearer secret for authenticated `GET`/`PUT /api/resume`; `/api/og` stays public |
| `TRUST_LOCALHOST_AUTH` | `false`       | Allow unauthenticated resume API access from localhost in production            |

---

## Writing style

Editorial rules for all site copy are in [`style.md`](style.md). Key rule: **no em dashes**. Use commas, colons, parentheses, or hyphens instead.

---

## Dependencies

| Package              | Purpose                                          |
| -------------------- | ------------------------------------------------ |
| `express`            | HTTP server, static files, routing               |
| `express-rate-limit` | API rate limiting                                |
| `helmet`             | Security headers (CSP, HSTS, etc.)               |
| `satori`             | SVG generation for dynamic OG images (`/api/og`) |
| `@resvg/resvg-js`    | SVG-to-PNG rendering for OG images               |
| `dotenv` (dev)       | Load `.env` in development                       |
| `eslint` (dev)       | Static analysis (see `eslint.config.mjs`)        |
| `prettier` (dev)     | Code formatting (see `.prettierrc.json`)         |
| `supertest` (dev)    | HTTP assertions in tests                         |

Requires **Node 24.x** (set in `engines`).

---

## Testing

```bash
npm test
npm run verify   # ESLint + Prettier check + tests (matches GitHub Actions CI)
```

Uses Node.js built-in test runner (`node --test`). Tests live in `test/` and cover API endpoints and server behavior via supertest.
