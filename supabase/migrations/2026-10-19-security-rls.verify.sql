-- supabase/migrations/2026-10-19-security-rls.verify.sql
-- Post-migration check on the REAL database. It ALWAYS ends with an intentional error, so everything it does
-- (one test booking insert, no-op updates, temporary helper) is rolled back even if the editor auto-commits.
-- Expected last message: "VERIFY FINISHED (everything rolled back) — 0 failure(s)". Read the [PASS]/[FAIL] notices.
-- Requirements: at least one profile with role 'admin' and one with role 'user'; the migration applied.
-- Before running: check preflight F) — a trigger with external side effects on bookings INSERT (webhook) would fire
-- inside this transaction; pg_net requests are queued transactionally and are rolled back too.
-- Uses existing accounts only (no user is created). Simulates API callers with SET LOCAL ROLE + request.jwt.claims.

create or replace function pg_temp.try_as(p_role text, p_sub uuid, p_sql text)
returns text
language plpgsql
as $$
declare
  n bigint;
begin
  perform set_config('request.jwt.claims',
    case when p_sub is null then json_build_object('role', p_role)::text
         else json_build_object('role', p_role, 'sub', p_sub)::text end, true);
  execute format('set local role %I', p_role);
  if p_sql ilike 'select%' then
    execute p_sql into n;
  else
    execute p_sql;
    get diagnostics n = row_count;
  end if;
  reset role;
  return 'ok:' || coalesce(n::text, 'null');
exception when others then
  reset role;   -- the failed sub-transaction is rolled back, including its SET LOCAL
  return 'err:' || sqlstate;
end;
$$;

do $$
declare
  admin_id uuid;
  user_id  uuid;
  total_bookings bigint;
  total_profiles bigint;
  total_vehicles bigint;
  failures int := 0;
  r text;
  ok boolean;
  -- Booking payload identical in shape to /quelvo/book/ confirm4().
  bk_cols text := '(booking_code, user_id, service_type, vehicle_class, pickup_address, pickup_at, passengers,
                    client_name, client_email, client_phone, base_price, pricing_type, requires_quote, status)';
begin
  select id into admin_id from public.profiles where role = 'admin' order by id limit 1;
  select id into user_id  from public.profiles where role = 'user'  order by id limit 1;
  if admin_id is null or user_id is null then
    raise exception 'VERIFY ABORTED: needs one admin and one user profile (admin %, user %)', admin_id, user_id;
  end if;
  select count(*) into total_bookings from public.bookings;
  select count(*) into total_profiles from public.profiles;
  select count(*) into total_vehicles from public.vehicles;

  -- Maintenance trigger (docs/sql/quelvo-maintenance.sql) would hide the RLS result of insert tests:
  -- reopen inside THIS transaction only (rolled back at the end; other sessions never see it).
  if to_regclass('public.jcdm_maintenance_flags') is not null then
    update public.jcdm_maintenance_flags set maintenance = false where key = 'quelvo';
    raise notice 'maintenance flag reopened inside this transaction only (rolled back at the end)';
  end if;

  -- profiles
  r := pg_temp.try_as('authenticated', user_id, format('update public.profiles set role = %L where id = %L', 'admin', user_id));
  ok := r like 'err:%'; raise notice '[%] user cannot make itself admin (%)', case when ok then 'PASS' else 'FAIL' end, r; failures := failures + (not ok)::int;

  r := pg_temp.try_as('authenticated', user_id, format('update public.profiles set full_name = full_name, phone = phone where id = %L', user_id));
  ok := r = 'ok:1'; raise notice '[%] user can edit own name/phone (%)', case when ok then 'PASS' else 'FAIL' end, r; failures := failures + (not ok)::int;

  r := pg_temp.try_as('authenticated', user_id, format('update public.profiles set full_name = full_name where id = %L', admin_id));
  ok := r = 'ok:0'; raise notice '[%] user cannot edit another profile (%)', case when ok then 'PASS' else 'FAIL' end, r; failures := failures + (not ok)::int;

  r := pg_temp.try_as('authenticated', user_id, 'select count(*) from public.profiles');
  ok := r = 'ok:1'; raise notice '[%] user sees only its own profile (%)', case when ok then 'PASS' else 'FAIL' end, r; failures := failures + (not ok)::int;

  r := pg_temp.try_as('anon', null, 'select count(*) from public.profiles');
  ok := r like 'err:%' or r = 'ok:0'; raise notice '[%] anon cannot read profiles (%)', case when ok then 'PASS' else 'FAIL' end, r; failures := failures + (not ok)::int;

  r := pg_temp.try_as('authenticated', admin_id, 'select count(*) from public.profiles');
  ok := r = 'ok:' || total_profiles; raise notice '[%] admin reads all profiles (%)', case when ok then 'PASS' else 'FAIL' end, r; failures := failures + (not ok)::int;

  -- bookings: reading
  r := pg_temp.try_as('anon', null, 'select count(*) from public.bookings');
  ok := r like 'err:%' or r = 'ok:0'; raise notice '[%] anon cannot read bookings (%)', case when ok then 'PASS' else 'FAIL' end, r; failures := failures + (not ok)::int;

  r := pg_temp.try_as('authenticated', user_id, format('select count(*) from public.bookings where user_id is distinct from %L', user_id));
  ok := r = 'ok:0'; raise notice '[%] user cannot read other customers'' bookings (%)', case when ok then 'PASS' else 'FAIL' end, r; failures := failures + (not ok)::int;

  r := pg_temp.try_as('authenticated', admin_id, 'select count(*) from public.bookings');
  ok := r = 'ok:' || total_bookings; raise notice '[%] admin reads all bookings (%)', case when ok then 'PASS' else 'FAIL' end, r; failures := failures + (not ok)::int;

  -- bookings: creating
  r := pg_temp.try_as('anon', null, 'insert into public.bookings ' || bk_cols ||
       ' values (''QLV-VERIFY01'', null, ''transfer'', ''private'', ''Test'', now() + interval ''30 days'', 1, ''Verify'', ''verify@example.invalid'', ''0'', 75, ''auto_transfer'', false, ''pending'')');
  ok := r = 'ok:1'; raise notice '[%] anon can submit a normal booking request (%)', case when ok then 'PASS' else 'FAIL' end, r; failures := failures + (not ok)::int;

  r := pg_temp.try_as('anon', null, 'insert into public.bookings ' || bk_cols ||
       ' values (''QLV-VERIFY02'', null, ''transfer'', ''private'', ''Test'', now() + interval ''30 days'', 1, ''Verify'', ''verify@example.invalid'', ''0'', 75, ''auto_transfer'', false, ''confirmed'')');
  ok := r like 'err:%'; raise notice '[%] anon cannot create a confirmed booking (%)', case when ok then 'PASS' else 'FAIL' end, r; failures := failures + (not ok)::int;

  r := pg_temp.try_as('anon', null, 'insert into public.bookings (booking_code, status, requires_quote, admin_price) values (''QLV-VERIFY03'', ''pending'', false, 1)');
  ok := r like 'err:%'; raise notice '[%] anon cannot set admin_price (%)', case when ok then 'PASS' else 'FAIL' end, r; failures := failures + (not ok)::int;

  r := pg_temp.try_as('anon', null, format('insert into public.bookings (booking_code, status, requires_quote, user_id) values (%L, %L, false, %L)', 'QLV-VERIFY04', 'pending', user_id));
  ok := r like 'err:%'; raise notice '[%] anon cannot book on behalf of a user (%)', case when ok then 'PASS' else 'FAIL' end, r; failures := failures + (not ok)::int;

  r := pg_temp.try_as('authenticated', user_id, format('insert into public.bookings (booking_code, status, requires_quote, user_id) values (%L, %L, false, %L)', 'QLV-VERIFY05', 'pending', admin_id));
  ok := r like 'err:%'; raise notice '[%] user cannot book on behalf of another user (%)', case when ok then 'PASS' else 'FAIL' end, r; failures := failures + (not ok)::int;

  -- bookings: updating
  r := pg_temp.try_as('authenticated', user_id, 'update public.bookings set status = ''confirmed''');
  ok := r = 'ok:0' or r like 'err:%'; raise notice '[%] user cannot change booking status (%)', case when ok then 'PASS' else 'FAIL' end, r; failures := failures + (not ok)::int;

  r := pg_temp.try_as('authenticated', admin_id, 'update public.bookings set status = status, admin_notes = admin_notes');
  ok := r = 'ok:' || (total_bookings + 1);   -- +1: the QLV-VERIFY01 row inserted above (rolled back at the end)
  raise notice '[%] admin can update bookings (%)', case when ok then 'PASS' else 'FAIL' end, r; failures := failures + (not ok)::int;

  -- vehicles / drivers
  r := pg_temp.try_as('anon', null, 'select count(*) from public.vehicles');
  ok := r like 'err:%' or r = 'ok:0'; raise notice '[%] anon cannot read vehicles (%)', case when ok then 'PASS' else 'FAIL' end, r; failures := failures + (not ok)::int;

  r := pg_temp.try_as('authenticated', user_id, 'select count(*) from public.drivers');
  ok := r = 'ok:0'; raise notice '[%] user cannot read drivers (%)', case when ok then 'PASS' else 'FAIL' end, r; failures := failures + (not ok)::int;

  r := pg_temp.try_as('authenticated', admin_id, 'select count(*) from public.vehicles');
  ok := r = 'ok:' || total_vehicles; raise notice '[%] admin reads vehicles (%)', case when ok then 'PASS' else 'FAIL' end, r; failures := failures + (not ok)::int;

  raise exception 'VERIFY FINISHED (everything rolled back) — % failure(s)', failures;
end
$$;
