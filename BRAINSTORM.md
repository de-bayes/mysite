## 2026 Suggested Feature Roadmap (Prioritized)

If you want the highest "wow" for effort, build in this order:

1. **Command Palette (`Cmd/Ctrl+K`)**
   - Fast jump between pages, commands, and toggles.
   - Reuses your terminal command model and makes the whole site feel app-like.

2. **Terminal Expansion Pack**
   - Add 2-3 playful commands (`/theme`, `/play`, `/about me`) + one mini-game.
   - Keep score in localStorage so visitors can compete with themselves.

3. **Offline-first PWA**
   - Installable portfolio + offline terminal and pages.
   - Signals strong product thinking and frontend engineering depth.

4. **Interactive Project Case Studies**
   - Turn project cards into expandable "build logs" with architecture diagrams and before/after metrics.
   - Great for recruiters who scan quickly.

5. **Cloud Page Upgrades**
   - Drag-and-drop uploads, zip download, and share links with expiration.
   - Converts the cloud page from demo to genuinely useful utility.

### Bonus "Delight" Ideas
- **Konami code Easter egg** that unlocks a secret theme.
- **Visitor guestbook** with retro styling + `/sign` terminal command.
- **Print-to-resume mode** for one-click PDF-friendly export.


# Feature Brainstorm

Ideas for cool web features, organized by category. Everything below assumes the current vanilla JS/HTML/CSS stack (no frameworks needed).

---

## Visual / Aesthetic

### Page Transitions
Smooth animated transitions between pages instead of hard navigations. Intercept link clicks, fetch the next page, and crossfade/slide/morph between them. The grid background could seamlessly transform (e.g., regular grid morphing into polar grid when navigating to Experience).

### Scroll-Triggered Reveals
Elements fade in, slide up, or scale in as they enter the viewport using `IntersectionObserver`. Stagger the animations on card grids so they cascade in one by one. Subtle but makes every page feel alive.

### 3D Parallax Tilt on Cards
Project cards and passion cards follow the mouse with a perspective transform — tilt toward the cursor with a soft shadow shift. Pure CSS `transform: perspective() rotateX() rotateY()` driven by mousemove. Feels tactile.

### Shader Backgrounds
Replace or augment the canvas grid with WebGL fragment shaders — fluid simulations, noise fields, or aurora-style gradients that react to mouse position. Could offer as an alternate background mode toggled from the terminal (`/shader`).

### Custom Cursor
Replace the default cursor with a small animated dot + trailing ring that scales on hover over interactive elements. Subtle but immediately signals "this site is hand-crafted."

### Scanline / CRT Mode
A togglable retro CRT effect — scanlines, slight screen curvature via CSS, phosphor glow, maybe a subtle flicker. Fits the terminal aesthetic perfectly. Toggle via `/crt` in the terminal.

---

## Interactive / Fun

### Desktop OS Mode
Transform the entire site into a fake desktop environment. Each page becomes a draggable, resizable window (the terminal window already does this). Add a taskbar at the bottom, a start menu, desktop icons. Classic Web 2.0 energy. Could be toggled with `/desktop` in the terminal.

### More Terminal Games
- **Tetris** — fits perfectly in the text-based terminal
- **Pong** — two-player with WASD + arrows, or vs simple AI
- **Typing test** — random quotes, measures WPM, shows accuracy
- **Minesweeper** — text-grid based, click to reveal
- **2048** — arrow keys, number grid, natural terminal fit
- **Wordle clone** — daily word puzzle in ASCII

### Easter Eggs
- **Konami code** (up up down down left right left right B A) triggers something wild — confetti, screen flip, secret page
- **`/sudo`** in terminal prints a fake "root access granted" animation
- **Hidden page** accessible only via terminal command (`/secret`)
- **Click the favicon 10 times** to trigger something
- **Type "hello" backwards** in the terminal for a surprise

### ASCII Art Generator
Terminal command `/ascii <image-url>` that fetches an image, draws it to an offscreen canvas, samples pixel brightness, and renders it as ASCII characters in the terminal. Pure client-side.

### Interactive Resume Timeline
The Experience page reimagined as a vertical scrolling timeline with nodes that expand on click, connected by an animated line that draws as you scroll.

### Pixel Art Editor
A mini pixel art tool accessible via `/draw` in the terminal. Grid of cells you can click to color. Export as ASCII art or download as PNG. Simple, fun, fits the aesthetic.

---

## Functional / Useful

### Command Palette (Cmd+K / Ctrl+K)
A floating search bar (like VS Code / Raycast / Spotlight) that pops up on keyboard shortcut. Search pages, jump to sections, run terminal commands, toggle dark mode — all from one input. Fuzzy matching.

### Global Keyboard Shortcuts
- `1-7` keys navigate to each page
- `D` toggles dark mode
- `T` opens/focuses terminal
- `?` shows shortcut cheat sheet overlay
- `Esc` closes any overlay/modal

### PWA Support
Add a `manifest.json` and service worker so the site is installable and works offline. The terminal and games would work perfectly offline. Visitors could literally install your portfolio as an app.

### Reading Progress Bar
A thin accent-colored bar at the top of the page that fills as you scroll down. Simple, useful on longer pages like Experience.

### Lazy Image Loading with Blur-Up
Load tiny blurred placeholder images first, then swap in full-res with a smooth transition. Especially useful for the Photos page and the large hero image.

---

## Social / Community

### Guestbook
A retro-web-style guestbook page where visitors can leave short messages. Could store entries in localStorage for a personal/demo version, or use a free backend (e.g., a simple JSON API, Firebase, or even GitHub Issues as a backend). The terminal could also support `/sign` to leave a guestbook entry.

### Retro Visitor Counter
An old-school "You are visitor #4,827" counter at the bottom of the page. Hit a free counter API or roll a simple one. Lean into the retro web nostalgia.

### Share Cards / OG Previews
Rich Open Graph meta tags so the site looks great when shared on Twitter/Discord/iMessage. Custom preview image, title, description per page. Terminal-themed preview card.

---

## Content / Widgets

### Now Playing / Spotify Widget
A small "now playing" widget showing current Spotify track (via Spotify API or last.fm scrobbling). Fits the personal vibe of the site.

### GitHub Contribution Graph
Render your GitHub contribution heatmap directly on the Projects page. Fetch via GitHub API, render as a grid of colored cells. Shows activity at a glance.

### Prediction Market Widget
Since prediction markets are listed as a passion — embed a live widget showing current positions or interesting markets from Manifold/Polymarket. Could pull from their public APIs.

### Blog / Journal
A simple blog section. Markdown files rendered client-side (use a tiny MD parser). Write posts as `.md` files, the page auto-discovers and renders them. No build step needed.

### Link-in-Bio Page
A clean, single-column page with all your important links — like a self-hosted Linktree. Useful for social media bios.

---

## Technical Flex

### View Source Easter Egg
A custom "view source" experience — `Ctrl+U` or `/source` in terminal shows a beautifully formatted, syntax-highlighted version of the page source with comments explaining the cool parts.

### Performance HUD
A toggleable overlay (`/perf` in terminal) showing FPS, DOM node count, memory usage, page weight. Demonstrates you care about performance.

### Offline Mode
Service worker caches all pages and assets. When offline, the site still works and the terminal shows a special "offline mode" banner. Games are fully playable offline.

### Web Workers for Games
Offload game logic (snake, dino) to Web Workers so the main thread stays smooth. Overkill? Yes. Cool? Also yes.

---

## Quick Wins (Small effort, big impact)

1. **Favicon animation** — animate the favicon (swap between frames) when a game is active
2. **Smooth scroll** for in-page anchor links
3. **404 page** — a fun, interactive 404 with terminal aesthetic and a playable game
4. **Print stylesheet** — make the site print as a clean resume
5. **Meta theme-color** — set the browser chrome color to match dark/light mode
6. **Prefers-reduced-motion** — respect the OS accessibility setting, disable animations
7. **Tab title updates** — change `document.title` dynamically (e.g., "Come back!" when tab loses focus)
8. **Right-click custom context menu** — replace the browser context menu with a custom one offering site navigation and commands
9. **Toast notifications** — subtle slide-in notifications for actions (dark mode toggled, game high score, etc.)
10. **Animated page title** — the monospace page titles type themselves out on load

---

## Top 5 Highest-Impact Picks

If I had to pick the features that would make the biggest impression:

1. **Page transitions** — transforms the multi-page site into something that feels like a polished app
2. **Command palette (Cmd+K)** — instantly signals "this person knows modern UI patterns"
3. **Desktop OS mode** — a showstopper that people would share and talk about
4. **More terminal games + easter eggs** — the terminal is already the star; double down on it
5. **3D card tilt + scroll reveals** — small touches that make every page feel premium
