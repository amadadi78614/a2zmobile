import Link from "next/link";
import type { CategoryGroup } from "@/lib/types";
import { taxonomyIconMap } from "@/lib/taxonomyIcons";

export function GroupCard({ pillarSlug, group }: { pillarSlug: string; group: CategoryGroup }) {
  const Icon = taxonomyIconMap[group.icon];
  return (
    <Link
      href={`/shop/${pillarSlug}/${group.slug}`}
      className="group flex flex-col gap-3 border border-line p-6 transition-colors hover:border-ink"
    >
      {Icon && <Icon size={22} className="text-secondary" strokeWidth={1.75} />}
      <h3 className="text-sm font-semibold text-ink">{group.name}</h3>
      <p className="text-xs leading-relaxed text-ink-400">
        {group.subcategories
          .slice(0, 3)
          .map((s) => s.name)
          .join(" · ")}
        {group.subcategories.length > 3 ? " · …" : ""}
      </p>
    </Link>
  );
}
