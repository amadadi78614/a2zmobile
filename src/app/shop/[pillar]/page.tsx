import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { taxonomy, getPillar } from "@/lib/data/taxonomy";
import { GroupCard } from "@/components/shop/GroupCard";
import { CategoryLanding } from "@/components/shop/CategoryLanding";
import { productsForGroup } from "@/lib/taxonomyProducts";
import { Breadcrumbs } from "@/components/shop/Breadcrumbs";

export function generateStaticParams() {
  return taxonomy.map((p) => ({ pillar: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ pillar: string }> }): Promise<Metadata> {
  const { pillar: pillarSlug } = await params;
  const pillar = getPillar(pillarSlug);
  if (!pillar) return {};
  return {
    title: pillar.seoTitle,
    description: pillar.seoDescription,
    robots: pillar.isLive ? undefined : { index: false, follow: true },
  };
}

export default async function PillarPage({
  params,
  searchParams,
}: {
  params: Promise<{ pillar: string }>;
  searchParams: Promise<{ subcategory?: string }>;
}) {
  const { pillar: pillarSlug } = await params;
  const { subcategory } = await searchParams;
  const pillar = getPillar(pillarSlug);
  if (!pillar) notFound();

  // Single-group pillars (Vape, Hookah) skip the "pick a group" step entirely — there's nothing
  // to choose between, so go straight to the category content.
  if (pillar.groups.length === 1) {
    const group = pillar.groups[0];
    const activeSubcategory = subcategory;
    const items = productsForGroup(group, activeSubcategory);
    return (
      <CategoryLanding
        breadcrumbs={[{ label: "Shop", href: "/shop" }, { label: pillar.name }]}
        title={pillar.name}
        description={pillar.heroDescription}
        visualStyle={pillar.visualStyle}
        isLive={pillar.isLive}
        subcategories={group.subcategories}
        activeSubcategory={activeSubcategory}
        subcategoryBaseHref={`/shop/${pillar.slug}`}
        products={items}
      />
    );
  }

  return (
    <div>
      <div className="border-b border-line bg-mist py-10 md:py-14">
        <div className="container-content">
          <Breadcrumbs items={[{ label: "Shop", href: "/shop" }, { label: pillar.name }]} />
          <h1 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">{pillar.name}</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-500 sm:text-base">
            {pillar.heroDescription}
          </p>
        </div>
      </div>

      <div className="container-content py-10">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pillar.groups.map((group) => (
            <GroupCard key={group.slug} pillarSlug={pillar.slug} group={group} />
          ))}
        </div>
      </div>
    </div>
  );
}
