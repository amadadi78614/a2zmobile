"use client";

import { Category } from "@/lib/types";

export type PriceBand = { id: string; label: string; min: number; max: number };

export const PRICE_BANDS: PriceBand[] = [
  { id: "0-500", label: "Under R500", min: 0, max: 500 },
  { id: "500-1000", label: "R500 – R1,000", min: 500, max: 1000 },
  { id: "1000-2000", label: "R1,000 – R2,000", min: 1000, max: 2000 },
  { id: "2000-999999", label: "Over R2,000", min: 2000, max: Infinity },
];

export type AvailabilityFilter = "all" | "in-stock" | "out-of-stock";

export function FilterPanel({
  categories,
  activeCategory,
  onCategoryChange,
  categoryCounts,
  availableBrands,
  activeBrands,
  onToggleBrand,
  brandCounts,
  activePriceBand,
  onPriceBandChange,
  availability,
  onAvailabilityChange,
  onClearAll,
  hasActiveFilters,
}: {
  categories: Category[];
  activeCategory: string | null;
  onCategoryChange: (slug: string | null) => void;
  categoryCounts: Record<string, number>;
  availableBrands: string[];
  activeBrands: string[];
  onToggleBrand: (brand: string) => void;
  brandCounts: Record<string, number>;
  activePriceBand: string | null;
  onPriceBandChange: (id: string | null) => void;
  availability: AvailabilityFilter;
  onAvailabilityChange: (v: AvailabilityFilter) => void;
  onClearAll: () => void;
  hasActiveFilters: boolean;
}) {
  return (
    <div>
      {hasActiveFilters && (
        <button
          onClick={onClearAll}
          className="mb-8 text-xs font-medium text-secondary underline underline-offset-4"
        >
          Clear all filters
        </button>
      )}

      <div>
        <h3 className="eyebrow mb-4">Category</h3>
        <ul className="flex flex-col gap-2.5">
          <li>
            <button
              onClick={() => onCategoryChange(null)}
              className={`text-sm ${!activeCategory ? "font-semibold text-secondary" : "text-ink-500 hover:text-ink"}`}
            >
              All Products
            </button>
          </li>
          {categories.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-2">
              <button
                onClick={() => onCategoryChange(c.slug)}
                className={`text-sm ${activeCategory === c.slug ? "font-semibold text-secondary" : "text-ink-500 hover:text-ink"}`}
              >
                {c.name}
              </button>
              <span className="text-xs text-ink-400">{categoryCounts[c.slug] ?? 0}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-10 border-t border-line pt-8">
        <h3 className="eyebrow mb-4">Brand</h3>
        <ul className="flex flex-col gap-2.5">
          {availableBrands.map((brand) => {
            const id = `brand-${brand}`;
            return (
              <li key={brand} className="flex items-center justify-between gap-2.5">
                <span className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id={id}
                    checked={activeBrands.includes(brand)}
                    onChange={() => onToggleBrand(brand)}
                    className="h-4 w-4 accent-ink"
                  />
                  <label htmlFor={id} className="text-sm text-ink-500">{brand}</label>
                </span>
                <span className="text-xs text-ink-400">{brandCounts[brand] ?? 0}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-10 border-t border-line pt-8">
        <h3 className="eyebrow mb-4">Price</h3>
        <div className="flex flex-col gap-3">
          {PRICE_BANDS.map((band) => (
            <label key={band.id} className="flex items-center gap-2.5 text-sm text-ink-500">
              <input
                type="radio"
                name="price-band"
                checked={activePriceBand === band.id}
                onChange={() => onPriceBandChange(band.id)}
                className="h-4 w-4 accent-ink"
              />
              {band.label}
            </label>
          ))}
          {activePriceBand && (
            <button
              onClick={() => onPriceBandChange(null)}
              className="w-fit text-xs text-ink-400 underline underline-offset-4 hover:text-ink"
            >
              Clear price filter
            </button>
          )}
        </div>
      </div>

      <div className="mt-10 border-t border-line pt-8">
        <h3 className="eyebrow mb-4">Availability</h3>
        <div className="flex flex-col gap-3">
          {(
            [
              { id: "all", label: "All" },
              { id: "in-stock", label: "In Stock" },
              { id: "out-of-stock", label: "Out of Stock" },
            ] as { id: AvailabilityFilter; label: string }[]
          ).map((opt) => (
            <label key={opt.id} className="flex items-center gap-2.5 text-sm text-ink-500">
              <input
                type="radio"
                name="availability"
                checked={availability === opt.id}
                onChange={() => onAvailabilityChange(opt.id)}
                className="h-4 w-4 accent-ink"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
