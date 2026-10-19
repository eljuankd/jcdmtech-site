-- supabase/migrations/2026-10-19-security-rls.sql
-- Security migration for Supabase project jcdmtech-prod (findings J-01, J-02, J-06 — docs/SECURITY_REMEDIATION.md).
-- STATUS: PREPARED, NOT APPLIED. The project is PAUSED; it must be restored first (owner authorization).
-- ORDER: preflight (…preflight.sql, read-only) → this file → …verify.sql (rolls itself back).
-- Rollback: …rollback.sql (restores the policies/grants saved by this file in public.jcdm_security_backup_20261019).
--
-- What it does (permissions only — no row of data is inserted, updated or deleted):
--   * profiles: a non-admin can never set/change `role` (column privileges + trigger), only reads/edits
--     its own row; admins can read all profiles. Role changes are made from the SQL editor only.
--   * bookings: the browser (anon or signed-in) may only INSERT a booking request — status 'pending' or
--     'pending_quote', no admin columns, never on behalf of another user. Customers read only their own
--     bookings; nobody but an admin reads or updates others. Admin columns editable only by admins.
--   * vehicles / drivers: admin only.
--   * Replaces the recursive policy "admin_read_all_profiles" with public.is_admin() (SECURITY DEFINER).
--   * ALL existing policies on these 4 tables are replaced (permissive policies are OR-ed, so an unknown
--     old policy would silently re-open access). They are backed up first.
-- Compatible with docs/sql/quelvo-maintenance.sql (its trigger keeps working; admins still bypass it).
-- Assumes the column set listed in step 0 (= what the site code uses). If step 0 fails: STOP, do not edit
-- the checks to make them pass — review the real schema with the owner.

begin;

-- ───────────────────────── 0. Dependencies (fails loudly, nothing changed yet) ─────────────────────────
do $$
declare
  missing text;
begin
  select string_agg(r.tbl || '.' || r.col, ', ') into missing
  from (values
    ('profiles','id'),('profiles','role'),('profiles','full_name'),('profiles','phone'),('profiles','theme'),('profiles','lang'),
    ('bookings','id'),('bookings','booking_code'),('bookings','user_id'),('bookings','service_type'),('bookings','vehicle_class'),
    ('bookings','pickup_address'),('bookings','dropoff_address'),('bookings','pickup_lat'),('bookings','pickup_lng'),
    ('bookings','dropoff_lat'),('bookings','dropoff_lng'),('bookings','pickup_at'),('bookings','requested_hours'),
    ('bookings','estimated_minutes'),('bookings','estimated_miles'),('bookings','passengers'),('bookings','client_name'),
    ('bookings','client_email'),('bookings','client_phone'),('bookings','flight_number'),('bookings','special_requests'),
    ('bookings','base_price'),('bookings','pricing_type'),('bookings','requires_quote'),('bookings','status'),
    ('bookings','driver_id'),('bookings','admin_price'),('bookings','admin_notes'),
    ('vehicles','id'),('drivers','id')
  ) as r(tbl, col)
  where not exists (select 1 from information_schema.columns c
                    where c.table_schema = 'public' and c.table_name = r.tbl and c.column_name = r.col);
  if missing is not null then
    raise exception 'security-rls: expected columns not found: %. Nothing was changed.', missing;
  end if;
  if to_regprocedure('auth.uid()') is null then
    raise exception 'security-rls: auth.uid() not found. Nothing was changed.';
  end if;
end
$$;

-- ───────────────────────── 1. Backup of current policies, grants and RLS flags ─────────────────────────
create table public.jcdm_security_backup_20261019 (      -- fails loudly if already applied
  id         bigint generated always as identity primary key,
  kind       text not null check (kind in ('policy', 'table_grant', 'column_grant', 'rls')),
  table_name text not null,
  detail     jsonb not null,
  saved_at   timestamptz not null default now()
);
comment on table public.jcdm_security_backup_20261019 is
  'Snapshot taken by supabase/migrations/2026-10-19-security-rls.sql; used by its rollback. Safe to drop once the migration is accepted.';
alter table public.jcdm_security_backup_20261019 enable row level security;   -- no policies ⇒ not reachable via the API
revoke all on public.jcdm_security_backup_20261019 from anon, authenticated;

insert into public.jcdm_security_backup_20261019 (kind, table_name, detail)
select 'policy', p.tablename, to_jsonb(p)
from pg_policies p
where p.schemaname = 'public' and p.tablename in ('profiles','bookings','vehicles','drivers');

insert into public.jcdm_security_backup_20261019 (kind, table_name, detail)
select 'table_grant', g.table_name, jsonb_build_object('grantee', g.grantee, 'privilege_type', g.privilege_type)
from information_schema.role_table_grants g
where g.table_schema = 'public' and g.table_name in ('profiles','bookings','vehicles','drivers')
  and g.grantee in ('anon','authenticated');

insert into public.jcdm_security_backup_20261019 (kind, table_name, detail)
select 'column_grant', g.table_name,
       jsonb_build_object('grantee', g.grantee, 'privilege_type', g.privilege_type, 'column_name', g.column_name)
from information_schema.column_privileges g
where g.table_schema = 'public' and g.table_name in ('profiles','bookings','vehicles','drivers')
  and g.grantee in ('anon','authenticated');

insert into public.jcdm_security_backup_20261019 (kind, table_name, detail)
select 'rls', c.relname, jsonb_build_object('enabled', c.relrowsecurity, 'forced', c.relforcerowsecurity)
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname in ('profiles','bookings','vehicles','drivers');

-- ───────────────────────── 2. Helper: is the caller an admin? ─────────────────────────
-- SECURITY DEFINER: reads profiles without going through RLS (avoids the recursive policy).
create function public.is_admin()                       -- fails loudly if the name is taken
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin');
$$;
revoke all on function public.is_admin() from public, anon, authenticated;
grant execute on function public.is_admin() to authenticated;

-- ───────────────────────── 3. Guard: API callers cannot grant themselves a role ─────────────────────────
-- Second barrier besides column privileges (step 6): survives a future "grant all" by mistake.
-- Not applied to service_role, the SQL editor or the sign-up trigger (no API JWT role).
create function public.profiles_guard_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  claims   jsonb := nullif(current_setting('request.jwt.claims', true), '')::jsonb;
  req_role text;
begin
  req_role := coalesce(claims ->> 'role', nullif(current_setting('request.jwt.claim.role', true), ''));
  if req_role is null or req_role not in ('anon', 'authenticated') then
    return new;
  end if;
  if public.is_admin() then
    return new;
  end if;
  if tg_op = 'INSERT' and new.role is distinct from 'user' then
    raise exception using errcode = '42501', message = 'profiles: role can only be assigned by an administrator';
  end if;
  if tg_op = 'UPDATE' and (new.role is distinct from old.role or new.id is distinct from old.id) then
    raise exception using errcode = '42501', message = 'profiles: role and id cannot be changed';
  end if;
  return new;
end;
$$;
revoke all on function public.profiles_guard_role() from public, anon, authenticated;

create trigger profiles_guard_role
  before insert or update on public.profiles
  for each row execute function public.profiles_guard_role();

-- ───────────────────────── 4. Remove every existing policy on the 4 tables (backed up in step 1) ─────────
do $$
declare
  r record;
begin
  for r in select tablename, policyname from pg_policies
           where schemaname = 'public' and tablename in ('profiles','bookings','vehicles','drivers')
  loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
end
$$;

-- ───────────────────────── 5. RLS on ─────────────────────────
alter table public.profiles enable row level security;
alter table public.bookings enable row level security;
alter table public.vehicles enable row level security;
alter table public.drivers  enable row level security;

-- ───────────────────────── 6. API privileges (column level where it matters) ─────────────────────────
revoke all on table public.profiles, public.bookings, public.vehicles, public.drivers from anon, authenticated;

-- profiles: login.html upserts {id, role:'user'} (ON CONFLICT DO NOTHING); account.html upserts {id, full_name, phone}
-- (PostgREST sets every sent column on conflict, including id); app.js updates theme/lang.
grant select on public.profiles to authenticated;
grant insert (id, role, full_name, phone, theme, lang) on public.profiles to authenticated;
grant update (id, full_name, phone, theme, lang) on public.profiles to authenticated;   -- never role

-- bookings: exactly the columns sent by /quelvo/book/ (confirm4). Admin columns are not insertable from the API.
grant insert (booking_code, user_id, service_type, vehicle_class, pickup_address, dropoff_address,
              pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, pickup_at, requested_hours,
              estimated_minutes, estimated_miles, passengers, client_name, client_email, client_phone,
              flight_number, special_requests, base_price, pricing_type, requires_quote, status)
  on public.bookings to anon, authenticated;
grant select on public.bookings to authenticated;
grant update (status, driver_id, admin_price, admin_notes) on public.bookings to authenticated;   -- = /admin/ form

grant select, insert, update, delete on public.vehicles, public.drivers to authenticated;

-- ───────────────────────── 7. Policies ─────────────────────────
-- profiles
create policy profiles_select_own_or_admin on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or public.is_admin());
create policy profiles_insert_own on public.profiles
  for insert to authenticated
  with check (id = (select auth.uid()) and role = 'user');
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));
-- (no delete policy: profiles are removed only through auth.users ON DELETE CASCADE)

-- bookings
create policy bookings_insert_request on public.bookings
  for insert to anon, authenticated
  with check (
    status in ('pending', 'pending_quote')
    and coalesce(requires_quote, false) = (status = 'pending_quote')
    and (base_price is null or base_price >= 0)
    and (user_id is null or user_id = (select auth.uid()))
  );
create policy bookings_select_own_or_admin on public.bookings
  for select to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());
create policy bookings_update_admin on public.bookings
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());
-- (no delete policy: the admin panel does not delete bookings)

-- vehicles / drivers
create policy vehicles_admin_all on public.vehicles
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy drivers_admin_all on public.drivers
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

commit;

-- After commit: run …verify.sql (expects "0 failure(s)"), then re-run preflight L) — numbers must be identical.
