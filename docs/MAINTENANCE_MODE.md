# Modo mantenimiento — QUELVO y OneSound

> Creado: 2026-10-19 · Revisión técnica: 2026-10-19 (rev. 2). Decisión asociada: D-013 (`docs/DECISIONS.md`).
> Objetivo: suspender **temporalmente** QUELVO y OneSound (Music Ride) sin borrar código, datos ni configuración,
> y sin afectar a Survivor Sports. Todo es reversible cambiando flags.
>
> **Estado (2026-10-19, tarde):** commits `70479ca` + `abc90c8` en la rama `maintenance/quelvo-onesound` (push hecho;
> `main` intacta). **El Vercel Preview falló al compilar** por un problema previo de `vercel.json` (R-M9, §8), no por
> la suspensión. Producción sigue en `29c4b6f` sirviendo `/quelvo/` (200) y OneSound (200). Ver §5, §6.1 y §8.

---

## 1. Mapa de plataformas [VERIFICADO 2026-10-19, sólo lectura]

| Plataforma | URL | Dónde se ejecuta | Código | Datos |
|---|---|---|---|---|
| JCDM Technologies | `https://www.jcdmtech.com` | Vercel (proyecto del sitio, raíz `jcdmtech/`) | este repo (`github.com/eljuankd/jcdmtech-site`) | Supabase **`jcdmtech-prod`** (`nrmajnnfejafbtkpvpob`) — **PAUSADO** (ver §1.1) |
| QUELVO web | `/quelvo/`, `/quelvo/book/` (+ legado `/chofer-privado/*`) | el mismo proyecto Vercel | este repo | `jcdmtech-prod`: `bookings`, `vehicles`, `drivers`, `profiles` |
| QUELVO app (ride-hailing) | — (no pública) | Desarrollo local: backend Fastify en `localhost:3000` / `10.0.0.6:3000` (LAN) | `D:\quelvo` → `github.com/eljuankd/quelvo-app`, `github.com/eljuankd/quelvo-backend` | Supabase `quelvo-prod` (`qxcwyzknqzsbjyfqddxm`) **PAUSADO**; el código de la app referencia además `emipfckpsjlaqifmdtdl` (no está en esta cuenta, no responde) |
| OneSound (antes "Music Ride") | `https://music-ride.jcdmtech.com` | **Frontend:** otro proyecto Vercel. **Backend:** Render `https://jcdm-music-ride.onrender.com` (`/health` → 200) | **otro repo:** `github.com/eljuankd/jcdm-music-ride`. Backup local: `D:\Proyectos\OneSound-Windows-Backup-2026-09-07.zip` | En memoria según el backup (PostgreSQL preparado, no conectado; sin cuentas de usuario) — [POR VALIDAR] en lo desplegado |
| Survivor Sports | `https://survivor.jcdmtech.com` | **Servidor propio**: CNAME → `eljuank.duckdns.org` (IP residencial) | fuera de este repo | fuera de alcance |

DNS de `jcdmtech.com`: GoDaddy (`ns75/ns76.domaincontrol.com`). **Ningún paso de este documento modifica DNS.**

### 1.1 Supabase pausado — implicaciones (hallazgo de la revisión)
- `get_project` devuelve `status: INACTIVE` para `jcdmtech-prod` y `quelvo-prod`; el host `nrmajnnfejafbtkpvpob.supabase.co` no resuelve. Por eso todas las consultas MCP daban *timeout* (también en la Fase 1).
- **Hoy en producción** fallan login, cuenta, panel admin y el `insert` del wizard: QUELVO ya no puede guardar reservas, pero el wizard sigue visible y falla al confirmar.
- Requisito "mantener acceso admin a reservas existentes" ⇒ hay que **restaurar** `jcdmtech-prod` (acción de producción, requiere autorización). Al restaurarlo, la API vuelve a aceptar `insert` en `bookings` hasta que se instale el trigger ⇒ seguir el orden de §5.
- Los datos de un proyecto pausado se conservan, pero Supabase limita el plazo para restaurarlo desde el panel (plan gratuito: 90 días según su política; **confirmar en el panel la fecha de pausa y el plazo**). En el plan gratuito, un proyecto sin actividad se vuelve a pausar a los ~7 días: con QUELVO suspendido, el admin puede perder el acceso de nuevo.

### 1.2 ¿Acepta reservas QUELVO algún otro canal? (punto 4 de la revisión)
- **App móvil/web QUELVO** (`D:\quelvo`): Expo (`com.eljuankd.quelvoapp`) + backend Fastify/Socket.IO. La URL de API es `http://10.0.0.6:3000` (nativo) o `http://<host>:3000` (web) ⇒ sólo funciona en la red local con el backend arrancado a mano. `http://eljuank.duckdns.org:3000` no responde. No hay backend desplegado en la nube ni build de producción publicada (EAS sólo con perfiles `development`/`preview` de distribución interna). Su base de datos está pausada.
- **Flujo legado** (`booking.js` → WhatsApp/Formspree): cubierto por el middleware (503) y por la guarda del `submit`.
- **Formulario de contacto** (Formspree): sigue activo para consultas; la opción "QUELVO — Book a ride" se deshabilita.
- **WhatsApp directo** (`wa.me/17863487458`): canal humano, no automatizable; fuera del alcance técnico.
- Conclusión: **ningún servicio público adicional acepta reservas hoy**. Se reactivaría sólo si alguien arranca el backend de la app y restaura `quelvo-prod`; en ese caso la app necesitaría su propio flag (no diseñado aquí).

### 1.3 Qué comparten con Survivor

| Recurso | ¿Compartido con Survivor? | ¿Lo tocamos? |
|---|---|---|
| Zona DNS `jcdmtech.com` (GoDaddy) | Sí (registro `survivor` CNAME) | **No** |
| Proyecto Vercel del sitio | No | Sí (sólo archivos de `jcdmtech/`) |
| Proyecto Vercel de OneSound / servicio Render | No | Sólo con autorización (§4) |
| Supabase `jcdmtech-prod` | No consta | Sí: tabla nueva + trigger sólo en `INSERT` de `bookings` |
| Servidor doméstico (`eljuank.duckdns.org`) | Es donde corre Survivor | **No** (sólo una petición HTTP de lectura al puerto 3000 para descartar la API de QUELVO) |
| Código / repos | No | No |

---

## 2. Flags — semántica única e inequívoca

| Dónde | Flag | `true` | `false` |
|---|---|---|---|
| `jcdmtech/js/maintenance.config.js` | `quelvo.maintenance` | QUELVO **suspendido** (503, botones ocultos) | QUELVO disponible |
| `jcdmtech/js/maintenance.config.js` | `onesound.maintenance` | Enlaces "Open app" ocultos en JCDM | Enlaces visibles |
| Supabase `public.jcdm_maintenance_flags` (`key='quelvo'`) | columna `maintenance boolean` | `INSERT` vía API en `bookings` **rechazado** (salvo admin) | Reservas abiertas |
| Render (OneSound, propuesto) | env `MAINTENANCE_MODE` | `"true"` ⇒ API 503 + Socket.IO rechazado | cualquier otro valor ⇒ normal |

Reglas:
- **Sólo el booleano literal `true` activa el mantenimiento.** En JS se compara `=== true`; un valor no booleano (p. ej. `"true"` entre comillas) cuenta como desactivado y escribe un `console.warn` (visible en los logs de la función de Vercel y en la consola del navegador).
- En SQL la columna es `boolean not null`; si falta la fila, las reservas quedan **abiertas** (nunca bloquea por accidente). Un `UPDATE 0` al conmutar significa que falta la fila.
- Rev. 1 usaba `enabled: true` (ambiguo: podía leerse como "plataforma activa") y una tabla `app_settings` con `jsonb` (nombre genérico con riesgo de colisión). Ambos se sustituyeron en la rev. 2.

---

## 3. QUELVO — capas del mecanismo

| Capa | Archivo | Con `quelvo.maintenance = true` | ¿Bloquea operaciones? |
|---|---|---|---|
| Flags | `jcdmtech/js/maintenance.config.js` | `globalThis.__MAINTENANCE__` | — |
| Routing Middleware (Vercel) | `jcdmtech/middleware.js` | En `/quelvo`, `/quelvo/*`, `/chofer-privado`, `/chofer-privado/*`: **503** + `Retry-After: 86400` + `X-Robots-Tag: noindex` + `Cache-Control: no-store`, cuerpo = `/maintenance/quelvo/` (o HTML mínimo EN/ES si la subpetición falla en 3 s). Sin redirecciones. Flag apagado ⇒ continúa la petición sin tocarla. | Sí (páginas) |
| Página | `jcdmtech/maintenance/quelvo/index.html` | Mensaje EN/ES, enlaces a Contact/Services/Home, `noindex` | — |
| Respaldo navegador | `<script src="/js/maintenance.config.js">` en `<head>` de las páginas QUELVO/legado | Si el middleware no corre, `location.replace('/maintenance/quelvo/')` (temporal, no SEO) | Visual |
| UI | `styles.css` + `data-maint-hide` / `data-maint-show` | Oculta "Book a Ride" y "Open app"; muestra avisos; deshabilita la opción QUELVO del contacto | Visual |
| Wizard | `quelvo/book/index.html` → `confirm4()` | Rechaza el envío antes del `insert` | Sí (cliente) |
| Legado | `js/booking.js` | Rechaza el envío WhatsApp/Formspree | Sí (cliente) |
| **Base de datos** | `docs/sql/quelvo-maintenance.sql` | Trigger `BEFORE INSERT` en `bookings`: rechaza llamadas API `anon`/`authenticated` que no sean admin | **Sí — bloqueo real** |

### 3.1 Compatibilidad del middleware con el proyecto estático (revisión punto 1)

Verificado con la documentación de Vercel (Routing Middleware, 2026-08) y con `vercel build` local (CLI 64.5.0) sobre una copia del sitio:

| Aspecto | Resultado |
|---|---|
| Detección | La convención de archivo busca `middleware.js`/`middleware.ts` en la raíz del proyecto (= `jcdmtech/`). El build genera `functions/middleware.func` y una ruta con `middlewarePath` para el matcher. |
| ES Modules sin `package.json` | La doc. pide `"type": "module"` o `.mjs` para *Functions* ESM sin framework; `.mjs` **no** vale para el middleware (`proxy.entrypoint` exige `.js`/`.ts`). En la práctica el builder **compila el ESM a CommonJS** ("Compiling middleware.js from ESM to CommonJS") y empaqueta `js/maintenance.config.js` junto al handler. Build OK. No se añade `package.json`. |
| Runtime | Sin `runtime`, el builder elegía `edge` (obsoleto; aviso explícito) con un `require()` de un archivo hermano — riesgo de fallo en ejecución. **Corregido:** `config.runtime = "nodejs"` ⇒ `.vc-config.json`: `nodejs24.x`, `useWebApi: true` (Request/Response estándar). |
| Continuar la petición | `next()` de `@vercel/functions@3.10.1` es exactamente `new Response(null, { headers: { "x-middleware-next": "1" } })` (código fuente revisado). El middleware usa ese mismo objeto sin añadir la dependencia. |
| Orden respecto a `vercel.json` | Los redirects de `vercel.json` se evalúan **antes** que el middleware: `/quelvo` → 308 → `/quelvo/` → 503; `/chofer-privado/reservar.html` → 307 → `/quelvo/book/` → 503. |
| Archivo público | `middleware.js` no se copia a la salida estática (`/middleware.js` → 404). |
| Artefacto compilado ejecutado | El `middleware.js` compilado por Vercel, ejecutado en Node 22 contra la salida estática: ON ⇒ 503 + página con estilo en 5 rutas; OFF ⇒ `x-middleware-next: 1`; valor `"true"` (string) ⇒ OFF. |
| Deployment Protection en Preview | La subpetición reenvía la cookie del visitante; con `curl` sin cookie se sirve el HTML mínimo (sigue siendo 503). |
| No verificable en local | Ejecución real en la infraestructura de Vercel ⇒ Preview (§6). |

### 3.2 Lo que NO cambia
- Ningún archivo borrado; landing, wizard y legado intactos salvo adiciones.
- `vercel.json` no se modifica. Registros de `bookings`, `vehicles`, `drivers`, `profiles` y usuarios: sin cambios.
- `/admin/`, `/login.html`, `/account.html` fuera del matcher. El admin sólo hace `select`/`update` sobre `bookings` (verificado en `admin/index.html`) ⇒ el trigger `INSERT` no le afecta.

### 3.3 SQL — dependencias y pruebas seguras (revisión punto 3)

Archivos: `docs/sql/quelvo-maintenance.sql` (preflight, instalación, conmutación, comprobaciones, desinstalación) y `docs/sql/quelvo-maintenance.test.sql` (prueba en seco).

Dependencias (evidencia del repo; confirmar con el preflight §0 del SQL antes de instalar):
- `public.bookings` (insertada por `quelvo/book/`), `public.profiles.role` (`'user'|'admin'`, `supabase-setup.sql`), `auth.uid()` (Supabase).
- Nombre nuevo `public.jcdm_maintenance_flags`: `create table` **sin** `if not exists`, para fallar en voz alta si el nombre ya existe.
- Quién queda bloqueado: claims JWT con `role` `anon` o `authenticated` y no admin. No bloqueados: `service_role`, sesiones SQL directas, admins.

Prueba en seco (`quelvo-maintenance.test.sql`): un único bloque `DO` que comprueba dependencias, instala (si no existe) el mismo mecanismo, lo engancha a una **tabla temporal** (nunca a `bookings`), simula 7 llamantes vía `request.jwt.claims` y termina **siempre** con un error intencionado ⇒ todo se revierte aunque el editor haga auto-commit. Resultado esperado: `DRY RUN FINISHED (everything rolled back) — 0 failure(s)` + 7 líneas `[PASS]`.

Verificado en local con PGlite 0.5.8 (Postgres en WebAssembly, sin puertos) y un esquema que imita Supabase — **19/19**: prueba en seco antes y después de instalar (sin dejar rastro, sin cambiar el flag real), cuerpo de la función idéntico en ambos archivos, instalación, segunda instalación falla con error claro, anon y usuario bloqueados, admin permitido, `update` del admin permitido, reabrir/re-suspender, filas históricas idénticas (id, código, estado, fecha), desinstalación limpia. Limitación: PGlite no es Supabase (no prueba PostgREST ni RLS reales).

---

## 4. OneSound — diseño preparado, **no aplicado**

Este repo **no puede** suspender OneSound: sólo oculta sus enlaces en JCDM (`onesound.maintenance`). **La app y su API
siguen públicas** hasta aplicar lo siguiente en su propio repo/infraestructura. Nada de OneSound se ha modificado.

### 4.1 Acceso necesario (pendiente de autorización)
1. Código **actual** de `github.com/eljuankd/jcdm-music-ride` (el zip local es del 2026-09-07).
2. Render: servicio de `jcdm-music-ride.onrender.com` → variables de entorno + redeploy (o lo hace el propietario).
3. Vercel: proyecto de `music-ride.jcdmtech.com`.
4. Confirmar si queda un servicio en Railway (el repo conserva `railway.json`).

### 4.2 Cambios propuestos (en el repo de OneSound)
**Backend `apps/server/src/index.ts`**, tras `app.use(express.json(...))` y antes de las rutas:
```ts
const maintenance = process.env.MAINTENANCE_MODE === "true";
const retryAfter = process.env.MAINTENANCE_RETRY_AFTER ?? "86400";
if (maintenance) {
  app.use("/api", (_req, res) => {
    res.status(503).set("Retry-After", retryAfter)
      .json({ error: "maintenance", message: "OneSound is temporarily unavailable while we improve our platform." });
  });
  io.use((_socket, next) => next(new Error("maintenance")));   // rechaza nuevas conexiones Socket.IO
}
```
- `/health` sigue 200 (health checks de Render). Cubre todas las rutas `/api/sessions/*` y el tiempo real.
- Cambiar la variable reinicia el servicio: las sesiones en memoria se cierran (efímeras).

**Frontend `apps/web`:** servir `docs/maintenance-templates/onesound-maintenance.html` con 503 + `Retry-After` (middleware de Vercel análogo, o flag `VITE_MAINTENANCE`).

### 4.3 Alternativa sin código
Render → **Suspend** (conserva configuración; "Resume" restaura) + pantalla en Vercel. No borrar servicios, bases de datos, volúmenes ni dominios.

---

## 5. Cómo activar — orden obligatorio (cada paso requiere autorización)

| # | Paso | Por qué en este orden |
|---|---|---|
| 1 | Commit en una rama (p. ej. `maintenance/quelvo-onesound`) + push ⇒ **Vercel Preview** — *hecho (`abc90c8`); el Preview falló por R-M9: falta corregir `vercel.json` con autorización* | Validar el middleware en infraestructura real |
| 2 | `scripts/verify-maintenance.sh <URL-del-Preview>` (con `VERCEL_BYPASS=<token>` si hay Deployment Protection) + revisión visual (§6) | 0 fallos esperados |
| 3 | Merge/push a `main` ⇒ producción; repetir el script contra `https://www.jcdmtech.com` | La web deja de ofrecer reservas **antes** de que la BD vuelva a aceptar escrituras |
| 4 | Restaurar `jcdmtech-prod` en Supabase | Necesario para admin y para instalar el trigger. Desde aquí hasta el paso 6, la API acepta `insert` con la anon key (ventana corta; la web ya está en 503) |
| 5 | SQL §0 (preflight) → anotar resultados; ejecutar `quelvo-maintenance.test.sql` → `0 failure(s)` | Detener si algo difiere |
| 6 | SQL §1 (instalar; queda `maintenance = true`) → §3 (comprobaciones) | Bloqueo real activo |
| 7 | OneSound: `onesound.maintenance` ya oculta los enlaces desde el paso 3; con acceso (§4.1), `MAINTENANCE_MODE=true` en Render + pantalla en Vercel, o Suspend | Suspensión real de OneSound |

## 6. Comprobaciones

**Antes** (sólo lectura): `bash scripts/verify-maintenance.sh https://www.jcdmtech.com` (línea base: hoy 6 fallos esperados — rutas QUELVO en 200 y archivos nuevos en 404); `curl -sI https://survivor.jcdmtech.com/` (anotar); `curl -s https://jcdm-music-ride.onrender.com/health`.

**En el Preview / tras desplegar:**
- Script: 0 fallos (QUELVO 503 + `Retry-After`; redirects de `vercel.json` intactos; `/`, `/services/`, `/projects/`, `/admin/`, `/maintenance/quelvo/` en 200; `/middleware.js` 404).
- **Regresión de URLs (riesgo R-M1):** la sección "URL-style" debe coincidir con producción: `/about.html` 200, `/about` 308 → `/about.html`. Ver §7.
- Visual: Home/Projects/footer sin "Book a Ride" ni "Open app", avisos en EN y ES; menú móvil; consola sin errores.
- Logs de la función `middleware` en Vercel: sin errores ni `console.warn` de flags.

### 6.1 Acceso al Preview protegido (Vercel Authentication)

Los Previews de este proyecto responden `302` hacia el login de Vercel. Opciones, de más a menos recomendable:

1. **Protection Bypass for Automation** (para el script y las pruebas automáticas):
   - Vercel → proyecto `jcdmtech-site` → Settings → Deployment Protection → *Protection Bypass for Automation* → generar secreto.
   - **No** pegarlo en el chat, en archivos del repo, en commits ni en informes. Guardarlo fuera del repo, p. ej. en
     PowerShell: `notepad $env:USERPROFILE\.vercel-bypass` (pegar, guardar) y restringir el acceso:
     `icacls "$env:USERPROFILE\.vercel-bypass" /inheritance:r /grant:r "$($env:USERNAME):R"`.
   - Uso sin imprimirlo: `VERCEL_BYPASS="$(cat ~/.vercel-bypass)" bash scripts/verify-maintenance.sh <url-preview>`
     (se envía sólo como cabecera `x-vercel-protection-bypass`; no usar la variante por parámetro de URL, que queda en logs).
   - Al terminar las pruebas: regenerar o eliminar el secreto en Vercel y borrar el archivo.
2. **Revisión manual**: abrir la URL del Preview en un navegador con sesión iniciada en Vercel.
3. Desactivar la protección de Previews: **no recomendado**.

**Tras el SQL:** preflight d) idéntico al snapshot; trigger presente (`tgenabled = 'O'`); admin lista y edita reservas. No crear reservas reales sin autorización.

**Survivor:** mismo código HTTP que antes.

## 7. Cómo reactivar (sin reconstruir nada)

### QUELVO
1. Supabase: `update public.jcdm_maintenance_flags set maintenance = false, updated_at = now() where key = 'quelvo';` → debe decir `UPDATE 1` (efecto inmediato).
2. `jcdmtech/js/maintenance.config.js` → `quelvo.maintenance: false`; desplegar.
3. Verificar: `/quelvo/` y `/quelvo/book/` → 200; botones visibles; recorrer los 4 pasos del wizard **sin** confirmar.
4. Opcional: desinstalar (SQL §4). No es necesario: con los flags en `false` el mecanismo no actúa.

### OneSound
1. `onesound.maintenance: false` y desplegar JCDM.
2. Render: `MAINTENANCE_MODE=false` (o quitar la variable) o **Resume**.
3. Retirar la pantalla en el Vercel de OneSound. Verificar `/health` 200 y crear/unirse a una sesión de prueba.

## 8. Riesgos pendientes

| ID | Riesgo | Mitigación |
|---|---|---|
| R-M9 | **[CORRECCIÓN APLICADA EN LA RAMA, opción B elegida por el propietario]** — ver §8.1. **Producción congelada desde el 2026-08-02 y Preview fallido.** El estado de GitHub de cada commit muestra que Vercel falla en todos los despliegues desde `569df74` (y en `4d0350a` y en el Preview `abc90c8`); el último correcto es `29c4b6f` (2026-06-30), que es lo que sirve producción (comprobado: `privacy.html` en producción = versión de `29c4b6f`; la 404 personalizada no está publicada). `569df74` añadió a `vercel.json` `cleanUrls`, `trailingSlash` y `errors`; **`errors` no es una propiedad documentada de `vercel.json`** y el estado enlaza a la documentación de configuración ⇒ causa casi segura (logs no consultados: requieren acceso a Vercel). | Requiere un commit en `vercel.json` (zona protegida) **autorizado**. Opciones validadas con `vercel build` local: **A** quitar sólo `errors` (cambia URLs `.html`, ver R-M1); **B (recomendada)** quitar `errors`, `cleanUrls` y `trailingSlash` = mismo comportamiento que producción hoy; la 404 personalizada funciona sin configuración. Cualquier merge futuro a `main` publicará también `569df74` y `4d0350a`. |
| R-M1 | **Cambio de URLs `.html`** si se despliega `vercel.json` con `cleanUrls`/`trailingSlash` (añadidos en `569df74`, nunca publicados). **Resuelto en la rama** con la opción B (se retiran; URLs como en producción). Retomar `cleanUrls` sólo dentro de P-002 (Fase 8). | — |
| R-M2 | Middleware sin probar en la infraestructura real de Vercel | Preview obligatorio. Respaldo: redirección en cliente + trigger SQL. |
| R-M3 | Supabase pausado: admin sin acceso; restaurarlo reabre la API de `bookings` hasta instalar el trigger; posible re-pausa por inactividad; plazo de restauración | Orden de §5; confirmar plazo en el panel; considerar plan de pago o tráfico periódico si el admin debe seguir accesible. |
| R-M4 | OneSound sigue público | Requiere acceso (§4.1). |
| R-M5 | 503 prolongado (semanas) puede desindexar las URLs de QUELVO | Reevaluar si la pausa se alarga. |
| R-M6 | Esquema real de Supabase no verificado (sólo evidencia del repo + PGlite) | Preflight §0 y prueba en seco antes de instalar. |
| R-M7 | App QUELVO (`D:\quelvo`) sin flag propio | Hoy no es pública; si se despliega, necesitará su propio mantenimiento. |
| R-M8 | Formspree y WhatsApp siguen recibiendo mensajes | Canales humanos; se deshabilita la opción de reserva del contacto. |

### 8.1 Despliegues de Vercel — hechos confirmados vs. hipótesis (2026-10-19)

**Confirmado** (evidencia directa):
- Estado de GitHub (`Vercel`) = `failure` para `569df74`, `4d0350a` y el Preview `abc90c8`; `success` para `29c4b6f` y anteriores.
- Producción sirve `29c4b6f`: MD5 de `/privacy.html` en producción = versión de `29c4b6f` (≠ `4d0350a`); `/404.html` responde 404 genérico de Vercel.
- `569df74` es el único commit que modificó `vercel.json` tras `29c4b6f`: añadió `cleanUrls`, `trailingSlash` y `errors`.
- `errors` no figura entre las propiedades documentadas de `vercel.json`.
- El estado de `569df74` enlaza a la documentación de configuración de proyectos de Vercel.
- `vercel build` local (CLI 64.5.0) **no** falla con `errors` (no valida el esquema como la plataforma).
- Corrección (opción B): `jcdmtech/vercel.json` idéntico al de `29c4b6f` (`git diff 29c4b6f` vacío); 22 redirects intactos; build local OK, middleware compilado (`nodejs24.x`), 0 reglas `cleanUrls`/`trailingSlash`, ruta 404 → `/404.html`, artefacto ejecutado: 503 + `Retry-After` en las rutas QUELVO.

**Hipótesis** (sin logs de Vercel, que requieren acceso a la cuenta):
- Que la causa del fallo sea la validación del esquema de `vercel.json` por la propiedad `errors`. La confirmará (o refutará) el resultado del Preview tras la corrección.
- Que la 404 personalizada se sirva en Vercel sin configuración (el build local genera la ruta `→ /404.html`; falta comprobarlo en el Preview).
- Que el middleware se ejecute en la infraestructura de Vercel igual que el artefacto en Node local.

## 9. Archivos que intervienen

- `jcdmtech/js/maintenance.config.js` — flags (único archivo a editar para conmutar el sitio)
- `jcdmtech/middleware.js` — 503 (Routing Middleware, runtime Node.js)
- `jcdmtech/maintenance/quelvo/index.html` — página de mantenimiento
- `jcdmtech/styles.css` — reglas `data-maint-hide` / `data-maint-show` / `.maint-note`
- `jcdmtech/js/app.js` — `ensureMaintenanceConfig()` carga el flag donde no está en `<head>`
- Marcado: `index.html`, `projects/index.html`, `music-ride/index.html`, `contact.html`, `partials/footer.html`
- Respaldo cliente: `<script>` en `<head>` de `quelvo/index.html`, `quelvo/book/index.html`, `quelvo/book/gracias/index.html`, `chofer-privado/{index,reservar,gracias}.html`
- Guardas de envío: `quelvo/book/index.html` (`confirm4`), `js/booking.js`
- `docs/sql/quelvo-maintenance.sql`, `docs/sql/quelvo-maintenance.test.sql` — BD (no publicados)
- `scripts/verify-maintenance.sh` — comprobaciones HTTP de sólo lectura (no publicado)
- `docs/maintenance-templates/onesound-maintenance.html` — plantilla para el repo de OneSound (no publicada)

Semántica de los atributos: `data-maint-hide="a b"` oculta si **cualquiera** de los flags está activo; `data-maint-show="a b"` muestra sólo si **todos** lo están.
