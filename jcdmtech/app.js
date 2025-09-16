
async function inject(id, url){
  const el = document.getElementById(id);
  if(!el) return;
  try{
    const res = await fetch(url, { cache: "no-store" });
    el.innerHTML = await res.text();
    bindThemeToggle();
  }catch(e){ console.warn("No se pudo cargar", url, e); }
}
inject("header", "/partials/header.html");
inject("footer", "/partials/footer.html");

function bindThemeToggle(){
  const toggle = document.getElementById('themeToggle');
  const saved = localStorage.getItem('theme');
  if(saved === 'light'){ document.documentElement.classList.add('dark-mode'); }
  toggle?.addEventListener('click', () => {
    const isLight = document.documentElement.classList.toggle('dark-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  });
}
