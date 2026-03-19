function ensureSiteVersion() {
  if (window.__SITE_VERSION__) return Promise.resolve(window.__SITE_VERSION__);

  return new Promise((resolve) => {
    const existing = document.querySelector('script[data-site-version="true"], script[src="/js/version.js"]');
    if (existing) {
      if (window.__SITE_VERSION__) {
        resolve(window.__SITE_VERSION__);
        return;
      }

      existing.addEventListener("load", () => resolve(window.__SITE_VERSION__ || "dev"), { once: true });
      existing.addEventListener("error", () => resolve("dev"), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "/js/version.js";
    script.async = false;
    script.dataset.siteVersion = "true";
    script.onload = () => resolve(window.__SITE_VERSION__ || "dev");
    script.onerror = () => resolve("dev");
    document.head.appendChild(script);
  });
}

async function include(where, url) {
  const el = document.querySelector(where);
  if (!el) return;

  try {
    const res = await fetch(url, { cache: "no-store" });
    el.innerHTML = await res.text();

    if (where === "#header") {
      setupMobileNav();
      setupDropdowns();
      bindThemeToggle();
      highlightNav();
      setupAuthNav();
    }

    if (where === "#footer") {
      const y = document.getElementById("year");
      if (y) y.textContent = new Date().getFullYear();

      const versionEl = document.getElementById("siteVersion");
      if (versionEl) versionEl.textContent = window.__SITE_VERSION__ || "dev";
    }
  } catch (e) {
    console.warn("No se pudo cargar", url, e);
  }
}

function applyTheme(saved) {
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
  const theme = saved || (prefersDark ? "dark" : "light");
  document.documentElement.classList.toggle("dark-mode", theme === "dark");
}

function bindThemeToggle() {
  const saved = localStorage.getItem("theme");
  applyTheme(saved);
  const toggle = document.getElementById("themeToggle");
  toggle?.addEventListener("click", () => {
    const isDark = !document.documentElement.classList.contains("dark-mode");
    document.documentElement.classList.toggle("dark-mode", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
}

function highlightNav() {
  const p = location.pathname;
  const map = [
    { key: "home", test: (x) => x === "/" || x.endsWith("/index.html") },
    { key: "chofer", test: (x) => x.startsWith("/chofer-privado/") },
    { key: "domotica", test: (x) => x.startsWith("/domotica/") },
    { key: "software", test: (x) => x.startsWith("/software/") },
    { key: "automatizaciones", test: (x) => x.startsWith("/automatizaciones/") },
    { key: "blog", test: (x) => x.startsWith("/blog/") },
    { key: "nosotros", test: (x) => x.endsWith("/nosotros.html") },
    { key: "contacto", test: (x) => x.endsWith("/contacto.html") }
  ];

  const found = map.find((item) => item.test(p));
  if (found) {
    document.querySelectorAll(`[data-nav="${found.key}"]`).forEach((a) => a.classList.add("active"));
  }
}

function setupMobileNav() {
  const btn = document.getElementById("navToggle");
  const nav = document.getElementById("siteNav");
  if (!btn || !nav) return;

  const setState = (open) => {
    nav.classList.toggle("open", open);
    btn.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? "Cerrar menu" : "Abrir menu");
  };

  const toggle = () => {
    const open = !nav.classList.contains("open");
    setState(open);
  };

  btn.addEventListener("click", toggle);
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setState(false)));

  window.addEventListener("resize", () => {
    if (window.innerWidth > 880) setState(false);
  });
}

function setupDropdowns() {
  const dd = document.querySelector(".dropdown");
  const btn = dd?.querySelector(".dropbtn");
  const menu = dd?.querySelector(".dropdown-content");
  if (!dd || !btn || !menu) return;

  const open = () => {
    dd.classList.add("open");
    btn.setAttribute("aria-expanded", "true");
  };

  const close = () => {
    dd.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
  };

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    dd.classList.contains("open") ? close() : open();
  });

  document.addEventListener("click", (e) => {
    if (!dd.contains(e.target)) close();
  });
}

async function setupAuthNav() {
  if (!window.__SUPABASE__) return;
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
  const supabase = createClient(window.__SUPABASE__.url, window.__SUPABASE__.anon);

  const $login = document.getElementById("navLogin");
  const $logout = document.getElementById("navLogout");
  const $admin = document.getElementById("navAdmin");
  const $account = document.getElementById("navAccount");

  async function render() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      $login?.setAttribute("style", "");
      $logout?.setAttribute("style", "display:none");
      $admin?.setAttribute("style", "display:none");
      $account?.setAttribute("style", "display:none");
      return;
    }

    $login?.setAttribute("style", "display:none");
    $logout?.setAttribute("style", "");
    $account?.setAttribute("style", "");

    const { data: prof } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (prof?.role === "admin") $admin?.setAttribute("style", "");
    else $admin?.setAttribute("style", "display:none");
  }

  $logout?.addEventListener("click", async () => {
    await supabase.auth.signOut();
    location.href = "/";
  });

  await render();
  supabase.auth.onAuthStateChange(() => render());
}

document.addEventListener("DOMContentLoaded", async () => {
  await ensureSiteVersion();
  include("#header", "/partials/header.html");
  include("#footer", "/partials/footer.html");
});
