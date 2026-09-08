# Catalogue Relaunch

**Project memo 1 of 2** — see also [`analytics-backend.md`](./analytics-backend.md)

sreebloomygrahics.org now runs end to end on production hosting — the site, the catalogue download, the enquiry form, and the download records all moved off the old setup and onto infrastructure built to stay up without anyone watching it.

## What actually changed

Three parts of the site used to depend on a separate backend server. Each one was rebuilt so it no longer needs that server at all — which means fewer things that can go down.

1. **Catalogue PDF download** — the downloadable PDF is now built fresh every time the site is updated, then handed to visitors instantly. No waiting for it to generate, no chance of the old download server being asleep or overloaded.
2. **Enquiry form** — submissions now go straight through Formspree, a dedicated form-delivery service. An enquiry is never quietly lost to a server hiccup — it's their one job, and they're good at it.
3. **Download tracking** — a lightweight, private record of how many times the catalogue has been downloaded, kept in a small dedicated database (see the companion doc for how to check it).

## What's live right now

| | |
|---|---|
| **Primary site** | [sreebloomygrahics.org](https://sreebloomygrahics.org) |
| **Also resolves** | www.sreebloomygrahics.org → redirects automatically |
| **Status** | ✅ Verified live |

Checked in person before handoff, not just assumed to work:

- Site loads correctly on the live domain, over a secure connection
- Download PDF (nav, hero, and footer buttons) saves a real, current catalogue file
- Enquiry form submits successfully and shows the confirmation screen
- A download is correctly counted in the tracking record

## What this means day to day

- **Nothing to babysit** — there's no server that needs restarting if someone downloads the catalogue at 2am, or if traffic spikes after a trade show.
- **Enquiries arrive the same way** — the form on the site looks and works exactly as before; Formspree just handles delivery behind it now.
- **The PDF keeps itself current** — add new machine photos, update the export markets, change a number — the next time the site is updated, the downloadable PDF regenerates itself. No separate step to remember.
