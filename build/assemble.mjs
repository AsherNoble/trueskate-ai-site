/* ============================================================
   trueskate-ai — assemble.mjs
   Owns the document shell (head/fonts/rail/footer), splices the
   built section fragments in order, and concatenates fragment
   CSS into styles/sections.css.
   Run:  node build/assemble.mjs
   ============================================================ */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
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

/* ---- sections (in render order) ---- */
const sectionFiles = [
  "01-what.html",
  "02-demo.html",
  "03-how.html",
  "04-hand.html",
  "05-hood.html",
  "06-roadmap.html",
  "07-status.html",
];
const sections = sectionFiles
  .map((name) => readReq(frag(name), name))
  .join("\n\n");

/* ---- CSS bundle ---- */
const cssOrder = ["doc"];
const sectionCss = cssOrder
  .map((id) => {
    const css = read(frag(id + ".css"));
    return css ? "/* ===== " + id + " ===== */\n" + css.trim() + "\n" : "";
  })
  .filter(Boolean)
  .join("\n");
writeFileSync(F("styles/sections.css"), sectionCss, "utf8");

/* ---- favicon (inline blueprint mark) ---- */
const faviconSvg =
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'>" +
  "<rect width='32' height='32' rx='6' fill='%230A0B0D'/>" +
  "<circle cx='16' cy='16' r='9' fill='none' stroke='%23E8EAED' stroke-width='1.4'/>" +
  "<circle cx='25' cy='16' r='2.6' fill='%235B8DEF'/></svg>";
const favicon = "data:image/svg+xml," + faviconSvg.replace(/#/g, "%23").replace(/ /g, "%20");

/* ---- document shell ---- */
const railLinks = [
  ["#s1", "1", "What it is"],
  ["#s2", "2", "Demo"],
  ["#s3", "3", "How it works"],
  ["#s4", "4", "The hand"],
  ["#s5", "5", "Under the hood"],
  ["#s6", "6", "Roadmap"],
  ["#s7", "7", "Status"],
]
  .map(
    ([href, idx, label]) =>
      `        <a class="doc-nav__link" href="${href}" data-nav-link><span class="doc-nav__index">${idx}</span>${label}</a>`
  )
  .join("\n");

const sidebar = `    <aside class="doc-sidebar">
      <a class="doc-brand" href="#main" aria-label="trueskate-ai, back to top">trueskate<span class="accent">-ai</span></a>
      <div class="doc-ver">research log · rev 15</div>
      <nav class="doc-nav" aria-label="Contents">
${railLinks}
      </nav>
      <div class="doc-sidebar__foot">
        <a href="https://github.com/AsherNoble/TrueSkate-AI" target="_blank" rel="noopener">github ↗</a>
        <a href="https://www.linkedin.com/in/ashernoble/" target="_blank" rel="noopener">linkedin ↗</a>
        <span>rev 15 · 2026-07</span>
      </div>
    </aside>`;

/* ---- title block: h1, lead, meta rule ---- */
const titleBlock = `        <h1 class="doc-title">trueskate<span class="accent">-ai</span> &mdash; learning to skate from pixels</h1>
        <p class="doc-lead">A personal research project on learning fine motor control from vision alone: an agent playing True Skate on unmodified physical iPhones, seeing only screen frames and acting only through touch.</p>
        <div class="doc-meta">
          <div class="doc-meta__item"><b>Asher Noble</b></div>
          <div class="doc-meta__item">log started <b>2026-06</b></div>
          <div class="doc-meta__item">status <b>in progress</b></div>
          <div class="doc-meta__item"><b>no publication</b></div>
        </div>`;

const footer = `      <footer class="doc-footer">
        <a href="https://github.com/AsherNoble/TrueSkate-AI" target="_blank" rel="noopener">github.com/AsherNoble/TrueSkate-AI</a>
        <a href="https://www.linkedin.com/in/ashernoble/" target="_blank" rel="noopener">linkedin.com/in/ashernoble</a>
        <span>last touched 2026-07-31</span>
      </footer>
      <p class="doc-caption doc-colophon">true skate is a game by <a href="http://trueaxis.com/trueskate.html" target="_blank" rel="noopener">true axis</a>, available on the <a href="https://apps.apple.com/app/true-skate/id549105915" target="_blank" rel="noopener">app store</a> — trueskate-ai is an independent research project and is not affiliated with or endorsed by true axis.</p>`;

const scripts = `  <script src="scripts/main.js" defer></script>`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>trueskate-ai — research log</title>
  <meta name="description" content="A personal research project: an agent learning to play True Skate on physical iPhones from screen pixels alone. Notes, figures and current status.">
  <meta name="theme-color" content="#0A0B0D">
  <meta name="color-scheme" content="dark">
  <meta property="og:type" content="website">
  <meta property="og:title" content="trueskate-ai — research log">
  <meta property="og:description" content="A personal research project: an agent learning to play True Skate on physical iPhones from screen pixels alone. Notes, figures and current status.">
  <!-- TODO: og:image — add a 1200x630 share card at assets/og.png and uncomment:
  <meta property="og:image" content="assets/og.png"> -->
  <link rel="icon" href="${favicon}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles/base.css">
  <link rel="stylesheet" href="styles/sections.css">
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <div class="doc">
${sidebar}
    <main class="doc-main" id="main">
      <div class="doc-wrap">
${titleBlock}
${sections}
${footer}
      </div>
    </main>
  </div>
${scripts}
</body>
</html>
`;

writeFileSync(F("index.html"), html, "utf8");

console.log("Assembled index.html (" + html.length + " bytes) + styles/sections.css (" + sectionCss.length + " bytes).");
