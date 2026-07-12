# A2Z Platform — Architecture

## System overview

Two surfaces share one Next.js 15 App Router project:

- **Storefront** (`/`, `/shop`, `/product/[slug]`, `/cart`, `/checkout`, `/account/*`) —
  public-facing, currently reads catalog/order data from static mock arrays in
  `src/lib/data/`.
- **Admin** (`/admin/*`) — staff-only, added in Phase 4 Sprint 4A. Reads and
  writes through Supabase directly, with role-based access control enforced
  server-side.

**These two surfaces do not yet share a data source.** The storefront's mock
data and the admin's Supabase tables are independent right now — see "Known
seam" below. This is the single most important thing to understand before
extending either side.

## Auth model — two separate identities

There are two distinct kinds of authenticated user, deliberately not merged:

| | Customer | Admin/Staff |
|---|---|---|
| Sign-in route | `/login` | `/admin/login` |
| Backing table | `customers` | `admin_users` |
| Session check | `supabase.auth.getUser()` | same, plus an `admin_users` row lookup |
| Authorization | RLS keyed on `auth.uid()` | RLS via `has_admin_role()` SECURITY DEFINER function |

A Supabase Auth user can exist in `auth.users` without being staff — signing
in successfully only proves a valid account, not admin access. Every admin
Server Component and Server Action re-resolves the caller against
`admin_users` (`src/lib/admin/auth.ts`); nothing trusts a client-supplied
role claim.

### Two layers of protection, on purpose

1. **`middleware.ts`** (edge) — confirms a Supabase session exists at all for
   any `/admin/*` request, redirecting to `/admin/login` if not. Cheap, but
   not the real authorization boundary — it can't check `admin_users`
   without a DB round-trip per request, which isn't worth doing at the edge
   for every asset/navigation.
2. **`requireAdmin()` / `assertAdminRole()`** (`src/lib/admin/auth.ts`) — the
   actual boundary. Called at the top of `src/app/admin/(dashboard)/layout.tsx`
   (gates page access) and inside every Server Action in
   `src/lib/admin/actions.ts` (gates the mutation itself, independently of
   whether the UI that called it should have been reachable).

This means a Server Action is safe to call directly (e.g. from a future
mobile client hitting the same Next.js deployment) even if someone bypassed
the UI entirely — it re-checks role every time.

### Route group structure

```
src/app/admin/
  login/page.tsx              <- NOT wrapped by the authenticated layout
  (dashboard)/                <- route group; no effect on the URL
    layout.tsx                <- calls requireAdmin(), renders AdminSidebar
    page.tsx                  <- dashboard
    products/
      page.tsx                <- list
      new/page.tsx             <- create
      [id]/edit/page.tsx       <- edit
      export/route.ts          <- CSV export (Route Handler, bypasses layout too)
```

`/admin/login` is deliberately outside the `(dashboard)` route group.
Route groups (parenthesized folder names) don't affect the URL but do scope
which `layout.tsx` wraps a page — if login were inside `(dashboard)`, its own
layout would call `requireAdmin()` and redirect unauthenticated visitors back
to `/admin/login`, which is an infinite loop. Keep this structure when adding
new admin routes: anything that must render without an existing session goes
outside `(dashboard)`.

## RBAC

Six roles (`admin_role` enum, migration 002): `owner`, `administrator`,
`inventory`, `sales`, `marketing`, `read_only`.

Role-to-permission mapping lives in two places that must stay in sync:
- **Database**: `has_admin_role(allowed admin_role[])` used inside RLS
  policies — this is the layer that actually stops an unauthorized write,
  even if application code has a bug.
- **Application**: `PRODUCT_WRITE_ROLES` / `PRODUCT_READ_ROLES` in
  `src/lib/types.ts`, used by `requireAdmin()`/`assertAdminRole()` calls and
  by the sidebar to hide links a role can't use.

The database policy is the one that matters for security; the application
constants are for UX (don't show a button that will fail) and defense in
depth. If you add a new role-gated action, add the check in both places.

## Product status lifecycle

`products.status`: draft -> published -> archived, plus a separate
`deleted_at` timestamp for soft delete (Delete Product in the UI sets both
`status = 'archived'` and `deleted_at`, rather than removing the row — this
keeps `order_items` foreign keys intact for historical orders).

A trigger (`sync_is_published`) keeps the legacy `is_published` boolean in
step with `status`, since the original `public read products` policy from
`schema.sql` checked that boolean. Migration 002 replaces that policy
entirely (see below), but the trigger is left in place as a safety net for
any other code path still reading `is_published`.

## Column-level data protection

RLS is row-level, not column-level — the original `public read products`
policy would have exposed `purchase_price` (cost) to any storefront request
doing `select *`. Migration 002 fixes this by:

1. Revoking direct `SELECT` on `products` from `anon`/`authenticated`.
2. Adding `public_products` — a view exposing only customer-safe columns,
   filtered to `status = 'published' and deleted_at is null`.
3. Adding `admin_products` — a view exposing every column, gated by
   `is_admin()` in its `WHERE` clause (views can't carry RLS directly).

Known seam (read this before wiring the storefront to Supabase): the
storefront doesn't query Supabase yet, so this change is inert today — but
when you do that migration, storefront queries must hit `public_products`,
not `products`, or they'll get a permissions error (which is the point).

## Audit log

`audit_logs` is append-only (insert policy only, no update/delete policy) and
written from every mutating Server Action via `src/lib/admin/audit.ts`. A
failed audit write logs to the server console but does not roll back the
primary action — an audit gap is bad, but blocking a legitimate stock update
because logging hiccuped is worse. If audit completeness becomes a hard
compliance requirement, wrap both in a single transaction via an RPC instead.

## Never-trust-the-client pricing

`bulkUpdatePrice`/`bulkUpdateStock` in `src/lib/admin/actions.ts` never accept
a client-computed final number for percentage/amount-delta modes — they read
the current DB value server-side and compute the new value from that, so a
tampered request body can't set an arbitrary price by lying about the
starting point. "set" mode (absolute value) is still validated by Zod
(`bulkPriceUpdateSchema`) but is inherently trusting the operator's typed
number, same as the single-product form.

## What's deliberately not built yet

- **Storefront <-> Supabase wiring** — see "Known seam" above. This is the
  highest-value next step; without it, admin-created products don't appear
  on the site.
- **Product Capture (Module 4)** — camera capture, crop, compress, drag
  reorder, direct Supabase Storage upload. The current form takes image
  URLs/paths as text. Needs an upload flow via Supabase Storage plus a
  client image-processing step (canvas-based crop/compress) — sized as its
  own sprint.
- **Categories/Brands/Inventory/Orders/Customers/Homepage CMS/Media
  Library/Promotions/Reports admin screens** — sidebar shows these as
  "Coming Soon" (non-clickable) rather than dead links.
- **Order management UI** — the dashboard reads real order data once
  Supabase is connected, but there's no `/admin/orders` screen yet to act
  on it (change status, print picking slips, etc).
