"use client";

import { useEffect } from "react";
import { useRecentlyViewedStore } from "@/lib/store/recentlyViewed";

export function RecordProductView({ productId }: { productId: string }) {
  const record = useRecentlyViewedStore((s) => s.record);

  useEffect(() => {
    record(productId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  return null;
}
