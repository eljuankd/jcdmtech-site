# TODO — JCDM Technologies Site Restructure

## In Progress

- [ ] Phase 5: Redesign index.html (tech company homepage)
- [ ] Update partials/header.html (new navigation)
- [ ] Update partials/footer.html (column structure)
- [ ] Add CSS components (services grid, platform cards, why section)

---

## Pending Implementation

### High Priority
- [ ] Create `quelvo/index.html` — QUELVO premium landing page
- [ ] Create `quelvo/book/index.html` — QUELVO booking form (multi-tab)
- [ ] Create `services/index.html` — Tech services page
- [ ] Create `projects/index.html` — Products & projects page
- [ ] Update `nosotros.html` — Full About JCDM Technologies content
- [ ] Update `contacto.html` — New service dropdown options
- [ ] Update `vercel.json` — New redirects for /quelvo, /services, /projects, /about, /contact
- [ ] Update `sitemap.xml` — Add new routes

### Medium Priority
- [ ] Fix phone number mismatch (booking.js: 17863487458 vs contacto.html: +13050000000)
- [ ] Create `404.html` — Custom 404 error page
- [ ] Update `robots.txt` — Add new protected routes
- [ ] Update `music-ride/index.html` — Reposition as QUELVO feature/product

### Lower Priority
- [ ] Expand `privacidad.html` — Full privacy policy text
- [ ] Expand `terminos.html` — Full terms of service text
- [ ] Expand `blog/index.html` — Blog landing with placeholder posts
- [ ] Update `automatizaciones/index.html`, `domotica/index.html`, `software/index.html` — Redirect to /services/ instead of /chofer-privado/reservar.html

---

## Future / Next Version

- [ ] QUELVO booking form: multi-tab (One Way / By Hour / Airport / City-to-City)
- [ ] QUELVO fleet selection (Step 2: Black Sedan / Business SUV / Premium SUV)
- [ ] Persist booking codes to Supabase
- [ ] QUELVO: City-to-City routes page (/quelvo/city-to-city/)
- [ ] QUELVO: Airport transfers page (/quelvo/airport/)
- [ ] QUELVO: Hourly chauffeur page (/quelvo/hourly/)
- [ ] QUELVO: Business travel page (/quelvo/business/)
- [ ] Projects page: Financial Automation System detail
- [ ] Projects page: Smart Home Dashboard detail
- [ ] Add og:image per page (currently all use same og-image.png)
- [ ] Add English/Spanish language toggle
- [ ] Automate `window.__SITE_VERSION__` from git tag
- [ ] Add Content Security Policy (CSP) headers in vercel.json
- [ ] Add structured data (JSON-LD) for new pages
- [ ] Verify Supabase RLS policies cover all tables
- [ ] Add 2FA option for admin accounts

---

## Known Bugs / Issues

- [ ] **CRITICAL:** Phone mismatch — booking uses `17863487458`, contact shows `+13050000000`
- [ ] **HIGH:** Privacy policy and Terms are placeholder stubs
- [ ] **MEDIUM:** No 404 page
- [ ] **MEDIUM:** Booking code not stored in database
- [ ] **LOW:** GA4 debug mode accessible via `?debug=1` on all pages

---

## Completed

- [x] Direction C design system implemented in styles.css
- [x] Logo replaced with JCDM Fraunces wordmark
- [x] Hero redesigned (dramatic typographic layout)
- [x] Stats bar added below hero
- [x] Music Ride page created at /music-ride/
- [x] Music Ride nav link added
- [x] Music Ride deployed at music-ride.jcdmtech.com
- [x] /docs folder created with 7 documentation files
- [x] Full project analysis completed
