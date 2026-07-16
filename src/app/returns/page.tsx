import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle, PackageCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Returns Policy",
  description: "A2Z Mobile & Computer Services' 7-day returns policy — what's eligible, what isn't, and how to start a return.",
};

const eligible = [
  "Unopened items in original, undamaged packaging",
  "Items returned within 7 days of delivery or collection",
  "Faulty items, at any point during the manufacturer warranty period",
  "Items that arrived damaged or different from what you ordered",
];

const notEligible = [
  "Opened consumables (e.g. hookah charcoal, screen protectors once applied)",
  "Items showing signs of use or physical damage not present on arrival",
  "Change-of-mind returns requested after 7 days",
  "Items without proof of purchase (order number or account order history)",
];

export default function ReturnsPolicyPage() {
  return (
    <div className="container-content py-14 md:py-20">
      <div className="max-w-2xl">
        <span className="eyebrow">Support</span>
        <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Returns Policy</h1>
        <p className="mt-6 text-sm leading-relaxed text-ink-500 sm:text-base">
          We want you to be happy with what you buy. If something isn&apos;t right, unopened items
          can be returned within 7 days of delivery, no questions asked — and faulty items are
          covered by manufacturer warranty beyond that.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-secondary" />
            <h2 className="text-sm font-semibold uppercase tracking-wide">Eligible for return</h2>
          </div>
          <ul className="mt-4 flex flex-col gap-3">
            {eligible.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-ink-500">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <XCircle size={18} className="text-ink-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wide">Not eligible</h2>
          </div>
          <ul className="mt-4 flex flex-col gap-3">
            {notEligible.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-ink-500">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-16 border-t border-line pt-10">
        <div className="flex items-start gap-3">
          <PackageCheck size={20} className="mt-0.5 shrink-0 text-secondary" strokeWidth={1.75} />
          <div>
            <h2 className="font-display text-lg font-semibold">How refunds work</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-500">
              Once we receive and inspect your returned item, we&apos;ll notify you of approval.
              Approved refunds are issued to your original payment method and typically reflect
              within 5–10 working days, depending on your bank or payment provider.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10 border-t border-line pt-10">
        <h2 className="font-display text-lg font-semibold">Starting a return</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-500">
          Sign in and submit a return request from your account — we&apos;ll email you a return
          slip within 1 business day. If you&apos;d rather speak to someone first, WhatsApp or call us
          from our{" "}
          <Link href="/contact" className="font-medium text-ink underline underline-offset-4">
            contact page
          </Link>
          .
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/account/returns" className="btn-primary">
            Start a return
          </Link>
          <Link href="/track-order" className="btn-secondary">
            Track an order
          </Link>
        </div>
      </div>
    </div>
  );
}
