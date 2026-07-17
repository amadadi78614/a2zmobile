"use client";

import Link from "next/link";
import { ServerCrash } from "lucide-react";
import { useWishlistStore } from "@/lib/store/wishlist";
import { useHydratedProducts } from "@/lib/products/useHydratedProducts";
import { ProductCard } from "@/components/product/ProductCard";

export default function WishlistPage() {
  const productIds = useWishlistStore((s) => s.productIds);
  const { products: items, state } = useHydratedProducts(productIds);

  if (state === "error") {
    return (
      <div className="container-content flex flex-col items-center py-24 text-center">
        <ServerCrash size={40} className="text-ink-300" strokeWidth={1.5} />
        <h1 className="mt-6 text-2xl font-semibold">Couldn&apos;t load your wishlist</h1>
        <p className="mt-2 max-w-sm text-sm text-ink-400">
          We&apos;re having trouble reaching the store right now — please try refreshing in a moment.
        </p>
      </div>
    );
  }

  if (state === "loading") {
    return (
      <div className="container-content py-10 md:py-14">
        <h1 className="text-2xl font-semibold sm:text-3xl">Wishlist</h1>
        <div className="mt-10 animate-pulse text-sm text-ink-400">Loading your wishlist…</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-content flex flex-col items-center py-24 text-center">
        <h1 className="text-2xl font-semibold">Your wishlist is empty</h1>
        <p className="mt-2 text-sm text-ink-400">Tap the heart icon on any product to save it here.</p>
        <Link href="/shop" className="btn-primary mt-8">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container-content py-10 md:py-14">
      <h1 className="text-2xl font-semibold sm:text-3xl">Wishlist</h1>
      <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 xl:grid-cols-4">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
