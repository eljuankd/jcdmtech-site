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

---

## 2026-10-19 — Commits, push a rama y Vercel Preview (autorizado)

Autorización del propietario: dos commits y push **sólo** a `maintenance/quelvo-onesound`. Sin merge/push a `main`, sin producción, sin SQL ni restauración de Supabase, sin tocar OneSound ni Survivor.

### Commits (rama `maintenance/quelvo-onesound`, sobre `4d0350a`)
- `70479ca` docs(project): phase 1 audit and project documentation — versión "Fase 1" de los documentos mixtos generada quitando los bloques de la suspensión y preparada en el índice con `git hash-object` + `update-index` (sin `add -p`); escaneo de palabras clave y de credenciales: limpio.
- `abc90c8` feat(maintenance): reversible temporary suspension of QUELVO and OneSound links — 30 archivos; escaneo de credenciales: limpio.
- Push con refspec explícito. Remoto tras el push: `main` = `4d0350a` (sin cambios), `maintenance/quelvo-onesound` = `abc90c8`.

### Vercel Preview
- Deployment `dpl_7qMWbRLDDcERZ86i4JNCY1842D1B`, URL `https://jcdmtech-site-7bkiifxe8-juanks-projects-50846d74.vercel.app` → **estado `failure`** (GitHub commit status). La URL responde 302 "Protected by Vercel Authentication".
- **Causa (fuera de este cambio):** todos los despliegues de `main` fallan desde `569df74` (2026-08-02); el último correcto es `29c4b6f` (2026-06-30). Producción sirve `29c4b6f` (MD5 de `privacy.html` en producción = `29c4b6f`, ≠ `4d0350a`; la 404 personalizada no está publicada). `569df74` añadió `cleanUrls`, `trailingSlash` y `errors` a `vercel.json`; `errors` no es una propiedad documentada y el estado de `569df74` enlaza a la documentación de configuración de proyectos. Logs no consultados (requieren acceso a Vercel).
- Corrige dos afirmaciones previas: "producción = main" (CLAUDE.md, PROJECT_AUDIT §9, PROJECT_STATUS) y el origen de R-M1 (no era la versión del builder, sino configuración nunca desplegada).
- Opciones de corrección validadas con `npx vercel@64.5.0 build` en copias del scratchpad: A (quitar `errors`) y B (quitar `errors`, `cleanUrls`, `trailingSlash`); ambas compilan con la ruta del middleware; B reproduce las rutas de producción actuales y sirve `/404.html`. **No aplicado**: requiere autorización (zona protegida, tercer commit).

### Pruebas de navegador (Puppeteer 24.22.0 + Chrome, contra `abc90c8` servido en local)
39/39 PASS, a 1280 px y 375 px:
- Home: QUELVO y Music Ride visibles como productos con avisos "Bookings temporarily paused" / "App temporarily unavailable"; 0 enlaces visibles a reserva o app; enlaces a los 4 servicios (`#web`, `#automation`, `#smarthome`, `#support`).
- Projects: secciones QUELVO y Music Ride con "Platform · Temporarily unavailable"; 0 enlaces de reserva/app.
- Services: 200 con las 4 secciones.
- Móvil: botón hamburguesa visible, menú abre (`aria-expanded=true`) con Home/Services/QUELVO/Projects/About/Contact/Sign in, y cierra.
- Idioma: EN → ES (avisos en español, `lang=es`) → EN; página de mantenimiento en ES.
- `/quelvo/`, `/quelvo/book/`, `/chofer-privado/` → página de mantenimiento (en local por el respaldo del cliente; el 503 sólo es verificable en Vercel).
- `/about.html`, `/contact.html`, `/qrcard.html` → 200 en local. 1 error de consola preexistente en `/qrcard.html` (recurso 404).
- Capturas revisadas: página de mantenimiento móvil y menú móvil abierto, correctas.

### Pendiente de Preview (no ejecutable hasta corregir R-M9 y disponer de acceso)
503 + `Retry-After` reales del middleware; script `verify-maintenance.sh` contra el Preview; rutas `.html` en Vercel.

### Archivos de documentación actualizados (sin commit; requiere autorización)
`CLAUDE.md`, `docs/PROJECT_AUDIT.md`, `docs/MAINTENANCE_MODE.md`, `docs/IMPLEMENTATION_LOG.md`, `docs/PROJECT_STATUS.md`, `docs/ROUTES.md`, `docs/TODO.md`, `docs/CHANGELOG.md`.

---

## 2026-10-19 — fix(vercel): corrección de `vercel.json` (opción B, autorizada)

Autorización: un commit y push sólo a `maintenance/quelvo-onesound`. Prohibido `main`, producción, Supabase, OneSound, Survivor, DNS.

### Cambio
- `jcdmtech/vercel.json`: retiradas `errors`, `cleanUrls`, `trailingSlash`. Resto intacto (22 redirects idénticos a `HEAD`).

### Comprobaciones antes del commit
| Comprobación | Resultado |
|---|---|
| Sintaxis JSON | OK — claves: `redirects` (22) |
| `git diff 29c4b6f -- jcdmtech/vercel.json` | vacío ⇒ idéntico a la configuración que sirve producción |
| `git diff --stat HEAD -- jcdmtech` | sólo `vercel.json` (5 líneas eliminadas) |
| `npx vercel@64.5.0 build` (copia en scratchpad) | OK; `middleware.func` `nodejs24.x`, `useWebApi: true`, `js/maintenance.config.js` empaquetado; 0 reglas `cleanUrls`/`trailingSlash`; ruta `404 → /404.html`; `404.html`, `/maintenance/quelvo/` y `js/maintenance.config.js` en la salida estática; `middleware.js` no publicado |
| Middleware compilado ejecutado (Node 22, salida estática del build) | 5 rutas QUELVO/legado → 503, `Retry-After: 86400`, página con estilo |
| Survivor (línea base, sólo lectura) | `https://survivor.jcdmtech.com/` → 200 `text/html` 539 B |

### Confirmado vs. hipótesis
Ver `docs/MAINTENANCE_MODE.md` §8.1 y `docs/PROJECT_AUDIT.md` §10.

### Resultado tras el push (`fd31034`)
- Push sólo a `maintenance/quelvo-onesound` (`abc90c8..fd31034`). Remoto: `main` = `4d0350a` (sin cambios).
- **Vercel Preview: `success`** — deployment GitHub `7179335782`, URL `https://jcdmtech-site-d12mqr6yd-juanks-projects-50846d74.vercel.app`.
  ⇒ **Hipótesis confirmada** (por resultado, sin logs): el bloqueo de despliegues desde `569df74` lo causaba `vercel.json`.
- Preview protegido por Vercel Authentication: `/`, `/quelvo/`, `/about.html` → 302 a `vercel.com/sso-api`. **Pruebas funcionales contra el Preview no ejecutadas** (no hay token de bypass configurado; el propietario indicó detenerse en ese caso).
- Producción sin cambios: `privacy.html` MD5 = versión `29c4b6f`; `/quelvo/` 200; `/maintenance/quelvo/` 404.
- Survivor: 200 `text/html` 539 B (igual que la línea base). OneSound: 200 (sin cambios).
- Esta entrada y las de estado posteriores quedan **sin commit** (sólo se autorizó un commit en esta fase).

---

## 2026-10-19 — Auditoría de seguridad + Fase 1 de remediación (local, sin commit)

Autorización del propietario: preparación **local** de las correcciones de JCDM. Prohibido: commit, push, merge,
despliegue, bases de datos reales, OneSound, Survivor, DNS, credenciales.

### Auditoría (sólo lectura, antes de la remediación)
- Informe entregado en la conversación (no publicado: el repo `eljuankd/jcdmtech-site` es **público**).
- Comprobaciones: estado Git; MD5 de producción (= `29c4b6f`); 18 rutas sensibles (`/copy.zip`, `/supabase-setup.sql` → 200;
  `.git`, `.env`, docs → 404); cabeceras HTTP de www, apex y OneSound; historial Git (sólo claves `anon`); Supabase MCP
  `list_projects` (ambos INACTIVE); repo OneSound clonado en lectura + `npm audit --package-lock-only`. Survivor: ninguna petición.

### Cambios (archivos)
| Archivo | Cambio | Hallazgo |
|---|---|---|
| `jcdmtech/js/safe-next.js` (nuevo) | Validación de destino interno tras login | J-03 |
| `jcdmtech/login.html` | Importa `safeNext`; el valor validado se usa en redirecciones y `emailRedirectTo` | J-03 |
| `jcdmtech/supabase-setup.sql` → `supabase/legacy/supabase-setup.sql` | Movido (MD5 idéntico) | J-04 |
| `jcdmtech/copy.zip` → `archive/copy.zip` | Movido (MD5 idéntico) | J-04 |
| `jcdmtech/.vercelignore` (nuevo) | Bloquea `*.zip`, `*.sql`, `*.bak`, `.env*`… en la raíz publicada | J-04 |
| `jcdmtech/vercel.json` | `headers`: nosniff, XFO DENY, Referrer-Policy, Permissions-Policy, CSP **Report-Only**. Redirects intactos (22) | J-05 |
| `jcdmtech/middleware.js` | Respuesta 503 con nosniff, XFO, Referrer-Policy | J-05 |
| `supabase/migrations/2026-10-19-security-rls{,.preflight,.verify,.rollback}.sql` (nuevos) | Migración de roles/RLS **no aplicada** + inventario + verificación auto-revertida + reversión | J-01, J-02, J-06, R-08 |
| `scripts/tests/safe-next.test.mjs`, `security-rls.pglite.mjs`, `e2e-security.mjs`, `serve-vercel-output.mjs` (nuevos) | Pruebas | — |
| `supabase/README.md`, `archive/README.md`, `docs/SECURITY_REMEDIATION.md` (nuevos) | Documentación | — |
| Docs actualizados | `CHANGELOG`, `PROJECT_STATUS`, `TODO`, `ROUTES`, `PROJECT_AUDIT`, `DECISIONS`, `SITE_ARCHITECTURE`, `MAINTENANCE_MODE`, `CLAUDE.md` | — |

### Pruebas y resultados (detalle: `docs/SECURITY_REMEDIATION.md` §7)
| Prueba | Resultado |
|---|---|
| `node --test scripts/tests/safe-next.test.mjs` | 4/4 (48 casos) |
| PGlite 0.5.8 — `scripts/tests/security-rls.pglite.mjs` | 83/83 |
| `npx vercel@64.5.0 build` (copia en scratchpad) | OK; sin `.zip`/`.sql` en la salida; cabeceras antes del middleware |
| `.vercelignore` con señuelos / control sin él | excluidos / publicados |
| Chrome headless contra la salida compilada (rutas + middleware reales, sin tráfico externo) | 88/88 |
| Control: `login.html` de `HEAD` | sale a otro dominio y ejecuta `javascript:` (confirma J-03) |
| `node --check`; enlaces internos | OK; sólo `safari-pinned-tab.svg` (conocido) |

Incidencia durante el trabajo: la primera versión de `safe-next.js` llevaba escapes `\uXXXX` en una expresión regular que
quedaron escritos como caracteres literales y la rompían (habría dejado el login sin funcionar). La detectó la prueba
unitaria; se sustituyó por una comprobación por códigos de carácter, sin escapes.

Hallazgo nuevo: el SQL histórico literal produce recursión infinita en toda lectura autenticada de `profiles` ⇒ la base real
difiere de él; si la recursión se resolvió quitando la política de admin, J-01 es explotable (reproducido en PGlite).

### Resultado
Preparado y probado en local. Sin commit. Sin cambios en producción, Supabase, OneSound, Survivor ni DNS.
Pendiente: autorización de commit → Preview → producción → procedimiento de Supabase (`SECURITY_REMEDIATION.md` §4.4, §6).

---

## 2026-10-19 — Commits de seguridad, push a la rama y Vercel Preview (autorizado)

Autorización: commits separados y push **sólo** a `maintenance/quelvo-onesound`. Sin `main`, producción, Supabase, OneSound, Survivor.

### Commits (sobre `fd31034`)
| Hash | Mensaje |
|---|---|
| `c4516e3` | fix(auth): only allow same-origin destinations after sign-in |
| `bc9b189` | chore(security): stop publishing internal files from the site root (renombrados R100, historial conservado) |
| `b6b821d` | feat(security): add HTTP security headers and report-only CSP |
| `01037ee` | feat(maintenance): send baseline security headers on 503 responses (sólo rama; separado para el hotfix) |
| `f8d07a4` | feat(db): prepare Supabase roles/RLS security migration (not applied) |
| `ddee55f` | test(security): add browser checks against a local vercel build |
| `c10ce02` | docs(security): record audit remediation and preview results (incluye los resultados de `fd31034` que estaban sin commit) |

Antes del push: escaneo de credenciales del rango `fd31034..c10ce02` limpio; sin rutas temporales; pruebas 4/4 y 83/83 sobre el árbol commiteado.
El detalle de OneSound se movió a `docs/private/` (en `.gitignore`): el repo es público y OneSound sigue en producción sin corregir.

### Vercel Preview
- Estado GitHub `Vercel`: **success**. URL: `https://jcdmtech-site-nvgubpe83-juanks-projects-50846d74.vercel.app` (deployment GitHub `7181602367`).
- Protegido por Vercel Authentication (302 a `vercel.com/sso-api`); sin token de bypass ⇒ **pruebas funcionales en el Preview pendientes** (revisión por el propietario con su sesión; script de consola probado en local 31/31).

### Prueba en seco del hotfix (worktree temporal desacoplado, eliminado; sin ramas ni push)
- Sobre `main` (`4d0350a`): `vercel.json` tomado de `fd31034` (sólo el archivo: el commit completo choca en docs inexistentes en `main`) + cherry-pick `c4516e3 bc9b189 b6b821d f8d07a4` → sin conflictos.
- Árbol resultante vs. producción (`29c4b6f`): sólo seguridad + `404.html`, `privacy.html`, `terms.html` (ya en `main`). Sin middleware ni marcado de mantenimiento.
- `vercel build` OK; local: `/quelvo/`, `/quelvo/book/`, `/music-ride/` 200; enlaces de reserva y de OneSound visibles; cabeceras 5/5; `/copy.zip`, `/supabase-setup.sql` 404; navegador 82/88 (las 6 diferencias son las comprobaciones de mantenimiento, esperadas).
- Fusión simulada de la rama de mantenimiento sobre el hotfix: automática, sin conflictos.

### Estado
Producción sin cambios (`privacy.html` = `29c4b6f`; `/copy.zip` aún 200). OneSound 200, `/health` ok. Survivor: sin peticiones.

---

## 2026-10-19 — Hotfix de seguridad independiente del mantenimiento: rama `hotfix/security-2026-10` y Preview (autorizado)

Autorización: crear la rama, commits y push **sólo** a ella; Preview. Sin `main`, producción, Supabase, SQL, Render, OneSound, Survivor, DNS.
Revisión del propietario del Preview anterior (`c10ce02`): QUELVO 503 + `Retry-After: 86400`, cabeceras, `/copy.zip` y `/supabase-setup.sql` 404, navegación correcta.

### Estado inicial
`main` = `origin/main` = `4d0350a`; `maintenance/quelvo-onesound` = `c10ce02` (local = remoto); pendientes sin commit: `IMPLEMENTATION_LOG.md`, `PROJECT_STATUS.md` (copia de seguridad en el scratchpad; conservados).
Hotfix preparado en un **worktree aparte** (sin tocar el árbol de mantenimiento; sin reset/clean/stash).

### Commits (`hotfix/security-2026-10`, sobre `4d0350a`)
| Hash | Origen | Contenido |
|---|---|---|
| `324ecfc` | sólo `jcdmtech/vercel.json` de `fd31034` | `vercel.json` = producción (`29c4b6f`); 22 redirects |
| `fee2858` | cherry-pick `-x` de `c4516e3` | validación de `next` (mismo patch-id) |
| `c9611e1` | cherry-pick `-x` de `bc9b189` | archivos internos fuera de la raíz + `.vercelignore` (mismo patch-id) |
| `d30c02c` | cherry-pick `-x` de `b6b821d` | cabeceras + CSP Report-Only (mismo patch-id) |

Excluidos: `abc90c8` (suspensión), `01037ee` (middleware), `f8d07a4` (migración SQL), `ddee55f` (pruebas e2e de mantenimiento), docs. Decisión: `fd31034` completo choca con documentación inexistente en `main` ⇒ sólo su `vercel.json`.
Sin documentación en el hotfix (evita divergencias de `docs/` con la rama de mantenimiento); esta entrada vive en la rama de mantenimiento.

### Pruebas (locales, salida de `npx vercel@64.5.0 build` del hotfix; sin tráfico externo)
| Prueba | Resultado |
|---|---|
| Build | OK; 53 estáticos, sin `.zip`/`.sql`; 22 redirects; cabeceras; **sin middleware** |
| `node --test scripts/tests/safe-next.test.mjs`; `node --check`; enlaces | 4/4; OK; sólo `safari-pinned-tab.svg` (conocido) |
| Chrome headless, variante sin mantenimiento (scratchpad `tools/e2e-hotfix.mjs`) | **133/133**: login (`next` legítimos/maliciosos, magic link, `SIGNED_IN`, reset, registro); 16 páginas 200/404 sin violaciones de CSP, sin errores JS y sin avisos de suspensión; `/admin/` no enmarcable; Home con 4 servicios + enlace de reserva + enlace a OneSound; QUELVO con enlaces de reserva; wizard pasos 1→3 (nunca confirmado); Music Ride → app; menú móvil; EN/ES; claro/oscuro; 9 rutas antiguas; formulario de contacto con opción QUELVO activa |
| Control negativo: misma batería contra el build de mantenimiento | falla en avisos, 503 y enlaces ocultos (la prueba discrimina) |
| Script de consola para el Preview (`preview-console-check-hotfix.js`) en local | hotfix 74/74; control mantenimiento 59/74 |
| Escaneo de credenciales `main..d30c02c` | limpio |

Ajuste durante las pruebas: el detector de avisos marcaba cláusulas legales de `terms.html` ("modify, suspend, or discontinue", "interruptions due to maintenance"); se restringió a las frases reales de los avisos del sitio.

### Vercel Preview
`success` — `https://jcdmtech-site-211ssi2ck-juanks-projects-50846d74.vercel.app` (deployment GitHub `7183158107`). Protegido (302 a `vercel.com/sso-api`): revisión en el Preview pendiente del propietario.

### Diferencias con producción (`29c4b6f`) que publicaría el hotfix
Seguridad (`login.html`, `js/safe-next.js`, `vercel.json` headers, `.vercelignore`, retirada de `copy.zip`/`supabase-setup.sql`) **y** contenido de `main` aún no publicado: `404.html` nueva (`569df74`), `privacy.html` y `terms.html` completas (`4d0350a`; hoy en producción son esbozos). Revisión legal **no verificada**.

### Estado
Producción sin cambios (`privacy.html` = `29c4b6f`; `/quelvo/`, `/quelvo/book/` 200; `/copy.zip` aún 200). OneSound 200, `/health` ok. Survivor: sin peticiones. Remoto: `main` `4d0350a`, mantenimiento `c10ce02`, hotfix `d30c02c`.

---

## 2026-10-19 — Hotfix R1: páginas legales y 404 como en producción (rama `hotfix/security-2026-10`, autorizado)

Validación previa del propietario en el Preview `d30c02c`: QUELVO 200 sin suspensión, `/copy.zip` y `/supabase-setup.sql` 404, cabeceras presentes, OneSound abierto.
Autorización: commit y push **sólo** a `hotfix/security-2026-10`. Sin `main`, producción, Supabase, SQL, Render, OneSound, Survivor, DNS.

### Cambio
Commit `4ef6506` chore(hotfix): keep legal pages and 404 as in production (temporary) — worktree aparte:
- `jcdmtech/privacy.html`, `jcdmtech/terms.html` ← versiones de `29c4b6f` (blobs `ce65830…`, `8e48261…` idénticos a producción).
- `jcdmtech/404.html` retirado (no existía en `29c4b6f`; ningún archivo lo referencia). Vercel sirve su 404 estándar, como hoy en producción.
- **Temporal:** los textos legales completos (`4d0350a`) y la 404 (`569df74`) siguen en el historial de `main`. Reincorporación: `git revert 4ef6506` en `main` cuando se aprueben. Riesgo documentado: hasta entonces, cualquier fusión entre `main` y la rama de mantenimiento mantendrá la retirada sin conflicto (la rama de mantenimiento no tocó esos archivos tras `4d0350a`) ⇒ revisar esos 3 archivos tras cada fusión.

### Diferencia del sitio publicado respecto a producción (`29c4b6f`)
Sólo seguridad: `login.html` (import + `safeNext`), `js/safe-next.js`, `vercel.json` (`headers`), `.vercelignore`, retirada de `copy.zip` y `supabase-setup.sql`. Fuera de la raíz publicada: `.gitignore`, `archive/`, `supabase/legacy/`, `scripts/tests/safe-next.test.mjs`.

### Pruebas (locales)
| Prueba | Resultado |
|---|---|
| `npx vercel@64.5.0 build` | OK; 52 estáticos; sin `.zip`/`.sql`/`404.html`; 22 redirects; cabeceras; sin middleware; ruta de error estándar de Vercel |
| Páginas legales vs. `29c4b6f` y producción | idénticas (blob Git y contenido; la diferencia de MD5 local era sólo CRLF de `core.autocrlf`) |
| Chrome headless (`tools/e2e-hotfix.mjs` + 6 comprobaciones R1) | **139/139**; control con el build anterior (textos nuevos + 404 personalizada): las 6 de R1 fallan |
| Script de consola del Preview, en local | 78/78; control 74/78 |
| Unitarias `safe-next`, `node --check`, enlaces, credenciales `main..4ef6506` | 4/4; OK; sólo `safari-pinned-tab.svg` (conocido); 0 |

### Vercel Preview
`success` — `https://jcdmtech-site-plc4kclv7-juanks-projects-50846d74.vercel.app` (deployment GitHub `7184394348`), protegido (302 a `vercel.com/sso-api`). Revisión en el Preview pendiente del propietario (script de consola R1 78/78 en local).
Remoto: `main` `4d0350a`, mantenimiento `c10ce02`, hotfix `4ef6506`. Producción sin cambios (`/copy.zip` y `/supabase-setup.sql` aún 200 en producción). OneSound 200. Survivor sin peticiones.

---

## 2026-10-19 — PUBLICACIÓN EN PRODUCCIÓN del hotfix de seguridad R1 (autorizada: sólo `4ef6506`)

Autorización expresa del propietario tras revisar el Preview `4ef6506` (78/78 PASS) y las 139 pruebas locales.

### Verificaciones previas
- `git fetch`: `origin/main` = `4d0350a`, `origin/hotfix/security-2026-10` = `4ef6506`, `origin/maintenance/quelvo-onesound` = `c10ce02`. Fast-forward `4d0350a → 4ef6506` confirmado (`merge-base --is-ancestor`).
- Commits `main..4ef6506`: `324ecfc`, `fee2858`, `c9611e1`, `d30c02c`, `4ef6506` (los autorizados).
- Sitio publicado vs. producción anterior (`29c4b6f`): sólo `.vercelignore` (A), `js/safe-next.js` (A), `login.html` (M: `safeNext`), `vercel.json` (M: `headers`), `copy.zip` y `supabase-setup.sql` (D). `privacy.html`/`terms.html`: blobs idénticos a `29c4b6f`. Sin `404.html`, middleware, `maintenance.config.js`, `maintenance/`, marcado `data-maint`, migraciones ni `docs/private`. 22 redirects idénticos a producción. 0 coincidencias de credenciales.
- Punto de recuperación: despliegue de producción de `29c4b6f` — GitHub deployment `5259892954`, Vercel `jcdmtech-site-vewbk2hqt-juanks-projects-50846d74.vercel.app` (`success`). `569df74`/`4d0350a` habían fallado (no válidos). Sin CLI de Vercel autenticada en esta máquina ⇒ un Instant Rollback lo ejecutaría el propietario desde el panel.

### Publicación
- `git push origin 4ef6506…:refs/heads/main` → `4d0350a..4ef6506` (fast-forward, sin force). GitHub API: `main` = `4ef65060be583ddda4aa701d17907e0482886208`.
- Vercel: deployment de **producción** GitHub `7185173081` → `success`; URL `jcdmtech-site-2yxoa5uov-juanks-projects-50846d74.vercel.app`; inspector `9Gr9tUtcAZ4zS8u3B2ArZXUSvN9t`. `www.jcdmtech.com` sirve el contenido nuevo (cabeceras y `safe-next.js` presentes).

### Comprobaciones en producción (sólo lectura)
- HTTP/cabeceras/redirects (`tools/prod-check.sh`): **110/110** — 21 rutas 200 (Home, Services, Projects, About, Contact, Login, QUELVO, `/quelvo/book/`, Music Ride, legales, cuenta, admin…); `/copy.zip`, `/supabase-setup.sql`, `/.vercelignore`, `/vercel.json`, `/middleware.js`, `/maintenance/quelvo/`, `/js/maintenance.config.js`, `/404.html` → 404; ruta desconocida → 404 estándar de Vercel; 22 redirects correctos; en 6 páginas: nosniff, XFO DENY, Referrer-Policy, Permissions-Policy, CSP **Report-Only** (sin CSP aplicada), HSTS; `login.html` usa `safeNext`; legales idénticas a `29c4b6f`; QUELVO con "Book a Ride" y wizard; sin avisos de mantenimiento; enlace a `https://music-ride.jcdmtech.com/`; 4 secciones de servicios; OneSound app 200 y `/health` ok.
- Navegador contra `https://www.jcdmtech.com` (tráfico externo bloqueado, supabase-js simulado, sin envíos): **139/139**.
- Supabase (`list_projects`, lectura): `jcdmtech-prod` y `quelvo-prod` INACTIVE.

### Rollback
No necesario.

### Estado activo en producción
Corregido y desplegado: J-03 (`next` del login), J-04 (archivos internos), J-05 (cabeceras; CSP en Report-Only).
**No** corregido: J-01/J-02/J-06 (roles/RLS de Supabase; migración sólo en la rama de mantenimiento, sin aplicar). Mantenimiento de QUELVO no activado. Textos legales nuevos no publicados (retirada temporal `4ef6506`).

---

## 2026-10-19 — Organización de Git y documentación posterior al hotfix (sólo documentación local)

Autorización: modificaciones locales de documentación y comprobaciones seguras. **Sin** commit, push, merge, cambios en
`main`, Vercel, Supabase, SQL, OneSound, DNS ni Survivor.

### Estado de Git (tras `git fetch origin`)
| Ref | Commit | ¿Coincide con lo esperado? |
|---|---|---|
| `origin/main` | `4ef6506` | sí |
| `hotfix/security-2026-10` / `origin/…` | `4ef6506` / `4ef6506` | sí |
| `maintenance/quelvo-onesound` / `origin/…` | `c10ce02` / `c10ce02` | sí |
| `main` **local** | `4d0350a` | **no** — 5 commits detrás de `origin/main`, sin divergencia |

Causa revisada: el push de producción fue `4ef6506:refs/heads/main` desde el worktree del hotfix; la rama local `main` no se
movió. No es un problema del remoto; no se corrigió (cambiar `main` no estaba autorizado). Un único worktree; sin stash.
Pendientes previos: `docs/IMPLEMENTATION_LOG.md`, `docs/PROJECT_STATUS.md`. Ignorados a preservar: `docs/private/`
(`ONESOUND_SECURITY_PLAN.md`), `.claude/settings.local.json`.

### Copia de seguridad (antes de editar)
Scratchpad `backup-2026-10-19/`: ambos documentos (SHA-256 idénticos al original), `uncommitted.diff` (157 líneas) y
`docs/private/`. Ruta completa en `PROJECT_STATUS.md` §0d.

### Simulación de integración `main` → mantenimiento (sin tocar refs)
- `git merge-tree --write-tree maintenance/quelvo-onesound origin/main` → exit 0, **sin conflictos** (árbol `e0ec7f2`).
- Cambios respecto a `c10ce02`: sólo `jcdmtech/404.html` (eliminado), `privacy.html`, `terms.html` (versiones de `29c4b6f`).
- `vercel.json`, `.vercelignore`, `login.html`, `js/safe-next.js` idénticos en ambas ramas; middleware, flags, página de
  mantenimiento, migración RLS, `docs/sql/` y pruebas sin cambios.
- Reversión de `4ef6506` simulada (`merge-tree --merge-base=4ef6506 … 4ef6506^`) sobre `origin/main` y sobre un commit de
  fusión simulado (objeto suelto creado con `commit-tree`, **sin ref**; lo limpiará `git gc`): limpia en ambos casos;
  restaura los blobs `4f7f7ba` (privacy), `9169e1c` (terms), `616111d` (404) de `4d0350a`/`569df74`.
- Hallazgo: `maintenance.config.js` tiene `quelvo.maintenance: true` y `onesound.maintenance: true` ⇒ fusionar la rama en
  `main` activaría la suspensión en producción. Documentado como regla en `CLAUDE.md` y en `PROJECT_STATUS.md` §0b.

### Documentos actualizados
`CLAUDE.md` (§2 producción = `4ef6506`; reglas de ramas y legales), `PROJECT_STATUS.md` (cabecera, estado por nivel,
§0b sincronización, §0c legales, §0d backups, bloqueos B-6…B-10, próximo paso), `PROJECT_CONTEXT.md`, `PROJECT_AUDIT.md`
(R-22 resuelto; J-03/J-04/J-05 en producción), `TODO.md`, `MAINTENANCE_MODE.md` (estado, paso 3′, R-M9 resuelto),
`CHANGELOG.md`, y por coherencia `DECISIONS.md` (D-014/D-015 en producción; nueva D-017), `SECURITY_REMEDIATION.md`,
`ROUTES.md`. Contenido previo conservado: los estados superados se marcan como históricos en lugar de borrarse.

### Comprobaciones
`git diff --check`; recuento de líneas eliminadas por archivo; escaneo de credenciales en el diff; refs sin cambios.
Resultados en el informe de la sesión.
