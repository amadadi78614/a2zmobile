"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FilterPanel } from "@/components/shop/FilterPanel";
import type { AvailabilityFilter } from "@/components/shop/FilterPanel";
import { Category } from "@/lib/types";

export function MobileFilterDrawer({
  open,
  onClose,
  resultCount,
  ...panelProps
}: {
  open: boolean;
  onClose: () => void;
  resultCount: number;
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-[100] bg-ink/55 transition-opacity duration-300 lg:hidden",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      )}
      onClick={onClose}
      aria-hidden={!open}
    >
      <aside
        className={cn(
          "absolute inset-y-0 right-0 flex h-dvh w-[86%] max-w-sm flex-col bg-paper shadow-2xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Filter products"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-line px-6 py-5">
          <span className="font-display text-xl font-semibold">Filters</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-ink/5"
          >
            <X size={24} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-8 pt-6">
          <FilterPanel {...panelProps} />
        </div>

        <div className="shrink-0 border-t border-line px-6 py-4">
          <button onClick={onClose} className="btn-primary w-full">
            Show {resultCount} result{resultCount === 1 ? "" : "s"}
          </button>
        </div>
      </aside>
    </div>,
    document.body
  );
}
