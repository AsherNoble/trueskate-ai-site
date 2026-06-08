/* ============================================================
   TrueSkate-AI — assemble.mjs
   Owns the document shell (head/fonts/nav/footer), splices the
   built fragments in order, injects the diagram + wireframe into
   their slots, and concatenates section CSS into styles/sections.css.
   Run:  node build/assemble.mjs
   ============================================================ */
import { readFileSync, writeFileSync, existsSync, copyFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const F = (p) => join(ROOT, p);
const frag = (name) => F(join("build/fragments", name));

const read = (p) => (existsSync(p) ? readFileSync(p, "utf8") : null);
function readReq(p, label) {
  const v = read(p);
  if (v == null) { console.warn("!! MISSING fragment: " + label + " (" + p + ")"); return ""; }
  return v;
}
function block(html, start, end, label) {
  if (!html) return "";
  const i = html.indexOf(start), j = html.indexOf(end);
  if (i === -1 || j === -1) { console.warn("!! marker not found for " + label); return ""; }
  return html.slice(i + start.length, j).trim();
}

/* ---- components ---- */
const diagramHtml = readReq(frag("diagram.html"), "diagram");
const handHtml = readReq(frag("hand.html"), "hand");
const diagramCompact = block(diagramHtml, "<!-- DIAGRAM:COMPACT -->", "<!-- /DIAGRAM:COMPACT -->", "diagram compact");
const diagramFull = block(diagramHtml, "<!-- DIAGRAM:FULL -->", "<!-- /DIAGRAM:FULL -->", "diagram full");
const handPlain = block(handHtml, "<!-- HAND:PLAIN -->", "<!-- /HAND:PLAIN -->", "hand plain");
const handAnnotated = block(handHtml, "<!-- HAND:ANNOTATED -->", "<!-- /HAND:ANNOTATED -->", "hand annotated");
const hasDiagramJs = existsSync(frag("diagram.js"));

/* ---- sections (in render order) ---- */
let hero = readReq(frag("hero.html"), "hero");
hero = hero.replace("<!-- SLOT:HAND-PLAIN -->", handPlain || "<!-- hand render pending -->");
hero = hero.replace("<!-- SLOT:DIAGRAM-COMPACT -->", diagramCompact || "<!-- diagram pending -->");

let handSection = readReq(frag("handsection.html"), "handsection");
handSection = handSection.replace("<!-- SLOT:HAND-ANNOTATED -->", handAnnotated || "<!-- hand render pending -->");

let how = readReq(frag("how.html"), "how");
how = how.replace("<!-- SLOT:DIAGRAM-FULL -->", diagramFull || "<!-- diagram pending -->");

const sections = [
  hero,
  readReq(frag("pitch.html"), "pitch"),
  handSection,
  readReq(frag("demo.html"), "demo"),
  how,
  readReq(frag("stats.html"), "stats"),
  readReq(frag("roadmap.html"), "roadmap"),
  readReq(frag("about.html"), "about"),
].join("\n\n");

/* ---- CSS bundle (order matters: components first, then sections) ---- */
const cssOrder = ["diagram", "hand", "hero", "pitch", "handsection", "demo", "how", "stats", "roadmap", "about"];
const sectionCss = cssOrder
  .map((id) => {
    const css = read(frag(id + ".css"));
    return css ? "/* ===== " + id + " ===== */\n" + css.trim() + "\n" : "";
  })
  .filter(Boolean)
  .join("\n");
writeFileSync(F("styles/sections.css"), sectionCss, "utf8");

/* ---- copy diagram.js if present ---- */
if (hasDiagramJs) copyFileSync(frag("diagram.js"), F("scripts/diagram.js"));

/* ---- favicon (inline blueprint mark) ---- */
const faviconSvg =
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'>" +
  "<rect width='32' height='32' rx='6' fill='%230A0B0D'/>" +
  "<circle cx='16' cy='16' r='9' fill='none' stroke='%23E8EAED' stroke-width='1.4'/>" +
  "<circle cx='25' cy='16' r='2.6' fill='%235B8DEF'/></svg>";
const favicon = "data:image/svg+xml," + faviconSvg.replace(/#/g, "%23").replace(/ /g, "%20");

/* ---- document shell ---- */
const nav = `  <nav class="nav">
    <div class="nav__inner">
      <a class="wordmark" href="#hero" aria-label="trueskate-ai, back to top">trueskate<span class="accent">-ai</span></a>
      <div class="nav__links">
        <a href="#hand" data-nav-link>The hand</a>
        <a href="#demo" data-nav-link>Demo</a>
        <a href="#how" data-nav-link>How it works</a>
        <a href="#roadmap" data-nav-link>Roadmap</a>
        <a class="nav__links-cta" href="https://github.com/AsherNoble/TrueSkate-AI" target="_blank" rel="noopener">GitHub <span aria-hidden="true">↗</span></a>
      </div>
    </div>
  </nav>`;

const footer = `  <footer class="footer">
    <div class="container container--wide">
      <div class="footer__inner">
        <p class="footer__brand">trueskate<span class="accent">-ai</span> — an AI that's learning to skate.</p>
        <div class="footer__meta">
          <a href="https://github.com/AsherNoble/TrueSkate-AI" target="_blank" rel="noopener">GitHub <span aria-hidden="true">↗</span></a>
          <span aria-hidden="true">·</span>
          <span>built with HTML · CSS · a little vanilla JS</span>
          <span aria-hidden="true">·</span>
          <span>© 2026</span>
        </div>
      </div>
      <p class="footer__credit">
        <a href="http://trueaxis.com/trueskate.html" target="_blank" rel="noopener">True Skate</a> is a game by True Axis —
        get it on the <a href="https://apps.apple.com/app/true-skate/id549105915" target="_blank" rel="noopener">App Store</a>,
        or follow it on <a href="https://www.instagram.com/trueskateofficial/" target="_blank" rel="noopener">Instagram</a>.
        TrueSkate-AI is an independent research project and is not affiliated with or endorsed by True Axis.
      </p>
    </div>
  </footer>`;

const scripts =
  `  <script src="scripts/main.js" defer></script>` +
  (hasDiagramJs ? `\n  <script src="scripts/diagram.js" defer></script>` : "");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script>document.documentElement.classList.add('js')</script>
  <title>TrueSkate-AI — An AI that's learning to skate</title>
  <meta name="description" content="A reinforcement-learning agent that lands real tricks in True Skate, running on physical iPhones — no simulator, driven by Appium + WebDriverAgent, read by Apple Vision OCR, optimized with CMA-ES.">
  <meta name="theme-color" content="#0A0B0D">
  <meta name="color-scheme" content="dark">
  <meta property="og:type" content="website">
  <meta property="og:title" content="TrueSkate-AI — An AI that's learning to skate">
  <meta property="og:description" content="A reinforcement-learning agent that lands real tricks in True Skate on physical iPhones — no simulator, no access to the game's code.">
  <!-- TODO: og:image — add a 1200x630 share card at assets/og.png and uncomment:
  <meta property="og:image" content="assets/og.png"> -->
  <link rel="icon" href="${favicon}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles/base.css">
  <link rel="stylesheet" href="styles/sections.css">
</head>
<body>
  <a class="skip-link" href="#hero">Skip to content</a>
${nav}
  <main class="main" id="main">
${sections}
  </main>
${footer}
${scripts}
</body>
</html>
`;

writeFileSync(F("index.html"), html, "utf8");

const missing = [];
if (!diagramCompact) missing.push("diagram:compact");
if (!diagramFull) missing.push("diagram:full");
if (!handPlain) missing.push("hand:plain");
if (!handAnnotated) missing.push("hand:annotated");
console.log("Assembled index.html (" + html.length + " bytes) + styles/sections.css (" + sectionCss.length + " bytes).");
console.log("diagram.js included: " + hasDiagramJs);
if (missing.length) console.log("WARN unresolved slots: " + missing.join(", "));
