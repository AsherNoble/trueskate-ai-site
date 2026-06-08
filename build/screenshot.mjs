/* Headless-Chrome screenshots via CDP (Node 22 native WebSocket, no deps).
   Renders index.html full-page at several widths with prefers-reduced-motion
   emulated (so .reveal content is visible and the pulse rests).
   Usage: node build/screenshot.mjs                                          */
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const URL_FILE = "file://" + join(ROOT, "index.html");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9333;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn(CHROME, [
  "--headless=new",
  "--remote-debugging-port=" + PORT,
  "--hide-scrollbars",
  "--force-color-profile=srgb",
  "--disable-gpu",
  "--no-first-run",
  "--no-default-browser-check",
  "--user-data-dir=/tmp/tsai-chrome-profile",
  URL_FILE,
], { stdio: "ignore" });

let cmdId = 0;
function send(ws, method, params) {
  return new Promise((resolve, reject) => {
    const id = ++cmdId;
    const onMsg = (ev) => {
      let msg; try { msg = JSON.parse(ev.data); } catch { return; }
      if (msg.id === id) { ws.removeEventListener("message", onMsg); msg.error ? reject(new Error(method + ": " + msg.error.message)) : resolve(msg.result); }
    };
    ws.addEventListener("message", onMsg);
    ws.send(JSON.stringify({ id, method, params: params || {} }));
  });
}

async function getWsUrl() {
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch("http://127.0.0.1:" + PORT + "/json/list");
      const list = await res.json();
      const page = list.find((t) => t.type === "page" && t.webSocketDebuggerUrl);
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(200);
  }
  throw new Error("Chrome devtools endpoint not ready");
}

function connect(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    ws.addEventListener("open", () => resolve(ws), { once: true });
    ws.addEventListener("error", (e) => reject(new Error("ws error")), { once: true });
  });
}

const SHOTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 834, height: 1112 },
  { name: "mobile", width: 390, height: 844 },
];

try {
  const wsUrl = await getWsUrl();
  const ws = await connect(wsUrl);
  await send(ws, "Page.enable");
  await send(ws, "Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });

  for (const s of SHOTS) {
    await send(ws, "Emulation.setDeviceMetricsOverride", {
      width: s.width, height: s.height, deviceScaleFactor: 1, mobile: s.name === "mobile",
    });
    await send(ws, "Page.navigate", { url: URL_FILE });
    await sleep(2200); // let layout settle + fonts/IO
    const { data } = await send(ws, "Page.captureScreenshot", { format: "png", captureBeyondViewport: true });
    const out = join(ROOT, "build/shot-" + s.name + ".png");
    writeFileSync(out, Buffer.from(data, "base64"));
    console.log("wrote " + out);
  }

  // a 2x hero-only viewport shot for detail
  await send(ws, "Emulation.setDeviceMetricsOverride", { width: 1440, height: 860, deviceScaleFactor: 2, mobile: false });
  await send(ws, "Page.navigate", { url: URL_FILE });
  await sleep(2200);
  const hero = await send(ws, "Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  writeFileSync(join(ROOT, "build/shot-hero2x.png"), Buffer.from(hero.data, "base64"));
  console.log("wrote build/shot-hero2x.png");

  ws.close();
} catch (e) {
  console.error("SCREENSHOT ERROR:", e.message);
  process.exitCode = 1;
} finally {
  chrome.kill("SIGKILL");
}
