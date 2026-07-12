import Link from "next/link";
import {
  Wallet,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  XCircle,
  Clock,
} from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { getDashboardStats } from "@/lib/admin/queries";
import { StatCard } from "@/components/admin/StatCard";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { formatZAR } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  pending: "bg-mist text-ink-500",
  paid: "bg-primary/20 text-ink",
  packed: "bg-primary/20 text-ink",
  shipped: "bg-ink text-paper",
  delivered: "bg-ink text-paper",
  collected: "bg-ink text-paper",
  cancelled: "bg-secondary/10 text-secondary",
  refunded: "bg-secondary/10 text-secondary",
};

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  const stats = await getDashboardStats();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <span className="eyebrow">Overview</span>
          <h1 className="mt-2 text-2xl font-semibold">Welcome back, {admin.fullName.split(" ")[0]}</h1>
        </div>
        <Link href="/admin/products/new" className="btn-primary">
          + Add Product
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Revenue (7d)" value={formatZAR(stats.revenue7d)} icon={Wallet} />
        <StatCard label="Revenue (30d)" value={formatZAR(stats.revenue30d)} icon={Wallet} />
        <StatCard label="Pending Orders" value={String(stats.pendingOrders)} icon={Clock} tone={stats.pendingOrders > 0 ? "warning" : "default"} />
        <StatCard label="Customers" value={String(stats.totalCustomers)} icon={Users} />
        <StatCard label="Products" value={String(stats.totalProducts)} icon={Package} />
        <StatCard label="Orders Today" value={String(stats.ordersToday)} icon={ShoppingCart} />
        <StatCard
          label="Low Stock"
          value={String(stats.lowStockCount)}
          icon={AlertTriangle}
          tone={stats.lowStockCount > 0 ? "warning" : "default"}
        />
        <StatCard
          label="Out of Stock"
          value={String(stats.outOfStockCount)}
          icon={XCircle}
          tone={stats.outOfStockCount > 0 ? "danger" : "default"}
        />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="border border-line bg-paper p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide">Revenue — Last 7 Days</h2>
          <div className="mt-6">
            <RevenueChart series={stats.revenueSeries} />
          </div>
        </div>

        <div className="border border-line bg-paper p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide">Best Sellers</h2>
          <div className="mt-4 flex flex-col gap-3">
            {stats.bestSellers.length === 0 && (
              <p className="text-sm text-ink-400">Available once order history has volume.</p>
            )}
            {stats.bestSellers.slice(0, 5).map((item, i) => (
              <div key={item.productId} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="text-ink-400">{i + 1}.</span>
                  {item.title}
                </span>
                <span className="font-medium">{item.unitsSold} sold</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 border border-line bg-paper p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide">Recent Orders</h2>
          <span className="text-xs text-ink-400">Order management ships in the next sprint</span>
        </div>
        <div className="mt-4 divide-y divide-line">
          {stats.recentOrders.length === 0 && (
            <p className="py-4 text-sm text-ink-400">No orders yet.</p>
          )}
          {stats.recentOrders.slice(0, 6).map((order) => (
            <div key={order.id} className="flex items-center justify-between py-3 text-sm">
              <span className="font-medium">{order.orderNumber}</span>
              <span className="text-ink-400">
                {new Date(order.placedAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}
              </span>
              <span className={`px-2.5 py-1 text-xs font-medium capitalize ${statusStyles[order.status] ?? "bg-mist"}`}>
                {order.status}
              </span>
              <span className="font-semibold">{formatZAR(order.total)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
