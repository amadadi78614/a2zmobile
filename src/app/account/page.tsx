import Link from "next/link";
import { Package, MapPin, Heart } from "lucide-react";
import { mockOrders, mockAddresses } from "@/lib/data/orders";
import { formatZAR } from "@/lib/utils";

export default function AccountDashboardPage() {
  const latestOrder = mockOrders[0];

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href="/account/orders" className="flex flex-col gap-2 border border-line p-5 hover:border-ink">
          <Package size={18} className="text-secondary" />
          <span className="text-2xl font-semibold">{mockOrders.length}</span>
          <span className="text-sm text-ink-400">Orders placed</span>
        </Link>
        <Link href="/account/addresses" className="flex flex-col gap-2 border border-line p-5 hover:border-ink">
          <MapPin size={18} className="text-secondary" />
          <span className="text-2xl font-semibold">{mockAddresses.length}</span>
          <span className="text-sm text-ink-400">Saved addresses</span>
        </Link>
        <Link href="/wishlist" className="flex flex-col gap-2 border border-line p-5 hover:border-ink">
          <Heart size={18} className="text-secondary" />
          <span className="text-2xl font-semibold">View</span>
          <span className="text-sm text-ink-400">Your wishlist</span>
        </Link>
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide">Most Recent Order</h2>
        <div className="mt-4 flex flex-col gap-4 border border-line p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">{latestOrder.orderNumber}</p>
            <p className="mt-1 text-xs text-ink-400">
              Placed {new Date(latestOrder.placedAt).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-sm font-semibold">{formatZAR(latestOrder.total)}</span>
            <span className="border border-line px-3 py-1.5 text-xs font-medium capitalize">
              {latestOrder.status}
            </span>
            <Link
              href={`/account/orders/${latestOrder.orderNumber}`}
              className="text-sm font-medium underline-offset-4 hover:underline"
            >
              View
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
