import { getAllProducts } from "@/lib/products/queries";
import { ShopClient } from "@/app/shop/ShopClient";

export const dynamic = "force-dynamic";

// Fetches the full published catalog once, server-side, from Supabase — then hands off to the
// exact same client-side instant-filter UX the shop page always had (see ShopClient.tsx). A
// generous limit, not true pagination, matching today's catalog scale; see Critical Fix 2's
// final report for the pagination note on this specific page.
export default async function ShopPage() {
  const products = await getAllProducts({ limit: 500 });
  return <ShopClient products={products} />;
}
