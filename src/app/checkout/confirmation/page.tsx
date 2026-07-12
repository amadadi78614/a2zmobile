"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { formatZAR } from "@/lib/utils";

function ConfirmationContent() {
  const params = useSearchParams();
  const orderNumber = params.get("order") ?? "A2Z-000000";
  const total = Number(params.get("total") ?? 0);

  return (
    <div className="container-content flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <CheckCircle2 size={48} className="text-secondary" strokeWidth={1.5} />
      <h1 className="mt-6 text-2xl font-semibold sm:text-3xl">Order confirmed</h1>
      <p className="mt-2 text-sm text-ink-400">
        Thank you — a confirmation has been sent to your email.
      </p>

      <div className="mt-8 border border-line px-8 py-6">
        <p className="text-xs uppercase tracking-wide text-ink-400">Order Number</p>
        <p className="mt-1 text-lg font-semibold">{orderNumber}</p>
        <p className="mt-4 text-xs uppercase tracking-wide text-ink-400">Total</p>
        <p className="mt-1 text-lg font-semibold">{formatZAR(total)}</p>
      </div>

      <div className="mt-10 flex gap-4">
        <Link href="/account/orders" className="btn-primary">Track Order</Link>
        <Link href="/shop" className="btn-secondary">Continue Shopping</Link>
      </div>
    </div>
  );
}

export default function CheckoutConfirmationPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmationContent />
    </Suspense>
  );
}
