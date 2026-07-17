import { HeroCarousel } from "@/components/home/HeroCarousel";
import { SpecTicker } from "@/components/home/SpecTicker";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { BrandStrip } from "@/components/home/BrandStrip";
import { ProductRail } from "@/components/home/ProductRail";
import { ProductCarousel } from "@/components/home/ProductCarousel";
import { TrustSection } from "@/components/home/TrustSection";
import { Newsletter } from "@/components/home/Newsletter";
import { getDeals, getNewArrivals, getBestSellers } from "@/lib/products/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Real Supabase reads, run in parallel — each individually cached/tagged (see
  // src/lib/products/queries.ts). A genuine ProductServiceError from any of these is caught by
  // src/app/error.tsx; an empty catalog is just an empty array, not an error.
  const [deals, newArrivals, bestSellers] = await Promise.all([
    getDeals(8),
    getNewArrivals(8),
    getBestSellers(4),
  ]);

  return (
    <>
      <HeroCarousel />
      <SpecTicker />
      <CategoryGrid />
      {deals.length > 0 && (
        <ProductCarousel eyebrow="Limited Time" title="Today's Deals" products={deals} viewAllHref="/shop?filter=deals" />
      )}
      <BrandStrip />
      {newArrivals.length > 0 && (
        <ProductCarousel eyebrow="Just In" title="New Arrivals" products={newArrivals} />
      )}
      <TrustSection />
      {bestSellers.length > 0 && (
        <ProductRail eyebrow="Customer Favourites" title="Best Sellers" products={bestSellers} />
      )}
      <Newsletter />
    </>
  );
}
