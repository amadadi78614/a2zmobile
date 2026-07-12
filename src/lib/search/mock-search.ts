import { Product, SearchResult } from "@/lib/types";
import { products } from "@/lib/data/products";
import { categories } from "@/lib/data/categories";
import { deviceModels, deviceBrands } from "@/lib/data/devices";

/**
 * Client-side stand-in for `search_products()` (see
 * supabase/migrations/003_search_architecture.sql) used only when Supabase
 * isn't configured. Mirrors the same three-tier priority and the same two
 * false-positive fixes validated against the real Postgres function:
 * per-token AND-fuzzy matching (not whole-phrase), and exact-match-only for
 * short (<=4 char) tokens like model numbers, since a 1-character
 * difference in "S22" vs "S24" is indistinguishable from a typo by
 * similarity scoring alone.
 */

function trigrams(text: string): Set<string> {
  // Matches pg_trgm's actual unit of comparison (3-char windows), padded
  // with boundary markers the same way Postgres pads words before
  // trigram-izing them — without padding, very short tokens like "S22"
  // produce almost no trigrams and can't be meaningfully compared at all.
  const clean = text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const padded = `  ${clean} `;
  const grams = new Set<string>();
  for (let i = 0; i < padded.length - 2; i++) {
    grams.add(padded.slice(i, i + 3));
  }
  return grams;
}

/** Dice coefficient over trigrams — same shape of signal as Postgres's pg_trgm similarity(), not a byte-for-byte port. */
function trigramSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  const setA = trigrams(a);
  const setB = trigrams(b);
  if (setA.size === 0 || setB.size === 0) return 0;
  let overlap = 0;
  for (const g of setA) if (setB.has(g)) overlap++;
  return (2 * overlap) / (setA.size + setB.size);
}

function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/-/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

function categoryName(slug: string): string {
  return categories.find((c) => c.slug === slug)?.name ?? "";
}

/**
 * A device name alone ("Galaxy S22") doesn't contain its brand — mirrors
 * the same gap fixed in the Postgres cache-building trigger, so a query
 * like "samsung s22" has textual support for both tokens, not just the
 * model number.
 */
function brandForDeviceName(deviceName: string): string {
  const model = deviceModels.find((m) => m.name.toLowerCase() === deviceName.toLowerCase());
  if (!model) return "";
  return deviceBrands.find((b) => b.id === model.brandId)?.name ?? "";
}

function compatibleDevicesText(p: Product): string {
  const names = p.compatibleDevices ?? p.compatibility ?? [];
  return names.map((name) => `${brandForDeviceName(name)} ${name}`).join(" ");
}

function searchableFields(p: Product) {
  return {
    // weight A — name/sku/barcode
    a: `${p.title} ${p.sku} ${p.barcode ?? ""}`.toLowerCase(),
    // weight B — brand/category/compatible devices (brand-inclusive)
    b: `${p.brand} ${categoryName(p.categorySlug)} ${compatibleDevicesText(p)}`.toLowerCase(),
    // weight C — tags/keywords/description
    c: `${(p.tags ?? []).join(" ")} ${(p.searchKeywords ?? []).join(" ")} ${p.shortDescription}`.toLowerCase(),
  };
}

export function mockSearchProducts(rawQuery: string, limit = 24): SearchResult[] {
  const query = rawQuery.trim();
  if (!query) return [];
  const tokens = tokenize(query);

  const results: { product: Product; rank: number; matchType: SearchResult["matchType"] }[] = [];

  for (const p of products) {
    // Tier 1 — exact SKU/barcode
    if (p.sku.toLowerCase() === query.toLowerCase() || p.barcode === query) {
      results.push({ product: p, rank: 10000, matchType: "exact_sku_barcode" });
      continue;
    }

    // Tier 2 — every query token must appear somewhere across the
    // weighted fields (AND semantics, same as websearch_to_tsquery).
    const { a, b, c } = searchableFields(p);
    const allText = `${a} ${b} ${c}`;
    const allTokensPresent = tokens.every((t) => allText.includes(t));
    if (allTokensPresent) {
      const score =
        tokens.reduce((sum, t) => sum + (a.includes(t) ? 3 : 0) + (b.includes(t) ? 2 : 0) + (c.includes(t) ? 1 : 0), 0) /
        tokens.length;
      results.push({ product: p, rank: 1000 + score, matchType: "fulltext" });
      continue;
    }

    // Tier 3 — fuzzy fallback for typos. Every query token must have SOME
    // reasonable match against an individual word in the target text.
    // Short tokens (<=4 chars, e.g. model numbers like "S22") require an
    // EXACT substring match instead of fuzzy scoring — word_similarity-
    // style comparison can't distinguish "S22" from "S24" (both score
    // ~0.5, the same as a genuine typo), so fuzzy tolerance there causes
    // more harm (cross-model false positives) than good. Threshold for
    // longer tokens is 0.45, tuned to keep realistic single-edit typos
    // ("samung" for "Samsung" scores 0.5) while rejecting unrelated-word
    // collisions ("chager" against "charcoal" scores 0.43) — both
    // confirmed against the equivalent Postgres implementation.
    const targetWords = allText.split(/\s+/).filter(Boolean);
    const perTokenScores = tokens.map((t) => {
      const isIdentifierLike = t.length <= 4 || (t.length >= 8 && /^[0-9]+$/.test(t));
      if (isIdentifierLike) {
        return allText.includes(t) ? 1 : 0;
      }
      return Math.max(0, ...targetWords.map((w) => trigramSimilarity(t, w)));
    });
    const minScore = Math.min(...perTokenScores);
    if (minScore >= 0.45) {
      const avgScore = perTokenScores.reduce((s, v) => s + v, 0) / perTokenScores.length;
      results.push({ product: p, rank: avgScore, matchType: "trigram" });
    }
  }

  return results
    .sort((x, y) => y.rank - x.rank)
    .slice(0, limit)
    .map((r) => ({ product: r.product, matchType: r.matchType }));
}
