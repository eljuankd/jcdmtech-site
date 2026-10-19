# Rutas — existentes y planificadas

> Actualizado: 2026-10-19 (Fase 1). La versión de junio 2026 listaba como "por crear" rutas que ya existen
> y usaba nombres en español (`contacto.html`, `nosotros.html`…) que hoy son redirects. Esta versión la reemplaza.
>
> Códigos HTTP **medidos en producción** el 2026-10-19 con `curl` (sin seguir redirects).

---

## 1. Rutas públicas existentes [VERIFICADO]

| Ruta | Archivo | HTTP | Propósito | Notas |
|---|---|---|---|---|
| `/` | `index.html` | 200 | Home JCDM Technologies | Rediseño "Blacklane-style" (jun. 2026); `data-es` ✔ |
| `/services/` | `services/index.html` | 200 | 4 servicios técnicos | `/services` → 308 → `/services/`; sin `data-es` |
| `/projects/` | `projects/index.html` | 200 | Productos propios y sistemas internos | sin `data-es` |
| `/quelvo/` | `quelvo/index.html` | 200 | Landing QUELVO | `data-es` ✔ |
| `/quelvo/book/` | `quelvo/book/index.html` | 200 | Wizard de reserva (Supabase) | **Protegida** |
| `/quelvo/book/gracias/` | `quelvo/book/gracias/index.html` | 200 | Gracias del flujo legado (`booking.js`) | `noindex` |
| `/music-ride/` | `music-ride/index.html` | 200 | Landing Music Ride | `/music-ride` también 200; canonical sin barra; sólo ES |
| `/about.html` | `about.html` | 200 | Sobre la empresa | `/about` → 308 → `/about.html`; `/about/` → **404** |
| `/contact.html` | `contact.html` | 200 | Formulario Formspree + contacto directo | |
| `/privacy.html` | `privacy.html` | 200 | Política de privacidad | Fuera del sitemap |
| `/terms.html` | `terms.html` | 200 | Términos | Fuera del sitemap |
| `/qrcard.html` | `qrcard.html` | 200 | Tarjeta QR + vCard | `/qrcard` → 308; **no cambiar** (QR impresos) |
| `/blog/` | `blog/index.html` | 200 | Stub | En sitemap |
| `/404.html` | `404.html` | 404 en rutas inexistentes | Página de error | `noindex,follow` |
| `/sitemap.xml`, `/robots.txt` | | 200 | | |

### 1.1 Modo mantenimiento (D-013) — comportamiento esperado al activarlo [PREPARADO, no desplegado]

| Ruta | Hoy en producción | Con `quelvo.maintenance = true` desplegado |
|---|---|---|
| `/quelvo/`, `/quelvo/book/`, `/quelvo/book/gracias/` | 200 | **503** + `Retry-After: 86400`, cuerpo = página de mantenimiento (misma URL, sin redirect) |
| `/chofer-privado/`, `/chofer-privado/*` | 200 / 307 / 308 | **503** (o redirect existente → destino en 503) |
| `/maintenance/quelvo/` | 404 (no existe aún) | 200, `noindex` |
| `/admin/`, `/login.html`, `/account.html`, resto del sitio | 200 | 200 (no afectados) |
| `https://music-ride.jcdmtech.com` | 200 | 200 — **sin cambios** hasta aplicar el mantenimiento en el repo de OneSound |

Procedimiento: `docs/MAINTENANCE_MODE.md`. Comprobación automática: `scripts/verify-maintenance.sh <url>`.

> ⚠ R-M9 / R-M1 (2026-10-19): producción sirve `29c4b6f` (2026-06-30); los despliegues fallan desde `569df74`, que añadió
> `cleanUrls`, `trailingSlash` y la propiedad no válida `errors` a `vercel.json`. Los códigos medidos en este documento son
> los de `29c4b6f`. Si se despliega `cleanUrls`/`trailingSlash`, `/about.html` pasaría a 308 → `/about/`. Ver `MAINTENANCE_MODE.md` §8.
> **Rama `maintenance/quelvo-onesound`:** `vercel.json` restaurado al de `29c4b6f` (opción B) ⇒ se conservan `/about.html`, `/contact.html`,
> `/qrcard.html` (200) y `/about` → 308 → `/about.html`. Cualquier ruta inexistente → `404.html` (generado por el build; pendiente de confirmar en Preview).
> **Producción desde 2026-10-19 = `4ef6506`:** mismo `vercel.json` (22 redirects verificados en producción); sin `404.html`
> propia (retirada temporal) ⇒ rutas inexistentes → 404 estándar de Vercel.

## 2. Rutas de cuenta / protegidas [VERIFICADO]

| Ruta | Archivo | HTTP | Protección |
|---|---|---|---|
| `/login.html` | `login.html` | 200 | Pública; ⚠ parámetro `next` sin validar (R-03) |
| `/reset-password.html` | `reset-password.html` | 200 | `noindex` |
| `/account.html` | `account.html` | 200 | Redirige a login si no hay sesión (cliente) |
| `/admin/` | `admin/index.html` | 200 | Redirige si no hay sesión o `role ≠ admin` (cliente) + RLS en Supabase [NO VERIFICADO] |

## 3. Legado y stubs [VERIFICADO]

| Ruta | Comportamiento en producción | Configurado en `vercel.json` |
|---|---|---|
| `/chofer-privado` | (redirect a `/quelvo/`, no medido sin barra) | 308 → `/quelvo/` |
| `/chofer-privado/` | **200** stub ES "Chofer privado & lujo" con botón WhatsApp | — (el redirect no captura la barra final) |
| `/chofer-privado/reservar.html` | **307 → `/quelvo/book/`** | `permanent: false` |
| `/chofer-privado/gracias.html` | 308 → `/quelvo/book/gracias/` | ✔ |
| `/domotica/`, `/software/`, `/automatizaciones/` | **200** stubs ES | Redirects a `/services/` definidos con `/:path*`, pero la ruta con barra sirve el stub |
| `/nosotros.html` | 308 → `/about.html` | ✔ |
| `/contacto.html` | 308 → `/contact.html` (configurado) | ✔ |
| `/privacidad.html`, `/terminos.html`, `/mi-cuenta.html` | 308 → equivalentes en inglés (configurado) | ✔ |
| `/reset-password` | 308 → `/reset-password.html` (configurado) | ✔ |

## 4. Archivos servidos que no deberían ser públicos

| Ruta | HTTP | Acción propuesta |
|---|---|---|
| `/copy.zip` | **404 en producción** desde `4ef6506` (antes 200) | Movido a `archive/copy.zip` (sigue en el repo público) |
| `/supabase-setup.sql` | **404 en producción** desde `4ef6506` (antes 200) | Movido a `supabase/legacy/` (sigue en el repo público) |
| `/js/supabase.client.js` | 200 | Sin uso; candidato a eliminar |

## 5. Rutas planificadas [PLANIFICADO — no existen]

| Ruta | Fase | Propósito | Estado de decisión |
|---|---|---|---|
| `/services/web-development/` … (subpáginas por servicio) | 3 | Detalle de cada servicio | Por decidir: anclas actuales (`#web`, `#automation`, `#smarthome`, `#support`) vs. subpáginas |
| `/quelvo/airport/`, `/quelvo/hourly/`, `/quelvo/business/`, `/quelvo/city-to-city/` | 4 | Landings por tipo de servicio | Propuesto en junio; por confirmar |
| Vista "Mis reservas" (en `/account.html` o `/quelvo/bookings/`) | 4 | Cumplir el enlace "View my bookings" | Por decidir |
| `/blog/` con contenido | — | Fuera del plan de 8 fases | Mantener stub o `noindex` |

## 6. Estrategia de URL (pendiente — decisión en Fase 8)

Hoy conviven tres estilos: `/about.html`, `/services/`, `/music-ride` (sin barra). Opciones a evaluar en Fase 8:
- A) Mantener `.html` en páginas planas y barra final en carpetas (statu quo, corregir canonicals sueltos).
- B) Migrar todo a carpetas con barra final (`/about/`, `/contact/`), con redirects 308 desde `.html`.

Cualquier cambio debe preservar: `/qrcard.html`, `/quelvo/book/`, `/music-ride/` y los redirects legados.
