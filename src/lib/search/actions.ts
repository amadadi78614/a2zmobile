"use server";

import { searchProducts, logSearchEvent, getPopularSearches } from "@/lib/search/queries";
import { SearchResult } from "@/lib/types";

/** Full results page + "suggestions" dropdown both call this — suggestions just pass a smaller limit. */
export async function searchAction(query: string, limit = 24): Promise<SearchResult[]> {
  return searchProducts(query, limit);
}

/** Called once a search is "committed" (Enter, or navigating to /search) — not on every keystroke, so instant-search typing doesn't spam the log. */
export async function logSearchAction(query: string, resultCount: number): Promise<void> {
  await logSearchEvent(query, resultCount);
}

export async function popularSearchesAction(): Promise<string[]> {
  return getPopularSearches();
}
