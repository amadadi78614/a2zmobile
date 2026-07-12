"use client";

import { useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { products } from "@/lib/data/products";
import { ProductCard } from "@/components/product/ProductCard";
import { FilterSidebar } from "@/components/shop/FilterSidebar";
import { SortBar } from "@/components/shop/SortBar";

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");

  const [category, setCategory] = useState<string | null>(initialCategory);
  const [sort, setSort] = useState("featured");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => {
    let list = category ? products.filter((p) => p.categorySlug === category) : products;
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [category, sort]);

  return (
    <div className="container-content py-10 md:py-14">
      <div className="mb-8">
        <span className="eyebrow">Shop</span>
        <h1 className="mt-2 text-3xl font-semibold">All Products</h1>
      </div>

      <div className="flex gap-10">
        <FilterSidebar activeCategory={category} onCategoryChange={setCategory} />

        <div className="flex-1">
          <SortBar count={filtered.length} sort={sort} onSortChange={setSort} view={view} onViewChange={setView} />

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
            <p className="mt-16 text-center text-sm text-ink-400">
              No products match these filters yet.
            </p>
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
