import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug, getRelatedProducts, getCustomersAlsoBought } from "@/lib/data/products";
import { getReviewsForProduct, getReviewSummary } from "@/lib/data/reviews";
import { ProductGalleryAndPanel } from "@/components/product/ProductGalleryAndPanel";
import { ProductRail } from "@/components/home/ProductRail";
import { ProductReviews } from "@/components/product/ProductReviews";
import { RecentlyViewedRail } from "@/components/product/RecentlyViewedRail";
import { RecordProductView } from "@/components/product/RecordProductView";
import { Truck, ShieldCheck, RotateCcw } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.title,
    description: product.shortDescription,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();
  const related = getRelatedProducts(product);
  const alsoBought = getCustomersAlsoBought(product).filter((p) => !related.some((r) => r.id === p.id));
  const reviews = getReviewsForProduct(product.id);
  const reviewSummary = getReviewSummary(product.id);
  const compatible = product.compatibleDevices ?? product.compatibility ?? [];

  return (
    <div className="container-content py-10 md:py-14">
      <RecordProductView productId={product.id} />

      <nav className="mb-8 text-xs text-ink-400">
        <Link href="/shop" className="hover:text-ink">Shop</Link> /{" "}
        <Link href={`/shop?category=${product.categorySlug}`} className="hover:text-ink">{product.brand}</Link> /{" "}
        <span className="text-ink">{product.title}</span>
      </nav>

      <ProductGalleryAndPanel product={product} />

      <div className="mt-20 grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold">Description</h2>
          <p className="mt-4 text-sm leading-relaxed text-ink-500">{product.description}</p>

          <h2 className="mt-10 text-lg font-semibold">Specifications</h2>
          <dl className="mt-4 divide-y divide-line border-y border-line">
            {product.specs.map((s) => (
              <div key={s.label} className="grid grid-cols-2 py-3 text-sm">
                <dt className="text-ink-400">{s.label}</dt>
                <dd className="font-medium">{s.value}</dd>
              </div>
            ))}
          </dl>

          {compatible.length > 0 && (
            <>
              <h2 className="mt-10 text-lg font-semibold">Compatibility</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {compatible.map((c) => (
                  <span key={c} className="border border-line px-3 py-1.5 text-xs text-ink-500">
                    {c}
                  </span>
                ))}
              </div>
            </>
          )}

          <h2 className="mt-10 text-lg font-semibold">Reviews</h2>
          <div className="mt-4">
            <ProductReviews productTitle={product.title} reviews={reviews} summary={reviewSummary} />
          </div>
        </div>

        <div className="flex flex-col gap-6 border border-line p-6">
          <div className="flex items-start gap-3">
            <ShieldCheck size={20} className="mt-0.5 shrink-0 text-secondary" />
            <div>
              <h3 className="text-sm font-semibold">Warranty</h3>
              <p className="mt-1 text-sm text-ink-400">{product.warranty}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Truck size={20} className="mt-0.5 shrink-0 text-secondary" />
            <div>
              <h3 className="text-sm font-semibold">Shipping Information</h3>
              <p className="mt-1 text-sm text-ink-400">
                Same-day in Mbombela if ordered before 1pm. 2–4 working days nationwide. Full details on our{" "}
                <Link href="/shipping" className="text-ink underline underline-offset-4">shipping page</Link>.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <RotateCcw size={20} className="mt-0.5 shrink-0 text-secondary" />
            <div>
              <h3 className="text-sm font-semibold">Returns Policy</h3>
              <p className="mt-1 text-sm text-ink-400">
                Unopened items returnable within 7 days. See our{" "}
                <Link href="/returns" className="text-ink underline underline-offset-4">returns policy</Link>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {alsoBought.length > 0 && (
        <ProductRail eyebrow="Customers Also Bought" title="Frequently Paired With This" products={alsoBought} />
      )}

      {related.length > 0 && (
        <ProductRail eyebrow="You Might Also Like" title="Related Products" products={related} />
      )}

      <RecentlyViewedRail excludeProductId={product.id} />
    </div>
  );
}
