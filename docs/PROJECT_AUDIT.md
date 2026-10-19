# Auditoría técnica — Estado inicial (Fase 1)

- **Fecha:** 2026-10-19
- **Commit auditado:** `4d0350a` (rama `main`, árbol limpio, sincronizada con `origin/main`)
- **Alcance:** todo `jcdmtech/`, configuración de Vercel, documentación existente, producción (sólo lectura).
- **Sin cambios de código** en esta fase.

Etiquetas: **[VERIFICADO]** comprobado; **[NO VERIFICADO]** no se pudo comprobar; **[INFERIDO]** deducción razonable sin prueba directa.

---

## 1. Stack tecnológico real

| Capa | Tecnología | Evidencia |
|---|---|---|
| Frontend | HTML5 multipágina, CSS propio, JavaScript vanilla (scripts clásicos + `type="module"`) | Sin `package.json`, sin bundler |
| Estilos | `styles.css` (612 líneas) + `<style>` inline por página (≈940 líneas en total) | ver §7 |
| Hosting | Vercel con `cleanUrls: true`, `trailingSlash: true`, página de error 404 | `jcdmtech/vercel.json` |
| Raíz de despliegue | `jcdmtech/` [INFERIDO: `vercel.json` está ahí y las rutas de producción coinciden] | |
| Backend | Supabase Auth + Postgres desde el cliente (anon key + RLS) | `js/supabase.config.js` |
| Mapas | Google Maps JS API (Places Autocomplete, Distance Matrix) — key embebida en HTML | `quelvo/book/index.html` |
| Formularios | Formspree | `contact.html`, `chofer-privado/reservar.html` |
| Analítica | GA4 `G-85LR7PFMVT`, init idempotente en el header partial | `partials/header.html` |
| Tipografías | Google Fonts: Inter, Fraunces | `partials/header.html` |
| Desarrollo local | VS Code Live Server, raíz `/jcdmtech` | `.vscode/settings.json` |
| Pruebas / lint / CI | **No existen** | |
| Node local | v22.12.0 disponible (sólo usado para `node --check`) | |

---

## 2. Estructura del proyecto

```
jcdmtech-site/                    (repo: github.com/eljuankd/jcdmtech-site)
├── CLAUDE.md                     instrucciones persistentes (nuevo, Fase 1)
├── AI_PROJECT_CONTEXT.md         contexto histórico (marzo 2026, parcialmente obsoleto)
├── README.md                     vacío (solo título)
├── docs/                         documentación del proyecto
├── .vscode/settings.json         Live Server root
├── .claude/settings.local.json   permisos locales de Claude (incluye git push *)
└── jcdmtech/                     ← RAÍZ DEL SITIO PUBLICADO
    ├── index.html                Home (tech company)
    ├── about.html, contact.html, privacy.html, terms.html, 404.html
    ├── login.html, reset-password.html, account.html
    ├── qrcard.html               tarjeta de contacto QR (descarga .vcf)
    ├── services/index.html       4 servicios técnicos
    ├── projects/index.html       QUELVO, Music Ride, 2 sistemas internos
    ├── quelvo/index.html         landing QUELVO (615 líneas, 369 de CSS inline)
    ├── quelvo/book/index.html    wizard de reserva (Supabase)
    ├── quelvo/book/gracias/      gracias del flujo legado
    ├── music-ride/index.html     landing Music Ride (ES)
    ├── admin/index.html          panel admin (bookings, vehicles, drivers)
    ├── chofer-privado/           legado: index (stub), reservar.html, gracias.html
    ├── automatizaciones/, domotica/, software/, blog/   stubs de 9 líneas
    ├── partials/header.html, partials/footer.html
    ├── js/app.js, booking.js, supabase.config.js, supabase.client.js (sin uso), version.js
    ├── styles.css
    ├── assets/                   logo, favicon, og-image, home/*.png, quelvo/*.png (~17 MB PNG)
    ├── files/juan-carlos-delgado.vcf
    ├── vercel.json, robots.txt, sitemap.xml
    ├── supabase-setup.sql        ⚠ servido públicamente
    └── copy.zip                  ⚠ copia antigua (sept. 2025), servida públicamente
```

66 archivos versionados en total.

---

## 3. Páginas y rutas

Inventario completo con código HTTP de producción en `docs/ROUTES.md`. Resumen:

| Grupo | Rutas | Estado |
|---|---|---|
| Marketing | `/`, `/services/`, `/projects/`, `/about.html`, `/contact.html` | Funcionales |
| QUELVO | `/quelvo/`, `/quelvo/book/`, `/quelvo/book/gracias/` | Funcionales |
| Music Ride | `/music-ride/` | Funcional (landing); app externa |
| Cuenta | `/login.html`, `/reset-password.html`, `/account.html`, `/admin/` | Funcionales |
| Legal | `/privacy.html`, `/terms.html` | Contenido completo |
| Utilidad | `/qrcard.html`, `/404.html`, `/sitemap.xml`, `/robots.txt` | Funcionales |
| Legado / stubs | `/chofer-privado/`, `/domotica/`, `/software/`, `/automatizaciones/`, `/blog/` | Stubs que siguen respondiendo 200 |

---

## 4. Funcionalidades existentes [VERIFICADO]

1. **Inyección de partials** (`app.js → include()`): header y footer por `fetch()` con `cache: "no-store"`.
2. **Navegación:** menú hamburguesa < 880 px, dropdown (código presente, sin dropdown en el header actual), resaltado de sección activa.
3. **Tema oscuro/claro:** oscuro por defecto, `localStorage` (`jcdm_theme`) y sincronización con `profiles.theme` si hay sesión.
4. **Idioma EN/ES:** atributo `data-es`, `localStorage` (`jcdm_lang`), sincronización con `profiles.lang`. Cobertura: Home (50), QUELVO (59), privacy (57), terms (59), account (14), 404 (8), header/footer. **0** en services, projects, about, contact, music-ride, quelvo/book, login, admin.
5. **Auth Supabase:** login por contraseña, magic link, registro, recuperación de contraseña, cuenta (nombre, teléfono, preferencias), cierre de sesión, enlace Admin visible si `role = admin`.
6. **Reserva QUELVO** (ver §5).
7. **Panel admin:** reservas (filtro por estado, cambio de estado, asignación de conductor, precio final, notas internas), CRUD de vehículos y conductores; escape HTML con `esc()`.
8. **Contacto:** formulario Formspree (honeypot `_gotcha`) con envío `fetch` y mensajes de éxito/error; enlaces WhatsApp, tel y mailto.
9. **Versión del sitio** en el footer (`js/version.js` → `booking-ux-01`, valor fijo manual).
10. **Tarjeta QR** con descarga de vCard.
11. **SEO básico:** title/description en todas las páginas; canonical en la mayoría; OG en 9 páginas; JSON-LD en Home, QUELVO y reservar legado; `sitemap.xml`; `robots.txt`.

---

## 5. Sistema de reservas

### 5.1 Flujo actual — `/quelvo/book/` [VERIFICADO]

| Paso | Contenido |
|---|---|
| 1 Service | Transfer · By the hour · Request a quote |
| 2 Vehicle | QUELVO Private (sedán) · QUELVO Black SUV |
| 3 Details | Origen/destino con Google Places (obligatorio elegir sugerencia en transfer), duración (chips 2–8 h, filtrados por mínimo), fecha, hora, pasajeros (máx. por clase) |
| 4 Confirm | Resumen + precio; nombre, email, teléfono, nº de vuelo, peticiones; prellenado desde `profiles` si hay sesión |
| OK | Panel inline con código `QLV-XXXXXXXX` y enlaces a QUELVO y `/account.html` |

**Precio (cliente):** constantes `CFG` en la página.
- Transfer: `horas = max(min/60 + 0,25, millas/25, 0,75)`; `precio = ceil(max(horas × tarifa, mínimo) / 5) × 5`. > 50 millas → cotización manual.
- Por horas: `max(h, mínimo) × tarifa`.
- Tarifa: Private $75/h, mín. $50, 2 h; SUV $120/h, mín. $85, 3 h.

**Persistencia:** `supabase.from('bookings').insert({...})` con `user_id` opcional, coordenadas, `pickup_at`, estimaciones, datos de contacto, `base_price`, `pricing_type`, `requires_quote`, `status` (`pending` / `pending_quote`).

**Lo que NO hace:** cobrar, enviar email o WhatsApp, verificar disponibilidad, notificar al admin. [NO VERIFICADO] si existe un trigger/Edge Function en Supabase que envíe notificaciones.

### 5.2 Flujo legado — `js/booking.js` + `chofer-privado/reservar.html`
Formulario único → modal de canal → WhatsApp (`wa.me`) o Formspree → `/quelvo/book/gracias/?via=…&code=…`.
En producción `/chofer-privado/reservar.html` responde **307 → `/quelvo/book/`**, por lo que este flujo **no es alcanzable**; el código y la página de gracias siguen desplegados.

### 5.3 Gestión — `/admin/`
Lee `bookings` con join `drivers(id,name,phone)`; actualiza `status`, `driver_id`, `admin_price`, `admin_notes`.

---

## 6. Music Ride [VERIFICADO salvo indicación]

- App externa `https://music-ride.jcdmtech.com` → HTTP 200. Código fuera de este repo; no auditado.
- Dependencias dentro de este repo: sólo enlaces (`music-ride/index.html`, `index.html`, `quelvo/index.html`, `projects/index.html`, `about.html`, footer) y la entrada de nav `musicride` en `highlightNav()`.
- Landing `/music-ride/`: sólo español, sin `data-es`, canonical `https://www.jcdmtech.com/music-ride` (sin barra final, distinto del sitemap), 102 líneas de CSS inline.
- No existe hoy ninguna integración técnica entre una reserva QUELVO y una sesión Music Ride (ni campo en `bookings`, ni enlace generado).
- [POR VALIDAR] "Every ride includes Music Ride" / "Every ride links to a Music Ride session" (`/projects/`), "Your Music Ride session will be ready too" (gracias). No hay código que lo respalde.
- [POR VALIDAR] Stack declarado (React, Node, Socket.IO, Railway, PostgreSQL, JWT).

---

## 7. SEO, estilos, recursos y responsive

**SEO**
- Canonicals apuntan a URLs `.html` (`/about.html`) mientras `vercel.json` declara `cleanUrls: true`; en producción `/about.html` responde 200 y `/about` hace 308 → `/about.html`; `/about/` da 404. Estrategia de URL inconsistente.
- Stubs sin canonical ni `noindex`: `/domotica/`, `/software/`, `/automatizaciones/`, `/blog/`, `/chofer-privado/` (contenido fino/duplicado; idioma ES).
- `sitemap.xml`: 9 URLs, `lastmod` 2026-06-15; faltan privacy/terms; incluye `/blog/` (stub).
- `robots.txt`: bloquea `/chofer-privado/gracias.html` (legado) pero no `/account.html` ni `/reset-password.html` (éstas tienen o no `noindex` de forma irregular); `/admin/` tiene canonical aunque está bloqueado.
- JSON-LD sólo en 3 páginas; OG sin imagen específica por página.

**Estilos / diseño**
- Tokens globales en `:root` de `styles.css` + overrides `.light-mode`.
- Home y QUELVO definen tokens propios inline (`--jh-*`, `--q-*`, negro `#05050A` distinto de `--bg #09090B`). Sistema de diseño fragmentado.
- `docs/DESIGN_SYSTEM.md` (junio) describía "Direction C" con alternancia oscuro/crema; Home y QUELVO fueron rediseñados en estilo oscuro tipo "Blacklane" (commits `68c4ac5`, `29c4b6f`) → documento actualizado en esta fase.

**Recursos**
- 12 PNG generados por IA de 0,8–1,7 MB (~17 MB). Sin WebP/AVIF, sin `srcset`, muchos como `background-image` inline (sin `loading="lazy"` posible). Impacto alto en LCP móvil.
- Falta `/assets/safari-pinned-tab.svg` (referenciado, 404).
- `supabase.client.js` sin referencias.

**Responsive**
- Breakpoints en uso: 480, 600, 640, 700, 768, 800, 880 (nav), 960, 1024 px — no unificados.
- Menú móvil funcional por código; no se ha realizado prueba visual en dispositivos en esta fase.

---

## 8. Riesgos detectados

Severidad: 🔴 alta · 🟠 media · 🟡 baja.

| ID | Sev. | Riesgo | Detalle / evidencia | Fase sugerida |
|---|---|---|---|---|
| R-01 | 🔴 | **Esquema Supabase no versionado** | `supabase-setup.sql` no define `bookings` ni columnas que usa el admin (`vehicles.capacity`, `drivers.hourly_rate`, `drivers.min_transfer_price`, `bookings.admin_price/admin_notes/driver_id`). El esquema real sólo existe en el panel de Supabase. Verificación remota fallida (timeout) → [NO VERIFICADO]. | 4 |
| R-02 | 🔴 | **RLS de `bookings` desconocida** | El insert anónimo requiere política INSERT para `anon`; la lectura debe limitarse a admin/propietario. Sin verificar. | 4 (verificar antes) |
| R-03 | 🔴 | **Redirección abierta / `javascript:` en login** | `login.html`: `location.href = next` con `next` sin validar → `?next=https://…` o `?next=javascript:…` tras iniciar sesión. | Antes de Fase 2 (hotfix aislado) o Fase 8 |
| R-04 | 🟠 | **Zona horaria de `pickup_at`** | `new Date(`${date}T${time}`).toISOString()` usa la zona del navegador: un cliente fuera de Miami guarda una hora desplazada. | 4 |
| R-05 | 🟠 | **Precio calculado en cliente** | `base_price` puede manipularse desde la consola. Debe tratarse como estimación; el admin fija `admin_price`. | 4 |
| R-06 | 🟠 | **Promesas no respaldadas por código** | "We'll send a confirmation to your email", "Instant confirmation", "View my bookings" (account no muestra reservas), flight tracking, Music Ride en cada viaje, Stripe/pagos en Services. Contradice la regla 10. | 2–7 según página |
| R-07 | 🟠 | **Archivos internos publicados** | `/copy.zip` (6,5 KB) y `/supabase-setup.sql` (4,3 KB) responden 200 en producción. | 8 (o hotfix) |
| R-08 | 🟠 | **Política RLS recursiva en el SQL** | `admin_read_all_profiles` consulta `profiles` desde una política de `profiles` (riesgo de "infinite recursion"). El estado remoto puede diferir. | 4 |
| R-09 | 🟠 | **Sin anti-spam en reservas** | Insert directo sin captcha ni rate limit. | 4 |
| R-10 | 🟠 | **Rendimiento de imágenes** | ~17 MB PNG. | 2 (Home) y 4 (QUELVO) |
| R-11 | 🟠 | **Accesibilidad del wizard** | Tarjetas `div onclick` sin teclado/rol; `<label>` sin `for`; foco no gestionado al cambiar de paso. | 4 / 8 |
| R-12 | 🟠 | **Sin entorno de pruebas** | No hay staging ni base de datos de pruebas; cualquier reserva de prueba va a producción. Push a `main` despliega. | Todas |
| R-13 | 🟡 | **Supabase-js sin versión fija** | `esm.sh/@supabase/supabase-js@2` puede cambiar sin aviso. | 8 |
| R-14 | 🟡 | **Google Maps key en cliente** | Normal, pero debe estar restringida por referrer en Google Cloud [NO VERIFICADO]. | 4 |
| R-15 | 🟡 | **XSS propio en resumen de reserva** | `buildSummary()` interpola direcciones en `innerHTML` sin escapar. | 4 |
| R-16 | 🟡 | **Sistema de diseño fragmentado** | Tokens duplicados, CSS inline grande, breakpoints dispersos. | 2 |
| R-17 | 🟡 | **i18n parcial** | Ver §4.4; cambiar a ES deja páginas mixtas. | 2–7 |
| R-18 | 🟡 | **Stubs y URLs inconsistentes** | §7 SEO. Cambiar redirects puede romper QR/enlaces externos. | 8 |
| R-19 | 🟡 | **Email de contacto inconsistente** | `contacto@` vs `info@`. Requiere decisión del propietario. | 7 |
| R-20 | 🟡 | **Permiso local `git push *`** | `.claude/settings.local.json` lo permite sin confirmación; la regla 11 de CLAUDE.md lo prohíbe sin autorización. | — |
| R-21 | 🟡 | **Documentación previa desactualizada** | `AI_PROJECT_CONTEXT.md` y la versión de junio de `docs/` describían rutas en español y páginas "por crear" que ya existen. | Resuelto en Fase 1 (docs) |

### Riesgos específicos de modificar o migrar funcionalidades

- Cambiar `partials/header.html` afecta a **todas** las páginas y a `setupAuthNav()` (IDs `navLogin`, `navLogout`, `navAdmin`, `navAccount`, `themeToggle`, `langToggle`, `navToggle`, `siteNav`).
- Renombrar clases de `styles.css` rompe páginas que no se tocan en la misma fase (admin, login, legal).
- Mover o renombrar `quelvo/book/` rompe enlaces desde Home, QUELVO, Projects, footer, gracias y el redirect de `reservar.html`.
- Eliminar `booking.js` o `quelvo/book/gracias/` exige confirmar que ningún QR/enlace externo usa el flujo legado.
- Cambiar nombres de columnas en `bookings` rompe a la vez el wizard y el admin.
- Cualquier cambio de `vercel.json` sólo se valida en Vercel Preview/producción.

---

## 9. Comprobaciones realizadas (2026-10-19)

| Comprobación | Método | Resultado |
|---|---|---|
| Estado Git | `git status`, `git log`, `git branch -a` | `main` limpio, al día con `origin/main` |
| Producción = repo | MD5 de 7 archivos clave local vs. `https://www.jcdmtech.com` | Idénticos — **corregido 2026-10-19:** coincidían sólo porque esos 7 archivos no cambiaron; producción sirve `29c4b6f`, no `main` (despliegues fallidos desde `569df74`) |
| Sintaxis JS | `node --check js/app.js js/booking.js js/version.js` | OK |
| Enlaces/recursos internos | Script sobre todos los `href`/`src`/`url('/…')` absolutos | 1 roto: `/assets/safari-pinned-tab.svg` |
| Codificación | Búsqueda de mojibake (`Ã`, `Â`) | Sin coincidencias (problema de marzo resuelto) |
| Rutas en producción | `curl` HEAD sobre 27 rutas | Ver `ROUTES.md` |
| App Music Ride | `curl https://music-ride.jcdmtech.com/` | 200 |
| Archivos internos expuestos | `curl` | `/copy.zip` 200, `/supabase-setup.sql` 200 |
| Esquema Supabase remoto | MCP `list_tables` (lectura) | **Falló** (timeout de conexión) — no verificado |
| Advisors de seguridad Supabase | MCP `get_advisors` | Lista vacía (inconcluyente por el fallo de conexión) |
| Prueba visual / responsive | — | No realizada en Fase 1 |
| Envío real de formularios / reservas | — | No realizado (evitar datos de prueba en producción) |

Script de enlaces usado (desde `jcdmtech/`):

```bash
grep -rhoE '(href|src)="/[^"#?]*' --include=*.html . | sed -E 's/^(href|src)="//' | sort -u |
while read p; do t=".$p"; if [ -d "$t" ]; then [ -f "$t/index.html" ] || echo "MISSING: $p";
elif [ ! -f "$t" ]; then echo "MISSING: $p"; fi; done
```

---

## 10. Correcciones posteriores (2026-10-19)

**Confirmado:**
- Producción **no** sirve `main`: sirve `29c4b6f` (2026-06-30). La comprobación §9 "Producción = repo" comparó 7 archivos que no cambiaron desde ese commit, por eso coincidían.
- Vercel marca como fallidos todos los despliegues desde `569df74` (2026-08-02), que añadió `cleanUrls`, `trailingSlash` y `errors` a `vercel.json`. La página 404 (`569df74`) y las páginas legales completas (`4d0350a`) **no están publicadas**.
- Los códigos HTTP de `ROUTES.md` corresponden a `29c4b6f`.
- Supabase `jcdmtech-prod` está pausado (INACTIVE): el *timeout* de §9 no era un fallo de conexión del MCP.

**Hipótesis:** el fallo de despliegue se debe a la propiedad no válida `errors` (sin logs; se verifica con el Preview de la rama `maintenance/quelvo-onesound`, que retira `errors`, `cleanUrls` y `trailingSlash`).

Nuevo riesgo **R-22 🔴 Despliegues bloqueados desde 2026-08-02** — cualquier cambio en `main` no llega a producción hasta corregir `vercel.json` (detalle: `docs/MAINTENANCE_MODE.md` §8.1).

---

## 11. Seguridad — auditoría y remediación (2026-10-19)

Auditoría de seguridad entregada al propietario en la conversación (el repositorio es público; aquí sólo el estado).
Remediación local, sin commit ni despliegue: `docs/SECURITY_REMEDIATION.md`.

| Riesgo | Estado |
|---|---|
| R-03 (`next` del login) = J-03 | **Corregido en la rama (sin desplegar)** — `js/safe-next.js`; pruebas unitarias y de navegador; control con la versión anterior confirma el fallo |
| R-07 (archivos internos publicados) = J-04 | **Corregido en la rama (sin desplegar)** — movidos a `archive/` y `supabase/legacy/`; `.vercelignore` |
| R-08 (política recursiva) | **Confirmado en PGlite:** el SQL histórico literal hace fallar toda lectura autenticada de `profiles` ⇒ la base real difiere del archivo. La migración lo sustituye por `public.is_admin()` |
| R-01 / R-02 (esquema y RLS) = J-01, J-02, J-06 | **Migración preparada, no aplicada** (Supabase pausado). Procedimiento en `SECURITY_REMEDIATION.md` §4.4 |
| Cabeceras HTTP = J-05 | **Preparadas** en `vercel.json` (CSP en Report-Only) |
| R-13 (supabase-js sin versión fija), R-14 (clave de Maps), R-15 (resumen de reserva sin escapar) | Pendientes |
