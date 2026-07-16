"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, User, Menu, X, ChevronDown, Search, MessageCircle, Bluetooth, Smartphone, Zap, Fan, Flame, Package, MonitorSmartphone, Wrench } from "lucide-react";
import { categories } from "@/lib/data/categories";
import { useCartStore } from "@/lib/store/cart";
import { useWishlistStore } from "@/lib/store/wishlist";
import { cn } from "@/lib/utils";
import { HeaderSearch } from "@/components/layout/HeaderSearch";
import { createClient } from "@/lib/supabase/client";

// Canonical top-level nav, per Sprint 2A.1: Home, Shop, Brands, Deals, Track Order, Support —
// nothing else. "Shop" gets a mega-menu (all categories, incl. Hookah) rather than being a flat
// link; Home is rendered separately on desktop since it also doubles as the mobile drawer's
// first quick link. No individual category (Hookah or otherwise) is hardcoded here anymore —
// categories flow generically from src/lib/data/categories into the mega menu, mobile drawer,
// filters, and /shop?category=... pages.
const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Brands", href: "/shop" },
  { label: "Deals", href: "/shop?filter=deals" },
  { label: "Track Order", href: "/track-order" },
  { label: "Support", href: "/faq" },
];

// Sprint 2A.2: mega menu grouped into pillars for a more premium feel, but every entry maps to
// a real, populated category — no fabricated subcategories (Networking, Smart Gadgets, Vape,
// etc. were requested but don't exist in the catalog; see Sprint 2A.2 notes).
const categoryIcons: Record<string, typeof Bluetooth> = {
  "bluetooth-speakers": Bluetooth,
  "phone-covers": Smartphone,
  "chargers-cables": Zap,
  fans: Fan,
  hookah: Flame,
  "mobile-accessories": Package,
  "lcd-screens": MonitorSmartphone,
  "repair-parts": Wrench,
};

const megaMenuGroups = [
  { title: "Mobile & Tech", slugs: ["bluetooth-speakers", "phone-covers", "chargers-cables", "fans", "mobile-accessories", "lcd-screens", "repair-parts"] },
  { title: "Hookah", slugs: ["hookah"] },
];

export function Header() {
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  // `undefined` = still checking, `null` = signed out, object = signed in. Read-only use of the
  // existing Supabase client (same pattern already used in login/checkout) — no auth logic changed.
  const [user, setUser] = useState<{ firstName: string } | null | undefined>(undefined);
  const cartCount = useCartStore((s) => s.lines.reduce((n, l) => n + l.quantity, 0));
  const wishlistCount = useWishlistStore((s) => s.productIds.length);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const authUser = data.user;
      setUser(
        authUser
          ? { firstName: (authUser.user_metadata?.full_name as string | undefined)?.split(" ")[0] || "Account" }
          : null
      );
    });
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(
        session?.user
          ? { firstName: (session.user.user_metadata?.full_name as string | undefined)?.split(" ")[0] || "Account" }
          : null
      );
    });
    return () => subscription.subscription.unsubscribe();
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
          <Link
            href={user ? "/account" : "/login"}
            onClick={() => setMobileOpen(false)}
            className="mb-6 flex items-center justify-between border border-line px-4 py-3.5"
          >
            <span className="flex items-center gap-3">
              <User size={18} />
              <span className="text-sm font-medium">{user ? `Hi, ${user.firstName}` : "Sign In"}</span>
            </span>
            {!user && <span className="text-xs text-ink-400">or Register</span>}
          </Link>

          <div className="mb-6 grid grid-cols-2 gap-3">
            <Link
              href="/wishlist"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between border border-line px-4 py-3.5"
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <Heart size={16} /> Wishlist
              </span>
              {wishlistCount > 0 && <span className="text-xs text-ink-400">{wishlistCount}</span>}
            </Link>
            <Link
              href="/cart"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between border border-line px-4 py-3.5"
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <ShoppingBag size={16} /> Cart
              </span>
              {cartCount > 0 && <span className="text-xs text-ink-400">{cartCount}</span>}
            </Link>
          </div>

          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink/45">
            Categories
          </p>
          <div className="flex flex-col">
            {categories.map((category) => {
              const Icon = categoryIcons[category.slug];
              return (
                <Link
                  key={category.id}
                  href={`/shop?category=${category.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex min-h-12 items-center justify-between border-b border-line py-3 text-base font-medium text-ink"
                >
                  <span className="flex items-center gap-3">
                    {Icon && <Icon size={16} className="shrink-0 text-ink-400" strokeWidth={1.75} />}
                    {category.name}
                  </span>
                  <span className="text-xs font-normal text-ink/45">{category.productCount}</span>
                </Link>
              );
            })}
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
            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="flex min-h-12 items-center gap-2 border-b border-line py-3 text-base font-medium text-ink"
            >
              <MessageCircle size={16} className="text-secondary" /> Contact &amp; WhatsApp
            </Link>
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
              <Link href="/faq" className="hover:text-primary">Help</Link>
            </div>
          </div>
        </div>

        <div className="container-content flex items-center gap-5 py-4 lg:gap-8">
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
            <Link href="/" className="px-4 py-2 text-sm font-medium text-ink hover:text-secondary">
              Home
            </Link>

            <div
              className="relative"
              onMouseEnter={() => setMegaOpen(true)}
              onMouseLeave={() => setMegaOpen(false)}
            >
              <Link
                href="/shop"
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-ink hover:text-secondary"
                onFocus={() => setMegaOpen(true)}
                aria-expanded={megaOpen}
                aria-haspopup="true"
              >
                Shop <ChevronDown size={14} />
              </Link>
              {megaOpen && (
                <div
                  className="absolute left-0 top-full w-[640px] animate-fadeUp border border-line bg-paper p-8 shadow-premium"
                  onFocus={() => setMegaOpen(true)}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) setMegaOpen(false);
                  }}
                >
                  <div className="grid grid-cols-3 gap-x-10">
                    {megaMenuGroups.map((group) => (
                      <div key={group.title} className={group.slugs.length > 1 ? "col-span-2" : "col-span-1"}>
                        <p className="eyebrow mb-4 text-ink-400">{group.title}</p>
                        <div className={cn("grid gap-x-6 gap-y-1", group.slugs.length > 4 ? "grid-cols-2" : "grid-cols-1")}>
                          {group.slugs.map((slug) => {
                            const category = categories.find((c) => c.slug === slug);
                            if (!category) return null;
                            const Icon = categoryIcons[slug];
                            return (
                              <Link
                                key={category.id}
                                href={`/shop?category=${category.slug}`}
                                className="flex items-center gap-2.5 py-2 text-sm text-ink-500 hover:text-secondary"
                              >
                                {Icon && <Icon size={15} className="shrink-0 text-ink-400" strokeWidth={1.75} />}
                                <span>{category.name}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    <div className="col-span-1 flex flex-col justify-between border-l border-line pl-8">
                      <div>
                        <p className="eyebrow mb-3 text-ink-400">Coming Soon</p>
                        <p className="text-sm text-ink-400">Vape range landing soon.</p>
                      </div>
                      <Link href="/shop" className="mt-6 text-xs font-medium text-secondary underline underline-offset-4">
                        Shop everything &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {navLinks.slice(2).map((link) => (
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

          <div className="ml-auto flex items-center gap-5 md:ml-0 lg:gap-6">
            <Link href="/search" className="md:hidden" aria-label="Search">
              <Search size={20} />
            </Link>

            <Link
              href={user ? "/account" : "/login"}
              className="hidden flex-col leading-tight sm:flex"
              aria-label={user ? "Account" : "Sign in"}
            >
              <span className="text-[10px] text-ink-400">{user ? `Hi, ${user.firstName}` : "Welcome"}</span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                <User size={16} />
                {user ? "Account" : "Sign In"}
              </span>
            </Link>
            {user === null && (
              <Link href="/register" className="hidden text-xs font-medium text-ink-500 hover:text-ink lg:block">
                Register
              </Link>
            )}

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
