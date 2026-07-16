import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { Breadcrumbs } from "@/components/shop/Breadcrumbs";
import type { Product, Subcategory, TaxonomyVisualStyle } from "@/lib/types";
import { cn } from "@/lib/utils";

const heroStyles: Record<TaxonomyVisualStyle, string> = {
  dominant: "bg-mist text-ink",
  "dark-premium": "bg-ink text-paper",
  "luxury-premium": "bg-ink text-paper",
};

export function CategoryLanding({
  breadcrumbs,
  title,
  description,
  visualStyle,
  isLive,
  subcategories,
  activeSubcategory,
  subcategoryBaseHref,
  products,
}: {
  breadcrumbs: { label: string; href?: string }[];
  title: string;
  description: string;
  visualStyle: TaxonomyVisualStyle;
  isLive: boolean;
  subcategories: Subcategory[];
  activeSubcategory?: string;
  subcategoryBaseHref: string;
  products: Product[];
}) {
  return (
    <div>
      <div className={cn("border-b border-line py-10 md:py-14", heroStyles[visualStyle])}>
        <div className="container-content">
          <Breadcrumbs items={breadcrumbs} />
          <h1 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">{title}</h1>
          <p
            className={cn(
              "mt-3 max-w-xl text-sm leading-relaxed sm:text-base",
              visualStyle === "dominant" ? "text-ink-500" : "text-paper/70"
            )}
          >
            {description}
          </p>
          {!isLive && (
            <a
              href="https://wa.me/27000000000?text=Hi%20A2Z%2C%20please%20let%20me%20know%20when%20this%20range%20launches."
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 bg-primary px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-paper"
            >
              <MessageCircle size={16} />
              Get notified on WhatsApp
            </a>
          )}
        </div>
      </div>

      <div className="container-content py-10">
        {subcategories.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <Link
              href={subcategoryBaseHref}
              className={cn(
                "border px-4 py-2 text-xs font-medium uppercase tracking-wide transition-colors",
                !activeSubcategory ? "border-ink bg-ink text-paper" : "border-line text-ink-500 hover:border-ink"
              )}
            >
              All
            </Link>
            {subcategories.map((sub) => (
              <Link
                key={sub.slug}
                href={`${subcategoryBaseHref}?subcategory=${sub.slug}`}
                className={cn(
                  "border px-4 py-2 text-xs font-medium uppercase tracking-wide transition-colors",
                  activeSubcategory === sub.slug ? "border-ink bg-ink text-paper" : "border-line text-ink-500 hover:border-ink"
                )}
              >
                {sub.name}
              </Link>
            ))}
          </div>
        )}

        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : isLive ? (
          <div className="py-16 text-center">
            <p className="text-sm text-ink-400">No products in this range yet — check back soon.</p>
            <Link href="/shop" className="mt-4 inline-block text-sm font-medium text-ink underline underline-offset-4">
              Browse everything we stock
            </Link>
          </div>
        ) : (
          <div className="py-16 text-center">
            <p className="text-sm text-ink-400">
              This range hasn&apos;t launched yet — WhatsApp us above to be the first to know.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
