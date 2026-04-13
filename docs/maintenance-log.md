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

| When (approx.) | Focus                                                                                                                                                                                                                                                                                                                                                                       |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **2026-04**    | Code cleanup passes aimed at **no accidental UI drift** during non-UI refactors (no pixel or layout churn on purpose).                                                                                                                                                                                                                                                      |
| **2026-04**    | Tooling pass: ESLint, Prettier, GitHub Actions `verify`, `.editorconfig`.                                                                                                                                                                                                                                                                                                   |
| **2026-04**    | README updates: Vercel production, env vars in dashboard, CI vs deploy split.                                                                                                                                                                                                                                                                                               |
| **2026-04**    | This document added under `docs/`.                                                                                                                                                                                                                                                                                                                                          |
| **2026-04-03** | **Site simplification:** removed race-calls API and admin UI; public race stats are static JSON; trimmed `/api/auth`. See **Session 4**.                                                                                                                                                                                                                                    |
| **2026-04-04** | **Repo layout:** `racecalls-summary.json` and `site-origin.json` moved under **`site-data/`**; public URL **`/racecalls-summary.json`** unchanged; **`/site-data/*`** blocked in `server.js`.                                                                                                                                                                               |
| **2026-04-05** | **Docs pass:** corrected README inaccuracies -- CSS line count, image/favicon path table, CSS section list, added `nav-name-paint-hint.js` to JS table and script load order. No code changes.                                                                                                                                                                              |
| **2026-04-06** | **Org pass:** verified lint, format, and all 19 tests pass. Created missing `.cursor/rules/no-em-dash.mdc` (referenced in AGENTS.md and docs/README.md but absent). No code or visible-site changes.                                                                                                                                                                        |
| **2026-04-07** | **Org pass:** renamed `scripts/gen-embeddings.mjs` to `scripts/generate-embeddings.mjs` for naming consistency; updated 3 references (file header, `js/shared/site-data.js` comment, maintenance-log). Re-created missing `.cursor/rules/no-em-dash.mdc` (`.cursor/` is gitignored so it does not persist). No code or visible-site changes.                                |
| **2026-04-08** | **Docs pass:** added `js/pages/about.js` and `js/pages/press.js` (existing, unlisted) to README page-specific JS table; documented `generate-about-portrait.mjs` and `generate-embeddings.mjs` in README build scripts section; added `@huggingface/transformers` install note and alignment reminder to `generate-embeddings.mjs` header. No code or visible-site changes. |
| **2026-04-09** | **Docs fix:** corrected README middleware stack order (static was listed before API routes; actual order is API routes then static); added missing `express.json()` and 500 error handler entries. No code or visible-site changes.                                                                                                                                         |
| **2026-04-10** | **Org pass:** re-created missing `.cursor/rules/no-em-dash.mdc` (gitignored, needs recreation each session); added `satori`, `@resvg/resvg-js`, `eslint`, `prettier`, and `sharp` to README dependencies table (production OG-image deps were absent). No code or visible-site changes.                                                                                     |
| **2026-04-11** | **CSS org pass:** moved misplaced `.cmdk-dialog` mobile responsive rule out of the archived "Tweet Cards (now page)" section into the active "Responsive" section; corrected stale `rc-preview` comment (About no longer uses those styles; archived now page only). All 19 tests pass.                                                                                     |
| **2026-04-12** | **Org pass:** re-created missing `.cursor/rules/no-em-dash.mdc` (gitignored, needs recreation each session). No code or visible-site changes.                                                                                                                                                                                                                               |
| **2026-04-13** | **Org pass:** re-created `.cursor/rules/no-em-dash.mdc`; fixed two README inaccuracies (cache headers bullet listed JS/CSS as `immutable` -- actual is `no-cache, must-revalidate`; project structure `js/pages/` comment omitted `about.js` and `press.js`). No code or visible-site changes.                                                                              |

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

## Session 5: documentation org pass (2026-04-08)

**Goals:** close documentation gaps found during a full codebase audit; no functional or visible-site changes.

**Findings and fixes:**

- **README page-specific JS table** was missing `js/pages/about.js` and `js/pages/press.js`. Both files exist and are loaded by their respective pages. Added both rows with accurate purpose descriptions.
- **README build scripts section** listed only `seo-inject.mjs` and `pngs-to-ico.mjs`. Added entries for `generate-about-portrait.mjs` (sharp-based portrait resizer) and `generate-embeddings.mjs` (semantic search data builder).
- **`scripts/generate-embeddings.mjs` header** did not mention that `@huggingface/transformers` (used on line 153) is absent from `package.json`. Added install note and a reminder that `ITEMS` should stay aligned with `INDEX` in `js/shared/cmdk.js`.

**Not changed (intentional):**

- CSS "Now Page" and "Tweet Cards" sections: deliberately retained for archive reference per Session 4 notes.
- `generate-embeddings.mjs` ITEMS list vs `cmdk.js` INDEX: they have drifted (embeddings has one article not in cmdk; cmdk has many articles not in embeddings). Syncing is a content task; left for a future explicit update.
- All JS, HTML, server, and test files: no changes.

---

## Session 6: docs accuracy fix (2026-04-09)

**Goals:** correct the one inaccuracy found during a full codebase read; no code or visible-site changes.

**Findings and fixes:**

- **README middleware stack section** listed `Express static` at position 3, before API routes. In `server.js` the actual order is: Helmet → `express.json()` → rate limiter → API routes → file-blocking/redirect middleware → `express.static` → 500 handler → 404 handler. Fixed the list to match; added the previously omitted `express.json()` and 500 handler entries.

**Not changed (intentional):**

- `generate-embeddings.mjs` ITEMS list vs `cmdk.js` INDEX content drift: left as a deferred content task per Session 5 notes.
- All JS, HTML, server, and test files: no changes.

---

## Session 7: org pass (2026-04-10)

**Goals:** recreate missing Cursor rule file; close documentation gap in README dependencies table.

**Findings and fixes:**

- **`.cursor/rules/no-em-dash.mdc`** was absent again (`.cursor/` is gitignored; this file must be recreated each session). Recreated with the same content as Sessions 6 and 7.
- **README dependencies table** listed only `express`, `express-rate-limit`, `helmet`, `dotenv`, and `supertest`. Missing production deps `satori` and `@resvg/resvg-js` (used by `GET /api/og` for OG image generation) were not documented. Added both, plus dev deps `eslint`, `prettier`, and `sharp` for completeness.
- Confirmed all 19 tests pass and `npm run verify` succeeds with a fresh `npm install`.

**Not changed (intentional):**

- `generate-embeddings.mjs` ITEMS drift vs `cmdk.js` INDEX: still deferred as a content task per Session 5 notes.
- All JS, HTML, server, test, and CSS files: no changes.

---

## Session 8: CSS org pass (2026-04-11)

**Goals:** correct a CSS organizational error found during a full codebase audit; no functional, visible-site, or behavior changes.

**Findings and fixes:**

- **`.cmdk-dialog` mobile responsive rule** (`max-width: calc(100% - 2rem); max-height: 70vh`) was located inside the archived "Tweet Cards (now page)" `@media (max-width: 768px)` block (around line 2574 before this edit). This is an active, live rule that the command palette (`cmdk.js`) depends on for mobile sizing. Moved it into the "Responsive" section's `@media (max-width: 768px)` block alongside `.cmdk-hint { display: none; }` where it logically belongs.
- **Stale `rc-preview` CSS comment:** the line read "Race call summary (Now page) + contact line (About)". The About page no longer uses `.rc-preview` styles (it uses `contact-value` / `rc-about-contact-value`); those styles are only referenced by `archive/now-page/now.html`. Updated comment to "Race call summary widget (archived now page only)".

**Not changed (intentional):**

- The archived "Now Page" and "Tweet Cards" CSS sections themselves: still retained per Session 4/5 notes.
- The `.rc-preview` styles: still present for the archived now page widget.
- All JS, HTML, server, and test files: no changes.

**Verification:** all 19 tests pass; `npm run verify` succeeds (lint + format:check + tests).

---

## Session 9: org pass (2026-04-12)

**Goals:** re-create missing Cursor rule file.

**Findings and fixes:**

- **`.cursor/rules/no-em-dash.mdc`** was absent again (`.cursor/` is gitignored; must be recreated each session). Recreated with the same content as prior sessions.
- All 19 tests pass; `npm run verify` clean.

**Not changed (intentional):**

- All JS, CSS, HTML, server, and test files: no changes.

---

## Session 10: org pass (2026-04-13)

**Goals:** re-create missing Cursor rule file; fix README inaccuracies found during audit.

**Findings and fixes:**

- **`.cursor/rules/no-em-dash.mdc`** was absent again (`.cursor/` is gitignored; must be recreated each session). Recreated with same content as prior sessions.
- **README cache headers bullet** (Deployment section) read "images, JS, and CSS get `max-age=31536000, immutable`". Actual `vercel.json`: images/fonts/favicons get `public, max-age=31536000, immutable`; JS and CSS get `no-cache, must-revalidate`. Fixed to match.
- **README project structure** `js/pages/` comment listed `(timeline, writing, article, bayes-404)`, omitting `about.js` and `press.js` (added to the JS table in Session 5 but the structure blurb was not updated). Fixed.

**Not changed (intentional):**

- All JS, CSS, HTML, server, and test files: no changes.
- `generate-embeddings.mjs` ITEMS vs `cmdk.js` INDEX content drift: still deferred as a content task per Session 5 notes.

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

**Last updated:** 2026-04-13 (org pass: no-em-dash.mdc recreated; two README inaccuracies fixed; Session 10 logged).
