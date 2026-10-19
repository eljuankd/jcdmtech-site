# Changelog

Historial de cambios del sitio y de la documentación (más reciente primero).
Desde 2026-10-19 cada entrada indica la fase del plan de 8 fases.

## 2026-10-19 — Fase 1: Auditoría y documentación

### Añadido
- `CLAUDE.md` (raíz) — instrucciones persistentes, reglas 1–13, zonas protegidas, cómo probar.
- `docs/PROJECT_AUDIT.md` — auditoría técnica completa (stack, estructura, funcionalidades, reservas, Music Ride, SEO, 21 riesgos, comprobaciones).
- `docs/DECISIONS.md` — decisiones D-001…D-012 y propuestas P-001…P-005.
- `docs/PROJECT_STATUS.md` — estado actual, bloqueos y plan de Fase 2.

### Actualizado
- `docs/PROJECT_CONTEXT.md` — 5 servicios, QUELVO, Music Ride; marcas [VERIFICADO]/[PLANIFICADO]/[POR VALIDAR]; estado de los problemas de junio.
- `docs/SITE_ARCHITECTURE.md` — arquitectura real, modelo de datos inferido, propuesta incremental.
- `docs/DESIGN_SYSTEM.md` — documenta la coexistencia Direction C / estilo QUELVO; conserva la especificación original; propuesta de consolidación.
- `docs/ROUTES.md` — códigos HTTP medidos en producción; legado, stubs, archivos expuestos, rutas planificadas.
- `docs/TODO.md` — plan de 8 fases con dependencias, riesgos, criterios y pruebas; estado de la lista de junio.
- `docs/IMPLEMENTATION_LOG.md` — entrada de Fase 1.

### Sin cambios
- Ningún archivo bajo `jcdmtech/` (código del sitio) fue modificado. Sin commit ni despliegue.

---

## 2026-06-11 → 2026-08-02 — Cambios de código no registrados antes (reconstruidos desde Git)

- `4d0350a` (2026-08-02) feat(legal): privacidad y términos completos.
- `569df74` (2026-08-02) feat(site): página 404 con enlaces de navegación.
- `29c4b6f` (2026-06-30) feat(home): Home rediseñada en estilo QUELVO/Blacklane.
- `f571db1` (2026-06-30) feat(nav): se elimina "Book a Ride" del nav principal.
- `3ce3470` (2026-06-30) refactor(quelvo): assets en kebab-case + tarjetas de vehículo.
- `68c4ac5` (2026-06-30) feat(quelvo): landing QUELVO rediseñada con fotos IA.
- `ceb8e96`, `5ac8646` (2026-06-30) feat/fix: modo oscuro por defecto, toggle tema y EN/ES.
- `4649f19` fix(nav): "Sign in" visible por defecto.
- `41a6f05` fix(quelvo): corrección de la key de Google Maps.
- `2de49ab` feat(admin): sección de reservas en admin.
- `522f732` feat(quelvo): flujo de reserva completo con precio en vivo.
- `ac73233` fix(auth): migración a nuevo proyecto Supabase.
- `9af8089` refactor(filenames): páginas renombradas de español a inglés.
- `6693cb1` fix(auth): auth en inglés + corrección XSS en admin.
- `75c8a5c` feat(site): transformación a JCDM Technologies (services, projects, quelvo…).

---


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
