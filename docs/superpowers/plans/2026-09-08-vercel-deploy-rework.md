# Vercel Deployment Rework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy `print-catalogue` to Vercel (under the `sree-blooming-graphics` team / `hemanthkaseti-source` GitHub account) as a single project, replacing the parts of the original Python/Mongo/Playwright-runtime backend that can't run on Vercel.

**Architecture:** One Vercel project rooted at `frontend/`. The CRA/craco frontend deploys as static output; a Node build script renders the catalogue PDF once per deploy via `@sparticuz/chromium` + `puppeteer-core` and writes it into the static output; two tiny Node serverless functions under `frontend/api/analytics/` log/summarize events against Neon Postgres; the enquiry form posts directly to Formspree. The old `backend/` (FastAPI/Motor/Resend/runtime-Playwright) is deleted.

**Tech Stack:** Create React App (craco), Node.js Vercel Functions, `@neondatabase/serverless` (Neon Postgres via Vercel Marketplace), `puppeteer-core` + `@sparticuz/chromium`, Formspree.

**Spec:** `docs/superpowers/specs/2026-09-08-vercel-deploy-rework-design.md`

## Global Constraints

- Vercel project Root Directory is `frontend/` (repo root also hosts `docs/`, retired Emergent artifacts, etc. — none of that is part of the deploy).
- Node serverless functions under `frontend/api/` use CommonJS handlers: `module.exports = async (req, res) => { ... }`.
- Database access uses `@neondatabase/serverless`'s `neon()` client, **lazily initialized** (never called at module top-level) reading `process.env.DATABASE_URL`, which the Neon Marketplace integration injects. `@vercel/postgres` is sunset — do not use it.
- PDF rendering runs **only** at build time (`frontend/scripts/generate-pdf.js`, invoked via the `vercel-build` npm script), never at request time. Output lands at `frontend/build/catalogue.pdf`, served as a static file.
- In the PDF script, use `@sparticuz/chromium` + `puppeteer-core` when `process.env.VERCEL` is set (real Vercel build), and a locally installed Chrome (via `PUPPETEER_EXECUTABLE_PATH` or the standard macOS path) otherwise — this is what makes the script testable on a developer's Mac at all, since the sparticuz Linux binary can't run there.
- No `REACT_APP_BACKEND_URL` anywhere — frontend calls its own API via relative paths (`/api/...`) since frontend and API are the same Vercel deployment/domain.
- No enquiry data is stored in our own database — Formspree owns that entirely.
- Package versions (installed together, not pinned tighter than these ranges): `puppeteer-core@^25.10.0`, `@sparticuz/chromium@^149.0.0`, `serve-handler@^6.1.7`, `@neondatabase/serverless@^1.1.0`.

---

### Task 1: Remove the obsolete Python backend and pin the Vercel root directory

**Files:**
- Delete: `backend/` (entire directory — `server.py`, `pdf_service.py`, `email_service.py`, `requirements.txt`, `pytest.ini`, `tests/`)
- Create: `vercel.json` (repo root)

**Interfaces:**
- Produces: a repo-root `vercel.json` with `rootDirectory: "frontend"` that every later Vercel build reads before doing anything else — this is what makes Vercel treat `frontend/` as the project source regardless of how the project is created in Task 6.

- [ ] **Step 1: Delete the old backend**

```bash
cd /Users/vasudevarao/Downloads/print-catalogue-main
git rm -r backend/
```

- [ ] **Step 2: Add the root-level `vercel.json`**

```json
{
  "rootDirectory": "frontend"
}
```

- [ ] **Step 3: Verify the tree**

Run: `git status --short`
Expected: `backend/` files show staged for deletion (`D`, since `git rm` stages automatically) and `vercel.json` shows as untracked (`??`, until it's added in the next step).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove obsolete Python backend, pin Vercel root directory to frontend/"
```

---

### Task 2: Build-time PDF generation

**Files:**
- Modify: `frontend/package.json`
- Create: `frontend/scripts/generate-pdf.js`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `frontend/build/catalogue.pdf` (static file, present after `yarn vercel-build` or `yarn build && yarn generate-pdf` runs) — Task 3's download button links directly to `/catalogue.pdf`.

- [ ] **Step 1: Add dependencies and scripts to `frontend/package.json`**

Add to `"dependencies"`:

```json
    "@sparticuz/chromium": "^149.0.0",
    "puppeteer-core": "^25.10.0"
```

Add to `"devDependencies"`:

```json
    "serve-handler": "^6.1.7"
```

Add to `"scripts"` (alongside the existing `start`/`build`/`test`):

```json
    "generate-pdf": "node scripts/generate-pdf.js",
    "vercel-build": "craco build && yarn generate-pdf"
```

- [ ] **Step 2: Install and lock dependencies**

```bash
cd frontend
yarn install
```

Expected: completes without error; `frontend/yarn.lock` is created (there was none before — this is the first lockfile for this project).

- [ ] **Step 3: Write `frontend/scripts/generate-pdf.js`**

```javascript
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
const puppeteer = require('puppeteer-core');

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

async function getLaunchOptions() {
  if (process.env.VERCEL) {
    const chromium = require('@sparticuz/chromium');
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
```

- [ ] **Step 4: Run it locally (fast inner loop, uses your installed Chrome)**

```bash
cd frontend
yarn build
yarn generate-pdf
```

Expected: ends with `[generate-pdf] wrote .../frontend/build/catalogue.pdf`, and `ls -la build/catalogue.pdf` shows a multi-megabyte PDF. Open it and confirm it looks like the site (all 14 chapters, images loaded, not blank pages).

- [ ] **Step 5: Verify it also works in a Vercel-equivalent environment (Amazon Linux 2023, via Docker)**

This is the step that actually derisks the build-time approach — a real headless-Chromium-on-Vercel failure mode (missing system libraries, no apt-get) was found during research for this plan, and this is the closest we can get to Vercel's real build container without deploying.

```bash
cd /Users/vasudevarao/Downloads/print-catalogue-main
docker run --rm \
  -v "$PWD/frontend":/workspace \
  -w /workspace \
  -e VERCEL=1 \
  amazonlinux:2023.2.20231011.0 \
  bash -lc "dnf install -y nodejs20 >/dev/null 2>&1 || dnf install -y nodejs >/dev/null 2>&1; node --version; npm install --no-audit --no-fund; npm run generate-pdf"
```

Expected: `node --version` prints a v18+ version, then the same `[generate-pdf] wrote .../build/catalogue.pdf` success line as Step 4. If this fails with a missing-library error, report back before continuing — it means `@sparticuz/chromium` needs a version bump or the build needs an explicit `dnf install` of additional packages via Vercel's `installCommand` (Vercel's build image is Amazon Linux 2023 with `dnf`, and additional packages can be installed that way — see https://vercel.com/docs/builds/build-image).

- [ ] **Step 6: Commit**

```bash
cd /Users/vasudevarao/Downloads/print-catalogue-main
git add frontend/package.json frontend/yarn.lock frontend/scripts/generate-pdf.js
git commit -m "feat: generate catalogue PDF at build time via puppeteer-core + sparticuz/chromium"
```

---

### Task 3: Update frontend API layer — Formspree enquiries, static PDF link, relative analytics path

**Files:**
- Modify: `frontend/src/lib/api.js` (full rewrite — every export changes)
- Modify: `frontend/src/components/sections/Consultation.jsx:25-27`
- Create: `frontend/.env.example`

**Interfaces:**
- Consumes: `frontend/build/catalogue.pdf` (Task 2) as the direct download target; `/api/analytics/events` (Task 4) as the tracking endpoint.
- Produces: `submitEnquiry(payload)`, `trackEvent(event, meta)`, `downloadPdf()` — same names/call sites as before (`Nav.jsx`, `Hero.jsx`, `CTAFooter.jsx`, `Consultation.jsx` are unchanged; they just call these three functions).

- [ ] **Step 1: Rewrite `frontend/src/lib/api.js`**

```javascript
import axios from 'axios';

const FORMSPREE_ENDPOINT = `https://formspree.io/f/${process.env.REACT_APP_FORMSPREE_ID}`;

export const submitEnquiry = (payload) =>
  axios
    .post(FORMSPREE_ENDPOINT, payload, { headers: { Accept: 'application/json' } })
    .then((r) => r.data);

export const trackEvent = (event, meta = {}) =>
  axios.post('/api/analytics/events', { event, meta }).catch(() => null);

export const downloadPdf = () => {
  trackEvent('pdf_download', { path: window.location.pathname });
  const a = document.createElement('a');
  a.href = '/catalogue.pdf';
  a.download = 'Sree-Bloomy-Graphics-Catalogue.pdf';
  document.body.appendChild(a);
  a.click();
  a.remove();
};
```

This drops the old `downloading` guard and the `toast.promise` loading/success/error sequence: those existed because the old flow fetched a blob over the network (a real async operation to represent). A direct link to a static file has no JS-observable progress — the browser's own download UI communicates that now — so the toast wrapper no longer applies.

- [ ] **Step 2: Update the enquiry form's error handling for Formspree's error shape**

Read `frontend/src/components/sections/Consultation.jsx:20-28` first to confirm line numbers still match, then:

```javascript
    } catch (err) {
      toast.error(err?.response?.data?.errors?.[0]?.message || 'Could not send enquiry. Please email us directly.');
    } finally { setBusy(false); }
```

(Old code read `err?.response?.data?.detail?.[0]?.msg`, which was FastAPI/Pydantic's validation-error shape. Formspree's AJAX error responses are `{ "errors": [{ "field": ..., "message": ... }] }`.)

- [ ] **Step 3: Add `frontend/.env.example`**

```
# Formspree form endpoint ID (from https://formspree.io — create a form, copy the ID from the endpoint URL https://formspree.io/f/<id>)
REACT_APP_FORMSPREE_ID=
```

- [ ] **Step 4: Verify no other file references the removed pieces**

Run: `grep -rn "REACT_APP_BACKEND_URL\|downloading" frontend/src`
Expected: no matches.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/api.js frontend/src/components/sections/Consultation.jsx frontend/.env.example
git commit -m "feat: submit enquiries via Formspree, link PDF download directly to the static file"
```

---

### Task 4: Neon-backed analytics endpoints

**Files:**
- Modify: `frontend/package.json` (add dependency)
- Create: `frontend/api/_db.js`
- Create: `frontend/api/analytics/events.js`
- Create: `frontend/api/analytics/summary.js`
- Create: `frontend/scripts/schema.sql`

**Interfaces:**
- Consumes: `process.env.DATABASE_URL`, injected by the Neon Marketplace integration in Task 6.
- Produces: `POST /api/analytics/events` and `GET /api/analytics/summary`, matching what `trackEvent()` (Task 3) already calls.

- [ ] **Step 1: Add the dependency to `frontend/package.json`**

Add to `"dependencies"`:

```json
    "@neondatabase/serverless": "^1.1.0"
```

Run: `cd frontend && yarn install`

- [ ] **Step 2: Write `frontend/api/_db.js`**

(The `_` prefix is a Vercel convention — files/dirs starting with `_` under `api/` are excluded from routing, so this is a shared helper, not an endpoint.)

```javascript
// frontend/api/_db.js
const { neon } = require('@neondatabase/serverless');

// Lazy singleton: neon() throws if DATABASE_URL isn't set yet, and this file
// is required by every function — calling neon() at module load time would
// crash any build/cold-start that happens before the Neon integration is
// provisioned. Deferring the call until a request actually needs it avoids that.
let _sql = null;

function getSql() {
  if (!_sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set');
    }
    _sql = neon(process.env.DATABASE_URL);
  }
  return _sql;
}

module.exports = { getSql };
```

- [ ] **Step 3: Write `frontend/api/analytics/events.js`**

```javascript
// frontend/api/analytics/events.js
const { getSql } = require('../_db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { event, meta } = req.body || {};
  if (!event || typeof event !== 'string') {
    return res.status(400).json({ error: 'event is required' });
  }

  try {
    const sql = getSql();
    const rows = await sql`
      INSERT INTO events (event, meta)
      VALUES (${event}, ${JSON.stringify(meta || {})}::jsonb)
      RETURNING id, event, meta, created_at
    `;
    return res.status(201).json(rows[0]);
  } catch (err) {
    // Never let an analytics hiccup surface to the visitor — log and
    // return a soft 200, matching trackEvent()'s .catch(() => null) on the frontend.
    console.error('analytics/events insert failed:', err);
    return res.status(200).json({ ok: false });
  }
};
```

- [ ] **Step 4: Write `frontend/api/analytics/summary.js`**

```javascript
// frontend/api/analytics/summary.js
const { getSql } = require('../_db');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sql = getSql();
    const rows = await sql`
      SELECT event, COUNT(*)::int AS count
      FROM events
      GROUP BY event
    `;
    const events = {};
    for (const row of rows) events[row.event] = row.count;
    return res.status(200).json({ events });
  } catch (err) {
    console.error('analytics/summary query failed:', err);
    return res.status(500).json({ error: 'Could not load summary' });
  }
};
```

- [ ] **Step 5: Write `frontend/scripts/schema.sql`**

```sql
-- frontend/scripts/schema.sql
-- Run once against the Neon database (see Task 6, Step 4) before the
-- analytics endpoints are used for the first time.
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  event TEXT NOT NULL,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

- [ ] **Step 6: Sanity-check the two handlers load without syntax errors**

Run: `node -e "require('./frontend/api/analytics/events.js'); require('./frontend/api/analytics/summary.js'); console.log('ok')"`
Expected: `ok` (this only checks the modules parse and `require` cleanly — real behavior is verified live in Task 7, once `DATABASE_URL` exists).

- [ ] **Step 7: Commit**

```bash
git add frontend/package.json frontend/yarn.lock frontend/api frontend/scripts/schema.sql
git commit -m "feat: add Neon-backed analytics endpoints (events, summary)"
```

---

### Task 5: Push to GitHub

**Files:** none (no code changes — this just publishes Tasks 1-4's commits).

- [ ] **Step 1: Push**

```bash
cd /Users/vasudevarao/Downloads/print-catalogue-main
git push origin main
```

- [ ] **Step 2: Verify**

Run: `gh repo view hemanthkaseti-source/print-catalogue --json defaultBranchRef -q .defaultBranchRef.name` and `git log origin/main --oneline -1`
Expected: the latest commit hash matches your local `git log --oneline -1`.

---

### Task 6: Provision the Vercel project, Neon database, and environment variables

**Files:** none (infrastructure only — no repo changes beyond what Task 5 already pushed).

**Prerequisite:** a Formspree account and a form created at https://formspree.io, with its form ID (the `<id>` in `https://formspree.io/f/<id>`) on hand before Step 5.

- [ ] **Step 1: Confirm you're on the friend's Vercel account**

Run: `vercel whoami`
Expected: `hemanthkaseti-source`. (If this shows a different account, run `vercel login` again first.)

- [ ] **Step 2: Link (and create) the project**

```bash
cd /Users/vasudevarao/Downloads/print-catalogue-main/frontend
vercel link
```

Follow the prompts: choose team `sree-blooming-graphics`, choose "Link to existing project?" → No (none exist yet), give it a name (e.g. `print-catalogue`), and confirm the detected source directory. This creates `frontend/.vercel/project.json`.

- [ ] **Step 3: Connect the project to the GitHub repo**

Run: `vercel git connect -h` first to confirm current flags, then:

```bash
vercel git connect https://github.com/hemanthkaseti-source/print-catalogue.git
```

If this command doesn't behave as expected, use the dashboard instead: Project Settings → Git → Connect Git Repository → select `hemanthkaseti-source/print-catalogue`.

Expected: future pushes to `main` auto-deploy. (The root `vercel.json` from Task 1 is what makes this git-triggered build use `frontend/` as the source, regardless of how the project was linked.)

- [ ] **Step 4: Provision Neon Postgres**

```bash
vercel integration add neon
```

Follow the prompts (region, plan — defaults are fine for this project's scale). This provisions a Neon database, connects it to the project, injects `DATABASE_URL` (and related vars) into all environments, and runs `vercel env pull` automatically.

- [ ] **Step 5: Confirm the injected variable name and load it locally**

```bash
vercel env pull .env.local --yes
grep DATABASE_URL .env.local
```

Expected: a `DATABASE_URL=...` line. (If the integration injected a differently-named variable instead, update `frontend/api/_db.js`'s `process.env.DATABASE_URL` reference to match, and re-commit.)

- [ ] **Step 6: Run the schema migration once**

```bash
psql "$(grep '^DATABASE_URL=' .env.local | cut -d= -f2- | tr -d '"')" -f scripts/schema.sql
```

(Anchored to `^DATABASE_URL=` specifically, since Neon integrations commonly also inject related variables like `DATABASE_URL_UNPOOLED` that an unanchored `grep DATABASE_URL` would incorrectly match too.)

Expected: `CREATE TABLE` (or no error if it already existed from a prior run — the script uses `IF NOT EXISTS`).

- [ ] **Step 7: Add the Formspree env var**

```bash
vercel env add REACT_APP_FORMSPREE_ID production
vercel env add REACT_APP_FORMSPREE_ID preview
vercel env add REACT_APP_FORMSPREE_ID development
```

When prompted, paste the form ID from the prerequisite above (same value in all three environments).

---

### Task 7: Deploy to production and verify end-to-end

**Files:** none.

- [ ] **Step 1: Deploy**

```bash
cd /Users/vasudevarao/Downloads/print-catalogue-main/frontend
vercel --prod
```

Expected: build succeeds (this is where the build-time PDF generation from Task 2 either proves itself for real or surfaces a problem — watch the build log for the `[generate-pdf] wrote ...` line), and the command prints a production URL.

- [ ] **Step 2: Verify the PDF**

Open `<production-url>/catalogue.pdf` directly in a browser.
Expected: a real PDF loads, showing the catalogue content (not a 404, not a blank/broken file).

- [ ] **Step 3: Verify the PDF download button**

Click "Download PDF" from the nav bar, the hero section, and the footer CTA.
Expected: each saves `Sree-Bloomy-Graphics-Catalogue.pdf` to your downloads folder.

- [ ] **Step 4: Verify analytics recorded those clicks**

Open `<production-url>/api/analytics/summary` directly in a browser.
Expected: JSON like `{"events":{"pdf_download":3}}` (or however many times you clicked in Step 3).

- [ ] **Step 5: Verify the enquiry form**

Submit the consultation form on the live site with test data.
Expected: a success message appears on the site, and the submission shows up in your Formspree dashboard (https://formspree.io) within a minute, along with an email notification if one is configured there.

- [ ] **Step 6: Report the production URL**

Share the production URL (and confirm with the person who'll be using this site, e.g. checking the `sreebloomygrahics.org` custom domain should be pointed here if that's still desired — that's a separate, not-yet-scoped follow-up).
