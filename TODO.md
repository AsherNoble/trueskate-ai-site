# TODO — TrueSkate-AI research log

Personal working checklist. (Public-repo-safe — nothing sensitive here.)

## Placeholders on the page — each names the file it expects
- [ ] Social share card → `assets/og.png` (1200×630), then uncomment the `og:image` meta in
      `build/assemble.mjs`.

## Copy
- [ ] The meta rule says `log started 2026-06` — that is when this repo started, not when the
      project did. Replace with the real project start date.
- [ ] Left-hand wording — the left hand holds the iPhone with a single actuated thumb for the
      spin / hold button. Worth a line in section 04 once the design settles.

## Media
- [ ] `assets/posters/*.jpg` are ffmpeg stills cropped to the 216px frame band. If the source
      clips are re-shot, re-extract them (see git history for the timestamps and crops used).
- [ ] `training-setup.mp4` and `gameplay.mp4` are still in the repo but no longer referenced by the
      page. Delete them if they stay unused. (`3 phone training setup.mov` and `agent-run.mp4` are the sources of the Fig. 6 loops,
      `assets/demos/training-setup-loop.mp4` and `assets/demos/agent-run-loop.mp4` — keep them.
      The former figure 2 Protostars teaser is no longer referenced.)

## Polish — not blocking
- [ ] Vendor JetBrains Mono instead of the Google Fonts `<link>` (swap for `@font-face`).
- [ ] Favicon visual pass.
- [ ] Custom domain (optional).

## Build reminder
Edit `build/fragments/`, then run `node build/assemble.mjs` to regenerate `index.html` +
`styles/sections.css`. **Don't edit `index.html` directly** — it's generated.

Then run `node build/screenshot.mjs` and check the grid: at 1440px, 1100px and 720px no drawn
line may cross any glyph. If one does, something is using `aspect-ratio` or a unitless
line-height.
