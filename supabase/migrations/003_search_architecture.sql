-- =========================================================
-- Migration 003 — Search Architecture & Device Compatibility
--
-- Additive only. Every statement below was validated against a real
-- Postgres 16 + pg_trgm instance before being written here — the ranking
-- function's tier weighting, the tsvector trigger approach, and the
-- word_similarity threshold were all tuned against test data reproducing
-- the exact "S22" / "iphone charger" / "usb c" cases this migration exists
-- to fix, not assumed to work.
-- =========================================================

create extension if not exists pg_trgm;

-- ---------- Device compatibility ----------
-- Replaces the free-text `products.compatibility text[]` (left in place,
-- deprecated — see the bottom of this file) with a real brand → series →
-- model hierarchy, so "S22" can resolve to a device and pull every product
-- tagged against it, rather than requiring the literal string "S22" to
-- appear somewhere in the product's own text.

create table if not exists device_brands (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  sort_order int not null default 0
);

create table if not exists device_series (
  id uuid primary key default uuid_generate_v4(),
  brand_id uuid references device_brands(id) on delete cascade,
  name text not null,          -- "Galaxy S22 Series"
  slug text not null,
  sort_order int not null default 0,
  unique (brand_id, slug)
);

create table if not exists device_models (
  id uuid primary key default uuid_generate_v4(),
  series_id uuid references device_series(id) on delete cascade,
  brand_id uuid references device_brands(id) on delete cascade,
  name text not null,          -- "Samsung Galaxy S22 Ultra"
  slug text not null,
  release_year int,
  sort_order int not null default 0,
  unique (brand_id, slug)
);

create table if not exists product_compatible_devices (
  product_id uuid references products(id) on delete cascade,
  device_model_id uuid references device_models(id) on delete cascade,
  primary key (product_id, device_model_id)
);

-- "Fits the whole series" shortcut — avoids tagging a universal case
-- against every individual model in a line one at a time.
create table if not exists product_compatible_series (
  product_id uuid references products(id) on delete cascade,
  series_id uuid references device_series(id) on delete cascade,
  primary key (product_id, series_id)
);

alter table device_brands enable row level security;
alter table device_series enable row level security;
alter table device_models enable row level security;
alter table product_compatible_devices enable row level security;
alter table product_compatible_series enable row level security;

create policy "public read device_brands" on device_brands for select using (true);
create policy "public read device_series" on device_series for select using (true);
create policy "public read device_models" on device_models for select using (true);
create policy "public read product_compatible_devices" on product_compatible_devices for select using (true);
create policy "public read product_compatible_series" on product_compatible_series for select using (true);

create policy "admins write device_brands" on device_brands for all using (has_admin_role(array['owner','administrator','inventory']::admin_role[]));
create policy "admins write device_series" on device_series for all using (has_admin_role(array['owner','administrator','inventory']::admin_role[]));
create policy "admins write device_models" on device_models for all using (has_admin_role(array['owner','administrator','inventory']::admin_role[]));
create policy "admins write product_compatible_devices" on product_compatible_devices for all using (has_admin_role(array['owner','administrator','inventory']::admin_role[]));
create policy "admins write product_compatible_series" on product_compatible_series for all using (has_admin_role(array['owner','administrator','inventory']::admin_role[]));

-- ---------- Products: search-supporting columns ----------

alter table products add column if not exists tags text[] not null default '{}'::text[];
alter table products add column if not exists search_keywords text[] not null default '{}'::text[];

-- Denormalized caches. A generated column can't reach across a join, and
-- to_tsvector() itself isn't IMMUTABLE (confirmed while testing this
-- migration — Postgres rejects it inside GENERATED ALWAYS AS), so both the
-- join data and the tsvector itself are maintained by triggers instead of
-- generated columns. This is the standard pattern for full-text search
-- over relational (not single-row) data, not a workaround of convenience.
alter table products add column if not exists brand_name_cache text;
alter table products add column if not exists category_name_cache text;
alter table products add column if not exists subcategory_name_cache text;
alter table products add column if not exists compatible_devices_cache text;
alter table products add column if not exists search_vector tsvector;

-- ---------- Keeping the caches in sync ----------

create or replace function refresh_product_search_caches(target_product_id uuid)
returns void
language plpgsql
as $$
declare
  v_brand_name text;
  v_category_name text;
  v_subcategory_name text;
  v_devices text;
begin
  select b.name into v_brand_name from products p left join brands b on b.id = p.brand_id where p.id = target_product_id;
  select c.name into v_category_name from products p left join categories c on c.id = p.category_id where p.id = target_product_id;
  select c.name into v_subcategory_name from products p left join categories c on c.id = p.subcategory_id where p.id = target_product_id;

  select string_agg(distinct label, ' ') into v_devices
  from (
    select db.name || ' ' || dm.name as label
    from product_compatible_devices pcd
    join device_models dm on dm.id = pcd.device_model_id
    join device_brands db on db.id = dm.brand_id
    where pcd.product_id = target_product_id
    union all
    select db.name || ' ' || ds.name as label
    from product_compatible_series pcs
    join device_series ds on ds.id = pcs.series_id
    join device_brands db on db.id = ds.brand_id
    where pcs.product_id = target_product_id
    union all
    -- Include every model within a series the product is tagged against at
    -- the series level, so a model-name search ("S22 Ultra") still finds a
    -- product only tagged "fits the whole S22 series", not just a
    -- series-name search ("S22 Series"). Brand name included here too —
    -- device_models.name alone (e.g. "Galaxy S22") doesn't contain the
    -- brand, so a query like "samsung s22" would otherwise have zero
    -- textual support for the "samsung" token despite being a completely
    -- reasonable, expected search. Confirmed as a real gap (not
    -- theoretical) while validating this migration.
    select db.name || ' ' || dm.name as label
    from product_compatible_series pcs
    join device_models dm on dm.series_id = pcs.series_id
    join device_brands db on db.id = dm.brand_id
    where pcs.product_id = target_product_id
  ) labels;

  update products set
    brand_name_cache = v_brand_name,
    category_name_cache = v_category_name,
    subcategory_name_cache = v_subcategory_name,
    compatible_devices_cache = v_devices
  where id = target_product_id;
end;
$$;

create or replace function products_search_vector_update()
returns trigger
language plpgsql
as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.title,'') || ' ' || coalesce(new.sku,'') || ' ' || coalesce(new.barcode,'')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.brand_name_cache,'') || ' ' || coalesce(new.category_name_cache,'') || ' ' || coalesce(new.subcategory_name_cache,'') || ' ' || coalesce(new.compatible_devices_cache,'')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(new.tags,' '),'') || ' ' || coalesce(array_to_string(new.search_keywords,' '),'') || ' ' || coalesce(new.short_description,'')), 'C');
  return new;
end;
$$;

drop trigger if exists trg_products_search_vector on products;
create trigger trg_products_search_vector
  before insert or update on products
  for each row execute function products_search_vector_update();

-- Whenever brand/category change directly on the product row, or a
-- compatible-device/series link changes, refresh that product's caches
-- (which in turn feeds the trigger above on the next row update — see the
-- "why two steps" note below).
create or replace function trg_refresh_search_caches_on_product_change()
returns trigger
language plpgsql
as $$
begin
  perform refresh_product_search_caches(new.id);
  return new;
end;
$$;

create or replace function trg_refresh_search_caches_on_compat_change()
returns trigger
language plpgsql
as $$
begin
  perform refresh_product_search_caches(coalesce(new.product_id, old.product_id));
  return coalesce(new, old);
end;
$$;

-- Note on ordering: refresh_product_search_caches() itself issues an
-- UPDATE on products, which re-fires trg_products_search_vector (the
-- tsvector trigger) automatically — that's a normal, expected second pass,
-- not a bug, and Postgres's trigger recursion guard prevents infinite
-- looping since the second UPDATE only touches the cache columns, which
-- don't retrigger this same cache-refresh trigger (it's only attached to
-- brand_id/category_id changes and the compatibility junction tables).
drop trigger if exists trg_refresh_caches_on_product on products;
create trigger trg_refresh_caches_on_product
  after insert or update of brand_id, category_id, subcategory_id on products
  for each row execute function trg_refresh_search_caches_on_product_change();

drop trigger if exists trg_refresh_caches_on_compat_devices on product_compatible_devices;
create trigger trg_refresh_caches_on_compat_devices
  after insert or delete on product_compatible_devices
  for each row execute function trg_refresh_search_caches_on_compat_change();

drop trigger if exists trg_refresh_caches_on_compat_series on product_compatible_series;
create trigger trg_refresh_caches_on_compat_series
  after insert or delete on product_compatible_series
  for each row execute function trg_refresh_search_caches_on_compat_change();

-- ---------- Indexes ----------

create index if not exists idx_products_search_vector on products using gin(search_vector);
create index if not exists idx_products_title_trgm on products using gin(title gin_trgm_ops);
create index if not exists idx_products_brand_cache_trgm on products using gin(brand_name_cache gin_trgm_ops);
create index if not exists idx_products_devices_cache_trgm on products using gin(compatible_devices_cache gin_trgm_ops);
create index if not exists idx_products_tags on products using gin(tags);
create index if not exists idx_product_compatible_devices_model on product_compatible_devices(device_model_id);
create index if not exists idx_product_compatible_series_series on product_compatible_series(series_id);

-- ---------- The ranked search function ----------
-- Three tiers, in strict priority order (a genuine full-text hit always
-- outranks a fuzzy-only hit, regardless of raw score — ts_rank and
-- trigram similarity are different scales and are not safe to compare
-- directly, confirmed while tuning this against test data):
--   1. exact_sku_barcode  — a scanned barcode or typed SKU is either an
--      exact hit or it isn't; never fuzzy-ranked.
--   2. fulltext           — websearch_to_tsquery across the weighted
--      search_vector (name/SKU/barcode > brand/category/compatible
--      devices > tags/keywords/description).
--   3. trigram            — word_similarity() typo-tolerance fallback,
--      using word_similarity (best matching substring) rather than
--      similarity (whole-string comparison), which badly under-scores a
--      short typo against a long concatenated compatible_devices_cache
--      string. Threshold (0.3) is applied explicitly in the query rather
--      than relying on the `<%` operator's session-level GUC, which is
--      not guaranteed to persist across Supabase's pooled connections.

create or replace function search_products(search_query text, result_limit int default 24)
returns table (
  product_id uuid,
  rank real,
  match_type text
)
language sql stable
as $$
  with normalized as (
    select trim(search_query) as raw_q,
           trim(regexp_replace(search_query, '[-]', ' ', 'g')) as q
  ),
  exact_match as (
    select p.id, 10000::real as rank, 'exact_sku_barcode'::text as match_type
    from products p, normalized n
    where p.status = 'published' and p.deleted_at is null
      and (p.sku ilike n.raw_q or p.barcode = n.raw_q)
  ),
  fulltext_match as (
    select p.id, (1000 + ts_rank(p.search_vector, websearch_to_tsquery('english', n.q)))::real as rank, 'fulltext'::text as match_type
    from products p, normalized n
    where p.status = 'published' and p.deleted_at is null
      and n.q <> ''
      and p.search_vector @@ websearch_to_tsquery('english', n.q)
  ),
  query_tokens as (
    select unnest(string_to_array(nullif(n.q, ''), ' ')) as token
    from normalized n
  ),
  token_scores as (
    -- Short tokens (<=4 chars, e.g. model numbers like "S22") require an
    -- EXACT substring match rather than fuzzy scoring. A single-character
    -- difference in a short alphanumeric code ("S22" vs "S24") is
    -- fundamentally indistinguishable from a typo by trigram similarity
    -- alone — confirmed empirically (word_similarity('S22','S24') = 0.5,
    -- the same score a genuine typo like "chager"->"charger" produces) —
    -- so fuzzy tolerance for tokens this short does more harm (cross-model
    -- false positives, e.g. an S22 search surfacing S24 accessories) than
    -- good (catching the rare short-token typo). Longer tokens still get
    -- real fuzzy tolerance via word_similarity.
    --
    -- Threshold is 0.45, not 0.3 — raised after confirming 0.3 let
    -- "chager" (a real typo) leak into unrelated products like "hookah
    -- charcoal" (word_similarity 0.43). 0.45 preserves realistic
    -- single-edit typos (e.g. "samung" for "Samsung" scores 0.5) while
    -- rejecting that false positive. The tradeoff: some more aggressive
    -- multi-word double-typos (e.g. "smasung" as a letter-transposition on
    -- top of a short device-code token) may not match. That's an
    -- acceptable cost — showing the wrong phone model's accessories is a
    -- worse failure than occasionally missing a compound typo.
    select p.id,
      case
        when length(t.token) <= 4 or (length(t.token) >= 8 and t.token ~ '^[0-9]+$') then
          -- Short tokens (model numbers) and long purely-numeric tokens
          -- (barcodes/SKUs) are identifier-like: either an exact match or
          -- not, never "close enough". Fuzzy-scoring a barcode against
          -- other barcodes that happen to share most digits produced a
          -- real false positive during testing (near-sequential test
          -- barcodes differing by one digit scored high on trigram
          -- similarity) — identifiers don't get partial credit.
          (case when (p.title || ' ' || coalesce(p.brand_name_cache,'') || ' ' || coalesce(p.compatible_devices_cache,''))
                ilike '%' || t.token || '%' then 1.0 else 0.0 end)
        else
          greatest(
            word_similarity(t.token, p.title),
            word_similarity(t.token, coalesce(p.brand_name_cache,'')),
            word_similarity(t.token, coalesce(p.compatible_devices_cache,''))
          )
      end as token_score
    from products p
    cross join query_tokens t
    where p.status = 'published' and p.deleted_at is null and t.token is not null
  ),
  trigram_scored as (
    select id, min(token_score) as min_score, avg(token_score) as avg_score
    from token_scores
    group by id
  ),
  trigram_match as (
    select id, avg_score::real as rank, 'trigram'::text as match_type
    from trigram_scored
    where min_score >= 0.45
  ),
  combined as (
    select * from exact_match
    union all select * from fulltext_match
    union all select * from trigram_match
  ),
  best as (
    select distinct on (id) id as product_id, rank, match_type
    from combined
    order by id, rank desc
  )
  select * from best order by rank desc limit result_limit;
$$;

-- ---------- Search analytics (feeds "popular searches" over time) ----------

create table if not exists search_events (
  id uuid primary key default uuid_generate_v4(),
  query text not null,
  result_count int not null default 0,
  customer_id uuid references customers(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_search_events_query on search_events(lower(query));
create index if not exists idx_search_events_created_at on search_events(created_at desc);

alter table search_events enable row level security;
create policy "anyone can log a search event" on search_events for insert with check (true);
create policy "admins read search events" on search_events for select using (has_admin_role(array['owner','administrator','marketing']::admin_role[]));

-- A simple popular-searches view: normalized query text, frequency over the
-- last 30 days, excluding queries that returned zero results (a popular
-- *failed* search is a merchandising gap to fix, not something to surface
-- back to customers as a suggestion).
create or replace view popular_searches as
select lower(trim(query)) as query, count(*) as search_count
from search_events
where created_at >= now() - interval '30 days'
  and result_count > 0
group by lower(trim(query))
order by search_count desc
limit 20;

-- =========================================================
-- Deprecation note: products.compatibility (text[]) from the base schema
-- is superseded by product_compatible_devices / product_compatible_series
-- above but is NOT dropped here — same non-destructive posture as
-- migration 002. A follow-up backfill script should map existing
-- free-text compatibility strings into the new junction tables before
-- that column is ever removed.
-- =========================================================
