# Routes Documentation

## Route Status Legend
- ✅ EXISTS & FUNCTIONAL
- 🔄 EXISTS — needs update/redesign
- 🆕 NEW — needs to be created
- 📦 LEGACY — keep for backward compatibility
- 🕐 PLACEHOLDER — exists but no real content
- ↩️ REDIRECT — redirects to another route

---

## Public Routes

| Route | Status | File | Purpose | Notes |
|-------|--------|------|---------|-------|
| `/` | 🔄 REDESIGN | `index.html` | Homepage — JCDM Technologies | Change from chauffeur to tech company |
| `/services/` | 🆕 CREATE | `services/index.html` | 4 tech services | New page |
| `/projects/` | 🆕 CREATE | `projects/index.html` | Owned products & platforms | New page |
| `/quelvo/` | 🆕 CREATE | `quelvo/index.html` | QUELVO premium landing | Main chauffeur page, new brand |
| `/quelvo/book/` | 🆕 CREATE | `quelvo/book/index.html` | QUELVO booking form | Adapted from chofer-privado/reservar.html |
| `/music-ride/` | 🔄 MINOR UPDATE | `music-ride/index.html` | Music Ride product page | Keep functional, update context |
| `/nosotros.html` | 🔄 UPDATE | `nosotros.html` | About JCDM Technologies | Expand from placeholder |
| `/contacto.html` | 🔄 UPDATE | `contacto.html` | Contact page | Update service dropdown |
| `/privacidad.html` | 🕐 PLACEHOLDER | `privacidad.html` | Privacy policy | Legal work deferred |
| `/terminos.html` | 🕐 PLACEHOLDER | `terminos.html` | Terms of service | Legal work deferred |
| `/blog/` | 🕐 PLACEHOLDER | `blog/index.html` | Future blog | Keep as-is |

---

## Auth / Protected Routes

| Route | Status | File | Purpose |
|-------|--------|------|---------|
| `/login.html` | ✅ KEEP | `login.html` | Supabase auth (email + magic link) |
| `/mi-cuenta.html` | ✅ KEEP | `mi-cuenta.html` | User profile management |
| `/admin/` | ✅ KEEP | `admin/index.html` | Vehicle & driver admin (role: admin only) |

---

## Legacy Routes (Keep for backward compatibility)

| Route | Status | File | Notes |
|-------|--------|------|-------|
| `/chofer-privado/` | 📦 LEGACY | `chofer-privado/index.html` | Old service landing |
| `/chofer-privado/reservar.html` | 📦 LEGACY | `chofer-privado/reservar.html` | Old booking form — still functional |
| `/chofer-privado/gracias.html` | 📦 LEGACY | `chofer-privado/gracias.html` | Old thank-you page |

---

## Stub/Placeholder Routes

| Route | Current Behavior | Target Behavior |
|-------|-----------------|-----------------|
| `/automatizaciones/` | 302 → `/chofer-privado/reservar.html` | 302 → `/services/` |
| `/domotica/` | 302 → `/chofer-privado/reservar.html` | 302 → `/services/` |
| `/software/` | 302 → `/chofer-privado/reservar.html` | 302 → `/services/` |
| `/blog/` | 302 → `/chofer-privado/reservar.html` | Keep as placeholder |

---

## Special Routes

| Route | Status | File | Purpose |
|-------|--------|------|---------|
| `/qrcard.html` | ✅ KEEP | `qrcard.html` | QR business card + vCard download |
| `/sitemap.xml` | 🔄 UPDATE | `sitemap.xml` | Add new routes |
| `/robots.txt` | 🔄 UPDATE | `robots.txt` | Add /admin/ to sitemap exclusions |

---

## URL Aliases (vercel.json redirects to add)

| From | To | Type | Reason |
|------|----|------|--------|
| `/about` | `/nosotros.html` | 301 | English URL alias |
| `/contact` | `/contacto.html` | 301 | English URL alias |
| `/quelvo` | `/quelvo/` | 301 | Trailing slash consistency |
| `/services` | `/services/` | 301 | Trailing slash consistency |
| `/projects` | `/projects/` | 301 | Trailing slash consistency |

---

## SEO Notes

- All existing canonical URLs preserved
- New pages need canonical tags pointing to their clean URLs
- `/chofer-privado/*` routes kept to avoid breaking inbound links
- Sitemap.xml must be updated with new routes
- robots.txt: add `/quelvo/book/gracias` to Disallow when created
