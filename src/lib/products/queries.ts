import "server-only";
import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { rowToProduct, PRODUCT_SELECT, PRODUCT_SELECT_CATEGORY_FILTER, PRODUCT_SELECT_BRAND_FILTER } from "@/lib/products/mapper";
import type { Product } from "@/lib/types";

/** Thrown only when Supabase itself fails (network/connection/query error) — never for a
 * legitimate zero-row result, which is a normal empty array, not an error. Caught by
 * src/app/error.tsx to show the "database unavailable" state per Critical Fix 2's "Customer
 * Experience" section — pages never silently fall back to mock data. */
export class ProductServiceError extends Error {
  constructor(context: string, cause: unknown) {
    super(`Product service failed: ${context}`);
    this.name = "ProductServiceError";
    this.cause = cause;
  }
}

function logAndThrow(context: string, error: unknown): never {
  console.error(`[products] ${context} failed:`, error);
  throw new ProductServiceError(context, error);
}

const DEFAULT_LIST_LIMIT = 60;
const CACHE_REVALIDATE_SECONDS = 60;

// ---------- Cached, public, unauthenticated reads ----------
// unstable_cache can't depend on cookies/headers — createPublicClient() deliberately never reads
// either, so these are safe to cache. Tagged "products" so admin writes can invalidate them
// (see revalidateTag("products") calls added to src/lib/admin/actions.ts).

export const getAllProducts = unstable_cache(
  async ({ limit = DEFAULT_LIST_LIMIT, offset = 0 }: { limit?: number; offset?: number } = {}): Promise<Product[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .is("deleted_at", null)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) logAndThrow("getAllProducts", error);
    return (data ?? []).map(rowToProduct);
  },
  ["products:all"],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: ["products"] }
);

export const getFeaturedProducts = unstable_cache(
  async (limit = 8): Promise<Product[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .is("deleted_at", null)
      .eq("status", "published")
      .eq("is_featured", true)
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (error) logAndThrow("getFeaturedProducts", error);
    return (data ?? []).map(rowToProduct);
  },
  ["products:featured"],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: ["products"] }
);

export const getBestSellers = unstable_cache(
  async (limit = 8): Promise<Product[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .is("deleted_at", null)
      .eq("status", "published")
      .eq("badge", "Best Seller")
      .order("review_count", { ascending: false })
      .limit(limit);

    if (error) logAndThrow("getBestSellers", error);
    return (data ?? []).map(rowToProduct);
  },
  ["products:best-sellers"],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: ["products"] }
);

export const getNewArrivals = unstable_cache(
  async (limit = 8): Promise<Product[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .is("deleted_at", null)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) logAndThrow("getNewArrivals", error);
    return (data ?? []).map(rowToProduct);
  },
  ["products:new-arrivals"],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: ["products"] }
);

export const getDeals = unstable_cache(
  async (limit = 8): Promise<Product[]> => {
    const supabase = createPublicClient();
    // compare_at_price > price, expressed as a Postgres filter since supabase-js's query
    // builder has no direct "column > column" comparator.
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .is("deleted_at", null)
      .eq("status", "published")
      .not("compare_at_price", "is", null)
      .filter("compare_at_price", "gt", "price")
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (error) logAndThrow("getDeals", error);
    return (data ?? []).map(rowToProduct);
  },
  ["products:deals"],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: ["products"] }
);

export const getProductBySlug = unstable_cache(
  async (slug: string): Promise<Product | null> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("slug", slug)
      .is("deleted_at", null)
      .eq("status", "published")
      .maybeSingle();

    if (error) logAndThrow(`getProductBySlug(${slug})`, error);
    return data ? rowToProduct(data) : null;
  },
  ["products:by-slug"],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: ["products"] }
);

export const getProductsByCategory = unstable_cache(
  async (
    categorySlug: string,
    { limit = DEFAULT_LIST_LIMIT, offset = 0 }: { limit?: number; offset?: number } = {}
  ): Promise<{ products: Product[]; total: number }> => {
    const supabase = createPublicClient();
    const { data, error, count } = await supabase
      .from("products")
      .select(PRODUCT_SELECT_CATEGORY_FILTER, { count: "exact" })
      .eq("categories.slug", categorySlug)
      .is("deleted_at", null)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) logAndThrow(`getProductsByCategory(${categorySlug})`, error);
    return { products: ((data ?? []) as unknown as Record<string, unknown>[]).map(rowToProduct), total: count ?? 0 };
  },
  ["products:by-category"],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: ["products"] }
);

export const getProductsByBrand = unstable_cache(
  async (
    brandSlug: string,
    { limit = DEFAULT_LIST_LIMIT, offset = 0 }: { limit?: number; offset?: number } = {}
  ): Promise<{ products: Product[]; total: number }> => {
    const supabase = createPublicClient();
    const { data, error, count } = await supabase
      .from("products")
      .select(PRODUCT_SELECT_BRAND_FILTER, { count: "exact" })
      .eq("brands.slug", brandSlug)
      .is("deleted_at", null)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) logAndThrow(`getProductsByBrand(${brandSlug})`, error);
    return { products: ((data ?? []) as unknown as Record<string, unknown>[]).map(rowToProduct), total: count ?? 0 };
  },
  ["products:by-brand"],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: ["products"] }
);

export const getRelatedProducts = unstable_cache(
  async (product: Product, limit = 4): Promise<Product[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT_CATEGORY_FILTER)
      .eq("categories.slug", product.categorySlug)
      .neq("id", product.id)
      .is("deleted_at", null)
      .eq("status", "published")
      .limit(limit);

    if (error) logAndThrow(`getRelatedProducts(${product.id})`, error);
    return ((data ?? []) as unknown as Record<string, unknown>[]).map(rowToProduct);
  },
  ["products:related"],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: ["products"] }
);

export const getCustomersAlsoBought = unstable_cache(
  async (product: Product, limit = 4): Promise<Product[]> => {
    const supabase = createPublicClient();
    // Same-brand-first (see Sprint 3 notes on why: same-category-only tends to fully overlap
    // with getRelatedProducts on a small catalog). Falls back to same-category if the brand
    // alone doesn't fill the list.
    const { data: sameBrandRows, error: brandError } = await supabase
      .from("products")
      .select(PRODUCT_SELECT_BRAND_FILTER)
      .eq("brands.name", product.brand)
      .neq("id", product.id)
      .is("deleted_at", null)
      .eq("status", "published")
      .order("review_count", { ascending: false })
      .limit(limit);

    if (brandError) logAndThrow(`getCustomersAlsoBought(${product.id})`, brandError);
    const sameBrand = ((sameBrandRows ?? []) as unknown as Record<string, unknown>[]).map(rowToProduct);
    if (sameBrand.length >= limit) return sameBrand;

    const excludeIds = [product.id, ...sameBrand.map((p) => p.id)];
    const { data: sameCategoryRows, error: categoryError } = await supabase
      .from("products")
      .select(PRODUCT_SELECT_CATEGORY_FILTER)
      .eq("categories.slug", product.categorySlug)
      .not("id", "in", `(${excludeIds.join(",")})`)
      .is("deleted_at", null)
      .eq("status", "published")
      .limit(limit - sameBrand.length);

    if (categoryError) logAndThrow(`getCustomersAlsoBought(${product.id}) fallback`, categoryError);
    return [...sameBrand, ...((sameCategoryRows ?? []) as unknown as Record<string, unknown>[]).map(rowToProduct)];
  },
  ["products:also-bought"],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: ["products"] }
);

// ---------- Not cached: real-time hydration ----------
// Cart, wishlist, recently-viewed, and checkout all need the CURRENT price/stock/title at the
// moment of the request — deliberately not wrapped in unstable_cache. This is what "never trust
// stale prices stored in the browser" means in practice: the browser only ever keeps IDs, and
// every render re-fetches the real current values.

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .in("id", ids)
    .is("deleted_at", null)
    .eq("status", "published");

  if (error) logAndThrow("getProductsByIds", error);

  // Preserve the caller's original order (e.g. most-recently-viewed-first) — `.in()` doesn't
  // guarantee result order matches the id list.
  const byId = new Map((data ?? []).map((row) => [row.id as string, row]));
  return ids
    .map((id) => byId.get(id))
    .filter((row): row is Record<string, unknown> => Boolean(row))
    .map(rowToProduct);
}
