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
| `/copy.zip` | 200 | Eliminar del directorio publicado (tras confirmar con el propietario) |
| `/supabase-setup.sql` | 200 | Mover fuera de `jcdmtech/` (p. ej. `supabase/` en la raíz del repo) |
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
