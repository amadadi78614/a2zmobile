"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, CheckCircle2, CreditCard, Store, Truck, AlertCircle } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { products } from "@/lib/data/products";
import { createClient } from "@/lib/supabase/client";
import { cn, formatZAR } from "@/lib/utils";

type Step = "details" | "fulfilment" | "payment" | "review";
type PaymentMethod = "payfast" | "eft";
type DeliveryZone = "local" | "national";

type CreatedOrder = {
  id: string;
  order_number: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_method: PaymentMethod;
};

const steps: { key: Step; label: string }[] = [
  { key: "details", label: "Contact" },
  { key: "fulfilment", label: "Delivery" },
  { key: "payment", label: "Payment" },
  { key: "review", label: "Review" },
];

const collectionStore = "A2Z Mobile – Store Collection";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // PayFast's cancel_url lands here with ?payment=cancelled. This is purely informational — it
  // does not write anything to the order. Stock was reserved at order-creation time and is only
  // ever released or finalised by verified server-side logic (the PayFast ITN handler), never by
  // a customer's browser landing on this URL. If they actually completed payment via another tab
  // despite cancelling here, that will still be reflected correctly on /account/orders.
  const paymentCancelled = searchParams.get("payment") === "cancelled";
  const lines = useCartStore((state) => state.lines);
  const clearCart = useCartStore((state) => state.clear);
  const [step, setStep] = useState<Step>("details");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
  const [fulfilment, setFulfilment] = useState<"delivery" | "collection">("delivery");
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone>("local");
  const [address, setAddress] = useState({ line1: "", line2: "", suburb: "", city: "Mbombela", province: "Mpumalanga", postalCode: "" });
  const [payment, setPayment] = useState<PaymentMethod>("payfast");
  // The order API always requires a signed-in user (there is no guest checkout) — that's a
  // backend decision this sprint doesn't change. What changes here is *when* the customer finds
  // out: previously it only surfaced as a 401 after filling all 4 steps. Now it's checked once,
  // upfront, before the form renders at all.
  const [authStatus, setAuthStatus] = useState<"checking" | "authed" | "guest">("checking");

  useEffect(() => {
    async function loadCustomer() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setAuthStatus("guest");
        return;
      }
      setAuthStatus("authed");

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", user.id)
        .maybeSingle();

      setContact({
        name: profile?.full_name || user.user_metadata?.full_name || "",
        email: user.email || "",
        phone: profile?.phone || "",
      });
    }
    loadCustomer();
  }, []);

  const items = useMemo(
    () => lines
      .map((line) => ({ line, product: products.find((product) => product.id === line.productId) }))
      .filter((item): item is { line: typeof lines[number]; product: (typeof products)[number] } => Boolean(item.product)),
    [lines]
  );

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.line.quantity, 0);
  const deliveryFee = fulfilment === "collection" ? 0 : deliveryZone === "local" ? 75 : 120;
  const total = subtotal + deliveryFee;
  const currentIndex = steps.findIndex((item) => item.key === step);

  function next() {
    setError(null);
    const index = steps.findIndex((item) => item.key === step);
    if (index < steps.length - 1) setStep(steps[index + 1].key);
  }

  function back() {
    setError(null);
    const index = steps.findIndex((item) => item.key === step);
    if (index > 0) setStep(steps[index - 1].key);
  }

  function submitPayFast(action: string, fields: Record<string, string>) {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = action;
    Object.entries(fields).forEach(([name, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.appendChild(input);
    });
    document.body.appendChild(form);
    form.submit();
  }

  async function placeOrder() {
    if (placing) return;
    setPlacing(true);
    setError(null);

    try {
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(({ line, product }) => ({ sku: product.sku, quantity: line.quantity, colorway: line.colorway || null })),
          contact,
          fulfilment_method: fulfilment,
          payment_method: payment,
          delivery_zone: fulfilment === "delivery" ? deliveryZone : null,
          shipping_address: fulfilment === "delivery" ? {
            line1: address.line1,
            line2: address.line2 || null,
            suburb: address.suburb || null,
            city: address.city,
            province: address.province,
            postal_code: address.postalCode,
          } : null,
          collection_store: fulfilment === "collection" ? collectionStore : null,
        }),
      });

      const orderPayload = await orderResponse.json();
      if (orderResponse.status === 401) {
        router.push("/login?next=/checkout");
        return;
      }
      if (!orderResponse.ok) throw new Error(orderPayload.error || "Order could not be created.");

      const order = orderPayload.order as CreatedOrder;

      if (payment === "payfast") {
        const paymentResponse = await fetch("/api/payfast/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: order.id }),
        });
        const paymentPayload = await paymentResponse.json();
        if (!paymentResponse.ok) throw new Error(paymentPayload.error || "PayFast could not be started.");
        clearCart();
        submitPayFast(paymentPayload.action, paymentPayload.fields);
        return;
      }

      clearCart();
      router.push(`/checkout/confirmation?order=${encodeURIComponent(order.order_number)}&payment=eft`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Checkout failed. Please try again.");
      setPlacing(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="container-content flex flex-col items-center py-24 text-center">
        <h1 className="text-2xl font-semibold">Your cart is empty</h1>
        <Link href="/shop" className="btn-primary mt-8">Continue Shopping</Link>
      </div>
    );
  }

  if (authStatus === "checking") {
    return (
      <div className="container-content flex flex-col items-center py-24 text-center">
        <div className="h-8 w-8 animate-pulse rounded-full bg-line" aria-hidden />
        <p className="mt-4 text-sm text-ink-400">Loading checkout…</p>
      </div>
    );
  }

  if (authStatus === "guest") {
    return (
      <div className="container-content py-10 md:py-14">
        <h1 className="text-2xl font-semibold sm:text-3xl">Secure Checkout</h1>
        <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="border border-line p-8">
              <h2 className="text-lg font-semibold">Sign in to continue</h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-500">
                An account is required to check out, so we can attach your order to your order
                history, delivery tracking and returns. Your cart is saved — nothing will be lost
                while you sign in or create an account.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/login?next=/checkout" className="btn-primary">Sign In</Link>
                <Link href="/register?next=/checkout" className="btn-secondary">Create Account</Link>
              </div>
            </div>
          </div>

          <aside className="h-fit border border-line p-5 lg:sticky lg:top-28">
            <h2 className="text-sm font-semibold uppercase tracking-wide">Order summary</h2>
            <div className="mt-4 flex justify-between text-sm">
              <span className="text-ink-400">Subtotal</span>
              <span className="font-medium">{formatZAR(subtotal)}</span>
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-ink-400">Delivery</span>
              <span className="font-medium">Calculated after sign in</span>
            </div>
            <p className="mt-6 text-xs text-ink-400">
              {items.length} item{items.length === 1 ? "" : "s"} waiting in your cart.
            </p>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="container-content py-10 md:py-14">
      <h1 className="text-2xl font-semibold sm:text-3xl">Secure Checkout</h1>

      {paymentCancelled && (
        <div className="mt-6 flex items-start gap-3 border border-line bg-mist px-5 py-4">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-secondary" />
          <p className="text-sm text-ink-500">
            Payment was cancelled before completing. Nothing was charged. If you believe you did
            complete payment, check{" "}
            <Link href="/account/orders" className="font-medium text-ink underline underline-offset-4">
              your order status
            </Link>{" "}
            — otherwise, feel free to try again below.
          </p>
        </div>
      )}

      <div className="mt-8 flex items-center gap-2">
        {steps.map((item, index) => (
          <div key={item.key} className="flex flex-1 items-center gap-2">
            <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium", index <= currentIndex ? "bg-ink text-paper" : "border border-line text-ink-400")}>{index + 1}</div>
            <span className={cn("hidden text-xs sm:block", index <= currentIndex ? "text-ink" : "text-ink-400")}>{item.label}</span>
            {index < steps.length - 1 && <div className={cn("h-px flex-1", index < currentIndex ? "bg-ink" : "bg-line")} />}
          </div>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {step === "details" && (
            <div className="flex flex-col gap-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide">Contact details</h2>
              <input required placeholder="Full name" value={contact.name} onChange={(event) => setContact((current) => ({ ...current, name: event.target.value }))} className="border border-line px-4 py-3 text-sm outline-none focus:border-ink" />
              <input required type="email" placeholder="Email" value={contact.email} onChange={(event) => setContact((current) => ({ ...current, email: event.target.value }))} className="border border-line px-4 py-3 text-sm outline-none focus:border-ink" />
              <input required placeholder="Phone" value={contact.phone} onChange={(event) => setContact((current) => ({ ...current, phone: event.target.value }))} className="border border-line px-4 py-3 text-sm outline-none focus:border-ink" />
              <button onClick={next} disabled={!contact.name.trim() || !contact.email.trim() || contact.phone.trim().length < 7} className="btn-primary mt-2 w-fit disabled:opacity-40">Continue</button>
            </div>
          )}

          {step === "fulfilment" && (
            <div className="flex flex-col gap-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide">Delivery method</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button onClick={() => setFulfilment("delivery")} className={cn("flex flex-col items-start gap-2 border p-5 text-left", fulfilment === "delivery" ? "border-ink" : "border-line")}>
                  <Truck size={20} /><span className="text-sm font-medium">Courier delivery</span><span className="text-xs text-ink-400">Local or national delivery</span>
                </button>
                <button onClick={() => setFulfilment("collection")} className={cn("flex flex-col items-start gap-2 border p-5 text-left", fulfilment === "collection" ? "border-ink" : "border-line")}>
                  <Store size={20} /><span className="text-sm font-medium">Store collection</span><span className="text-xs text-ink-400">Free collection after confirmation</span>
                </button>
              </div>

              {fulfilment === "delivery" ? (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className={cn("border p-4 text-sm", deliveryZone === "local" ? "border-ink" : "border-line")}><input className="mr-3" type="radio" checked={deliveryZone === "local"} onChange={() => setDeliveryZone("local")} />Mbombela local delivery — R75</label>
                    <label className={cn("border p-4 text-sm", deliveryZone === "national" ? "border-ink" : "border-line")}><input className="mr-3" type="radio" checked={deliveryZone === "national"} onChange={() => setDeliveryZone("national")} />National delivery — R120</label>
                  </div>
                  <input required placeholder="Address line 1" value={address.line1} onChange={(event) => setAddress((current) => ({ ...current, line1: event.target.value }))} className="border border-line px-4 py-3 text-sm outline-none focus:border-ink" />
                  <input placeholder="Address line 2 (optional)" value={address.line2} onChange={(event) => setAddress((current) => ({ ...current, line2: event.target.value }))} className="border border-line px-4 py-3 text-sm outline-none focus:border-ink" />
                  <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Suburb" value={address.suburb} onChange={(event) => setAddress((current) => ({ ...current, suburb: event.target.value }))} className="border border-line px-4 py-3 text-sm outline-none focus:border-ink" />
                    <input required placeholder="City" value={address.city} onChange={(event) => setAddress((current) => ({ ...current, city: event.target.value }))} className="border border-line px-4 py-3 text-sm outline-none focus:border-ink" />
                    <input required placeholder="Province" value={address.province} onChange={(event) => setAddress((current) => ({ ...current, province: event.target.value }))} className="border border-line px-4 py-3 text-sm outline-none focus:border-ink" />
                    <input required placeholder="Postal code" value={address.postalCode} onChange={(event) => setAddress((current) => ({ ...current, postalCode: event.target.value }))} className="border border-line px-4 py-3 text-sm outline-none focus:border-ink" />
                  </div>
                </div>
              ) : <div className="border border-line p-4 text-sm"><p className="font-medium">{collectionStore}</p><p className="mt-1 text-ink-400">We will notify you when the order is ready.</p></div>}

              <div className="flex gap-3"><button onClick={back} className="btn-secondary">Back</button><button onClick={next} disabled={fulfilment === "delivery" && (!address.line1.trim() || !address.city.trim() || !address.postalCode.trim())} className="btn-primary disabled:opacity-40">Continue</button></div>
            </div>
          )}

          {step === "payment" && (
            <div className="flex flex-col gap-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide">Payment method</h2>
              <label className={cn("flex items-center gap-4 border p-4", payment === "payfast" ? "border-ink" : "border-line")}><input type="radio" checked={payment === "payfast"} onChange={() => setPayment("payfast")} /><CreditCard size={20} /><div><p className="text-sm font-medium">PayFast secure payment</p><p className="text-xs text-ink-400">Card and supported instant payment methods</p></div></label>
              <label className={cn("flex items-center gap-4 border p-4", payment === "eft" ? "border-ink" : "border-line")}><input type="radio" checked={payment === "eft"} onChange={() => setPayment("eft")} /><Building2 size={20} /><div><p className="text-sm font-medium">Manual EFT</p><p className="text-xs text-ink-400">Order remains pending until payment is confirmed</p></div></label>
              <div className="flex gap-3"><button onClick={back} className="btn-secondary">Back</button><button onClick={next} className="btn-primary">Review order</button></div>
            </div>
          )}

          {step === "review" && (
            <div className="flex flex-col gap-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide">Review order</h2>
              <div className="divide-y divide-line border-y border-line">
                {items.map(({ line, product }) => <div key={`${line.productId}-${line.colorway}`} className="flex gap-4 py-4"><div className="relative h-16 w-16 shrink-0 overflow-hidden bg-mist"><Image src={product.images[0]} alt={product.title} fill sizes="64px" className="object-cover" /></div><div className="flex flex-1 items-center justify-between"><div><p className="text-sm font-medium">{product.title}</p><p className="text-xs text-ink-400">Qty {line.quantity}</p></div><span className="text-sm font-semibold">{formatZAR(product.price * line.quantity)}</span></div></div>)}
              </div>
              {error && <div className="border border-secondary/30 bg-secondary/5 p-4 text-sm text-secondary">{error}</div>}
              <div className="flex gap-3"><button onClick={back} className="btn-secondary">Back</button><button onClick={placeOrder} disabled={placing} className="btn-primary disabled:opacity-60">{placing ? "Creating secure order..." : payment === "payfast" ? `Pay securely — ${formatZAR(total)}` : `Place EFT order — ${formatZAR(total)}`}</button></div>
            </div>
          )}
        </div>

        <aside className="h-fit border border-line p-5 lg:sticky lg:top-28">
          <h2 className="text-sm font-semibold uppercase tracking-wide">Order summary</h2>
          <div className="mt-4 flex justify-between text-sm"><span className="text-ink-400">Subtotal</span><span className="font-medium">{formatZAR(subtotal)}</span></div>
          <div className="mt-2 flex justify-between text-sm"><span className="text-ink-400">Delivery</span><span className="font-medium">{deliveryFee ? formatZAR(deliveryFee) : "Free"}</span></div>
          <div className="mt-4 flex justify-between border-t border-line pt-4 text-base font-semibold"><span>Total</span><span>{formatZAR(total)}</span></div>
          <ul className="mt-6 flex flex-col gap-2 text-xs text-ink-400"><li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-secondary" /> Prices and stock verified securely</li><li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-secondary" /> Payment details are not stored by A2Z</li></ul>
        </aside>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutContent />
    </Suspense>
  );
}
