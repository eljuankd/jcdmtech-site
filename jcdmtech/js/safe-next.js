// /js/safe-next.js — validates the post-login destination (?next=…) used by /login.html.
//
// Only same-origin paths are allowed ("/admin/", "/account.html?x=1#y"). Anything else
// (other sites, protocol-relative "//host", backslashes, "javascript:"/"data:" schemes,
// control characters or whitespace that browsers strip, dot-segments that collapse to
// "//host", or a loop back to the login page) falls back to "/".
// Unit tests: scripts/tests/safe-next.test.mjs (run with `node --test scripts/tests/safe-next.test.mjs`).

const FALLBACK = "/";
const MAX_LENGTH = 2048;

export function safeNext(raw, origin) {
  if (typeof raw !== "string" || raw === "" || raw.length > MAX_LENGTH) return FALLBACK;
  // Must be an absolute path on this site: one leading "/", never "//" or "/\".
  if (raw[0] !== "/" || raw[1] === "/" || raw[1] === "\\") return FALLBACK;
  // Backslashes are treated as "/" by browsers; control chars, spaces and tabs/newlines
  // are stripped or normalised by the URL parser and can turn "/\t/host" into "//host".
  for (let i = 0; i < raw.length; i++) {
    const c = raw.charCodeAt(i);
    if (c <= 32 || (c >= 127 && c <= 159) || c === 92 /* backslash */ || c === 8232 || c === 8233) return FALLBACK;
  }

  let url;
  try {
    url = new URL(raw, origin);
  } catch (_) {
    return FALLBACK;
  }
  if (url.origin !== new URL(origin).origin) return FALLBACK;
  // "/.//host" or "/..//host" normalise to pathname "//host" (protocol-relative when reused).
  if (url.pathname.startsWith("//")) return FALLBACK;
  // Avoid redirect loops back to the sign-in page.
  if (url.pathname === "/login.html" || url.pathname === "/login") return FALLBACK;

  return url.pathname + url.search + url.hash;
}
