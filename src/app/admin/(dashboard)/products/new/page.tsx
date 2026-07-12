import { requireAdmin } from "@/lib/admin/auth";
import { PRODUCT_WRITE_ROLES } from "@/lib/types";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  await requireAdmin(PRODUCT_WRITE_ROLES);

  return (
    <div>
      <div className="mb-8">
        <span className="eyebrow">Products</span>
        <h1 className="mt-2 text-2xl font-semibold">Add Product</h1>
      </div>
      <ProductForm />
    </div>
  );
}
