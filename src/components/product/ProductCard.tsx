"use client";

import Link from "next/link";
import { Heart, Star } from "lucide-react";
import { Product } from "@/lib/types";
import { cn, discountPercent, formatZAR } from "@/lib/utils";
import { useWishlistStore } from "@/lib/store/wishlist";
import { useCartStore } from "@/lib/store/cart";
import { getStockStatus } from "@/lib/product";
import { ProductImage } from "@/components/ui/ProductImage";

const badgeStyles: Record<string, string> = {
  New: "bg-ink text-paper",
  Sale: "bg-secondary text-paper",
  "Best Seller": "bg-primary text-ink",
  "Low Stock": "bg-mist text-ink-500 border border-line",
};

export function ProductCard({ product }: { product: Product }) {
  const wishlisted = useWishlistStore((s) => s.has(product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const addItem = useCartStore((s) => s.addItem);
  const off = discountPercent(product.price, product.compareAtPrice);
  const stockStatus = getStockStatus(product);
  const outOfStock = stockStatus === "out-of-stock";

  return (
    <div className="group relative flex flex-col">
      <div className="relative aspect-[4/5] overflow-hidden bg-mist">
        <Link href={`/product/${product.slug}`} className="block h-full w-full">
          <ProductImage
            src={product.images[0]}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            containerClassName="h-full w-full"
            className={cn(
              "object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]",
              outOfStock && "grayscale"
            )}
          />
        </Link>

        {outOfStock ? (
          <span className="absolute left-3 top-3 bg-ink/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-paper">
            Out of Stock
          </span>
        ) : (
          product.badge && (
            <span
              className={cn(
                "absolute left-3 top-3 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
                badgeStyles[product.badge]
              )}
            >
              {product.badge}
            </span>
          )
        )}

        <button
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={() => toggleWishlist(product.id)}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center bg-paper/90 backdrop-blur transition-colors hover:bg-paper"
        >
          <Heart
            size={16}
            className={wishlisted ? "fill-secondary text-secondary" : "text-ink-500"}
          />
        </button>

        <button
          onClick={() => addItem(product.id)}
          disabled={outOfStock}
          className="absolute inset-x-0 bottom-0 translate-y-0 bg-ink py-3 text-center text-xs font-medium uppercase tracking-wide text-paper transition-transform duration-300 ease-out disabled:cursor-not-allowed disabled:bg-ink-400 md:translate-y-full md:group-hover:translate-y-0 md:group-focus-within:translate-y-0"
        >
          {outOfStock ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-1">
        <span className="eyebrow">{product.brand}</span>
        <Link href={`/product/${product.slug}`} className="text-sm font-medium text-ink hover:underline underline-offset-4">
          {product.title}
        </Link>

        <div className="flex items-center gap-1 text-xs text-ink-400">
          <Star size={12} className="fill-primary text-primary" />
          <span>{product.rating}</span>
          <span>({product.reviewCount})</span>
        </div>

        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-sm font-semibold text-ink">{formatZAR(product.price)}</span>
          {product.compareAtPrice && (
            <>
              <span className="text-xs text-ink-400 line-through">
                {formatZAR(product.compareAtPrice)}
              </span>
              <span className="text-xs font-medium text-secondary">-{off}%</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
