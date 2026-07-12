import Link from "next/link";
import { mockOrders } from "@/lib/data/orders";
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

export default function OrdersPage() {
  return (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-wide">Order History</h2>

      <div className="mt-4 divide-y divide-line border-y border-line">
        {mockOrders.map((order) => (
          <Link
            key={order.id}
            href={`/account/orders/${order.orderNumber}`}
            className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm font-medium">{order.orderNumber}</p>
              <p className="mt-1 text-xs text-ink-400">
                {new Date(order.placedAt).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })}
                {" · "}
                {order.items.length} item{order.items.length > 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-sm font-semibold">{formatZAR(order.total)}</span>
              <span className={`px-3 py-1.5 text-xs font-medium capitalize ${statusStyles[order.status]}`}>
                {order.status}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
