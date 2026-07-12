"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, X } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { products } from "@/lib/data/products";
import { formatZAR } from "@/lib/utils";

export default function CartPage() {
  const lines = useCartStore((s) => s.lines);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const items = lines
    .map((line) => ({ line, product: products.find((p) => p.id === line.productId) }))
    .filter((i) => i.product);

  const subtotal = items.reduce((sum, i) => sum + i.product!.price * i.line.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="container-content flex flex-col items-center py-24 text-center">
        <h1 className="text-2xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 text-sm text-ink-400">Browse the shop to find something you&apos;ll love.</p>
        <Link href="/shop" className="btn-primary mt-8">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container-content py-10 md:py-14">
      <h1 className="text-2xl font-semibold sm:text-3xl">Shopping Cart</h1>

      <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="divide-y divide-line lg:col-span-2">
          {items.map(({ line, product }) => (
            <div key={`${line.productId}-${line.colorway}`} className="flex gap-5 py-6">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden bg-mist">
                <Image src={product!.images[0]} alt={product!.title} fill sizes="96px" className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between">
                  <div>
                    <Link href={`/product/${product!.slug}`} className="text-sm font-medium hover:underline">
                      {product!.title}
                    </Link>
                    {line.colorway && <p className="mt-1 text-xs text-ink-400">Colour: {line.colorway}</p>}
                  </div>
                  <button
                    onClick={() => removeItem(line.productId, line.colorway)}
                    aria-label="Remove item"
                    className="text-ink-400 hover:text-ink"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="mt-auto flex items-center justify-between pt-4">
                  <div className="flex items-center border border-line">
                    <button
                      onClick={() => setQuantity(line.productId, line.quantity - 1, line.colorway)}
                      className="p-2 text-ink-500 hover:text-ink"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-7 text-center text-xs font-medium">{line.quantity}</span>
                    <button
                      onClick={() => setQuantity(line.productId, line.quantity + 1, line.colorway)}
                      className="p-2 text-ink-500 hover:text-ink"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <span className="text-sm font-semibold">
                    {formatZAR(product!.price * line.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit border border-line p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide">Order Summary</h2>
          <div className="mt-4 flex justify-between text-sm">
            <span className="text-ink-400">Subtotal</span>
            <span className="font-medium">{formatZAR(subtotal)}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-ink-400">Delivery</span>
            <span className="font-medium">Calculated at checkout</span>
          </div>
          <div className="mt-4 flex justify-between border-t border-line pt-4 text-base font-semibold">
            <span>Total</span>
            <span>{formatZAR(subtotal)}</span>
          </div>
          <Link href="/checkout" className="btn-primary mt-6 w-full">
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
