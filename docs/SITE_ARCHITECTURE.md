# Site Architecture

## Stack
- **Type:** Static HTML/CSS/JS — no build framework
- **Hosting:** Vercel (static + edge redirects)
- **CSS:** Single file `styles.css` — Direction C design system
- **JS:** Vanilla JS — `app.js` (core), `booking.js` (forms), Supabase client
- **Partials:** `header.html` + `footer.html` injected via `fetch()` into `#header` / `#footer`

---

## Current Site Map

```
jcdmtech.com/
├── /                           index.html             FUNCTIONAL (chofer hero — needs redesign)
├── /chofer-privado/            chofer-privado/index.html    FUNCTIONAL (service landing)
├── /chofer-privado/reservar.html                            FUNCTIONAL (booking form)
├── /chofer-privado/gracias.html                             FUNCTIONAL (thank you page)
├── /music-ride/                music-ride/index.html        FUNCTIONAL (Music Ride landing)
├── /nosotros.html                                           PLACEHOLDER (1-line about)
├── /contacto.html                                           FUNCTIONAL (contact form)
├── /privacidad.html                                         PLACEHOLDER (stub)
├── /terminos.html                                           PLACEHOLDER (stub)
├── /login.html                                              FUNCTIONAL (Supabase auth)
├── /mi-cuenta.html                                          FUNCTIONAL (user profile)
├── /admin/                     admin/index.html             FUNCTIONAL (admin panel, protected)
├── /qrcard.html                                             FUNCTIONAL (QR business card)
├── /automatizaciones/          automatizaciones/index.html  PLACEHOLDER → redirects to reservar
├── /domotica/                  domotica/index.html          PLACEHOLDER → redirects to reservar
├── /software/                  software/index.html          PLACEHOLDER → redirects to reservar
└── /blog/                      blog/index.html              PLACEHOLDER (coming soon)
```

---

## New Site Map (Target)

```
jcdmtech.com/
├── /                           index.html             REDESIGN (tech company homepage)
│
├── /services/                  services/index.html    NEW (4 tech services)
│
├── /projects/                  projects/index.html    NEW (QUELVO, Music Ride, Automation, Smart Home)
│
├── /quelvo/                    quelvo/index.html      NEW (premium chauffeur landing)
│   └── /quelvo/book/           quelvo/book/index.html NEW (booking form, adapted from reservar.html)
│
├── /music-ride/                music-ride/index.html  KEEP + minor updates
│
├── /nosotros.html                                     UPDATE (About JCDM Technologies)
├── /contacto.html                                     UPDATE (new service dropdown)
│
├── /privacidad.html                                   KEEP (stub — legal work pending)
├── /terminos.html                                     KEEP (stub — legal work pending)
├── /login.html                                        KEEP (functional)
├── /mi-cuenta.html                                    KEEP (functional)
├── /admin/                                            KEEP (functional)
├── /qrcard.html                                       KEEP (functional)
│
├── /chofer-privado/            LEGACY — keep for backward compatibility
│   ├── /chofer-privado/reservar.html    KEEP (legacy booking still works)
│   └── /chofer-privado/gracias.html     KEEP (legacy confirmation)
│
├── /automatizaciones/          PLACEHOLDER → keep or redirect to /services
├── /domotica/                  PLACEHOLDER → keep or redirect to /services
├── /software/                  PLACEHOLDER → keep or redirect to /services
└── /blog/                      KEEP placeholder
```

---

## Pages: Status Table

| Page | URL | Status | Action |
|------|-----|--------|--------|
| Homepage | / | EXISTS | REDESIGN — tech company focus |
| Services | /services/ | MISSING | CREATE |
| Projects | /projects/ | MISSING | CREATE |
| QUELVO Landing | /quelvo/ | MISSING | CREATE |
| QUELVO Booking | /quelvo/book/ | MISSING | CREATE (adapted from reservar.html) |
| Music Ride | /music-ride/ | EXISTS | KEEP + minor updates |
| About | /nosotros.html | EXISTS stub | UPDATE content |
| Contact | /contacto.html | EXISTS | UPDATE service dropdown |
| Privacy | /privacidad.html | EXISTS stub | KEEP (legal work deferred) |
| Terms | /terminos.html | EXISTS stub | KEEP (legal work deferred) |
| Login | /login.html | EXISTS | KEEP |
| My Account | /mi-cuenta.html | EXISTS | KEEP |
| Admin | /admin/ | EXISTS | KEEP |
| QR Card | /qrcard.html | EXISTS | KEEP |
| Chauffeur Legacy | /chofer-privado/ | EXISTS | KEEP for backward compat |
| Blog | /blog/ | EXISTS stub | KEEP placeholder |
| Automations | /automatizaciones/ | EXISTS stub | KEEP / redirect to /services |
| Smart Home | /domotica/ | EXISTS stub | KEEP / redirect to /services |
| Software | /software/ | EXISTS stub | KEEP / redirect to /services |

---

## Navigation (New)

```
JCDM  |  Services  |  QUELVO  |  Projects  |  About  |  Contact  |  [ Book a Ride ]
```

Mobile: hamburger → vertical list of same links.

---

## Redirects (vercel.json — additions)

| From | To | Type | Reason |
|------|-----|------|--------|
| /quelvo | /quelvo/ | 301 | Clean URL |
| /services | /services/ | 301 | Clean URL |
| /projects | /projects/ | 301 | Clean URL |
| /chofer-privado → | /quelvo/ | 302 | QUELVO rebrand (temp while transitioning) |
| /about | /nosotros.html | 301 | English URL alias |
| /contact | /contacto.html | 301 | English URL alias |
| /automatizaciones/* | /services/ | 302 | Updated redirect target |
| /domotica/* | /services/ | 302 | Updated redirect target |
| /software/* | /services/ | 302 | Updated redirect target |
| /blog/* | /blog/ | 302 | Blog stub |

---

## Component Reuse

| Component | File | Used In |
|-----------|------|---------|
| Header | partials/header.html | All pages |
| Footer | partials/footer.html | All pages |
| styles.css | styles.css | All pages |
| app.js | js/app.js | All pages |
| booking.js | js/booking.js | reservar.html, quelvo/book/ |
| supabase.config.js | js/supabase.config.js | All pages (auth nav) |
