// Unit tests for jcdmtech/js/safe-next.js (J-03, docs/SECURITY_REMEDIATION.md).
// Run: node --test scripts/tests/safe-next.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

// The site has no package.json, so load the browser module from source as ESM.
const src = fs.readFileSync(new URL("../../jcdmtech/js/safe-next.js", import.meta.url), "utf8");
const { safeNext } = await import("data:text/javascript," + encodeURIComponent(src));

const ORIGIN = "https://www.jcdmtech.com";

test("legitimate internal destinations are kept", () => {
  const cases = {
    "/": "/",
    "/admin/": "/admin/",
    "/account.html": "/account.html",
    "/quelvo/book/?svc=transfer#step2": "/quelvo/book/?svc=transfer#step2",
    "/services/#web": "/services/#web",
    "/a/../account.html": "/account.html",
    "/%2F%2Fexample.com": "/%2F%2Fexample.com", // encoded: stays a same-origin path
  };
  for (const [input, expected] of Object.entries(cases)) {
    assert.equal(safeNext(input, ORIGIN), expected, input);
  }
});

test("missing or empty value falls back to /", () => {
  for (const v of [null, undefined, "", 42, {}]) assert.equal(safeNext(v, ORIGIN), "/");
});

test("malicious or ambiguous destinations fall back to /", () => {
  const bad = [
    "https://evil.example",
    "http://evil.example/admin/",
    "//evil.example",
    "///evil.example",
    "/\\evil.example",
    "\\\\evil.example",
    "\\/evil.example",
    "/\t/evil.example",
    "/\n/evil.example",
    "/\r/evil.example",
    " /admin/",
    "/admin/ ",
    "/.//evil.example",
    "/..//evil.example",
    "/x/..//evil.example",
    "javascript:alert(1)",
    "JaVaScRiPt:alert(1)",
    "  javascript:alert(1)",
    "java\tscript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "vbscript:msgbox(1)",
    "@evil.example",
    ".evil.example",
    "evil.example",
    "%2F%2Fevil.example",
    "/\u0000/evil.example",
    "/\u2028/evil.example",
    "/login.html",
    "/login.html?next=/admin/",
    "/" + "a".repeat(3000),
  ];
  for (const input of bad) assert.equal(safeNext(input, ORIGIN), "/", JSON.stringify(input));
});

test("result never yields another origin when reused as location or email link", () => {
  const inputs = ["/", "/admin/", "//evil.example", "/.//evil.example", "@evil.example", "javascript:alert(1)"];
  for (const input of inputs) {
    const out = safeNext(input, ORIGIN);
    assert.equal(new URL(out, ORIGIN).origin, ORIGIN, input);
    assert.equal(new URL(ORIGIN + out).origin, ORIGIN, "emailRedirectTo for " + input);
  }
});
