import { products } from "@/lib/data/products";
import type { CategoryGroup } from "@/lib/types";

export function productsForGroup(group: CategoryGroup, subcategorySlug?: string) {
  const validSlugs = new Set(group.subcategories.map((s) => s.slug));
  return products.filter((p) => {
    if (!p.subcategorySlugs?.length) return false;
    if (subcategorySlug) return p.subcategorySlugs.includes(subcategorySlug);
    return p.subcategorySlugs.some((s) => validSlugs.has(s));
  });
}
