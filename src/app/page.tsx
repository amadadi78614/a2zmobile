import { HeroCarousel } from "@/components/home/HeroCarousel";
import { SpecTicker } from "@/components/home/SpecTicker";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { BrandStrip } from "@/components/home/BrandStrip";
import { ProductRail } from "@/components/home/ProductRail";
import { ProductCarousel } from "@/components/home/ProductCarousel";
import { TrustSection } from "@/components/home/TrustSection";
import { Newsletter } from "@/components/home/Newsletter";
import { products } from "@/lib/data/products";

export default function HomePage() {
  const deals = products.filter((p) => p.compareAtPrice);
  const newArrivals = products.filter((p) => p.badge === "New" || p.badge === "Sale");
  const bestSellers = [...products].sort((a, b) => b.reviewCount - a.reviewCount);

  return (
    <>
      <HeroCarousel />
      <SpecTicker />
      <CategoryGrid />
      <ProductCarousel eyebrow="Limited Time" title="Today's Deals" products={deals} viewAllHref="/shop?filter=deals" />
      <BrandStrip />
      <ProductCarousel eyebrow="Just In" title="New Arrivals" products={newArrivals} />
      <TrustSection />
      <ProductRail eyebrow="Customer Favourites" title="Best Sellers" products={bestSellers.slice(0, 4)} />
      <Newsletter />
    </>
  );
}
