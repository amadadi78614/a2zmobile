# A2Z Mobile & Computer Services — Storefront + Admin (Phase 1–4 Sprint A)

Premium ecommerce concept build for A2Z Mobile & Computer Services (Mbombela, South Africa) —
a mobile/computer accessories retailer: Bluetooth speakers, phone covers, chargers/cables/power
banks, USB & electric fans, hookah pipes & accessories, and LCD screens/repair parts (sold as
parts — the business does not sell repair services online). This delivers **Phase 1–3** (storefront,
checkout, customer accounts) plus **Phase 4 Sprint A**: Admin Authentication, Admin Dashboard, and
Product Management. See `ARCHITECTURE.md` for how the two surfaces (storefront vs. admin) relate,
`TESTING_CHECKLIST.md` before considering this sprint verified, and `DEPLOYMENT.md` to ship it.

**Read `ARCHITECTURE.md` first if you're extending the admin area** — it documents the auth
boundary, the route-group structure that prevents a login redirect loop, and the one architectural
gap (storefront and admin don't share a data source yet) that shapes what to build next.

## What's in this build

- Next.js 15 (App Router) + React 19 + TypeScript, strict mode
- Tailwind CSS with a custom design token system (see `tailwind.config.ts`)
- Zustand for cart and wishlist state (persisted to localStorage)
- Fully responsive, mobile-first layout
- **Storefront**: Home, Shop (filters/sort), Product detail, Search, Cart, Wishlist
  - Home includes a rotating hero **banner carousel** (autoplay, arrow + dot nav,
    pauses on hover, respects `prefers-reduced-motion`) and horizontal **product
    carousels** for Today's Deals and New Arrivals (scroll-snap, arrow controls,
    disabled at each end)
- **Checkout**: 4-step flow (contact → delivery/collection → payment → review),
  supports courier delivery or in-store collection, and PayFast / Ozow / manual EFT
  as payment method choices
- **Accounts**: Supabase Auth-wired login/register, account dashboard, order
  history + order detail with a delivery tracker, saved addresses, returns
  request form, profile/password, notification preferences
- **Public order tracking** at `/track-order` (no login required)
- Sample product/catalog/order data in `src/lib/data/` — swap for live Supabase
  queries without touching component code (components consume the same
  `Product`/`Order`/`Address` types either way)
- **Search (production architecture)**: PostgreSQL full-text search + pg_trgm
  typo tolerance, ranked in strict priority — exact SKU/barcode match, then
  weighted full-text (name/SKU > brand/category/compatible devices >
  tags/keywords/description), then fuzzy fallback for typos. Searches
  product name, SKU, barcode, brand, category, compatible devices, tags, and
  search keywords. Instant search with a live suggestions dropdown in the
  header, persisted recent searches, and popular searches. Two real
  false-positives were found and fixed during development — a whole-phrase
  fuzzy match letting "iphone charger" surface an unrelated iPhone-compatible
  screen, and short model-number tokens like "S22"/"S24" scoring as
  near-duplicates — see `supabase/migrations/003_search_architecture.sql`
  for the full reasoning and `src/lib/search/` for the app-layer code.
- **Product images**: real file upload in the admin (drag-to-reorder, promote
  any image to primary, 5MB/image-type validation) uploading directly to a
  Supabase Storage bucket — not just a URL-paste field. Falls back to
  URL-paste when Supabase isn't connected.
- Full Postgres schema with Row Level Security at `supabase/schema.sql`,
  catalog, customers, addresses, orders, order items, wishlist, and returns
- **Admin (Phase 4 Sprint A)**:
  - `/admin/login` — staff sign-in, separate from customer auth, checked against an `admin_users` table
  - Role-based access control: `owner`, `administrator`, `inventory`, `sales`, `marketing`, `read_only`
    — enforced both in the database (RLS) and in the app (route/action guards)
  - `/admin` dashboard — revenue (7d/30d), pending orders, customer/product counts, low/out-of-stock
    alerts, a revenue chart, best sellers, and recent orders
  - `/admin/products` — full product management: add/edit/delete (soft), archive, duplicate,
    draft/publish, bulk publish/archive/delete/price-update, CSV import + export
  - Audit log — every product mutation recorded with actor, role, and before/after state
  - **Requires Supabase to be connected** — without it, `/admin/products` shows a read-only preview
    of the mock catalog and all write actions are disabled (see "Connecting Supabase" below)

## Design system

- **Colour**: Primary `#FFD400`, Secondary `#D61F26`, Ink `#111111`, Paper `#FFFFFF`,
  Mist `#F7F7F7`, Border `#E8E8E8` — matches the brand's locked palette. Yellow and
  red are treated as sparing accents (badges, CTAs, sale pricing), never as fills,
  to keep the UI feeling premium rather than "toy-bright."
- **Type**: Poppins for display/headings, Inter for UI and body text — per brief.
- **Signature element**: the dark "spec ticker" strip beneath the hero — a
  scrolling readout of real service guarantees (warranty, genuine stock, delivery),
  set in uppercase Inter with wide tracking, echoing a technical spec sheet — a
  nod to the fact that A2Z sells devices defined by their spec sheets.

## Getting started

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

```bash
npm run build   # production build
npm run start   # run the production build
```

> Note: `next/font` fetches Inter and Poppins from Google Fonts at build time,
> so an internet connection is required for `npm run build` / `npm run dev`.

## Connecting Supabase (required for real auth/checkout/orders, and required for the admin area)

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor, then
   `supabase/migrations/002_admin_rbac_and_audit.sql`, then
   `supabase/migrations/003_search_architecture.sql`, then
   `supabase/migrations/004_product_image_storage.sql` — order matters, each migration
   depends on tables from the base schema.
3. Copy `.env.example` to `.env.local` and fill in `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` from Project Settings → API.
4. `/login` and `/register` are already wired to `supabase.auth`; they'll work as
   soon as the env vars are set.
5. **To use the admin area** (`/admin`): create a Supabase Auth user via
   Dashboard → Authentication → Users, then run `supabase/seed-admin.sql` with
   that user's UUID to grant them the `owner` role. There's no self-service
   admin signup by design — see `ARCHITECTURE.md` → "RBAC".
6. **Orders, addresses, and returns still read from mock data** in
   `src/lib/data/orders.ts` — the checkout flow simulates placing an order rather
   than writing to the `orders` table. Wiring the checkout's `placeOrder()` and the
   account pages to real Supabase queries is the next concrete step, along with
   wiring the storefront's product pages to `public_products` (see `ARCHITECTURE.md`
   → "Known seam" — this is the single most important gap to close next).
7. Payment methods (PayFast / Ozow) are presented as selectable options in
   checkout but are not yet wired to either gateway's API/ITN webhook — that
   integration work, plus the `PAYFAST_*` / `OZOW_*` credentials in `.env.example`,
   is part of a future sprint.

## Project structure

```
src/
  app/
    page.tsx                    Home
    shop/                       Shop (filters, sort, grid)
    product/[slug]/             Product detail
    search/                     Instant search
    cart/                       Cart
    wishlist/                   Wishlist
    checkout/                   4-step checkout + confirmation
    login/, register/           Supabase Auth (customer)
    account/                    Dashboard, orders, addresses, returns, profile, notifications
    track-order/                Public order lookup
    admin/
      login/                    Staff sign-in (outside the authenticated route group)
      (dashboard)/              Route group — layout.tsx enforces requireAdmin()
        page.tsx                 Dashboard widgets
        products/                List, new, [id]/edit, export (CSV)
    layout.tsx                  Root layout (fonts, header, footer)
  components/
    layout/                     Header (mega menu, mobile drawer, live search), Footer
    home/                       Hero carousel, product carousel, category grid, rails, trust, newsletter, spec ticker
    product/                    Product card, gallery, purchase panel
    shop/                       Filter sidebar, sort bar
    account/                    Account section nav
    admin/                      Sidebar, stat cards, revenue chart, product form, product table
  lib/
    types.ts                    Shared TypeScript types (storefront + admin)
    data/                       Mock catalog + order/address data
    store/                      Zustand cart, wishlist, and recent-searches stores
    supabase/                   Browser/server Supabase clients + middleware session refresh
    admin/
      auth.ts                   Admin session/role resolution — the real authorization boundary
      audit.ts                  Audit log writer
      actions.ts                Product management Server Actions (create/update/delete/bulk/import)
      validation.ts             Zod schemas — server-side validation for every product write
      csv.ts                    CSV parse/stringify for bulk import/export
      queries.ts                Dashboard stats (Supabase-backed, mock fallback)
      product-queries.ts        Product list/detail reads (Supabase-backed, mock fallback)
    search/
      queries.ts                Ranked search — calls the search_products() RPC, mock fallback for local dev
      actions.ts                Server Actions wrapping search for client components (instant search, suggestions)
      mock-search.ts            Mock-data search mirroring the Postgres function's tiers and false-positive fixes
    hooks/
      useDebouncedValue.ts       Debounce hook used by instant search
    utils.ts                    Formatting helpers (ZAR currency, discount %)
middleware.ts                   Edge session check for /admin/* (not the full auth boundary — see ARCHITECTURE.md)
supabase/
  schema.sql                    Base Postgres schema + RLS policies (Phase 1-3)
  migrations/
    002_admin_rbac_and_audit.sql  Admin roles, audit log, product status, column-level cost-price protection
    003_search_architecture.sql   Device compatibility tables, weighted full-text search, pg_trgm, ranked search function
    004_product_image_storage.sql Public storage bucket for product photos, admin-only write RLS
  seed-admin.sql                 Bootstrap the first owner admin (manual, by design)
public/images/                  Placeholder product/category imagery + A2Z logo
ARCHITECTURE.md                 System design, auth model, RBAC, known gaps
TESTING_CHECKLIST.md            Manual test plan for Sprint 4A
DEPLOYMENT.md                   Deployment steps and rollback notes
```

## Replacing placeholder imagery

All product, category, and hero images in `public/images/` are generated
placeholders so the layout and design system can be reviewed immediately.
Swap them for real photography (or wire up Supabase Storage) —
the `Product.images` field just expects an array of URLs or local paths.

## Roadmap (not yet built)

- **Pagination**: `/shop` and `/admin/products` currently fetch the entire
  product set in one query with no page limit — fine at the current
  catalog size, but should be added before the catalog grows past a few
  hundred SKUs (the database/search layer scales far beyond that; this is
  a UI-layer gap, not a database one)
- **Immediate next step**: wire the storefront's product pages to Supabase's
  `public_products` view, and checkout/account pages to the real `orders` table —
  without this, products added via `/admin/products` don't appear on the site,
  and search results link to product pages that only exist for mock data locally
- **Admin device management**: there's no `/admin/devices` screen yet to add
  new device brands/series/models — `src/lib/data/devices.ts` is a small seed
  list for the ProductForm's compatible-devices picker in local dev; production
  needs a real CRUD screen backed by the `device_brands`/`device_series`/
  `device_models` tables (schema already exists, migration 003)
- **Phase 4 Sprint B**: Categories, Brands, Inventory, Orders, Customers admin
  screens; Product Capture (camera, crop, compress, Supabase Storage upload);
  Homepage CMS; Media Library; Promotions; Reports
- **Payments**: PayFast/Ozow API + ITN webhook integration
- **Phase 5**: SEO (schema/sitemap/GA), performance pass

