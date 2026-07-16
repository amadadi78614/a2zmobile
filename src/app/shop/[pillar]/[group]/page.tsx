import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { taxonomy, getPillar, getGroup } from "@/lib/data/taxonomy";
import { CategoryLanding } from "@/components/shop/CategoryLanding";
import { productsForGroup } from "@/lib/taxonomyProducts";

export function generateStaticParams() {
  return taxonomy.flatMap((pillar) => pillar.groups.map((group) => ({ pillar: pillar.slug, group: group.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pillar: string; group: string }>;
}): Promise<Metadata> {
  const { pillar: pillarSlug, group: groupSlug } = await params;
  const pillar = getPillar(pillarSlug);
  const group = getGroup(pillarSlug, groupSlug);
  if (!pillar || !group) return {};
  return {
    title: group.seoTitle,
    description: group.seoDescription,
    robots: pillar.isLive ? undefined : { index: false, follow: true },
    // Single-group pillars (Vape, Hookah) render identical content at /shop/[pillar] itself —
    // canonicalize here to avoid two indexable URLs for the same content.
    alternates: pillar.groups.length === 1 ? { canonical: `/shop/${pillar.slug}` } : undefined,
  };
}

export default async function GroupPage({
  params,
  searchParams,
}: {
  params: Promise<{ pillar: string; group: string }>;
  searchParams: Promise<{ subcategory?: string }>;
}) {
  const { pillar: pillarSlug, group: groupSlug } = await params;
  const { subcategory } = await searchParams;
  const pillar = getPillar(pillarSlug);
  const group = getGroup(pillarSlug, groupSlug);
  if (!pillar || !group) notFound();

  const activeSubcategory = subcategory;
  const items = productsForGroup(group, activeSubcategory);

  return (
    <CategoryLanding
      breadcrumbs={[
        { label: "Shop", href: "/shop" },
        { label: pillar.name, href: `/shop/${pillar.slug}` },
        { label: group.name },
      ]}
      title={group.name}
      description={group.heroDescription}
      visualStyle={pillar.visualStyle}
      isLive={pillar.isLive}
      subcategories={group.subcategories}
      activeSubcategory={activeSubcategory}
      subcategoryBaseHref={`/shop/${pillar.slug}/${group.slug}`}
      products={items}
    />
  );
}
