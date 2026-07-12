import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin/auth";
import { PRODUCT_READ_ROLES } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import { toCsv, joinMultiValue, PRODUCT_CSV_COLUMNS } from "@/lib/admin/csv";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin || !PRODUCT_READ_ROLES.includes(admin.role)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from("products")
    .select(
      "sku, title, slug, price, compare_at_price, purchase_price, stock, status, short_description, warranty, barcode, supplier, tags, search_keywords, categories(slug), brands(slug), product_compatible_devices(device_models(name))"
    )
    .is("deleted_at", null)
    .order("title");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const csvRows = (rows ?? []).map((r) => ({
    sku: r.sku,
    title: r.title,
    slug: r.slug,
    // @ts-expect-error — Supabase's joined-table typing needs generated types to be precise; runtime shape is correct.
    brand: r.brands?.slug ?? "",
    // @ts-expect-error — see above.
    categorySlug: r.categories?.slug ?? "",
    price: r.price,
    compareAtPrice: r.compare_at_price ?? "",
    costPrice: r.purchase_price ?? "",
    stock: r.stock,
    status: r.status,
    shortDescription: r.short_description ?? "",
    warranty: r.warranty ?? "",
    barcode: r.barcode ?? "",
    supplier: r.supplier ?? "",
    tags: joinMultiValue(r.tags ?? []),
    searchKeywords: joinMultiValue(r.search_keywords ?? []),
    compatibleDevices: joinMultiValue(
      // @ts-expect-error — see above, joined-table typing.
      (r.product_compatible_devices ?? []).map((pcd) => pcd.device_models?.name).filter(Boolean)
    ),
  }));

  const csv = toCsv(csvRows.length > 0 ? csvRows : [Object.fromEntries(PRODUCT_CSV_COLUMNS.map((c) => [c, ""]))]);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="a2z-products-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
