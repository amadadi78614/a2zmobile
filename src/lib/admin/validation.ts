import { z } from "zod";

export const productStatusSchema = z.enum(["draft", "published", "archived"]);

export const productFormSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(200),
  slug: z
    .string()
    .trim()
    .min(3)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, hyphen-separated"),
  sku: z.string().trim().min(2, "SKU is required"),
  barcode: z.string().trim().optional().or(z.literal("")),
  brand: z.string().trim().min(1, "Brand is required"),
  categorySlug: z.string().trim().min(1, "Category is required"),
  supplier: z.string().trim().optional().or(z.literal("")),

  // Prices are validated here and re-validated again at the DB layer via a
  // check constraint — this schema is the first gate, not the only one.
  costPrice: z.coerce.number().min(0).optional(),
  price: z.coerce.number().positive("Selling price must be greater than 0"),
  compareAtPrice: z.coerce.number().positive().optional().or(z.nan()).transform((v) => (Number.isNaN(v) ? undefined : v)),
  vatInclusive: z.boolean().default(true),

  stock: z.coerce.number().int().min(0, "Stock can't be negative"),
  reservedStock: z.coerce.number().int().min(0).default(0),

  weightKg: z.coerce.number().min(0).optional(),
  dimensionsCm: z.string().trim().optional().or(z.literal("")),

  shortDescription: z.string().trim().max(300).optional().or(z.literal("")),
  description: z.string().trim().optional().or(z.literal("")),
  warranty: z.string().trim().optional().or(z.literal("")),

  specs: z.array(z.object({ label: z.string().min(1), value: z.string().min(1) })).default([]),
  features: z.array(z.string().min(1)).default([]),
  colorway: z.array(z.string().min(1)).default([]),
  compatibleDevices: z.array(z.string().min(1)).default([]),
  tags: z.array(z.string().min(1)).default([]),
  searchKeywords: z.array(z.string().min(1)).default([]),
  images: z.array(z.string().url().or(z.string().startsWith("/"))).default([]),

  badge: z.enum(["New", "Sale", "Best Seller", "Low Stock"]).optional(),
  isFeatured: z.boolean().default(false),
  status: productStatusSchema.default("draft"),

  seoTitle: z.string().trim().max(70).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(160).optional().or(z.literal("")),
  metaKeywords: z.string().trim().optional().or(z.literal("")),
})
  .refine((data) => !data.compareAtPrice || data.compareAtPrice > data.price, {
    message: "Compare-at price must be higher than the selling price",
    path: ["compareAtPrice"],
  })
  .refine((data) => data.reservedStock <= data.stock, {
    message: "Reserved stock can't exceed total stock",
    path: ["reservedStock"],
  });

export type ProductFormValues = z.infer<typeof productFormSchema>;

export const bulkPriceUpdateSchema = z.object({
  productIds: z.array(z.string()).min(1),
  mode: z.enum(["set", "increase_percent", "decrease_percent", "increase_amount", "decrease_amount"]),
  value: z.coerce.number(),
}).refine((d) => {
  if (d.mode === "set" || d.mode === "increase_amount" || d.mode === "decrease_amount") return d.value >= 0;
  return d.value >= 0 && d.value <= 100;
}, { message: "Value out of range for the selected mode", path: ["value"] });

export const bulkStockUpdateSchema = z.object({
  productIds: z.array(z.string()).min(1),
  mode: z.enum(["set", "increase", "decrease"]),
  value: z.coerce.number().int().min(0),
});

export const bulkCategoryUpdateSchema = z.object({
  productIds: z.array(z.string()).min(1),
  categorySlug: z.string().min(1),
});

export const bulkStatusUpdateSchema = z.object({
  productIds: z.array(z.string()).min(1),
  status: productStatusSchema,
});
