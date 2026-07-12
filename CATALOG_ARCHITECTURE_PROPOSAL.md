# Catalogue Architecture Proposal

Status: **proposal — not yet implemented.** Nothing in this document has been
applied to the codebase or database. Implementation begins only once this is
approved, per the brief.

Scope: this redesigns the *data model and information architecture* of the
product catalogue (categories, compatibility, filtering, search). It does not
touch the visual design, homepage layout, branding, or any existing page
outside of what's needed to serve the new category/filter/search structure.

---

## 0. Decision this proposal is built around

All four existing non-core categories stay: **Hookah Pipes & Accessories**,
**USB & Electric Fans**, **LCD Screens & Digitizers**, **Repair Parts & Tools**.
They're split by *shopping intent*, not hidden:

- **LCD Screens** and **Repair Parts** → grouped as a **Technical** section —
  customers here are typically technicians or people doing their own repair,
  shopping by part compatibility rather than lifestyle browsing.
- **Hookah** and **Fans** → grouped as a **Lifestyle & Specialty** section —
  unrelated shopping intent to phone/computer accessories, so they're kept
  visually distinct rather than diluting the core accessory categories.

Both sections are full peers of the 16 core categories in the database —
same table, same filtering, same search indexing, same admin tooling. The
grouping is a *navigation presentation layer* on top of a flat, equal
category set, not a second-class data model. This matters: it means the
groups can be renamed, merged, or reorganized later as pure UI work, without
a schema migration.

---

## 1. Category Hierarchy

Two levels, using the `parent_id` self-reference already present on the
`categories` table (`supabase/schema.sql`) — no schema change needed for
nesting itself, only data population and a new `nav_group` field (see §2)
to drive menu presentation.

```
Phone Protection
├─ Phone Cases
│  ├─ Silicone Cases
│  ├─ Rugged Cases
│  ├─ Leather Cases
│  ├─ Wallet Cases
│  ├─ Clear Cases
│  ├─ MagSafe Cases
│  ├─ Heavy Duty Cases
│  └─ Designer Cases
└─ Screen Protectors
   ├─ Tempered Glass
   ├─ Privacy Glass
   ├─ Matte Glass
   ├─ Camera Lens Protectors
   └─ Hydrogel Protectors

Power & Charging
├─ Chargers
│  ├─ Wall Chargers
│  ├─ Car Chargers
│  ├─ Wireless Chargers
│  ├─ MagSafe Chargers
│  ├─ Charging Stations
│  ├─ GaN Chargers
│  ├─ Fast Chargers (PD)
│  └─ (wattage/connector are product attributes, not subcategories — see §5)
├─ USB Cables
│  ├─ USB-C to USB-C
│  ├─ USB-A to USB-C
│  ├─ USB-C to Lightning
│  ├─ Lightning
│  ├─ Micro USB
│  ├─ Braided
│  ├─ Magnetic
│  ├─ OTG
│  └─ 3-in-1 Cables
├─ Power Banks
│  └─ (capacity/wireless/solar are attributes, not subcategories — see §5)
└─ Adapters
   ├─ USB-C Adapters
   ├─ Lightning Adapters
   ├─ HDMI Adapters
   ├─ DisplayPort Adapters
   ├─ VGA Adapters
   ├─ USB Hubs
   └─ OTG Adapters

Audio & Gaming
├─ Audio
│  ├─ Bluetooth Earbuds
│  ├─ Wired Earphones
│  ├─ Gaming Headsets
│  ├─ Bluetooth Speakers
│  ├─ Portable Speakers
│  ├─ Soundbars
│  └─ Microphones
└─ Gaming Accessories
   ├─ Controllers
   ├─ Charging Docks
   ├─ Gaming Headsets       (cross-listed with Audio, see §1.1)
   ├─ Gaming Mouse          (cross-listed with Computer Accessories)
   ├─ Gaming Keyboard       (cross-listed with Computer Accessories)
   └─ Console Accessories

Computer & Storage
├─ Computer Accessories
│  ├─ Wireless Mouse
│  ├─ Gaming Mouse
│  ├─ Keyboard
│  ├─ Gaming Keyboard
│  ├─ USB Hubs              (cross-listed with Adapters)
│  ├─ USB Docking Stations
│  ├─ Laptop Chargers
│  ├─ Laptop Sleeves
│  ├─ Cooling Pads
│  ├─ Webcams
│  └─ Mouse Pads
├─ Storage
│  ├─ USB Flash Drives
│  ├─ Micro SD
│  ├─ SD Cards
│  ├─ External SSD
│  ├─ External HDD
│  └─ Card Readers
└─ Networking
   ├─ WiFi Routers
   ├─ Mesh WiFi
   ├─ WiFi Extenders
   ├─ Ethernet Cables       (cross-listed with Cables)
   ├─ Network Switches
   └─ USB Network Adapters

Car & Smart
├─ Car Accessories
│  ├─ Phone Mounts
│  ├─ Car Chargers          (cross-listed with Chargers)
│  ├─ Bluetooth Car Kits
│  └─ FM Transmitters
└─ Smart Devices
   ├─ Smart Watches
   ├─ Fitness Bands
   └─ Bluetooth Trackers

Cables & Care
├─ Cables
│  ├─ HDMI
│  ├─ DisplayPort
│  ├─ Ethernet             (cross-listed with Networking)
│  ├─ AUX
│  ├─ Optical
│  ├─ USB
│  └─ Lightning
├─ Cleaning
│  ├─ Cleaning Kits
│  ├─ Screen Cleaner
│  ├─ Microfibre Cloth
│  └─ Compressed Air
└─ Other Accessories
   ├─ Stylus Pens
   ├─ SIM Tools
   ├─ PopSockets
   ├─ Phone Rings
   ├─ Lanyards
   └─ Wallets

── Technical ──────────────────────────────
LCD Screens & Digitizers   (existing category, retitled group label only)
Repair Parts & Tools       (existing category, retitled group label only)

── Lifestyle & Specialty ──────────────────
Hookah Pipes & Accessories (existing category, unchanged)
USB & Electric Fans        (existing category, unchanged)
```

### 1.1 Cross-listing (a category can't hold two parents)

Several leaf categories logically belong under two parents (Gaming Headsets
under both Audio and Gaming; Car Chargers under both Car Accessories and
Chargers; Ethernet Cables under both Networking and Cables; USB Hubs under
both Adapters and Computer Accessories). A category tree only allows one
parent per node, so cross-listing is handled at the **product** level, not
the category level: a product's *primary* category determines its canonical
URL and breadcrumb, but it can carry additional `secondary_category_ids` so
it also surfaces in the other listing. This is a small addition to the
product-category relationship (§6), not a change to the category tree
itself.

### 1.2 Navigation presentation (`nav_group`)

Add one field to `categories`: `nav_group text` — values `'core'`,
`'technical'`, `'lifestyle'`. Purely a rendering hint for the mega menu
(which section a category's link appears under); has no effect on routing,
filtering, or search. This is what lets Technical and Lifestyle be visually
separated ("clean and professional" primary nav) while remaining structurally
identical, equally-searchable categories underneath.

Mega menu layout this enables:
```
[ Phone Protection ] [ Power & Charging ] [ Audio & Gaming ] [ Computer & Storage ] [ Car & Smart ]
──────────────────────────────────────────────────────────────────────────
Technical: LCD Screens & Digitizers · Repair Parts & Tools
Lifestyle & Specialty: Hookah Pipes & Accessories · USB & Electric Fans
```
The five core groups render as the main column layout (matching the current
mega menu's grid pattern); Technical and Lifestyle render as two compact
labeled rows underneath — present, one click away, but not competing for
primary visual weight with the core shopping categories.

---

## 2. Compatibility Architecture

This is the structural core of the redesign. Today, `compatibility` is a
loose `text[]` on `products` — free-text strings like `"iPhone 15"`, no
brand/model structure, no way to query "everything compatible with Galaxy
S24 Ultra" without a string match. Replacing it:

```
device_brands
  id, name ("Samsung"), slug, logo_url, sort_order

device_series          -- "Galaxy S24 series", "iPhone 15 series"
  id, brand_id → device_brands, name, slug, sort_order

device_models
  id, series_id → device_series, brand_id → device_brands,
  name ("Galaxy S24 Ultra"), slug, release_year, sort_order

product_compatible_devices          -- the many-to-many junction
  product_id → products,
  device_model_id → device_models,
  primary key (product_id, device_model_id)

product_compatible_series           -- "fits the whole series" shortcut
  product_id → products,
  series_id → device_series,
  primary key (product_id, series_id)
```

**Why two junction tables (model-level and series-level):** a lot of
accessories genuinely fit an entire line ("fits all Galaxy A series phones"
for a universal silicone case), not one specific model. Forcing every such
product to be tagged against every individual model in that series is both
tedious data entry and semantically wrong (it implies a precision that
doesn't exist). `product_compatible_series` lets one row say "fits the whole
Galaxy A series"; `product_compatible_devices` handles the precise
model-specific case (a Galaxy S24 Ultra rugged case that doesn't fit the
S24). A product can use either or both. Resolving "what fits my Galaxy S24
Ultra" means checking both tables (direct model match, or series match on
the model's `series_id`) — one indexed query, not a scan.

**Brand seed data** (from the brief): Samsung, Apple, Huawei, Xiaomi, Oppo,
Vivo, Honor, Google, Motorola. **Series seed data** grouped per the brief's
examples: Galaxy S25/S24/S23/S22 (Ultra/Plus/base as separate models within
each series), Galaxy A Series, Galaxy Fold, Galaxy Flip, iPhone 16
Pro Max/Pro/16, iPhone 15 Pro Max/Pro/15, iPhone 14, 13, 12, Huawei P Series,
Mate, Nova, Redmi, Poco. This becomes actual seed SQL at implementation time,
not invented at migration time — I'd want your sign-off on the exact model
list before it's hardcoded as seed data, since getting a model name wrong
(e.g. missing a regional variant) is the kind of thing that's annoying to
fix after products are already tagged against it.

---

## 3. Updated Product Table

Rather than adding a fixed column for every category-specific attribute
(`charging_wattage`, `connector_type`, `colour`, `material`,
`storage_capacity_gb`...), which would leave most columns `null` for most
products (a phone case has no wattage; a charger has no material in the same
sense a case does), category-specific attributes go into a single JSONB
column with a GIN index for fast filtering. Universal attributes that *every*
product shares stay as real columns (price, stock, rating — already there).

```sql
alter table products add column if not exists attributes jsonb not null default '{}'::jsonb;
alter table products add column if not exists tags text[] not null default '{}'::text[];
alter table products add column if not exists primary_category_id uuid references categories(id);
alter table products add column if not exists secondary_category_ids uuid[] not null default '{}'::uuid[];

create index if not exists idx_products_attributes on products using gin (attributes);
create index if not exists idx_products_tags on products using gin (tags);
```

`attributes` shape (examples per category — documented, not enforced by a
rigid schema, since Postgres JSONB doesn't need a fixed shape per row, but
the **admin form** enforces which keys are editable per category, see §7):

```jsonc
// Phone case
{ "colour": "Black", "material": "Silicone", "magsafe_compatible": true }

// Charger
{ "wattage": 45, "connector_type": "USB-C", "ports": 2, "protocol": "PD" }

// USB cable
{ "connector_type_a": "USB-C", "connector_type_b": "Lightning", "length_cm": 100, "braided": true }

// Power bank
{ "capacity_mah": 20000, "wireless": true, "fast_charging": true }

// Storage
{ "capacity_gb": 256, "read_speed_mbps": 100 }
```

**Why JSONB over a strict EAV table (`product_attributes` with one row per
key/value):** faceted filtering (`WHERE attributes->>'wattage' = '45'`) is
simpler to write and index than joining a separate EAV table per filter, and
Postgres's GIN index on JSONB makes both containment queries
(`attributes @> '{"connector_type":"USB-C"}'`) and key-existence queries
fast. The tradeoff — no foreign-key integrity on attribute values — is
acceptable here because the admin form (§7), not the database, is what
constrains which keys/values are valid per category; the DB isn't the
enforcement layer for this, correctness of a filter facet isn't a
security-relevant constraint the way price/stock integrity is.

Full `products` table after this change (only additions/changes shown,
everything from `schema.sql` + migration 002 stays):

```sql
-- unchanged from schema.sql + 002: id, slug, title, brand_id, category_id,
-- subcategory_id, price, compare_at_price, sku, stock, reserved_stock,
-- short_description, description, specs, colorways, compatibility (deprecated,
-- see migration plan), warranty, badge, rating, review_count, purchase_price,
-- status, is_featured, supplier, barcode, vat_inclusive, weight_kg,
-- dimensions_cm, seo_title, seo_description, meta_keywords, features,
-- deleted_at, created_at, updated_at

-- new in this proposal:
attributes                jsonb        -- category-specific facets (§3)
tags                      text[]       -- freeform merchandising tags
primary_category_id       uuid         -- canonical category (replaces category_id conceptually)
secondary_category_ids    uuid[]       -- cross-listing (§1.1)
```

`compatibility text[]` (the current free-text field) is superseded by the
junction tables in §2 but not dropped in the same migration — see §8
(migration plan) for why.

---

## 4. Filter Architecture

Two tiers: **universal filters** (same everywhere) and **dynamic per-category
facets** (driven by whatever's actually present in `attributes` for the
current category's products, not hardcoded per category).

**Universal** (every category page):
- Price (range)
- Availability (in stock / out of stock)
- Rating (4+ / 3+ etc.)
- Sale / New Arrival / Featured (badge-driven, already exist)
- Brand (from `brands`, filtered to brands with at least one product in this category)
- Compatible Device (two-step: pick brand → pick model, from §2's tables;
  only shown on categories where compatibility is meaningful — cases,
  screen protectors, chargers, cables — not on, say, Cleaning)

**Dynamic per-category** (derived, not hardcoded):
A query against the current result set's `attributes` JSONB returns the
distinct keys present and, per key, the distinct values — e.g. on Chargers,
that yields facets for `wattage` (20/25/45/65/100), `connector_type`
(USB-C/USB-A), `ports` (1/2/3); on Phone Cases it yields `colour` and
`material` instead, automatically, with no per-category filter config to
maintain by hand. New attribute keys entered via the admin form
automatically become filterable — there's no separate "register this as a
filter" step, which matters given the category list here is already large
and the brief explicitly wants attributes like charging speed and connector
type to be filterable across many categories, not configured once each.

This is implemented as one reusable query pattern
(`select distinct jsonb_object_keys(attributes) ...` plus a per-key distinct
values query, both scoped to the current category + already-applied
filters, so facet counts stay accurate as filters narrow the set) rather
than category-specific filter components.

---

## 5. Search Architecture

Current search (`/search`) does client-side substring matching against
`title`/`brand`/`categorySlug` over the full mock array — fine at current
catalogue size, doesn't scale to real search requirements (SKU/barcode exact
match, typo tolerance, compatible-device search, connector-type search).

Proposed:

```sql
alter table products add column if not exists search_vector tsvector
  generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(sku, '') || ' ' || coalesce(barcode, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(short_description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'C')
  ) stored;

create index if not exists idx_products_search on products using gin (search_vector);

create extension if not exists pg_trgm;
create index if not exists idx_products_title_trgm on products using gin (title gin_trgm_ops);
```

- **`search_vector`** (weighted full-text): title and SKU/barcode weighted
  highest (`'A'`), so an exact or near-exact product-name/SKU match always
  outranks a keyword that merely appears in a long description. Query via
  `ts_rank(search_vector, query) desc`.
- **Brand / compatible device / category / connector type**: not baked into
  `search_vector` directly (they're relational, in other tables) — search
  resolves them via a joined query: `products` ⋈ `brands` ⋈
  `product_compatible_devices` ⋈ `device_models` ⋈ `categories`, matching
  the search term against any of those joined name fields *in addition to*
  the full-text vector. This is what makes "Samsung S24 Ultra cover" work as
  a query even though no single column contains that exact phrase — it's
  assembled from a category match ("cover" → Phone Cases) + a device match
  ("S24 Ultra" → device_models) + a brand match ("Samsung").
- **Typo tolerance**: `pg_trgm` trigram similarity (`title % query`) as a
  fallback tier when the full-text query returns few/no results — catches
  "blootooth" → "bluetooth" that `tsvector`'s exact-token matching would miss.
- **SKU/barcode**: also gets an exact-match fast path
  (`where sku = query or barcode = query`) checked first, since a scanned
  barcode or typed SKU should never go through fuzzy ranking — it's either
  an exact hit or it isn't.

The `/search` page's client-side filtering approach (fine for a small mock
array) gets replaced by a server query hitting this index — necessary once
the catalogue is real-sized, and it's the same underlying data source the
storefront-Supabase wiring (already flagged as pending from Sprint 4A) needs
regardless.

---

## 6. Admin & CSV Import Updates (scoped for implementation, not built yet)

**Admin product form** additions:
- Primary Category selector (existing) + new Secondary Categories
  multi-select (cross-listing, §1.1)
- Compatible Devices: brand → series/model cascading multi-select, backed by
  §2's tables — not a free-text field
- Tags: free-text chip input (already have this pattern in `ProductForm.tsx`
  via `TagListEditor` — reused, not rebuilt)
- Attributes: category-aware dynamic field set — selecting "Chargers" as the
  category surfaces Wattage/Connector Type/Ports inputs; selecting "Phone
  Cases" surfaces Colour/Material instead. Backed by a small
  `category_attribute_schema` config (which keys are editable for which
  category) — this is the one place a per-category config *is* worth
  maintaining by hand, since it drives form UI, not filtering (§4's filters
  stay fully dynamic/derived).

**CSV import/export**: compatible devices, secondary categories, tags, and
image lists are multi-value — CSV columns for these use a delimiter within
the cell (semicolon-separated: `"Galaxy S24 Ultra;Galaxy S24 Plus"`), parsed
into the junction table rows on import. Export does the reverse. The
existing CSV parser (`src/lib/admin/csv.ts`) already handles quoted fields
correctly, so this is an additive column-parsing change, not a rewrite.

---

## 7. Migration Plan

Additive-only, matching the pattern from migration 002 — nothing destructive,
nothing that breaks the current mock-data-driven storefront while it's still
running on mock data.

**Step 1 — Category tree population**
Add `nav_group` column to `categories`. Insert the new core category tree
(§1) as `categories` rows with correct `parent_id` chains. Existing 8
categories (`bluetooth-speakers`, `phone-covers`, etc.) get remapped: some
become subcategories of new parents (e.g. `phone-covers` → merges into the
new Phone Cases tree, or stays as an alias — needs a decision on whether
existing product `categorySlug` values get remapped or the old slugs
redirect), `hookah`/`fans`/`lcd-screens`/`repair-parts` get `nav_group`
values (`'lifestyle'`, `'lifestyle'`, `'technical'`, `'technical'`) and
otherwise stay as-is.

**Step 2 — Compatibility tables**
Create `device_brands`, `device_series`, `device_models`,
`product_compatible_devices`, `product_compatible_series`. Seed brands +
series + models (pending your sign-off on the exact model list, §2). RLS:
public read (same pattern as `categories`/`brands`), admin-only write.

**Step 3 — Product table additions**
Add `attributes jsonb`, `tags text[]`, `primary_category_id`,
`secondary_category_ids uuid[]` to `products` (all `add column if not
exists`, all nullable/defaulted — no existing row breaks). Backfill
`primary_category_id` from the existing `category_id` for any rows already
in the DB.

**Step 4 — Search index**
Add the generated `search_vector` column + GIN index + `pg_trgm` extension
(§5). Generated columns backfill automatically on creation — no manual
backfill step needed.

**Step 5 — Compatibility data backfill**
For any products that already carry the old free-text `compatibility
text[]` (currently only a handful of mock phone-case/battery/LCD products —
e.g. `"iPhone 15"`, `"Galaxy S24 Ultra"`), map each string to the
corresponding `device_models` row and insert into
`product_compatible_devices`. Done as a one-time script, not a blind SQL
migration, since free-text-to-structured mapping needs eyeballing (e.g.
confirming "Galaxy A14" maps to the right series).

**Step 6 — Deprecate, don't drop, the old `compatibility` column**
Leave `products.compatibility text[]` in place after Step 5, unused by new
code, rather than dropping it in this migration. Dropping a column is the
one genuinely irreversible step in this whole plan, and there's no cost to
leaving it inert for one release cycle in case the backfill in Step 5 missed
an edge case. Actual removal becomes a trivial one-line migration later,
once you've confirmed nothing depends on it.

**Step 7 — Application layer** (separate from the DB migration itself,
sequenced after it, requires its own approval per the brief's process)
- Update `Product`/`AdminProduct` types (`src/lib/types.ts`) to add
  `attributes`, `tags`, `compatibleDevices` (replacing the loose
  `compatibility?: string[]`), `secondaryCategorySlugs`
- Update `ProductForm.tsx` for cascading device selects + dynamic attribute
  fields
- Update `FilterSidebar.tsx`/shop page for dynamic per-category facets (§4)
- Rebuild `/search` as a server-backed query (§5) — this can happen in the
  same pass as the storefront-Supabase wiring already flagged as the
  outstanding gap from Sprint 4A, since both need the same "storefront
  reads from Supabase" plumbing
- Update mega menu (`Header.tsx`) for the grouped nav layout (§1.2)
- Update `src/lib/admin/csv.ts` column set for multi-value fields (§6)

**Rollback**: every DB step above is additive (`create table if not
exists`, `add column if not exists`, generated columns, new indexes) — safe
to leave in place even if the application layer (Step 7) is rolled back to a
previous deployment. Nothing in Steps 1-6 changes the meaning or content of
an existing column, so a rollback of Step 7 doesn't require a corresponding
DB rollback.

---

## Open questions before implementation starts

1. **Exact device model seed list** — the brief gives representative
   examples (Galaxy S24 Ultra, iPhone 15 Pro Max, etc.) but not an
   exhaustive list. I'd rather get this list confirmed than guess at every
   regional variant and model-year gap.
2. **Existing category slug remapping** — do the current `phone-covers`,
   `chargers-cables`, `mobile-accessories` slugs get retired in favour of
   the new tree (with the old URLs redirecting), or do they become aliases/
   subcategories that keep working as-is? Affects whether any existing
   bookmarked/shared category links break.
3. **`category_attribute_schema` config** (§6) — which attribute keys apply
   to which category is a judgment call (does "Colour" apply to Cables? to
   Adapters?) — worth a quick pass together rather than me guessing category
   by category.

Once these are settled, implementation proceeds in the step order above.
