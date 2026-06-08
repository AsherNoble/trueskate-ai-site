# TODO — TrueSkate-AI landing page

Personal working checklist. (Public-repo-safe — nothing sensitive here.)

## Assets — drop files in; styled placeholders show until then
- [ ] Demo clips → `assets/demos/`: `device.mp4`, `ocr.mp4`, `gesture.mp4`, `landed.mp4`,
      `trick-01.mp4` … `trick-06.mp4`  (muted, looped, landscape, a few seconds each)
- [ ] Hand module clip → `assets/hand/module.mp4`  (the two-finger module moving)
- [ ] Social share card → `assets/og.png` (1200×630), then uncomment the `og:image`
      meta in `build/assemble.mjs`

## Copy
- [ ] **Left-hand wording** — the left hand holds the iPhone with a single actuated thumb
      for the spin / hold button. Refine the exact phrasing in the roadmap B3 goal card +
      vision note (marked `TODO` in `build/fragments/roadmap.html`).
- [ ] About section — refine the descriptor / add an optional one-line personal motivation
      (`build/fragments/about.html`).

## Polish / ideas — not blocking
- [ ] Optionally swap the CAD-schematic hand SVG for a photographic wireframe/exploded render
      (drop `assets/hand/wireframe.png` / `exploded.png` and swap the slot for an `<img>`).
- [ ] Tune the hand SVG geometry / proportions.
- [ ] Consider drawing the left (holding) hand alongside the right (skating) hand.
- [ ] Favicon + og-card visual pass.
- [ ] Custom domain (optional).

## Build reminder
Edit fragments in `build/fragments/`, then run `node build/assemble.mjs` to regenerate
`index.html` + `styles/sections.css`. **Don't edit `index.html` directly** — it's generated.
