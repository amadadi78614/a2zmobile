"use client";

import { categories } from "@/lib/data/categories";
import { brands } from "@/lib/data/brands";

export function FilterSidebar({
  activeCategory,
  onCategoryChange,
}: {
  activeCategory: string | null;
  onCategoryChange: (slug: string | null) => void;
}) {
  return (
    <aside className="hidden w-56 shrink-0 lg:block">
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
            <li key={c.id}>
              <button
                onClick={() => onCategoryChange(c.slug)}
                className={`text-sm ${activeCategory === c.slug ? "font-semibold text-secondary" : "text-ink-500 hover:text-ink"}`}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-10 border-t border-line pt-8">
        <h3 className="eyebrow mb-4">Brand</h3>
        <ul className="flex flex-col gap-2.5">
          {brands.map((b) => (
            <li key={b.id} className="flex items-center gap-2.5">
              <input type="checkbox" id={b.id} className="h-4 w-4 accent-ink" />
              <label htmlFor={b.id} className="text-sm text-ink-500">{b.name}</label>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-10 border-t border-line pt-8">
        <h3 className="eyebrow mb-4">Price</h3>
        <div className="flex flex-col gap-3">
          {[
            "Under R2,000",
            "R2,000 – R10,000",
            "R10,000 – R25,000",
            "Over R25,000",
          ].map((label) => (
            <label key={label} className="flex items-center gap-2.5 text-sm text-ink-500">
              <input type="checkbox" className="h-4 w-4 accent-ink" />
              {label}
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}
