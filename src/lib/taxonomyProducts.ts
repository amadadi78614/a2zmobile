import { getProductsByCategory } from "@/lib/products/queries";
import type { CategoryGroup, Product } from "@/lib/types";

/**
 * Critical Fix 2: taxonomy.ts is presentation-only (pillar/group names, hero copy, icons,
 * ordering) — it is NEVER a product source. Every product grid on a /shop/[pillar]/[group] page
 * comes from real Supabase, filtered by the REAL flat category each taxonomy group maps to.
 *
 * The real Supabase `categories` table only has the original 8 flat categories (bluetooth-
 * speakers, phone-covers, chargers-cables, fans, hookah, mobile-accessories, lcd-screens,
 * repair-parts) — it has no concept of Sprint 2B's finer pillar/group/subcategory taxonomy at
 * all. Per Critical Fix 2's explicit instruction, this fix does NOT build a
 * product_subcategories table or a new migration — it maps each taxonomy group to whichever
 * real category is the closest honest fit, and documents every mapping below rather than
 * inventing product associations that don't exist.
 *
 * `null` means no real category is a reasonable fit at all (currently only Vape — there is no
 * real vape category or any vape products, so that group intentionally queries nothing and the
 * page falls back to its existing, honest "Coming Soon" messaging instead of a Supabase query).
 */
export const GROUP_TO_CATEGORY_MAP: Record<string, string | null> = {
  // Mobile & Tech
  charging: "chargers-cables",
  "charging-cables": "chargers-cables",
  power: "chargers-cables", // power banks live in the same real category as chargers/cables
  audio: "bluetooth-speakers", // closest direct match; earbuds/headphones aren't a separate real category
  "phone-protection": "phone-covers",
  "car-accessories": "mobile-accessories", // no real "car accessories" category exists yet
  "computer-accessories": "mobile-accessories", // no real "computer accessories" category exists yet
  networking: "mobile-accessories", // no real "networking" category exists yet
  storage: "mobile-accessories", // no real "storage" category exists yet
  "smart-gadgets": "mobile-accessories", // no real "smart gadgets" category exists yet (mini-fans specifically also exist under the real "fans" category, but a group maps to one category)
  "repairs-screens": "repair-parts", // majority fit (batteries/tools/adhesives); screen replacements specifically also exist under the real "lcd-screens" category
  // Vape — no real category, no real products. Intentionally unmapped.
  "vape-essentials": null,
  // Hookah — exact real match.
  "hookah-essentials": "hookah",
};

export async function getProductsForGroup(group: CategoryGroup, limit = 60): Promise<Product[]> {
  const realCategorySlug = GROUP_TO_CATEGORY_MAP[group.slug];
  if (!realCategorySlug) return [];

  const { products } = await getProductsByCategory(realCategorySlug, { limit });
  return products;
}
