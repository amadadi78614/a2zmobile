-- Allows the current storefront catalogue to create secure orders by SKU.
-- Prices and stock are still read and validated inside the database.

create or replace function public.create_checkout_order(
  p_items jsonb,
  p_contact jsonb,
  p_fulfilment_method public.fulfilment_method,
  p_payment_method public.payment_method,
  p_delivery_zone text default null,
  p_shipping_address jsonb default null,
  p_collection_store text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_order_id uuid;
  v_order_number text;
  v_subtotal numeric(10,2) := 0;
  v_delivery_fee numeric(10,2) := 0;
  v_total numeric(10,2);
  v_item jsonb;
  v_product public.products%rowtype;
  v_quantity integer;
  v_email text;
  v_phone text;
begin
  if v_user_id is null then raise exception 'Authentication required'; end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then raise exception 'Cart is empty'; end if;

  v_email := nullif(trim(coalesce(p_contact ->> 'email', '')), '');
  v_phone := nullif(trim(coalesce(p_contact ->> 'phone', '')), '');
  if v_email is null or v_phone is null then raise exception 'Email and phone are required'; end if;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_quantity := greatest(coalesce((v_item ->> 'quantity')::integer, 0), 0);
    if v_quantity < 1 or v_quantity > 20 then raise exception 'Invalid product quantity'; end if;

    select * into v_product
    from public.products
    where sku = trim(v_item ->> 'sku') and is_published = true
    for update;

    if not found then raise exception 'Product % is not available in the live catalogue', coalesce(v_item ->> 'sku', 'unknown'); end if;
    if (v_product.stock - v_product.reserved_stock) < v_quantity then raise exception 'Insufficient stock for %', v_product.title; end if;
    v_subtotal := v_subtotal + (v_product.price * v_quantity);
  end loop;

  if p_fulfilment_method = 'collection' then
    v_delivery_fee := 0;
    if nullif(trim(coalesce(p_collection_store, '')), '') is null then raise exception 'Collection store is required'; end if;
  else
    if p_shipping_address is null then raise exception 'Delivery address is required'; end if;
    case lower(coalesce(p_delivery_zone, 'national'))
      when 'local' then v_delivery_fee := 75;
      when 'national' then v_delivery_fee := 120;
      else raise exception 'Invalid delivery zone';
    end case;
  end if;

  v_total := v_subtotal + v_delivery_fee;
  v_order_number := 'A2Z-' || nextval('public.order_number_seq')::text;

  insert into public.orders (
    order_number, customer_id, guest_email, guest_phone, status,
    fulfilment_method, payment_method, shipping_address, collection_store,
    subtotal, delivery_fee, discount_total, total
  ) values (
    v_order_number, v_user_id, v_email, v_phone, 'pending',
    p_fulfilment_method, p_payment_method,
    case when p_fulfilment_method = 'delivery' then p_shipping_address else null end,
    case when p_fulfilment_method = 'collection' then p_collection_store else null end,
    v_subtotal, v_delivery_fee, 0, v_total
  ) returning id into v_order_id;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_quantity := (v_item ->> 'quantity')::integer;
    select * into v_product from public.products where sku = trim(v_item ->> 'sku') for update;

    insert into public.order_items (order_id, product_id, title, sku, unit_price, quantity, colorway)
    values (v_order_id, v_product.id, v_product.title, v_product.sku, v_product.price, v_quantity, nullif(v_item ->> 'colorway', ''));

    update public.products
    set reserved_stock = reserved_stock + v_quantity, updated_at = now()
    where id = v_product.id;
  end loop;

  insert into public.order_status_history (order_id, status, note)
  values (v_order_id, 'pending', 'Order created; awaiting payment');

  return jsonb_build_object(
    'id', v_order_id,
    'order_number', v_order_number,
    'subtotal', v_subtotal,
    'delivery_fee', v_delivery_fee,
    'total', v_total,
    'payment_method', p_payment_method
  );
end;
$$;

revoke all on function public.create_checkout_order(jsonb, jsonb, public.fulfilment_method, public.payment_method, text, jsonb, text) from public;
grant execute on function public.create_checkout_order(jsonb, jsonb, public.fulfilment_method, public.payment_method, text, jsonb, text) to authenticated;
