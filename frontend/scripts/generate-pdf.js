// frontend/scripts/generate-pdf.js
//
// Renders the built catalogue site to a PDF, once per deploy, and writes it
// into the static build output as build/catalogue.pdf. Runs as part of the
// `vercel-build` script (see package.json), after `craco build`.
//
// On Vercel (process.env.VERCEL is set) this launches @sparticuz/chromium,
// a Chromium binary built to run without apt/root access on Amazon Linux —
// which is what Vercel's build container is. Locally, it launches whatever
// Chrome is already installed on the developer's machine, so the script's
// logic can be iterated on and tested without needing a Linux binary.

const http = require('http');
const path = require('path');
const handler = require('serve-handler');

const BUILD_DIR = path.join(__dirname, '..', 'build');
const PORT = 4173;

const SCROLL_SCRIPT = `
  (async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const step = Math.max(400, Math.floor(window.innerHeight * 0.7));
    const total = document.documentElement.scrollHeight;
    for (let y = 0; y <= total; y += step) { window.scrollTo(0, y); await sleep(140); }
    window.scrollTo(0, total); await sleep(600);
    window.scrollTo(0, 0); await sleep(400);
  })();
`;

// puppeteer-core and @sparticuz/chromium are ESM-only packages ("type":
// "module" in their package.json). Dynamic import() works regardless of
// which Node version runs this script (unlike require(), which can only
// load an ES module on Node 20.19+/22.12+ via the newer require(esm)
// support) — so we load both this way rather than assuming a Node version.
async function getLaunchOptions() {
  if (process.env.VERCEL) {
    const { default: chromium } = await import('@sparticuz/chromium');
    return {
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    };
  }

  const executablePath =
    process.env.PUPPETEER_EXECUTABLE_PATH ||
    (process.platform === 'darwin'
      ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      : '/usr/bin/google-chrome');

  return { executablePath, headless: true };
}

async function main() {
  const { default: puppeteer } = await import('puppeteer-core');

  const server = http.createServer((req, res) => handler(req, res, { public: BUILD_DIR }));
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`[generate-pdf] serving ${BUILD_DIR} on http://localhost:${PORT}`);

  const browser = await puppeteer.launch(await getLaunchOptions());

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1701, height: 1203, deviceScaleFactor: 1 });
    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(
      "Array.from(document.images).every((i) => i.complete) && (!document.fonts || document.fonts.status === 'loaded')",
      { timeout: 45000 }
    );
    await new Promise((r) => setTimeout(r, 1200));
    await page.evaluate(SCROLL_SCRIPT);
    await new Promise((r) => setTimeout(r, 1500));

    const outPath = path.join(BUILD_DIR, 'catalogue.pdf');
    await page.pdf({
      path: outPath,
      printBackground: true,
      scale: 0.66,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      preferCSSPageSize: true,
    });
    console.log(`[generate-pdf] wrote ${outPath}`);
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((err) => {
  console.error('[generate-pdf] failed:', err);
  process.exit(1);
});
