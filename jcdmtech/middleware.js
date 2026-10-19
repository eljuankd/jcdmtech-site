// /middleware.js — Vercel Routing Middleware for temporary maintenance (docs/MAINTENANCE_MODE.md).
// Flags live in /js/maintenance.config.js.
//
// While QUELVO maintenance is on, every QUELVO / legacy chauffeur route answers
// HTTP 503 + Retry-After with the maintenance page. No redirects, nothing deleted.
// /admin/, /account.html and all other routes are not matched and keep working.
//
// No package.json: Vercel compiles this ESM file to CommonJS and bundles the imported config.
// runtime "nodejs" is explicit (the "edge" runtime is deprecated and is what Vercel picks otherwise).
import "./js/maintenance.config.js";

export const config = {
  runtime: "nodejs",
  matcher: ["/quelvo", "/quelvo/:path*", "/chofer-privado", "/chofer-privado/:path*"],
};

const FALLBACK_HTML = `<!doctype html><html lang="en" data-maintenance-page><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>QUELVO · Temporarily unavailable</title></head>
<body style="font-family:system-ui,sans-serif;background:#09090B;color:#EDEFF3;display:grid;place-items:center;min-height:100vh;margin:0;padding:24px;text-align:center">
<main><h1>QUELVO</h1>
<p>QUELVO is temporarily unavailable while we improve our platform. Thank you for your patience.</p>
<p lang="es">QUELVO no está disponible temporalmente mientras mejoramos nuestra plataforma. Gracias por tu paciencia.</p>
<p><a style="color:#C8A96E" href="/">JCDM Technologies</a></p></main></body></html>`;

// Same response as next() from @vercel/functions (checked in v3.10.1): continue the request untouched.
const next = () => new Response(null, { headers: { "x-middleware-next": "1" } });

export default async function middleware(request) {
  const q = globalThis.__MAINTENANCE__?.quelvo;
  if (q?.maintenance !== true) return next();

  let body = FALLBACK_HTML;
  try {
    // Forward cookies so the sub-request also passes Vercel Deployment Protection on Previews.
    const cookie = request.headers.get("cookie");
    const res = await fetch(new URL(q.page, request.url), {
      headers: cookie ? { cookie } : {},
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) body = await res.text();
  } catch (_) { /* keep fallback */ }

  return new Response(body, {
    status: 503,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Retry-After": String(q.retryAfter),
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
