import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { PRODUCT_WRITE_ROLES } from "@/lib/types";
import { getAdminProductById } from "@/lib/admin/product-queries";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin(PRODUCT_WRITE_ROLES);
  const { id } = await params;
  const product = await getAdminProductById(id);
  if (!product) notFound();

  return (
    <div>
      <div className="mb-8">
        <span className="eyebrow">Products</span>
        <h1 className="mt-2 text-2xl font-semibold">Edit {product.title}</h1>
      </div>
      <ProductForm product={product} />
    </div>
  );
}
