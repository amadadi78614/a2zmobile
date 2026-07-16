import Link from "next/link";
import type { Pillar } from "@/lib/types";
import { cn } from "@/lib/utils";

const cardStyles: Record<Pillar["visualStyle"], string> = {
  dominant: "bg-mist text-ink",
  "dark-premium": "bg-ink text-paper",
  "luxury-premium": "bg-ink text-paper",
};

export function PillarCards({ pillars }: { pillars: Pillar[] }) {
  const mobileTech = pillars.find((p) => p.slug === "mobile-tech");
  const others = pillars.filter((p) => p.slug !== "mobile-tech");

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-2">
      {mobileTech && (
        <Link
          href={`/shop/${mobileTech.slug}`}
          className={cn(
            "group flex min-h-[260px] flex-col justify-end p-8 transition-opacity hover:opacity-95 md:col-span-2 md:row-span-2 md:min-h-[420px] md:p-12",
            cardStyles[mobileTech.visualStyle]
          )}
        >
          <span className="eyebrow text-secondary">{mobileTech.tagline}</span>
          <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">{mobileTech.name}</h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-500">{mobileTech.heroDescription}</p>
          <span className="mt-6 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-ink underline underline-offset-4">
            Shop Mobile &amp; Tech &rarr;
          </span>
        </Link>
      )}

      {others.map((pillar) => (
        <Link
          key={pillar.slug}
          href={`/shop/${pillar.slug}`}
          className={cn(
            "group flex min-h-[200px] flex-col justify-end p-6 transition-opacity hover:opacity-90 md:min-h-0",
            cardStyles[pillar.visualStyle]
          )}
        >
          <span className="eyebrow text-primary">{pillar.tagline}</span>
          <h2 className="mt-2 font-display text-xl font-semibold sm:text-2xl">{pillar.name}</h2>
          <p className="mt-2 max-w-xs text-xs leading-relaxed text-paper/60 sm:text-sm">
            {pillar.heroDescription}
          </p>
          <span className="mt-4 inline-flex w-fit items-center gap-1.5 text-xs font-medium text-primary underline underline-offset-4">
            {pillar.isLive ? `Shop ${pillar.name}` : "Learn more"} &rarr;
          </span>
        </Link>
      ))}
    </div>
  );
}
