# Robotic-hand assets

The hand's wireframe / CAD render is **code-rendered as inline SVG** (see
`build/fragments/hand.html`) — so no static `wireframe.png` / `exploded.png` is
required. The only video asset the page references:

| File         | Used in            | Shows                                         |
|--------------|--------------------|-----------------------------------------------|
| `module.mp4` | "The hand" section | looping clip of the two-finger module moving  |

Until `module.mp4` exists, the page renders a styled blueprint "render pending"
placeholder, so the layout never breaks. Keep it short, muted, looped, landscape.

(If you ever want photographic renders instead of the SVG schematic, drop
`wireframe.png` / `exploded.png` here and swap the SVG slot for an `<img>`.)
