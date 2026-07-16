"use client";

import { Suspense, useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Search as SearchIcon, X } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { searchAction, logSearchAction, popularSearchesAction } from "@/lib/search/actions";
import { useRecentSearchesStore } from "@/lib/store/recentSearches";
import { SearchResult } from "@/lib/types";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";

function SearchContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const debouncedQuery = useDebouncedValue(query, 250);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [popular, setPopular] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();
  const recent = useRecentSearchesStore((s) => s.queries);
  const addRecent = useRecentSearchesStore((s) => s.add);
  const clearRecent = useRecentSearchesStore((s) => s.clear);

  useEffect(() => {
    const fromUrl = searchParams.get("q");
    if (fromUrl && fromUrl !== query) setQuery(fromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    popularSearchesAction().then(setPopular);
  }, []);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }
    startTransition(async () => {
      const found = await searchAction(debouncedQuery, 24);
      setResults(found);
    });
  }, [debouncedQuery]);

  function commitSearch(term: string) {
    setQuery(term);
    startTransition(async () => {
      const found = await searchAction(term, 24);
      setResults(found);
      addRecent(term);
      logSearchAction(term, found.length);
    });
  }

  return (
    <div className="container-content py-10 md:py-14">
      <div className="relative mx-auto max-w-2xl">
        <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && commitSearch(query)}
          placeholder="Search products, brands, SKU, or compatible device..."
          className="w-full border border-line py-4 pl-12 pr-10 text-sm outline-none focus:border-ink"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            aria-label="Clear search"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {!query && (
        <div className="mx-auto mt-10 max-w-2xl">
          {recent.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <span className="eyebrow">Recent Searches</span>
                <button onClick={clearRecent} className="text-xs text-ink-400 hover:text-ink">
                  Clear
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {recent.map((r) => (
                  <button
                    key={r}
                    onClick={() => commitSearch(r)}
                    className="border border-line px-3 py-1.5 text-xs text-ink-500 hover:border-ink"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}
          <span className="eyebrow">Popular Searches</span>
          <div className="mt-3 flex flex-wrap gap-2">
            {popular.map((r) => (
              <button
                key={r}
                onClick={() => commitSearch(r)}
                className="border border-line px-3 py-1.5 text-xs text-ink-500 hover:border-ink"
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      {query && (
        <div className="mt-10">
          <p className="mb-6 text-sm text-ink-400">
            {pending ? "Searching..." : `${results.length} results for \u201c${query}\u201d`}
          </p>

          {!pending && results.length > 0 && (
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 xl:grid-cols-4">
              {results.map((r) => (
                <ProductCard key={r.product.id} product={r.product} />
              ))}
            </div>
          )}

          {!pending && results.length === 0 && (
            <div className="flex flex-col items-center py-12 text-center">
              <SearchIcon size={28} className="text-ink-300" strokeWidth={1.5} />
              <p className="mt-4 text-sm text-ink-400">
                No matches for &ldquo;{query}&rdquo;. Try a different term, check the spelling, or search by SKU.
              </p>
              {popular.length > 0 && (
                <div className="mt-6">
                  <span className="eyebrow">Try one of these instead</span>
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    {popular.slice(0, 5).map((r) => (
                      <button
                        key={r}
                        onClick={() => commitSearch(r)}
                        className="border border-line px-3 py-1.5 text-xs text-ink-500 hover:border-ink"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchContent />
    </Suspense>
  );
}
