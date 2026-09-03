# Sree Bloomy Graphics Pvt. Ltd. — Interactive Web Catalogue

## Original problem statement
Swiss-inspired, scroll-driven B2B company profile for a flexographic prepress house (Bengaluru, India) positioned alongside Esko/Kodak/Miraclon/DuPont brand experiences. 17 sections: hero, rebrand bar, outcomes, why-us, Kodak Flexcel NX, Esko CDI, Shine LED, colour management, 9-step process, applications, comparison graphics, exports map (UG, TZ, ZM, LK, RW, CD), consultation, leadership, trust bar, CTA with QR, footer. Must be shareable via URL and exportable as PDF to send to clients.

## User choices (June 2026)
- Enquiry: user wants a **PDF to send to clients** → Download-PDF button (print stylesheet) + enquiry form stored in MongoDB
- Contact: Raghavendra Enclave, NICE Ring Rd, Madanayakanahalli, Bengaluru 560073 · +91 99459 42389 · bloomygraphics@gmail.com · https://sreebloomygrahics.org/
- Markets: only the 6 listed. No ISO section. Imagery: AI-generated + stock placeholders. Social links: placeholders (#), WhatsApp → phone.

## Architecture
- Frontend: React (CRA/craco, JSX), Tailwind, Framer Motion, Lenis smooth scroll, d3-geo + topojson-client (SVG map from `/public/world-110m.json`), qrcode.react
- Backend: FastAPI — `POST/GET /api/enquiries`, `GET /api/enquiries/{id}`, `POST /api/analytics/events`, `GET /api/analytics/summary`
- DB: MongoDB collections `enquiries`, `events`
- Fonts: Inter Tight (display), Inter (body), Instrument Serif (pull quotes), JetBrains Mono (telemetry)

## Implemented (Sep 2026, v1)
- All 17 sections, dark/light alternation, numbered chapters 01–14
- Kinetic hero: masked line reveal, parallax + pointer 3D tilt, grain
- Interactive: NX dot-comparison slider, ink-savings calculator, before/after slider, 9-step process stepper, application tabs, export map hover sync
- Editorial marquees (rebrand bar, trust bar), custom cursor, scroll progress, hide-on-scroll nav, mobile menu
- Enquiry form → MongoDB with sonner toasts; PDF download tracked as analytics event then `window.print()` with print CSS
- QR codes (site URL on CTA, mailto on footer)

## Implemented (iteration 2)
- One-click PDF: `GET /api/catalogue.pdf` renders the live site with headless Chrome (Playwright, CHROME_PATH env) in A4 landscape, one chapter per page, cached 6h at /tmp (`?refresh=1` forces regeneration). Frontend fetches blob → saves `Sree-Bloomy-Graphics-Catalogue.pdf` with progress toast.
- Imagery: replaced copper-looking plate with amber photopolymer NX plate; new Shine LED flatbed exposure image; removed building/facility photos per user; Esko resolution set to 10,000 dpi.
- Pending from user: machine photos + leadership portraits (K. C. Mohan, K. Anandhi) to be attached and swapped into content.js IMG map.

## Implemented (iteration 3)
- Real leadership portraits (user-supplied) at /public/leaders/*.jpg; PDF cover + contents pages (print-only sections); PDF compressed via image re-encoding (~2.4MB, 17 pages, gradients preserved — do NOT use pymupdf.rewrite_images, it drops pattern resources)
- Enquiry email alerts via Resend (email_service.py, BackgroundTask). Needs RESEND_API_KEY in backend/.env; NOTIFY_EMAIL=bloomygraphics@gmail.com, SENDER_EMAIL=onboarding@resend.dev. Skips gracefully when key absent.

## Backlog
- P1: Real photography/logos swap; real client logos in trust bar; LinkedIn/Instagram URLs
- P1: Server-side PDF generation (Playwright/WeasyPrint) for a downloadable file instead of browser print dialog
- P2: Email notification on enquiry (Resend); admin view for enquiries
- P2: Multilingual (FR for Congo/Rwanda), ISO/sustainability section if certifications exist
