import Link from "next/link";
import { Product } from "@/lib/types";
import { ProductCard } from "@/components/product/ProductCard";

export function ProductRail({
  eyebrow,
  title,
  products,
  viewAllHref = "/shop",
}: {
  eyebrow: string;
  title: string;
  products: Product[];
  viewAllHref?: string;
}) {
  return (
    <section className="container-content py-16 md:py-20">
      <div className="flex items-end justify-between">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">{title}</h2>
        </div>
        <Link href={viewAllHref} className="hidden text-sm font-medium underline-offset-4 hover:underline sm:block">
          View all
        </Link>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
