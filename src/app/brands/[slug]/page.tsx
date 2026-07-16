import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { brands } from "@/lib/data/brands";
import { products } from "@/lib/data/products";
import { ProductCard } from "@/components/product/ProductCard";
import { isBestSeller, isDealItem } from "@/lib/product";

// Short, factual descriptions only — no unverifiable specific claims about real third-party
// companies (founding dates, exact technology claims, etc.).
const brandDescriptions: Record<string, string> = {
  jbl: "A well-known audio brand, best recognised for its portable Bluetooth speakers and headphones.",
  anker: "A charging-technology brand covering power banks, wall chargers, and cables.",
  baseus: "An electronics accessory brand known for GaN chargers, cables, and everyday tech accessories.",
  hoco: "An accessory brand covering phone cases, cables, and everyday mobile essentials.",
  oraimo: "A mobile accessory and audio brand, known locally for earbuds and everyday accessories.",
  romoss: "A brand focused on power banks and charging accessories.",
  "a2z-essentials": "A2Z's own house brand — repair parts, hookah essentials, and everyday accessories we stand behind directly.",
};

export function generateStaticParams() {
  return brands.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const brand = brands.find((b) => b.slug === slug);
  if (!brand) return {};
  return {
    title: `${brand.name} | A2Z Mobile & Computer Services`,
    description: brandDescriptions[brand.slug] ?? `Shop genuine ${brand.name} products at A2Z.`,
  };
}

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brand = brands.find((b) => b.slug === slug);
  if (!brand) notFound();

  const brandProducts = products.filter((p) => p.brand === brand.name);
  const featured = brandProducts.filter((p) => isBestSeller(p) || isDealItem(p)).slice(0, 4);

  return (
    <div>
      <div className="border-b border-line bg-mist py-14 md:py-20">
        <div className="container-content">
          <span className="eyebrow">Brand</span>
          {/* No real logo asset exists for any brand yet — a styled text mark rather than a
              broken <img>. Swap for real logo art here once supplied. */}
          <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">{brand.name}</h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-500 sm:text-base">
            {brandDescriptions[brand.slug] ?? `Genuine ${brand.name} products, stocked in Mbombela.`}
          </p>
        </div>
      </div>

      <div className="container-content py-10">
        {brandProducts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-ink-400">No {brand.name} products in stock right now — check back soon.</p>
          </div>
        ) : (
          <>
            {featured.length > 0 && (
              <div className="mb-14">
                <h2 className="text-lg font-semibold">Featured {brand.name}</h2>
                <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-4">
                  {featured.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            )}

            <h2 className="text-lg font-semibold">All {brand.name} Products</h2>
            <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 xl:grid-cols-4">
              {brandProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
