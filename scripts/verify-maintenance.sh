#!/usr/bin/env bash
# scripts/verify-maintenance.sh — read-only HTTP checks for the maintenance mode (docs/MAINTENANCE_MODE.md §5).
# Not deployed (outside jcdmtech/). Only sends GET/HEAD requests.
#
# Usage:
#   scripts/verify-maintenance.sh https://<preview>.vercel.app            # Preview without protection
#   VERCEL_BYPASS=<token> scripts/verify-maintenance.sh https://<preview>  # Preview with Deployment Protection
#   scripts/verify-maintenance.sh https://www.jcdmtech.com                 # production (after authorized deploy)
#
# Expects QUELVO maintenance ON. Exit code = number of failed checks.
set -u
BASE="${1:?usage: $0 <base-url>}"; BASE="${BASE%/}"
HDR=(); [ -n "${VERCEL_BYPASS:-}" ] && HDR=(-H "x-vercel-protection-bypass: $VERCEL_BYPASS")
FAIL=0

check() { # path expected_status [expect_retry_after]
  local path="$1" want="$2" retry="${3:-}" out code ra
  out=$(curl -s -o /dev/null -D - --max-time 20 "${HDR[@]}" "$BASE$path")
  code=$(printf '%s' "$out" | awk 'toupper($1) ~ /^HTTP/ {c=$2} END {print c}')
  ra=$(printf '%s' "$out" | awk -F': ' 'tolower($1)=="retry-after" {gsub("\r","",$2); print $2}')
  local ok=1; [ "$code" = "$want" ] || ok=0
  [ -n "$retry" ] && [ -z "$ra" ] && ok=0
  printf '%s %-34s got %-4s want %-4s %s\n' "$([ $ok = 1 ] && echo PASS || echo FAIL)" "$path" "$code" "$want" "${ra:+Retry-After=$ra}"
  [ $ok = 1 ] || FAIL=$((FAIL+1))
}

echo "== QUELVO routes → 503 + Retry-After (no redirect)"
for p in /quelvo/ /quelvo/book/ /quelvo/book/gracias/ /chofer-privado/; do check "$p" 503 retry; done
echo "== Existing vercel.json redirects still answer first (then land on a 503 page)"
check /quelvo 308; check /chofer-privado/reservar.html 307; check /chofer-privado/gracias.html 308
echo "== Rest of the site unaffected"
for p in / /services/ /projects/ /admin/ /maintenance/quelvo/ /js/maintenance.config.js /styles.css; do check "$p" 200; done
echo "== URL-style regression check (compare with production: /about.html 200, /about 308, /about/ 404)"
for p in /about.html /contact.html /qrcard.html /privacy.html /about; do
  printf '     %-34s %s\n' "$p" "$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' --max-time 20 "${HDR[@]}" "$BASE$p")"
done
echo "== middleware.js must not be downloadable as a static file (expect 404)"
check /middleware.js 404
echo "Failed checks: $FAIL"
exit $FAIL
