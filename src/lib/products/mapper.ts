import "server-only";
import type { Product } from "@/lib/types";

/** The single Supabase select shape every product-reading query in this layer uses — one join
 * definition, reused everywhere, so there's no risk of two queries silently drifting into
 * different shapes of the same data. */
export const PRODUCT_SELECT =
  "*, brands(name, slug), categories(slug), product_images(url, is_primary, position), product_compatible_devices(device_models(name))";

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
