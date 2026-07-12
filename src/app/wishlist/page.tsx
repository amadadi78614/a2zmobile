"use client";

import Link from "next/link";
import { useWishlistStore } from "@/lib/store/wishlist";
import { products } from "@/lib/data/products";
import { ProductCard } from "@/components/product/ProductCard";

export default function WishlistPage() {
  const productIds = useWishlistStore((s) => s.productIds);
  const items = products.filter((p) => productIds.includes(p.id));

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
