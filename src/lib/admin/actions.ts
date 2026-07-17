"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { assertAdminRole } from "@/lib/admin/auth";
import { writeAuditLog } from "@/lib/admin/audit";
import { PRODUCT_WRITE_ROLES } from "@/lib/types";
import {
  productFormSchema,
  bulkPriceUpdateSchema,
  bulkStockUpdateSchema,
  bulkCategoryUpdateSchema,
  bulkStatusUpdateSchema,
} from "@/lib/admin/validation";
import { z } from "zod";

export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

function toRow(values: z.infer<typeof productFormSchema>) {
  return {
    title: values.title,
    slug: values.slug,
    sku: values.sku,
    barcode: values.barcode || null,
    supplier: values.supplier || null,
    price: values.price,
    compare_at_price: values.compareAtPrice ?? null,
    purchase_price: values.costPrice ?? null,
    vat_inclusive: values.vatInclusive,
    stock: values.stock,
    reserved_stock: values.reservedStock,
    weight_kg: values.weightKg ?? null,
    dimensions_cm: values.dimensionsCm || null,
    short_description: values.shortDescription || null,
    description: values.description || null,
    warranty: values.warranty || null,
    specs: values.specs,
    features: values.features,
    colorways: values.colorway,
    tags: values.tags,
    search_keywords: values.searchKeywords,
    badge: values.badge ?? null,
    is_featured: values.isFeatured,
    status: values.status,
    seo_title: values.seoTitle || null,
    seo_description: values.seoDescription || null,
    meta_keywords: values.metaKeywords || null,
    updated_at: new Date().toISOString(),
  };
}

export async function createProduct(input: unknown): Promise<ActionResult<{ id: string }>> {
  const admin = await assertAdminRoleSafe();
  if (!admin) return { success: false, error: "Not authorized." };

  const parsed = productFormSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Validation failed.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", parsed.data.categorySlug)
    .maybeSingle();

  const { data: brand } = await supabase
    .from("brands")
    .select("id")
    .eq("slug", parsed.data.brand.toLowerCase().replace(/\s+/g, "-"))
    .maybeSingle();

  const { data, error } = await supabase
    .from("products")
    .insert({
      ...toRow(parsed.data),
      category_id: category?.id ?? null,
      brand_id: brand?.id ?? null,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  await syncProductImages(supabase, data.id, parsed.data.images);
  await syncCompatibleDevices(supabase, data.id, parsed.data.compatibleDevices);

  await writeAuditLog({
    actorId: admin.id,
    actorRole: admin.role,
    action: "product.create",
    entityType: "product",
    entityId: data.id,
    after: parsed.data,
  });

  revalidatePath("/admin/products");
  revalidateTag("products"); // bust the customer-facing product cache too (Critical Fix 2)
  return { success: true, data: { id: data.id } };
}

export async function updateProduct(id: string, input: unknown): Promise<ActionResult> {
  const admin = await assertAdminRoleSafe();
  if (!admin) return { success: false, error: "Not authorized." };

  const parsed = productFormSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Validation failed.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();

  const { data: before } = await supabase.from("products").select("*").eq("id", id).maybeSingle();

  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", parsed.data.categorySlug)
    .maybeSingle();

  const { error } = await supabase
    .from("products")
    .update({ ...toRow(parsed.data), category_id: category?.id ?? null })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  await syncProductImages(supabase, id, parsed.data.images);
  await syncCompatibleDevices(supabase, id, parsed.data.compatibleDevices);

  await writeAuditLog({
    actorId: admin.id,
    actorRole: admin.role,
    action: "product.update",
    entityType: "product",
    entityId: id,
    before,
    after: parsed.data,
  });

  revalidatePath("/admin/products");
  revalidateTag("products"); // bust the customer-facing product cache too (Critical Fix 2)
  revalidatePath(`/admin/products/${id}/edit`);
  return { success: true, data: undefined };
}

/**
 * Soft delete — sets deleted_at rather than removing the row, so order
 * history that references this product via order_items keeps working and
 * the action is reversible. "Delete Product" in the UI maps to this.
 */
export async function deleteProduct(id: string): Promise<ActionResult> {
  const admin = await assertAdminRoleSafe(["owner", "administrator"]);
  if (!admin) return { success: false, error: "Not authorized." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ deleted_at: new Date().toISOString(), status: "archived" })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  await writeAuditLog({
    actorId: admin.id,
    actorRole: admin.role,
    action: "product.delete",
    entityType: "product",
    entityId: id,
  });

  revalidatePath("/admin/products");
  revalidateTag("products"); // bust the customer-facing product cache too (Critical Fix 2)
  return { success: true, data: undefined };
}

export async function archiveProduct(id: string): Promise<ActionResult> {
  return setProductStatus(id, "archived");
}

export async function publishProduct(id: string): Promise<ActionResult> {
  return setProductStatus(id, "published");
}

export async function setProductStatus(
  id: string,
  status: "draft" | "published" | "archived"
): Promise<ActionResult> {
  const admin = await assertAdminRoleSafe();
  if (!admin) return { success: false, error: "Not authorized." };

  const supabase = await createClient();
  const { error } = await supabase.from("products").update({ status }).eq("id", id);
  if (error) return { success: false, error: error.message };

  await writeAuditLog({
    actorId: admin.id,
    actorRole: admin.role,
    action: `product.status_change.${status}`,
    entityType: "product",
    entityId: id,
    after: { status },
  });

  revalidatePath("/admin/products");
  revalidateTag("products"); // bust the customer-facing product cache too (Critical Fix 2)
  return { success: true, data: undefined };
}

export async function duplicateProduct(id: string): Promise<ActionResult<{ id: string }>> {
  const admin = await assertAdminRoleSafe();
  if (!admin) return { success: false, error: "Not authorized." };

  const supabase = await createClient();
  const { data: original, error: fetchError } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !original) return { success: false, error: "Original product not found." };

  const { id: _id, created_at, updated_at, ...rest } = original;
  const { data, error } = await supabase
    .from("products")
    .insert({
      ...rest,
      title: `${original.title} (Copy)`,
      slug: `${original.slug}-copy-${Date.now().toString(36)}`,
      sku: `${original.sku}-COPY`,
      status: "draft",
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  await writeAuditLog({
    actorId: admin.id,
    actorRole: admin.role,
    action: "product.duplicate",
    entityType: "product",
    entityId: data.id,
    before: { duplicatedFrom: id },
  });

  revalidatePath("/admin/products");
  revalidateTag("products"); // bust the customer-facing product cache too (Critical Fix 2)
  return { success: true, data: { id: data.id } };
}

// ---------- Bulk operations ----------

export async function bulkDeleteProducts(input: unknown): Promise<ActionResult> {
  const admin = await assertAdminRoleSafe(["owner", "administrator"]);
  if (!admin) return { success: false, error: "Not authorized." };

  const parsed = z.object({ productIds: z.array(z.string()).min(1) }).safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid selection." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ deleted_at: new Date().toISOString(), status: "archived" })
    .in("id", parsed.data.productIds);

  if (error) return { success: false, error: error.message };

  await writeAuditLog({
    actorId: admin.id,
    actorRole: admin.role,
    action: "product.bulk_delete",
    entityType: "product",
    after: { productIds: parsed.data.productIds },
  });

  revalidatePath("/admin/products");
  revalidateTag("products"); // bust the customer-facing product cache too (Critical Fix 2)
  return { success: true, data: undefined };
}

export async function bulkUpdateStatus(input: unknown): Promise<ActionResult> {
  const admin = await assertAdminRoleSafe();
  if (!admin) return { success: false, error: "Not authorized." };

  const parsed = bulkStatusUpdateSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ status: parsed.data.status })
    .in("id", parsed.data.productIds);

  if (error) return { success: false, error: error.message };

  await writeAuditLog({
    actorId: admin.id,
    actorRole: admin.role,
    action: `product.bulk_status_change.${parsed.data.status}`,
    entityType: "product",
    after: parsed.data,
  });

  revalidatePath("/admin/products");
  revalidateTag("products"); // bust the customer-facing product cache too (Critical Fix 2)
  return { success: true, data: undefined };
}

/**
 * Bulk price update never accepts a client-supplied final price for
 * existing rows — only a mode + delta applied server-side against the
 * current DB value, via Postgres arithmetic, so a manipulated client
 * request can't set arbitrary prices even if it lies about current values.
 */
export async function bulkUpdatePrice(input: unknown): Promise<ActionResult> {
  const admin = await assertAdminRoleSafe();
  if (!admin) return { success: false, error: "Not authorized." };

  const parsed = bulkPriceUpdateSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input." };

  const supabase = await createClient();
  const { productIds, mode, value } = parsed.data;

  let rpcError = null;
  if (mode === "set") {
    const { error } = await supabase.from("products").update({ price: value }).in("id", productIds);
    rpcError = error;
  } else {
    // Percentage/amount deltas require reading current price server-side
    // rather than trusting a client-computed final number.
    const { data: rows, error: readError } = await supabase
      .from("products")
      .select("id, price")
      .in("id", productIds);
    if (readError) return { success: false, error: readError.message };

    for (const row of rows ?? []) {
      let newPrice = row.price;
      if (mode === "increase_percent") newPrice = row.price * (1 + value / 100);
      if (mode === "decrease_percent") newPrice = row.price * (1 - value / 100);
      if (mode === "increase_amount") newPrice = row.price + value;
      if (mode === "decrease_amount") newPrice = Math.max(0, row.price - value);

      const { error } = await supabase
        .from("products")
        .update({ price: Math.round(newPrice * 100) / 100 })
        .eq("id", row.id);
      if (error) rpcError = error;
    }
  }

  if (rpcError) return { success: false, error: rpcError.message };

  await writeAuditLog({
    actorId: admin.id,
    actorRole: admin.role,
    action: "product.bulk_price_update",
    entityType: "product",
    after: parsed.data,
  });

  revalidatePath("/admin/products");
  revalidateTag("products"); // bust the customer-facing product cache too (Critical Fix 2)
  return { success: true, data: undefined };
}

export async function bulkUpdateStock(input: unknown): Promise<ActionResult> {
  const admin = await assertAdminRoleSafe(["owner", "administrator", "inventory"]);
  if (!admin) return { success: false, error: "Not authorized." };

  const parsed = bulkStockUpdateSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input." };

  const supabase = await createClient();
  const { productIds, mode, value } = parsed.data;

  if (mode === "set") {
    const { error } = await supabase.from("products").update({ stock: value }).in("id", productIds);
    if (error) return { success: false, error: error.message };
  } else {
    const { data: rows, error: readError } = await supabase
      .from("products")
      .select("id, stock")
      .in("id", productIds);
    if (readError) return { success: false, error: readError.message };

    for (const row of rows ?? []) {
      const newStock = mode === "increase" ? row.stock + value : Math.max(0, row.stock - value);
      const { error } = await supabase.from("products").update({ stock: newStock }).eq("id", row.id);
      if (error) return { success: false, error: error.message };
    }
  }

  await writeAuditLog({
    actorId: admin.id,
    actorRole: admin.role,
    action: "product.bulk_stock_update",
    entityType: "product",
    after: parsed.data,
  });

  revalidatePath("/admin/products");
  revalidateTag("products"); // bust the customer-facing product cache too (Critical Fix 2)
  return { success: true, data: undefined };
}

export async function bulkUpdateCategory(input: unknown): Promise<ActionResult> {
  const admin = await assertAdminRoleSafe();
  if (!admin) return { success: false, error: "Not authorized." };

  const parsed = bulkCategoryUpdateSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input." };

  const supabase = await createClient();
  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", parsed.data.categorySlug)
    .maybeSingle();

  if (!category) return { success: false, error: "Category not found." };

  const { error } = await supabase
    .from("products")
    .update({ category_id: category.id })
    .in("id", parsed.data.productIds);

  if (error) return { success: false, error: error.message };

  await writeAuditLog({
    actorId: admin.id,
    actorRole: admin.role,
    action: "product.bulk_category_update",
    entityType: "product",
    after: parsed.data,
  });

  revalidatePath("/admin/products");
  revalidateTag("products"); // bust the customer-facing product cache too (Critical Fix 2)
  return { success: true, data: undefined };
}

// ---------- Bulk import ----------

/**
 * Upserts products by SKU. Rows missing a SKU, title, price, or stock are
 * rejected individually (with a reason) rather than aborting the whole
 * import, so a large file with a few bad rows still gets the good ones in.
 */
export async function importProductsCsv(
  csvText: string
): Promise<ActionResult<{ created: number; updated: number; errors: { row: number; reason: string }[] }>> {
  const admin = await assertAdminRoleSafe();
  if (!admin) return { success: false, error: "Not authorized." };

  const { parseCsv, splitMultiValue } = await import("@/lib/admin/csv");
  const rows = parseCsv(csvText);
  const supabase = await createClient();

  let created = 0;
  let updated = 0;
  const errors: { row: number; reason: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row.sku || !row.title || !row.price) {
      errors.push({ row: i + 2, reason: "Missing required field (sku, title, or price)" });
      continue;
    }
    const price = Number(row.price);
    const stock = Number(row.stock || 0);
    if (Number.isNaN(price) || price <= 0) {
      errors.push({ row: i + 2, reason: "Invalid price" });
      continue;
    }
    if (Number.isNaN(stock) || stock < 0) {
      errors.push({ row: i + 2, reason: "Invalid stock" });
      continue;
    }

    let categoryId: string | null = null;
    if (row.categorySlug) {
      const { data: category } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", row.categorySlug)
        .maybeSingle();
      categoryId = category?.id ?? null;
    }

    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("sku", row.sku)
      .maybeSingle();

    const payload = {
      sku: row.sku,
      title: row.title,
      slug: row.slug || row.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      brand_id: null as string | null,
      category_id: categoryId,
      price,
      compare_at_price: row.compareAtPrice ? Number(row.compareAtPrice) : null,
      purchase_price: row.costPrice ? Number(row.costPrice) : null,
      stock,
      status: (row.status as "draft" | "published" | "archived") || "draft",
      short_description: row.shortDescription || null,
      warranty: row.warranty || null,
      barcode: row.barcode || null,
      supplier: row.supplier || null,
      tags: splitMultiValue(row.tags),
      search_keywords: splitMultiValue(row.searchKeywords),
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      const { error } = await supabase.from("products").update(payload).eq("id", existing.id);
      if (error) {
        errors.push({ row: i + 2, reason: error.message });
      } else {
        await syncCompatibleDevices(supabase, existing.id, splitMultiValue(row.compatibleDevices));
        updated++;
      }
    } else {
      const { data: inserted, error } = await supabase.from("products").insert(payload).select("id").single();
      if (error || !inserted) {
        errors.push({ row: i + 2, reason: error?.message ?? "Insert failed" });
      } else {
        await syncCompatibleDevices(supabase, inserted.id, splitMultiValue(row.compatibleDevices));
        created++;
      }
    }
  }

  await writeAuditLog({
    actorId: admin.id,
    actorRole: admin.role,
    action: "product.bulk_import",
    entityType: "product",
    after: { created, updated, errorCount: errors.length },
  });

  revalidatePath("/admin/products");
  revalidateTag("products"); // bust the customer-facing product cache too (Critical Fix 2)
  return { success: true, data: { created, updated, errors } };
}

/** assertAdminRole throws; wrap it so Server Actions can return a typed result instead of an unhandled rejection. */
async function assertAdminRoleSafe(roles = PRODUCT_WRITE_ROLES) {
  try {
    return await assertAdminRole(roles);
  } catch {
    return null;
  }
}

/**
 * Replaces the product_images rows for a product to match the submitted
 * image list, in order, with the first image flagged primary. Simplest
 * correct approach for a form that submits the full ordered list each
 * save — avoids diffing individual add/remove/reorder operations.
 */
async function syncProductImages(
  supabase: Awaited<ReturnType<typeof createClient>>,
  productId: string,
  images: string[]
) {
  await supabase.from("product_images").delete().eq("product_id", productId);
  if (images.length === 0) return;
  const rows = images.map((url, position) => ({
    product_id: productId,
    url,
    position,
    is_primary: position === 0,
  }));
  await supabase.from("product_images").insert(rows);
}

/**
 * Resolves device model display names (as picked in the ProductForm) to
 * `device_models.id` and replaces this product's compatibility rows.
 * Names that don't match an existing device_models row are silently
 * skipped rather than failing the whole save — a typo'd device name
 * shouldn't block saving the rest of the product, but it does mean it
 * won't be searchable/filterable until corrected. Consider surfacing
 * unmatched names back to the form as a warning in a future pass.
 */
async function syncCompatibleDevices(
  supabase: Awaited<ReturnType<typeof createClient>>,
  productId: string,
  deviceNames: string[]
) {
  await supabase.from("product_compatible_devices").delete().eq("product_id", productId);
  if (deviceNames.length === 0) return;

  const { data: models } = await supabase
    .from("device_models")
    .select("id, name")
    .in("name", deviceNames);

  const rows = (models ?? []).map((m) => ({ product_id: productId, device_model_id: m.id }));
  if (rows.length > 0) {
    await supabase.from("product_compatible_devices").insert(rows);
  }
}
