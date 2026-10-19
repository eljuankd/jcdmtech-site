-- supabase/migrations/2026-10-19-security-rls.preflight.sql
-- READ-ONLY checks for project jcdmtech-prod BEFORE applying 2026-10-19-security-rls.sql.
-- Nothing here writes. Run each query in the SQL editor and save the output (it is also the
-- reference to compare with after the migration). Procedure: docs/SECURITY_REMEDIATION.md §4.
-- STOP and review with the owner if any result differs from "Expected".

-- A) Required tables and columns. Expected: every row status = 'ok'.
--    (Column lists = what the site code reads/writes: login, account, app.js, quelvo/book, admin.)
with req(tbl, col) as (values
  ('profiles','id'),('profiles','role'),('profiles','full_name'),('profiles','phone'),('profiles','theme'),('profiles','lang'),
  ('bookings','id'),('bookings','booking_code'),('bookings','user_id'),('bookings','service_type'),('bookings','vehicle_class'),
  ('bookings','pickup_address'),('bookings','dropoff_address'),('bookings','pickup_lat'),('bookings','pickup_lng'),
  ('bookings','dropoff_lat'),('bookings','dropoff_lng'),('bookings','pickup_at'),('bookings','requested_hours'),
  ('bookings','estimated_minutes'),('bookings','estimated_miles'),('bookings','passengers'),('bookings','client_name'),
  ('bookings','client_email'),('bookings','client_phone'),('bookings','flight_number'),('bookings','special_requests'),
  ('bookings','base_price'),('bookings','pricing_type'),('bookings','requires_quote'),('bookings','status'),
  ('bookings','driver_id'),('bookings','admin_price'),('bookings','admin_notes'),('bookings','created_at'),
  ('vehicles','id'),('drivers','id'))
select r.tbl, r.col,
       case when c.column_name is not null then 'ok' else 'MISSING' end as status,
       c.data_type, c.is_nullable, c.column_default
from req r
left join information_schema.columns c
  on c.table_schema = 'public' and c.table_name = r.tbl and c.column_name = r.col
order by status desc, r.tbl, r.col;

-- B) Names the migration creates must be free. Expected: 3 rows 'free'.
select 'public.is_admin()' as object,
       case when to_regprocedure('public.is_admin()') is null then 'free' else 'EXISTS — review its definition' end as status
union all
select 'public.profiles_guard_role()',
       case when to_regprocedure('public.profiles_guard_role()') is null then 'free' else 'EXISTS' end
union all
select 'public.jcdm_security_backup_20261019',
       case when to_regclass('public.jcdm_security_backup_20261019') is null then 'free' else 'EXISTS (already applied?)' end;

-- C) RLS status. Expected: the 4 tables listed; note any with rls_enabled = false.
select c.relname as table_name, c.relrowsecurity as rls_enabled, c.relforcerowsecurity as rls_forced
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname in ('profiles','bookings','vehicles','drivers')
order by 1;

-- D) Every current policy on the 4 tables (the migration replaces ALL of them; it backs them up first).
select tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public' and tablename in ('profiles','bookings','vehicles','drivers')
order by tablename, policyname;

-- E) Table privileges of the API roles.
select table_name, grantee, string_agg(privilege_type, ', ' order by privilege_type) as privileges
from information_schema.role_table_grants
where table_schema = 'public' and table_name in ('profiles','bookings','vehicles','drivers')
  and grantee in ('anon','authenticated')
group by 1, 2 order by 1, 2;

-- F) Triggers on the 4 tables (awareness: side effects such as webhooks / pg_net on bookings).
select c.relname as table_name, t.tgname, t.tgenabled, pg_get_triggerdef(t.oid) as definition
from pg_trigger t join pg_class c on c.oid = t.tgrelid join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname in ('profiles','bookings','vehicles','drivers') and not t.tgisinternal
order by 1, 2;

-- G) INDICATOR OF COMPROMISE (J-01): who is admin, and since when. Expected: only the owner's account(s).
--    Any unknown admin = treat as an incident (do not continue; see docs/SECURITY_REMEDIATION.md §4.4).
select p.id, u.email, u.created_at as user_created, u.last_sign_in_at, p.role
from public.profiles p left join auth.users u on u.id = p.id
where p.role is distinct from 'user'
order by u.created_at;

-- H) Account creation per month (unusual spikes = possible abuse of open sign-up).
select date_trunc('month', created_at) as month, count(*) as users,
       count(*) filter (where email_confirmed_at is null) as unconfirmed
from auth.users group by 1 order by 1;

-- I) Bookings that a browser could not legitimately create (status/admin fields set without an admin).
--    Informational: needs the owner's judgement (admins also edit these fields from /admin/).
select status, count(*) as total,
       count(*) filter (where admin_price is not null) as with_admin_price,
       count(*) filter (where driver_id is not null) as with_driver
from public.bookings group by 1 order by 1;

-- J) Other API-reachable objects in public that could bypass RLS: views and SECURITY DEFINER functions.
select 'view' as kind, table_name as name from information_schema.views where table_schema = 'public'
union all
select 'security definer function', p.oid::regprocedure::text
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.prosecdef
order by 1, 2;

-- K) Storage buckets (public buckets are readable by anyone).
select id, name, public from storage.buckets order by 1;

-- L) Data snapshot. Must be IDENTICAL after the migration (it changes permissions only).
select (select count(*) from public.profiles) as profiles,
       (select count(*) from public.bookings) as bookings,
       (select count(*) from public.vehicles) as vehicles,
       (select count(*) from public.drivers)  as drivers,
       (select count(*) from auth.users)      as users,
       (select max(created_at) from public.bookings) as last_booking;
