# JCDM Technologies LLC — Contexto del proyecto

> Actualizado: 2026-10-19 (Fase 1). Sustituye a la versión del 2026-06-11; la información previa se conserva aquí,
> marcada cuando quedó obsoleta.
>
> Convención: **[VERIFICADO]** = comprobado en el código o en producción. **[PLANIFICADO]** = objetivo futuro, aún no existe.
> **[POR VALIDAR]** = afirmación presente en el sitio que no puede comprobarse desde el código; requiere confirmación del propietario.

---

## 1. La empresa

JCDM Technologies LLC es una empresa tecnológica con sede en Miami, FL, centrada en soluciones digitales prácticas para
negocios y particulares. Construye y opera plataformas propias, ofrece servicios técnicos y gestiona **QUELVO**, su
plataforma de transporte privado.

- **Lema actual en el sitio [VERIFICADO]:** "Technology, automation & digital platforms for real-world needs."
- **Misión:** crear tecnología práctica que ayude a personas y negocios a simplificar operaciones, mejorar su comodidad y conectar servicios mediante herramientas digitales modernas.
- **Ubicación:** Miami, FL. Mercado objetivo: Miami-Dade y alrededores; servicios técnicos también en remoto.
- **Contacto publicado [VERIFICADO]:** teléfono/WhatsApp +1 (786) 348-7458. Email: `contacto@jcdmtech.com` en `contact.html`, pero `info@jcdmtech.com` en `privacy.html`/`terms.html` → **inconsistencia por resolver**.
- **Tono:** moderno, fiable, práctico, profesional. Ni corporativo rígido ni informal.
- **Idioma:** inglés por defecto con conmutador a español (`data-es`) **parcialmente implementado**. Algunas páginas (Music Ride, stubs legado) están sólo en español.

---

## 2. Objetivo de la modernización (8 fases)

Actualizar completamente `https://www.jcdmtech.com/` para presentar a JCDM Technologies como empresa tecnológica con
cinco líneas principales, manteniendo operativos los flujos actuales (reservas, auth, admin, Music Ride).

Plan de fases (detalle de dependencias, riesgos, criterios y pruebas en `docs/TODO.md`):

1. Auditoría y documentación ← **completada 2026-10-19**
2. Rediseño de Home
3. Desarrollo de Services
4. QUELVO y su experiencia de reservas
5. Integración de Music Ride
6. Projects
7. About, Contact y Footer
8. SEO, rutas, responsive, accesibilidad y pruebas finales

> Nota histórica: en junio 2026 hubo otra numeración de fases ("Phases 2–8", commit `75c8a5c`) que ya creó
> `/services/`, `/projects/`, `/quelvo/`, etc. El plan actual de 8 fases **parte de ese estado existente** y lo refina;
> no lo construye desde cero.

---

## 3. Los cinco servicios principales

| # | Servicio | Estado actual en el sitio |
|---|---|---|
| 1 | Web Development & Applications | [VERIFICADO] Sección en `/services/` (#web) y card en Home |
| 2 | Automation & Smart Systems | [VERIFICADO] Sección en `/services/` (#automation) |
| 3 | Smart Home & IoT Solutions | [VERIFICADO] Sección en `/services/` (#smarthome) |
| 4 | Technical Support & Consulting | [VERIFICADO] Sección en `/services/` (#support) |
| 5 | QUELVO — Private Chauffeur Platform | [VERIFICADO] Landing `/quelvo/` + reserva `/quelvo/book/` |

Contenido de referencia por servicio (de la versión anterior de este documento):

- **Web Development & Applications:** webs corporativas y landing pages, sistemas admin y dashboards, formularios inteligentes y sistemas de reserva, integraciones con bases de datos, portales de clientes, apps móviles básicas.
- **Automation & Smart Systems:** flujos n8n, bots de Telegram, integraciones API, PostgreSQL/MySQL, informes automáticos, seguimiento financiero, automatización de procesos.
- **Smart Home & IoT:** Home Assistant, cerraduras/luces/sensores, Alexa y asistentes de voz, cámaras de seguridad, dashboards IoT, automatizaciones a medida.
- **Technical Support & Consulting:** configuración de equipos, instalación de software, redes básicas, configuración de dispositivos, diagnóstico técnico, consultoría para pequeños negocios.

[POR VALIDAR] `/services/` menciona tecnologías como Stripe, React Native, Zapier, Z-Wave o "payment integration"
en sistemas de reserva. Ninguna integración de pagos existe en este repositorio. Confirmar con el propietario qué
se ofrece realmente antes de reutilizar ese texto en Fase 3.

---

## 4. Plataformas y productos propios

### QUELVO — Private Chauffeur Platform
Marca propia de transporte privado en Miami; antes "Chofer privado" en `/chofer-privado/`.
Experiencia de reserva premium **inspirada funcionalmente** en Blacklane (flujo por pasos, clases de vehículo,
precio previo) pero con **diseño, contenido e identidad originales**. No copiar textos, logos, imágenes ni marcas de Blacklane.

[VERIFICADO] Hoy existe:
- Dos clases de vehículo: *QUELVO Private* (sedán, hasta 3 pax, desde $75/h, mínimo $50 transfer, mínimo 2 h por horas) y *QUELVO Black SUV* (hasta 6 pax, desde $120/h, mínimo $85 transfer, mínimo 3 h).
- Tres tipos de servicio en la reserva: Transfer (precio automático), By the hour (precio automático), Request a quote (manual). Trayectos > 50 millas pasan a cotización manual.
- Reserva almacenada en Supabase (`bookings`) con código `QLV-XXXXXXXX`; gestión desde `/admin/`.
- Sin pagos online, sin envío de emails desde el código del repositorio.

[POR VALIDAR] Textos publicados: "Instant confirmation", "We'll send a confirmation to your email",
"Flight tracking / Real-time flight monitoring", "Every ride includes Music Ride", "Same-day · 2h notice",
"Airport meet & greet", precios mostrados. Ver `docs/PROJECT_AUDIT.md` §6.

[PLANIFICADO] Servicios mencionados como objetivo: aeropuertos MIA/FLL/PBI, eventos, viajes de negocio, city-to-city.

### Music Ride
Producto propio de JCDM Technologies: experiencia de música colaborativa para trayectos QUELVO y eventos privados.
- [VERIFICADO] Aplicación desplegada en `https://music-ride.jcdmtech.com` (responde 200). **Su código no está en este repositorio.**
- [VERIFICADO] Landing en `/music-ride/` (español) y bloques promocionales en Home, QUELVO, Projects, About y footer.
- Funcionamiento descrito en la landing: el host abre sesión y muestra un QR; los pasajeros se unen desde el navegador sin instalar nada; buscan en YouTube y añaden a una cola en tiempo real; el host controla pausa/salto/permisos/límites; modo Repeat All.
- [POR VALIDAR] Stack declarado en `/projects/`: React, Node.js, Socket.IO, YouTube IFrame API, Railway, PostgreSQL, JWT.
- Requisito: **su funcionamiento existente debe conservarse**; la integración con QUELVO (Fase 5) no debe modificar la app externa sin autorización.

### Financial Automation System (interno / showcase)
n8n + PostgreSQL + Python + bot de Telegram; informes automáticos. Aparece en `/projects/` como "Internal use".

### Smart Home Dashboard (interno / showcase)
Home Assistant + sensores IoT + automatizaciones; acceso remoto vía Cloudflare Tunnel (según `/projects/`).

---

## 5. Dependencias externas [VERIFICADO en código]

| Servicio | Uso | Dónde |
|---|---|---|
| Vercel | Hosting estático + redirects | `jcdmtech/vercel.json` |
| Supabase (proyecto `nrmajnnfejafbtkpvpob`) | Auth, `profiles`, `vehicles`, `drivers`, `bookings` | `js/supabase.config.js`, `js/app.js`, páginas de auth/admin/reserva |
| supabase-js v2 vía esm.sh (versión mayor sin fijar) | Cliente Supabase | import dinámico |
| Google Maps JS API (Places + Distance Matrix) | Autocompletado y cálculo de ruta/precio | `quelvo/book/index.html` |
| Formspree (`/f/xgvljywo`) | Formulario de contacto + reserva legado | `contact.html`, `chofer-privado/reservar.html` |
| Google Analytics 4 (`G-85LR7PFMVT`) | Analítica | `partials/header.html` (init idempotente) |
| Google Fonts (Inter, Fraunces) | Tipografía | `partials/header.html` |
| WhatsApp (`wa.me/17863487458`) | Contacto y reserva legado | varias páginas, `js/booking.js` |
| Music Ride (`music-ride.jcdmtech.com`) | App externa | enlaces |

> Histórico: la versión de junio citaba el proyecto Supabase `fsqfialyjhpalxbdjktd`; se migró a `nrmajnnfejafbtkpvpob` (commit `ac73233`).

---

## 6. Problemas conocidos — estado de los listados en la versión anterior

| Problema (junio 2026) | Estado 2026-10-19 |
|---|---|
| Teléfono distinto entre booking.js y contacto | Resuelto: todo usa 17863487458 |
| Privacidad y Términos eran stubs | Resuelto: contenido completo (commit `4d0350a`) — revisión legal no verificada |
| Sin página 404 | Resuelto: `404.html` (commit `569df74`) |
| `/nosotros.html` mínimo | Resuelto: `about.html` completo; `/nosotros.html` redirige 308 |
| `/blog/`, `/domotica/`, `/software/`, `/automatizaciones/` stubs | Persiste: siguen siendo stubs (ver `ROUTES.md`) |
| Código de reserva no persistido | Resuelto en el flujo nuevo (tabla `bookings`) |

Los problemas vigentes están en `docs/PROJECT_AUDIT.md`.
