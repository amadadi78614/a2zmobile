import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/data/products";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductRail } from "@/components/home/ProductRail";
import { ProductPurchasePanel } from "@/components/product/ProductPurchasePanel";
import { Truck, ShieldCheck } from "lucide-react";

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

  return (
    <div className="container-content py-10 md:py-14">
      <nav className="mb-8 text-xs text-ink-400">
        Shop / {product.brand} / <span className="text-ink">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <ProductGallery images={product.images} title={product.title} />
        <ProductPurchasePanel product={product} />
      </div>

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
              <h3 className="text-sm font-semibold">Delivery Estimate</h3>
              <p className="mt-1 text-sm text-ink-400">
                Same-day in Mbombela if ordered before 1pm. 2–4 working days nationwide.
              </p>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <ProductRail eyebrow="You Might Also Like" title="Related Products" products={related} />
      )}
    </div>
  );
}
