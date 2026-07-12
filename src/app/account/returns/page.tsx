"use client";

import { useState } from "react";
import { mockOrders } from "@/lib/data/orders";
import { formatZAR } from "@/lib/utils";

const reasons = [
  "Item arrived damaged",
  "Wrong item received",
  "Changed my mind",
  "Item not as described",
  "Faulty / not working",
];

export default function ReturnsPage() {
  const [submitted, setSubmitted] = useState(false);
  const eligibleItems = mockOrders.flatMap((o) =>
    o.items.map((item) => ({ ...item, orderNumber: o.orderNumber }))
  );

  if (submitted) {
    return (
      <div className="border border-line p-8 text-center">
        <h2 className="text-lg font-semibold">Return request submitted</h2>
        <p className="mt-2 text-sm text-ink-400">
          We&apos;ll email you a prepaid return slip within 1 business day.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-wide">Request a Return</h2>
      <p className="mt-2 text-sm text-ink-400">Returns accepted within 7 days of delivery on unopened items.</p>

      <form
        className="mt-6 flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
      >
        <div>
          <label className="text-xs font-medium text-ink-500">Item</label>
          <select required className="mt-2 w-full border border-line px-4 py-3 text-sm outline-none focus:border-ink">
            <option value="">Select an item to return</option>
            {eligibleItems.map((item, i) => (
              <option key={i} value={item.sku}>
                {item.orderNumber} — {item.title} ({formatZAR(item.unitPrice)})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-ink-500">Reason</label>
          <select required className="mt-2 w-full border border-line px-4 py-3 text-sm outline-none focus:border-ink">
            <option value="">Select a reason</option>
            {reasons.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-ink-500">Additional details (optional)</label>
          <textarea
            rows={4}
            className="mt-2 w-full border border-line px-4 py-3 text-sm outline-none focus:border-ink"
            placeholder="Tell us more about the issue..."
          />
        </div>

        <button type="submit" className="btn-primary w-fit">Submit Return Request</button>
      </form>
    </div>
  );
}
