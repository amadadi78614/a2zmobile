import Link from "next/link";
import { Package, MapPin, Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function AccountDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let orderCount = 0;
  let addressCount = 0;

  if (user) {
    const [ordersResult, addressesResult] = await Promise.all([
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("customer_id", user.id),
      supabase.from("addresses").select("id", { count: "exact", head: true }).eq("customer_id", user.id),
    ]);
    orderCount = ordersResult.count ?? 0;
    addressCount = addressesResult.count ?? 0;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href="/account/orders" className="flex flex-col gap-2 border border-line p-5 hover:border-ink">
          <Package size={18} className="text-secondary" />
          <span className="text-2xl font-semibold">{orderCount}</span>
          <span className="text-sm text-ink-400">Orders placed</span>
        </Link>
        <Link href="/account/addresses" className="flex flex-col gap-2 border border-line p-5 hover:border-ink">
          <MapPin size={18} className="text-secondary" />
          <span className="text-2xl font-semibold">{addressCount}</span>
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
        <div className="mt-4 border border-line p-8 text-center">
          <p className="text-sm font-medium">You have not placed any orders yet.</p>
          <p className="mt-2 text-sm text-ink-400">Your confirmed purchases will appear here.</p>
          <Link href="/shop" className="btn-primary mt-6 inline-flex">Start Shopping</Link>
        </div>
      </div>
    </div>
  );
}
