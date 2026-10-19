# Remediación de seguridad — Fase 1 (JCDM Technologies)

> Creado: 2026-10-19. Origen: auditoría de seguridad del 2026-10-19 (informe entregado al propietario en la conversación;
> **no** se publica aquí con detalle de explotación porque este repositorio es **público**).
> Estado: **preparado y probado en local, sin commit, sin desplegar.** Rama `maintenance/quelvo-onesound`.
>
> Etiquetas: **[VERIFICADO]** probado; **[HIPÓTESIS]** pendiente de comprobar en Vercel/Supabase reales.

---

## 1. Resumen

| ID | Gravedad | Tema | Estado |
|---|---|---|---|
| J-03 | Alta | Validación del destino `next` en el login | **Corregido en local** — `js/safe-next.js` + `login.html` |
| J-04 | Media | Archivos internos publicados (`/copy.zip`, `/supabase-setup.sql`) | **Corregido en local** — movidos fuera de `jcdmtech/` + `.vercelignore` |
| J-05 | Media | Cabeceras de seguridad ausentes | **Preparado** — `vercel.json` `headers` (CSP en Report-Only) + 503 del middleware |
| J-01 / J-02 / J-06 | Crítica / Alta / Media | Roles y RLS de Supabase | **Migración preparada, NO aplicada** — `supabase/migrations/2026-10-19-security-rls*.sql` |
| O-01…O-05 | Alta / Media | OneSound | **Sólo documentado en privado** (§5). Nada modificado en OneSound |

Producción sigue sirviendo `29c4b6f` (despliegues bloqueados hasta publicar `fd31034`). **Nada de esto llega a producción
hasta un despliegue autorizado** (§6).

---

## 2. J-03 — destino tras iniciar sesión

- `jcdmtech/js/safe-next.js` (módulo ES) exporta `safeNext(raw, origin)`: sólo admite rutas del mismo sitio que empiezan
  por una única `/`. Rechaza → `/`: otros dominios, `//host`, `/\host`, barras invertidas, esquemas (`javascript:`, `data:`…),
  espacios/tabuladores/saltos de línea y caracteres de control, segmentos `/.//host` que se normalizan a `//host`,
  más de 2048 caracteres, y la propia `/login.html` (evita bucles).
- `login.html` usa el valor validado en **todos** los usos: redirección con sesión existente, evento `SIGNED_IN` y
  `emailRedirectTo` de los enlaces mágicos. Recuperación de contraseña (`redirectTo` fijo) y registro sin cambios.
- Pruebas [VERIFICADO]: `node --test scripts/tests/safe-next.test.mjs` (4 grupos, 48 casos) y navegador (§7).
  Control: el `login.html` anterior, en las mismas condiciones, sale a otro dominio y ejecuta `javascript:`.

## 3. J-04 / J-05 — publicación y cabeceras

**Archivos internos** (contenido idéntico, MD5 verificado; Git los detectará como renombrados al hacer commit):

| Antes (público) | Ahora (no publicado) |
|---|---|
| `jcdmtech/supabase-setup.sql` | `supabase/legacy/supabase-setup.sql` (histórico; no ejecutar) |
| `jcdmtech/copy.zip` | `archive/copy.zip` |

`jcdmtech/.vercelignore` impide publicar `*.zip`, `*.sql`, `*.bak`, `*.old`, `*.orig`, `*.tmp`, `*.log`, `.env*` desde la raíz
del sitio. [VERIFICADO con `vercel build` local: con el archivo, los señuelos no salen; sin él, sí.]
[HIPÓTESIS] que el despliegue por Git aplique `.vercelignore` igual que el build local → comprobar en el Preview que
`/copy.zip` y `/supabase-setup.sql` dan 404 (no dependen de ello: ya no están en `jcdmtech/`).

**Nota:** el repositorio es público: el SQL histórico sigue visible en GitHub (también en el historial). No contiene
secretos; el riesgo que describe lo cierra la migración del §4, no su ubicación.

**Cabeceras** (`jcdmtech/vercel.json` → `headers`, todas las rutas):

| Cabecera | Valor | Efecto |
|---|---|---|
| `X-Content-Type-Options` | `nosniff` | Activa. Los tipos MIME de producción son correctos (comprobado). |
| `X-Frame-Options` | `DENY` | Activa: ninguna página puede incrustarse en otra web (anticlickjacking). |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Igual al valor por defecto de los navegadores; compatible con la restricción por referrer de la clave de Maps. |
| `Permissions-Policy` | cámara, micrófono, geolocalización, pago, USB… desactivados | El sitio no usa ninguna (comprobado). |
| `Content-Security-Policy-Report-Only` | lista de orígenes del inventario | **No bloquea nada**: sólo informa en la consola del navegador. |

Orígenes permitidos por la CSP (inventario del código): `esm.sh` (supabase-js), `maps.googleapis.com` / `maps.gstatic.com`,
Supabase `nrmajnnfejafbtkpvpob` (https + wss), `formspree.io`, Google Fonts, GA4 (`googletagmanager.com`, `*.google-analytics.com`,
`*.analytics.google.com`). Se mantiene `'unsafe-inline'` en scripts y estilos (hay scripts y `onclick` inline): la CSP no
protege aún frente a XSS; endurecerla requiere sacar el JS inline a archivos (fase posterior).

Las respuestas 503 del middleware de QUELVO añaden `nosniff`, `X-Frame-Options` y `Referrer-Policy`
(no está garantizado que Vercel aplique las de `vercel.json` a respuestas generadas por el middleware).

Pasar la CSP a modo bloqueante: sólo después de revisar el Preview/producción sin violaciones (incluido Google Maps con
la clave real y GA4, que en local se bloquearon por red para no generar tráfico), renombrando la cabecera a
`Content-Security-Policy`.

## 4. J-01 / J-02 / J-06 — Supabase (preparado, NO aplicado)

Supabase `jcdmtech-prod` está **pausado**. No se ha ejecutado SQL sobre ninguna base real.

### 4.1 Archivos (`supabase/migrations/`)

| Archivo | Qué hace | Escribe |
|---|---|---|
| `2026-10-19-security-rls.preflight.sql` | Inventario: columnas requeridas, nombres libres, RLS, **todas** las políticas actuales, permisos, triggers, cuentas con rol distinto de `user`, altas por mes, vistas/funciones `SECURITY DEFINER`, buckets, recuento de datos | No |
| `2026-10-19-security-rls.sql` | Una transacción: comprueba columnas (para si falta alguna) → copia de seguridad de políticas, permisos y RLS en `public.jcdm_security_backup_20261019` → `public.is_admin()` → trigger `profiles_guard_role` → sustituye **todas** las políticas de `profiles`, `bookings`, `vehicles`, `drivers` → permisos por columna | Sólo permisos/políticas; ningún dato |
| `2026-10-19-security-rls.verify.sql` | Tras aplicar: simula llamadas anónimas, de usuario y de admin con cuentas existentes; **siempre** termina en error intencionado ⇒ se revierte todo | No (revertido) |
| `2026-10-19-security-rls.rollback.sql` | Restaura exactamente políticas, permisos y RLS guardados. **Reabre las vulnerabilidades** | Sólo permisos/políticas |

### 4.2 Reglas resultantes

- `profiles`: sólo el propio usuario lee/edita su fila (`full_name`, `phone`, `theme`, `lang`); **nadie puede cambiar `role`
  desde la API** (ni siquiera un admin: los roles se asignan desde el editor SQL). Admin lee todos los perfiles.
- `bookings`: el navegador (anónimo o con sesión) sólo puede **crear solicitudes** con estado `pending`/`pending_quote`
  coherente con `requires_quote`, precio estimado ≥ 0, sin columnas administrativas (`admin_price`, `admin_notes`,
  `driver_id`, `id`, `created_at`) y nunca a nombre de otro usuario. Cada cliente lee sólo sus reservas. Sólo el admin
  lee todas y actualiza `status`, `driver_id`, `admin_price`, `admin_notes` (= formulario de `/admin/`).
  `base_price` sigue siendo una estimación del cliente: el precio definitivo es `admin_price`.
- `vehicles`, `drivers`: sólo admin.
- Se elimina la política recursiva `admin_read_all_profiles` (R-08).
- Compatible con el trigger de mantenimiento de QUELVO (`docs/sql/quelvo-maintenance.sql`).

### 4.3 Pruebas locales [VERIFICADO]

`JCDM_TOOLS=<carpeta con @electric-sql/pglite@0.5.8> node scripts/tests/security-rls.pglite.mjs` → **83/83**.
PGlite (Postgres en WebAssembly, sin red) con un Supabase mínimo simulado (roles `anon`/`authenticated`, `auth.uid()` por
claims JWT, permisos por defecto de Supabase) y el SQL histórico tal cual. Incluye: el preflight no escribe; la migración
no cambia datos, guarda todas las políticas previas y falla de forma visible si se repite o si falta una columna;
los flujos reales del sitio (alta, `upsert` de cuenta, tema/idioma, reserva anónima, cotización, reserva con sesión,
panel admin con join de conductores, CRUD de vehículos y conductores); 28 intentos indebidos rechazados; convivencia con
el trigger de mantenimiento; `verify.sql` → 0 fallos y sin cambios; `rollback.sql` restaura políticas y permisos idénticos.

Hallazgo de las pruebas: el SQL histórico **literal** hace fallar por recursión toda lectura autenticada de `profiles`,
así que la base real **no puede ser idéntica** a ese archivo (el admin funcionaba en junio). Si la recursión se resolvió
quitando esa política —lo habitual—, el fallo de roles es explotable (reproducido en local). Hay que confirmarlo con el
preflight (D, G).

Limitación: PGlite no es Supabase (sin PostgREST ni GoTrue). Por eso existe `verify.sql` para la base real.

### 4.4 Procedimiento seguro (cada paso requiere autorización del propietario)

1. **Antes de restaurar:** desplegar la web corregida (§6) para que el login ya no sea vulnerable cuando Auth vuelva.
2. Restaurar `jcdmtech-prod` desde el panel de Supabase. A partir de aquí, aplicar sin pausas los pasos 3–6.
3. Ejecutar `…preflight.sql`. Guardar la salida. **Detenerse** si: falta alguna columna (A), algún nombre está ocupado (B),
   hay cuentas con rol distinto de `user` que no sean del propietario (G — tratarlo como incidente: no continuar, conservar
   evidencias, revisar logs de Auth y valorar rotar contraseñas), o hay triggers con efectos externos en `bookings` (F).
4. Ejecutar `…security-rls.sql` (una transacción; si algo falla, no queda nada aplicado).
5. Ejecutar `…verify.sql` → debe terminar con `VERIFY FINISHED (everything rolled back) — 0 failure(s)`.
6. Repetir preflight L → números idénticos. Ejecutar `get_advisors` (security) de Supabase.
7. Probar en el sitio: login, cuenta (guardar nombre/teléfono, tema, idioma), admin (listar, guardar estado/conductor/precio,
   CRUD de vehículos y conductores). **No** confirmar reservas reales.
8. Si algo esencial falla y no hay corrección rápida: `…rollback.sql` (reabre el riesgo) y avisar.
9. Opcional, tras unos días: `drop table public.jcdm_security_backup_20261019;` (antes, exportarla).

Orden respecto a la suspensión de QUELVO (`docs/MAINTENANCE_MODE.md` §5): esta migración y el SQL de mantenimiento son
independientes y compatibles; aplicar primero esta (cierra el acceso de admin indebido del que depende el bypass del trigger).

## 5. OneSound — fase independiente (no aplicada)

Nada de OneSound se ha modificado (repo, Render, Vercel, variables, sesiones). La auditoría identificó mejoras de
disponibilidad y control de abuso (O-01…O-05) y de endurecimiento (O-06…O-10). **El detalle no se publica en este
repositorio público** mientras OneSound siga en producción sin corregir: está en un documento local del propietario
(`docs/private/`, excluido de Git).

Condición operativa: cualquier cambio del backend implica redeploy en Render y, como las sesiones viven en memoria,
cierra las sesiones activas ⇒ planificar en una franja de bajo uso, probar en local y nunca contra producción.

## 6. Pasos restantes para publicar (requieren autorización)

1. Revisar el diff y autorizar commit(s) en `maintenance/quelvo-onesound` (propuesta: `fix(auth)`, `chore(security)` para
   archivos/cabeceras, `feat(db)` para la migración, `docs(security)`). Escaneo de credenciales antes del commit.
2. Push a la rama → **Vercel Preview**. Comprobar con Protection Bypass (`docs/MAINTENANCE_MODE.md` §6.1):
   cabeceras presentes; `/copy.zip`, `/supabase-setup.sql` → 404; `/login.html?next=//example.com` no sale del sitio;
   consola sin violaciones de CSP (incluidos Maps y GA4 reales); redirects y 503 de QUELVO (`scripts/verify-maintenance.sh`).
3. Merge a `main` = producción: publica también `569df74`, `4d0350a`, la suspensión de QUELVO y estas correcciones.
4. Después, y sólo entonces, el procedimiento de Supabase (§4.4).

## 7. Registro de pruebas (2026-10-19, todo en local)

| Prueba | Resultado |
|---|---|
| `node --test scripts/tests/safe-next.test.mjs` | 4/4 |
| `node scripts/tests/security-rls.pglite.mjs` (PGlite) | 83/83 |
| `npx vercel@64.5.0 build` (copia en scratchpad) | OK; 55 archivos estáticos, ninguno `.zip`/`.sql`; cabeceras como ruta `continue` antes del middleware; 22 redirects y 404 intactos |
| `.vercelignore` con señuelos (`.zip`, `.sql`, `.bak`) | excluidos; control sin `.vercelignore`: publicados |
| Servidor local que aplica las rutas compiladas + middleware compilado | redirects legados (307/308), `/quelvo*` 503 con `Retry-After` y cabeceras, `/copy.zip` 404 |
| `scripts/tests/e2e-security.mjs` + `serve-vercel-output.mjs` — Chrome headless (Puppeteer), sin tráfico externo (todo bloqueado; supabase-js simulado) | 88/88: 4 `next` legítimos y 11 maliciosos, enlaces mágicos, `SIGNED_IN`, recuperación y registro; 0 violaciones de CSP en 16 páginas + QUELVO con mantenimiento apagado; 0 errores JS; `/admin/` no se puede incrustar; Home, 4 servicios, menú móvil, idioma, tema, avisos de mantenimiento, páginas 503, formulario de contacto |
| Control con el `login.html` anterior | redirige a otro dominio y ejecuta `javascript:` (confirma J-03) |
| `node --check` JS + middleware; enlaces internos | OK; sólo el `safari-pinned-tab.svg` ya conocido |
