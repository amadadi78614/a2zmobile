"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Truck, Store, CreditCard, Building2, CheckCircle2 } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { products } from "@/lib/data/products";
import { formatZAR, cn } from "@/lib/utils";

type Step = "details" | "fulfilment" | "payment" | "review";
const steps: { key: Step; label: string }[] = [
  { key: "details", label: "Contact" },
  { key: "fulfilment", label: "Delivery" },
  { key: "payment", label: "Payment" },
  { key: "review", label: "Review" },
];

const stores = ["A2Z Riverside Mall, Mbombela", "A2Z Ilanga Mall, White River"];

export default function CheckoutPage() {
  const router = useRouter();
  const lines = useCartStore((s) => s.lines);
  const clearCart = useCartStore((s) => s.clear);
  const [step, setStep] = useState<Step>("details");
  const [placing, setPlacing] = useState(false);

  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
  const [fulfilment, setFulfilment] = useState<"delivery" | "collection">("delivery");
  const [address, setAddress] = useState({ line1: "", suburb: "", city: "Mbombela", province: "Mpumalanga", postalCode: "" });
  const [collectionStore, setCollectionStore] = useState(stores[0]);
  const [payment, setPayment] = useState<"payfast" | "ozow" | "eft">("payfast");

  const items = lines
    .map((line) => ({ line, product: products.find((p) => p.id === line.productId) }))
    .filter((i) => i.product);
  const subtotal = items.reduce((sum, i) => sum + i.product!.price * i.line.quantity, 0);
  const deliveryFee = fulfilment === "delivery" ? (subtotal > 5000 ? 0 : 99) : 0;
  const total = subtotal + deliveryFee;

  const currentIndex = steps.findIndex((s) => s.key === step);

  function next() {
    const idx = steps.findIndex((s) => s.key === step);
    if (idx < steps.length - 1) setStep(steps[idx + 1].key);
  }
  function back() {
    const idx = steps.findIndex((s) => s.key === step);
    if (idx > 0) setStep(steps[idx - 1].key);
  }

  function placeOrder() {
    setPlacing(true);
    const orderNumber = `A2Z-${Math.floor(100000 + Math.random() * 900000)}`;
    setTimeout(() => {
      clearCart();
      router.push(`/checkout/confirmation?order=${orderNumber}&total=${total}`);
    }, 900);
  }

  if (items.length === 0) {
    return (
      <div className="container-content flex flex-col items-center py-24 text-center">
        <h1 className="text-2xl font-semibold">Your cart is empty</h1>
        <Link href="/shop" className="btn-primary mt-8">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container-content py-10 md:py-14">
      <h1 className="text-2xl font-semibold sm:text-3xl">Checkout</h1>

      {/* Step indicator */}
      <div className="mt-8 flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.key} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                i <= currentIndex ? "bg-ink text-paper" : "border border-line text-ink-400"
              )}
            >
              {i + 1}
            </div>
            <span className={cn("hidden text-xs sm:block", i <= currentIndex ? "text-ink" : "text-ink-400")}>
              {s.label}
            </span>
            {i < steps.length - 1 && <div className={cn("h-px flex-1", i < currentIndex ? "bg-ink" : "bg-line")} />}
          </div>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {step === "details" && (
            <div className="flex flex-col gap-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide">Contact Details</h2>
              <input
                required placeholder="Full name" value={contact.name}
                onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))}
                className="border border-line px-4 py-3 text-sm outline-none focus:border-ink"
              />
              <input
                required type="email" placeholder="Email" value={contact.email}
                onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
                className="border border-line px-4 py-3 text-sm outline-none focus:border-ink"
              />
              <input
                required placeholder="Phone" value={contact.phone}
                onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))}
                className="border border-line px-4 py-3 text-sm outline-none focus:border-ink"
              />
              <button
                onClick={next}
                disabled={!contact.name || !contact.email || !contact.phone}
                className="btn-primary mt-2 w-fit disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          )}

          {step === "fulfilment" && (
            <div className="flex flex-col gap-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide">Delivery Method</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  onClick={() => setFulfilment("delivery")}
                  className={cn("flex flex-col items-start gap-2 border p-5 text-left", fulfilment === "delivery" ? "border-ink" : "border-line")}
                >
                  <Truck size={20} />
                  <span className="text-sm font-medium">Courier Delivery</span>
                  <span className="text-xs text-ink-400">2–4 working days &middot; Free over R5,000</span>
                </button>
                <button
                  onClick={() => setFulfilment("collection")}
                  className={cn("flex flex-col items-start gap-2 border p-5 text-left", fulfilment === "collection" ? "border-ink" : "border-line")}
                >
                  <Store size={20} />
                  <span className="text-sm font-medium">Store Collection</span>
                  <span className="text-xs text-ink-400">Ready within 2 hours &middot; Free</span>
                </button>
              </div>

              {fulfilment === "delivery" ? (
                <div className="flex flex-col gap-4">
                  <input
                    required placeholder="Address line 1" value={address.line1}
                    onChange={(e) => setAddress((a) => ({ ...a, line1: e.target.value }))}
                    className="border border-line px-4 py-3 text-sm outline-none focus:border-ink"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      placeholder="Suburb" value={address.suburb}
                      onChange={(e) => setAddress((a) => ({ ...a, suburb: e.target.value }))}
                      className="border border-line px-4 py-3 text-sm outline-none focus:border-ink"
                    />
                    <input
                      required placeholder="City" value={address.city}
                      onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                      className="border border-line px-4 py-3 text-sm outline-none focus:border-ink"
                    />
                    <input
                      required placeholder="Province" value={address.province}
                      onChange={(e) => setAddress((a) => ({ ...a, province: e.target.value }))}
                      className="border border-line px-4 py-3 text-sm outline-none focus:border-ink"
                    />
                    <input
                      required placeholder="Postal code" value={address.postalCode}
                      onChange={(e) => setAddress((a) => ({ ...a, postalCode: e.target.value }))}
                      className="border border-line px-4 py-3 text-sm outline-none focus:border-ink"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {stores.map((s) => (
                    <label key={s} className="flex items-center gap-3 border border-line px-4 py-3 text-sm">
                      <input
                        type="radio" name="store" checked={collectionStore === s}
                        onChange={() => setCollectionStore(s)} className="accent-ink"
                      />
                      {s}
                    </label>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={back} className="btn-secondary w-fit">Back</button>
                <button
                  onClick={next}
                  disabled={fulfilment === "delivery" && (!address.line1 || !address.city || !address.postalCode)}
                  className="btn-primary w-fit disabled:opacity-40"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === "payment" && (
            <div className="flex flex-col gap-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide">Payment Method</h2>
              {[
                { id: "payfast" as const, label: "PayFast", desc: "Card, Instant EFT, SnapScan via PayFast", icon: CreditCard },
                { id: "ozow" as const, label: "Ozow", desc: "Pay instantly from your bank account", icon: Building2 },
                { id: "eft" as const, label: "Manual EFT", desc: "Bank transfer — order ships once payment reflects", icon: Building2 },
              ].map(({ id, label, desc, icon: Icon }) => (
                <label
                  key={id}
                  className={cn("flex items-center gap-4 border p-4", payment === id ? "border-ink" : "border-line")}
                >
                  <input type="radio" name="payment" checked={payment === id} onChange={() => setPayment(id)} className="accent-ink" />
                  <Icon size={20} className="text-ink-500" />
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-ink-400">{desc}</p>
                  </div>
                </label>
              ))}
              <div className="flex gap-3">
                <button onClick={back} className="btn-secondary w-fit">Back</button>
                <button onClick={next} className="btn-primary w-fit">Continue</button>
              </div>
            </div>
          )}

          {step === "review" && (
            <div className="flex flex-col gap-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide">Review Order</h2>
              <div className="divide-y divide-line border-y border-line">
                {items.map(({ line, product }) => (
                  <div key={`${line.productId}-${line.colorway}`} className="flex gap-4 py-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-mist">
                      <Image src={product!.images[0]} alt={product!.title} fill sizes="64px" className="object-cover" />
                    </div>
                    <div className="flex flex-1 items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{product!.title}</p>
                        <p className="text-xs text-ink-400">Qty {line.quantity}</p>
                      </div>
                      <span className="text-sm font-semibold">{formatZAR(product!.price * line.quantity)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <div className="border border-line p-4">
                  <p className="text-xs font-semibold uppercase text-ink-400">Contact</p>
                  <p className="mt-2">{contact.name}</p>
                  <p className="text-ink-400">{contact.email}</p>
                  <p className="text-ink-400">{contact.phone}</p>
                </div>
                <div className="border border-line p-4">
                  <p className="text-xs font-semibold uppercase text-ink-400">
                    {fulfilment === "delivery" ? "Delivery Address" : "Collection Point"}
                  </p>
                  {fulfilment === "delivery" ? (
                    <p className="mt-2 text-ink-400">
                      {address.line1}, {address.suburb}
                      <br />
                      {address.city}, {address.province} {address.postalCode}
                    </p>
                  ) : (
                    <p className="mt-2 text-ink-400">{collectionStore}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={back} className="btn-secondary w-fit">Back</button>
                <button onClick={placeOrder} disabled={placing} className="btn-primary w-fit disabled:opacity-60">
                  {placing ? "Placing Order..." : `Place Order — ${formatZAR(total)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="h-fit border border-line p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide">Order Summary</h2>
          <div className="mt-4 flex justify-between text-sm">
            <span className="text-ink-400">Subtotal</span>
            <span className="font-medium">{formatZAR(subtotal)}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-ink-400">Delivery</span>
            <span className="font-medium">{fulfilment === "delivery" ? (deliveryFee ? formatZAR(deliveryFee) : "Free") : "Free (collection)"}</span>
          </div>
          <div className="mt-4 flex justify-between border-t border-line pt-4 text-base font-semibold">
            <span>Total</span>
            <span>{formatZAR(total)}</span>
          </div>

          <ul className="mt-6 flex flex-col gap-2 text-xs text-ink-400">
            <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-secondary" /> Genuine stock, warranty where applicable</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-secondary" /> 7-day returns on unopened items</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
