"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);
  const cartCount = useCartStore((s) => s.lines.reduce((n, l) => n + l.quantity, 0));
  const wishlistCount = useWishlistStore((s) => s.productIds.length);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen]);

  const mobileDrawer = (
    <div
      className={cn(
        "fixed inset-0 z-[100] bg-ink/55 transition-opacity duration-300 md:hidden",
        mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      )}
      onClick={() => setMobileOpen(false)}
      aria-hidden={!mobileOpen}
    >
      <aside
        className={cn(
          "absolute inset-y-0 left-0 flex h-dvh w-[86%] max-w-sm flex-col bg-paper shadow-2xl transition-transform duration-300 ease-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-line px-6 py-5">
          <span className="font-display text-2xl font-semibold">Menu</span>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-ink/5"
          >
            <X size={26} />
          </button>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-8 pt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink/45">
            Categories
          </p>
          <div className="flex flex-col">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/shop?category=${category.slug}`}
                onClick={() => setMobileOpen(false)}
                className="flex min-h-12 items-center justify-between border-b border-line py-3 text-base font-medium text-ink"
              >
                <span>{category.name}</span>
                <span className="text-xs font-normal text-ink/45">{category.productCount}</span>
              </Link>
            ))}
          </div>

          <p className="mb-2 mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-ink/45">
            Quick links
          </p>
          <div className="flex flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex min-h-12 items-center border-b border-line py-3 text-base font-medium text-ink"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      </aside>
    </div>
  );

  return (
    <>
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
            type="button"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
          >
            <Menu size={22} />
          </button>

          <Link href="/" className="flex shrink-0 items-center gap-2">
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
                <div className="absolute left-0 top-full w-[560px] animate-fadeUp border border-line bg-paper p-6 shadow-premium">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/shop?category=${category.slug}`}
                        className="flex items-center justify-between border-b border-line pb-3 text-sm hover:text-secondary"
                      >
                        <span>{category.name}</span>
                        <span className="text-xs text-ink-400">{category.productCount}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-ink hover:text-secondary"
              >
                {link.label}
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
      </header>

      {mounted && createPortal(mobileDrawer, document.body)}
    </>
  );
}
