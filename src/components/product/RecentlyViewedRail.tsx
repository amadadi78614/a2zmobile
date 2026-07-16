"use client";

import { useEffect, useState } from "react";
import { useRecentlyViewedStore } from "@/lib/store/recentlyViewed";
import { products } from "@/lib/data/products";
import { ProductRail } from "@/components/home/ProductRail";

export function RecentlyViewedRail({ excludeProductId }: { excludeProductId?: string }) {
  const [mounted, setMounted] = useState(false);
  const productIds = useRecentlyViewedStore((s) => s.productIds);

  useEffect(() => setMounted(true), []);

  // Avoid a hydration mismatch — localStorage-backed state isn't known on the server render.
  if (!mounted) return null;

  const items = productIds
    .filter((id) => id !== excludeProductId)
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is (typeof products)[number] => Boolean(p))
    .slice(0, 8);

  if (items.length === 0) return null;

  return <ProductRail eyebrow="Your History" title="Recently Viewed" products={items} />;
}
