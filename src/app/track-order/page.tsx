"use client";

import { useState } from "react";
import Link from "next/link";
import { mockOrders } from "@/lib/data/orders";
import { Order } from "@/lib/types";

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [result, setResult] = useState<Order | null | undefined>(undefined);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = mockOrders.find((o) => o.orderNumber.toLowerCase() === orderNumber.trim().toLowerCase());
    setResult(found ?? null);
  }

  return (
    <div className="container-content flex flex-col items-center py-16 text-center">
      <h1 className="text-2xl font-semibold sm:text-3xl">Track Your Order</h1>
      <p className="mt-2 max-w-sm text-sm text-ink-400">
        Enter your order number to see the latest status.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex w-full max-w-sm gap-3">
        <input
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="e.g. A2Z-100482"
          className="w-full border border-line px-4 py-3 text-sm outline-none focus:border-ink"
        />
        <button type="submit" className="btn-primary shrink-0">Track</button>
      </form>

      {result === null && (
        <p className="mt-6 text-sm text-secondary">No order found with that number.</p>
      )}

      {result && (
        <div className="mt-8 w-full max-w-sm border border-line p-6 text-left">
          <p className="text-sm font-medium">{result.orderNumber}</p>
          <p className="mt-1 text-xs capitalize text-ink-400">Status: {result.status}</p>
          {result.trackingNumber && (
            <p className="mt-1 text-xs text-ink-400">Tracking: {result.trackingNumber}</p>
          )}
          <Link href={`/account/orders/${result.orderNumber}`} className="mt-4 inline-block text-sm font-medium underline-offset-4 hover:underline">
            View full details
          </Link>
        </div>
      )}
    </div>
  );
}
