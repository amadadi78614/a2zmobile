import { requireAdmin } from "@/lib/admin/auth";
import { PRODUCT_READ_ROLES, PRODUCT_WRITE_ROLES } from "@/lib/types";
import { listAdminProducts } from "@/lib/admin/product-queries";
import { ProductsTable } from "@/components/admin/ProductsTable";

export default async function AdminProductsPage() {
  const admin = await requireAdmin(PRODUCT_READ_ROLES);
  const { products, usingMockData } = await listAdminProducts();
  const canWrite = PRODUCT_WRITE_ROLES.includes(admin.role);

  return (
    <div>
      <div className="mb-6">
        <span className="eyebrow">Catalog</span>
        <h1 className="mt-2 text-2xl font-semibold">Products</h1>
      </div>

      {usingMockData && (
        <div className="mb-6 border border-primary/40 bg-primary/10 p-4 text-sm">
          <strong>Read-only preview.</strong> Supabase isn&apos;t connected yet, so this table shows the
          storefront&apos;s mock catalog for review — add/edit/delete/import are disabled until{" "}
          <code className="bg-paper px-1 py-0.5 text-xs">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="bg-paper px-1 py-0.5 text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> are set (see README).
        </div>
      )}

      <ProductsTable products={products} canWrite={canWrite && !usingMockData} />
    </div>
  );
}
