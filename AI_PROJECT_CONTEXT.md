# AI_PROJECT_CONTEXT

## Project overview
- Sitio web estático multi-página para **JCDM Technologies LLC**, orientado principalmente al servicio de **chofer privado en Miami**.
- El proyecto combina:
  - Páginas públicas de marketing/SEO.
  - Flujo de reserva con envío por **WhatsApp** o **email (Formspree)**.
  - Autenticación y perfil de usuario con **Supabase Auth**.
  - Módulo admin (CRUD de vehículos y choferes) en frontend contra Supabase.
- Despliegue esperado en **Vercel**, con redirects definidos en `jcdmtech/vercel.json`.

## Technology stack
- Frontend:
  - HTML5 multi-page (sin framework SPA).
  - CSS global en `jcdmtech/styles.css`.
  - JavaScript vanilla (scripts clásicos + algunos módulos ES).
- Backend/BaaS:
  - Supabase (Auth + tablas `profiles`, `vehicles`, `drivers`).
- Integraciones externas:
  - Google Analytics 4 (`gtag`, ID `G-85LR7PFMVT`).
  - Formspree para envío de reservas por email (`/f/xgvljywo`).
  - WhatsApp deep link (`wa.me`) para reservas.
- Infra:
  - Vercel (`jcdmtech/vercel.json`).

## Architecture pattern
- Patrón real: **MPA estática + BaaS**.
- Capas:
  - Presentación: páginas HTML por ruta.
  - UI compartida: inyección dinámica de `partials/header.html` y `partials/footer.html` desde `js/app.js`.
  - Lógica cliente:
    - Navegación, tema, auth nav: `js/app.js`.
    - Reserva: `js/booking.js`.
    - Lógica por página (inline scripts en `login.html`, `mi-cuenta.html`, `admin/index.html`, etc.).
  - Datos/identidad: Supabase desde navegador (sin backend propio en repo).
- Seguridad/rol:
  - Control de acceso de admin y sesión hecho en frontend.
  - Asume políticas RLS correctas en Supabase.

## Main modules
- `jcdmtech/js/app.js`
  - Carga parciales header/footer.
  - Navegación móvil + dropdown.
  - Tema claro/oscuro.
  - Resaltado de menú activo.
  - Render de estado de sesión y rol (`profiles.role`) para mostrar `Mi cuenta/Admin/Salir`.
- `jcdmtech/js/booking.js`
  - Manejo de `#booking-form`.
  - Genera `booking_code`.
  - Modal para elegir canal (`whatsapp` o `email`).
  - Envío a WhatsApp o Formspree y redirección a `/chofer-privado/gracias.html`.
  - Tracking UTM/page_url y validaciones básicas cliente.
- `jcdmtech/login.html`
  - Sign-in password.
  - Magic link.
  - Reset password.
  - Sign-up y upsert en `profiles` con `role: user`.
- `jcdmtech/mi-cuenta.html`
  - Carga/actualiza `profiles.full_name` y `profiles.phone`.
- `jcdmtech/admin/index.html`
  - Guardas de sesión + rol admin.
  - CRUD inline de `vehicles` y `drivers` (listar/crear/editar/eliminar/buscar).
- `jcdmtech/chofer-privado/reservar.html`
  - Formulario principal de reserva.
  - Autorrelleno desde `profiles` si hay sesión.
- `jcdmtech/vercel.json`
  - Redirects de rutas de servicios hacia `chofer-privado/reservar.html`.

## Data flow
1. Usuario entra a una página pública.
2. `app.js` inyecta header/footer y configura UI.
3. Si existe `window.__SUPABASE__`, `app.js` consulta sesión y perfil para adaptar navegación.
4. En reserva:
   - Se completa formulario.
   - `booking.js` genera código y solicita canal de envío.
   - WhatsApp: abre `wa.me` con mensaje preformateado y redirige a `gracias.html`.
   - Email: POST a Formspree y redirige a `gracias.html`.
5. En login/mi-cuenta/admin:
   - Operaciones directas contra Supabase desde cliente.
   - Admin opera tablas de negocio (`vehicles`, `drivers`).

## Important dependencies
- Runtime CDN:
  - `https://esm.sh/@supabase/supabase-js@2`
  - `https://www.googletagmanager.com/gtag/js?id=G-85LR7PFMVT`
  - `https://fonts.googleapis.com` / `fonts.gstatic.com`
- Servicios:
  - Supabase project URL + anon key en `js/supabase.config.js`.
  - Formspree endpoint en `chofer-privado/reservar.html`.
  - WhatsApp deep links en `booking.js` y páginas de contacto.

## Code conventions detected
- Estructura:
  - Sitio centrado en carpeta `jcdmtech/`.
  - Rutas por feature (`chofer-privado/`, `admin/`, etc.).
  - Parciales reutilizables en `partials/`.
- Naming:
  - IDs de DOM explícitos (`booking-form`, `formMsg`, `navToggle`, etc.).
  - Variables JS en `camelCase`.
  - Clases CSS utilitarias (`grid`, `card`, `btn`, `muted`, `section`).
- Estilo JS:
  - Mezcla de scripts clásicos y `type="module"`.
  - Uso frecuente de IIFE y funciones pequeñas de UI.
  - Lógica de página embebida inline (en vez de módulos por feature).
- Estilo HTML/CSS:
  - Enfoque SEO (meta OG/Twitter/JSON-LD/canonical en páginas clave).
  - Diseño visual de “lujo” con tokens CSS y gradientes.

## Issues and inconsistencies detected
- Scripts rotos por ruta incorrecta:
  - Varias páginas cargan `/app.js` pero el archivo real es `/js/app.js`.
  - Afecta inyección de header/footer y funcionalidad compartida en:
    - `contacto.html`, `nosotros.html`, `privacidad.html`, `terminos.html`,
    - `domotica/index.html`, `software/index.html`, `automatizaciones/index.html`, `blog/index.html`.
- Integración de formularios inconsistente:
  - `contacto.html` usa `data-netlify="true"` (flujo Netlify Forms), pero despliegue/config principal está en Vercel.
  - Reserva usa Formspree; contacto no comparte estrategia.
- GA4 duplicado:
  - Se carga en páginas y también dentro de `partials/header.html`, potencial doble inicialización/eventos duplicados.
- Clave anon de Supabase expuesta:
  - Normal para cliente público, pero exige RLS estricta y policies bien definidas.
- Control de rol sólo frontend:
  - Si RLS/policies no bloquean en backend, hay riesgo de acceso indebido.
- Sanitización parcial:
  - En `admin/index.html`, `notes` se escapa en render, pero otros campos editables se interpolan en HTML con escape limitado (comillas), potencial vector XSS si datos llegan maliciosos.
- Referencias a asset no existente:
  - Se usa `/assets/safari-pinned-tab.svg` en varias páginas, pero no existe en `assets/`.
- Consistencia de carga de scripts:
  - Orden `supabase.config.js` / `app.js` no es homogéneo entre páginas (aunque en varios casos funciona por `defer`).
- SEO/redirects discutibles:
  - `vercel.json` redirige `/domotica`, `/software`, `/automatizaciones`, `/blog` a reserva de chofer, pese a existir páginas para esas secciones.
  - Puede contradecir contenido y objetivos SEO.
- Calidad de codificación de texto:
  - En varias salidas se observan caracteres mojibake (`Â`, `Ã`), sugiriendo posibles problemas de encoding en el flujo de edición/servido.
- Archivos sin uso claro:
  - `copy.zip` dentro de raíz del sitio parece artefacto no funcional.
  - `js/supabase.client.js` no aparece referenciado.

## Suggested refactor priorities
1. Corregir todas las referencias `/app.js` -> `/js/app.js`.
2. Unificar estrategia de formularios (idealmente Formspree o endpoint propio consistente con Vercel).
3. Centralizar GA4 para evitar duplicados (una sola inicialización).
4. Revisar/fortalecer RLS + policies de Supabase para `profiles`, `vehicles`, `drivers`.
5. Añadir sanitización robusta para contenido editable en admin.
6. Alinear redirects de Vercel con arquitectura de contenidos/SEO.
7. Resolver encoding UTF-8 de forma consistente.
8. Limpiar assets/archivos huérfanos.

## MASTER PROMPT (Project-specific)
Usa este prompt en nuevas sesiones:

```text
Actúa como Senior Software Architect + Senior Frontend/Fullstack Engineer especializado en este repositorio: JCDM Technologies.

Contexto del proyecto:
- Es un sitio MPA estático (HTML/CSS/JS vanilla) alojado en Vercel.
- Carpeta principal: jcdmtech/
- UI compartida con parciales: /partials/header.html y /partials/footer.html, cargados desde /js/app.js.
- Lógica cliente principal:
  - /js/app.js: include de parciales, nav móvil, tema, auth nav.
  - /js/booking.js: flujo de reserva (WhatsApp/Formspree + booking_code + redirect).
- Integraciones:
  - Supabase Auth + tablas profiles, vehicles, drivers.
  - GA4 (gtag, G-85LR7PFMVT).
  - Formspree para reservas.
- Páginas clave:
  - /index.html
  - /chofer-privado/reservar.html
  - /chofer-privado/gracias.html
  - /login.html
  - /mi-cuenta.html
  - /admin/index.html

Arquitectura esperada al proponer cambios:
- Mantener enfoque MPA sin introducir framework pesado salvo que se solicite explícitamente.
- Reusar estilos/token existentes en /styles.css.
- Mantener parciales y patrón de include de /js/app.js.
- Priorizar cambios mínimos, compatibles con SEO y performance.

Convenciones de código a respetar:
- HTML semántico, IDs claros, clases utilitarias existentes (btn, card, grid, muted, section).
- JavaScript vanilla en camelCase, funciones pequeñas y claras.
- Evitar dependencias de build innecesarias.
- Mantener copy y UX en español.
- Preservar meta tags SEO (canonical, OG, Twitter, JSON-LD) en páginas estratégicas.

Reglas de calidad y seguridad:
- Verifica rutas de scripts (usar /js/app.js, no /app.js).
- Evita doble carga de GA4.
- Si tocas auth/admin, asume RLS obligatoria y valida impacto en Supabase.
- Escapa/sanitiza cualquier dato que se inyecte en HTML (especialmente en admin).
- No exponer secretos sensibles (la anon key pública de Supabase es aceptable, service keys no).

Formato de respuesta esperado:
1) Diagnóstico breve y concreto.
2) Cambios propuestos (lista priorizada).
3) Implementación exacta por archivos.
4) Riesgos/regresiones posibles.
5) Siguientes pasos recomendados.

Si faltan datos para una decisión crítica, pregunta solo lo mínimo necesario.
```
