# TODO — Plan de modernización en 8 fases

> Actualizado: 2026-10-19. La lista de junio 2026 se conserva al final (§10) con su estado real.
> Cada fase: objetivo · dependencias · riesgos · criterios de aceptación · pruebas · tareas.
> Regla general: ninguna fase incluye `git push` ni despliegue sin autorización explícita.

---

## Fase 1 — Auditoría y documentación ✅ (2026-10-19)

- [x] Inventario de archivos, rutas, dependencias, formularios, reservas, Music Ride, SEO, estilos
- [x] Comprobación de producción (sólo lectura)
- [x] `CLAUDE.md` + 11 documentos en `docs/`
- [ ] Verificar esquema y RLS de Supabase — **bloqueado** (timeout del MCP); se traslada a pre-Fase 4

---

## Fase 2 — Rediseño de Home

- **Objetivo:** Home que presente JCDM como empresa tecnológica con los 5 servicios, QUELVO y Music Ride, sobre un sistema de diseño consolidado.
- **Dependencias:** aprobación de P-001 (lenguaje visual); textos validados por el propietario; Fase 1.
- **Riesgos:** romper header/footer compartidos (IDs usados por `app.js`); regresión del toggle ES/EN (`data-es`) y del tema claro; LCP por imágenes PNG; promesas no verificadas (R-06).
- **Criterios de aceptación:**
  - Los 5 servicios visibles con enlace a su destino real (`/services/#…`, `/quelvo/`).
  - Sin afirmaciones no validadas (precios, integraciones, plazos).
  - Tokens de Home en `styles.css` (sin `--jh-*`).
  - Imagen hero < 300 KB (WebP/AVIF) con `fetchpriority="high"`.
  - `prefers-reduced-motion` respetado.
  - ES/EN completo en Home; tema claro legible.
  - Sin cambios en `/quelvo/book/`, auth ni admin.
- **Pruebas:** `node --check`; script de enlaces; revisión visual a 375 / 768 / 1280 px; toggle ES/EN y tema; consola sin errores; navegación con teclado; Lighthouse local (rendimiento, accesibilidad, SEO) antes/después; comprobar que services, about, admin y login no cambiaron visualmente si se tocó `styles.css`.
- **Tareas:** ver plan detallado en `PROJECT_STATUS.md` §4.

## Fase 3 — Services

- **Objetivo:** página de servicios clara para las 4 líneas técnicas + QUELVO como quinta línea.
- **Dependencias:** Fase 2 (sistema de diseño); lista validada de servicios/tecnologías que realmente se ofrecen.
- **Riesgos:** anclas `#web`, `#automation`, `#smarthome`, `#support` enlazadas desde footer y Home; afirmar Stripe/React Native/pagos sin validación; decisión subpáginas vs. anclas (afecta sitemap y redirects legado `/domotica` etc.).
- **Criterios:** cada servicio con descripción, entregables, tecnologías validadas y CTA a contacto con el servicio preseleccionado; anclas preservadas o redirigidas; `data-es` completo.
- **Pruebas:** enlaces desde footer/Home a cada ancla; CTA → `/contact.html` con valor de `service` correcto; responsive; accesibilidad de encabezados (un `h1`, jerarquía).

## Fase 4 — QUELVO y experiencia de reservas

- **Objetivo:** experiencia premium de reserva inspirada funcionalmente en Blacklane (pasos, clases, precio previo) con identidad propia, más segura y accesible.
- **Dependencias (bloqueantes):** acceso al esquema y RLS reales de `bookings` (P-003); confirmación de tarifas, zonas y servicios (aeropuertos, eventos, city-to-city); decisión sobre notificaciones (email/WhatsApp al admin y al cliente) y vista "Mis reservas".
- **Riesgos:** perder reservas reales; cambiar columnas usadas por el admin; zona horaria (R-04); precio manipulable (R-05); spam (R-09); imágenes pesadas; accesibilidad del wizard (R-11); no hay staging (R-12).
- **Criterios:**
  - Mismo contrato de datos con `bookings` (o migración documentada y aplicada con autorización).
  - `pickup_at` almacenado en hora de Miami (America/New_York) independientemente del navegador.
  - Wizard operable con teclado, `label for`, foco gestionado entre pasos, errores anunciados (`aria-live`).
  - Textos de confirmación coherentes con lo que realmente ocurre.
  - Admin sigue listando y editando reservas nuevas.
- **Pruebas:** cálculo de precio con casos tabulados (transfer corto, mínimo, >50 mi, por horas bajo mínimo); reserva de prueba **sólo** con autorización y marcada para borrar; verificación en admin; zona horaria simulada (navegador en otra TZ); teclado; móvil 375 px.

## Fase 5 — Integración de Music Ride

- **Objetivo:** presentar Music Ride como producto propio y como experiencia para pasajeros QUELVO, sin alterar la app.
- **Dependencias:** información del propietario sobre la app (cómo se crea una sesión, si acepta parámetros, quién es host); Fase 4.
- **Riesgos:** romper la app externa o sus URLs; prometer "cada viaje incluye Music Ride" sin proceso real; landing sólo en español.
- **Criterios:** landing bilingüe con canonical correcto (`/music-ride/`); enlaces a `music-ride.jcdmtech.com` intactos; bloque Music Ride en QUELVO con texto validado; cualquier vínculo reserva↔sesión documentado y opcional.
- **Pruebas:** `curl -I` a la app antes/después (200); todos los enlaces Music Ride; ES/EN; responsive.

## Fase 6 — Projects

- **Objetivo:** portafolio fiel de productos y sistemas.
- **Dependencias:** Fases 4–5 (descripciones de QUELVO y Music Ride actualizadas); validación del stack de cada proyecto.
- **Riesgos:** descripciones desactualizadas (hoy dice que la reserva usa WhatsApp/Formspree); exponer detalles internos de sistemas privados.
- **Criterios:** cada proyecto con estado real (Live / Internal), stack validado, sin datos sensibles; ES/EN.
- **Pruebas:** enlaces; contenido revisado por el propietario; responsive.

## Fase 7 — About, Contact y Footer

- **Objetivo:** información corporativa coherente y canal de contacto único.
- **Dependencias:** P-005 (email oficial); Fase 3 (lista de servicios para el `<select>`).
- **Riesgos:** romper Formspree (`name` de campos, honeypot); footer compartido por todas las páginas; anclas de servicios.
- **Criterios:** un solo email en todo el sitio; formulario envía y muestra éxito/error; footer con enlaces válidos y versión; ES/EN.
- **Pruebas:** envío real de contacto sólo con autorización; script de enlaces; revisión de footer en todas las páginas.

## Fase 8 — SEO, rutas, responsive, accesibilidad y pruebas finales

- **Objetivo:** cierre técnico.
- **Dependencias:** Fases 2–7; decisión P-002.
- **Riesgos:** redirects que rompen QR/enlaces externos; cambios de canonical que afectan indexación; sólo verificable en Vercel.
- **Tareas candidatas:** canonicals coherentes; redirects de stubs con barra final; `noindex` o redirect de stubs; sitemap con lastmod y páginas legales; robots (`/account.html`, `/reset-password.html`); OG por página; JSON-LD (Organization, LocalBusiness/TaxiService para QUELVO); retirar `copy.zip`, `supabase-setup.sql`, `supabase.client.js` del público; `safari-pinned-tab.svg`; fijar versión supabase-js; validar `next` en login (si no se hizo antes); cabeceras de seguridad (CSP, etc.) en `vercel.json`; breakpoints; auditoría WCAG 2.1 AA.
- **Criterios:** 0 enlaces rotos; todas las rutas de `ROUTES.md` con el código esperado en un Preview de Vercel; Lighthouse ≥ 90 en accesibilidad y SEO en páginas principales; sin errores de consola.
- **Pruebas:** batería `curl -I` sobre todas las rutas en Preview; Lighthouse; teclado y lector de pantalla en Home, QUELVO y reserva; móvil real.

---

## Suspensión temporal de QUELVO y OneSound (D-013, 2026-10-19)

Fuera del plan de 8 fases; las fases 4 (QUELVO) y 5 (Music Ride) quedan **en pausa** mientras dure la suspensión.

- [x] Auditoría de plataformas, hosting y dependencias con Survivor
- [x] Mecanismo de flags + middleware 503 + página de mantenimiento + marcado del sitio (local)
- [x] SQL de bloqueo de reservas preparado (`docs/sql/quelvo-maintenance.sql`)
- [x] Plantilla de pantalla OneSound y diseño del flag de backend (`docs/MAINTENANCE_MODE.md` §3)
- [x] Pruebas locales (Node + Chrome headless, activado y desactivado)
- [x] Revisión técnica rev. 2: runtime del middleware, flag inequívoco, SQL con preflight + prueba en seco (PGlite 19/19), `vercel build` local, otros canales QUELVO, script de verificación
- [x] Commits `70479ca` + `abc90c8` y push a `maintenance/quelvo-onesound` (autorizado)
- [x] Pruebas de navegador locales del commit (Puppeteer, 39/39: productos visibles con avisos, 4 servicios, menú móvil, EN/ES)
- [x] **R-M9:** `vercel.json` corregido en la rama con la opción B (autorizado): sin `errors`, `cleanUrls`, `trailingSlash`; idéntico a `29c4b6f`; `vercel build` local OK
- [x] Preview de `fd31034` compila (`success`) — causa en `vercel.json` confirmada por resultado
- [ ] Token de bypass del Preview fuera del repo (`MAINTENANCE_MODE.md` §6.1)
- [x] Repetir Preview (`c10ce02`): revisado por el propietario con su sesión — QUELVO 503 + `Retry-After`, cabeceras, archivos internos 404 *(el script con bypass sigue pendiente)*
- [ ] **Autorización:** sincronizar `main` (`4ef6506`) → rama de mantenimiento (`PROJECT_STATUS.md` §0b; simulación sin conflictos)
- [ ] **Autorización:** publicar la suspensión en producción (llevar la rama a `main`; **activa el 503 de QUELVO y oculta OneSound** porque los flags están en `true`); script contra producción
- [ ] **Autorización:** restaurar Supabase `jcdmtech-prod` (después del despliegue web) y confirmar plazo de restauración
- [ ] **Autorización:** preflight + `quelvo-maintenance.test.sql` + instalación de `docs/sql/quelvo-maintenance.sql`
- [ ] **Autorización + acceso:** OneSound — repo `jcdm-music-ride`, Render y Vercel (§3.1)
- [ ] Confirmar que no hay backend de OneSound activo en Railway
- [ ] Al reactivar: seguir §6 de `docs/MAINTENANCE_MODE.md`

## Seguridad — remediación (2026-10-19, `docs/SECURITY_REMEDIATION.md`)

- [x] J-03 validación de `next` en el login (local, probado)
- [x] J-04 `copy.zip` y `supabase-setup.sql` fuera de la raíz publicada + `.vercelignore` (local, probado)
- [x] J-05 cabeceras de seguridad, CSP en Report-Only (local, probado)
- [x] J-01/J-02/J-06 migración de roles/RLS preparada y probada en PGlite (**no aplicada**)
- [x] Commits en la rama + Preview (`c10ce02`) y hotfix independiente `hotfix/security-2026-10` + Preview (`4ef6506`) — revisados por el propietario
- [x] **Producción (2026-10-19):** hotfix R1 `4ef6506` (J-03, J-04, J-05; sin suspensión, sin legales nuevos ni 404) — 110/110 HTTP, 139/139 navegador *(sustituye a la idea anterior de "merge de la rama a `main`", que habría publicado también `569df74`, `4d0350a` y la suspensión)*
- [ ] Revisar violaciones reales de la CSP Report-Only en producción (Maps/GA)
- [ ] Decidir el tratamiento de `archive/copy.zip` y `supabase/legacy/supabase-setup.sql` en el repositorio público (ya no se sirven; siguen en árbol e historial). No borrar sin autorización
- [ ] Supabase: restaurar → preflight → migración → verify → pruebas de login/cuenta/admin (§4.4)
- [ ] CSP bloqueante (tras revisar violaciones; sacar JS inline para quitar `unsafe-inline`)
- [ ] Pendientes de auditoría: fijar versión de supabase-js (R-13), restricción de claves de Maps/YouTube en Google Cloud, escape en `buildSummary()` (R-15), anti-spam en reservas y contacto, PKCE, monitorización y alertas
- [ ] OneSound O-01…O-05 (fase independiente; requiere ventana de bajo uso porque el redeploy cierra sesiones)

## 9. Pendientes transversales / bloqueos

- [x] **Seguridad (recomendado antes de Fase 2, como hotfix aislado):** validar `next` en `login.html` (sólo rutas relativas que empiecen por `/` y no por `//`) — R-03. *Publicado en producción (`4ef6506`, 2026-10-19).*
- [ ] **Textos legales y 404** retirados temporalmente en `4ef6506`: revisión legal (incluido email `info@` vs `contacto@`) → reincorporar con el procedimiento de `PROJECT_STATUS.md` §0c.
- [ ] Alinear la rama local `main` con `origin/main` (`git merge --ff-only origin/main`; hoy 5 commits detrás) — sólo con autorización.
- [ ] Obtener esquema y políticas RLS reales de Supabase (reintentar MCP o exportar desde el panel) — R-01, R-02, R-08.
- [ ] Confirmar restricción por referrer de la API key de Google Maps — R-14.
- [ ] Validar con el propietario la lista de afirmaciones [POR VALIDAR] (`PROJECT_AUDIT.md` §6, R-06).
- [ ] Decidir email oficial (P-005).
- [ ] Revisar `.claude/settings.local.json` (`git push *` permitido) — R-20.

---

## 10. Lista de junio 2026 — estado real

| Tarea original | Estado 2026-10-19 |
|---|---|
| Rediseñar index.html como Home tecnológica | Hecho (`75c8a5c`, `29c4b6f`); se refina en Fase 2 |
| Actualizar header/footer | Hecho |
| CSS: services grid, platform cards, why | Hecho |
| Crear `quelvo/index.html` | Hecho |
| Crear `quelvo/book/index.html` multi-paso | Hecho (`522f732`) |
| Crear `services/`, `projects/` | Hecho |
| Actualizar about y contact | Hecho (como `about.html`, `contact.html`) |
| vercel.json y sitemap con nuevas rutas | Hecho (revisar en Fase 8) |
| Teléfono inconsistente | Hecho |
| 404 | Hecho en el repo (`569df74`); **no publicada** (retirada temporal `4ef6506`) |
| robots.txt | Parcial (Fase 8) |
| Music Ride como feature de QUELVO | Parcial (Fase 5) |
| Privacidad / Términos completos | Hecho en el repo (`4d0350a`); **no publicados** (retirada temporal `4ef6506`, pendiente de revisión legal) |
| Blog con posts | Pendiente — fuera del plan |
| Stubs domotica/software/automatizaciones → /services/ | Parcial: sin barra redirige; con barra sirve stub (Fase 8) |
| Persistir códigos de reserva | Hecho (tabla `bookings`) |
| Páginas `/quelvo/airport/`, `/hourly/`, `/business/`, `/city-to-city/` | Pendiente — evaluar en Fase 4 |
| Detalle de Financial Automation / Smart Home en Projects | Parcial (Fase 6) |
| og:image por página | Pendiente (Fase 8) |
| Toggle EN/ES | Hecho parcialmente (Fases 2–7) |
| Automatizar `__SITE_VERSION__` | Pendiente (sigue `booking-ux-01` fijo) |
| CSP en vercel.json | Pendiente (Fase 8) |
| JSON-LD en páginas nuevas | Pendiente (Fase 8) |
| Verificar RLS | Pendiente — bloqueado |
| 2FA para admin | Pendiente — fuera del plan |
| GA4 `?debug=1` accesible | Persiste sólo en páginas legado (`chofer-privado/reservar.html`, `chofer-privado/gracias.html`), ambas redirigidas en producción; se resuelve al retirar el legado (Fase 8) |
