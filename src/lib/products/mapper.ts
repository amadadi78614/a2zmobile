import "server-only";
import type { Product } from "@/lib/types";

// `products` has TWO foreign keys into `categories` (category_id and subcategory_id), so a plain
// `categories(slug)` embed is ambiguous — PostgREST refuses to guess which one. Naming the FK
// explicitly (per PostgREST's own error hint) resolves it. Defined once so every query that
// needs to filter/join on category uses the exact same, correct reference.
export const CATEGORY_JOIN = "categories!products_category_id_fkey";

/** The single Supabase select shape most product-reading queries in this layer use — one join
 * definition, reused everywhere, so there's no risk of two queries silently drifting into
 * different shapes of the same data.
 *
 * product_compatible_devices was removed here after a live schema check showed the relationship
 * doesn't match what was assumed when this was first written (PostgREST: "no matches found").
 * Rather than guess a second time against a schema I still haven't directly inspected, this is
 * dropped safely — the mapper below already defaults compatibleDevices to [] when the field is
 * absent, so this degrades honestly (no compatibility info shown) instead of breaking every
 * product query. Restoring it is a small, separate follow-up once the real relationship is
 * confirmed directly.
 */
export const PRODUCT_SELECT =
  `*, brands(name, slug), ${CATEGORY_JOIN}(slug), product_images(url, is_primary, position)`;

/** Variant for queries that filter by category (getProductsByCategory, getRelatedProducts) —
 * needs an !inner join so `.eq("categories.slug", ...)` actually restricts rows, not just a
 * second, separately-ambiguous embed appended onto PRODUCT_SELECT. */
export const PRODUCT_SELECT_CATEGORY_FILTER =
  `*, brands(name, slug), ${CATEGORY_JOIN}!inner(slug), product_images(url, is_primary, position)`;

/** Variant for queries that filter by brand (getProductsByBrand, getCustomersAlsoBought) — same
 * reasoning, !inner on brands instead of categories. Selects both name and slug so it works
 * whether the caller filters on brands.slug or brands.name. */
export const PRODUCT_SELECT_BRAND_FILTER =
  `*, brands!inner(name, slug), ${CATEGORY_JOIN}(slug), product_images(url, is_primary, position)`;

/** The one row -> Product mapper for the whole storefront. Originally lived only in
 * src/lib/search/queries.ts; extracted here so search and every other customer-facing query
 * share exactly one implementation instead of two that could drift apart. */
export function rowToProduct(row: Record<string, unknown>): Product {
  const images = ((row.product_images as { url: string; is_primary?: boolean; position?: number }[]) ?? [])
    .slice()
    .sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (b.is_primary && !a.is_primary) return 1;
      return (a.position ?? 0) - (b.position ?? 0);
    })
    .map((i) => i.url);

  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    brand: ((row.brands as { name?: string } | null)?.name) ?? "",
    categorySlug: ((row.categories as { slug?: string } | null)?.slug) ?? "",
    price: Number(row.price),
    compareAtPrice: row.compare_at_price ? Number(row.compare_at_price) : undefined,
    images,
    sku: row.sku as string,
    barcode: (row.barcode as string) ?? undefined,
    stock: Number(row.stock),
    rating: Number(row.rating ?? 0),
    reviewCount: Number(row.review_count ?? 0),
    badge: row.badge as Product["badge"],
    colorway: (row.colorways as string[]) ?? [],
    // colorwayImages: no such column exists yet — always undefined against real data, same as
    // it always was against mock data (see the field's own doc comment in types.ts).
    shortDescription: (row.short_description as string) ?? "",
    description: (row.description as string) ?? "",
    specs: (row.specs as { label: string; value: string }[]) ?? [],
    warranty: (row.warranty as string) ?? "",
    compatibility: (row.compatibility as string[]) ?? [],
    compatibleDevices:
      (row.product_compatible_devices as { device_models: { name: string } | null }[] | undefined)
        ?.map((pcd) => pcd.device_models?.name)
        .filter((name): name is string => Boolean(name)) ?? [],
    tags: (row.tags as string[]) ?? [],
    searchKeywords: (row.search_keywords as string[]) ?? [],
    // subcategorySlugs: no product_subcategories table exists — always undefined against real
    // data. Per Critical Fix 2's explicit instruction, not built in this fix.
  };
}
