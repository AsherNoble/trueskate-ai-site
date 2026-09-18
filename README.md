# trueskate-ai — research log

A static, single-page **research document** for TrueSkate-AI: a personal project on learning fine
motor control from vision alone — an agent playing *True Skate* on unmodified physical iPhones,
seeing only screen frames and acting only through touch.

Design language: **engineering document**. A fixed numbered table-of-contents rail, one reading
column painted on a drawn 24px grid, one monospace family, near-black ground, hairline linework,
one technical blue. No cards, no buttons, no radius, no shadows, no gradients, no scroll reveals.

## The one constraint

`--cell: 24px` is the only spacing unit, and the page paints a 24px grid behind the content. If a
block's height is not a whole multiple of 24px, the drawn lines visibly cut through text. Four
rules, all load-bearing:

1. Every block's total height is a multiple of `--cell`. A 1px border is absorbed by its own
   padding — `12px + 11px + 1px = 24px` — never added on top. This is why paddings look
   asymmetric (`padding: 12px 0 11px`). Keep them asymmetric.
2. Every line-height is `24px`, or `16px` (`--lh-tight`) inside sidebar chrome. **Never unitless.**
3. Media is sized with a whole-cell height from `--media-clip` (360px) / `--media-figure` (216px) /
   `--media-plot` (288px). **Never `aspect-ratio`** — an intrinsic ratio computes fractional pixels
   and knocks every block below it off the grid, differently at each window width.
4. The grid is painted on `.doc-main`, not on `body`, so it is anchored to the column and cannot
   drift on resize.

Change `--cell` and the whole page re-registers. Break any of the four and it is immediately
visible — that is the point.

## Run it

Fully static — no build step required to view.

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

Or open `index.html` directly.

## Structure

```
index.html              assembled page — GENERATED, do not edit
styles/base.css         design tokens + reset (source of truth)
styles/sections.css     GENERATED from build/fragments/*.css
build/fragments/doc.css the document primitives — this is the system
build/fragments/0N-*.html   the four sections
build/assemble.mjs      owns the head, the rail, the title block and the footer
build/screenshot.mjs    full-page renders at 1440/1100/834/720/390
scripts/main.js         scrollspy + click-to-play, nothing else
assets/posters/         stills extracted from the source clips with ffmpeg
```

## Editing

- **Sections** live in `build/fragments/0N-*.html`. They are markup only — they carry no CSS and
  no inline styles, just the `.doc-*` classes defined in `build/fragments/doc.css`.
- **The shell** — `<head>`, the sidebar rail, the title block, the meta rule and the footer — lives
  in template literals in `build/assemble.mjs`, not in any HTML file.
- **Tokens** are in `styles/base.css`.
- After any edit: `node build/assemble.mjs`. **Don't edit `index.html` or `styles/sections.css`
  directly** — both are generated and committed.

Then check the grid: `node build/screenshot.mjs` and confirm no drawn line crosses any glyph at
1440px, 1100px and 720px. Below 860px the rail becomes a horizontal row above the content.

## Content rules

Nothing is being sold — no CTAs, no benefit copy. First person singular. Approximation marks are
kept (`~1,280`, `~3.5s`), never rounded to look tidier. Missing material renders a placeholder
naming the file it expects, and placeholder data is labelled placeholder. Captions say what the
material **is and is not**. Only *known broken* uses amber. No emoji and no icon library — the only
glyphs are `↗`, `·` and `—`.

## Deploy

Static — GitHub Pages or Vercel, no build step.

- **GitHub Pages:** push and serve from the repo root (`.nojekyll` is included). Asset and style
  paths are relative, so it works from a project subpath.
- **Vercel:** framework preset = *Other*; no build command; output dir = `.`.

See [`TODO.md`](TODO.md) for the working checklist.
