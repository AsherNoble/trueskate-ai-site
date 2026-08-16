# AGENTS.md

This file provides guidance to coding agents (Claude Code, Codex, and others) when working with code
in this repository. It is the single source of truth — `CLAUDE.md` points here.

## Hard rule: the prose is the author's

**Do not write, rewrite, reword, trim, expand or "improve" any human-readable text on the page
without explicit permission for that specific change.** This covers headings, paragraphs, captions,
list and definition-row text, stat labels, the `<h1>`, the lead, the meta rule, footer copy, and
`alt`/`aria-label` strings. If the request is a layout, styling, structure, build or behaviour
change, do it and leave every string exactly as it was — including its spacing, its `&mdash;` and
`&rsquo;` entities, and its approximation marks.

Everything non-prose is fair game without asking: CSS, the grid, markup structure and class names,
`assemble.mjs`, `main.js`, asset paths, `src`/`href`/`id` attributes, and moving existing text from
one element or file to another **unchanged**.

If a copy change looks necessary — a caption that now contradicts the figure, a placeholder sentence
that should go once real data lands — say so and propose the wording, then wait. Don't apply it as a
side effect of another task.

## What this is

A static single-page **research document** for TrueSkate-AI (an agent learning True Skate on physical
iPhones from screen pixels). No framework, no package.json, no dependencies, no tests. Deployed as-is
from the repo root (GitHub Pages with `.nojekyll`, or Vercel with framework preset *Other*, no build
command, output dir `.`).

## Commands

```bash
node build/assemble.mjs      # REQUIRED after any content/CSS edit — regenerates index.html + styles/sections.css
node build/screenshot.mjs    # full-page renders at 1440/1100/834/720/390 into build/shot-*.png
python3 -m http.server 8000  # preview at http://localhost:8000 (or just open index.html)
```

`screenshot.mjs` needs Node 22+ (native `WebSocket`) and Chrome at
`/Applications/Google Chrome.app`. It drives headless Chrome over CDP directly — no Puppeteer.
Its PNG output is gitignored.

## Build pipeline

`build/assemble.mjs` is the whole build. It:
- concatenates `build/fragments/01-what.html` … `07-status.html` in the order listed in `sectionFiles`
- concatenates `cssOrder` (`doc.css`) into `styles/sections.css`
- owns everything the fragments don't: `<head>`/meta/favicon, the sidebar rail and its link list, the
  `<h1>`/lead/meta-rule title block, and the footer — all as template literals inside the script

**`index.html` and `styles/sections.css` are generated and committed. Never edit them directly** —
the next assemble overwrites the change. Edit the fragment, or `assemble.mjs` for shell content.

Where a given edit belongs:
- section prose/markup → `build/fragments/0N-*.html` (markup only; no `<style>`, no inline styles)
- layout/component CSS → `build/fragments/doc.css`
- design tokens → `styles/base.css` (source of truth for tokens; not part of the concatenation)
- rail labels, title, meta rule, footer, `<head>`, rev number → `build/assemble.mjs`
- behaviour → `scripts/main.js` (scrollspy + click-to-play only; no browser-storage APIs)

Adding a section means: new `0N-*.html` fragment, add it to `sectionFiles`, add a `railLinks` entry,
and give the `<h2>` an `id="sN"` matching the rail `href` (scrollspy pairs them by that id).

## The 24px grid constraint

`--cell: 24px` is the only spacing unit, and `.doc-main` paints a 24px grid behind the content. If a
block's height isn't a whole multiple of 24px the drawn lines cut visibly through text. Four rules,
all load-bearing:

1. Every block's total height is a multiple of `--cell`. A 1px border is absorbed by its own padding
   (`12px + 11px + 1px = 24px`), never added on top — this is why paddings are asymmetric
   (`padding: 12px 0 11px`). Keep them asymmetric.
2. Every line-height is `24px`, or `16px` (`--lh-tight`) in sidebar chrome. **Never unitless.**
3. Media is sized with whole-cell heights from `--media-clip` (360px) / `--media-figure` (216px) /
   `--media-plot` (288px), applied via `.doc-h-clip` / `.doc-h-figure` / `.doc-h-plot`.
   **Never `aspect-ratio`** — an intrinsic ratio computes fractional pixels and knocks everything
   below it off the grid, differently at each width.
4. The grid is painted on `.doc-main`, not `body`, so it's anchored to the column and can't drift.

After a visual change, run `node build/screenshot.mjs` and confirm no drawn line crosses a glyph at
1440px, 1100px and 720px. If one does, something introduced an `aspect-ratio` or a unitless
line-height. Below 860px the rail becomes a horizontal row above the content.

## Design language

Engineering document, not an interface: no cards, buttons, border-radius, shadows, gradients or
scroll reveals. One monospace family, one near-black ground, hairline linework at low white opacity,
one technical blue accent. `--warn` amber is permitted for exactly one thing — marking a *known
broken* item in section 07. Motion is one ease and two durations; hover changes colour only.

Markup uses the flat `.doc-*` / `.doc-block__element` classes defined in `doc.css` — reuse them
rather than adding new ones.

## Content rules

These describe the voice the existing copy is written in — they are context for reading it and for
proposing wording when asked, **not** licence to edit it. See the hard rule above.

Nothing is being sold: no CTAs, no benefit copy. First person singular. Approximation marks are kept
(`~1,280`, `~3.5s`) and never rounded to look tidier. Missing material renders a `.doc-placeholder`
naming the file it expects, and placeholder data is labelled as placeholder in its own caption —
when real data lands, delete that sentence in the same change. Captions state what the material
**is and is not**. No emoji, no icon library; the only glyphs are `↗`, `·` and `—`.

`TODO.md` is the live checklist of outstanding placeholders and copy fixes — check it before
touching figures or the meta rule, and update it alongside the change.
