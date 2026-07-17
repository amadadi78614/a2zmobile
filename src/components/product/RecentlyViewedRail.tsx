"use client";

import { useEffect, useState } from "react";
import { useRecentlyViewedStore } from "@/lib/store/recentlyViewed";
import { useHydratedProducts } from "@/lib/products/useHydratedProducts";
import { ProductRail } from "@/components/home/ProductRail";

export function RecentlyViewedRail({ excludeProductId }: { excludeProductId?: string }) {
  const [mounted, setMounted] = useState(false);
  const productIds = useRecentlyViewedStore((s) => s.productIds);

  useEffect(() => setMounted(true), []);

  const idsToHydrate = productIds.filter((id) => id !== excludeProductId).slice(0, 8);
  const { products: items, state } = useHydratedProducts(idsToHydrate);

  // Avoid a hydration mismatch (localStorage-backed state isn't known on the server render), and
  // fail silently on error — recently-viewed is a nice-to-have rail, not worth a visible error
  // state of its own.
  if (!mounted || state !== "ready" || items.length === 0) return null;

  return <ProductRail eyebrow="Your History" title="Recently Viewed" products={items} />;
}
