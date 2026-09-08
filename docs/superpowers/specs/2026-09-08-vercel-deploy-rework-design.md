# Vercel deployment rework — design spec

Date: 2026-09-08
Status: approved, pending implementation plan

## Background

`print-catalogue` is a marketing/catalogue site for Sree Bloomy Graphics
Pvt. Ltd. (an industrial flexographic printing-plate manufacturer),
exported from the Emergent.sh platform as a Create React App frontend
(`frontend/`, built via craco) plus a FastAPI backend (`backend/`) using
MongoDB (Motor), Resend (email), and Playwright (runtime PDF rendering).

Goal: deploy this to Vercel, under a friend's (`hemanthkaseti-source`)
GitHub + Vercel accounts, as a single project — while fixing the parts
of the original architecture that don't work on Vercel.

### Confirmed environment (as of this session)

- GitHub repo `hemanthkaseti-source/print-catalogue` (branch `main`)
  already contains this exact code (verified byte-identical via diff).
  The user's GitHub account (`Vxsudev`) has WRITE access to it.
- Vercel: authenticated in CLI as `hemanthkaseti-source`. Team
  `sree-blooming-graphics` exists but has **zero projects** — nothing
  was actually finished/deployed before, despite an earlier
  `vercel.com/new/import` attempt. This is a from-scratch setup.
- Local working copy at `/Users/vasudevarao/Downloads/print-catalogue-main`
  has no `.git` yet; it needs to become the working copy for the
  existing GitHub repo (not a fresh repo).

### Why the original backend can't deploy as-is

`backend/pdf_service.py` launches a real headless Chromium browser via
Playwright *at request time* to screenshot-print the live catalogue
page into a PDF. Vercel's Python serverless functions have no bundled
browser binary and aren't a fit for launching Chromium per-request
within their size/runtime constraints. Everything else in the backend
(enquiries → Mongo, analytics → Mongo, email → Resend) is otherwise
portable, but MongoDB and Resend both require external accounts we
don't currently have credentials for — and we're starting from zero
data, so this is a good moment to simplify rather than reproduce the
original stack 1:1.

## Decisions made this session

| Area | Decision |
|---|---|
| Database | Replace MongoDB with **Vercel Postgres (Neon)** — first-party integration, no separate signup, env vars auto-injected. |
| Enquiry form | **Fully replaced by Formspree.** Frontend posts directly to Formspree; no backend endpoint, no DB table, no Resend. Formspree owns email delivery + submission storage/export. |
| Analytics (`pdf_download` etc.) | Kept, backed by the new Postgres DB (Formspree doesn't do generic event logging). |
| PDF generation | **Build-time static generation.** Rendered once per Vercel deploy (not per-request), written as a static file into the build output. Eliminates the runtime-Chromium problem entirely. Trade-off accepted: the PDF only updates on redeploy, not instantly on every content edit — acceptable for a catalogue that changes rarely, and redeploying is one command. |
| Backend runtime | Original Python/FastAPI dropped. The two surviving analytics endpoints are rewritten as **plain Node serverless functions** (Vercel's default, standard path; pairs naturally with Postgres). No Python in the deployed app at all. |
| Old `backend/` folder | **Deleted from the repo tree** (Python/FastAPI/Mongo/Resend/Playwright-runtime code). Preserved in git history via normal commit, not force-removed from past commits. |
| Git/deploy topology | This local folder becomes the working copy for the existing `hemanthkaseti-source/print-catalogue` repo (git init, remote added, history adopted — content already matches, so no merge conflicts). Vercel project created fresh, git-connected, Root Directory = `frontend/`. |

## Architecture

One Vercel project, Root Directory `frontend/`, git-connected to
`hemanthkaseti-source/print-catalogue` (`main`) under the
`sree-blooming-graphics` team.

- **Frontend**: existing CRA/craco app, static build output. Two call
  sites change: the enquiry form now posts to Formspree, and the
  "Download PDF" button links directly to a static file instead of
  calling an API.
- **API**: two Node serverless functions under `frontend/api/analytics/`,
  reading/writing Vercel Postgres.
- **PDF**: generated once per deploy by a Node build script.

## Components & data flow

- **Enquiry form** → POST directly to Formspree's hosted endpoint →
  Formspree emails the notification and stores the submission in its
  own dashboard. No round trip through our infrastructure.
- **PDF download** (nav / hero / footer buttons) → fires the existing
  `trackEvent('pdf_download', …)` call to `/api/analytics/events`,
  then navigates straight to the static `/catalogue.pdf` asset already
  present in the deployed build. No live rendering, no backend
  involvement in serving the file itself.
- **`POST /api/analytics/events`** (Node fn) → inserts a row into a
  Postgres `events` table: `event` (text), `meta` (jsonb), `created_at`
  (timestamptz default now()).
- **`GET /api/analytics/summary`** (Node fn) → returns counts grouped
  by event type. Unauthenticated, matching the original (low-sensitivity
  aggregate data — no per-visitor detail). The original also reported
  an enquiry count; that field is dropped since enquiries no longer
  live in our database.
- **Build step** (runs as part of every Vercel deploy): `craco build`
  produces `frontend/build/`; a Node script then serves that folder
  locally, drives Playwright/Chromium headless against it (reusing the
  original scroll-to-trigger-lazy-content + font/image-ready wait
  logic from `pdf_service.py`), and writes the rendered PDF to
  `frontend/build/catalogue.pdf` before Vercel uploads the static
  output.

## Error handling

- **Build-time PDF render failure** (Chromium install hiccup, timeout,
  etc.) **fails the build outright**, rather than shipping a site with
  a silently-broken Download button. A failed Vercel deployment is a
  more visible signal than a 404 discovered later by a site visitor.
- **Analytics insert failure** fails silently (logged, not surfaced) —
  must never block or error the visitor's actual PDF download. Matches
  the existing frontend's `.catch(() => null)` pattern on `trackEvent`.
- **Formspree submission failure** surfaces as an error toast on the
  form, same UX pattern as today.

## Testing

Mostly infrastructure/config rework rather than new business logic, so
testing is intentionally light:

- Local production-build dry run (including the PDF-generation step)
  before pushing, to catch Playwright/Chromium issues before they
  surface as a failed Vercel build.
- Post-deploy manual verification: submit the enquiry form and confirm
  it lands in Formspree; click Download PDF from all three placements
  (nav, hero, footer) and confirm a real file downloads; hit
  `/api/analytics/summary` and confirm the click was logged.
- No unit tests planned for the two trivial Node analytics endpoints.

## Open items for the implementation plan

These need answers/actions during implementation, not blocking this
design's approval:

- A Formspree account + form endpoint ID is needed (from the user or
  friend) before the enquiry form change can be wired up.
- Vercel Postgres (Neon) needs to be provisioned on the new Vercel
  project once created.
- No `yarn.lock`/`package-lock.json` currently exists in `frontend/` —
  one should be generated and committed as part of this work for
  reproducible installs.
- Exact Vercel CLI/dashboard steps to create the project with Root
  Directory = `frontend/` and connect it to the existing GitHub repo
  need to be carried out (via `vercel` CLI, now authenticated as
  `hemanthkaseti-source`).
