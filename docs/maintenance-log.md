# Maintenance log

Technical history and **handoff notes** for human maintainers, coding agents, and repo reviews.

---

## On this page

| Section                                                             | Use it when                                     |
| ------------------------------------------------------------------- | ----------------------------------------------- |
| [Timeline](#timeline)                                               | You need a chronological map of major work      |
| [Visible site and refactors](#visible-site-and-refactors)           | You need the UI policy and safe-refactor habits |
| [Sessions 1 to 4](#session-1-cleanup-behavior-neutral)              | You need detail on a past change set            |
| [Verification commands](#verification-commands-for-agents)          | You want the exact CI-equivalent commands       |
| [Project facts agents often need](#project-facts-agents-often-need) | You need hosting, Node, secrets, style pointers |

**How to use:** skim **Timeline** and **Session 4** first. Run `npm run verify` after substantive JS or server edits. For exact commit timestamps, use `git log`; this file records **intent and scope**, not a full history.

**Index:** the [docs hub](README.md) links here and lists common agent tasks in one place.

---

## Timeline

| When (approx.) | Focus                                                                                                                                                                                                                                                                                                                                        |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **2026-04**    | Code cleanup passes aimed at **no accidental UI drift** during non-UI refactors (no pixel or layout churn on purpose).                                                                                                                                                                                                                       |
| **2026-04**    | Tooling pass: ESLint, Prettier, GitHub Actions `verify`, `.editorconfig`.                                                                                                                                                                                                                                                                    |
| **2026-04**    | README updates: Vercel production, env vars in dashboard, CI vs deploy split.                                                                                                                                                                                                                                                                |
| **2026-04**    | This document added under `docs/`.                                                                                                                                                                                                                                                                                                           |
| **2026-04-03** | **Site simplification:** removed race-calls API and admin UI; public race stats are static JSON; trimmed `/api/auth`. See **Session 4**.                                                                                                                                                                                                     |
| **2026-04-04** | **Repo layout:** `racecalls-summary.json` and `site-origin.json` moved under **`site-data/`**; public URL **`/racecalls-summary.json`** unchanged; **`/site-data/*`** blocked in `server.js`.                                                                                                                                                |
| **2026-04-05** | **Docs pass:** corrected README inaccuracies -- CSS line count, image/favicon path table, CSS section list, added `nav-name-paint-hint.js` to JS table and script load order. No code changes.                                                                                                                                               |
| **2026-04-06** | **Org pass:** verified lint, format, and all 19 tests pass. Created missing `.cursor/rules/no-em-dash.mdc` (referenced in AGENTS.md and docs/README.md but absent). No code or visible-site changes.                                                                                                                                         |
| **2026-04-07** | **Org pass:** renamed `scripts/gen-embeddings.mjs` to `scripts/generate-embeddings.mjs` for naming consistency; updated 3 references (file header, `js/shared/site-data.js` comment, maintenance-log). Re-created missing `.cursor/rules/no-em-dash.mdc` (`.cursor/` is gitignored so it does not persist). No code or visible-site changes. |

Update the table when you complete another maintenance milestone.

---

## Visible site and refactors

**Default for agents:** Change UI, layout, copy, styling, images, or other user-visible behavior **only when the task explicitly asks** for that work. When it does ask, treat that as full permission: implement and polish as appropriate.

**Technical habits (still apply on non-UI tasks):**

- Not running Prettier on `*.html` or `style.css` (see `.prettierignore`) so formatting tools do not rewrite markup or CSS by accident.
- Avoiding risky merges between `cmdk.js` defaults and `nav.js` without analysis (empty `navLinks` handling differed historically).
- Skipping broad `server.js` reshapes where a slip could alter status codes, JSON bodies, or headers.

**Historical note:** Early 2026 maintenance passes often targeted refactors **without** intentional pixel or layout churn; that shaped the tooling choices above.

**Regression checks:** `npm test` and spot checks are the final authority if something looks off.

---

## Session 1: cleanup (behavior-neutral)

**Goals:** remove dead code, reduce duplication, fix obvious bugs in scripts, align tests with current canonical URLs.

**Notable edits:**

- **`server.js`:** removed unused `readJSONSync`. Added small internal helpers later (`cloudAuthGate`, `sendOgPng`, etc.) without changing HTTP contract. (`callersObjectFromBody` and other race-only helpers were removed in Session 4.)
- **`js/shared/effects.js`:** removed unused `isMobile` binding.
- **`js/pages/writing.js`:** removed unused `visibleCount`; reused in-scope DOM references instead of repeated `getElementById` where equivalent.
- **`scripts/generate-embeddings.mjs`:** removed unused `evalCtx`; fixed `site-data.js` path to `js/shared/site-data.js` so the script can read the real file.
- **`style.css`:** removed an **empty** ruleset (`.rc-type-filters` with no declarations). No visual effect.
- **`index.html`:** removed an empty HTML comment. No visual effect.
- **`js/shared/cmdk.js`:** optional `catch` binding where errors were ignored.
- **`js/shared/footer.js`:** **deleted**; it was never referenced by any HTML page (footers are static markup). README updated to match.
- **`js/shared/site-data.js`:** single `SITE_NAV_LINKS` array feeding `SITE_DATA.navLinks` (later simplified; see Session 2).
- **`test/server.test.js`:** expectations updated to `mccomb.ca` and sitemap shape; `assert.ok(Array.isArray(...))` style fix.

**Deferred (intentional):** large deduplication in `seo-inject.mjs`, heavy `cmdk.js` style rewrite.

**Superseded:** race-call API work in `server.js` was later **removed** entirely (Session 4). Ignore any historical mention of racecall handlers or normalizers as current behavior.

---

## Session 2: quality tooling and lint-driven fixes

**Goals:** “pro” hygiene: lint, format, CI, without changing rendered pages.

**Added:**

- **`eslint.config.mjs`:** ESLint flat config; `eslint-config-prettier`; separate browser vs Node globals; ignores `node_modules`, `data`, `.cursor`, `.claude`.
- **`.prettierrc.json`**, **`.prettierignore`:** Prettier on `js`, `mjs`, `json`, `md`; **excludes** `*.html`, `style.css`, assets, `.vscode`, `data`.
- **`.editorconfig`:** UTF-8, LF, trim whitespace, 2-space indent (Markdown trailing space preserved).
- **`package.json` scripts:** `lint`, `lint:fix`, `format`, `format:check`, `verify` (`lint` + `format:check` + `test`).
- **`.github/workflows/ci.yml`:** runs `npm ci` and `npm run verify` on push and PR (comment notes Vercel owns deploys).

**Code fixes driven by lint:**

- **`js/shared/cmdk.js`:** `let` / `const` in tight loops to fix `no-redeclare`; non-empty `catch` for `localStorage.setItem` (`void 0` body).
- **`js/shared/nav.js`:** removed unused `navItems` / `SITE_DATA` reads (nav chrome is static HTML; script only handles interactions).
- **`js/shared/site-data.js`:** removed `window.SITE_NAV_FALLBACK_LINKS` after nav stopped consuming it.
- **Prettier:** applied to allowed extensions (large whitespace-only diffs possible in `server.js`, `test/`, `scripts/`, some `js/`, `README.md`).

---

## Session 3: Vercel documentation

**Goals:** state clearly that production is Vercel and where env lives.

**README:**

- Intro mentions Vercel and dashboard env vars.
- Deployment section: env/secrets in Vercel UI; CI complements GitHub, not a replacement for Vercel Git integration.
- `PORT` row notes Vercel sets it in production.

**`.github/workflows/ci.yml`:** top comment clarifies deploy target (Vercel).

---

## Session 4: site simplification (race calls static, admin removed)

**When:** 2026-04-03 (same calendar day as several related commits; use `git log` for exact timestamps).

**Owner intent:** Drop the dynamic race-call pipeline and admin surface. VoteHub race-call copy on the public site should be **hand-edited static data**. Fewer API routes and no password UI for race management.

### Removed (files)

| Path                  | Notes                                                              |
| --------------------- | ------------------------------------------------------------------ |
| `racecalls.html`      | Dedicated public race-call page (filters, cards, large CSS block). |
| `admin.html`          | Password UI for CRUD on race calls.                                |
| `data/racecalls.json` | Server-seeded / API-backed store (no longer used).                 |

### Removed (HTTP / server)

| Piece                                                                                                 | Notes                                                                                                                                                           |
| ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET/POST/PUT/DELETE /api/racecalls`                                                                  | Full JSON CRUD.                                                                                                                                                 |
| `POST /api/auth`                                                                                      | Only served the old admin login check; **removed** with admin. Resume still uses **Bearer** `CLOUD_PASSWORD` on `/api/resume`; no body-password login endpoint. |
| `authLimiter`                                                                                         | Was tied to `/api/auth` only.                                                                                                                                   |
| `DATA_DIR`, `RACECALLS_FILE`, `fs.mkdirSync(DATA_DIR, …)`                                             | Only supported race JSON on disk.                                                                                                                               |
| `readJSON`, `writeJSON`, `writeJSONSync` (race helpers)                                               | Only used by race routes.                                                                                                                                       |
| Race seed block                                                                                       | No auto-create of `racecalls.json`.                                                                                                                             |
| `CALLER_DESKS`, `VALID_RACE_TYPES`, `callersFromFirstCaller`, `callersObjectFromBody`, `explicitTrue` | Only used by race handlers.                                                                                                                                     |
| `/racecalls` from `CANONICAL_TOP_LEVEL_PATHS`                                                         | Trailing-slash canonicalization no longer treats it as a top-level page.                                                                                        |
| Large **racecalls page** CSS in `style.css`                                                           | Kept **`.rc-preview`** / **`.rc-preview--static`** for the Now-page widget.                                                                                     |
| `.about-racecalls` rules                                                                              | Unused; removed earlier in the same effort.                                                                                                                     |

### Added / kept (behavior)

| Piece                                                                                  | Notes                                                                                                                                                                                 |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`site-data/racecalls-summary.json`**                                                 | `aboutContactValue` drives the About contact row; `nowRecord` / `nowAccuracy` kept for reference (archived Now page). Served at **`GET /racecalls-summary.json`** via explicit route. |
| **`about.html`**                                                                       | `fetch('/racecalls-summary.json')` for the VoteHub contact line.                                                                                                                      |
| **`archive/now-page/`**                                                                | Retired **`now.html`** snapshot; **not** served (`archive` blocked in `server.js`).                                                                                                   |
| **301** `GET /racecalls`, `/racecalls.html`, `/now`, `/now/`, `/now.html` → `/`        | Legacy URLs collapse to home.                                                                                                                                                         |
| **301** `GET /admin`, `/admin.html` → `/`                                              | Old bookmarks do not 404.                                                                                                                                                             |
| **`GET/PUT /api/resume`**, **`GET /api/og`**, **`requireAuth`**, **`apiWriteLimiter`** | Unchanged role: resume editing for operators with Bearer secret; OG images public.                                                                                                    |

### Config and docs touched

- **`README.md`:** API table, persistence section, env copy, Vercel cache bullets (removed obsolete `/data/` header row from `vercel.json`).
- **`.env.example`:** Documents resume-only API.
- **`robots.txt`** / **`scripts/seo-inject.mjs`:** Dropped `Disallow: /admin`; aligned on `Disallow: /api/`. Removed `admin.html` from SEO inject page list.
- **`test/server.test.js`:** Dropped race API + `MYSITE_DATA_DIR` isolation; tests cover `/racecalls-summary.json`, `/racecalls` → `/`, `/now` → `/`, `/admin` → `/`, blocked `/archive/`, and blocked `/site-data/*`.

### For future agents (quick map)

1. **VoteHub race-call line on About:** edit **`site-data/racecalls-summary.json`** (`aboutContactValue`) unless you change **`rc-about-contact-value`** in **`about.html`**.
2. **Resume automation:** use **`CLOUD_PASSWORD`** with **`Authorization: Bearer …`** on **`GET`/`PUT /api/resume`**. There is **no** `/api/auth` endpoint.
3. **Do not bring back** `data/racecalls.json`, `/api/racecalls`, or the old admin UI without an explicit product decision; public stats are intentionally static JSON.

---

## Verification commands (for agents)

```bash
npm test              # Node test runner + supertest
npm run lint          # ESLint on server, tests, scripts, js/shared, js/pages
npm run format:check  # Prettier check (respects .prettierignore)
npm run verify        # lint + format:check + test (same as CI)
```

**Install:** `npm ci` in CI; locally `npm install` / `npm ci` as usual.

---

## Project facts agents often need

- **Hosting:** Vercel. Static assets + Express-style server per project setup; `vercel.json` sets clean URLs, redirects, cache headers.
- **Domains:** [mccomb.ca](https://mccomb.ca) (primary) and [ryanjmccomb.com](https://ryanjmccomb.com) (secondary) serve the same deployment; canonical origin is `site-data/site-origin.json`.
- **Node:** `engines` specifies **24.x**. CI uses Node 24.
- **Race-call public copy:** `site-data/racecalls-summary.json` (committed). Still exposed only at **`/racecalls-summary.json`**; not an API; edit the JSON when numbers change.
- **`data/`:** May still exist or be empty; it is **not** used for race calls anymore. ESLint ignores `data/**` if present.
- **Secrets:** `CLOUD_PASSWORD`, optional `TRUST_LOCALHOST_AUTH`, `NODE_ENV`. Document in README env table; production values live in **Vercel** project settings. **`MYSITE_DATA_DIR` was removed** with the race API (tests no longer need a temp data dir).
- **House style:** `.cursor/rules/no-em-dash.mdc` and `style.md`: **no em dashes** in authored copy or first-party comments that read as copy.

---

## When you edit this log

1. Append a row to **Timeline** (date or month + short focus).
2. Add a **Session N** (or dated) subsection: goals, files touched, removed or added behavior, and **For future agents** bullets if anything non-obvious changed.
3. Update **Project facts agents often need** if hosting, env vars, or key files changed.
4. Bump **Last updated** below.

**Last updated:** 2026-04-07 (org pass; amend when you change this file).
