-- =========================================================
-- A2Z Mobile & Computer Services — Supabase Schema
-- Phase 3: customers, addresses, orders, payments
-- Phase 1/2 catalog tables included so the whole schema
-- can be applied in one pass once you're ready to move off
-- the mock data in src/lib/data/.
-- =========================================================

create extension if not exists "uuid-ossp";

-- ---------- Catalog ----------

create table if not exists brands (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  logo_url text,
  created_at timestamptz not null default now()
);

create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  image_url text,
  parent_id uuid references categories(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  brand_id uuid references brands(id) on delete set null,
  category_id uuid references categories(id) on delete set null,
  price numeric(10,2) not null,
  compare_at_price numeric(10,2),
  sku text unique not null,
  stock int not null default 0,
  reserved_stock int not null default 0,
  short_description text,
  description text,
  specs jsonb default '[]'::jsonb,          -- [{label, value}]
  colorways text[],
  compatibility text[],
  warranty text,
  badge text,                                -- New | Sale | Best Seller | Low Stock
  rating numeric(2,1) default 0,
  review_count int default 0,
  purchase_price numeric(10,2),              -- cost price, admin-only (RLS restricted)
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade,
  url text not null,
  position int not null default 0,
  is_primary boolean not null default false
);

-- ---------- Customers ----------
-- Extends Supabase Auth's auth.users with commerce-specific profile data.

create table if not exists customers (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  marketing_opt_in boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists addresses (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references customers(id) on delete cascade,
  label text,                                 -- e.g. "Home", "Work"
  recipient_name text not null,
  phone text not null,
  line1 text not null,
  line2 text,
  suburb text,
  city text not null,
  province text not null,
  postal_code text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- Orders ----------

create type order_status as enum (
  'pending', 'paid', 'packed', 'collected', 'shipped', 'delivered', 'cancelled', 'refunded'
);

create type fulfilment_method as enum ('delivery', 'collection');
create type payment_method as enum ('payfast', 'ozow', 'eft');

create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text unique not null,          -- human-readable, e.g. A2Z-100234
  customer_id uuid references customers(id) on delete set null,  -- null for guest orders
  guest_email text,
  guest_phone text,
  status order_status not null default 'pending',
  fulfilment_method fulfilment_method not null,
  payment_method payment_method not null,
  shipping_address jsonb,                     -- snapshot at time of order
  collection_store text,                      -- when fulfilment_method = 'collection'
  subtotal numeric(10,2) not null,
  delivery_fee numeric(10,2) not null default 0,
  discount_total numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  coupon_code text,
  payment_reference text,                     -- PayFast/Ozow transaction id
  tracking_number text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  title text not null,                        -- snapshot
  sku text not null,                          -- snapshot
  unit_price numeric(10,2) not null,          -- snapshot
  quantity int not null,
  colorway text
);

create table if not exists order_status_history (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  status order_status not null,
  note text,
  created_at timestamptz not null default now()
);

-- ---------- Wishlist (server-persisted, mirrors client Zustand store) ----------

create table if not exists wishlist_items (
  customer_id uuid references customers(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (customer_id, product_id)
);

-- ---------- Returns ----------

create type return_status as enum ('requested', 'approved', 'rejected', 'refunded');

create table if not exists returns (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  order_item_id uuid references order_items(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null,
  reason text not null,
  status return_status not null default 'requested',
  created_at timestamptz not null default now()
);

-- =========================================================
-- Row Level Security
-- =========================================================

alter table customers enable row level security;
alter table addresses enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table wishlist_items enable row level security;
alter table returns enable row level security;

create policy "customers read own row" on customers
  for select using (auth.uid() = id);
create policy "customers update own row" on customers
  for update using (auth.uid() = id);

create policy "addresses owned by customer" on addresses
  for all using (auth.uid() = customer_id);

create policy "orders read own orders" on orders
  for select using (auth.uid() = customer_id);
create policy "orders insert own orders" on orders
  for insert with check (auth.uid() = customer_id or customer_id is null);

create policy "order items follow parent order" on order_items
  for select using (
    exists (select 1 from orders o where o.id = order_id and o.customer_id = auth.uid())
  );

create policy "wishlist owned by customer" on wishlist_items
  for all using (auth.uid() = customer_id);

create policy "returns owned by customer" on returns
  for all using (auth.uid() = customer_id);

-- Catalog tables are public read, writes restricted to service role (admin dashboard, Phase 4).
alter table products enable row level security;
alter table categories enable row level security;
alter table brands enable row level security;

create policy "public read products" on products for select using (is_published = true);
create policy "public read categories" on categories for select using (true);
create policy "public read brands" on brands for select using (true);

-- =========================================================
-- Helpful indexes
-- =========================================================

create index if not exists idx_products_category on products(category_id);
create index if not exists idx_products_brand on products(brand_id);
create index if not exists idx_orders_customer on orders(customer_id);
create index if not exists idx_order_items_order on order_items(order_id);
