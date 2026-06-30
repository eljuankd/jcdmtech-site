// ── Site version ─────────────────────────────────────────────────
function ensureSiteVersion() {
  if (window.__SITE_VERSION__) return Promise.resolve(window.__SITE_VERSION__);
  return new Promise((resolve) => {
    const existing = document.querySelector('script[data-site-version="true"], script[src="/js/version.js"]');
    if (existing) {
      if (window.__SITE_VERSION__) { resolve(window.__SITE_VERSION__); return; }
      existing.addEventListener("load",  () => resolve(window.__SITE_VERSION__ || "dev"), { once: true });
      existing.addEventListener("error", () => resolve("dev"), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "/js/version.js";
    script.async = false;
    script.dataset.siteVersion = "true";
    script.onload  = () => resolve(window.__SITE_VERSION__ || "dev");
    script.onerror = () => resolve("dev");
    document.head.appendChild(script);
  });
}

// ── Preferences ───────────────────────────────────────────────────
// Defaults: dark mode + English
// Guests:   stored in localStorage
// Members:  synced with Supabase profiles (theme, lang columns)

window.JCDM = window.JCDM || {};

const PREF_DEFAULTS = { theme: 'dark', lang: 'en' };

function _loadLocalPrefs() {
  return {
    theme: localStorage.getItem('jcdm_theme') || PREF_DEFAULTS.theme,
    lang:  localStorage.getItem('jcdm_lang')  || PREF_DEFAULTS.lang,
  };
}
function _saveLocalPrefs(p) {
  if (p.theme != null) localStorage.setItem('jcdm_theme', p.theme);
  if (p.lang  != null) localStorage.setItem('jcdm_lang',  p.lang);
}

function applyTheme(theme) {
  theme = theme === 'light' ? 'light' : 'dark';
  document.documentElement.classList.toggle('dark-mode', theme === 'dark');
  window.JCDM._prefs = window.JCDM._prefs || {};
  window.JCDM._prefs.theme = theme;
  // icon: show what you'll switch TO
  const btn = document.getElementById('themeToggle');
  if (btn) { btn.textContent = theme === 'dark' ? '☀️' : '🌙'; }
}

function applyLang(lang) {
  lang = lang === 'es' ? 'es' : 'en';
  document.documentElement.lang = lang;
  window.JCDM._prefs = window.JCDM._prefs || {};
  window.JCDM._prefs.lang = lang;
  const isEs = lang === 'es';
  document.querySelectorAll('[data-es]').forEach(el => {
    if (!el._textEn) el._textEn = el.textContent.trim();
    el.textContent = isEs ? el.dataset.es : el._textEn;
  });
  // button shows language you switch TO
  const btn = document.getElementById('langToggle');
  if (btn) { btn.textContent = isEs ? 'EN' : 'ES'; }
}

// Public API used by account/settings page
window.JCDM.setTheme = async (theme) => {
  applyTheme(theme);
  _saveLocalPrefs({ theme });
  if (window.JCDM._sb && window.JCDM._uid) {
    await window.JCDM._sb.from('profiles').update({ theme }).eq('id', window.JCDM._uid);
  }
};
window.JCDM.setLang = async (lang) => {
  applyLang(lang);
  _saveLocalPrefs({ lang });
  if (window.JCDM._sb && window.JCDM._uid) {
    await window.JCDM._sb.from('profiles').update({ lang }).eq('id', window.JCDM._uid);
  }
};
window.JCDM.getPrefs = () => ({ ...PREF_DEFAULTS, ...window.JCDM._prefs });

// Apply local prefs immediately (before header fetch resolves) to minimize flash
;(function () {
  const p = _loadLocalPrefs();
  applyTheme(p.theme);
  // lang applied after header loads (elements need to be in DOM)
})();

// ── Partials loader ───────────────────────────────────────────────
async function include(where, url) {
  const el = document.querySelector(where);
  if (!el) return;
  try {
    const res = await fetch(url, { cache: "no-store" });
    el.innerHTML = await res.text();
    if (where === "#header") {
      setupMobileNav();
      setupDropdowns();
      highlightNav();
      bindToggleButtons();
      setupAuthNav();
      // Apply lang to newly-inserted nav elements
      applyLang(window.JCDM._prefs?.lang || _loadLocalPrefs().lang);
      // Apply theme icon state
      applyTheme(window.JCDM._prefs?.theme || _loadLocalPrefs().theme);
    }
    if (where === "#footer") {
      const y = document.getElementById("year");
      if (y) y.textContent = new Date().getFullYear();
      const v = document.getElementById("siteVersion");
      if (v) v.textContent = window.__SITE_VERSION__ || "dev";
    }
  } catch (e) {
    console.warn("Could not load", url, e);
  }
}

// ── Theme + Lang toggle buttons ───────────────────────────────────
function bindToggleButtons() {
  document.getElementById('themeToggle')?.addEventListener('click', () => {
    const next = (window.JCDM._prefs?.theme || 'dark') === 'dark' ? 'light' : 'dark';
    window.JCDM.setTheme(next);
  });
  document.getElementById('langToggle')?.addEventListener('click', () => {
    const next = (window.JCDM._prefs?.lang || 'en') === 'en' ? 'es' : 'en';
    window.JCDM.setLang(next);
  });
}

// ── Nav helpers ───────────────────────────────────────────────────
function highlightNav() {
  const p = location.pathname;
  const map = [
    { key: "home",      test: (x) => x === "/" || x.endsWith("/index.html") },
    { key: "services",  test: (x) => x.startsWith("/services/") },
    { key: "quelvo",    test: (x) => x.startsWith("/quelvo/") },
    { key: "projects",  test: (x) => x.startsWith("/projects/") },
    { key: "about",     test: (x) => x.endsWith("/about.html") },
    { key: "contact",   test: (x) => x.endsWith("/contact.html") },
    { key: "musicride", test: (x) => x.startsWith("/music-ride/") },
    { key: "blog",      test: (x) => x.startsWith("/blog/") },
  ];
  const found = map.find((item) => item.test(p));
  if (found) document.querySelectorAll(`[data-nav="${found.key}"]`).forEach(a => a.classList.add("active"));
}

function setupMobileNav() {
  const btn = document.getElementById("navToggle");
  const nav = document.getElementById("siteNav");
  if (!btn || !nav) return;
  const setState = (open) => {
    nav.classList.toggle("open", open);
    btn.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  btn.addEventListener("click", () => setState(!nav.classList.contains("open")));
  nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setState(false)));
  window.addEventListener("resize", () => { if (window.innerWidth > 880) setState(false); });
}

function setupDropdowns() {
  const dd   = document.querySelector(".dropdown");
  const btn  = dd?.querySelector(".dropbtn");
  const menu = dd?.querySelector(".dropdown-content");
  if (!dd || !btn || !menu) return;
  const open  = () => { dd.classList.add("open");    btn.setAttribute("aria-expanded", "true");  };
  const close = () => { dd.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); };
  btn.addEventListener("click", (e) => { e.stopPropagation(); dd.classList.contains("open") ? close() : open(); });
  document.addEventListener("click", (e) => { if (!dd.contains(e.target)) close(); });
}

// ── Auth nav + preference sync ────────────────────────────────────
async function setupAuthNav() {
  if (!window.__SUPABASE__) return;
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
  const supabase = createClient(window.__SUPABASE__.url, window.__SUPABASE__.anon, { auth: { flowType: 'implicit' } });

  const $login   = document.getElementById("navLogin");
  const $logout  = document.getElementById("navLogout");
  const $admin   = document.getElementById("navAdmin");
  const $account = document.getElementById("navAccount");

  async function render() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      $login?.setAttribute("style", "");
      [$logout, $admin, $account].forEach(el => el?.setAttribute("style", "display:none"));
      return;
    }

    $login?.setAttribute("style", "display:none");
    $logout?.setAttribute("style", "");
    $account?.setAttribute("style", "");

    // Try to fetch role + prefs; gracefully fallback if theme/lang columns don't exist yet
    let prof = null;
    const { data: d1, error: e1 } = await supabase
      .from("profiles").select("role, theme, lang").eq("id", session.user.id).single();
    if (e1) {
      const { data: d2 } = await supabase
        .from("profiles").select("role").eq("id", session.user.id).single();
      prof = d2;
    } else {
      prof = d1;
    }

    if (prof?.role === "admin") $admin?.setAttribute("style", "");
    else $admin?.setAttribute("style", "display:none");

    // Sync preferences from Supabase (account wins over localStorage)
    window.JCDM._sb  = supabase;
    window.JCDM._uid = session.user.id;
    if (prof?.theme) { applyTheme(prof.theme); _saveLocalPrefs({ theme: prof.theme }); }
    if (prof?.lang)  { applyLang(prof.lang);   _saveLocalPrefs({ lang:  prof.lang  }); }
  }

  $logout?.addEventListener("click", async () => {
    await supabase.auth.signOut();
    location.href = "/";
  });

  await render();
  supabase.auth.onAuthStateChange(() => render());
}

// ── Boot ──────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  await ensureSiteVersion();
  include("#header", "/partials/header.html");
  include("#footer", "/partials/footer.html");
});
