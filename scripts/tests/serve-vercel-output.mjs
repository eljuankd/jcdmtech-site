// Serves a `vercel build` output (.vercel/output) applying its compiled routes in order:
// redirects → headers (continue) → Routing Middleware (the compiled function) → filesystem → error routes.
// Usage: node scripts/tests/serve-vercel-output.mjs <path/to/.vercel/output> <port>
// Test tool only: emulates Vercel routing locally (no Vercel login, no deployment). Middleware responses are returned as-is.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const OUT = path.resolve(process.argv[2]);
const PORT = Number(process.argv[3] || 5055);
const cfg = JSON.parse(fs.readFileSync(path.join(OUT, "config.json"), "utf8"));
const STATIC = path.join(OUT, "static");
const req = createRequire(import.meta.url);
const mwMod = req(path.join(OUT, "functions/middleware.func/middleware.js"));
const middleware = mwMod.default;

const MIME = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "application/javascript; charset=utf-8",
  ".json": "application/json", ".png": "image/png", ".ico": "image/x-icon", ".svg": "image/svg+xml", ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8", ".vcf": "text/x-vcard; charset=utf-8", ".webmanifest": "application/manifest+json" };

function fileFor(p) {
  const rel = decodeURIComponent(p).replace(/^\/+/, "");
  const abs = path.join(STATIC, rel);
  if (!abs.startsWith(STATIC)) return null;
  if (fs.existsSync(abs) && fs.statSync(abs).isFile()) return abs;
  if (fs.existsSync(abs) && fs.statSync(abs).isDirectory() && fs.existsSync(path.join(abs, "index.html"))) return path.join(abs, "index.html");
  return null;
}

http.createServer(async (rq, rs) => {
  const url = new URL(rq.url, `http://localhost:${PORT}`);
  const p = url.pathname;
  const acc = {};
  let phase = "main";
  for (const r of cfg.routes) {
    if (r.handle) { phase = r.handle; if (phase === "error") break; continue; }
    if (!new RegExp(r.src).test(p)) continue;
    if (r.status && r.headers?.Location) {
      rs.writeHead(r.status, { ...acc, ...r.headers }); return rs.end();
    }
    if (r.middlewarePath) {
      const headers = new Headers(Object.entries(rq.headers).map(([k, v]) => [k, String(v)]));
      const res = await middleware(new Request(url, { method: rq.method, headers }));
      if (res.headers.get("x-middleware-next") === "1") continue;
      const body = Buffer.from(await res.arrayBuffer());
      rs.writeHead(res.status, Object.fromEntries(res.headers)); return rs.end(body);   // middleware response as-is
    }
    if (r.headers && r.continue) Object.assign(acc, r.headers);
  }
  const f = fileFor(p);
  if (f) {
    rs.writeHead(200, { ...acc, "Content-Type": MIME[path.extname(f)] || "application/octet-stream" });
    return rs.end(fs.readFileSync(f));
  }
  const nf = path.join(STATIC, "404.html");
  rs.writeHead(404, { ...acc, "Content-Type": "text/html; charset=utf-8" });
  rs.end(fs.existsSync(nf) ? fs.readFileSync(nf) : "Not found");
}).listen(PORT, () => console.log(`serving ${OUT} on http://localhost:${PORT}`));
