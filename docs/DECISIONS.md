# Decisiones técnicas (ADR ligero)

Formato: ID · fecha · estado (Vigente / Propuesta / Reemplazada) · decisión · motivo · consecuencias.
Para cambiar una decisión vigente, añadir una nueva que la reemplace; no borrar las anteriores.

Las decisiones D-001…D-008 se reconstruyen de la documentación de junio 2026 y del historial Git; su fecha es la del commit o documento de origen.

---

### D-001 · 2026-06-11 · Vigente — Sitio estático sin framework
- **Decisión:** HTML/CSS/JS vanilla, sin React/Next ni paso de build.
- **Motivo:** simplicidad, velocidad, hosting estático gratuito, un solo mantenedor.
- **Consecuencias:** sin componentes ni tests de unidad; lógica inline por página; reutilización vía partials.

### D-002 · 2026-06-11 · Vigente — Supabase como backend
- **Decisión:** Auth y datos (profiles, vehicles, drivers, bookings) en Supabase, consumido desde el cliente con anon key + RLS.
- **Motivo:** sin servidor propio.
- **Consecuencias:** la seguridad depende por completo de las políticas RLS (ver R-01, R-02).
- **Nota:** proyecto migrado a `nrmajnnfejafbtkpvpob` (commit `ac73233`).

### D-003 · 2026-06-11 · Vigente — Partials por `fetch()`
- **Decisión:** header/footer en `/partials/*.html` inyectados por `js/app.js`.
- **Consecuencias:** requiere servidor HTTP en local; el header llega tras el primer render (posible parpadeo); SEO del nav depende de JS.

### D-004 · 2026-06-11 · Vigente — Vercel + `vercel.json`
- **Decisión:** hosting en Vercel, redirects declarativos. Push a `main` = despliegue a producción.

### D-005 · 2026-06 (commit `9af8089`) · Vigente — Nombres de archivo en inglés
- **Decisión:** renombrar páginas en español a inglés (`contacto.html` → `contact.html`, etc.) con redirects 308.

### D-006 · 2026-06 · Vigente — Marca QUELVO bajo `/quelvo/`
- **Decisión:** QUELVO sustituye "Chofer privado"; vive en `/quelvo/*`, comparte sistema de diseño global con énfasis premium. `/chofer-privado/*` se mantiene sólo como redirects.

### D-007 · 2026-06 (commit `522f732`) · Vigente — Reserva persistida en Supabase con precio en cliente
- **Decisión:** el wizard `/quelvo/book/` calcula precio con Google Distance Matrix en el navegador e inserta en `bookings`; el admin confirma y fija `admin_price`.
- **Consecuencias:** el precio es una estimación manipulable (R-05); no hay pagos ni notificaciones automáticas en el repo.
- **Reemplaza parcialmente:** el flujo WhatsApp/Formspree de `booking.js` (ahora legado).

### D-008 · 2026-06-30 · Vigente — Tema oscuro e inglés por defecto, conmutadores en el header
- **Decisión:** `dark` + `en` por defecto; preferencia en `localStorage` y en `profiles.theme/lang` si hay sesión; traducción mediante `data-es`.

---

## Decisiones tomadas en Fase 1 (2026-10-19)

### D-009 · 2026-10-19 · Vigente — Evolución incremental, sin reescritura
- **Decisión:** las fases 2–8 modernizan sobre la base actual (D-001…D-008). Introducir un framework o build requiere una decisión nueva aprobada por el propietario.
- **Motivo:** el sitio funciona y está en producción; no hay tests que protejan una migración.

### D-010 · 2026-10-19 · Vigente — Rutas de reserva y Music Ride congeladas
- **Decisión:** `/quelvo/book/`, `/music-ride/`, `https://music-ride.jcdmtech.com`, `/qrcard.html` y los redirects legados no cambian de URL durante el rediseño.
- **Motivo:** enlaces externos, QR impresos y SEO.

### D-011 · 2026-10-19 · Vigente — Documentación con hechos vs. planes
- **Decisión:** toda la documentación marca [VERIFICADO] / [PLANIFICADO] / [POR VALIDAR]. Ningún texto público afirmará funcionalidades no implementadas.

### D-012 · 2026-10-19 · Vigente — `docs/` + `CLAUDE.md` como fuente de verdad
- **Decisión:** `AI_PROJECT_CONTEXT.md` queda como histórico; no se borra.

### D-013 · 2026-10-19 · Vigente — Suspensión temporal de plataformas por flags, sin borrar nada
- **Decisión:** QUELVO y OneSound se suspenden con un modo mantenimiento reversible: flags en `jcdmtech/js/maintenance.config.js`, 503 + `Retry-After` vía `jcdmtech/middleware.js` (sin redirecciones), bloqueo real de nuevas reservas con un trigger en `bookings` (`docs/sql/quelvo-maintenance.sql`), y para OneSound un flag `MAINTENANCE_MODE` en su propio backend (otro repo).
- **Motivo:** el propietario se concentra en Survivor Sports; las plataformas deben poder reactivarse sin reconstruir ni perder datos. Ocultar enlaces no basta: la anon key permite insertar en `bookings` y la API de OneSound es pública.
- **Consecuencias:** introduce el primer middleware de Vercel del sitio (validar en Preview). No modifica D-010: las URLs no cambian, sólo responden 503 mientras dure la pausa. Procedimiento: `docs/MAINTENANCE_MODE.md`.
- **Rev. 2 (2026-10-19):** flag único `maintenance` (true = suspendido) en JS y SQL; middleware con `runtime: "nodejs"` y sin `package.json` (el builder compila ESM→CJS); tabla SQL `jcdm_maintenance_flags`. Se descarta añadir `package.json` o `@vercel/functions` sólo para `next()`.

---

### D-014 · 2026-10-19 · Vigente (en producción desde `4ef6506`; antes: en rama, sin desplegar) — Cabeceras de seguridad y CSP progresiva
- **Decisión:** cabeceras globales en `vercel.json` (`nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`) y CSP primero en **Report-Only** con los orígenes del inventario. El 503 del middleware repite las básicas.
- **Motivo:** J-05 de la auditoría; la CSP en modo informe no puede romper Maps, Supabase, Formspree ni GA.
- **Consecuencias:** se mantiene `'unsafe-inline'` (JS inline y `onclick`); pasar a CSP bloqueante requiere revisar violaciones en Preview/producción y, para que proteja frente a XSS, sacar el JS inline (fase posterior).

### D-015 · 2026-10-19 · Vigente (en producción desde `4ef6506`; antes: en rama, sin desplegar) — SQL y archivos internos fuera de la raíz publicada
- **Decisión:** SQL en `supabase/` (`legacy/` histórico, `migrations/` nuevas) y archivos sueltos en `archive/`; `jcdmtech/.vercelignore` como segunda barrera.
- **Motivo:** J-04 (`/copy.zip`, `/supabase-setup.sql` públicos).
- **Consecuencias:** el repositorio es público: lo que esté en `supabase/` y `docs/` sigue visible en GitHub; no versionar secretos ni detalles de explotación.

### D-016 · 2026-10-19 · Propuesta (preparada, no aplicada) — Conjunto cerrado de políticas RLS
- **Decisión:** la migración de seguridad sustituye **todas** las políticas de `profiles`, `bookings`, `vehicles`, `drivers` (tras guardarlas) por un conjunto conocido; permisos por columna; `role` nunca editable desde la API; `public.is_admin()` `SECURITY DEFINER` en lugar de la política recursiva.
- **Motivo:** las políticas permisivas se suman (OR): una antigua desconocida reabriría el acceso. Esquema remoto no versionado (R-01).
- **Requiere:** restaurar Supabase y ejecutar el procedimiento de `docs/SECURITY_REMEDIATION.md` §4.4 con autorización.

### D-017 · 2026-10-19 · Vigente (en producción) — Hotfix de seguridad independiente y retirada temporal de legales/404
- **Decisión:** publicar la seguridad web (J-03/J-04/J-05 + `vercel.json` válido) desde la rama `hotfix/security-2026-10`, sin la suspensión ni la migración; mantener `privacy.html`/`terms.html` como en `29c4b6f` y retirar `404.html` (`4ef6506`) hasta su revisión.
- **Motivo:** corregir producción sin activar la suspensión y sin publicar textos legales no revisados (aprobado por el propietario, opción R1).
- **Consecuencias:** `main` contiene un commit de retirada que una fusión hacia la rama de mantenimiento adopta sin conflicto. Reincorporación sólo con `git revert 4ef6506` tras aprobación (`docs/PROJECT_STATUS.md` §0c). La sincronización entre ramas es `main` → mantenimiento; la inversa publica la suspensión.

## Decisiones propuestas (pendientes de aprobación)

### P-001 · Lenguaje visual principal
- **Propuesta:** adoptar el estilo premium oscuro de Home/QUELVO como sistema único, consolidando tokens en `styles.css` (ver `DESIGN_SYSTEM.md` §5).
- **Decidir en:** inicio de Fase 2.

### P-002 · Estrategia de URL
- **Propuesta:** opciones A/B en `ROUTES.md` §6. **Decidir en:** Fase 8.

### P-003 · Esquema Supabase versionado — **parcialmente aplicada (2026-10-19, D-015)**
- **Propuesta:** carpeta `supabase/` en la raíz del repo con el esquema real exportado; retirar `jcdmtech/supabase-setup.sql` del directorio público.
- **Requiere:** acceso al proyecto Supabase (la conexión MCP falló en Fase 1). **Decidir en:** antes de Fase 4.

### P-004 · Integración Music Ride ↔ QUELVO
- **Propuesta:** integración por enlace (p. ej. botón en confirmación/gracias que abre `music-ride.jcdmtech.com`), sin cambios en la app externa ni en el esquema hasta conocer su API.
- **Decidir en:** Fase 5, con información del propietario sobre la app.

### P-005 · Correo de contacto oficial
- **Propuesta:** elegir entre `contacto@jcdmtech.com` e `info@jcdmtech.com`. **Decidir en:** Fase 7.
