import "server-only";
import { createClient } from "@/lib/supabase/server";
import { DashboardStats, Order } from "@/lib/types";
import { mockOrders } from "@/lib/data/orders";
import { products as mockProducts } from "@/lib/data/products";

const SUPABASE_CONFIGURED = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * Builds dashboard stats from the mock storefront data. This is the same
 * mock data the public storefront currently renders from (see the
 * architecture note in supabase/migrations/002_admin_rbac_and_audit.sql) —
 * it exists so the admin dashboard renders something meaningful in local
 * dev before a Supabase project is connected, not as a substitute for real
 * aggregation once it is.
 */
function mockDashboardStats(): DashboardStats {
  const revenue = mockOrders.reduce((sum, o) => sum + o.total, 0);
  const lowStock = mockProducts.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStock = mockProducts.filter((p) => p.stock === 0).length;

  const unitsByProduct = new Map<string, { title: string; units: number }>();
  for (const order of mockOrders) {
    for (const item of order.items) {
      const existing = unitsByProduct.get(item.productId);
      unitsByProduct.set(item.productId, {
        title: item.title,
        units: (existing?.units ?? 0) + item.quantity,
      });
    }
  }

  return {
    revenueToday: 0,
    revenue7d: revenue,
    revenue30d: revenue,
    ordersToday: 0,
    pendingOrders: mockOrders.filter((o) => o.status === "pending" || o.status === "paid").length,
    totalCustomers: 1,
    totalProducts: mockProducts.length,
    lowStockCount: lowStock,
    outOfStockCount: outOfStock,
    revenueSeries: mockOrders.map((o) => ({
      date: o.placedAt.slice(0, 10),
      revenue: o.total,
    })),
    topCategories: [],
    recentOrders: mockOrders,
    bestSellers: Array.from(unitsByProduct.entries())
      .map(([productId, v]) => ({ productId, title: v.title, unitsSold: v.units }))
      .sort((a, b) => b.unitsSold - a.unitsSold),
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  if (!SUPABASE_CONFIGURED) return mockDashboardStats();

  const supabase = await createClient();
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { data: ordersToday },
    { data: orders7d },
    { data: orders30d },
    { count: pendingOrders },
    { count: totalCustomers },
    { count: totalProducts },
    { data: lowStockRows },
    { data: recentOrdersRows },
  ] = await Promise.all([
    supabase.from("orders").select("total").gte("created_at", startOfToday),
    supabase.from("orders").select("total, created_at").gte("created_at", sevenDaysAgo),
    supabase.from("orders").select("total").gte("created_at", thirtyDaysAgo),
    supabase.from("orders").select("id", { count: "exact", head: true }).in("status", ["pending", "paid"]),
    supabase.from("customers").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("products").select("id, stock").is("deleted_at", null).lte("stock", 5),
    supabase
      .from("orders")
      .select("id, order_number, status, total, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const sum = (rows: { total: number }[] | null) => (rows ?? []).reduce((s, r) => s + r.total, 0);

  const revenueByDay = new Map<string, number>();
  for (const row of orders7d ?? []) {
    const day = row.created_at.slice(0, 10);
    revenueByDay.set(day, (revenueByDay.get(day) ?? 0) + row.total);
  }

  return {
    revenueToday: sum(ordersToday),
    revenue7d: sum(orders7d),
    revenue30d: sum(orders30d),
    ordersToday: (ordersToday ?? []).length,
    pendingOrders: pendingOrders ?? 0,
    totalCustomers: totalCustomers ?? 0,
    totalProducts: totalProducts ?? 0,
    lowStockCount: (lowStockRows ?? []).filter((r) => r.stock > 0).length,
    outOfStockCount: (lowStockRows ?? []).filter((r) => r.stock === 0).length,
    revenueSeries: Array.from(revenueByDay.entries()).map(([date, revenue]) => ({ date, revenue })),
    topCategories: [], // Requires a joined aggregate query — deferred to the reporting sprint (Module 14).
    recentOrders: (recentOrdersRows ?? []).map(
      (r): Order => ({
        id: r.id,
        orderNumber: r.order_number,
        status: r.status,
        total: r.total,
        placedAt: r.created_at,
        fulfilmentMethod: "delivery",
        paymentMethod: "payfast",
        items: [],
        subtotal: r.total,
        deliveryFee: 0,
      })
    ),
    bestSellers: [], // Requires an order_items aggregate — deferred to the reporting sprint.
  };
}
