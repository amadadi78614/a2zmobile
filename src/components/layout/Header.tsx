"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, User, Menu, X, ChevronDown, Search } from "lucide-react";
import { categories } from "@/lib/data/categories";
import { useCartStore } from "@/lib/store/cart";
import { useWishlistStore } from "@/lib/store/wishlist";
import { cn } from "@/lib/utils";
import { HeaderSearch } from "@/components/layout/HeaderSearch";

const navLinks = [
  { label: "Shop", href: "/shop" },
  { label: "Deals", href: "/shop?filter=deals" },
  { label: "Brands", href: "/shop" },
  { label: "Hookah", href: "/shop?category=hookah" },
];

export function Header() {
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const cartCount = useCartStore((s) => s.lines.reduce((n, l) => n + l.quantity, 0));
  const wishlistCount = useWishlistStore((s) => s.productIds.length);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/95 backdrop-blur">
      {/* Utility bar */}
      <div className="hidden bg-ink text-paper md:block">
        <div className="container-content flex items-center justify-between py-2 text-[11px] tracking-wide">
          <span>Mbombela &amp; Nelspruit &middot; Genuine stock &middot; Fast local delivery</span>
          <div className="flex gap-6">
            <Link href="/track-order" className="hover:text-primary">Track Order</Link>
            <Link href="/contact" className="hover:text-primary">Store Locator</Link>
          </div>
        </div>
      </div>

      <div className="container-content flex items-center gap-6 py-4">
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image src="/images/a2z-logo.png" alt="A2Z Mobile & Computer Services" width={40} height={40} />
          <span className="hidden font-display text-lg font-semibold tracking-tight sm:block">
            A2Z<span className="text-secondary">.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <div
            className="relative"
            onMouseEnter={() => setMegaOpen(true)}
            onMouseLeave={() => setMegaOpen(false)}
          >
            <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-ink hover:text-secondary">
              Categories <ChevronDown size={14} />
            </button>
            {megaOpen && (
              <div className="absolute left-0 top-full w-[560px] border border-line bg-paper p-6 shadow-premium animate-fadeUp">
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/shop?category=${c.slug}`}
                      className="flex items-center justify-between border-b border-line pb-3 text-sm hover:text-secondary"
                    >
                      <span>{c.name}</span>
                      <span className="text-xs text-ink-400">{c.productCount}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          {navLinks.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="px-4 py-2 text-sm font-medium text-ink hover:text-secondary"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <HeaderSearch />

        <div className="ml-auto flex items-center gap-5 md:ml-0">
          <Link href="/search" className="md:hidden" aria-label="Search">
            <Search size={20} />
          </Link>
          <Link href="/account" className="hidden sm:block" aria-label="Account">
            <User size={20} />
          </Link>
          <Link href="/wishlist" className="relative" aria-label="Wishlist">
            <Heart size={20} />
            {wishlistCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[10px] text-paper">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link href="/cart" className="relative" aria-label="Cart">
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-ink">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-ink/40 transition-opacity md:hidden",
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setMobileOpen(false)}
      >
        <div
          className={cn(
            "absolute inset-y-0 left-0 w-[82%] max-w-sm bg-paper p-6 transition-transform duration-300",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <span className="font-display text-lg font-semibold">Menu</span>
            <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
              <X size={22} />
            </button>
          </div>
          <div className="mt-8 flex flex-col gap-1">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/shop?category=${c.slug}`}
                onClick={() => setMobileOpen(false)}
                className="border-b border-line py-3 text-sm"
              >
                {c.name}
              </Link>
            ))}
            {navLinks.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="border-b border-line py-3 text-sm"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
