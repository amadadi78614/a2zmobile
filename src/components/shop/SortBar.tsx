"use client";

import { Grid2X2, List, SlidersHorizontal } from "lucide-react";

export function SortBar({
  count,
  sort,
  onSortChange,
  view,
  onViewChange,
  onOpenFilters,
  activeFilterCount,
}: {
  count: number;
  sort: string;
  onSortChange: (v: string) => void;
  view: "grid" | "list";
  onViewChange: (v: "grid" | "list") => void;
  onOpenFilters: () => void;
  activeFilterCount: number;
}) {
  return (
    <div className="flex items-center justify-between border-b border-line pb-5">
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenFilters}
          className="flex items-center gap-2 border border-line px-3 py-2 text-sm font-medium text-ink lg:hidden"
        >
          <SlidersHorizontal size={14} />
          Filters
          {activeFilterCount > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[10px] text-paper">
              {activeFilterCount}
            </span>
          )}
        </button>
        <span className="text-sm text-ink-400">{count} products</span>
      </div>
      <div className="flex items-center gap-4">
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="border border-line bg-transparent px-3 py-2 text-sm outline-none"
        >
          <option value="featured">Featured</option>
          <option value="newest">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="best-selling">Best Selling</option>
          <option value="rating">Highest Rated</option>
          <option value="alphabetical">Alphabetical</option>
        </select>
        <div className="hidden items-center gap-1 sm:flex">
          <button
            onClick={() => onViewChange("grid")}
            className={view === "grid" ? "text-ink" : "text-ink-400"}
            aria-label="Grid view"
          >
            <Grid2X2 size={18} />
          </button>
          <button
            onClick={() => onViewChange("list")}
            className={view === "list" ? "text-ink" : "text-ink-400"}
            aria-label="List view"
          >
            <List size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
