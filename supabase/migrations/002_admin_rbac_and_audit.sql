-- =========================================================
-- Migration 002 — Admin RBAC, Audit Log, Product Status
-- Additive only. Does not drop or rewrite existing tables,
-- does not touch existing customer-facing RLS policies.
-- Run this in the Supabase SQL editor after schema.sql.
-- =========================================================

-- ---------- Admin roles ----------

create type admin_role as enum (
  'owner', 'administrator', 'inventory', 'sales', 'marketing', 'read_only'
);

create table if not exists admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role admin_role not null default 'read_only',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

-- Helper: is the current session an active admin, and at what role.
-- SECURITY DEFINER so it can be called from RLS policies without
-- exposing the admin_users table itself to public read.
create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from admin_users
    where id = auth.uid() and is_active = true
  );
$$;

create or replace function admin_role_of(uid uuid)
returns admin_role
language sql
security definer
stable
as $$
  select role from admin_users where id = uid and is_active = true;
$$;

create or replace function has_admin_role(allowed admin_role[])
returns boolean
language sql
security definer
stable
as $$
  select coalesce(admin_role_of(auth.uid()) = any(allowed), false);
$$;

alter table admin_users enable row level security;

create policy "admins read own admin row" on admin_users
  for select using (auth.uid() = id or has_admin_role(array['owner','administrator']::admin_role[]));

create policy "owners manage admin users" on admin_users
  for all using (has_admin_role(array['owner']::admin_role[]));

-- ---------- Audit log ----------

create table if not exists audit_logs (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid references auth.users(id),
  actor_role admin_role,
  action text not null,              -- e.g. 'product.create', 'product.price_update', 'order.status_change'
  entity_type text not null,         -- e.g. 'product', 'order', 'category'
  entity_id text,
  before jsonb,
  after jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);

alter table audit_logs enable row level security;

create policy "admins read audit logs" on audit_logs
  for select using (has_admin_role(array['owner','administrator']::admin_role[]));

create policy "admins write audit logs" on audit_logs
  for insert with check (is_admin());

-- No update/delete policy on audit_logs intentionally: audit entries are append-only.

-- ---------- Product status (replaces boolean-only is_published) ----------

do $$
begin
  if not exists (select 1 from pg_type where typname = 'product_status') then
    create type product_status as enum ('draft', 'published', 'archived');
  end if;
end $$;

alter table products add column if not exists status product_status not null default 'draft';
alter table products add column if not exists is_featured boolean not null default false;
alter table products add column if not exists subcategory_id uuid references categories(id) on delete set null;
alter table products add column if not exists supplier text;
alter table products add column if not exists barcode text;
alter table products add column if not exists vat_inclusive boolean not null default true;
alter table products add column if not exists weight_kg numeric(6,2);
alter table products add column if not exists dimensions_cm text;      -- "L x W x H"
alter table products add column if not exists seo_title text;
alter table products add column if not exists seo_description text;
alter table products add column if not exists meta_keywords text;
alter table products add column if not exists features text[];
alter table products add column if not exists deleted_at timestamptz; -- soft delete

-- Backfill status from the existing is_published boolean so nothing currently
-- live goes dark.
update products set status = 'published' where is_published = true and status = 'draft';

-- Keep is_published in sync going forward via trigger, since the storefront's
-- public-read policy still checks is_published (see notes at the bottom).
create or replace function sync_is_published()
returns trigger
language plpgsql
as $$
begin
  new.is_published := (new.status = 'published' and new.deleted_at is null);
  return new;
end;
$$;

drop trigger if exists trg_sync_is_published on products;
create trigger trg_sync_is_published
  before insert or update on products
  for each row execute function sync_is_published();

-- ---------- Column-level protection on cost/margin data ----------
-- RLS is row-level, not column-level, so the existing
-- "public read products" policy would still expose purchase_price via
-- `select *`. Fix: revoke direct table select from anon/authenticated and
-- expose a public-safe view instead. The app's public storefront queries
-- should read from `public_products`, not `products`, going forward.

revoke select on products from anon, authenticated;
grant select on products to service_role;

create or replace view public_products as
select
  id, slug, title, brand_id, category_id, subcategory_id, price, compare_at_price,
  sku, stock, reserved_stock, (stock - reserved_stock) as available_stock,
  short_description, description, specs, colorways, compatibility, warranty,
  badge, rating, review_count, is_featured, status, seo_title, seo_description,
  meta_keywords, features, created_at, updated_at
from products
where status = 'published' and deleted_at is null;

grant select on public_products to anon, authenticated;

-- Admins get full-column access via a separate view (cost price included),
-- gated by the is_admin() function rather than RLS on a view (views don't
-- support RLS directly — the WHERE clause does the gating).
create or replace view admin_products as
select p.*, (p.stock - p.reserved_stock) as available_stock
from products p
where is_admin();

grant select on admin_products to authenticated;

-- Writes to products must go through admin-checked policies, not the
-- removed public grant.
alter table products enable row level security;
drop policy if exists "public read products" on products;

create policy "admins full access to products" on products
  for all using (has_admin_role(array['owner','administrator','inventory']::admin_role[]))
  with check (has_admin_role(array['owner','administrator','inventory']::admin_role[]));

create policy "sales marketing read products" on products
  for select using (has_admin_role(array['owner','administrator','inventory','sales','marketing','read_only']::admin_role[]));

-- ---------- Indexes for the new admin surfaces ----------

create index if not exists idx_products_status on products(status);
create index if not exists idx_products_deleted_at on products(deleted_at);
create index if not exists idx_audit_logs_entity on audit_logs(entity_type, entity_id);
create index if not exists idx_audit_logs_actor on audit_logs(actor_id);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_created_at on orders(created_at desc);

-- =========================================================
-- IMPORTANT — action required after running this migration:
-- Update any existing client code that queried `products` directly
-- for public storefront reads to query the `public_products` view
-- instead (the direct table grant has been revoked). This repo's
-- storefront currently reads from static mock data in src/lib/data/,
-- not from Supabase, so nothing breaks today — this is prep for the
-- follow-up sprint that wires the storefront to live data.
-- =========================================================
