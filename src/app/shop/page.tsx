"use client";

import { useCallback, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { products } from "@/lib/data/products";
import { categories } from "@/lib/data/categories";
import { ProductCard } from "@/components/product/ProductCard";
import { FilterSidebar } from "@/components/shop/FilterSidebar";
import { MobileFilterDrawer } from "@/components/shop/MobileFilterDrawer";
import { SortBar } from "@/components/shop/SortBar";
import { PRICE_BANDS } from "@/components/shop/FilterPanel";
import type { AvailabilityFilter } from "@/components/shop/FilterPanel";

// Filters live in the URL (?category=&brand=&price=&availability=) rather than local-only state,
// so results are shareable, survive a refresh, and work with the back button — e.g.
// /shop?brand=JBL&category=bluetooth-speakers&price=1000-2000
function ShopContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const category = searchParams.get("category");
  const brands = useMemo(
    () => (searchParams.get("brand") ? searchParams.get("brand")!.split(",").filter(Boolean) : []),
    [searchParams]
  );
  const priceBand = searchParams.get("price");
  const availability = (searchParams.get("availability") as AvailabilityFilter) || "all";

  const [sort, setSort] = useState("featured");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") next.delete(key);
        else next.set(key, value);
      });
      router.push(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const setCategory = (slug: string | null) => updateParams({ category: slug });
  const toggleBrand = (brand: string) => {
    const next = brands.includes(brand) ? brands.filter((b) => b !== brand) : [...brands, brand];
    updateParams({ brand: next.length ? next.join(",") : null });
  };
  const setPriceBand = (id: string | null) => updateParams({ price: id });
  const setAvailability = (v: AvailabilityFilter) => updateParams({ availability: v === "all" ? null : v });
  const clearAll = () => updateParams({ category: null, brand: null, price: null, availability: null });

  const hasActiveFilters = Boolean(category || brands.length || priceBand || (availability && availability !== "all"));

  const availableBrands = useMemo(
    () => Array.from(new Set(products.map((p) => p.brand))).sort((a, b) => a.localeCompare(b)),
    []
  );

  // Counts reflect the *current* category selection (a common Amazon/Takealot pattern: brand
  // counts update to match what's actually filterable within the category you're already in).
  const categoryScoped = useMemo(
    () => (category ? products.filter((p) => p.categorySlug === category) : products),
    [category]
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of categories) counts[c.slug] = products.filter((p) => p.categorySlug === c.slug).length;
    return counts;
  }, []);

  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const b of availableBrands) counts[b] = categoryScoped.filter((p) => p.brand === b).length;
    return counts;
  }, [availableBrands, categoryScoped]);

  const activeBand = PRICE_BANDS.find((b) => b.id === priceBand) ?? null;

  const filtered = useMemo(() => {
    let list = category ? products.filter((p) => p.categorySlug === category) : products;
    if (brands.length) list = list.filter((p) => brands.includes(p.brand));
    if (activeBand) list = list.filter((p) => p.price >= activeBand.min && p.price <= activeBand.max);
    if (availability === "in-stock") list = list.filter((p) => p.stock > 0);
    if (availability === "out-of-stock") list = list.filter((p) => p.stock === 0);

    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    // "Newest" has no real createdAt field to sort by (mock catalog, no fabricated dates) —
    // reverse catalog order is an honest proxy: doesn't claim a false date, just an order.
    if (sort === "newest") list = [...list].reverse();
    if (sort === "alphabetical") list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    // reviewCount as a popularity proxy — no real sales-volume data exists to sort by yet.
    if (sort === "best-selling") list = [...list].sort((a, b) => b.reviewCount - a.reviewCount);
    return list;
  }, [category, brands, activeBand, availability, sort]);

  const filterPanelProps = {
    categories,
    activeCategory: category,
    onCategoryChange: setCategory,
    categoryCounts,
    availableBrands,
    activeBrands: brands,
    onToggleBrand: toggleBrand,
    brandCounts,
    activePriceBand: priceBand,
    onPriceBandChange: setPriceBand,
    availability,
    onAvailabilityChange: setAvailability,
    onClearAll: clearAll,
    hasActiveFilters,
  };

  return (
    <div className="container-content py-10 md:py-14">
      <div className="mb-8">
        <span className="eyebrow">Shop</span>
        <h1 className="mt-2 text-3xl font-semibold">All Products</h1>
      </div>

      <div className="flex gap-10">
        <FilterSidebar {...filterPanelProps} />

        <MobileFilterDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          resultCount={filtered.length}
          {...filterPanelProps}
        />

        <div className="flex-1">
          <SortBar
            count={filtered.length}
            sort={sort}
            onSortChange={setSort}
            view={view}
            onViewChange={setView}
            onOpenFilters={() => setDrawerOpen(true)}
            activeFilterCount={(category ? 1 : 0) + brands.length + (priceBand ? 1 : 0) + (availability !== "all" ? 1 : 0)}
          />

          <div
            className={
              view === "grid"
                ? "mt-8 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 xl:grid-cols-4"
                : "mt-8 flex flex-col gap-6"
            }
          >
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="mt-16 text-center">
              <p className="text-sm text-ink-400">No products match these filters yet.</p>
              <button onClick={clearAll} className="mt-4 text-sm font-medium text-ink underline underline-offset-4">
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={null}>
      <ShopContent />
    </Suspense>
  );
}
