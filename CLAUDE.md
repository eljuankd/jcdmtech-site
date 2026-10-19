# CLAUDE.md — JCDM Technologies LLC (jcdmtech.com)

Instrucciones persistentes para cualquier sesión de Claude Code en este repositorio.
Última revisión: 2026-10-19 (Fase 1 — Auditoría).

---

## 0. Lectura obligatoria al iniciar cada sesión

Antes de proponer o editar nada, lee en este orden:

1. `CLAUDE.md` (este archivo)
2. `docs/PROJECT_CONTEXT.md` — qué es la empresa y qué se quiere lograr
3. `docs/PROJECT_STATUS.md` — en qué fase estamos, bloqueos y próximo paso
4. Los documentos pertinentes a la tarea:
   - Rutas / redirects / SEO → `docs/ROUTES.md`, `docs/SITE_ARCHITECTURE.md`
   - Estilos / UI → `docs/DESIGN_SYSTEM.md`
   - Decisiones previas → `docs/DECISIONS.md`
   - Riesgos y deuda técnica → `docs/PROJECT_AUDIT.md`
   - Pendientes → `docs/TODO.md`

`AI_PROJECT_CONTEXT.md` (raíz) es un documento **histórico** (marzo 2026): describe nombres de archivo en español
(`contacto.html`, `mi-cuenta.html`…) y un proyecto Supabase anterior que ya no aplican. No lo uses como fuente de verdad.

---

## 1. Reglas permanentes

1. Antes de cada sesión, leer `CLAUDE.md`, `docs/PROJECT_CONTEXT.md`, `docs/PROJECT_STATUS.md` y los documentos pertinentes.
2. Inspeccionar el estado real del proyecto y los cambios de Git (`git status`, `git log -10`) antes de editar.
3. Analizar en profundidad los módulos afectados antes de modificarlos. No es necesario releer archivos sin relación con la tarea.
4. Respetar las decisiones arquitectónicas documentadas en `docs/DECISIONS.md`. Para cambiar una, registrar una nueva decisión que la reemplace.
5. Trabajar en fases controladas (ver plan en `docs/TODO.md` y `docs/PROJECT_STATUS.md`). No adelantar trabajo de fases futuras sin autorización.
6. Actualizar `docs/IMPLEMENTATION_LOG.md` después de cada cambio significativo.
7. Documentar en la bitácora: archivos modificados, motivo, pruebas realizadas y resultado.
8. No eliminar funcionalidades existentes sin verificar sus dependencias (buscar referencias con grep en HTML, JS, partials, `vercel.json`, `sitemap.xml`).
9. Proteger **Music Ride** y los **flujos de reserva** (ver sección 3).
10. Nunca inventar integraciones, precios, servicios o funcionalidades que no existen. Si un texto de marketing no puede verificarse en el código o con el propietario, márcalo como "pendiente de validar" en lugar de afirmarlo.
11. No realizar despliegues productivos, `git push`, modificaciones de producción (incluida la base de datos Supabase) ni cambios de secretos/claves sin autorización explícita del propietario **en esa misma sesión**.
    - Nota: `.claude/settings.local.json` permite `git push *` sin confirmación. Esa permisión **no** constituye autorización: esta regla prevalece.
    - Todo push a `main` despliega automáticamente en Vercel → producción.
12. Al finalizar cada sesión, actualizar `docs/PROJECT_STATUS.md` con lo completado, pendientes, bloqueos y próximo paso.
13. Entregar un resumen claro para continuar en futuras sesiones, incluso si se pierde el contexto de la conversación.

Reglas adicionales derivadas de la auditoría:

- **Hechos vs. planes:** en la documentación, separar siempre lo verificado en el código/producción de lo planificado.
- **Secretos:** no imprimir en la salida ni copiar a documentos la anon key de Supabase ni la API key de Google Maps. Referirse a ellas por archivo.
- **Repositorio público** (`github.com/eljuankd/jcdmtech-site`): no versionar secretos ni detalles de explotación de vulnerabilidades abiertas. SQL fuera de `jcdmtech/` (en `supabase/`); nada interno en la raíz publicada (D-015).
- **Commits:** sólo cuando el usuario lo pida. Formato convencional `tipo(ámbito): descripción` (ver `git log`).

---

## 2. Datos esenciales del proyecto (verificados 2026-10-19)

| Aspecto | Valor |
|---|---|
| Tipo | Sitio estático multipágina (MPA): HTML + CSS + JavaScript vanilla. Sin framework, sin build, sin `package.json`. |
| Raíz del sitio | `jcdmtech/` (todo lo publicado vive aquí; `vercel.json` está en esta carpeta) |
| Hosting | Vercel. Producción `https://www.jcdmtech.com` (el apex redirige 307 a `www`). **Producción NO coincide con `main`:** sirve el commit `29c4b6f` (2026-06-30); todos los despliegues desde `569df74` (2026-08-02) fallan (estado de GitHub verificado 2026-10-19; causa inferida, logs no consultados: propiedad no válida `errors` en `vercel.json`, ver `docs/MAINTENANCE_MODE.md` §8.1). Corrección (opción B: `vercel.json` = versión de `29c4b6f`) aplicada en la rama `maintenance/quelvo-onesound`; `main` sin corregir. |
| Servidor local | VS Code Live Server con raíz `/jcdmtech` (`.vscode/settings.json`). Los partials se cargan con `fetch()`, por lo que **no funciona abriendo los HTML con `file://`**. |
| Backend | Supabase (Auth + Postgres) consumido desde el navegador. Config en `jcdmtech/js/supabase.config.js`. |
| CSS global | `jcdmtech/styles.css` + mucho CSS inline por página (ver `docs/DESIGN_SYSTEM.md`). |
| JS compartido | `jcdmtech/js/app.js` (partials, nav, tema, idioma, auth nav). |
| Partials | `jcdmtech/partials/header.html`, `jcdmtech/partials/footer.html`, inyectados en `#header` / `#footer`. |
| Tests / lint / CI | No existen. |

---

## 3. Zonas protegidas — no romper

| Zona | Archivos | Qué protege |
|---|---|---|
| Reserva QUELVO (actual) | `jcdmtech/quelvo/book/index.html` | Wizard de 4 pasos, cálculo de precio con Google Maps, `insert` en tabla Supabase `bookings`. |
| Gestión de reservas | `jcdmtech/admin/index.html` | Listado/edición de `bookings`, `vehicles`, `drivers`. Requiere `profiles.role = 'admin'`. |
| Reserva legado | `jcdmtech/js/booking.js`, `jcdmtech/chofer-privado/reservar.html`, `jcdmtech/quelvo/book/gracias/index.html` | Flujo WhatsApp/Formspree. En producción `reservar.html` redirige (307) a `/quelvo/book/`, pero el código sigue en el repo. |
| Auth | `jcdmtech/login.html`, `jcdmtech/js/safe-next.js`, `jcdmtech/reset-password.html`, `jcdmtech/account.html`, `setupAuthNav()` en `js/app.js` | Sesión Supabase, perfil, preferencias tema/idioma. `safe-next.js` valida el destino tras el login (J-03): no relajarlo sin pruebas. |
| Music Ride | `jcdmtech/music-ride/index.html` + enlaces a `https://music-ride.jcdmtech.com` | La **aplicación** Music Ride NO está en este repositorio; aquí sólo hay la landing y enlaces. No cambiar la URL del subdominio ni romper los enlaces. |
| Redirects y cabeceras | `jcdmtech/vercel.json`, `jcdmtech/.vercelignore` | URLs heredadas (`/chofer-privado/*`, `*.html` en español) y cabeceras de seguridad (CSP en Report-Only, D-014). Cambiar con cuidado: afecta SEO, enlaces externos/QR y lo que se publica. |
| Contacto QR | `jcdmtech/qrcard.html`, `jcdmtech/files/juan-carlos-delgado.vcf` | Tarjetas físicas con QR apuntan aquí. |

Antes de tocar una zona protegida: leer el archivo completo, buscar todas sus referencias y describir en la bitácora cómo se probó.

---

## 4. Cómo probar cambios (no hay suite automatizada)

1. `node --check jcdmtech/js/*.js` para sintaxis de JS externo; `node --test scripts/tests/safe-next.test.mjs`; SQL de seguridad: `JCDM_TOOLS=<carpeta con @electric-sql/pglite> node scripts/tests/security-rls.pglite.mjs` (ver `docs/SECURITY_REMEDIATION.md`).
2. Servir `jcdmtech/` con Live Server (o `npx serve jcdmtech`) y revisar en navegador:
   - Header/footer cargan, menú móvil (<880px), toggle tema y toggle ES/EN.
   - Consola sin errores.
3. Enlaces internos: comprobar que cada `href="/..."` / `src="/..."` existe (ver script en `docs/PROJECT_AUDIT.md` §9).
4. Reserva: recorrer los 4 pasos de `/quelvo/book/` **sin pulsar "Confirm booking"** salvo que el propietario autorice crear una reserva de prueba en la base real (no hay entorno de staging).
5. Redirects: sólo verificables en un Preview de Vercel o en producción (peticiones `curl -I` de solo lectura).

---

## 5. Convenciones

- HTML semántico; IDs de DOM explícitos; clases utilitarias existentes (`section`, `container`, `card`, `btn`, `btn-primary`, `muted`).
- JS vanilla, `camelCase`, IIFE o `type="module"`; Supabase vía `https://esm.sh/@supabase/supabase-js@2`.
- Escapar todo dato dinámico antes de insertarlo con `innerHTML` (el admin usa una función `esc()`).
- Traducción: atributo `data-es="…"` sobre elementos con texto en inglés; `applyLang()` en `app.js` lo intercambia. Idioma por defecto: inglés.
- Tema: oscuro por defecto; clase `.light-mode` en `<html>`.
- Nombres de archivo en inglés y kebab-case (decisión D-005).
- Commits convencionales: `feat(ámbito): …`, `fix(…)`, `refactor(…)`, `docs(…)`.
