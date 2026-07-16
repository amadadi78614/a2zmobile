import type { Review } from "@/lib/types";

// Frontend-only mock data so the review UI has something real to render. No submission form is
// wired to anything — "don't connect backend yet" per the brief. Only a handful of products have
// mock reviews; the rest correctly show the empty state, which is realistic (not every product
// in a real store has reviews on day one either).
export const reviews: Review[] = [
  { id: "r1", productId: "p1", authorName: "Thabo M.", rating: 5, title: "Loud for its size", body: "Took it camping for a week, survived rain and being dropped twice. Battery easily lasts a full day.", createdAt: "2026-05-12", verifiedPurchase: true, photos: [] },
  { id: "r2", productId: "p1", authorName: "Aisha K.", rating: 4, title: "Great sound, wish it was louder at max", body: "Bass is solid for the size. At full volume it distorts a little on bass-heavy tracks, but for the price it's excellent.", createdAt: "2026-04-28", verifiedPurchase: true, photos: [] },
  { id: "r3", productId: "p1", authorName: "Riaan v.d. B.", rating: 5, title: "Bought a second one", body: "First one lasted two years of daily use so I bought a second as a backup. JBL build quality is real.", createdAt: "2026-03-15", verifiedPurchase: false, photos: [] },
  { id: "r4", productId: "p4", authorName: "Nomvula S.", rating: 5, title: "Charges my laptop and phone together", body: "Small enough to keep in my bag permanently. Handles my MacBook Air fine on the higher wattage port.", createdAt: "2026-05-02", verifiedPurchase: true, photos: [] },
  { id: "r5", productId: "p4", authorName: "Johan P.", rating: 4, title: "Does what it says", body: "Gets a bit warm under full load but nothing concerning. Good value.", createdAt: "2026-04-10", verifiedPurchase: true, photos: [] },
  { id: "r6", productId: "p10", authorName: "Lindiwe N.", rating: 4, title: "Solid earbuds for the price", body: "ANC isn't Sony-level but it cuts enough office noise to be worth it. Case battery lasts about a week for me.", createdAt: "2026-05-20", verifiedPurchase: true, photos: [] },
  { id: "r7", productId: "p10", authorName: "Sipho D.", rating: 3, title: "Good but one earbud paired oddly at first", body: "Had to reset them once in the first week, fine since. Sound quality is decent for calls.", createdAt: "2026-04-18", verifiedPurchase: true, photos: [] },
  { id: "r8", productId: "p13", authorName: "Farah I.", rating: 5, title: "Looks great, smokes smoothly", body: "Bought this for a birthday get-together, the glass base is genuinely nice quality, not flimsy at all.", createdAt: "2026-05-08", verifiedPurchase: true, photos: [] },
  { id: "r9", productId: "p18", authorName: "Werner K.", rating: 5, title: "Everything I needed for a screen swap", body: "Used this to replace my own cracked screen. All the right bits, tips were sharp enough to actually work with.", createdAt: "2026-04-30", verifiedPurchase: true, photos: [] },
  { id: "r10", productId: "p3", authorName: "Zanele T.", rating: 5, title: "The display is genuinely useful", body: "Being able to see exact wattage while charging is more useful than I expected. Charges my laptop from empty easily.", createdAt: "2026-05-25", verifiedPurchase: true, photos: [] },
];

export function getReviewsForProduct(productId: string): Review[] {
  return reviews.filter((r) => r.productId === productId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getReviewSummary(productId: string): { average: number; count: number; breakdown: Record<1 | 2 | 3 | 4 | 5, number> } {
  const productReviews = getReviewsForProduct(productId);
  const breakdown: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of productReviews) {
    const rounded = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
    breakdown[rounded]++;
  }
  const average = productReviews.length
    ? productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length
    : 0;
  return { average, count: productReviews.length, breakdown };
}
