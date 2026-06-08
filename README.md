# TrueSkate-AI — landing site

A fast, static, single-page landing site for **TrueSkate-AI**: a reinforcement-learning
agent that learns to land real tricks in the iOS game *True Skate* on **physical iPhones** —
no simulator, driven by Appium + WebDriverAgent, read by Apple Vision OCR, optimized with CMA-ES.

Design language: **"open-source blueprint"** — a dark engineering drawing. White wireframe
linework on near-black, annotated in monospace, with one clean technical blue. The central
pipeline diagram is **code-rendered** (inline SVG + CSS), animated with a blue signal pulse,
and reduced-motion aware.

## Run it

It's fully static — no build step required to view.

```bash
# any static server, e.g.
python3 -m http.server 8000
# then open http://localhost:8000
```

Or just open `index.html` directly in a browser.

## Structure

```
index.html            assembled page (head/nav/footer + sections)
styles/base.css       design system: tokens + shared primitives (source of truth)
styles/sections.css   per-section styles (generated from build/fragments/*.css)
scripts/main.js       scroll-reveal, graceful video fallback, nav scrollspy
scripts/diagram.js    (only if the diagram needs JS; pulse is CSS-first)
assets/demos/         looping clips — see assets/demos/README.md
build/                fragments + assembler (node build/assemble.mjs regenerates index.html)
```

## Editing

- **Content/sections** live in `build/fragments/<id>.html` (+ `<id>.css`). After editing a
  fragment, regenerate the page: `node build/assemble.mjs`.
- The diagram (`build/fragments/diagram.html`) and wireframe (`wireframe.html`) are injected
  into the hero / how-it-works slots by the assembler.
- Design tokens and shared primitives are in `styles/base.css` — change them there and the
  whole site follows.

See [`TODO.md`](TODO.md) for the working checklist.

## TODO / placeholders

- `assets/demos/*.mp4` — drop the looping clips in (styled "clip pending" placeholders show
  until then). See `assets/demos/README.md`.
- `assets/og.png` — optional 1200×630 social share card (head has a commented `og:image`).
- About section descriptor / optional motivation line (marked `TODO` in `build/fragments/about.html`).

## Deploy

Static — works on GitHub Pages or Vercel with no build step.

- **GitHub Pages:** push and serve from the repo root (the `.nojekyll` file is included so
  paths are served as-is). Asset/style paths are relative, so it works from a project subpath.
- **Vercel:** import the repo; framework preset = *Other*; no build command; output dir = `.`.
