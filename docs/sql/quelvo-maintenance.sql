-- docs/sql/quelvo-maintenance.sql
-- QUELVO temporary suspension — server-side enforcement in Supabase (project jcdmtech-prod, nrmajnnfejafbtkpvpob).
-- STATUS: PREPARED, NOT APPLIED. Run only with the owner's explicit authorization.
--         As of 2026-10-19 the project is PAUSED (status INACTIVE): it must be restored first — see
--         docs/MAINTENANCE_MODE.md §4 for the required order (web maintenance live BEFORE restoring).
--
-- Why: /quelvo/book/ inserts into public.bookings straight from the browser with the anon key.
-- Hiding the page is not enough — anyone holding the (public) anon key could still insert.
--
-- Flag semantics (same as js/maintenance.config.js):
--   jcdm_maintenance_flags.maintenance = true   → QUELVO SUSPENDED: API inserts into bookings rejected
--   jcdm_maintenance_flags.maintenance = false  → QUELVO AVAILABLE
--   row missing                                 → treated as available (never blocks by accident)
--
-- Who is blocked while suspended: requests through the Supabase API with role anon or authenticated,
-- unless profiles.role = 'admin'. NOT blocked: service_role key, direct DB sessions (SQL editor).
-- Nothing is deleted or updated; RLS policies, profiles, vehicles, drivers and existing bookings untouched.
-- The admin panel only SELECTs/UPDATEs bookings (verified in jcdmtech/admin/index.html) → unaffected.
--
-- Before section 1, run the dry run docs/sql/quelvo-maintenance.test.sql (it rolls itself back).

-- ───────────────────────── 0. Preflight (read-only) — STOP if any result differs ─────────────────────────
-- a) Required objects. Expected: 4 rows, all "ok".
--   select 'bookings table'  as dep, case when to_regclass('public.bookings') is not null then 'ok' else 'MISSING' end as status
--   union all select 'profiles.role column', case when exists (select 1 from information_schema.columns
--          where table_schema='public' and table_name='profiles' and column_name='role') then 'ok' else 'MISSING' end
--   union all select 'auth.uid()', case when to_regprocedure('auth.uid()') is not null then 'ok' else 'MISSING' end
--   union all select 'name free: jcdm_maintenance_flags', case when to_regclass('public.jcdm_maintenance_flags') is null
--          then 'ok' else 'EXISTS (already installed? compare with section 1)' end;
-- b) Existing triggers on bookings (awareness; ours is BEFORE INSERT and aborts the insert before any AFTER trigger):
--   select tgname, pg_get_triggerdef(oid) from pg_trigger where tgrelid='public.bookings'::regclass and not tgisinternal;
-- c) RLS policies on bookings (unchanged by this script; record them):
--   select policyname, cmd, roles, qual, with_check from pg_policies where schemaname='public' and tablename='bookings';
-- d) Data snapshot to compare after installing (must stay identical):
--   select count(*) as total, max(created_at) as last_created from public.bookings;
--   select status, count(*) from public.bookings group by 1 order by 1;
--   select (select count(*) from public.profiles) as profiles, (select count(*) from public.vehicles) as vehicles,
--          (select count(*) from public.drivers) as drivers, (select count(*) from auth.users) as users;
-- e) At least one admin exists (otherwise nobody can register bookings through the panel/API while suspended):
--   select count(*) from public.profiles where role = 'admin';

-- ───────────────────────── 1. Install (once) — starts SUSPENDED ─────────────────────────
begin;

create table public.jcdm_maintenance_flags (          -- fails loudly if the name is already taken
  key         text primary key,
  maintenance boolean not null,
  updated_at  timestamptz not null default now()
);
comment on table public.jcdm_maintenance_flags is
  'Temporary maintenance flags (docs/MAINTENANCE_MODE.md). maintenance=true means the platform is suspended.';
alter table public.jcdm_maintenance_flags enable row level security;   -- no policies ⇒ not reachable via the API
revoke all on public.jcdm_maintenance_flags from anon, authenticated;

insert into public.jcdm_maintenance_flags (key, maintenance) values ('quelvo', true);

create or replace function public.quelvo_bookings_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  in_maintenance boolean;
  claims   jsonb := nullif(current_setting('request.jwt.claims', true), '')::jsonb;
  req_role text;
begin
  select f.maintenance into in_maintenance
  from public.jcdm_maintenance_flags f where f.key = 'quelvo';

  if in_maintenance is distinct from true then
    return new;                                   -- available, or flag row missing
  end if;

  req_role := coalesce(claims ->> 'role', nullif(current_setting('request.jwt.claim.role', true), ''));
  if req_role is null or req_role not in ('anon', 'authenticated') then
    return new;                                   -- service_role or direct DB session
  end if;

  if exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin') then
    return new;                                   -- admins may still register bookings
  end if;

  raise exception using
    errcode = 'P0001',
    message = 'QUELVO is temporarily unavailable while we improve our platform. New bookings are suspended.',
    hint    = 'quelvo_maintenance';
end;
$$;
revoke all on function public.quelvo_bookings_guard() from public, anon, authenticated;

create trigger quelvo_bookings_maintenance
  before insert on public.bookings
  for each row execute function public.quelvo_bookings_guard();

commit;

-- ───────────────────────── 2. Toggle (effect is immediate, no redeploy) ─────────────────────────
-- Suspend:   update public.jcdm_maintenance_flags set maintenance = true,  updated_at = now() where key = 'quelvo';
-- Reopen:    update public.jcdm_maintenance_flags set maintenance = false, updated_at = now() where key = 'quelvo';
-- Each must report "UPDATE 1". "UPDATE 0" means the row is missing ⇒ bookings are OPEN.

-- ───────────────────────── 3. Checks after install / toggle (read-only) ─────────────────────────
--   select key, maintenance, updated_at from public.jcdm_maintenance_flags;
--   select tgname, tgenabled from pg_trigger where tgrelid = 'public.bookings'::regclass and tgname = 'quelvo_bookings_maintenance';
--     (tgenabled must be 'O')
--   Re-run preflight d): every number identical to the snapshot.

-- ───────────────────────── 4. Full uninstall (optional, after reopening) ─────────────────────────
-- Only removes the mechanism; booking data is untouched.
--   begin;
--   drop trigger if exists quelvo_bookings_maintenance on public.bookings;
--   drop function if exists public.quelvo_bookings_guard();
--   drop table if exists public.jcdm_maintenance_flags;
--   commit;
