# Deployment Notes — Sprint 4A

## Prerequisites
- A Supabase project (Phase 4 requires it — the admin area has no offline mode)
- Vercel account (or any Next.js 15 compatible host that supports Middleware
  and Server Actions)

## 1. Supabase setup
```
1. Create the project at supabase.com
2. SQL Editor -> run supabase/schema.sql
3. SQL Editor -> run supabase/migrations/002_admin_rbac_and_audit.sql
4. Authentication -> Users -> Add User (this becomes your first admin)
5. SQL Editor -> run supabase/seed-admin.sql with that user's UUID,
   setting role = 'owner'
```

## 2. Environment variables
Set these in Vercel (Project Settings -> Environment Variables) and locally
in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```
`SUPABASE_SERVICE_ROLE_KEY` is in `.env.example` for future use (Product
Capture's server-side Storage uploads, background jobs) but nothing in
Sprint 4A uses it — everything goes through RLS with the user's own session,
which is the safer default. Don't add the service role key to any
client-reachable code path.

## 3. Deploy
```
vercel --prod
```
Or connect the GitHub repo in the Vercel dashboard for auto-deploy on push.
Confirm `middleware.ts` is at the project root (not under `src/`) — Vercel
picks it up automatically from there; moving it would silently disable
`/admin` route protection.

## 4. Post-deploy checks
- Visit `/admin/login`, sign in as the seeded owner, confirm the dashboard
  loads
- Add one real product end-to-end, confirm it appears in the Supabase
  `products` table
- Run through `TESTING_CHECKLIST.md`

## 5. Rollback
Both migrations in this sprint are additive only (`create table if not
exists`, `add column if not exists`) — nothing destructive. If something
needs reverting:
- Application: redeploy the previous Vercel deployment (instant, no DB
  changes needed)
- Database: the new columns/tables can stay in place even if you roll back
  the app to a pre-Phase-4 build; they're inert until admin code reads them

## What's NOT production-ready yet from this sprint
- No rate limiting on `/admin/login` — add before real staff credentials are
  in use on a public URL (Supabase Auth has some built-in throttling, but a
  dedicated rate limit on the login route is still worth adding)
- No email verification/invite flow for new admin accounts — bootstrapping
  is manual via SQL (`seed-admin.sql`), fine for a small team, not fine past
  a handful of staff
- CSV import processes rows sequentially with individual DB calls — fine for
  the catalog sizes in the original brief (hundreds of SKUs), would need
  batching for thousands+
