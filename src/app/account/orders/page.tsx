import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatZAR } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  pending: "bg-mist text-ink-500",
  paid: "bg-primary/20 text-ink",
  packed: "bg-primary/20 text-ink",
  collected: "bg-ink text-paper",
  shipped: "bg-ink text-paper",
  delivered: "bg-ink text-paper",
  cancelled: "bg-secondary/10 text-secondary",
  refunded: "bg-secondary/10 text-secondary",
};

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: orders } = user
    ? await supabase
        .from("orders")
        .select("id, order_number, status, total, created_at, order_items(count)")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide">Order history</h2>
        <Link href="/shop" className="text-sm font-medium underline-offset-4 hover:underline">Continue shopping</Link>
      </div>

      {!orders?.length ? (
        <div className="mt-6 border border-line p-10 text-center">
          <p className="text-sm font-medium">You have not placed any orders yet.</p>
          <p className="mt-2 text-sm text-ink-400">Paid and pending orders will appear here.</p>
          <Link href="/shop" className="btn-primary mt-6 inline-flex">Browse products</Link>
        </div>
      ) : (
        <div className="mt-4 divide-y divide-line border-y border-line">
          {orders.map((order) => {
            const itemCount = Array.isArray(order.order_items) && order.order_items[0]
              ? Number((order.order_items[0] as { count?: number }).count || 0)
              : 0;

            return (
              <Link key={order.id} href={`/account/orders/${order.order_number}`} className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium">{order.order_number}</p>
                  <p className="mt-1 text-xs text-ink-400">
                    {new Date(order.created_at).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })}
                    {" · "}{itemCount} item{itemCount === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-sm font-semibold">{formatZAR(Number(order.total))}</span>
                  <span className={`px-3 py-1.5 text-xs font-medium capitalize ${statusStyles[order.status] || statusStyles.pending}`}>{order.status}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
