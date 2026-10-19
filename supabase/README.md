# supabase/ — database SQL (not published)

This folder is outside the published site root (`jcdmtech/`), so nothing here is served by Vercel.

| File | Status |
|---|---|
| `legacy/supabase-setup.sql` | Original setup script, moved from `jcdmtech/supabase-setup.sql` on 2026-10-19 (content unchanged). **Historical — do not run as-is**: superseded by `migrations/2026-10-19-security-rls.sql`. Not the real remote schema (it does not define `bookings`). |
| `migrations/2026-10-19-security-rls.sql` | Security migration (profiles role guard, RLS for `profiles`, `bookings`, `vehicles`, `drivers`). **Not applied.** Procedure: `docs/SECURITY_REMEDIATION.md` §4. |
| `migrations/2026-10-19-security-rls.preflight.sql` | Read-only checks to run against the real database **before** the migration. |

The real schema is still not versioned (risk R-01). After Supabase is restored, export it here (P-003).
