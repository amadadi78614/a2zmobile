import Link from "next/link";
import { CheckCircle2, Clock, XCircle, HelpCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatZAR } from "@/lib/utils";

// This page previously read `order` and `total` straight from the URL query string and
// unconditionally showed "Order confirmed" — meaning anyone who landed on this URL with any
// order number saw a success message, regardless of whether payment actually happened. It now
// queries the real order (payment_status is only ever set server-side, by a verified PayFast ITN
// — see src/app/api/payfast/notify/route.ts) and shows exactly one of four honest states.

type ViewState = "paid" | "pending" | "failed" | "not_found";

const stateContent: Record<
  Exclude<ViewState, "not_found">,
  { Icon: typeof CheckCircle2; iconClass: string; title: string; body: string }
> = {
  paid: {
    Icon: CheckCircle2,
    iconClass: "text-secondary",
    title: "Order confirmed",
    body: "Thank you — a confirmation has been sent to your email.",
  },
  pending: {
    Icon: Clock,
    iconClass: "text-primary",
    title: "Payment confirmation pending",
    body: "We've received your order and are waiting for payment confirmation from PayFast. This usually takes a few moments — refresh this page shortly, or check your order status any time from your account.",
  },
  failed: {
    Icon: XCircle,
    iconClass: "text-ink-400",
    title: "Payment failed",
    body: "PayFast reported that this payment did not succeed. No amount should have been charged. You can try again from your cart, or contact us on WhatsApp if you believe this is a mistake.",
  },
};

export default async function CheckoutConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderNumber } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let order: { order_number: string; total: number; payment_status: string } | null = null;

  if (user && orderNumber) {
    const { data } = await supabase
      .from("orders")
      .select("order_number, total, payment_status")
      .eq("order_number", orderNumber)
      .eq("customer_id", user.id)
      .maybeSingle();
    order = data;
  }

  const view: ViewState = !order
    ? "not_found"
    : order.payment_status === "complete"
      ? "paid"
      : order.payment_status === "failed"
        ? "failed"
        : "pending";

  if (view === "not_found") {
    return (
      <div className="container-content flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
        <HelpCircle size={48} className="text-ink-300" strokeWidth={1.5} />
        <h1 className="mt-6 text-2xl font-semibold sm:text-3xl">We couldn&apos;t find that order</h1>
        <p className="mt-2 max-w-md text-sm text-ink-400">
          Sign in and check your account for the order you&apos;re looking for, or contact us if you need help.
        </p>
        <div className="mt-10 flex gap-4">
          <Link href="/account/orders" className="btn-primary">View Your Orders</Link>
          <Link href="/shop" className="btn-secondary">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  const { Icon, iconClass, title, body } = stateContent[view];

  return (
    <div className="container-content flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <Icon size={48} className={iconClass} strokeWidth={1.5} />
      <h1 className="mt-6 text-2xl font-semibold sm:text-3xl">{title}</h1>
      <p className="mt-2 max-w-md text-sm text-ink-400">{body}</p>

      <div className="mt-8 border border-line px-8 py-6">
        <p className="text-xs uppercase tracking-wide text-ink-400">Order Number</p>
        <p className="mt-1 text-lg font-semibold">{order!.order_number}</p>
        <p className="mt-4 text-xs uppercase tracking-wide text-ink-400">Total</p>
        <p className="mt-1 text-lg font-semibold">{formatZAR(Number(order!.total))}</p>
      </div>

      <div className="mt-10 flex gap-4">
        <Link href="/account/orders" className="btn-primary">
          {view === "paid" ? "Track Order" : "View Order Status"}
        </Link>
        <Link href="/shop" className="btn-secondary">Continue Shopping</Link>
      </div>
    </div>
  );
}
