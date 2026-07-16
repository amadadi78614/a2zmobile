"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Heart, MessageCircle, Minus, Plus, Share2, Check } from "lucide-react";
import { Product } from "@/lib/types";
import { cn, discountPercent, formatZAR } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart";
import { useWishlistStore } from "@/lib/store/wishlist";
import { getStockStatus } from "@/lib/product";

export function ProductPurchasePanel({
  product,
  onColorwayChange,
}: {
  product: Product;
  /** Called with the resolved image index for the selected colourway, if (and only if) a real
   * colorwayImages mapping exists for it — see the type definition for why this isn't guessed. */
  onColorwayChange?: (imageIndex: number | null) => void;
}) {
  const router = useRouter();
  const [colorway, setColorway] = useState(product.colorway?.[0]);
  const [qty, setQty] = useState(1);
  const [copied, setCopied] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const wishlisted = useWishlistStore((s) => s.has(product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const off = discountPercent(product.price, product.compareAtPrice);
  const stockStatus = getStockStatus(product);
  const whatsappHref = `https://wa.me/27000000000?text=${encodeURIComponent(
    `Hi A2Z, I'd like to enquire about the ${product.title} (${product.sku}).`
  )}`;

  function selectColorway(c: string) {
    setColorway(c);
    const mappedUrl = product.colorwayImages?.[c];
    const mappedIndex = mappedUrl ? product.images.indexOf(mappedUrl) : -1;
    onColorwayChange?.(mappedIndex >= 0 ? mappedIndex : null);
  }

  function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      navigator.share({ title: product.title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleBuyNow() {
    Array.from({ length: qty }).forEach(() => addItem(product.id, colorway));
    router.push("/cart");
  }

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
        {stockStatus === "in-stock" ? (
          <span className="text-ink-500">In Stock &middot; Ready to ship</span>
        ) : stockStatus === "low-stock" ? (
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
                onClick={() => selectColorway(c)}
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
            onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
            className="p-3 text-ink-500 hover:text-ink"
            aria-label="Increase quantity"
          >
            <Plus size={14} />
          </button>
        </div>

        <button
          onClick={() => Array.from({ length: qty }).forEach(() => addItem(product.id, colorway))}
          disabled={stockStatus === "out-of-stock"}
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

        <button
          onClick={handleShare}
          aria-label="Share this product"
          className="border border-line p-3.5 hover:border-ink"
        >
          {copied ? <Check size={18} className="text-secondary" /> : <Share2 size={18} className="text-ink-500" />}
        </button>
      </div>

      <button
        onClick={handleBuyNow}
        disabled={stockStatus === "out-of-stock"}
        className="btn-secondary mt-3 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Buy Now
      </button>

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
