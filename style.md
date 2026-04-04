# Site writing and punctuation style

## Em dashes

**Do not use the em dash** (Unicode U+2014, never `&mdash;` in HTML, and never the long dash character from some keyboards).

Use one of these instead:

- **Comma** for a light break or appositive: _Student, data fellow, Evanston_
- **Colon** before an explanation or list: _Evidence: you opened this page_
- **Parentheses** for asides: _forecasting (including markets)_
- **Hyphen** (-) for compound modifiers: _decision-desk work_
- **"To" or a hyphen surrounded by spaces** for ranges: _2025 to Present_ or _2025 - Present_

En dashes (–, U+2013) are acceptable only if you deliberately want a typographic range; when in doubt, use **hyphen with spaces** or the word **to**.

## Voice

Keep copy aligned with the rest of the site: clear, direct, first person where it fits (about page).

## After edits

Run `npm run seo:inject` if you change the canonical site origin in `site-data/site-origin.json`.
