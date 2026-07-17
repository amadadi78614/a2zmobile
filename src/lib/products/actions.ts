"use server";

import { getProductsByIds } from "@/lib/products/queries";
import type { Product } from "@/lib/types";

/**
 * The one bridge between client-side ID lists (cart, wishlist, recently-viewed — all
 * localStorage-only, per Critical Fix 2's explicit allowance) and real product data. Always
 * hits Supabase directly, never cached — see queries.ts's "not cached: real-time hydration"
 * section for why.
 */
export async function hydrateProductsByIds(ids: string[]): Promise<Product[]> {
  return getProductsByIds(ids);
}
