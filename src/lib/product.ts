import type { Product } from "@/lib/types";

export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

export function getStockStatus(product: Product): StockStatus {
  if (product.stock <= 0) return "out-of-stock";
  if (product.stock <= 5) return "low-stock";
  return "in-stock";
}

export function getPrimaryImage(product: Product): string {
  return product.images[0];
}

export function getThumbnail(product: Product): string {
  return product.images[1] ?? product.images[0];
}

export function isBestSeller(product: Product): boolean {
  return product.badge === "Best Seller";
}

export function isNewArrival(product: Product): boolean {
  return product.badge === "New";
}

export function isDealItem(product: Product): boolean {
  return Boolean(product.compareAtPrice && product.compareAtPrice > product.price);
}

/** No dedicated "featured" flag exists in the mock data yet — a defensible stand-in until real
 * merchandising data exists: best sellers and deal items are the two categories a store would
 * realistically want to feature. */
export function isFeatured(product: Product): boolean {
  return isBestSeller(product) || isDealItem(product);
}
