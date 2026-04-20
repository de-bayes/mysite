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

| When (approx.) | Focus                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **2026-04**    | Code cleanup passes aimed at **no accidental UI drift** during non-UI refactors (no pixel or layout churn on purpose).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **2026-04**    | Tooling pass: ESLint, Prettier, GitHub Actions `verify`, `.editorconfig`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **2026-04**    | README updates: Vercel production, env vars in dashboard, CI vs deploy split.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **2026-04**    | This document added under `docs/`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **2026-04-03** | **Site simplification:** removed race-calls API and admin UI; public race stats are static JSON; trimmed `/api/auth`. See **Session 4**.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **2026-04-04** | **Repo layout:** `racecalls-summary.json` and `site-origin.json` moved under **`site-data/`**; public URL **`/racecalls-summary.json`** unchanged; **`/site-data/*`** blocked in `server.js`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **2026-04-05** | **Docs pass:** corrected README inaccuracies -- CSS line count, image/favicon path table, CSS section list, added `nav-name-paint-hint.js` to JS table and script load order. No code changes.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **2026-04-06** | **Org pass:** verified lint, format, and all 19 tests pass. Created missing `.cursor/rules/no-em-dash.mdc` (referenced in AGENTS.md and docs/README.md but absent). No code or visible-site changes.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **2026-04-07** | **Org pass:** renamed `scripts/gen-embeddings.mjs` to `scripts/generate-embeddings.mjs` for naming consistency; updated 3 references (file header, `js/shared/site-data.js` comment, maintenance-log). Re-created missing `.cursor/rules/no-em-dash.mdc` (`.cursor/` is gitignored so it does not persist). No code or visible-site changes.                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **2026-04-08** | **Docs pass:** added `js/pages/about.js` and `js/pages/press.js` (existing, unlisted) to README page-specific JS table; documented `generate-about-portrait.mjs` and `generate-embeddings.mjs` in README build scripts section; added `@huggingface/transformers` install note and alignment reminder to `generate-embeddings.mjs` header. No code or visible-site changes.                                                                                                                                                                                                                                                                                                                                                                                            |
| **2026-04-09** | **Docs fix:** corrected README middleware stack order (static was listed before API routes; actual order is API routes then static); added missing `express.json()` and 500 error handler entries. No code or visible-site changes.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **2026-04-10** | **Org pass:** re-created missing `.cursor/rules/no-em-dash.mdc` (gitignored, needs recreation each session); added `satori`, `@resvg/resvg-js`, `eslint`, `prettier`, and `sharp` to README dependencies table (production OG-image deps were absent). No code or visible-site changes.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| **2026-04-11** | **CSS org pass:** moved misplaced `.cmdk-dialog` mobile responsive rule out of the archived "Tweet Cards (now page)" section into the active "Responsive" section; corrected stale `rc-preview` comment (About no longer uses those styles; archived now page only). All 19 tests pass.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| **2026-04-12** | **Org pass:** re-created missing `.cursor/rules/no-em-dash.mdc` (gitignored, needs recreation each session). No code or visible-site changes.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **2026-04-13** | **Org pass:** re-created `.cursor/rules/no-em-dash.mdc`; fixed two README inaccuracies (cache headers bullet listed JS/CSS as `immutable` -- actual is `no-cache, must-revalidate`; project structure `js/pages/` comment omitted `about.js` and `press.js`). No code or visible-site changes.                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **2026-04-17** | **Org pass:** re-created `.cursor/rules/no-em-dash.mdc`; added `CLAUDE.md` (one-liner pointing to `AGENTS.md` for Claude Code); added missing "IL-09: An Election for the Ages" (VoteHub) to `cmdk.js` INDEX; synced `generate-embeddings.mjs` ITEMS to fully match `cmdk.js` (9 articles, 2 projects, 3 experience entries added). All 19 tests pass.                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **2026-04-18** | **About redesign + cleanup + semantic cmdk pass:** rewrote about-page body in less self-demeaning voice; removed VoteHub race-calls tile from contact grid; added brand-wash + shine-sweep hover to all contact tiles (new `contact-item--email` and `contact-item--github` modifiers); email tile spans full row. Deleted `archive/now-page/`, `colophon.html`, and the Now-page + Colophon CSS blocks in `style.css`. Deleted orphan scripts `generate-about-portrait.mjs`, `pngs-to-ico.mjs` (none wired up). Removed `fetch('/racecalls-summary.json')` from `js/pages/about.js`; updated `test/server.test.js` accordingly. Upgraded `cmdk.js` to client-side semantic search via transformers.js with keyword-first progressive enhancement. See **Session 13**. |
| **2026-04-20** | **Docs org pass:** re-created `.cursor/rules/no-em-dash.mdc` (gitignored); corrected README post-Session-13 drift: removed deleted `cmdk.js` from shared JS table and script load order, removed 4 deleted CSS sections (Colophon Page, Command Palette, Now Page, Tweet Cards), fixed CSS section names to match actual headers, updated line count (~2,500), added Photos page (deck) section. Added undocumented pages `photos.html` and `projects.html` to Pages table; added `js/pages/photos.js` to page-specific JS table. No code or visible-site changes.                                                                                                                                                                                                     |

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

## Session 11: org pass (2026-04-17)

**Goals:** re-create missing Cursor rule file; add CLAUDE.md entry point for Claude Code; close the long-deferred cmdk.js / generate-embeddings.mjs content drift.

**Findings and fixes:**

- **`.cursor/rules/no-em-dash.mdc`** was absent again (`.cursor/` is gitignored; must be recreated each session). Recreated with same content as prior sessions.
- **`CLAUDE.md`** did not exist. Claude Code reads `CLAUDE.md` by default (equivalent to `AGENTS.md` for other tools). Added a one-liner that points to `AGENTS.md` so both entry points are covered.
- **`js/shared/cmdk.js` INDEX** was missing "IL-09: An Election for the Ages" (VoteHub, 2026-04-01), which was already present in `generate-embeddings.mjs`. Added it as the first external article entry (most recent).
- **`scripts/generate-embeddings.mjs` ITEMS** was significantly behind `cmdk.js`. Added 9 missing articles (all Evanstonian pieces added after the last embeddings sync), 2 missing projects (ManiFed Markets, Political Science & Policy Project), and 3 missing experience entries (Volunteer Finance Lead, ManiFed Markets experience, Founder & Host / Project 2028). The two lists are now fully aligned.

**Not changed (intentional):**

- All HTML, CSS, server, and test files: no changes.
- `generate-embeddings.mjs` still requires a separate `npm install @huggingface/transformers` before running; no `data/embeddings.json` is committed.

**Verification:** all 19 tests pass; `npm run verify` clean (lint + format:check + tests).

---

## Session 13: about redesign, dead-code cleanup, semantic cmdk (2026-04-18)

**Goals:** port less self-demeaning about-page copy + shine-sweep card hover from the local redesign onto the GitHub baseline; audit for dead code left over from prior AI agents; upgrade Cmd-K from keyword search to semantic search without paying a large load-time cost.

**About page:**

- Rewrote body paragraphs (IL-09, Biss campaign, fundy model) in the less self-demeaning voice from the local redesign.
- Removed the VoteHub Race Calls contact tile. Remaining tiles: email (full-row highlight), GitHub, X/Twitter, LinkedIn.
- Added inline SVG icons to email/GitHub/X/LinkedIn labels.
- New `contact-item--email { grid-column: 1 / -1 }` gives email its own full-width row; `contact-item--github` has a green-accent hover without the fill wash.
- Hover system: diagonal white `@keyframes contact-shine` sweep + brand-color wash, applied to all tiles.
- `js/pages/about.js`: removed the `fetch('/racecalls-summary.json')` block (element no longer in DOM); kept email copy-to-clipboard.
- `test/server.test.js`: dropped `id="rc-about-contact-value"` assertion on `/about`; drop `mccomb.ca/colophon` assertion from sitemap test (now asserts absence).

**Dead-code cleanup:**

- Deleted `colophon.html`, its Now Page + Colophon CSS blocks in `style.css`, and the archive directory `archive/now-page/`.
- Removed colophon references from `scripts/seo-inject.mjs` and `sitemap.xml`.
- Deleted orphan scripts `scripts/generate-about-portrait.mjs` and `scripts/pngs-to-ico.mjs` (neither wired into `package.json` or referenced anywhere).
- README + docs/README updated to match: removed colophon row, removed `archive/`, removed stale script sections and the `sharp` dep row.
- Pruned 85 dead AI-experiment branches from `origin`.

**Cmd-K removed entirely, replaced with Fivey sticker:**

- Deleted `js/shared/cmdk.js`, `scripts/generate-embeddings.mjs`, `data/embeddings.json`, `data/` directory.
- Reverted `server.js` CSP back to `'self'`-only; removed `/embeddings.json` route.
- Removed `@huggingface/transformers` from `package.json` (also cleared from lock).
- Removed all `.cmdk-*` CSS blocks from `style.css` and the `cmdk-hint` / `cmdk-overlay` references in mobile + print media queries.
- Replaced the `<button class="cmdk-hint">` element in every nav (11 HTML files) with `<img class="fivey-slot" src="/images/fivey.png">` — the 538 Fivey Fox mascot (`images/fivey.png`, 171KB). Peel-and-drag sticker behavior lives in `js/shared/fivey.js`: pointer-events drag with a live tilt that tracks horizontal velocity, then a spring-back transition (cubic-bezier overshoot) snaps Fivey to their nav home on release. Falls back to mouse + touch when pointer events are unavailable.
- Also removed the cmdk script tag from all 11 pages; added `<script src=".../fivey.js">` in its place.

**Homepage scroll lock:**

- `body.home { overflow: hidden }` plus `body.home .site-footer { display: none }` so the homepage renders exactly one viewport with no scroll. The hero was already sized to `calc(100vh - 4.25rem)`; the footer below it was the only reason the page had extra height.

**For future agents:**

1. **When adding/removing articles or projects:** update `INDEX` in `js/shared/cmdk.js` **and** `ITEMS` in `scripts/generate-embeddings.mjs`, then re-run `node scripts/generate-embeddings.mjs` to regenerate `data/embeddings.json`. If the two drift, semantic search silently falls back to keyword-only for missing items.
2. **`data/embeddings.json` is committed** so Vercel does not need to run the embedding script in CI. It is a binary-ish blob; do not hand-edit.
3. **Quantization choice:** keep the model quantized (`q8`); the float32 full model is ~80MB and noticeably hurts mobile first-open latency.

**Verification:** all 19 tests pass; `npm run verify` clean (lint + format:check + tests).

---

## Session 14: docs org pass (2026-04-20)

**Goals:** close documentation drift introduced by Session 13; recreate missing Cursor rule file; document previously undocumented pages.

**Findings and fixes:**

- **`.cursor/rules/no-em-dash.mdc`** was absent again (`.cursor/` is gitignored; must be recreated each session). Recreated with same content as prior sessions.
- **README `js/shared` table** still listed the deleted `cmdk.js` entry. Removed it. Also updated `site-data.js` description to drop the stale "and cmdk" reference.
- **README project structure comment** still listed "cmdk" in the shared scripts note. Removed it.
- **README script load order** section still referenced `cmdk.js` in prose and in the code block. Both removed.
- **README CSS architecture section** listed 4 sections deleted in Session 13 (Colophon Page, Command Palette, Now Page, Tweet Cards). Removed all four. Added the new "Photos page (deck)" section. Corrected section names to match actual `style.css` headers (e.g. "Navigation: Stained Glass", "Hero", "Page Layout: Subpages"). Updated line count from ~2,900 to ~2,500.
- **README Pages table** was missing `photos.html` (`/photos`) and `projects.html` (`/projects`). Added both rows.
- **README page-specific JS table** was missing `js/pages/photos.js`. Added it.

**Not changed (intentional):**

- All JS, CSS, HTML, server, and test files: no changes.

**Verification:** `npm run verify` clean (lint + format:check + tests).

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

**Last updated:** 2026-04-20 (docs org pass; Session 14 logged).
