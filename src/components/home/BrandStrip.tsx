import { brands } from "@/lib/data/brands";

export function BrandStrip() {
  return (
    <section className="border-y border-line bg-mist py-10">
      <div className="container-content flex flex-wrap items-center justify-between gap-8">
        {brands.map((b) => (
          <span
            key={b.id}
            className="text-sm font-semibold uppercase tracking-wide text-ink-400 transition-colors hover:text-ink"
          >
            {b.name}
          </span>
        ))}
      </div>
    </section>
  );
}
