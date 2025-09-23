async function include(where, url) {
  const el = document.querySelector(where);
  if (!el) return;
  try {
    const res = await fetch(url, { cache: "no-store" });
    el.innerHTML = await res.text();
    if (where === "#footer") {
      const y = document.getElementById("year");
      if (y) y.textContent = new Date().getFullYear();
    }
    bindThemeToggle();
    highlightNav();
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
    { key: "contacto", test: (x) => x.endsWith("/contacto.html") },
  ];
  const found = map.find(m => m.test(p));
  if (found) {
    document.querySelectorAll(`[data-nav="${found.key}"]`)
      .forEach(a => a.classList.add("active"));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  include("#header", "/partials/header.html");
  include("#footer", "/partials/footer.html");
});

(async () => {
  if (!window.__SUPABASE__) return; // no hacer nada si no hay supabase
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
  const supabase = createClient(window.__SUPABASE__.url, window.__SUPABASE__.anon);

  async function refreshNav() {
    const login = document.getElementById("navLogin");
    const logout = document.getElementById("navLogout");
    const admin = document.getElementById("navAdmin");

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      login?.setAttribute("style", "");
      logout?.setAttribute("style", "display:none");
      admin?.setAttribute("style", "display:none");
      return;
    }
    login?.setAttribute("style", "display:none");
    logout?.setAttribute("style", "");
    const { data: prof } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();
    if (prof?.role === "admin") admin?.setAttribute("style", "");
    else admin?.setAttribute("style", "display:none");
  }

  document.getElementById("navLogout")?.addEventListener("click", async () => {
    await supabase.auth.signOut();
    location.href = "/";
  });

  await refreshNav();
})();


function setupMobileNav(){
  const btn = document.getElementById('navToggle');
  const nav = document.getElementById('siteNav');
  if(!btn || !nav) return;

  const toggle = () => {
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  };

  btn.addEventListener('click', toggle);
  // Cerrar al hacer click en un enlace
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open'); btn.setAttribute('aria-expanded','false');
  }));
}

document.addEventListener('DOMContentLoaded', () => {
  // ... tus includes existentes ...
  // Espera un tick para que el header esté inyectado
  setTimeout(setupMobileNav, 0);
});
