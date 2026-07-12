# Sprint 4A — Testing Checklist

Run through this after connecting a real Supabase project (see README ->
"Connecting Supabase"). Nothing here can be verified against mock data alone.

## Setup
- [ ] Ran `supabase/schema.sql`, then `supabase/migrations/002_admin_rbac_and_audit.sql`, in that order
- [ ] Created one Auth user via Supabase Dashboard -> Authentication -> Users
- [ ] Ran `supabase/seed-admin.sql` with that user's UUID to grant `owner`
- [ ] `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Admin Authentication
- [ ] Visiting `/admin` while signed out redirects to `/admin/login?next=%2Fadmin`
- [ ] Signing in at `/admin/login` with a non-admin Supabase account (exists in
      `auth.users` but not `admin_users`) shows "This account doesn't have
      admin access" and signs the session back out
- [ ] Signing in with the seeded owner account redirects to `/admin` and shows
      the sidebar with full nav
- [ ] Signing out from the sidebar clears the session and redirects to
      `/admin/login`
- [ ] Create a second `admin_users` row with role `read_only`; confirm that
      account can view `/admin/products` but the "+ Add Product", checkboxes,
      and row actions are hidden
- [ ] Confirm a `read_only` session gets a "not authorized" result if you call
      a write Server Action directly (not just that the button is hidden —
      the server check is the real boundary)
- [ ] Deactivate an admin (`is_active = false` in `admin_users`); confirm they
      can no longer reach `/admin` even with a valid session

## Admin Dashboard
- [ ] Widgets render with zero orders/products (empty states, not errors)
- [ ] Place a few test orders directly in the `orders` table; confirm
      Revenue (7d/30d), Pending Orders, and Recent Orders reflect them
- [ ] Add products with `stock <= 5` and `stock = 0`; confirm Low Stock / Out
      of Stock counts update
- [ ] Revenue chart renders proportional bars for at least 2 distinct days

## Product Management
- [ ] Add Product: fill every section, Publish — confirm it appears in the
      products list with status "published"
- [ ] Add Product: Save as Draft — confirm status "draft", and that this
      product is excluded from `public_products` (query it directly via SQL
      editor to confirm, since the storefront doesn't read Supabase yet)
- [ ] Edit Product: change price and stock, save — confirm the list reflects
      new values and `audit_logs` has a `product.update` row with `before`/`after`
- [ ] Try submitting an edit with `compareAtPrice` lower than `price` —
      confirm the form blocks it with the Zod refinement error
- [ ] Try `reservedStock` greater than `stock` — confirm it's blocked
- [ ] Duplicate a product — confirm a new row appears with `(Copy)` suffix,
      a unique slug/SKU, and status reset to `draft`
- [ ] Delete a product — confirm it disappears from the list (soft delete:
      check `deleted_at` is set in the DB, row still exists)
- [ ] Select 2+ products, bulk Publish — confirm all update
- [ ] Select 2+ products, bulk Archive — confirm all update
- [ ] Select 2+ products, "Bulk Price +%" with value `10` — confirm each
      product's price increased by 10% of its own prior price (not a flat
      amount, and not the same for every row if prices differed)
- [ ] Select 2+ products, bulk Delete — confirm all soft-deleted and
      `audit_logs` has one `product.bulk_delete` entry listing all IDs
- [ ] Export CSV — open the file, confirm columns match `PRODUCT_CSV_COLUMNS`
      and values match the DB
- [ ] Edit the exported CSV (change a price, add a new SKU row), re-import —
      confirm existing SKUs update and the new SKU creates a new product
- [ ] Import a CSV with one row missing `price` — confirm that row reports an
      error but the other valid rows still import
- [ ] As a `sales` or `marketing` role (not in `PRODUCT_WRITE_ROLES`), confirm
      `/admin/products/new` redirects with `?error=insufficient_role`

## Security / RLS spot checks (run directly in SQL editor)
- [ ] `select * from products` as the `anon` role returns a permissions error
      (SELECT was revoked in migration 002)
- [ ] `select * from public_products` as `anon` returns only published,
      non-deleted rows, and does not include `purchase_price`
- [ ] `select * from admin_products` as an authenticated non-admin user
      returns zero rows (gated by `is_admin()`)
- [ ] `select * from audit_logs` as a `sales` or `inventory` role returns a
      permissions error (only `owner`/`administrator` can read)

## No broken links / console errors
- [ ] Click every sidebar item — "Coming Soon" entries are inert (not links),
      no console errors
- [ ] `npm run build` completes with zero type errors
- [ ] No `console.error` in the browser console during a full add-product ->
      edit -> delete cycle (audit log write failures log to the server
      console by design — check the terminal running `next dev`, not the
      browser, for those)
