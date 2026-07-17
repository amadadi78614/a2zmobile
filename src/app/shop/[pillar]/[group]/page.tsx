import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPillar, getGroup } from "@/lib/data/taxonomy";
import { CategoryLanding } from "@/components/shop/CategoryLanding";
import { getProductsForGroup } from "@/lib/taxonomyProducts";

export const dynamic = "force-dynamic";

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
}: {
  params: Promise<{ pillar: string; group: string }>;
}) {
  const { pillar: pillarSlug, group: groupSlug } = await params;
  const pillar = getPillar(pillarSlug);
  const group = getGroup(pillarSlug, groupSlug);
  if (!pillar || !group) notFound();

  const items = await getProductsForGroup(group);

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
      subcategories={[]}
      subcategoryBaseHref={`/shop/${pillar.slug}/${group.slug}`}
      products={items}
    />
  );
}
