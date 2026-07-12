"use client";

import { Grid2X2, List } from "lucide-react";

export function SortBar({
  count,
  sort,
  onSortChange,
  view,
  onViewChange,
}: {
  count: number;
  sort: string;
  onSortChange: (v: string) => void;
  view: "grid" | "list";
  onViewChange: (v: "grid" | "list") => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-line pb-5">
      <span className="text-sm text-ink-400">{count} products</span>
      <div className="flex items-center gap-4">
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="border border-line bg-transparent px-3 py-2 text-sm outline-none"
        >
          <option value="featured">Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
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
