# Changelog

Historial de cambios del sitio y de la documentación (más reciente primero).
Desde 2026-10-19 cada entrada indica la fase del plan de 8 fases.

## 2026-10-19 — Producción: hotfix de seguridad R1 (`4ef6506`)

Publicado en `https://www.jcdmtech.com` (fast-forward `4d0350a..4ef6506` en `main`; deployment `7185173081`, `success`).
Rama `hotfix/security-2026-10`, independiente del mantenimiento.

### Publicado
- `vercel.json` válido (opción B): Vercel vuelve a desplegar; 22 redirects sin cambios (`324ecfc`).
- J-03 validación de `next` en el login (`fee2858`); J-04 `/copy.zip` y `/supabase-setup.sql` → 404 (`c9611e1`);
  J-05 cabeceras de seguridad, CSP sólo **Report-Only** (`d30c02c`).

### Retirado temporalmente
- `privacy.html`/`terms.html` vuelven a las versiones de `29c4b6f`; `404.html` retirada (`4ef6506`). Los textos nuevos
  (`4d0350a`, `569df74`) siguen en el historial, pendientes de revisión legal.

### No incluido
- Suspensión de QUELVO/OneSound, migración RLS de Supabase (no ejecutada; Supabase INACTIVE), protecciones de OneSound.

Pruebas en producción (sólo lectura): 110/110 HTTP, 139/139 navegador.

## 2026-10-19 — Documentación: organización de ramas tras el hotfix (sin commit)

- Estado real de ramas tras `git fetch`; simulación `main` → mantenimiento sin conflictos; procedimientos de sincronización
  y de reincorporación de textos legales (`PROJECT_STATUS.md` §0b–§0d); documentos actualizados a la producción `4ef6506`.

## 2026-10-19 — Seguridad: Fase 1 de remediación (local, sin commit)

> Encabezado histórico: después se commiteó en la rama (`c4516e3`…`c10ce02`) y J-03/J-04/J-05 se publicaron con el hotfix R1.

### Corregido
- Login: el destino `next` sólo admite rutas internas (`js/safe-next.js`); también en los enlaces mágicos (J-03).
- `/copy.zip` y `/supabase-setup.sql` dejan de publicarse: movidos a `archive/` y `supabase/legacy/`; nuevo `jcdmtech/.vercelignore` (J-04).

### Añadido
- Cabeceras de seguridad en `vercel.json` (nosniff, X-Frame-Options, Referrer-Policy, Permissions-Policy, CSP en Report-Only) y en el 503 del middleware (J-05).
- Migración de roles/RLS para Supabase, **no aplicada**, con preflight, verificación auto-revertida y reversión (`supabase/migrations/`).
- Pruebas: `scripts/tests/safe-next.test.mjs`, `scripts/tests/security-rls.pglite.mjs`.
- `docs/SECURITY_REMEDIATION.md` (OneSound: sólo resumen público; detalle en documento local no versionado; sin cambios en OneSound).

## 2026-10-19 — fix(vercel): `vercel.json` restaurado (opción B), rama `maintenance/quelvo-onesound`

### Corregido
- `jcdmtech/vercel.json`: retiradas `errors` (propiedad no válida), `cleanUrls` y `trailingSlash` (añadidas en `569df74`, nunca publicadas). Queda idéntico al de `29c4b6f` (producción actual); 22 redirects intactos.

### Documentado
- Hechos confirmados vs. hipótesis sobre los despliegues fallidos (`MAINTENANCE_MODE.md` §8.1, `PROJECT_AUDIT.md` §10, riesgo R-22).

## 2026-10-19 — Rama `maintenance/quelvo-onesound` y Vercel Preview

- Commits `70479ca` (docs Fase 1) y `abc90c8` (suspensión) en la rama; push sólo a esa rama; `main` sin cambios.
- Vercel Preview **fallido**. Descubierto: todos los despliegues fallan desde `569df74` (`vercel.json` con `errors`, propiedad no válida); producción sirve `29c4b6f` (2026-06-30). Corregidas las afirmaciones "producción = main" en `CLAUDE.md` y `PROJECT_AUDIT.md`.
- Pruebas de navegador locales del commit: 39/39.
- Documentado el acceso seguro a Previews protegidos (`MAINTENANCE_MODE.md` §6.1).

## 2026-10-19 — Revisión técnica de la suspensión (rev. 2, no desplegado)

### Corregido
- `middleware.js`: runtime `nodejs` explícito (el builder usaba `edge`, obsoleto); flag estricto; timeout y reenvío de cookie en la subpetición.
- Flag `enabled` → `maintenance` (true = suspendido) en `maintenance.config.js`, wizard y `booking.js`.
- SQL: tabla `jcdm_maintenance_flags` (boolean), sin `if not exists`, bloqueo por claims JWT; preflight de dependencias.

### Añadido
- `docs/sql/quelvo-maintenance.test.sql` (prueba en seco auto-revertida), `scripts/verify-maintenance.sh` (comprobaciones HTTP).

### Documentado
- Supabase `jcdmtech-prod` y `quelvo-prod` pausados; app QUELVO local no pública; riesgo R-M1 de `cleanUrls` en despliegues nuevos.

## 2026-10-19 — Suspensión temporal de QUELVO y OneSound (preparado, no desplegado)

### Añadido
- Modo mantenimiento reversible por flags: `jcdmtech/js/maintenance.config.js`, `jcdmtech/middleware.js` (503 + `Retry-After`), `jcdmtech/maintenance/quelvo/` (EN/ES).
- `docs/MAINTENANCE_MODE.md` — activar, desactivar, comprobaciones, dependencias; mapa de plataformas (OneSound en Vercel + Render, Survivor en servidor propio).
- `docs/sql/quelvo-maintenance.sql` — bloqueo de nuevas reservas en Supabase (pendiente de aplicar con autorización).
- `docs/maintenance-templates/onesound-maintenance.html` — pantalla para el repo de OneSound (pendiente).
- Decisión D-013.

### Cambiado
- Botones "Book a Ride" y enlaces "Open app" de OneSound ocultos con avisos de indisponibilidad (Home, Projects, footer, landing Music Ride); opción de reserva QUELVO deshabilitada en Contact.
- Guardas de envío en `quelvo/book/` (`confirm4`) y `js/booking.js`.

### Sin cambios
- Ningún archivo eliminado; servicios tecnológicos, Home, Services, Projects, About y Contact operativos. Datos de Supabase, `vercel.json`, DNS, OneSound y Survivor intactos.

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
