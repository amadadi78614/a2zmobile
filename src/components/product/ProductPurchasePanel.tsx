"use client";

import { useState } from "react";
import { Star, Heart, MessageCircle, Minus, Plus } from "lucide-react";
import { Product } from "@/lib/types";
import { cn, discountPercent, formatZAR } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart";
import { useWishlistStore } from "@/lib/store/wishlist";

export function ProductPurchasePanel({ product }: { product: Product }) {
  const [colorway, setColorway] = useState(product.colorway?.[0]);
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const wishlisted = useWishlistStore((s) => s.has(product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const off = discountPercent(product.price, product.compareAtPrice);
  const whatsappHref = `https://wa.me/27000000000?text=${encodeURIComponent(
    `Hi A2Z, I'd like to enquire about the ${product.title} (${product.sku}).`
  )}`;

  return (
    <div className="flex flex-col">
      <span className="eyebrow">{product.brand}</span>
      <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">{product.title}</h1>

      <div className="mt-3 flex items-center gap-2 text-sm">
        <div className="flex items-center gap-1">
          <Star size={14} className="fill-primary text-primary" />
          <span className="font-medium">{product.rating}</span>
        </div>
        <span className="text-ink-400">({product.reviewCount} reviews)</span>
        <span className="text-ink-400">&middot;</span>
        <span className="text-ink-400">SKU {product.sku}</span>
      </div>

      <div className="mt-6 flex items-baseline gap-3">
        <span className="text-3xl font-semibold">{formatZAR(product.price)}</span>
        {product.compareAtPrice && (
          <>
            <span className="text-base text-ink-400 line-through">
              {formatZAR(product.compareAtPrice)}
            </span>
            <span className="bg-secondary px-2 py-1 text-xs font-semibold text-paper">
              Save {off}%
            </span>
          </>
        )}
      </div>

      <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-500">
        {product.shortDescription}
      </p>

      <p className="mt-4 text-sm">
        {product.stock > 5 ? (
          <span className="text-ink-500">In Stock &middot; Ready to ship</span>
        ) : product.stock > 0 ? (
          <span className="font-medium text-secondary">Only {product.stock} left in stock</span>
        ) : (
          <span className="font-medium text-ink-400">Out of Stock</span>
        )}
      </p>

      {product.colorway && (
        <div className="mt-6">
          <span className="text-sm font-medium">Colour: {colorway}</span>
          <div className="mt-3 flex gap-2">
            {product.colorway.map((c) => (
              <button
                key={c}
                onClick={() => setColorway(c)}
                className={cn(
                  "border px-4 py-2 text-xs font-medium",
                  colorway === c ? "border-ink bg-ink text-paper" : "border-line text-ink-500 hover:border-ink"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 flex items-center gap-4">
        <div className="flex items-center border border-line">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="p-3 text-ink-500 hover:text-ink"
            aria-label="Decrease quantity"
          >
            <Minus size={14} />
          </button>
          <span className="w-8 text-center text-sm font-medium">{qty}</span>
          <button
            onClick={() => setQty((q) => q + 1)}
            className="p-3 text-ink-500 hover:text-ink"
            aria-label="Increase quantity"
          >
            <Plus size={14} />
          </button>
        </div>

        <button
          onClick={() => Array.from({ length: qty }).forEach(() => addItem(product.id, colorway))}
          disabled={product.stock === 0}
          className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Add to Cart
        </button>

        <button
          onClick={() => toggleWishlist(product.id)}
          aria-label="Toggle wishlist"
          className="border border-line p-3.5 hover:border-ink"
        >
          <Heart size={18} className={wishlisted ? "fill-secondary text-secondary" : "text-ink-500"} />
        </button>
      </div>

      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex items-center justify-center gap-2 border border-line py-3.5 text-sm font-medium text-ink-500 hover:border-ink hover:text-ink"
      >
        <MessageCircle size={16} />
        WhatsApp an enquiry about this item
      </a>

      {(product.compatibleDevices ?? product.compatibility) && (product.compatibleDevices ?? product.compatibility)!.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {(product.compatibleDevices ?? product.compatibility)!.map((c) => (
            <span key={c} className="border border-line px-3 py-1.5 text-xs text-ink-400">
              {c}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
