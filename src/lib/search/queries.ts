import "server-only";
import { createClient } from "@/lib/supabase/server";
import { SearchResult } from "@/lib/types";
import { mockSearchProducts } from "@/lib/search/mock-search";
import { rowToProduct, PRODUCT_SELECT } from "@/lib/products/mapper";

const SUPABASE_CONFIGURED = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * Ranked product search. Calls the `search_products()` Postgres function
 * (supabase/migrations/003_search_architecture.sql) for ranking, then
 * hydrates the ranked IDs into full product records in a second query —
 * the RPC intentionally returns only `product_id`/`rank`/`match_type` to
 * keep the ranking query itself cheap; it isn't the place to also carry
 * every display field across the wire.
 */
export async function searchProducts(query: string, limit = 24): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  if (!SUPABASE_CONFIGURED) {
    return mockSearchProducts(trimmed, limit);
  }

  const supabase = await createClient();
  const { data: ranked, error } = await supabase.rpc("search_products", {
    search_query: trimmed,
    result_limit: limit,
  });

  if (error || !ranked || ranked.length === 0) {
    if (error) console.error("[search] search_products RPC failed:", error.message);
    return [];
  }

  const ids = ranked.map((r: { product_id: string }) => r.product_id);
  const { data: rows, error: hydrateError } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .in("id", ids);

  if (hydrateError || !rows) return [];

  const byId = new Map<string, Record<string, unknown>>(rows.map((r) => [r.id, r]));
  const matchTypeById = new Map(
    ranked.map((r: { product_id: string; match_type: SearchResult["matchType"] }) => [r.product_id, r.match_type])
  );

  // Preserve the RPC's rank order — the hydration query above doesn't
  // guarantee row order matches the `in (...)` list.
  return ids
    .map((id: string) => byId.get(id))
    .filter((row: Record<string, unknown> | undefined): row is Record<string, unknown> => Boolean(row))
    .map((row: Record<string, unknown>) => ({
      product: rowToProduct(row),
      matchType: (matchTypeById.get(row.id as string) ?? "fulltext") as SearchResult["matchType"],
    }));
}

/** Fire-and-forget — never blocks or fails the search response for the person searching. */
export async function logSearchEvent(query: string, resultCount: number): Promise<void> {
  if (!SUPABASE_CONFIGURED) return;
  const trimmed = query.trim();
  if (!trimmed) return;

  try {
    const supabase = await createClient();
    await supabase.from("search_events").insert({ query: trimmed, result_count: resultCount });
  } catch (err) {
    console.error("[search] failed to log search event:", err);
  }
}

const FALLBACK_POPULAR_SEARCHES = ["JBL speaker", "Power bank", "iPhone 15 case", "Hookah set", "USB-C cable"];

export async function getPopularSearches(): Promise<string[]> {
  if (!SUPABASE_CONFIGURED) return FALLBACK_POPULAR_SEARCHES;

  const supabase = await createClient();
  const { data, error } = await supabase.from("popular_searches").select("query").limit(8);

  if (error || !data || data.length === 0) return FALLBACK_POPULAR_SEARCHES;
  return data.map((r) => r.query as string);
}
