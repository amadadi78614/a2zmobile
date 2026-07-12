"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { searchAction } from "@/lib/search/actions";
import { useRecentSearchesStore } from "@/lib/store/recentSearches";
import { SearchResult } from "@/lib/types";
import { formatZAR } from "@/lib/utils";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";

export function HeaderSearch() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [, startTransition] = useTransition();
  const debouncedQuery = useDebouncedValue(query, 200);
  const addRecent = useRecentSearchesStore((s) => s.add);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSuggestions([]);
      return;
    }
    startTransition(async () => {
      const results = await searchAction(debouncedQuery, 5);
      setSuggestions(results);
    });
  }, [debouncedQuery]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function goToResults(term: string) {
    const trimmed = term.trim();
    if (!trimmed) return;
    addRecent(trimmed);
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <div ref={containerRef} className="relative ml-auto hidden max-w-md flex-1 md:block">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          goToResults(query);
        }}
        className="flex items-center border border-line px-4 py-2.5"
      >
        <Search size={16} className="text-ink-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Search products, brands, SKU..."
          className="w-full bg-transparent px-3 text-sm outline-none placeholder:text-ink-400"
        />
      </form>

      {open && query.trim() && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 border border-line bg-paper shadow-premium">
          {suggestions.length > 0 ? (
            <>
              <div className="divide-y divide-line">
                {suggestions.map((r) => (
                  <Link
                    key={r.product.id}
                    href={`/product/${r.product.slug}`}
                    onClick={() => {
                      addRecent(query);
                      setOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-mist"
                  >
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden bg-mist">
                      {r.product.images[0] && (
                        <Image src={r.product.images[0]} alt={r.product.title} fill sizes="40px" className="object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{r.product.title}</p>
                      <p className="text-xs text-ink-400">{formatZAR(r.product.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
              <button
                onClick={() => goToResults(query)}
                className="w-full border-t border-line px-4 py-3 text-left text-xs font-medium text-ink-500 hover:text-ink"
              >
                See all results for &ldquo;{query}&rdquo;
              </button>
            </>
          ) : (
            <button
              onClick={() => goToResults(query)}
              className="w-full px-4 py-3 text-left text-xs text-ink-400"
            >
              No quick matches — press Enter to search &ldquo;{query}&rdquo;
            </button>
          )}
        </div>
      )}
    </div>
  );
}
