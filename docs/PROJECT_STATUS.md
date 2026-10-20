# Estado del proyecto

- **Última actualización:** 2026-10-19
- **Fase actual:** Fase 1 completada → **siguiente: Fase 2 (Rediseño de Home)**, pendiente de aprobación
- **Trabajo intercalado:** suspensión temporal de QUELVO y OneSound (D-013) — **commiteada en la rama de mantenimiento y probada en Preview; NO publicada en producción**
- **Seguridad (2026-10-19):** hotfix R1 (`4ef6506`) **publicado en producción**: J-03, J-04, J-05 (CSP en Report-Only). **Pendiente:** J-01/J-02/J-06 (migración RLS sólo en la rama de mantenimiento, **no ejecutada**; Supabase INACTIVE) y OneSound O-01…O-05. Repo **público**: no documentar detalles de explotación.
  - *Histórico del día:* remediación commiteada en la rama (`c4516e3`…`c10ce02`), Preview `success` (`jcdmtech-site-nvgubpe83-…`); hotfix independiente `hotfix/security-2026-10` con Preview `success` (`jcdmtech-site-plc4kclv7-…`), local 139/139, revisado y autorizado por el propietario.
- **Ramas (verificado tras `git fetch`, 2026-10-19):**
  | Ref | Commit | Nota |
  |---|---|---|
  | `origin/main` | `4ef6506` | = producción |
  | `origin/hotfix/security-2026-10` = local | `4ef6506` | misma punta que `origin/main` |
  | `origin/maintenance/quelvo-onesound` = local | `c10ce02` | 10 commits sobre `4d0350a`; flags de suspensión en `true` |
  | `main` **local** | `4d0350a` | **5 commits detrás** de `origin/main` (sin divergencia; fast-forward posible). Causa: el push del hotfix se hizo `4ef6506:refs/heads/main` desde el worktree del hotfix, sin mover la rama local. No se ha tocado (sin autorización). |
  Documentación posterior a `c10ce02` **sin commit** (ver §0d).
- **Producción (2026-10-19):** `https://www.jcdmtech.com` sirve **`4ef6506`** = `origin/main` (deployment Vercel GitHub `7185173081`, `success`). Despliegues desbloqueados. Pruebas en producción: 110/110 HTTP, 139/139 navegador. QUELVO y OneSound abiertos (200). Legales = versiones de `29c4b6f`; sin `404.html` propia (404 estándar de Vercel). Recuperación: Instant Rollback al despliegue de `29c4b6f` (`5259892954`). *Antes:* `29c4b6f` (despliegues fallidos desde `569df74`, R-M9). `CLAUDE.md` §2 actualizado.
- **Vercel Preview de `fd31034`:** **compila (`success`)** — `https://jcdmtech-site-d12mqr6yd-juanks-projects-50846d74.vercel.app` — protegido con Vercel Authentication; pruebas funcionales pendientes de acceso (§6.1 de MAINTENANCE_MODE). Commits en la rama: `70479ca`, `abc90c8`, `fd31034`. *(Superado por el Preview de `c10ce02`, revisado por el propietario: QUELVO 503 + `Retry-After`, cabeceras, archivos internos 404.)*

### Estado por nivel (2026-10-19)

| Elemento | Local | Preview | Producción |
|---|---|---|---|
| J-03 / J-04 / J-05 (seguridad web) | ✅ | ✅ | ✅ `4ef6506` |
| CSP | Report-Only | Report-Only | **Report-Only** (no bloqueante) |
| `vercel.json` corregido (R-M9) | ✅ | ✅ | ✅ |
| Suspensión QUELVO (middleware 503, avisos) | ✅ rama | ✅ `c10ce02` (revisado) | ❌ no publicada — QUELVO abierto |
| Avisos / enlaces ocultos de OneSound en JCDM | ✅ rama | ✅ | ❌ no publicados |
| Suspensión real de OneSound (su backend/app) | ❌ no implementada (otro repo) | — | ❌ — OneSound activo |
| Migración RLS J-01/J-02/J-06 | ✅ rama (PGlite 83/83) | n/a | ❌ **no ejecutada**; Supabase INACTIVE |
| SQL de bloqueo de reservas (D-013) | ✅ rama (PGlite 19/19) | n/a | ❌ no ejecutado |
| Textos legales nuevos + `404.html` | en historial (`4d0350a`, `569df74`) y en la rama de mantenimiento | — | ❌ retirados temporalmente (`4ef6506`) |
| Archivos históricos (`archive/copy.zip`, `supabase/legacy/supabase-setup.sql`) | en el repo público | — | ya no se sirven (404) |
| Survivor Sports | sin cambios | — | sin cambios, independiente |

---

## 0a. Seguridad — Fase 1 de remediación (2026-10-19; actualizado tras la publicación de `4ef6506`)

| Tema | Estado | Siguiente paso |
|---|---|---|
| J-03 login `next` | **En producción** (`4ef6506`; antes: corregido en local, pruebas 4/4 + navegador) | Mantener; no relajar `safe-next.js` |
| J-04 `copy.zip`, `supabase-setup.sql` | **En producción**: 404. Los archivos siguen en el repo público (`archive/`, `supabase/legacy/`) | Decidir si se retiran del historial/árbol público (requiere autorización; no borrar sin ella) |
| J-05 cabeceras | **En producción**; CSP **Report-Only** (0 violaciones en las pruebas locales, 16 páginas) | Revisar violaciones reales → CSP bloqueante (fase posterior) |
| J-01/J-02/J-06 Supabase | Migración + preflight + verify + rollback; PGlite 83/83; **no ejecutada**; sólo en la rama de mantenimiento | Autorización: restaurar Supabase y `SECURITY_REMEDIATION.md` §4.4 |
| OneSound O-01…O-05 | Documentado en `docs/private/` (no versionado; repo público). Nada implementado | Fase independiente, en el repo de OneSound |

> **Actualización 2026-10-19 (sincronización local hecha, sin push):** commit documental `dbd555c` + merge `--no-ff`
> `4585d9e` (`origin/main` → mantenimiento) en la rama **local** `maintenance/quelvo-onesound` (7 commits por delante de
> `origin/maintenance/quelvo-onesound` = `c10ce02`). Respaldo local: `backup/maintenance-pre-main-sync-2026-10-19` = `dbd555c`.
> `origin/main` sigue en `4ef6506`; `main` local sigue en `4d0350a`. Pruebas locales en la bitácora (navegador 88/88,
> PGlite RLS 83/83, login 4/4). Copia privada permanente: `D:\JCDM-private-backups\2026-10-19-pre-merge\`.
> Sin cambios en producción: mantenimiento preparado pero **no activo**; `privacy.html`/`terms.html` (versiones de `29c4b6f`) y
> la retirada de `404.html` se mantienen; Supabase sigue INACTIVE y **no se ha ejecutado ningún SQL**.
> **Pendiente:** autorización de push a la rama de mantenimiento (genera Preview).

## 0b. Sincronización `main` → `maintenance/quelvo-onesound` (pasos 1–5 ejecutados en local el 2026-10-19; push pendiente)

Simulación no destructiva (2026-10-19, `git merge-tree --write-tree maintenance/quelvo-onesound origin/main`, Git 2.49):
- Base común `4d0350a`. `origin/main` aporta 5 commits: `324ecfc`, `fee2858`, `c9611e1`, `d30c02c`, `4ef6506`.
  `fee2858`/`c9611e1`/`d30c02c` son patch-equivalentes a `c4516e3`/`bc9b189`/`b6b821d` de la rama (`git cherry`);
  `324ecfc` equivale al `vercel.json` de `fd31034`.
- **Resultado: sin conflictos** (árbol `e0ec7f2`). Único cambio en la rama: `jcdmtech/404.html` eliminado y
  `privacy.html`/`terms.html` vueltos a las versiones de `29c4b6f` (efecto de `4ef6506`).
- `vercel.json`, `.vercelignore`, `login.html`, `js/safe-next.js`: idénticos en ambas ramas ⇒ middleware y cabeceras ya
  probados juntos en el Preview de `c10ce02`. El 503 del middleware envía las cabeceras básicas (nosniff, XFO, Referrer-Policy);
  no repite Permissions-Policy ni la CSP Report-Only (sin impacto: la CSP no bloquea).
- Se conservan intactos: suspensión (`middleware.js`, `maintenance.config.js`, `maintenance/quelvo/`, marcado `data-maint-*`),
  migración `supabase/migrations/2026-10-19-security-rls*.sql`, `docs/sql/`, pruebas, documentación.
- Pruebas: `serve-vercel-output.mjs` y `e2e-security.mjs` no dependen de `404.html` (respuesta "Not found" por defecto).

**Dirección:** sólo `main` → mantenimiento. **Nunca mantenimiento → `main`** mientras `maintenance.config.js` tenga
`quelvo.maintenance: true` / `onesound.maintenance: true`: publicaría la suspensión.

Procedimiento propuesto (cada paso requiere autorización):
1. Commit de la documentación pendiente en la rama de mantenimiento (§0d), para no fusionar con el árbol sucio.
2. `git fetch origin`; comprobar `origin/main` = `4ef6506` y `origin/maintenance/quelvo-onesound` = punta local.
3. `git switch maintenance/quelvo-onesound` y `git merge --no-ff origin/main -m "merge: sync production hotfix 4ef6506 into maintenance"`.
4. Verificar: `git diff c10ce02 HEAD --stat` = sólo los 3 archivos de §0c (+ docs del paso 1);
   `git diff origin/main HEAD -- jcdmtech/vercel.json jcdmtech/.vercelignore jcdmtech/login.html jcdmtech/js/safe-next.js` vacío;
   `maintenance.config.js`, `middleware.js` y `supabase/migrations/` sin cambios respecto a `c10ce02`.
5. Pruebas locales: `node --check`, `safe-next` 4/4, PGlite 83/83, `vercel build` + `e2e-security.mjs`.
6. Push **sólo** a `maintenance/quelvo-onesound` (Preview; no afecta a producción). Sin `--force`.
7. Opcional: `git switch main && git merge --ff-only origin/main` para alinear `main` local (no cambia el remoto).

Recuperación antes del push: `git merge --abort` (si quedó a medias) o volver a `c10ce02` con una rama de respaldo
creada antes del paso 3 (`git branch backup/maintenance-c10ce02 c10ce02`); nunca `reset --hard` sin autorización.

## 0c. Textos legales y 404 retirados temporalmente (`4ef6506`)

| Archivo | Producción / `origin/main` | Versión nueva (en historial) |
|---|---|---|
| `jcdmtech/privacy.html` | blob `ce65830` (= `29c4b6f`) | blob `4f7f7ba` (`4d0350a`) |
| `jcdmtech/terms.html` | blob `8e48261` (= `29c4b6f`) | blob `9169e1c` (`4d0350a`) |
| `jcdmtech/404.html` | no existe (404 estándar de Vercel) | blob `616111d` (`569df74`) |

- La rama de mantenimiento **no** modificó estos archivos tras `4d0350a` ⇒ una fusión adopta la retirada **sin conflicto
  y sin aviso**. Revisar los tres archivos después de cada fusión.
- Recuperabilidad verificada por simulación: `git revert 4ef6506` aplica limpio sobre `origin/main` y también sobre el
  resultado simulado de la fusión, y restaura exactamente los blobs `4f7f7ba`, `9169e1c`, `616111d`.
- Ninguna fusión elimina la posibilidad de recuperarlos: los commits `4d0350a` y `569df74` siguen en `main`.

Procedimiento de reincorporación (tras revisión legal y aprobación del propietario; **no ejecutado**):
1. Revisión del contenido (`git show 4d0350a:jcdmtech/privacy.html`, `…terms.html`, `git show 569df74:jcdmtech/404.html`); anotar cambios pedidos.
2. Rama nueva desde `origin/main` (p. ej. `legal/reinstate-2026`) → `git revert --no-edit 4ef6506` (+ commits con las correcciones de la revisión).
3. Comprobar: sólo cambian esos 3 archivos; `vercel build` local genera la ruta 404 → `/404.html`; enlaces internos; EN/ES.
4. Push a esa rama → Preview → revisión del propietario → autorización → merge a `main` (producción).
5. Después, sincronizar `main` → mantenimiento como en §0b.

## 0d. Copias de seguridad de la documentación (rama de mantenimiento)

Copia privada permanente (2026-10-19, fuera del repo, verificada con SHA-256): `D:\JCDM-private-backups\2026-10-19-pre-merge\`
— documentos previos al commit `dbd555c`, patch, plan privado de OneSound y `MANIFEST.txt`. Incluye la copia anterior,
hecha en una carpeta temporal de la sesión (ruta local omitida aquí). La documentación quedó commiteada en `dbd555c` y en
el commit siguiente.

Pruebas: `node --test scripts/tests/safe-next.test.mjs`; `JCDM_TOOLS=… node scripts/tests/security-rls.pglite.mjs`; navegador 88/88 con `scripts/tests/e2e-security.mjs` contra la salida de `vercel build` servida por `scripts/tests/serve-vercel-output.mjs` (SECURITY_REMEDIATION §7).
Bloqueo: B-6 (hotfix de R-03) **resuelto y publicado en producción** (`4ef6506`; antes: resuelto en la rama).

## 0. Suspensión temporal de QUELVO y OneSound (2026-10-19)

Procedimiento completo: `docs/MAINTENANCE_MODE.md`. Bitácora: `IMPLEMENTATION_LOG.md` (entrada del 2026-10-19).

| Plataforma | Estado real | Qué falta para activarla |
|---|---|---|
| QUELVO (web) | Preparado en la rama `maintenance/quelvo-onesound` (`c10ce02`); pruebas de navegador locales 39/39; Preview revisado por el propietario (503 + `Retry-After`). **No publicado:** en producción `/quelvo/` y `/quelvo/book/` responden 200 con el wizard | Sincronizar `main` → rama (§0b) → autorización expresa de activar la suspensión en producción |
| QUELVO (base de datos) | SQL + prueba en seco listos (PGlite 19/19), **no aplicados**. Supabase `jcdmtech-prod` **INACTIVE** (admin, login y `insert` del wizard fallan en producción) | Autorizar restaurar el proyecto **después** del despliegue web de la suspensión, luego preflight → prueba en seco → instalar |
| QUELVO app (`D:\quelvo`) | Sólo desarrollo local; no pública; Supabase `quelvo-prod` INACTIVE | Nada mientras no se despliegue |
| OneSound | **No suspendido.** Avisos y ocultación de enlaces preparados sólo en la rama de mantenimiento (no publicados). App (`music-ride.jcdmtech.com`) y API (Render) siguen públicas; la suspensión real en su backend **no está implementada** | Acceso y autorización: repo `jcdm-music-ride`, Render, Vercel de OneSound |
| Survivor | Sin cambios; independiente (servidor propio, DuckDNS) | Nada |

Riesgos abiertos: `docs/MAINTENANCE_MODE.md` §8 (R-M1…R-M8). El más relevante para el Preview es **R-M1** (posible cambio de comportamiento de URLs `.html` en cualquier despliegue nuevo).

Fases 4 y 5 en pausa mientras dure la suspensión.

---

## 1. Completado en la última sesión (Fase 1)

- Auditoría técnica completa → `docs/PROJECT_AUDIT.md`
- `CLAUDE.md` con las 13 reglas permanentes y las zonas protegidas
- Documentación actualizada: contexto, arquitectura, diseño, rutas, decisiones, TODO por fases, changelog, bitácora
- Ningún cambio en el código del sitio

## 2. Estado por fase

| Fase | Estado |
|---|---|
| 1 Auditoría y documentación | ✅ Completada (verificación Supabase bloqueada) |
| 2 Home | ⏳ Planificada (plan en §4) |
| 3 Services | ⏳ |
| 4 QUELVO y reservas | ⏳ — bloqueada por acceso al esquema Supabase |
| 5 Music Ride | ⏳ — requiere información de la app externa |
| 6 Projects | ⏳ |
| 7 About, Contact, Footer | ⏳ |
| 8 SEO, rutas, responsive, a11y, pruebas | ⏳ |

## 3. Bloqueos y decisiones pendientes del propietario

| # | Tema | Necesario para |
|---|---|---|
| B-1 | Acceso al esquema/RLS reales de Supabase (MCP dio timeout; alternativa: exportar SQL desde el panel) | Fase 4 |
| B-2 | Aprobar lenguaje visual principal (P-001) | Inicio de Fase 2 |
| B-3 | Validar afirmaciones [POR VALIDAR] (confirmación instantánea, email de confirmación, flight tracking, Music Ride en cada viaje, Stripe/pagos, React Native, precios) | Fases 2–7 |
| B-4 | Información de la app Music Ride (repositorio, sesiones, parámetros) | Fase 5 |
| B-5 | Email oficial (`contacto@` vs `info@`) | Fase 7 |
| B-6 | ~~Hotfix de R-03~~ → **resuelto: publicado en producción** (`4ef6506`, 2026-10-19) | Seguridad |
| B-7 | ~~¿Autoriza commit de la documentación de Fase 1?~~ → commiteada (`70479ca`, `c10ce02`) | Cierre de Fase 1 |
| B-8 | Revisión legal y aprobación de `privacy.html`/`terms.html` nuevos y de `404.html` (§0c) | Reincorporarlos a producción |
| B-9 | Autorizar commit de la documentación pendiente (§0d) y la sincronización `main` → mantenimiento (§0b) | Mantener la rama al día con producción |
| B-10 | Autorizar restaurar Supabase y ejecutar la migración RLS (J-01/J-02/J-06) | Seguridad de datos; login/admin |

## 4. Plan detallado para la Fase 2 — Rediseño de Home

**Alcance:** `jcdmtech/index.html`, imágenes `jcdmtech/assets/home/*`, y adiciones (no renombres) en `jcdmtech/styles.css`.
**Fuera de alcance:** header/footer (sólo ajustes mínimos si son imprescindibles; rediseño en Fase 7), Services, QUELVO, reserva, auth, admin.

### Paso 0 — Preparación (sin código)
1. Confirmar B-2 (lenguaje visual) y B-3 para los textos de Home.
2. Capturas de referencia "antes" de Home a 375 / 768 / 1280 px, tema oscuro y claro, EN y ES.
3. Lighthouse local de Home como línea base (rendimiento, accesibilidad, SEO).

### Paso 1 — Tokens y base de estilos
1. Añadir en `styles.css` los tokens consolidados (DESIGN_SYSTEM §5) **sin eliminar** los existentes.
2. Sustituir `--jh-*` de Home por los tokens globales; definir variantes `.light-mode`.
3. Añadir bloque `@media (prefers-reduced-motion: reduce)` global.
4. Verificar que las demás páginas no cambian (comparar capturas de services, about, login, admin).

### Paso 2 — Estructura de contenido de Home (propuesta a validar)
1. **Hero:** propuesta de valor de JCDM, 2 CTAs (Services, Contact) + acceso secundario a QUELVO.
2. **Cinco servicios:** 4 tarjetas técnicas + QUELVO como quinta línea, cada una con enlace real.
3. **Plataformas propias:** QUELVO y Music Ride (texto validado; sin "every ride includes").
4. **Por qué JCDM:** 3–4 puntos sin cifras inventadas.
5. **Proyectos destacados:** enlace a `/projects/` (contenido detallado en Fase 6).
6. **CTA final:** contacto / WhatsApp.
7. Mantener JSON-LD existente y revisar que coincide con el contenido.

### Paso 3 — Imágenes
1. Convertir `hero-miami-skyline.png` y `service-*.png` a WebP (y AVIF opcional) con anchos 640/1280/1920; objetivo hero < 300 KB.
2. Usar `<img>`/`<picture>` con `srcset`, `width/height`, `fetchpriority="high"` en el hero y `loading="lazy"` en el resto. Mantener los PNG originales hasta que Fase 8 confirme que no se usan.

### Paso 4 — Bilingüe y accesibilidad
1. `data-es` en todos los textos nuevos.
2. Un único `<h1>` (hoy el hero usa clase `hero-h2`; revisar jerarquía).
3. Contraste AA del texto sobre foto; foco visible en CTAs; `alt` descriptivos.

### Paso 5 — Pruebas y cierre
1. `node --check jcdmtech/js/*.js`; script de enlaces (PROJECT_AUDIT §9).
2. Revisión visual en los 3 anchos × 2 temas × 2 idiomas; menú móvil; consola limpia.
3. Lighthouse después vs. línea base.
4. Regresión: services, quelvo, quelvo/book (paso 1–3 sin confirmar), login, admin.
5. Actualizar `IMPLEMENTATION_LOG.md`, `CHANGELOG.md`, `DESIGN_SYSTEM.md`, `PROJECT_STATUS.md`.
6. Commit sólo si el propietario lo pide; **sin push** sin autorización.

**Criterios de aceptación:** ver `docs/TODO.md` → Fase 2.

## 5. Próximo paso inmediato

**Actualizado 2026-10-19 (tras publicar `4ef6506`):**
1. ~~Propietario: revisar la documentación sin commit y autorizar su commit en la rama de mantenimiento (B-9).~~ Hecho: `dbd555c`.
2. ~~Propietario: autorizar la sincronización `main` → mantenimiento (§0b).~~ Hecho en local: `4585d9e`. **Siguiente:** autorizar
   el push de `maintenance/quelvo-onesound` (sólo esa rama; Preview, no producción) y el commit de esta actualización documental. No fusionar en sentido inverso.
3. Seguridad de datos (B-10): restaurar Supabase y aplicar la migración RLS siguiendo `SECURITY_REMEDIATION.md` §4.4 y
   el orden de `MAINTENANCE_MODE.md` §5 (decidir antes si QUELVO se suspende en producción).
4. Textos legales (B-8): revisión → procedimiento §0c.
5. OneSound: implementar su suspensión/protecciones en su propio repositorio (requiere acceso y autorización).

*Lista anterior (conservada; el paso 0 quedó cumplido con el hotfix R1 y el paso 1(a) con la opción B):*

0. **Seguridad:** el propietario revisa el diff y autoriza commit(s) en la rama → Preview (con bypass) → producción → procedimiento de Supabase (`SECURITY_REMEDIATION.md` §6 y §4.4). **No restaurar Supabase antes de desplegar la web corregida.**

1. **Suspensión:** el propietario decide (a) cómo corregir `vercel.json` (R-M9: opción A o B) y autoriza ese commit + push a la rama, (b) configura el token de bypass del Preview según `MAINTENANCE_MODE.md` §6.1, (c) autoriza el commit de la documentación de resultados. Después: repetir Preview y pruebas. Producción, SQL/Supabase y OneSound siguen requiriendo autorizaciones posteriores (orden en §5).
2. Después: revisar B-2, B-3, B-6 y B-7 e iniciar el Paso 0 de la Fase 2 (el rediseño de Home debe respetar el marcado `data-maint-*`).

## 6. Cómo retomar si se pierde el contexto

1. Leer `CLAUDE.md` → este archivo → `docs/TODO.md` (fase actual).
2. `git status` y `git log -5` para ver si la documentación de Fase 1 ya está commiteada.
3. Revisar §3 (bloqueos) por si el propietario ya respondió (anotar respuestas aquí).
4. Continuar en §4 desde el último paso marcado en `IMPLEMENTATION_LOG.md`.
