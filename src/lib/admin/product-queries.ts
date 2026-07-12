import "server-only";
import { createClient } from "@/lib/supabase/server";
import { AdminProduct } from "@/lib/types";
import { products as mockProducts } from "@/lib/data/products";

const SUPABASE_CONFIGURED = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function mockAsAdminProduct(): AdminProduct[] {
  // Read-only preview of the storefront's mock catalog so the admin UI has
  // something to render before Supabase is connected. Every write action
  // requires Supabase — this fallback exists for browsing/UI review only,
  // and the products list page shows a banner explaining that.
  return mockProducts.map((p) => ({
    ...p,
    status: "published" as const,
    vatInclusive: true,
    reservedStock: 0,
    isFeatured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}

function rowToAdminProduct(row: Record<string, unknown>): AdminProduct {
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    brand: ((row.brands as { name?: string } | null)?.name) ?? "",
    categorySlug: ((row.categories as { slug?: string } | null)?.slug) ?? "",
    price: Number(row.price),
    compareAtPrice: row.compare_at_price ? Number(row.compare_at_price) : undefined,
    images: (row.product_images as { url: string }[] | undefined)?.map((i) => i.url) ?? [],
    sku: row.sku as string,
    stock: Number(row.stock),
    rating: Number(row.rating ?? 0),
    reviewCount: Number(row.review_count ?? 0),
    badge: row.badge as AdminProduct["badge"],
    colorway: (row.colorways as string[]) ?? [],
    shortDescription: (row.short_description as string) ?? "",
    description: (row.description as string) ?? "",
    specs: (row.specs as { label: string; value: string }[]) ?? [],
    warranty: (row.warranty as string) ?? "",
    compatibility: (row.compatibility as string[]) ?? [],
    compatibleDevices:
      (row.product_compatible_devices as { device_models: { name: string } | null }[] | undefined)
        ?.map((pcd) => pcd.device_models?.name)
        .filter((name): name is string => Boolean(name)) ?? [],
    tags: (row.tags as string[]) ?? [],
    searchKeywords: (row.search_keywords as string[]) ?? [],
    status: row.status as AdminProduct["status"],
    costPrice: row.purchase_price ? Number(row.purchase_price) : undefined,
    vatInclusive: Boolean(row.vat_inclusive),
    weightKg: row.weight_kg ? Number(row.weight_kg) : undefined,
    dimensionsCm: (row.dimensions_cm as string) ?? undefined,
    reservedStock: Number(row.reserved_stock ?? 0),
    isFeatured: Boolean(row.is_featured),
    supplier: (row.supplier as string) ?? undefined,
    barcode: (row.barcode as string) ?? undefined,
    features: (row.features as string[]) ?? [],
    seoTitle: (row.seo_title as string) ?? undefined,
    seoDescription: (row.seo_description as string) ?? undefined,
    metaKeywords: (row.meta_keywords as string) ?? undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    deletedAt: (row.deleted_at as string) ?? null,
  };
}

export async function listAdminProducts(): Promise<{ products: AdminProduct[]; usingMockData: boolean }> {
  if (!SUPABASE_CONFIGURED) return { products: mockAsAdminProduct(), usingMockData: true };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, brands(name, slug), categories(slug), product_images(url, is_primary, position), product_compatible_devices(device_models(name))")
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  if (error || !data) return { products: mockAsAdminProduct(), usingMockData: true };

  return { products: data.map(rowToAdminProduct), usingMockData: false };
}

export async function getAdminProductById(id: string): Promise<AdminProduct | null> {
  if (!SUPABASE_CONFIGURED) {
    return mockAsAdminProduct().find((p) => p.id === id) ?? null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, brands(name, slug), categories(slug), product_images(url, is_primary, position), product_compatible_devices(device_models(name))")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return rowToAdminProduct(data);
}
