-- docs/sql/quelvo-maintenance.test.sql — DRY RUN of docs/sql/quelvo-maintenance.sql
--
-- SAFE BY CONSTRUCTION:
--   * One single DO block = one transaction. It ALWAYS ends by raising an error on purpose, so every change
--     (table, function, flag updates) is rolled back, even if the SQL editor auto-commits.
--   * It never touches public.bookings: the guard function is attached to a TEMP table (pg_temp.quelvo_probe).
--   * It does not change roles; it only simulates API callers by setting request.jwt.claims (transaction-local).
--
-- Expected output: an error whose message starts with "DRY RUN FINISHED (everything rolled back) — 0 failure(s)"
-- followed by one line per case. Any other error = a dependency is missing → do NOT install.
-- If section 1 is changed in quelvo-maintenance.sql, update the copy below (the local check compares them).
do $test$
declare
  installed boolean := to_regclass('public.jcdm_maintenance_flags') is not null;
  admin_id  uuid;
  outcome   text;
  expected  text;
  report    text := '';
  failures  int  := 0;
  c         record;
begin
  -- ── Dependencies ──
  if to_regclass('public.bookings') is null then raise exception 'DEPENDENCY MISSING: public.bookings'; end if;
  if to_regclass('public.profiles') is null then raise exception 'DEPENDENCY MISSING: public.profiles'; end if;
  if not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'profiles' and column_name = 'role') then
    raise exception 'DEPENDENCY MISSING: public.profiles.role';
  end if;
  if to_regprocedure('auth.uid()') is null then raise exception 'DEPENDENCY MISSING: auth.uid()'; end if;
  report := report || E'\n  installed for real already: ' || installed;

  -- ── Install (copy of section 1; rolled back at the end) ──
  if not installed then
    execute $ddl$
      create table public.jcdm_maintenance_flags (
        key         text primary key,
        maintenance boolean not null,
        updated_at  timestamptz not null default now()
      )
    $ddl$;
    execute $ddl$ insert into public.jcdm_maintenance_flags (key, maintenance) values ('quelvo', true) $ddl$;
    execute $ddl$
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
$$
    $ddl$;
  end if;

  -- ── Probe table instead of bookings ──
  create temp table quelvo_probe (id int);
  create trigger quelvo_probe_guard before insert on pg_temp.quelvo_probe
    for each row execute function public.quelvo_bookings_guard();

  select p.id into admin_id from public.profiles p where p.role = 'admin' limit 1;

  for c in
    select * from (values
      (1, 'suspended + anon (public web/API)',     true,  '{"role":"anon"}',                                                         'blocked'),
      (2, 'suspended + logged-in user, not admin', true,  '{"role":"authenticated","sub":"00000000-0000-0000-0000-000000000001"}',  'blocked'),
      (3, 'suspended + admin',                     true,  case when admin_id is null then null
                                                               else json_build_object('role','authenticated','sub',admin_id)::text end, 'allowed'),
      (4, 'suspended + service_role',              true,  '{"role":"service_role"}',                                                 'allowed'),
      (5, 'suspended + direct SQL (no JWT)',       true,  '',                                                                        'allowed'),
      (6, 'available + anon',                      false, '{"role":"anon"}',                                                         'allowed'),
      (7, 'flag row missing + anon',               null,  '{"role":"anon"}',                                                         'allowed')
    ) as t(n, name, flag, claims, expected)
    order by n
  loop
    if c.n = 3 and admin_id is null then
      report := report || E'\n  [SKIP] 3 ' || c.name || ' (no profile with role=admin)';
      continue;
    end if;

    if c.flag is null then
      delete from public.jcdm_maintenance_flags where key = 'quelvo';
    else
      insert into public.jcdm_maintenance_flags (key, maintenance) values ('quelvo', c.flag)
      on conflict (key) do update set maintenance = excluded.maintenance;
    end if;
    perform set_config('request.jwt.claims', c.claims, true);

    begin
      insert into pg_temp.quelvo_probe values (c.n);
      outcome := 'allowed';
    exception when sqlstate 'P0001' then
      outcome := 'blocked';
    end;

    if outcome = c.expected then
      report := report || E'\n  [PASS] ' || c.n || ' ' || c.name || ' → ' || outcome;
    else
      failures := failures + 1;
      report := report || E'\n  [FAIL] ' || c.n || ' ' || c.name || ' → ' || outcome || ' (expected ' || c.expected || ')';
    end if;
  end loop;

  report := report || E'\n  real trigger on bookings present: ' ||
    exists (select 1 from pg_trigger where tgrelid = 'public.bookings'::regclass and tgname = 'quelvo_bookings_maintenance');

  raise exception 'DRY RUN FINISHED (everything rolled back) — % failure(s)%', failures, report;
end
$test$;
