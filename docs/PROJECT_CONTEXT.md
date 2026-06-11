# JCDM Technologies LLC — Project Context

## What is JCDM Technologies LLC?

JCDM Technologies LLC is a Miami-based technology company focused on practical digital solutions for businesses and individuals. The company builds and operates technology platforms, offers consulting services, and manages QUELVO — its private chauffeur platform.

**tagline:** "Technology, automation & digital platforms for real-world needs."

**Mission:** Create practical technology that helps people and businesses simplify daily operations, improve comfort, and connect services through modern digital tools.

---

## Services

### 1. Web Development & Applications
Websites, business systems, dashboards, forms and custom applications.
- Business websites & landing pages
- Admin systems & dashboards
- Smart forms & booking systems
- Database integrations
- Customer portals
- Basic mobile apps

### 2. Automation & Smart Systems
Automated workflows, bots, reports and connected systems.
- n8n workflows
- Telegram bots
- API integrations
- PostgreSQL/MySQL
- Automatic reports
- Financial tracking systems
- Business process automation

### 3. Smart Home & IoT
Home Assistant, sensors, smart locks, cameras and custom automations.
- Home Assistant setup & configuration
- Smart locks, lights, sensors
- Alexa & voice assistant integration
- Security cameras & monitoring
- IoT dashboards
- Custom automations

### 4. Technical Support & Consulting
Practical support for homes, individuals and small businesses.
- Computer setup & configuration
- Software installation
- Basic networks
- Device configuration
- Technical diagnosis
- Small business tech consulting

---

## Owned Platforms & Products

### QUELVO — Private Chauffeur Platform
Premium private chauffeur service in Miami. Formerly branded as "Chofer privado" on jcdmtech.com.
- Airport transfers (MIA, FLL, PBI)
- Hourly chauffeur bookings
- Business travel
- Events
- City-to-city rides
- Scheduled private rides

**URL:** /quelvo (new) — previously at /chofer-privado

### Music Ride
Collaborative music experience for QUELVO rides and private events.
- Passengers scan QR to join session
- No app install required
- YouTube-based song search & queue
- Real-time collaborative playlist
- Host controls: pause, skip, permissions
- Feature of QUELVO, also usable standalone

**External app URL:** https://music-ride.jcdmtech.com
**Landing page:** /music-ride/

### Financial Automation System (Internal / Showcase)
- n8n + PostgreSQL + Telegram Bot + dashboard
- Tracks business transactions automatically

### Smart Home Dashboard (Internal / Showcase)
- Home Assistant + IoT sensors + custom automations

---

## Company Identity

- **Location:** Miami, FL
- **Target market:** Miami-Dade and surrounding areas; remote tech services available
- **Language:** Bilingual (English primary for tech brand, Spanish for QUELVO/local services)
- **Tone:** Modern, reliable, practical, professional. Not corporate-stiff, not casual.
- **Key values:** Seriedad, tecnología aplicada, soluciones reales, atención personalizada

---

## Architecture Decisions

1. **Static HTML site** — No framework (React, Next.js, etc.). Plain HTML/CSS/JS for simplicity and speed.
2. **Partials via fetch()** — Header and footer injected from `/partials/header.html` and `/partials/footer.html`.
3. **Vercel hosting** — Static hosting with edge redirects via `vercel.json`.
4. **Supabase** — Authentication and admin data (profiles, vehicles, drivers).
5. **Formspree** — Form-to-email for contact and bookings.
6. **booking.js** — WhatsApp + email dual submission for QUELVO bookings.
7. **Direction C design system** — High-contrast black (#09090B) + cream (#F5F0E8) + gold (#C8A96E). No glass morphism. Rectangular components. Fraunces serif headlines + Inter body.
8. **QUELVO brand separation** — QUELVO gets its own section of the site (/quelvo/*) but shares the global design system with its own premium emphasis.

---

## Key External Dependencies

| Service | Purpose | Endpoint |
|---------|---------|----------|
| Supabase | Auth + admin DB | fsqfialyjhpalxbdjktd.supabase.co |
| Formspree | Form submissions | formspree.io/f/xgvljywo |
| Google Analytics 4 | Tracking | G-85LR7PFMVT |
| Google Fonts | Typography | Inter + Fraunces |
| WhatsApp | Booking notifications | wa.me/17863487458 |

---

## Known Issues to Address

- Phone number mismatch: booking.js uses `17863487458`, contact page shows `+13050000000`
- Privacy policy and Terms of Service are placeholder stubs
- No 404 error page
- `/nosotros.html` has minimal content
- `/blog/`, `/domotica/`, `/software/`, `/automatizaciones/` are stubs
- Booking code not persisted to database
