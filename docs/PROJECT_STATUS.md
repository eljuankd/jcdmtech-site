# Estado del proyecto

- **Última actualización:** 2026-10-19
- **Fase actual:** Fase 1 completada → **siguiente: Fase 2 (Rediseño de Home)**, pendiente de aprobación
- **Trabajo intercalado:** suspensión temporal de QUELVO y OneSound (D-013) — **preparada en local, NO activa en producción**
- **Seguridad (2026-10-19):** auditoría entregada + **Fase 1 de remediación preparada y probada en local, sin commit** (`docs/SECURITY_REMEDIATION.md`). Repo **público**: no documentar detalles de explotación.
- **Rama de trabajo:** `maintenance/quelvo-onesound` (push hecho) = `4d0350a` + `70479ca` (docs Fase 1) + `abc90c8` (suspensión). `main` local y remota = `4d0350a`, sin cambios. Documentación de resultados posterior **sin commit**.
- **Producción:** `https://www.jcdmtech.com` sirve **`29c4b6f` (2026-06-30)**, no `main`: los despliegues fallan desde `569df74` (R-M9). QUELVO y OneSound siguen respondiendo 200.
- **Vercel Preview de `fd31034`:** **compila (`success`)** — `https://jcdmtech-site-d12mqr6yd-juanks-projects-50846d74.vercel.app` — protegido con Vercel Authentication; pruebas funcionales pendientes de acceso (§6.1 de MAINTENANCE_MODE). Commits en la rama: `70479ca`, `abc90c8`, `fd31034`.

---

## 0a. Seguridad — Fase 1 de remediación (2026-10-19, sin commit)

| Tema | Estado | Siguiente paso |
|---|---|---|
| J-03 login `next` | Corregido en local (`js/safe-next.js`), pruebas 4/4 + navegador | Commit → Preview |
| J-04 `copy.zip`, `supabase-setup.sql` | Movidos a `archive/`, `supabase/legacy/`; `.vercelignore` | Commit → Preview (404) |
| J-05 cabeceras | En `vercel.json`; CSP Report-Only; 0 violaciones en local | Preview con Maps/GA reales |
| J-01/J-02/J-06 Supabase | Migración + preflight + verify + rollback; PGlite 83/83; **no aplicada** | Tras desplegar la web: restaurar Supabase y §4.4 |
| OneSound O-01…O-05 | Documentado en `docs/private/` (no versionado; repo público) | Fase independiente |

Pruebas: `node --test scripts/tests/safe-next.test.mjs`; `JCDM_TOOLS=… node scripts/tests/security-rls.pglite.mjs`; navegador 88/88 con `scripts/tests/e2e-security.mjs` contra la salida de `vercel build` servida por `scripts/tests/serve-vercel-output.mjs` (SECURITY_REMEDIATION §7).
Bloqueo: B-6 (hotfix de R-03) queda **resuelto en la rama**, pendiente de autorización de commit/despliegue.

## 0. Suspensión temporal de QUELVO y OneSound (2026-10-19)

Procedimiento completo: `docs/MAINTENANCE_MODE.md`. Bitácora: `IMPLEMENTATION_LOG.md` (entrada del 2026-10-19).

| Plataforma | Estado real | Qué falta para activarla |
|---|---|---|
| QUELVO (web) | En la rama `maintenance/quelvo-onesound`. Pruebas de navegador locales 39/39. `vercel.json` corregido (opción B, autorizado); resultado del nuevo Preview: ver bitácora | Pruebas contra el Preview (requiere acceso, §6.1 de MAINTENANCE_MODE) → autorización de producción |
| QUELVO (base de datos) | SQL + prueba en seco listos (PGlite 19/19), **no aplicados**. Supabase `jcdmtech-prod` **PAUSADO** (admin y login caídos hoy) | Autorizar restaurar el proyecto **después** del despliegue web, luego preflight → prueba en seco → instalar |
| QUELVO app (`D:\quelvo`) | Sólo desarrollo local; no pública; Supabase `quelvo-prod` pausado | Nada mientras no se despliegue |
| OneSound | **No suspendido.** Sólo se ocultarán sus enlaces en JCDM. App y API siguen públicas | Acceso y autorización: repo `jcdm-music-ride`, Render, Vercel de OneSound |
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
| B-6 | ~~Hotfix de R-03~~ → **preparado en la rama** (2026-10-19). Falta autorizar commit, Preview y producción | Seguridad |
| B-7 | ¿Autoriza commit de la documentación de Fase 1? | Cierre de Fase 1 |

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

0. **Seguridad:** el propietario revisa el diff y autoriza commit(s) en la rama → Preview (con bypass) → producción → procedimiento de Supabase (`SECURITY_REMEDIATION.md` §6 y §4.4). **No restaurar Supabase antes de desplegar la web corregida.**

1. **Suspensión:** el propietario decide (a) cómo corregir `vercel.json` (R-M9: opción A o B) y autoriza ese commit + push a la rama, (b) configura el token de bypass del Preview según `MAINTENANCE_MODE.md` §6.1, (c) autoriza el commit de la documentación de resultados. Después: repetir Preview y pruebas. Producción, SQL/Supabase y OneSound siguen requiriendo autorizaciones posteriores (orden en §5).
2. Después: revisar B-2, B-3, B-6 y B-7 e iniciar el Paso 0 de la Fase 2 (el rediseño de Home debe respetar el marcado `data-maint-*`).

## 6. Cómo retomar si se pierde el contexto

1. Leer `CLAUDE.md` → este archivo → `docs/TODO.md` (fase actual).
2. `git status` y `git log -5` para ver si la documentación de Fase 1 ya está commiteada.
3. Revisar §3 (bloqueos) por si el propietario ya respondió (anotar respuestas aquí).
4. Continuar en §4 desde el último paso marcado en `IMPLEMENTATION_LOG.md`.
