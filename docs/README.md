# Documentation

Central index for this repo. **Both** [mccomb.ca](https://mccomb.ca) **(primary)** and [ryanjmccomb.com](https://ryanjmccomb.com) **(secondary)** serve the same deployment; canonical origin is [`site-data/site-origin.json`](../site-data/site-origin.json). Human maintainers and **coding agents** should start here before large edits.

**Repo entry point for tools:** the short [AGENTS.md](../AGENTS.md) at the repo root points here so automated agents find the full playbook quickly.

---

## Read first (agents)

Work through this list in order when you pick up the repo cold:

| Step | What                                                                                                                   | Why                                                                    |
| ---- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 1    | [Maintenance log](maintenance-log.md) (at least **Timeline**, **Session 4**, **For future agents**, **Project facts**) | Current architecture, what was removed, and non-negotiable constraints |
| 2    | Root [README.md](../README.md) (structure, APIs, deployment)                                                           | Day-to-day reference for files, routes, and env                        |
| 3    | [style.md](../style.md) and [.cursor/rules/no-em-dash.mdc](../.cursor/rules/no-em-dash.mdc)                            | House style for all authored copy and many comments                    |
| 4    | Run `npm run verify` after substantive changes                                                                         | Matches [CI](../.github/workflows/ci.yml)                              |

**UI and copy:** Change layout, styling, typography, images, or user-facing copy **only when the task explicitly asks** for that kind of work. When it does ask, implement it fully and polish as needed. See [Visible site and refactors](maintenance-log.md#visible-site-and-refactors) in the maintenance log for tooling cautions that still apply on non-UI tasks.

---

## Document map

| Document                                 | Audience            | Contents                                                          |
| ---------------------------------------- | ------------------- | ----------------------------------------------------------------- |
| [AGENTS.md](../AGENTS.md)                | Coding agents       | Short entry; links to this hub, maintenance log, style, verify    |
| [README.md](../README.md)                | Everyone            | Quick start, structure, pages, JS/CSS, server, Vercel, env, tests |
| [maintenance-log.md](maintenance-log.md) | Maintainers, agents | Timeline, session notes, verification commands, agent quick map   |
| [style.md](../style.md)                  | Editors             | Punctuation, voice, post-edit checklist (`seo:inject`)            |
| [resume.md](../resume.md)                | Content             | Resume source (Markdown); HTML output also used on `/resume`      |

---

## Common agent tasks

| Goal                                                | Where to act                                                  | Check                                                      |
| --------------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------- |
| Update VoteHub race-call line on About              | Edit `site-data/racecalls-summary.json` (`aboutContactValue`) | ID `rc-about-contact-value` in `about.html`                |
| Change nav, command palette entries, essay metadata | `js/shared/site-data.js`                                      | Pages that consume `window.SITE_DATA`                      |
| New page or canonical URL / OG tags                 | Add HTML, then `npm run seo:inject`                           | `site-data/site-origin.json` unchanged unless origin moves |
| Resume API automation                               | `PUT /api/resume` with `Authorization: Bearer …`              | `CLOUD_PASSWORD`; no `/api/auth`                           |
| Server or API behavior                              | `server.js`, `test/server.test.js`                            | `npm run verify`                                           |

---

## Verification (copy-paste)

```bash
npm install          # or npm ci in clean trees
npm run verify       # lint + format check + tests (same as CI)
```

Individual steps: `npm test`, `npm run lint`, `npm run format:check`.

---

## Future log entries (for agents updating docs)

When you finish a maintenance milestone or a multi-file feature:

1. Append a row to the **Timeline** table in [maintenance-log.md](maintenance-log.md).
2. Add a dated subsection with scope, files touched, and **For future agents** bullets if behavior changed.
3. Bump **Last updated** at the bottom of that file.
4. If the root README is now wrong (routes, env, structure), update [README.md](../README.md) in the same change when practical.

Keep prose factual and scannable: tables and numbered lists beat long paragraphs.

---

## Cursor-specific notes

- **Image / polish work:** `.cursor/agents/imageceo.md` describes the Image CEO agent for public-facing quality.
- **House rule:** no em dash character (U+2014) in project copy; see `style.md` and `no-em-dash.mdc`.
