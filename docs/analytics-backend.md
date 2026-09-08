# Analytics Backend

**Project memo 2 of 2** — see also [`catalogue-relaunch.md`](./catalogue-relaunch.md)

Almost nothing runs on a server per visitor anymore. This is the one small piece that still does — what it's for, how to check it, and where it lives.

## What "backend" means now

The old backend was a full server handling three jobs: enquiries, the PDF download, and download tracking. Each job now works differently:

| Job | Now handled by | Touches a server? |
|---|---|---|
| Enquiry form | Formspree | No — goes straight there from the browser |
| PDF download | Built once per site update | No — served as a plain file |
| Download tracking | Two small functions, below | Yes — this is the piece that's left |

## The two functions

### `POST /api/analytics/events`

Records one event. The site calls this automatically the instant someone clicks any "Download PDF" button — nothing to trigger by hand.

- **Sends:** `{ "event": "pdf_download", "meta": { "path": "/" } }`
- **Behaviour:** if the database is ever slow or unreachable, this fails silently and logs the problem quietly — it can never interrupt someone's actual download.

### `GET /api/analytics/summary`

Returns a running count of downloads. Open it directly in any browser — no login, no dashboard needed:

```json
{ "events": { "pdf_download": 3 } }
```

**Check it:** [sreebloomygrahics.org/api/analytics/summary](https://sreebloomygrahics.org/api/analytics/summary)

## Where the numbers live

A small managed Postgres database (via Neon, connected through Vercel) holds one table:

| Column | Holds |
|---|---|
| `id` | A running number, one per event |
| `event` | The event name — currently always `pdf_download` |
| `meta` | A little extra detail, like which page the click happened on |
| `created_at` | Exactly when it happened |

Whoever holds the Vercel account login can also see this under that project's Storage tab, or by logging into Neon directly.

## For whoever touches this next

```
frontend/api/_db.js
  → shared database connection, used by both functions below

frontend/api/analytics/events.js
  → POST /api/analytics/events

frontend/api/analytics/summary.js
  → GET /api/analytics/summary

frontend/scripts/schema.sql
  → creates the events table (already run once, kept for reference)
```

Two settings this depends on, both already configured in Vercel — nothing to change unless something is being rebuilt from scratch:

| Variable | What it's for |
|---|---|
| `DATABASE_URL` | Connects the two functions to the database — set automatically when the database was created |
| `REACT_APP_FORMSPREE_ID` | Tells the enquiry form which Formspree form to deliver to |

> None of this needs regular attention. It only matters again if the catalogue site is being significantly rebuilt, or if download numbers need pulling for a report.
