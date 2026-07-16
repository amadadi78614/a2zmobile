import type { Metadata } from "next";
import Link from "next/link";
import { Truck, Store, Clock, MapPinned } from "lucide-react";

export const metadata: Metadata = {
  title: "Shipping Information",
  description: "Delivery zones, timeframes and costs for orders placed with A2Z Mobile & Computer Services.",
};

const options = [
  {
    icon: Truck,
    title: "Mbombela local delivery",
    price: "R75",
    body: "Same-day delivery for orders placed before 1pm on a business day. Orders placed after 1pm are delivered the next working day.",
  },
  {
    icon: MapPinned,
    title: "National courier delivery",
    price: "R120",
    body: "Delivered by our courier partner within 2–4 working days of dispatch, tracked door-to-door anywhere in South Africa.",
  },
  {
    icon: Store,
    title: "Store collection",
    price: "Free",
    body: "Collect from our Mbombela store once your order is confirmed. We'll notify you by SMS or email the moment it's ready.",
  },
];

export default function ShippingPage() {
  return (
    <div className="container-content py-14 md:py-20">
      <div className="max-w-2xl">
        <span className="eyebrow">Support</span>
        <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
          Shipping Information
        </h1>
        <p className="mt-6 text-sm leading-relaxed text-ink-500 sm:text-base">
          Every order can be delivered or collected — choose whichever suits you at checkout.
          Delivery cost and estimated arrival are shown before you pay, and again on your order
          confirmation.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {options.map(({ icon: Icon, title, price, body }) => (
          <div key={title} className="flex flex-col gap-3 border border-line p-6">
            <Icon size={22} className="text-secondary" strokeWidth={1.75} />
            <div className="flex items-baseline justify-between">
              <h3 className="text-sm font-semibold">{title}</h3>
              <span className="text-sm font-semibold">{price}</span>
            </div>
            <p className="text-sm leading-relaxed text-ink-400">{body}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 border-t border-line pt-10">
        <div className="flex items-start gap-3">
          <Clock size={20} className="mt-0.5 shrink-0 text-secondary" strokeWidth={1.75} />
          <div>
            <h2 className="font-display text-lg font-semibold">Order cut-off times</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-500">
              Same-day Mbombela delivery applies to orders placed before 1pm on a business day.
              Orders placed after the cut-off, or on weekends and public holidays, are processed
              the next working day.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10 border-t border-line pt-10">
        <h2 className="font-display text-lg font-semibold">Tracking your order</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-500">
          Once your order is dispatched, you can follow its progress from your account or via our{" "}
          <Link href="/track-order" className="font-medium text-ink underline underline-offset-4">
            public order tracking page
          </Link>{" "}
          using your order number — no login required.
        </p>
      </div>

      <div className="mt-10 border-t border-line pt-10">
        <h2 className="font-display text-lg font-semibold">Delivery areas</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-500">
          Local same-day delivery covers Mbombela and Nelspruit. National courier delivery covers
          all major South African towns and cities. If you&apos;re unsure whether your area is
          covered, message us on WhatsApp from the{" "}
          <Link href="/contact" className="font-medium text-ink underline underline-offset-4">
            contact page
          </Link>{" "}
          and we&apos;ll confirm before you order.
        </p>
      </div>
    </div>
  );
}
