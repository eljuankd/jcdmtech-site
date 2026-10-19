// Isolated test of supabase/migrations/2026-10-19-security-rls*.sql on PGlite (Postgres in WebAssembly,
// in-process: no ports, no network, no real database). docs/SECURITY_REMEDIATION.md §4.
//
// Usage: JCDM_TOOLS=<folder whose node_modules has @electric-sql/pglite@0.5.8> node scripts/tests/security-rls.pglite.mjs
// The repo itself has no package.json; install PGlite outside it (e.g. in a scratch folder).
//
// Limitation: PGlite is not Supabase (no PostgREST, no GoTrue). API callers are simulated the way
// PostgREST does it: SET LOCAL ROLE anon|authenticated + request.jwt.claims.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL, fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
if (!process.env.JCDM_TOOLS) throw new Error("Set JCDM_TOOLS (see header)");
const req = createRequire(path.join(process.env.JCDM_TOOLS, "package.json"));
const { PGlite } = await import(pathToFileURL(req.resolve("@electric-sql/pglite")).href);

const MIG = "supabase/migrations/2026-10-19-security-rls";
const migration = read(`${MIG}.sql`);
const preflight = read(`${MIG}.preflight.sql`);
const rollback = read(`${MIG}.rollback.sql`);
const verify = read(`${MIG}.verify.sql`);
const legacy = read("supabase/legacy/supabase-setup.sql");
const maint = read("docs/sql/quelvo-maintenance.sql");
const maintInstall = maint.slice(maint.indexOf("-- ───────────────────────── 1. Install"), maint.indexOf("-- ───────────────────────── 2. Toggle"));

const db = new PGlite();
let fails = 0, passes = 0;
const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); c ? passes++ : fails++; };
const q = async (s, p) => (await db.query(s, p)).rows;
const tryExec = async (s) => { try { await db.exec(s); return "ok"; } catch (e) { try { await db.exec("rollback"); } catch {} return "ERR: " + e.message; } };

const A = "aaaaaaaa-0000-0000-0000-000000000001";   // admin
const U1 = "bbbbbbbb-0000-0000-0000-000000000001";  // user with bookings
const U2 = "bbbbbbbb-0000-0000-0000-000000000002";  // another user
const U3 = "bbbbbbbb-0000-0000-0000-000000000003";  // user whose profile row is missing (sign-up race)

// Run one statement as an API caller. Returns { ok, rows, count, err }.
async function as(role, sub, sql) {
  const claims = JSON.stringify(sub ? { role, sub } : { role });
  await db.exec("begin");
  try {
    await db.query("select set_config('request.jwt.claims', $1, true)", [claims]);
    await db.exec(`set local role ${role}`);
    const res = await db.query(sql);
    await db.exec("commit");
    return { ok: true, rows: res.rows, count: res.fields.length ? res.rows.length : res.affectedRows };
  } catch (e) {
    await db.exec("rollback");
    return { ok: false, err: e.message };
  }
}
const desc = (r) => (r.ok ? `ok rows=${r.count}` : `denied: ${r.err.slice(0, 90)}`);

// ── Supabase-like stub ───────────────────────────────────────────────────────────────────────────────
await db.exec(`
  create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
  create schema auth; create schema storage;
  grant usage on schema public, auth to anon, authenticated, service_role;
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub', '')::uuid $$;
  create table auth.users (id uuid primary key, email text, created_at timestamptz default now(),
                           last_sign_in_at timestamptz, email_confirmed_at timestamptz);
  create table storage.buckets (id text primary key, name text, public boolean);
`);
// The legacy setup script exactly as it was published (profiles, vehicles, drivers, policies, sign-up trigger).
await db.exec(legacy);
await db.exec(`
  alter table public.vehicles add column capacity int;
  alter table public.drivers add column hourly_rate numeric, add column min_transfer_price numeric;
  create table public.bookings (
    id uuid primary key default gen_random_uuid(), booking_code text, user_id uuid references auth.users(id),
    service_type text, vehicle_class text, pickup_address text, dropoff_address text,
    pickup_lat double precision, pickup_lng double precision, dropoff_lat double precision, dropoff_lng double precision,
    pickup_at timestamptz, requested_hours numeric, estimated_minutes int, estimated_miles numeric, passengers int,
    client_name text, client_email text, client_phone text, flight_number text, special_requests text,
    base_price numeric, pricing_type text, requires_quote boolean, status text not null default 'pending',
    driver_id bigint references public.drivers(id), admin_price numeric, admin_notes text, created_at timestamptz default now());
  alter table public.bookings enable row level security;
  -- Simulated unknown remote policies (the real ones are not versioned): permissive ones must be removed.
  create policy legacy_bookings_insert on public.bookings for insert to anon, authenticated with check (true);
  create policy legacy_bookings_read_all on public.bookings for select to anon, authenticated using (true);
  -- Supabase default privileges for the API roles.
  grant all on all tables in schema public to anon, authenticated, service_role;
  grant all on all sequences in schema public to anon, authenticated, service_role;
  insert into auth.users (id, email) values ('${A}','admin@example.invalid'),('${U1}','u1@example.invalid'),
                                            ('${U2}','u2@example.invalid'),('${U3}','u3@example.invalid');
  update public.profiles set role = 'admin' where id = '${A}';
  delete from public.profiles where id = '${U3}';
  insert into public.drivers (name) values ('Driver One');
  insert into public.vehicles (make, model) values ('Cadillac', 'Escalade');
  insert into public.bookings (booking_code, user_id, status, base_price, requires_quote) values
    ('HIST-0001', '${U1}', 'completed', 120, false), ('HIST-0002', '${U2}', 'confirmed', 75, false),
    ('HIST-0003', null, 'pending_quote', null, true), ('ADMIN-UPD', null, 'pending', 90, false);
`);
const policiesOf = async () => JSON.stringify(await q(`select tablename, policyname, permissive, roles::text, cmd, qual, with_check
  from pg_policies where schemaname='public' and tablename in ('profiles','bookings','vehicles','drivers') order by 1,2`));
const grantsOf = async () => JSON.stringify(await q(`select table_name, grantee, privilege_type from information_schema.role_table_grants
  where table_schema='public' and table_name in ('profiles','bookings','vehicles','drivers') and grantee in ('anon','authenticated') order by 1,2,3`));
const colGrantsOf = async () => JSON.stringify(await q(`select table_name, grantee, privilege_type, column_name from information_schema.column_privileges
  where table_schema='public' and table_name in ('profiles','bookings','vehicles','drivers') and grantee in ('anon','authenticated') order by 1,2,3,4`));
const dataOf = async () => JSON.stringify(await q(`select 'p' t, id::text, role as a, coalesce(full_name,'') b from public.profiles
  union all select 'b', booking_code, status, coalesce(admin_price::text,'') from public.bookings
  union all select 'v', id::text, make, model from public.vehicles union all select 'd', id::text, name, '' from public.drivers order by 1,2`));

// ── 1. The legacy policies really allow J-01 (evidence for the audit) ───────────────────────────────
console.log("\n# Legacy setup script (before the migration)");
// a) The file literally as published: its recursive admin policy (R-08) makes EVERY authenticated read of
//    profiles fail — including the read inside an UPDATE — so the live site could not have worked with it.
//    ⇒ the real database differs from this file.
let r = await as("authenticated", A, "select count(*)::int n from public.profiles");
ok(!r.ok && /infinite recursion/.test(r.err), `R-08 reproduced: legacy admin policy on profiles is recursive (${desc(r)})`);
const legacyEscalation = await as("authenticated", U1, `update public.profiles set role = 'admin' where id = '${U1}'`);
ok(!legacyEscalation.ok && /infinite recursion/.test(legacyEscalation.err), `literal legacy file: the recursion also masks J-01 (${desc(legacyEscalation)})`);
// b) The usual way that recursion gets "fixed" (dropping the admin policy): then J-01 is exploitable.
const adminPolicySql = legacy.slice(legacy.indexOf('CREATE POLICY "admin_read_all_profiles"'), legacy.indexOf(";", legacy.indexOf('CREATE POLICY "admin_read_all_profiles"')) + 1);
await db.exec('drop policy "admin_read_all_profiles" on public.profiles');
r = await as("authenticated", U1, `update public.profiles set role = 'admin' where id = '${U1}'`);
ok(r.ok && r.count === 1, `J-01 reproduced once the recursive policy is dropped: a user makes itself admin (${desc(r)})`);
r = await as("authenticated", U1, "select count(*)::int n from public.vehicles");
ok(r.ok, `…and then passes the admin policies of vehicles/drivers (${desc(r)})`);
await db.exec(`update public.profiles set role = 'user' where id = '${U1}'`);
await db.exec(adminPolicySql);   // back to the literal legacy state for the rest of the run

// ── 2. Preflight is read-only and runs ─────────────────────────────────────────────────────────────
console.log("\n# Preflight");
const before = { pol: await policiesOf(), gr: await grantsOf(), col: await colGrantsOf(), data: await dataOf() };
const pf = await db.exec(preflight).then((x) => x, (e) => e);
ok(Array.isArray(pf), "preflight runs end to end" + (Array.isArray(pf) ? "" : ": " + pf.message));
if (Array.isArray(pf)) {
  ok(pf[0].rows.every((x) => x.status === "ok"), `preflight A: all ${pf[0].rows.length} required columns present`);
  ok(pf[1].rows.every((x) => x.status === "free"), "preflight B: names free");
  ok(pf[6].rows.length === 1 && pf[6].rows[0].email === "admin@example.invalid", "preflight G lists the admin accounts");
}
ok((await dataOf()) === before.data && (await policiesOf()) === before.pol, "preflight changed nothing");

// ── 3. Migration ───────────────────────────────────────────────────────────────────────────────────
console.log("\n# Migration");
r = await tryExec(migration);
ok(r === "ok", "migration applies: " + r);
ok((await dataOf()) === before.data, "migration did not change any row (profiles, bookings, vehicles, drivers)");
const backupRows = await q("select kind, count(*)::int n from public.jcdm_security_backup_20261019 group by 1 order by 1");
ok(backupRows.find((x) => x.kind === "policy")?.n === JSON.parse(before.pol).length, `backup holds every previous policy: ${JSON.stringify(backupRows)}`);
const polAfter = JSON.parse(await policiesOf()).map((p) => p.policyname);
ok(!polAfter.some((n) => n.startsWith("legacy_") || n === "admin_read_all_profiles" || n.startsWith("users_own_")), `old policies removed; now: ${polAfter.join(", ")}`);
r = await tryExec(migration);
ok(r.startsWith("ERR") && /already exists/.test(r), "second run fails loudly and changes nothing: " + r.slice(0, 80));
ok((await dataOf()) === before.data, "data still identical after the failed second run");
const brokenSchema = await tryExec(migration.replace("('bookings','admin_notes'),", "('bookings','admin_notes'),('bookings','no_such_column'),"));
ok(brokenSchema.startsWith("ERR") && /expected columns not found: bookings.no_such_column/.test(brokenSchema), "unexpected schema stops the migration before any change");

// ── 4. profiles ────────────────────────────────────────────────────────────────────────────────────
console.log("\n# profiles");
r = await as("authenticated", U1, `update public.profiles set role = 'admin' where id = '${U1}'`);
ok(!r.ok, `user cannot make itself admin (${desc(r)})`);
r = await as("authenticated", U1, `update public.profiles set id = '${U2}' where id = '${U1}'`);
ok(!r.ok, `user cannot change its id (${desc(r)})`);
r = await as("authenticated", U1, `update public.profiles set full_name = 'Ana', phone = '305' where id = '${U1}'`);
ok(r.ok && r.count === 1, `user edits own name/phone (${desc(r)})`);
r = await as("authenticated", U1, `update public.profiles set theme = 'light', lang = 'es' where id = '${U1}'`);
ok(r.ok && r.count === 1, `app.js theme/lang sync works (${desc(r)})`);
r = await as("authenticated", U1, `insert into public.profiles (id, full_name, phone) values ('${U1}', 'Ana B', '786')
  on conflict (id) do update set id = excluded.id, full_name = excluded.full_name, phone = excluded.phone`);
ok(r.ok && r.count === 1, `account.html upsert (PostgREST style) works (${desc(r)})`);
r = await as("authenticated", U1, `update public.profiles set full_name = 'x' where id = '${U2}'`);
ok(r.ok && r.count === 0, `user cannot edit another profile (${desc(r)})`);
r = await as("authenticated", U1, "select id from public.profiles");
ok(r.ok && r.rows.length === 1, `user reads only its own profile (${desc(r)})`);
r = await as("anon", null, "select id from public.profiles");
ok(!r.ok, `anon cannot read profiles (${desc(r)})`);
r = await as("authenticated", A, "select id from public.profiles");
ok(r.ok && r.rows.length === 3, `admin reads all profiles, no recursion (${desc(r)})`);
r = await as("authenticated", U3, `insert into public.profiles (id, role) values ('${U3}', 'admin')`);
ok(!r.ok, `new user cannot create its profile as admin (${desc(r)})`);
r = await as("authenticated", U3, `insert into public.profiles (id, role) values ('${U2}', 'user') on conflict do nothing`);
ok(!r.ok || r.count === 0, `user cannot create a profile for someone else (${desc(r)})`);
r = await as("authenticated", U3, `insert into public.profiles (id, role) values ('${U3}', 'user') on conflict (id) do nothing`);
ok(r.ok && r.count === 1, `login.html sign-up upsert {id, role:'user'} still works (${desc(r)})`);
r = await as("authenticated", A, `update public.profiles set role = 'admin' where id = '${U2}'`);
ok(!r.ok, `role changes are not possible through the API, even for admins (${desc(r)})`);
r = await tryExec(`update public.profiles set role = 'admin' where id = '${U2}'; update public.profiles set role = 'user' where id = '${U2}';`);
ok(r === "ok", "SQL editor (owner) can still assign roles: " + r);
r = await tryExec(`insert into auth.users (id, email) values ('cccccccc-0000-0000-0000-000000000001', 'new@example.invalid')`);
const np = await q(`select role from public.profiles where id = 'cccccccc-0000-0000-0000-000000000001'`);
ok(r === "ok" && np[0]?.role === "user", "sign-up trigger (handle_new_user) still creates role 'user'");
r = await as("authenticated", U1, "select public.is_admin() as a");
ok(r.ok && r.rows[0].a === false, "is_admin() is false for a user");
r = await as("authenticated", A, "select public.is_admin() as a");
ok(r.ok && r.rows[0].a === true, "is_admin() is true for the admin");
r = await as("anon", null, "select public.is_admin() as a");
ok(!r.ok, `anon cannot call is_admin() (${desc(r)})`);
r = await as("authenticated", A, "select * from public.jcdm_security_backup_20261019");
ok(!r.ok, `backup table not reachable through the API (${desc(r)})`);

// ── 5. bookings ────────────────────────────────────────────────────────────────────────────────────
console.log("\n# bookings");
const wizard = (over = {}) => {
  const b = { booking_code: "QLV-TEST0001", user_id: null, service_type: "transfer", vehicle_class: "private",
    pickup_address: "MIA", dropoff_address: "Brickell", pickup_lat: 25.79, pickup_lng: -80.29, dropoff_lat: 25.76,
    dropoff_lng: -80.19, pickup_at: "2026-12-01T15:00:00Z", requested_hours: null, estimated_minutes: 25,
    estimated_miles: 9.1, passengers: 2, client_name: "Test", client_email: "t@example.invalid", client_phone: "1",
    flight_number: null, special_requests: null, base_price: 75, pricing_type: "auto_transfer",
    requires_quote: false, status: "pending", ...over };
  const cols = Object.keys(b);
  const lit = (v) => (v === null ? "null" : typeof v === "string" ? `'${v.replace(/'/g, "''")}'` : String(v));
  return `insert into public.bookings (${cols.join(", ")}) values (${cols.map((c) => lit(b[c])).join(", ")})`;
};
r = await as("anon", null, wizard());
ok(r.ok && r.count === 1, `anon: /quelvo/book/ transfer booking accepted (${desc(r)})`);
r = await as("anon", null, wizard({ booking_code: "QLV-TEST0002", service_type: "quote", status: "pending_quote", requires_quote: true, base_price: null, pricing_type: "manual_quote" }));
ok(r.ok && r.count === 1, `anon: quote request accepted (${desc(r)})`);
r = await as("authenticated", U1, wizard({ booking_code: "QLV-TEST0003", user_id: U1 }));
ok(r.ok && r.count === 1, `signed-in user books with own user_id (${desc(r)})`);
for (const [label, over] of [
  ["status 'confirmed'", { status: "confirmed" }], ["status 'completed'", { status: "completed" }],
  ["pending_quote without requires_quote", { status: "pending_quote" }], ["requires_quote with status pending", { requires_quote: true }],
  ["negative price", { base_price: -5 }], ["another user's user_id (anon)", { user_id: U2 }]]) {
  r = await as("anon", null, wizard({ booking_code: "QLV-BAD", ...over }));
  ok(!r.ok, `anon cannot insert ${label} (${desc(r)})`);
}
r = await as("authenticated", U1, wizard({ booking_code: "QLV-BAD", user_id: U2 }));
ok(!r.ok, `user cannot book on behalf of another user (${desc(r)})`);
for (const col of ["admin_price", "admin_notes", "driver_id", "id", "created_at"]) {
  const val = col === "admin_notes" ? "'x'" : col === "id" ? "gen_random_uuid()" : col === "created_at" ? "now()" : "1";
  r = await as("anon", null, `insert into public.bookings (booking_code, status, requires_quote, ${col}) values ('QLV-BAD', 'pending', false, ${val})`);
  ok(!r.ok, `anon cannot set ${col} (${desc(r)})`);
}
r = await as("anon", null, "select count(*) from public.bookings");
ok(!r.ok, `anon cannot read bookings (${desc(r)})`);
r = await as("authenticated", U1, "select booking_code from public.bookings order by 1");
ok(r.ok && JSON.stringify(r.rows.map((x) => x.booking_code)) === '["HIST-0001","QLV-TEST0003"]', `user reads only its own bookings: ${JSON.stringify(r.rows?.map((x) => x.booking_code))}`);
r = await as("authenticated", U2, "select booking_code from public.bookings where user_id is distinct from auth.uid()");
ok(r.ok && r.rows.length === 0, `user cannot read other customers' bookings (${desc(r)})`);
r = await as("authenticated", U1, `update public.bookings set status = 'confirmed', admin_price = 1 where user_id = '${U1}'`);
ok(r.ok ? r.count === 0 : true, `user cannot confirm/price its own booking (${desc(r)})`);
r = await as("authenticated", U1, `delete from public.bookings where user_id = '${U1}'`);
ok(!r.ok, `user cannot delete bookings (${desc(r)})`);
const total = (await q("select count(*)::int n from public.bookings"))[0].n;
r = await as("authenticated", A, "select b.*, d.id as d_id, d.name as d_name, d.phone as d_phone from public.bookings b left join public.drivers d on d.id = b.driver_id order by b.created_at desc");
ok(r.ok && r.rows.length === total, `admin lists all bookings with driver join (${r.rows?.length}/${total})`);
r = await as("authenticated", A, `update public.bookings set status = 'confirmed', driver_id = 1, admin_price = 95.5, admin_notes = 'VIP' where booking_code = 'ADMIN-UPD'`);
ok(r.ok && r.count === 1, `admin saves status/driver/final price/notes (${desc(r)})`);
r = await as("authenticated", A, `update public.bookings set base_price = 1 where booking_code = 'ADMIN-UPD'`);
ok(!r.ok, `base_price (customer estimate) is not editable through the API (${desc(r)})`);

// ── 6. vehicles / drivers ──────────────────────────────────────────────────────────────────────────
console.log("\n# vehicles / drivers");
r = await as("anon", null, "select * from public.vehicles");
ok(!r.ok, `anon cannot read vehicles (${desc(r)})`);
r = await as("authenticated", U1, "select * from public.drivers");
ok(r.ok && r.rows.length === 0, `user cannot read drivers (${desc(r)})`);
r = await as("authenticated", U1, "insert into public.vehicles (make, model) values ('x','y')");
ok(!r.ok, `user cannot add vehicles (${desc(r)})`);
r = await as("authenticated", A, "insert into public.vehicles (make, model, capacity) values ('Lincoln','Navigator',6) returning id");
ok(r.ok && r.rows.length === 1, `admin adds a vehicle (${desc(r)})`);
const vid = r.rows?.[0]?.id;
r = await as("authenticated", A, `update public.vehicles set color = 'Black' where id = ${vid}`);
ok(r.ok && r.count === 1, `admin edits a vehicle (${desc(r)})`);
r = await as("authenticated", A, `delete from public.vehicles where id = ${vid}`);
ok(r.ok && r.count === 1, `admin deletes a vehicle (${desc(r)})`);
r = await as("authenticated", A, "insert into public.drivers (name, hourly_rate, min_transfer_price) values ('D2', 75, 50) returning id");
ok(r.ok && r.rows.length === 1, `admin adds a driver (${desc(r)})`);
r = await as("authenticated", A, `update public.drivers set phone = '1' where id = ${r.rows?.[0]?.id}`);
ok(r.ok && r.count === 1, `admin edits a driver (${desc(r)})`);

// ── 7. Coexistence with the QUELVO maintenance trigger ─────────────────────────────────────────────
console.log("\n# QUELVO maintenance trigger (docs/sql/quelvo-maintenance.sql)");
r = await tryExec(maintInstall);
ok(r === "ok", "maintenance SQL installs on top of the migration: " + r);
r = await as("anon", null, wizard({ booking_code: "QLV-MAINT1" }));
ok(!r.ok && /temporarily unavailable/.test(r.err), `maintenance on: anon booking blocked (${desc(r)})`);
r = await as("authenticated", A, wizard({ booking_code: "QLV-MAINT2" }));
ok(r.ok, `maintenance on: admin can still register a booking (${desc(r)})`);
await db.exec("update public.jcdm_maintenance_flags set maintenance = false where key = 'quelvo'");
r = await as("anon", null, wizard({ booking_code: "QLV-MAINT3" }));
ok(r.ok, `maintenance off: anon booking accepted again (${desc(r)})`);
await db.exec("update public.jcdm_maintenance_flags set maintenance = true where key = 'quelvo'");

// ── 8. verify.sql on the migrated database (must roll itself back) ─────────────────────────────────
console.log("\n# verify.sql");
const snapV = await dataOf();
const vr = await db.exec(verify).then(() => "no error", (e) => e.message);
ok(/VERIFY FINISHED \(everything rolled back\) — 0 failure\(s\)/.test(vr), "verify.sql: " + vr);
await db.exec("rollback").catch(() => {});
ok((await dataOf()) === snapV, "verify.sql left the data untouched");
ok((await q("select maintenance from public.jcdm_maintenance_flags where key='quelvo'"))[0].maintenance === true, "verify.sql did not change the real maintenance flag");

// ── 9. Rollback ────────────────────────────────────────────────────────────────────────────────────
console.log("\n# rollback.sql");
const snapR = await dataOf();
r = await tryExec(rollback);
ok(r === "ok", "rollback applies: " + r);
ok((await policiesOf()) === before.pol, "policies identical to before the migration");
ok((await grantsOf()) === before.gr, "table privileges identical to before the migration");
ok((await colGrantsOf()) === before.col, "column privileges identical to before the migration");
ok((await q("select to_regprocedure('public.is_admin()') f"))[0].f === null, "is_admin() removed");
ok((await dataOf()) === snapR, "rollback did not change any row");
r = await as("authenticated", U1, `update public.profiles set role = 'admin' where id = '${U1}'`);
ok(desc(r) === desc(legacyEscalation), `after rollback the previous behaviour is back exactly (${desc(r)}) — rollback really restores`);
await db.exec(`update public.profiles set role = 'user' where id = '${U1}'`);
r = await tryExec(migration);
ok(r.startsWith("ERR") && /jcdm_security_backup_20261019/.test(r), "re-applying needs the old backup table dropped first (fails loudly)");
r = await tryExec("drop table public.jcdm_security_backup_20261019;\n" + migration);
ok(r === "ok", "after dropping the backup the migration applies again: " + r);
r = await as("authenticated", U1, `update public.profiles set role = 'admin' where id = '${U1}'`);
ok(!r.ok, "and protects again");

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
