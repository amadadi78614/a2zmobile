"use client";

import { FilterPanel } from "@/components/shop/FilterPanel";
import type { AvailabilityFilter } from "@/components/shop/FilterPanel";
import { Category } from "@/lib/types";

export function FilterSidebar(props: {
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
    <aside className="hidden w-56 shrink-0 lg:block">
      <FilterPanel {...props} />
    </aside>
  );
}
