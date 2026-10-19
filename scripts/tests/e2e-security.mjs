// Browser checks for the security remediation (docs/SECURITY_REMEDIATION.md §7).
// Usage: JCDM_TOOLS=<folder with puppeteer-core@24> node scripts/tests/e2e-security.mjs <base> [<baseMaintenanceOff>]
// <base> = scripts/tests/serve-vercel-output.mjs serving a local `vercel build` output (never production).
// No external traffic: every request outside localhost is aborted; supabase-js (esm.sh) is replaced by a fake
// module that records auth calls. CSP violations (Report-Only) are collected with securitypolicyviolation.
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
if (!process.env.JCDM_TOOLS) throw new Error("Set JCDM_TOOLS (see header)");
const req = createRequire(path.join(process.env.JCDM_TOOLS, "package.json"));
const { default: puppeteer } = await import(pathToFileURL(req.resolve("puppeteer-core")).href);

const BASE = process.argv[2].replace(/\/$/, "");
const BASE_OFF = process.argv[3]?.replace(/\/$/, "");
const browser = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new", args: ["--no-first-run"] });
let fails = 0, passes = 0;
const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); c ? passes++ : fails++; };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const FAKE_SB = `
const S = globalThis.__FAKE_SB__ || {};
const log = (...a) => (globalThis.__CALLS__ ||= []).push(a);
function chain() {
  const c = { select: () => c, eq: () => c, order: () => c, update: () => c, insert: () => c, delete: () => c,
    single: async () => ({ data: S.profile ?? null, error: null }), upsert: async () => ({ error: null }),
    then: (res) => res({ data: [], error: null }) };
  return c;
}
export function createClient() {
  return {
    auth: {
      getSession: async () => ({ data: { session: S.session ? { user: { id: "u1", email: "u@example.invalid" } } : null } }),
      onAuthStateChange: (cb) => { (globalThis.__AUTH_CBS__ ||= []).push(cb); return { data: { subscription: { unsubscribe() {} } } }; },
      signInWithPassword: async (a) => { log("password", a.email); return { error: null }; },
      signInWithOtp: async (a) => { log("otp", a.options?.emailRedirectTo); return { error: null }; },
      resetPasswordForEmail: async (e, o) => { log("reset", o?.redirectTo); return { error: null }; },
      signUp: async () => { log("signup"); return { data: { user: null, session: null }, error: null }; },
      signOut: async () => ({}), updateUser: async () => ({ error: null }),
    },
    from: () => chain(),
  };
}`;

async function open(path, { base = BASE, session = false, mobile = false, lang = "en", wait = "networkidle2" } = {}) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  const origin = new URL(base).origin;
  const errors = [], navs = [], dialogs = [];
  await page.setRequestInterception(true);
  page.on("request", (r) => {
    const u = r.url();
    if (r.isNavigationRequest() && r.frame() === page.mainFrame()) navs.push(u);
    if (u.startsWith("https://esm.sh/@supabase/supabase-js")) {
      return r.respond({ status: 200, contentType: "application/javascript", headers: { "access-control-allow-origin": "*" }, body: FAKE_SB });
    }
    if (u.startsWith(origin) || u.startsWith("data:")) return r.continue();
    return r.abort();   // GA, Maps, Supabase, fonts, Formspree, evil.example …: never leave the machine
  });
  page.on("dialog", async (d) => { dialogs.push(d.message()); await d.dismiss(); });
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("console", (m) => { if (m.type() === "error" && !/net::ERR_FAILED|Failed to load resource/.test(m.text())) errors.push("console: " + m.text().slice(0, 160)); });
  await page.evaluateOnNewDocument((session, lang) => {
    globalThis.__FAKE_SB__ = { session };
    globalThis.__CSP__ = [];
    document.addEventListener("securitypolicyviolation", (e) => globalThis.__CSP__.push(`${e.effectiveDirective} ← ${e.blockedURI} (${e.disposition})`));
    if (lang === "es") localStorage.setItem("jcdm_lang", "es");
  }, session, lang);
  await page.setViewport(mobile ? { width: 375, height: 812, isMobile: true, hasTouch: true } : { width: 1280, height: 900 });
  const res = await page.goto(base + path, { waitUntil: wait, timeout: 45000 }).catch((e) => ({ status: () => "ERR " + e.message }));
  await page.waitForSelector("#footer footer", { timeout: 8000 }).catch(() => {});
  return { page, ctx, status: res?.status?.(), errors, navs, dialogs };
}

// ── 1. Login: ?next= when already signed in (immediate redirect path) ─────────────────────────────
console.log("# login.html — redirect when a session already exists");
const legit = { "/account.html": "/account.html", "/admin/": "/admin/", "/services/?x=1#web": "/services/?x=1#web", "/%09/evil.example": "/%09/evil.example" };
const evil = ["https://evil.example/", "//evil.example", "/\\evil.example", "/\t/evil.example", "/\n/evil.example", "/.//evil.example",
  "javascript:alert(document.domain)", "JavaScript:alert(1)", "data:text/html,<script>alert(1)</script>", "@evil.example", "/login.html"];
for (const [nx, want] of Object.entries(legit)) {
  const t = await open("/login.html?next=" + encodeURIComponent(nx), { session: true, wait: "domcontentloaded" });
  await sleep(1500);
  const target = t.navs.slice(1)[0];
  ok(target === BASE + want, `next=${nx} → ${target}`);
  await t.ctx.close();
}
for (const nx of evil) {
  const t = await open("/login.html?next=" + encodeURIComponent(nx), { session: true, wait: "domcontentloaded" });
  await sleep(1500);
  const target = t.navs.slice(1)[0];
  ok(target === BASE + "/" && t.dialogs.length === 0 && t.navs.every((u) => u.startsWith(BASE)), `next=${JSON.stringify(nx)} → ${target} (dialogs ${t.dialogs.length})`);
  await t.ctx.close();
}

// ── 2. Login: email links and SIGNED_IN event without a session ─────────────────────────────────
console.log("# login.html — email link targets and sign-in event");
for (const [nx, want] of [["/account.html", "/account.html"], ["@evil.example", "/"], ["//evil.example", "/"], ["javascript:alert(1)", "/"]]) {
  const t = await open("/login.html?next=" + encodeURIComponent(nx));
  await t.page.type("#signinForm input[name=email]", "someone@example.invalid");
  await t.page.click("#magicLinkBtn"); await sleep(300);
  const calls = await t.page.evaluate(() => globalThis.__CALLS__ || []);
  const otp = calls.find((c) => c[0] === "otp");
  ok(otp && otp[1] === BASE + want, `magic link emailRedirectTo for next=${JSON.stringify(nx)} → ${otp?.[1]}`);
  const msg = await t.page.$eval("#signinMsg", (e) => e.textContent);
  ok(/Magic link sent/.test(msg), `magic link UI message shown (${msg.trim()})`);
  await t.ctx.close();
}
{
  const t = await open("/login.html?next=" + encodeURIComponent("/account.html"));
  await t.page.type("#signinForm input[name=email]", "someone@example.invalid");
  await t.page.click("#resetBtn"); await sleep(300);
  const reset = (await t.page.evaluate(() => globalThis.__CALLS__ || [])).find((c) => c[0] === "reset");
  ok(reset && reset[1] === BASE + "/reset-password.html", `password reset redirectTo unchanged → ${reset?.[1]}`);
  await t.ctx.close();
}
for (const [nx, want] of [["/admin/", "/admin/"], ["//evil.example", "/"]]) {
  const t = await open("/login.html?next=" + encodeURIComponent(nx));
  await t.page.type("#signinForm input[name=email]", "someone@example.invalid");
  await t.page.type("#signinForm input[name=password]", "not-a-real-password");
  await t.page.click("#signinBtn"); await sleep(300);
  const calls = await t.page.evaluate(() => globalThis.__CALLS__ || []);
  ok(calls.some((c) => c[0] === "password"), "password sign-in calls Supabase");
  await t.page.evaluate(() => (globalThis.__AUTH_CBS__ || []).forEach((cb) => cb("SIGNED_IN", { user: { id: "u1" } })));
  await sleep(1200);
  const target = t.navs.slice(1)[0];
  ok(target === BASE + want, `after SIGNED_IN with next=${JSON.stringify(nx)} → ${target}`);
  await t.ctx.close();
}
{
  const t = await open("/login.html");
  await t.page.click("#tabSignup"); await sleep(200);
  const vis = await t.page.evaluate(() => ({ up: getComputedStyle(document.getElementById("panelSignup")).display !== "none", inn: getComputedStyle(document.getElementById("panelSignin")).display !== "none" }));
  ok(vis.up && !vis.inn, "sign-up tab still switches panels");
  await t.page.type("#signupForm input[name=email]", "new@example.invalid");
  await t.page.type("#signupForm input[name=password]", "longenough1");
  await t.page.type("#signupForm input[name=confirm]", "longenough1");
  await t.page.click("#signupBtn"); await sleep(400);
  const msg = await t.page.$eval("#signupMsg", (e) => e.textContent);
  ok(/Account created/.test(msg), `sign-up flow reaches confirmation message (${msg.trim().slice(0, 40)}…)`);
  ok(t.errors.length === 0, `login page: no JS errors ${JSON.stringify(t.errors)}`);
  await t.ctx.close();
}

// ── 3. CSP Report-Only: no violations on the site's pages ─────────────────────────────────────────
console.log("# CSP Report-Only and console errors per page");
const pages = ["/", "/services/", "/projects/", "/about.html", "/contact.html", "/privacy.html", "/terms.html", "/music-ride/",
  "/qrcard.html", "/login.html", "/reset-password.html", "/account.html", "/admin/", "/maintenance/quelvo/", "/no-such-page", "/quelvo/"];
for (const p of pages) {
  const t = await open(p, { session: p === "/account.html" || p === "/admin/" });
  await sleep(500);
  const csp = await t.page.evaluate(() => globalThis.__CSP__ || []).catch(() => ["(page navigated)"]);
  ok(csp.length === 0, `${p} [${t.status}] CSP violations: ${JSON.stringify(csp)}`);
  const errs = t.errors.filter((e) => !/qrcard/.test(p) || !/404/.test(e));
  ok(errs.length === 0, `${p} JS errors: ${JSON.stringify(errs)}`);
  await t.ctx.close();
}
if (BASE_OFF) {
  for (const p of ["/quelvo/", "/quelvo/book/", "/quelvo/book/gracias/?via=email&code=QLV-TEST"]) {
    const t = await open(p, { base: BASE_OFF });
    await sleep(500);
    const csp = await t.page.evaluate(() => globalThis.__CSP__ || []);
    ok(t.status === 200 && csp.length === 0, `[maintenance OFF] ${p} [${t.status}] CSP violations: ${JSON.stringify(csp)}`);
    await t.ctx.close();
  }
  // Wizard steps 1→3 (no Maps: the Google script is blocked, so stop before addresses); never confirm.
  const t = await open("/quelvo/book/", { base: BASE_OFF });
  const hasSteps = await t.page.evaluate(() => !!document.querySelector("[onclick]"));
  ok(hasSteps, "[maintenance OFF] booking wizard rendered with its step controls (inline handlers allowed by CSP)");
  await t.ctx.close();
}

// ── 4. Clickjacking: pages cannot be framed ───────────────────────────────────────────────────────
console.log("# X-Frame-Options");
{
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.goto("data:text/html,<iframe id=f src='" + BASE + "/admin/' width=400 height=300></iframe>");
  await sleep(1500);
  const frame = page.frames().find((f) => f !== page.mainFrame());
  const loaded = frame ? await frame.evaluate(() => !!document.querySelector("#header, main")).catch(() => false) : false;
  ok(!loaded, `/admin/ cannot be embedded in a frame (frame url: ${frame?.url()})`);
  await ctx.close();
}

// ── 5. Regression: navigation, services, menu, language, maintenance ──────────────────────────────
console.log("# Regression");
for (const mobile of [false, true]) {
  const tag = mobile ? "[375px]" : "[1280px]";
  let t = await open("/", { mobile });
  const svc = await t.page.$$eval('a[href^="/services/#"]', (els) => [...new Set(els.map((e) => e.getAttribute("href")))]);
  ok(["#web", "#automation", "#smarthome", "#support"].every((a) => svc.includes("/services/" + a)), `${tag} Home links to the 4 tech services`);
  const navLinks = await t.page.$$eval("#siteNav a", (els) => els.map((a) => a.textContent.trim()));
  ok(["Services", "QUELVO", "Projects", "About", "Contact"].every((l) => navLinks.some((x) => x.includes(l))), `${tag} header partial loaded with nav links`);
  if (mobile) {
    await t.page.click("#navToggle"); await sleep(300);
    ok(await t.page.evaluate(() => document.getElementById("siteNav").classList.contains("open")), `${tag} mobile menu opens`);
  }
  await t.page.click("#langToggle"); await sleep(300);
  ok((await t.page.evaluate(() => document.documentElement.lang)) === "es", `${tag} language toggle EN→ES`);
  const notes = await t.page.$$eval(".maint-note", (els) => els.filter((e) => e.offsetParent).map((e) => e.textContent.trim()));
  ok(notes.includes("Reservas suspendidas temporalmente"), `${tag} maintenance notices still shown (${JSON.stringify(notes)})`);
  await t.page.click("#themeToggle"); await sleep(200);
  ok(await t.page.evaluate(() => document.documentElement.classList.contains("light-mode")), `${tag} theme toggle works`);
  ok(t.errors.length === 0, `${tag} Home without JS errors ${JSON.stringify(t.errors)}`);
  await t.ctx.close();
  t = await open("/services/", { mobile });
  const ids = await t.page.$$eval("#web, #automation, #smarthome, #support", (els) => els.map((e) => e.id));
  ok(t.status === 200 && ids.length === 4, `${tag} Services: 4 sections ${JSON.stringify(ids)}`);
  await t.ctx.close();
}
for (const p of ["/quelvo/", "/quelvo/book/", "/chofer-privado/reservar.html", "/chofer-privado"]) {
  const t = await open(p);
  const msg = await t.page.evaluate(() => document.querySelector(".mt-msg")?.textContent.trim() || "");
  ok(t.status === 503 && /temporarily unavailable/i.test(msg), `${p} → 503 maintenance page`);
  await t.ctx.close();
}
{
  const t = await open("/contact.html");
  const form = await t.page.evaluate(() => ({ action: document.querySelector("form[name=contact-form]")?.action, hp: !!document.querySelector("input[name=_gotcha]"),
    quelvoOptDisabled: [...document.querySelectorAll("option[data-maint-hide~=quelvo]")].every((o) => o.disabled) }));
  ok(form.action === "https://formspree.io/f/xgvljywo" && form.hp && form.quelvoOptDisabled, `contact form intact (Formspree action, honeypot, QUELVO option disabled)`);
  await t.ctx.close();
}

await browser.close();
console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
