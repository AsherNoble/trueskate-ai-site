# TODO — trueskate-ai research log

Personal working checklist. (Public-repo-safe — nothing sensitive here.)

## Placeholders on the page — each names the file it expects
- [ ] **Fig. 6** — two-finger hand module clip → `assets/hand/module.mp4`. Renders
      `clip pending — hand/module.mp4` until it exists.
- [ ] **Fig. 7** — the landings-per-hundred-attempts plot in `build/fragments/05-hood.html` is
      **placeholder data**, indicative shape only. Drop the real CMA-ES run data in and remove the
      "placeholder plot" sentence from the caption at the same time.
- [ ] Social share card → `assets/og.png` (1200×630), then uncomment the `og:image` meta in
      `build/assemble.mjs`.

## Copy
- [ ] The meta rule says `log started 2026-06` — that is when this repo started, not when the
      project did. Replace with the real project start date.
- [ ] Section 07 names one *known broken* item (the collapsed PPO + HER attempt). Keep this row
      honest and current — it is the point of the section.
- [ ] Left-hand wording — the left hand holds the iPhone with a single actuated thumb for the
      spin / hold button. Worth a line in section 04 once the design settles.

## Media
- [ ] `assets/posters/*.jpg` are ffmpeg stills cropped to the 216px frame band. If the source
      clips are re-shot, re-extract them (see git history for the timestamps and crops used).
- [ ] `agent-run.mp4`, `training-setup.mp4` and `gameplay.mp4` are still in the repo but no longer
      referenced by the page — only the Protostars pitch plays. Delete them if they stay unused.

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
