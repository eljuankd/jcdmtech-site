# Arquitectura del sitio — actual y propuesta

> Actualizado: 2026-10-19 (Fase 1). Sustituye la versión de junio 2026, cuyo "mapa objetivo" ya se implementó en gran parte.

---

## 1. Arquitectura actual [VERIFICADO]

**Patrón:** MPA estática + BaaS. Sin servidor propio, sin build.

```
Navegador
  │
  ├── GET páginas HTML estáticas ──────────── Vercel (jcdmtech/, vercel.json: redirects, cleanUrls, 404)
  │      └── app.js → fetch /partials/header.html, /partials/footer.html
  │
  ├── supabase-js v2 (esm.sh) ─────────────── Supabase nrmajnnfejafbtkpvpob
  │      ├── Auth (password, magic link, reset)
  │      └── Postgres + RLS: profiles, vehicles, drivers, bookings
  │
  ├── Google Maps JS (Places, Distance Matrix)  ← sólo /quelvo/book/
  ├── Formspree /f/xgvljywo                     ← /contact.html (+ reserva legado)
  ├── GA4 G-85LR7PFMVT                          ← vía header partial
  ├── wa.me/17863487458                         ← enlaces
  └── https://music-ride.jcdmtech.com           ← app externa (otro repositorio/hosting)
```

### Capas en el cliente

| Capa | Archivo(s) | Responsabilidad |
|---|---|---|
| Arranque común | `js/version.js`, `js/app.js` | Versión, preferencias (tema/idioma), partials, nav, auth nav |
| Config | `js/supabase.config.js` | `window.__SUPABASE__ = { url, anon }` (script clásico, debe cargarse antes de `app.js`) |
| UI compartida | `partials/header.html`, `partials/footer.html`, `styles.css` | Nav, footer, tokens y componentes |
| Lógica por página | `<script>` inline en `login`, `account`, `reset-password`, `admin`, `quelvo/book`, `contact`, `gracias` | Cada página crea su propio cliente Supabase |
| Reserva legado | `js/booking.js` | WhatsApp/Formspree (no alcanzable en producción) |

### Orden de carga típico

```html
<div id="header"></div> … <div id="footer"></div>
<script src="/js/supabase.config.js"></script>
<script src="/js/app.js" defer></script>
<!-- script inline de la página -->
```
Excepciones: stubs legado sin `supabase.config.js` (auth nav no se muestra); `chofer-privado/index.html` carga config después de `app.js`.

### Modelo de datos usado por el código [INFERIDO del código; esquema remoto NO VERIFICADO]

| Tabla | Columnas referenciadas | Usada por |
|---|---|---|
| `profiles` | `id`, `role`, `full_name`, `phone`, `theme`, `lang` | app.js, login, account, admin, quelvo/book |
| `vehicles` | `id`, `make`, `model`, `year`, `color`, `plate`, `capacity`, `notes`, `created_at` | admin |
| `drivers` | `id`, `name`, `phone`, `email`, `license`, `notes`, `hourly_rate`, `min_transfer_price`, `created_at` (+ otros en el formulario) | admin, join en bookings |
| `bookings` | `id`, `booking_code`, `user_id`, `service_type`, `vehicle_class`, `pickup_address`, `dropoff_address`, `pickup_lat/lng`, `dropoff_lat/lng`, `pickup_at`, `requested_hours`, `estimated_minutes`, `estimated_miles`, `passengers`, `client_name/email/phone`, `flight_number`, `special_requests`, `base_price`, `pricing_type`, `requires_quote`, `status`, `driver_id`, `admin_price`, `admin_notes`, `created_at` | quelvo/book (insert), admin (select/update) |

`jcdmtech/supabase-setup.sql` sólo cubre parte de `profiles`, `vehicles`, `drivers` (ver R-01).

### Modo mantenimiento (2026-10-19, D-013) — preparado, no desplegado

```
Petición /quelvo* o /chofer-privado*
  └── (redirects de vercel.json primero)
  └── jcdmtech/middleware.js (Routing Middleware, runtime nodejs) ── lee js/maintenance.config.js
        ├── quelvo.maintenance === true → 503 + Retry-After + HTML de /maintenance/quelvo/
        └── cualquier otro valor        → continúa (x-middleware-next: 1, equivalente a next())
Resto de páginas
  └── maintenance.config.js (en <head> o cargado por app.js) → html.maint-quelvo / html.maint-onesound
        └── styles.css oculta [data-maint-hide] y muestra [data-maint-show]
Supabase bookings
  └── trigger quelvo_bookings_maintenance (BEFORE INSERT) ── jcdm_maintenance_flags(key='quelvo').maintenance  [SQL pendiente; proyecto PAUSADO]
OneSound (otro repo): MAINTENANCE_MODE en backend Render → 503 en /api/*, rechazo de Socket.IO  [pendiente de acceso]
```

Plataformas externas relacionadas: OneSound (Vercel + Render, repo `jcdm-music-ride`) y Survivor Sports
(servidor propio vía DuckDNS). Ninguna comparte código ni backend con este sitio; sólo la zona DNS `jcdmtech.com`.
Detalle: `docs/MAINTENANCE_MODE.md`.

---

## 2. Arquitectura propuesta [PLANIFICADO]

Principio: **evolución incremental, no reescritura**. Mantener MPA estática en Vercel + Supabase (D-001, D-002).
No introducir framework ni build en las fases 2–8 salvo decisión explícita registrada en `DECISIONS.md`.

### 2.1 Cambios estructurales propuestos

| # | Propuesta | Motivo | Fase |
|---|---|---|---|
| A1 | Consolidar tokens en `styles.css` (eliminar `--jh-*`, `--q-*` duplicados) y extraer CSS de página a archivos `/css/pages/*.css` o secciones de `styles.css` | Coherencia, caché, mantenimiento | 2 (Home) y siguientes |
| A2 | Versionar el esquema real de Supabase en `supabase/` (fuera de `jcdmtech/`) a partir de un volcado del proyecto | R-01, R-07 | 4 (requiere acceso al proyecto) |
| A3 | Extraer la lógica de reserva a `js/quelvo-booking.js` (precio, estado, validación) manteniendo el HTML | Testabilidad, accesibilidad | 4 |
| A4 | Un único cliente Supabase compartido (`window.JCDM.sb`) en lugar de `createClient` por página | Evitar instancias múltiples de GoTrue | 4 / 8 |
| A5 | Fijar versión exacta de supabase-js | R-13 | 8 |
| A6 | Imágenes en WebP/AVIF con `<picture>`/`srcset` | R-10 | 2 y 4 |
| A7 | Integración Music Ride ↔ QUELVO mediante enlace/parámetro, sin tocar la app externa | Requisito de producto | 5 (diseño a acordar) |
| A8 | Unificar estrategia de URL y canonicals | SEO | 8 |

### 2.2 Mapa de sitio objetivo

```
/                         Home JCDM (Fase 2)
/services/                5 líneas: 4 servicios + QUELVO destacado (Fase 3)
/quelvo/                  Landing QUELVO (Fase 4)
/quelvo/book/             Reserva (Fase 4) — misma URL, protegida
/music-ride/              Producto Music Ride (Fase 5)
/projects/                Portafolio de productos/sistemas (Fase 6)
/about.html, /contact.html  (Fase 7; posible migración de URL en Fase 8)
/privacy.html, /terms.html  Mantener
/login.html, /account.html, /reset-password.html, /admin/  Mantener
/qrcard.html              Mantener (QR impresos)
Legado (/chofer-privado/*, /domotica/, /software/, /automatizaciones/)  Redirects correctos (Fase 8)
```

### 2.3 Navegación

Actual [VERIFICADO]: `JCDM | Home | Services | QUELVO | Projects | About | Contact | (My account / Sign in / Admin / Sign out) | ES | ☀️`.
Music Ride no está en el menú principal (sólo footer). "Book a Ride" se retiró del nav (commit `f571db1`).
La estructura final de navegación se decide en Fase 2 (header) y Fase 7 (footer).

---

## 3. Reutilización de componentes

| Componente | Archivo | Usado en |
|---|---|---|
| Header | `partials/header.html` | Todas las páginas con `#header` (excepto `qrcard.html`) |
| Footer | `partials/footer.html` | Todas las páginas con `#footer` |
| Estilos | `styles.css` | Todas |
| Core JS | `js/app.js` | Todas excepto `qrcard.html` |
| Config Supabase | `js/supabase.config.js` | Todas salvo stubs legado, `404`, `privacy`, `terms`, `qrcard` |
| Reserva legado | `js/booking.js` | `chofer-privado/reservar.html` |
