import Link from "next/link";
import Image from "next/image";
import { categories } from "@/lib/data/categories";

export function CategoryGrid() {
  return (
    <section className="container-content py-16 md:py-24">
      <div className="flex items-end justify-between">
        <div>
          <span className="eyebrow">Browse</span>
          <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">Shop by Category</h2>
        </div>
        <Link href="/shop" className="hidden text-sm font-medium underline-offset-4 hover:underline sm:block">
          View all
        </Link>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/shop?category=${c.slug}`}
            className="group relative aspect-square overflow-hidden bg-mist"
          >
            <Image
              src={c.image}
              alt={c.name}
              fill
              sizes="200px"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/0" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <span className="text-sm font-medium text-paper">{c.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
