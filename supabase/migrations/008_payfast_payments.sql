-- 008_payfast_payments.sql
-- Completes the PayFast payment lifecycle: a dedicated payments table for audit/idempotency,
-- an explicit payment_status on orders (kept separate from the fulfilment `status` enum per
-- instruction — orders.status still means "where is this order in fulfilment", payment_status
-- means "what has the payment gateway told us"), and one atomic function that the ITN route
-- calls to do everything (lock, idempotency check, payment record, stock finalisation, order
-- update, status history) in a single transaction.
--
-- Idempotent: safe to run more than once. Does not modify any prior migration.

-- ---------- payment_status (separate from fulfilment order_status) ----------

do $$
begin
  if not exists (select 1 from pg_type where typname = 'payment_status') then
    create type public.payment_status as enum ('pending', 'complete', 'failed');
  end if;
end $$;

alter table public.orders
  add column if not exists payment_status public.payment_status not null default 'pending';

-- ---------- payments table ----------

create table if not exists public.payments (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null default 'payfast',
  -- PayFast's own transaction id (pf_payment_id). Nullable only because a handful of legitimate
  -- edge cases (e.g. a rejected/malformed request we still want to log) may not have one — but
  -- the ITN route itself never calls the finalisation function without a validated reference.
  provider_reference text,
  merchant_payment_id text not null,        -- our order_number, for human cross-reference
  amount numeric(10,2) not null,
  currency text not null default 'ZAR',
  status text not null,                     -- 'complete' | 'failed' | 'duplicate'
  -- Allow-listed fields only (payment_status, amount_gross, pf_payment_id, merchant_id) — never
  -- the full raw ITN body. Built in application code before this row is ever inserted; see
  -- buildAuditPayload() in src/lib/payfast/signature.ts. Never contains signature, customer name,
  -- or email.
  raw_payload jsonb,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Hard DB-level protections (requirement 5) — these hold even if application logic has a bug.

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'payments_provider_reference_unique'
  ) then
    alter table public.payments
      add constraint payments_provider_reference_unique unique (provider, provider_reference);
  end if;
end $$;

-- At most one COMPLETE payment per order+provider — the real backstop against double-crediting
-- an order even if a code path somehow tried to insert a second 'complete' row.
create unique index if not exists idx_payments_one_complete_per_order_provider
  on public.payments (order_id, provider)
  where status = 'complete';

create index if not exists idx_payments_order on public.payments(order_id);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'chk_products_stock_nonneg') then
    alter table public.products add constraint chk_products_stock_nonneg check (stock >= 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'chk_products_reserved_stock_nonneg') then
    alter table public.products add constraint chk_products_reserved_stock_nonneg check (reserved_stock >= 0);
  end if;
end $$;

-- payments is service-role only — no anon/authenticated access at all. The confirmation page
-- reads orders.payment_status / orders.status (already covered by the existing "orders read own
-- orders" RLS policy), never the payments table directly.
alter table public.payments enable row level security;
revoke all on public.payments from anon, authenticated;

-- ---------- Atomic finalisation function ----------
-- Called once by the ITN route, ONLY after signature + merchant ID + amount + order-identity +
-- PayFast server-to-server validation have all already passed in application code. This function
-- does not re-verify any of that — it trusts the caller has already done so, and its own job is
-- purely the atomic, idempotent state transition.

create or replace function public.process_verified_payfast_itn(
  p_order_id uuid,
  p_provider_reference text,
  p_payfast_payment_status text,   -- raw PayFast value, e.g. 'COMPLETE' | 'FAILED'
  p_amount numeric,
  p_raw_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_item record;
  v_existing_payment_id uuid;
  v_is_complete boolean := upper(p_payfast_payment_status) = 'COMPLETE';
begin
  if p_provider_reference is null or length(trim(p_provider_reference)) = 0 then
    raise exception 'MISSING_PROVIDER_REFERENCE';
  end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'ORDER_NOT_FOUND';
  end if;

  -- Idempotency guard #1: this exact PayFast transaction has already been recorded (PayFast
  -- retries ITN delivery when it doesn't get a fast 200 — this is the expected, safe path for
  -- a retried notification).
  select id into v_existing_payment_id
  from public.payments
  where provider = 'payfast' and provider_reference = p_provider_reference;

  if v_existing_payment_id is not null then
    return jsonb_build_object('result', 'duplicate_notification', 'order_id', v_order.id);
  end if;

  -- Idempotency guard #2: this order is already marked paid (defends against a *different*
  -- provider_reference somehow arriving for an order already completed — should not happen with
  -- a well-behaved PayFast, but the unique partial index above would reject the insert anyway;
  -- this check lets us respond cleanly instead of raising a raw constraint-violation error).
  if v_order.payment_status = 'complete' then
    insert into public.payments (order_id, provider, provider_reference, merchant_payment_id, amount, currency, status, raw_payload, verified_at)
    values (v_order.id, 'payfast', p_provider_reference, v_order.order_number, p_amount, 'ZAR', 'duplicate', p_raw_payload, now());
    return jsonb_build_object('result', 'already_paid', 'order_id', v_order.id);
  end if;

  -- Guard against finalising an order that's no longer in a payable fulfilment state (e.g. an
  -- admin already cancelled/refunded it before the ITN arrived). Money may genuinely have
  -- arrived for a cancelled order — that's a real anomaly needing a human, not something to
  -- silently paper over by flipping it back to 'paid'.
  if v_is_complete and v_order.status in ('cancelled', 'refunded') then
    insert into public.payments (order_id, provider, provider_reference, merchant_payment_id, amount, currency, status, raw_payload, verified_at)
    values (v_order.id, 'payfast', p_provider_reference, v_order.order_number, p_amount, 'ZAR', 'complete', p_raw_payload, now());
    insert into public.order_status_history (order_id, status, note)
    values (v_order.id, v_order.status, 'PayFast reported COMPLETE for an order already ' || v_order.status || ' — payment recorded but NOT auto-finalised. Needs manual review.');
    return jsonb_build_object('result', 'order_not_payable', 'order_id', v_order.id, 'order_status', v_order.status);
  end if;

  if v_is_complete then
    insert into public.payments (order_id, provider, provider_reference, merchant_payment_id, amount, currency, status, raw_payload, verified_at)
    values (v_order.id, 'payfast', p_provider_reference, v_order.order_number, p_amount, 'ZAR', 'complete', p_raw_payload, now());

    -- Finalise stock for every item on this order, exactly once (guarded by the payment_status
    -- checks above — this branch is only reached when the order was not already 'complete').
    -- greatest(..., 0) is a defensive floor; the check constraints above are the real backstop.
    for v_item in select product_id, quantity from public.order_items where order_id = v_order.id
    loop
      update public.products
      set stock = greatest(stock - v_item.quantity, 0),
          reserved_stock = greatest(reserved_stock - v_item.quantity, 0),
          updated_at = now()
      where id = v_item.product_id;
    end loop;

    update public.orders
    set payment_status = 'complete',
        status = 'paid',
        payment_reference = p_provider_reference,
        updated_at = now()
    where id = v_order.id;

    insert into public.order_status_history (order_id, status, note)
    values (v_order.id, 'paid', 'Payment verified via PayFast ITN (ref: ' || p_provider_reference || ')');

    return jsonb_build_object('result', 'paid', 'order_id', v_order.id);
  else
    -- A legitimately verified ITN (signature/merchant/amount all checked out in application
    -- code), but PayFast itself reports a non-COMPLETE outcome. Record it; do not touch stock or
    -- fulfilment status — only the payment_status reflects the failure.
    insert into public.payments (order_id, provider, provider_reference, merchant_payment_id, amount, currency, status, raw_payload, verified_at)
    values (v_order.id, 'payfast', p_provider_reference, v_order.order_number, p_amount, 'ZAR', lower(p_payfast_payment_status), p_raw_payload, now());

    update public.orders
    set payment_status = 'failed',
        updated_at = now()
    where id = v_order.id;

    insert into public.order_status_history (order_id, status, note)
    values (v_order.id, v_order.status, 'PayFast reported payment status: ' || p_payfast_payment_status || ' (ref: ' || p_provider_reference || ')');

    return jsonb_build_object('result', 'failed', 'order_id', v_order.id);
  end if;
end;
$$;

-- Only the service role calls this (via the ITN route's service-role client) — never exposed to
-- anon/authenticated, since it bypasses every normal order-ownership check by design.
revoke all on function public.process_verified_payfast_itn(uuid, text, text, numeric, jsonb) from public, anon, authenticated;
