# Implementation Log

---

## 2026-06-11 — Phase 1: Project Analysis

### Action
Complete project inventory and analysis before any code changes.

### Findings
- **Stack:** Static HTML/CSS/JS, Vercel hosting, no build step
- **Pages:** 13 HTML files (4 functional, 4 placeholder, 5 other)
- **Forms:** Formspree (contact), booking.js WhatsApp/email (bookings), Supabase (auth/profile)
- **Assets:** No photos of cars or staff — relying on CSS-only design
- **Phone mismatch:** booking.js uses `17863487458`, contact.html shows `+13050000000`
- **Design:** Direction C already implemented (black/cream/gold, Fraunces wordmark)

### Files read
- `index.html`, `styles.css`, `partials/header.html`, `partials/footer.html`
- `chofer-privado/reservar.html`, `chofer-privado/gracias.html`, `chofer-privado/index.html`
- `js/app.js`, `js/booking.js`, `js/supabase.config.js`, `js/version.js`
- `contacto.html`, `nosotros.html`, `vercel.json`
- All placeholder pages in `automatizaciones/`, `domotica/`, `software/`, `blog/`

### Risk flags
1. Phone number mismatch — needs resolution
2. Privacy/Terms stubs — legal compliance risk
3. No 404 page — UX issue
4. Booking code not persisted — no audit trail
5. Admin panel accessible with client-side auth only — depends on Supabase RLS

### Result
Full picture of the project. Safe to proceed with Phase 2.

---

## 2026-06-11 — Phase 2: Documentation Created

### Action
Created /docs folder with all 7 required documentation files.

### Files created
- `docs/PROJECT_CONTEXT.md`
- `docs/SITE_ARCHITECTURE.md`
- `docs/DESIGN_SYSTEM.md`
- `docs/ROUTES.md`
- `docs/CHANGELOG.md`
- `docs/IMPLEMENTATION_LOG.md`
- `docs/TODO.md`

### Motivo
Document the full picture before modifying any code, as required by the project spec.

### Result
Complete documentation base established. Serves as reference for all future changes.

---

## 2026-06-11 — Phase 5: Homepage Redesign (PENDING)

### Action
Redesign index.html from chauffeur-focused to JCDM Technologies tech company homepage.

### Plan
- New hero: "Technology, automation & digital platforms for real-world needs."
- Section 2 (cream): 5 service cards
- Section 3 (dark): Featured Platforms (QUELVO + Music Ride)
- Section 4 (cream): Why JCDM — 4 points
- Section 5 (dark): Contact CTA

### Files to modify
- `jcdmtech/index.html` — Full content rewrite
- `jcdmtech/styles.css` — Add service grid, platform card, why-grid CSS

### Status: IN PROGRESS

---

> **Nota (2026-10-19):** la entrada anterior "Phase 5: Homepage Redesign (PENDING / IN PROGRESS)" pertenece a la
> numeración de fases de junio 2026. Ese trabajo se completó en los commits `75c8a5c` y `29c4b6f`.
> A partir de aquí rige el plan de 8 fases descrito en `docs/TODO.md`.

---

## 2026-10-19 — Fase 1 (plan de 8 fases): Auditoría técnica y documentación

### Estado inicial
- Rama `main`, árbol limpio, al día con `origin/main`; último commit `4d0350a`.
- Producción (`www.jcdmtech.com`) idéntica a `main` en los 7 archivos comparados por MD5.

### Acciones
1. Inventario de los 66 archivos versionados; lectura completa de `js/*.js`, partials, `vercel.json`, `robots.txt`, `sitemap.xml`, `supabase-setup.sql`, `quelvo/book/index.html`; lectura dirigida (grep/extracción de texto) del resto de páginas.
2. Lectura de la documentación existente (`AI_PROJECT_CONTEXT.md`, 7 archivos de `docs/`).
3. Comprobaciones en producción (sólo `curl` GET/HEAD): 27 rutas, app Music Ride, archivos expuestos.
4. Intento de lectura del esquema Supabase vía MCP (`list_tables`, `get_advisors`): **timeout**, no verificado.
5. `node --check` sobre JS externo; script de enlaces internos; búsqueda de mojibake; tamaño de imágenes; cobertura `data-es`; CSS inline por página.
6. Redacción/actualización de la documentación.

### Archivos creados
- `CLAUDE.md`
- `docs/PROJECT_AUDIT.md`, `docs/DECISIONS.md`, `docs/PROJECT_STATUS.md`

### Archivos actualizados (información previa conservada o marcada como histórica)
- `docs/PROJECT_CONTEXT.md`, `docs/SITE_ARCHITECTURE.md`, `docs/DESIGN_SYSTEM.md`, `docs/ROUTES.md`,
  `docs/TODO.md`, `docs/CHANGELOG.md`, `docs/IMPLEMENTATION_LOG.md`

### Archivos NO modificados
- Todo `jcdmtech/` (código del sitio), `AI_PROJECT_CONTEXT.md`, `README.md`, `.vscode/`, `.claude/`.

### Motivo
Establecer una base documental fiable antes del rediseño; la documentación de junio estaba desactualizada
(rutas en español, páginas "por crear" ya existentes, proyecto Supabase antiguo).

### Hallazgos principales
- Dos flujos de reserva: actual (Supabase `bookings`) y legado (`booking.js`, inaccesible en producción).
- Esquema Supabase no versionado en el repo; RLS de `bookings` no verificable.
- Redirección abierta en `login.html` (`next`).
- `pickup_at` depende de la zona horaria del navegador.
- `/copy.zip` y `/supabase-setup.sql` públicos.
- Textos de marketing que prometen funciones no implementadas.
- Dos lenguajes visuales; ~17 MB de PNG; i18n parcial.
Detalle: `docs/PROJECT_AUDIT.md` §8.

### Pruebas y resultados
| Prueba | Resultado |
|---|---|
| `node --check` app.js, booking.js, version.js | OK |
| Enlaces internos | 1 roto (`/assets/safari-pinned-tab.svg`) |
| Mojibake | 0 |
| Rutas producción | Ver `ROUTES.md` (incluye `/about/` 404 y stubs 200) |
| Supabase remoto | No verificado (timeout) |

### Resultado
Fase 1 completada salvo la verificación de Supabase (bloqueo registrado en `PROJECT_STATUS.md`). Sin commit ni despliegue.

---

## 2026-10-19 — Suspensión temporal de QUELVO y OneSound (preparación local)

Petición del propietario: pausar QUELVO y OneSound para concentrarse en Survivor Sports, sin borrar nada y de forma reversible.
Trabajo intercalado fuera del plan de 8 fases (no adelanta ninguna fase). Decisión D-013. Procedimiento: `docs/MAINTENANCE_MODE.md`.

### Auditoría (sólo lectura)
- DNS: `www` y `music-ride` → Vercel (dos proyectos distintos); `survivor` → CNAME `eljuank.duckdns.org` (servidor propio); NS GoDaddy.
- OneSound = "Music Ride": frontend Vercel (`<title>OneSound</title>`), backend Render `jcdm-music-ride.onrender.com` (API `/api/sessions/*` + Socket.IO), repo `github.com/eljuankd/jcdm-music-ride`; backup local `D:\Proyectos\OneSound-Windows-Backup-2026-09-07.zip` (sólo listado y lectura de README/docs, sin extraer ni leer `.env`).
- Survivor: no comparte repo, hosting, ni backend con JCDM; sólo la zona DNS.
- Supabase MCP (`execute_sql` de lectura): **timeout** otra vez → esquema/RLS/triggers de `bookings` no verificados.
- Referencias QUELVO/Music Ride en el sitio: Home, Projects, footer, landing Music Ride, contact (`<option>`), About y 404 (sólo enlaces a landings).

### Archivos creados
- `jcdmtech/js/maintenance.config.js` — flags centrales (quelvo / onesound), clases `html.maint-*`, redirección de respaldo en cliente
- `jcdmtech/middleware.js` — Vercel Routing Middleware: 503 + `Retry-After` en `/quelvo*` y `/chofer-privado*`
- `jcdmtech/maintenance/quelvo/index.html` — página de mantenimiento EN/ES, `noindex`
- `docs/sql/quelvo-maintenance.sql` — tabla `app_settings` + trigger BEFORE INSERT en `bookings` (**no aplicado**)
- `docs/maintenance-templates/onesound-maintenance.html` — plantilla para el repo de OneSound (**no aplicada**)
- `docs/MAINTENANCE_MODE.md`

### Archivos modificados (sólo adiciones; nada eliminado)
- `jcdmtech/styles.css` — reglas `data-maint-hide` / `data-maint-show` / `.maint-note`
- `jcdmtech/js/app.js` — `ensureMaintenanceConfig()` antes de inyectar partials
- `jcdmtech/index.html`, `projects/index.html`, `music-ride/index.html`, `partials/footer.html`, `contact.html` — marcado de botones/enlaces + avisos
- `jcdmtech/quelvo/index.html`, `quelvo/book/index.html`, `quelvo/book/gracias/index.html`, `chofer-privado/{index,reservar,gracias}.html` — `<script src="/js/maintenance.config.js">` en `<head>`
- `jcdmtech/quelvo/book/index.html` (zona protegida) — guarda de 1 línea al inicio de `confirm4()`; resto intacto
- `jcdmtech/js/booking.js` (zona protegida) — guarda al inicio del `submit`

### Pruebas y resultados
| Prueba | Resultado |
|---|---|
| `node --check` js/*.js + middleware.js | OK |
| Middleware en Node 22 (Request/Response estándar) con servidor estático local | `/quelvo/`, `/quelvo/book/`, `/chofer-privado/reservar.html` → 503, `Retry-After: 86400`, `X-Robots-Tag: noindex`, cuerpo = página de mantenimiento; subpetición fallida → HTML de respaldo EN/ES; flag apagado → `x-middleware-next: 1` |
| Chrome headless, flags activos, 13 rutas | Home/Projects/Services/About/Contact/Music Ride cargan con header y footer; 0 enlaces visibles a `/quelvo/book/`, `reservar.html` o `music-ride.jcdmtech.com`; avisos visibles; opción QUELVO del contacto deshabilitada; las 5 rutas QUELVO/legado terminan en `/maintenance/quelvo/`; `/admin/` → `/login.html` (comportamiento normal sin sesión, no afectado) |
| Chrome headless, flags apagados (reactivación) | Todas las rutas QUELVO cargan su contenido original; todos los botones/enlaces reaparecen; 0 avisos. Config restaurada a `enabled: true` |
| Enlaces internos | Sólo el roto preexistente `/assets/safari-pinned-tab.svg` |
| No probado | Ejecución real del middleware en Vercel (requiere Preview); trigger SQL (no aplicado); reserva real (no autorizada) |

### Resultado
Mantenimiento **preparado en local, no activo en producción**. Sin commit, sin push, sin cambios en Supabase, Vercel, Render, DNS ni en OneSound/Survivor.

---

## 2026-10-19 — Revisión técnica previa al despliegue de la suspensión (rev. 2)

Petición del propietario: revisión final antes de cualquier despliegue. Sin commit, push, merge ni despliegue. Sin SQL en Supabase.
OneSound y Survivor intactos (sólo lecturas HTTP y de archivos locales).

### Hallazgos
1. **Middleware sin `runtime`** → el builder lo compilaba para `edge` (obsoleto, con aviso) como CommonJS con `require()` de un archivo hermano: riesgo de fallo en ejecución (500 en QUELVO). Docs de Vercel: ESM sin framework requiere `type: module` o `.mjs` para Functions; `proxy.entrypoint` sólo admite `.js`/`.ts`.
2. **Flag ambiguo** `enabled: true` (podía leerse "plataforma activa"). SQL con tabla genérica `app_settings` (`jsonb`, `create table if not exists` → colisión silenciosa posible).
3. **Supabase `jcdmtech-prod` PAUSADO** (`status: INACTIVE`; el host no resuelve). Explica los *timeouts* de Fase 1. Hoy fallan login, admin y reservas en producción. Existe un segundo proyecto `quelvo-prod`, también pausado.
4. **Otros canales QUELVO:** `D:\quelvo` (app Expo + backend Fastify) apunta a `10.0.0.6:3000`/`localhost:3000`; no hay backend público (`eljuank.duckdns.org:3000` no responde) ni build de producción. Ningún canal público adicional acepta reservas.
5. **R-M1:** `vercel build` (CLI 64.5.0) genera reglas `cleanUrls` (`/about.html` → `/about/`) que no coinciden con producción (`/about.html` 200, `/about/` 404) con el mismo `vercel.json` (sin cambios desde 2026-08-02). Riesgo de cualquier despliegue nuevo, ajeno a este cambio.

### Correcciones
- `jcdmtech/middleware.js`: `config.runtime = "nodejs"`; continuación con `x-middleware-next: 1` documentada como equivalente a `next()` (verificado en el código de `@vercel/functions@3.10.1`); flag estricto `=== true`; subpetición con timeout de 3 s y reenvío de cookie (Deployment Protection en Previews).
- `jcdmtech/js/maintenance.config.js`: `enabled` → `maintenance` (true = suspendido); comparación estricta; `console.warn` si el valor no es booleano.
- `quelvo/book/index.html` (`confirm4`) y `js/booking.js`: guardas actualizadas a `maintenance === true`.
- `docs/sql/quelvo-maintenance.sql` reescrito: tabla `public.jcdm_maintenance_flags (key, maintenance boolean not null)`, `create table` sin `if not exists`, función por claims JWT (bloquea `anon`/`authenticated` no admin; permite `service_role`, SQL directo y admins), preflight de dependencias y snapshot, desinstalación transaccional.
- Nuevo `docs/sql/quelvo-maintenance.test.sql`: prueba en seco auto-revertida (bloque `DO` que termina en error intencionado; usa tabla temporal, nunca `bookings`).
- Nuevo `scripts/verify-maintenance.sh`: comprobaciones HTTP de sólo lectura para Preview/producción (+ bypass de Deployment Protection).
- Docs: `MAINTENANCE_MODE.md` (rev. 2), `ROUTES.md`, `SITE_ARCHITECTURE.md`, `DECISIONS.md`, `PROJECT_CONTEXT.md`, `TODO.md`, `PROJECT_STATUS.md`, `CHANGELOG.md`.

### Pruebas y resultados
| Prueba | Resultado |
|---|---|
| `node --check` js/*.js + middleware.js | OK |
| `npx vercel@64.5.0 build` sobre copia en scratchpad (sin login, sin despliegue) | Build OK; `middleware.func` con `nodejs24.x`, `useWebApi: true`; `js/maintenance.config.js` empaquetado; ruta del middleware tras los redirects; `middleware.js` no publicado como estático |
| Artefacto compilado ejecutado en Node 22 | ON: 5 rutas → 503 + `Retry-After` + página con estilo; OFF: `x-middleware-next: 1`; `"true"` (string) ⇒ OFF |
| PGlite 0.5.8 (scratchpad) con los SQL tal cual | 19/19 PASS (prueba en seco antes/después, idempotencia segura, bloqueo anon/usuario, admin permitido, update permitido, reabrir/re-suspender, histórico idéntico, desinstalación) |
| Chrome headless, flags ON / OFF | Igual que rev. 1: 0 enlaces de reserva/app visibles con ON; todo restaurado con OFF; config devuelta a `maintenance: true` |
| `scripts/verify-maintenance.sh https://www.jcdmtech.com` | 6 fallos esperados (nada desplegado): rutas QUELVO 200, `/maintenance/quelvo/` y `/js/maintenance.config.js` 404; resto PASS |
| Supabase MCP `get_project` / `list_projects` (gestión, sólo lectura) | `jcdmtech-prod` y `quelvo-prod` INACTIVE |

### Resultado
Listo para Vercel Preview (pendiente de autorización). Sin cambios en producción, Supabase, OneSound, Survivor ni DNS.
