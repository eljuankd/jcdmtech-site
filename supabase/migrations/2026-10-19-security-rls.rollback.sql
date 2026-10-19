-- supabase/migrations/2026-10-19-security-rls.rollback.sql
-- Reverts 2026-10-19-security-rls.sql using the snapshot it saved in public.jcdm_security_backup_20261019.
-- WARNING: this RE-OPENS the vulnerabilities fixed by the migration (J-01: self-assigned admin role).
-- Use only if the migration breaks the site and a forward fix is not possible; owner authorization required.
-- Data is never touched. The backup table is kept (drop it manually afterwards if desired).

begin;

do $$
begin
  if to_regclass('public.jcdm_security_backup_20261019') is null then
    raise exception 'rollback: backup table not found — the migration was never applied. Nothing was changed.';
  end if;
end
$$;

-- 1. Remove the migration's policies (all current policies on the 4 tables) and its guard trigger.
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
drop trigger if exists profiles_guard_role on public.profiles;
drop function if exists public.profiles_guard_role();

-- 2. Restore the saved policies exactly as they were.
do $$
declare
  r record;
  roles text;
begin
  for r in select detail as d from public.jcdm_security_backup_20261019 where kind = 'policy' order by id
  loop
    select string_agg(case when x = 'public' then 'public' else quote_ident(x) end, ', ')
      into roles from jsonb_array_elements_text(r.d -> 'roles') as x;
    execute format('create policy %I on public.%I as %s for %s to %s %s %s',
      r.d ->> 'policyname', r.d ->> 'tablename', r.d ->> 'permissive', r.d ->> 'cmd', roles,
      case when r.d ->> 'qual' is not null then 'using (' || (r.d ->> 'qual') || ')' else '' end,
      case when r.d ->> 'with_check' is not null then 'with check (' || (r.d ->> 'with_check') || ')' else '' end);
  end loop;
end
$$;

-- 3. Restore the saved privileges of anon/authenticated.
revoke all on table public.profiles, public.bookings, public.vehicles, public.drivers from anon, authenticated;
do $$
declare
  r record;
begin
  for r in select table_name, detail as d from public.jcdm_security_backup_20261019 where kind = 'table_grant' order by id
  loop
    execute format('grant %s on public.%I to %I', r.d ->> 'privilege_type', r.table_name, r.d ->> 'grantee');
  end loop;
  for r in select table_name, detail as d from public.jcdm_security_backup_20261019 where kind = 'column_grant' order by id
  loop
    execute format('grant %s (%I) on public.%I to %I',
      r.d ->> 'privilege_type', r.d ->> 'column_name', r.table_name, r.d ->> 'grantee');
  end loop;
end
$$;

-- 4. Restore the RLS flags.
do $$
declare
  r record;
begin
  for r in select table_name, detail as d from public.jcdm_security_backup_20261019 where kind = 'rls' order by id
  loop
    execute format('alter table public.%I %s row level security', r.table_name,
      case when (r.d ->> 'enabled')::boolean then 'enable' else 'disable' end);
    execute format('alter table public.%I %s row level security', r.table_name,
      case when (r.d ->> 'forced')::boolean then 'force' else 'no force' end);
  end loop;
end
$$;

-- 5. Helper no longer referenced by any policy.
drop function if exists public.is_admin();

commit;
