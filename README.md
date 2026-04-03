# Ryan McComb: personal site

Static HTML/CSS/vanilla JS pages served by a small **Express** app. The server adds JSON APIs (race calls, resume editing), rate limiting, and Helmet security headers. Everything else is flat files.

**Domains:** [mccomb.ca](https://mccomb.ca) and [ryanjmccomb.com](https://ryanjmccomb.com) both point to this site. The canonical origin is set in [`site-origin.json`](site-origin.json).

---

## Quick start

```bash
npm install
cp .env.example .env    # then fill in CLOUD_PASSWORD if you need admin
npm start               # http://localhost:5001
```

Override the port with `PORT=3000 npm start`. Extensionless URLs work (e.g. `/about`) because Express static middleware uses `extensions: ['html']`.

---

## Project structure

```
mysite/
  index.html, about.html, ...   11 HTML pages (flat files in root)
  style.css                     Single stylesheet (3,300 lines, all pages)
  js/
    shared/                     Scripts loaded on every page (site-data, nav, animations, effects, cmdk, footer)
    pages/                      Page-specific scripts (timeline, writing, article, bayes-404)
  fonts/                        Self-hosted Inter + DM Sans (woff2)
  images/
    heroes/                     Page hero images with responsive variants (char-swiss, experience-hero, writing-hero)
    portraits/                  Portrait photos (about-portrait, portrait, portrait-press)
    og/                         Social media OG images (og-home)
    art/                        Museum artwork (SK-A-*, SK-C-*)
    logos/                      Logos and signatures (votehub_logo, sig, signature)
  writing/                      Hosted essay subpages (each is a folder with index.html)
  data/                         Persisted JSON (race calls)
  scripts/                      Build/maintenance scripts
  test/                         Node.js test runner tests
  server.js                     Express app (APIs, static serving, Helmet, rate limiting)
  vercel.json                   Vercel deployment config
  site-origin.json              Canonical origin URL (read by seo-inject)
  style.md                      Writing and punctuation style guide
  resume.md                     Resume source content (Markdown)
  .env.example                  Environment variable template
```

---

## Pages

| Path | File | Description |
|------|------|-------------|
| `/` | `index.html` | Home. Full-bleed hero photo (airplane/Switzerland), floating name card, featured links. |
| `/about` | `about.html` | Bio, portrait, contact grid (email, GitHub, LinkedIn, X/Twitter, Manifold). |
| `/experience` | `experience.html` | Timeline layout with VoteHub, IL9Cast, campaigns, photography, podcast. Expandable cards. |
| `/resume` | `resume.html` | Printable resume. Editable via admin API. Print stylesheet included. |
| `/writing` | `writing.html` | Article index with category/tag/publication filters. Cards link to hosted essays or external URLs. |
| `/writing/:slug` | `writing/*/index.html` | Individual hosted essays with reading progress bar. Currently: il9cast-postmortem, peoples-edict, median-voter-theory, nsa-surveillance. |
| `/press` | `press.html` | Press coverage and media features. |
| `/now` | `now.html` | "Now" page (currently redirects to `/` via vercel.json). |
| `/racecalls` | `racecalls.html` | Public race-call record. Reads from `GET /api/racecalls`. |
| `/admin` | `admin.html` | Password-protected admin UI for managing race calls. `noindex`. Self-contained (inline styles, no shared CSS). |
| `/colophon` | `colophon.html` | How the site is built: stack, tools, design decisions. |
| `*` | `404.html` | Custom 404 with an interactive Bayes' theorem calculator. |

---

## JavaScript files

All scripts are vanilla JS with no build step or bundler. They load via `<script>` tags at the bottom of each HTML page.

### Shared (loaded on every page)

| File | Purpose |
|------|---------|
| `js/shared/site-data.js` | **Single source of truth** for nav links and hosted essay metadata. Exposes `window.SITE_DATA` (consumed by nav, cmdk, footer). |
| `js/shared/nav.js` | Site navigation: mobile hamburger menu with focus trap and escape-to-close, scroll shadow on nav, smooth anchor scrolling, page transition animations (fade out/in for browsers without cross-document View Transitions). Injects a skip-to-content link for accessibility. |
| `js/shared/animations.js` | Scroll-triggered `.animate-in` and `.stagger-children` reveal via IntersectionObserver. Respects `prefers-reduced-motion`. |
| `js/shared/effects.js` | Animated number counters for `[data-count]` elements. Eases in with a quartic curve over 1.4s. Respects reduced motion. |
| `js/shared/cmdk.js` | Command palette (Cmd+K / Ctrl+K). Searches pages, articles, projects, press, experience. Features: fuzzy matching with Damerau-Levenshtein edit distance, prefix matching, typo tolerance, title highlighting, recent items via localStorage, keyboard navigation. |
| `js/shared/footer.js` | Renders the site footer from `SITE_DATA.navLinks` with social links. |

### Page-specific

| File | Used on | Purpose |
|------|---------|---------|
| `js/pages/timeline.js` | `/experience` | Timeline entry scroll-reveal with staggered delays, click-to-expand cards, animated vertical line. |
| `js/pages/writing.js` | `/writing` | Article filtering (category tabs, tag dropdown, publication dropdown), URL state persistence, newest-first sort, card click handlers. |
| `js/pages/article.js` | `/writing/*` essays | Reading progress bar (thin orange line at top of viewport, tracks scroll position). |
| `js/pages/bayes-404.js` | `404.html` | Interactive Bayes' theorem calculator with three sliders (prior, P(E|G), P(E|not G)) and live posterior/P(E) output. |

### Script load order

`site-data.js` must load before `nav.js`, `cmdk.js`, and `footer.js` since they read `window.SITE_DATA`. The HTML files load them in this order:

```html
<script src="js/shared/site-data.js"></script>
<script src="js/shared/nav.js"></script>
<script src="js/shared/animations.js"></script>
<script src="js/shared/effects.js"></script>
<script src="js/shared/cmdk.js"></script>
<script src="js/shared/footer.js"></script>
```

---

## CSS architecture

`style.css` is a single 3,300-line file organized into named sections:

```
Fonts           @font-face declarations + metric-adjusted fallbacks
Tokens          CSS custom properties in :root (colors, spacing, typography, shadows)
Reset           Box-sizing, smooth scrolling, selection color, focus styles
Typography      Base type scale, heading sizes, link styles
Navigation      Fixed nav, scroll shadow, mobile hamburger menu, page transitions
Hero            Full-bleed hero image, gradient overlay, floating card
About           About page hero, contact grid, race-call preview
Page headers    Shared header pattern for experience/writing/press pages
Articles        Writing cards, filter tabs, hosted essay layout, reading progress
Experience      Timeline, expandable cards, data counters
Resume          Printable resume layout with @media print
Press           Press card grid
Now             Now page cards
404             Error page, Bayes calculator
Colophon        Colophon page layout
Command palette Cmd+K dialog, search results, keyboard hints
Premium effects Scroll animations, character reveal, stagger children
Responsive      @media (max-width: 768px) overrides
Print           @media print overrides
```

### Design tokens (`:root`)

| Token | Value | Use |
|-------|-------|-----|
| `--bg` | `#151515` | Page background (charcoal dark) |
| `--surface` | `#191919` | Card/panel backgrounds |
| `--text` | `#e8e8e8` | Primary text |
| `--text-light` | `#b3b3b3` | Secondary text |
| `--text-muted` | `#888` | Tertiary/meta text |
| `--accent` | `#fff` | Links, emphasis |
| `--accent-orange` | `#e06b1f` | Selection highlight, progress bar, resume accents |
| `--border` | `rgba(255,255,255,0.08)` | Subtle borders |
| `--radius` | `8px` | Standard corner radius |
| `--shadow-sm/md/lg` | Various | Elevation levels |
| `--font-main` | Inter + fallbacks | Primary typeface |
| `--fs-*` | `0.67rem` to `1.05rem` | Font size scale |
| `--dur-fast/normal/slow` | `0.15s/0.3s/0.5s` | Animation durations |

### Font strategy

Self-hosted Inter and DM Sans (woff2) with `font-display: swap` and metric-adjusted fallback `@font-face` declarations that match Arial to Inter/DM Sans metrics. This means zero layout shift on font load. Fonts are preloaded via `<link rel="preload">` in each HTML `<head>`.

### Responsive breakpoints

- **768px**: Primary mobile breakpoint. Nav switches to hamburger, hero adjusts, grids go single-column.
- **600px**: Minor adjustments (smaller paddings, tighter spacing).
- **Print**: Strips backgrounds, animations, nav. Forces black-on-white.

### Animation system

All animations respect `prefers-reduced-motion: reduce` (CSS and JS).

| Animation | Used for |
|-----------|----------|
| `fadeSlideUp` | Scroll-reveal: 20px translate + fade (larger elements) |
| `fadeIn` | Scroll-reveal: 8px translate + fade (subtler) |
| `cardIn` | Card entrance: 30px translate + fade (staggered) |
| `imgReveal` | Hero image: 1.04x scale down + fade |
| `charReveal` | Character-by-character text reveal (about page name) |

---

## Server (`server.js`)

Express app with three responsibilities: static file serving, JSON APIs, and security middleware.

### Middleware stack (in order)

1. **Helmet** with CSP, HSTS, and other security headers
2. **Rate limiters**: general (100 req/15min for `/api/*`), strict (5 req/15min for `/api/auth`)
3. **Express static** with `extensions: ['html']` for clean URLs
4. **API routes** (see below)
5. **404 handler** serving `404.html`

### API routes

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/api/auth` | Body `password` | Login check for admin flows |
| `GET` | `/api/racecalls` | None | Public race-call data |
| `POST` | `/api/racecalls` | Bearer token | Create a race call |
| `PUT` | `/api/racecalls/:id` | Bearer token | Update a race call |
| `DELETE` | `/api/racecalls/:id` | Bearer token | Delete a race call |
| `GET` | `/api/resume` | Bearer token | Read resume HTML content |
| `PUT` | `/api/resume` | Bearer token | Update resume HTML content |

### Authentication

- Bearer token checked against `CLOUD_PASSWORD` env var using `crypto.timingSafeEqual` (timing-safe comparison)
- Race call IDs generated with `crypto.randomUUID()`
- **Localhost bypass**: If `CLOUD_PASSWORD` is unset and host is `localhost`/`127.0.0.1`, mutating routes succeed without auth (development only). In production, requires `TRUST_LOCALHOST_AUTH=true`.
- If `CLOUD_PASSWORD` is unset and host is not localhost, mutating routes return **503** ("Cloud storage not configured").

### Data persistence

Race calls persist to `data/racecalls.json` (or `/data/racecalls.json` if a mounted `/data` directory exists, typical for production volumes). Resume edits write directly to `resume.html` via regex replacement of the inner content div. All file I/O in route handlers is async (`fs.promises`).

### Race call fields

Each call may include: `id`, `race`, `raceType`, `calledAt`, `winner`, `margin`, `firstCaller` (`votehub` when VoteHub called first, otherwise `ap`/`nyt`/`ddhq`), `sourceUrl`, `primaryParty` (`dem`/`rep` for primaries), `notes`.

### Writing page discovery

`getWritingPages()` scans the `writing/` directory for subdirectories containing `index.html`. These are exposed as links on the writing page and included in SEO injection.

---

## Build scripts

### `npm run seo:inject` (scripts/seo-inject.mjs)

Reads `site-origin.json` and injects/updates across all HTML pages:
- `<link rel="canonical">` with correct origin
- `og:url`, `og:image`, `og:site_name` Open Graph tags
- `twitter:card`, `twitter:image`, `twitter:title`, `twitter:description`, `twitter:creator` tags
- `author` meta tag
- Regenerates `sitemap.xml` (with per-page lastmod from file mtime)
- Regenerates `robots.txt` (disallows `/admin`)

Run after changing the origin URL or adding new pages.

### `node scripts/pngs-to-ico.mjs <out.ico> <png...>`

Builds a multi-resolution `.ico` file from PNG inputs (PNG-embedded ICO format, Windows Vista+). Used to generate `favicon.ico` from the sized PNG favicons.

---

## Images

### Hero and page images

All hero/page images have responsive WebP variants (600w, 1200w) with JPG fallbacks, served via `<picture>` and `<source srcset>`:

| Image set | Directory | Used on | Subject |
|-----------|-----------|---------|---------|
| `char-swiss.*` | `images/heroes/` | Home hero | Ryan on airplane, working on laptop (La Chaux-de-Fonds) |
| `about-portrait-*` | `images/portraits/` | About hero | Portrait photo |
| `experience-hero.*` | `images/heroes/` | Experience header | Hero photo |
| `writing-hero.*` | `images/heroes/` | Writing header | Hero photo |
| `portrait-press.*` | `images/portraits/` | Press, Race calls | Interview photo |
| `portrait.*` | `images/portraits/` | OG meta tags (default) | Portrait photo |
| `og-home.*` | `images/og/` | Home OG meta tag | Social preview image |
| `SK-A-1892.*`, `SK-A-5003.*`, `SK-C-165.*` | `images/art/` | Art/museum pieces | High-res art (WebP versions served; JPGs are compressed source files) |
| `votehub_logo.*`, `sig.*`, `signature.*` | `images/logos/` | Experience, misc | Logos and signature assets |

### Favicons

Multi-size PNG favicons (16, 32, 48, 64, 128, 192, 256, 512) plus `favicon.ico` and `apple-touch-icon.png`. All pages include `<link rel="icon">` tags for the key sizes.

---

## Deployment (Vercel)

Configured in `vercel.json`:
- **No framework, no build command** (static site with Express server)
- **Clean URLs** enabled (extensionless)
- **No trailing slash**
- **Redirects**: `/now` permanently redirects to `/`
- **Cache headers**: images, JS, and CSS get `max-age=31536000, immutable`. Data directory gets `must-revalidate`.

---

## Environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | `5001` | HTTP port |
| `NODE_ENV` | `development` | Set `production` to enable `trust proxy` for rate limiting behind reverse proxy |
| `CLOUD_PASSWORD` | (unset) | Bearer secret for mutating `/api/*` endpoints |
| `TRUST_LOCALHOST_AUTH` | `false` | Allow unauthenticated admin access from localhost in production |

---

## Writing style

Editorial rules for all site copy are in [`style.md`](style.md). Key rule: **no em dashes**. Use commas, colons, parentheses, or hyphens instead.

---

## Dependencies

| Package | Purpose |
|---------|---------|
| `express` | HTTP server, static files, routing |
| `express-rate-limit` | API rate limiting |
| `helmet` | Security headers (CSP, HSTS, etc.) |
| `dotenv` (dev) | Load `.env` in development |
| `supertest` (dev) | HTTP assertions in tests |

Requires **Node 24.x** (set in `engines`).

---

## Testing

```bash
npm test
```

Uses Node.js built-in test runner (`node --test`). Tests live in `test/` and cover API endpoints and server behavior via supertest.
