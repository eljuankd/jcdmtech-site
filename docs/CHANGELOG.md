# Changelog

## 2026-06-11 — Session: Full Site Restructure (Phase 1–2)

### Analyzed
- Complete project inventory: 13 HTML pages, 1 CSS, 5 JS, 2 partials, 5 assets
- Identified all forms (Formspree contact, booking.js WhatsApp/email, Supabase login/profile)
- Identified external dependencies: Supabase, Formspree, GA4, Google Fonts
- Identified issues: phone number mismatch, placeholder pages, no 404 page
- Documented architecture, design system, routes, and project context

### Created
- `/docs/PROJECT_CONTEXT.md` — Company, services, platforms, architecture decisions
- `/docs/SITE_ARCHITECTURE.md` — Current and target site map, page status
- `/docs/DESIGN_SYSTEM.md` — Direction C design system documentation
- `/docs/ROUTES.md` — All routes, status, redirects
- `/docs/CHANGELOG.md` — This file
- `/docs/IMPLEMENTATION_LOG.md` — Implementation log
- `/docs/TODO.md` — Pending tasks

### Pending
- Implement new homepage (tech company focus)
- Create /quelvo/ landing page
- Create /services/ page
- Create /projects/ page
- Update /nosotros.html (About)
- Update /contacto.html (Contact)
- Update partials/header.html (new navigation)
- Update partials/footer.html (column structure)
- Update vercel.json (new redirects)

---

## 2026-06-11 — Session: Direction C Visual Redesign

### Changed
- `jcdmtech/styles.css` — Complete rewrite to Direction C design system (black/cream/gold, no glass morphism, rectangular components)
- `jcdmtech/index.html` — Hero redesigned (two-column → dramatic typographic single column), stats bar added
- `jcdmtech/partials/header.html` — Logo replaced with JCDM Fraunces wordmark
- `jcdmtech/chofer-privado/reservar.html` — Removed logo preload
- `jcdmtech/music-ride/index.html` — Removed logo preload

---

## 2026-06-11 — Session: Initial Setup & Music Ride Integration

### Created
- `jcdmtech/music-ride/index.html` — Music Ride product page
- Music Ride teaser on homepage
- Nav link for Music Ride

### Changed
- `jcdmtech/partials/header.html` — Added Music Ride nav link
- `jcdmtech/index.html` — Added Music Ride promo section, updated links to music-ride.jcdmtech.com
