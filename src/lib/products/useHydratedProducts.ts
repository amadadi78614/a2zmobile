"use client";

import { useEffect, useState } from "react";
import { hydrateProductsByIds } from "@/lib/products/actions";
import type { Product } from "@/lib/types";

export type HydrationState = "loading" | "ready" | "error";

/** Given a list of product IDs (from a localStorage-backed store — cart, wishlist, recently
 * viewed), fetches the real, current product data from Supabase. Never returns stale/cached
 * data for these — see queries.ts's getProductsByIds, which is deliberately uncached. */
export function useHydratedProducts(ids: string[]): { products: Product[]; state: HydrationState } {
  const [products, setProducts] = useState<Product[]>([]);
  const [state, setState] = useState<HydrationState>("loading");
  const key = ids.join(",");

  useEffect(() => {
    let cancelled = false;

    if (ids.length === 0) {
      setProducts([]);
      setState("ready");
      return;
    }

    setState("loading");
    hydrateProductsByIds(ids)
      .then((result) => {
        if (cancelled) return;
        setProducts(result);
        setState("ready");
      })
      .catch((error) => {
        console.error("[useHydratedProducts] failed:", error);
        if (!cancelled) setState("error");
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { products, state };
}
