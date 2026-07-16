"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, User, Menu, X, ChevronDown, Search, MessageCircle, Flag, BadgeCheck, Truck, Lock, ChevronRight, Bluetooth, Smartphone, Zap, Fan, Flame, Package, MonitorSmartphone, Wrench } from "lucide-react";
import { categories } from "@/lib/data/categories";
import { getPillar } from "@/lib/data/taxonomy";
import { taxonomyIconMap } from "@/lib/taxonomyIcons";
import { useCartStore } from "@/lib/store/cart";
import { useWishlistStore } from "@/lib/store/wishlist";
import { cn } from "@/lib/utils";
import { HeaderSearch } from "@/components/layout/HeaderSearch";
import { createClient } from "@/lib/supabase/client";

// Top trust bar content — clean icons (not emoji), one linked item (delivery -> /shipping).
const trustBarItems: { Icon: typeof Flag; label: string; href?: string }[] = [
  { Icon: Flag, label: "South African Owned" },
  { Icon: BadgeCheck, label: "Genuine Products" },
  { Icon: Truck, label: "Fast Nationwide Delivery", href: "/shipping" },
  { Icon: Lock, label: "Secure Online Shopping" },
];

// Used only by the mobile drawer's existing flat category list (src/lib/data/categories.ts,
// unrelated to the Sprint 2B taxonomy below) — kept separate from taxonomyIconMap since the two
// use different slug spaces.
const flatCategoryIcons: Record<string, typeof Bluetooth> = {
  "bluetooth-speakers": Bluetooth,
  "phone-covers": Smartphone,
  "chargers-cables": Zap,
  fans: Fan,
  hookah: Flame,
  "mobile-accessories": Package,
  "lcd-screens": MonitorSmartphone,
  "repair-parts": Wrench,
};

// Canonical top-level nav, per Sprint 2A.1: Home, Shop, Brands, Deals, Track Order, Support —
// nothing else. "Shop" gets a mega-menu rather than being a flat link; Home is rendered
// separately on desktop since it also doubles as the mobile drawer's first quick link.
const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Brands", href: "/shop" },
  { label: "Deals", href: "/shop?filter=deals" },
  { label: "Track Order", href: "/track-order" },
  { label: "Support", href: "/faq" },
];

// Sprint 2B: mega menu rebuilt off the real pillar/group/subcategory taxonomy
// (src/lib/data/taxonomy.ts) instead of the old flat 8-category list — Mobile & Tech is visually
// dominant (2 columns, all 11 groups), Hookah gets a compact subcategory list, Vape is clearly
// marked "Coming Soon" rather than presented as live. Adding a new group/subcategory later is a
// pure data change in taxonomy.ts — nothing here needs to change.
const mobileTechPillar = getPillar("mobile-tech")!;
const hookahPillar = getPillar("hookah")!;
const vapePillar = getPillar("vape")!;

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
              const Icon = flatCategoryIcons[category.slug];
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
        {/* Trust bar — desktop: compact static row. Mobile: smooth ticker (previously this
            entire bar was `hidden md:block`, i.e. absent on mobile; the ticker treatment is
            what makes it fit on small screens instead of just hiding it). */}
        <div className="hidden bg-ink text-paper md:block">
          <div className="container-content flex items-center justify-center divide-x divide-paper/15 py-2 text-[11px]">
            {trustBarItems.map((item) => {
              const inner = (
                <span className="flex items-center gap-1.5">
                  <item.Icon size={13} className="text-primary" strokeWidth={2} />
                  <span className="font-medium uppercase tracking-wider text-paper/80">{item.label}</span>
                </span>
              );
              return (
                <div key={item.label} className="px-5 first:pl-0 last:pr-0">
                  {item.href ? (
                    <Link href={item.href} className="transition-colors hover:opacity-80">
                      {inner}
                    </Link>
                  ) : (
                    inner
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="overflow-hidden bg-ink py-2 md:hidden">
          <div className="flex w-max animate-marquee motion-reduce:animate-none">
            {[...trustBarItems, ...trustBarItems].map((item, i) => {
              const inner = (
                <>
                  <item.Icon size={12} className="text-primary" strokeWidth={2} />
                  <span className="whitespace-nowrap px-2 text-[10px] font-medium uppercase tracking-wider text-paper/80">
                    {item.label}
                  </span>
                </>
              );
              return (
                <div key={i} className="flex items-center px-4">
                  {item.href ? (
                    <Link href={item.href} className="flex items-center">
                      {inner}
                    </Link>
                  ) : (
                    <span className="flex items-center">{inner}</span>
                  )}
                  <span className="h-1 w-1 rounded-full bg-primary" />
                </div>
              );
            })}
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
                  className="absolute left-0 top-full w-[720px] animate-fadeUp border border-line bg-paper p-8 shadow-premium"
                  onFocus={() => setMegaOpen(true)}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) setMegaOpen(false);
                  }}
                >
                  <div className="grid grid-cols-3 gap-x-10">
                    {/* Mobile & Tech — dominant: 2 of 3 columns, all 11 groups */}
                    <div className="col-span-2">
                      <div className="mb-4 flex items-baseline justify-between">
                        <p className="eyebrow text-ink-400">{mobileTechPillar.name}</p>
                        <Link href={`/shop/${mobileTechPillar.slug}`} className="text-xs font-medium text-secondary hover:underline">
                          Shop all &rarr;
                        </Link>
                      </div>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                        {mobileTechPillar.groups.map((group) => {
                          const Icon = taxonomyIconMap[group.icon];
                          return (
                            <Link
                              key={group.slug}
                              href={`/shop/${mobileTechPillar.slug}/${group.slug}`}
                              className="flex items-center gap-2.5 py-2 text-sm text-ink-500 hover:text-secondary"
                            >
                              {Icon && <Icon size={15} className="shrink-0 text-ink-400" strokeWidth={1.75} />}
                              <span>{group.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                    {/* Hookah + Vape — 3rd column */}
                    <div className="col-span-1 flex flex-col gap-8 border-l border-line pl-8">
                      <div>
                        <div className="mb-3 flex items-baseline justify-between">
                          <p className="eyebrow text-ink-400">{hookahPillar.name}</p>
                          <Link href={`/shop/${hookahPillar.slug}`} className="text-xs font-medium text-secondary hover:underline">
                            All &rarr;
                          </Link>
                        </div>
                        <div className="flex flex-col gap-1">
                          {hookahPillar.groups[0].subcategories.slice(0, 5).map((sub) => (
                            <Link
                              key={sub.slug}
                              href={`/shop/${hookahPillar.slug}?subcategory=${sub.slug}`}
                              className="py-1 text-sm text-ink-500 hover:text-secondary"
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="eyebrow mb-3 text-ink-400">{vapePillar.name}</p>
                        <p className="text-sm text-ink-400">{vapePillar.tagline}.</p>
                        <Link
                          href={`/shop/${vapePillar.slug}`}
                          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-secondary hover:underline"
                        >
                          Get notified <ChevronRight size={12} />
                        </Link>
                      </div>
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
