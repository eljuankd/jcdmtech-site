// /js/maintenance.config.js — central maintenance flags (see docs/MAINTENANCE_MODE.md)
//
//   maintenance: true   → platform SUSPENDED (maintenance page / links hidden)
//   maintenance: false  → platform AVAILABLE (normal site)
// Only the literal boolean `true` activates maintenance; anything else counts as off.
//
// Single source of truth used by:
//   - /middleware.js (Vercel Routing Middleware) → HTTP 503 + Retry-After on the QUELVO routes
//   - the browser (classic <script>)             → html.maint-<key> classes, hides booking/launch
//     buttons (styles.css) and sends QUELVO pages to the maintenance page as a fallback
//
// To toggle: change `maintenance`, then deploy. Nothing is deleted while a platform is off.
// NOTE: this file only controls the JCDM site. Real enforcement also needs:
//   - QUELVO:   Supabase flag `jcdm_maintenance_flags.quelvo_maintenance` (docs/sql/quelvo-maintenance.sql)
//   - OneSound: its own repo/backend (jcdm-music-ride) — not controlled from here.
(function () {
  var M = {
    quelvo: {
      maintenance: true,
      retryAfter: 86400,                 // seconds, sent in the Retry-After header
      page: "/maintenance/quelvo/",
      paths: ["/quelvo", "/chofer-privado"],
    },
    onesound: {
      maintenance: true,                 // JCDM side only: hides "Open app" links
      appUrl: "https://music-ride.jcdmtech.com",
    },
  };
  globalThis.__MAINTENANCE__ = M;
  Object.keys(M).forEach(function (key) {
    if (typeof M[key].maintenance !== "boolean") {
      console.warn("[maintenance] " + key + ".maintenance must be true or false — treated as false");
    }
  });

  if (typeof document === "undefined") return; // middleware runtime: flags only

  var on = function (key) { return M[key] && M[key].maintenance === true; };
  var root = document.documentElement;
  Object.keys(M).forEach(function (key) {
    if (on(key)) root.classList.add("maint-" + key);
  });

  // Fallback when the middleware is not running (local server, middleware failure):
  // leave QUELVO pages for the maintenance page. Temporary client redirect, not an SEO redirect.
  var q = M.quelvo;
  if (on("quelvo") && !root.hasAttribute("data-maintenance-page")) {
    var p = location.pathname;
    var hit = q.paths.some(function (base) { return p === base || p.indexOf(base + "/") === 0; });
    if (hit) location.replace(q.page);
  }

  // <option> elements cannot be reliably hidden with CSS (iOS Safari) → disable them too.
  document.addEventListener("DOMContentLoaded", function () {
    Object.keys(M).forEach(function (key) {
      if (!on(key)) return;
      document.querySelectorAll('option[data-maint-hide~="' + key + '"]').forEach(function (o) {
        o.disabled = true;
      });
    });
  });
})();
