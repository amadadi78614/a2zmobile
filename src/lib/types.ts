export type Category = {
  id: string;
  slug: string;
  name: string;
  image: string;
  productCount: number;
};

export type Brand = {
  id: string;
  slug: string;
  name: string;
  logo: string;
};

export type Product = {
  id: string;
  slug: string;
  title: string;
  brand: string;
  categorySlug: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  sku: string;
  barcode?: string;
  stock: number;
  rating: number;
  reviewCount: number;
  badge?: "New" | "Sale" | "Best Seller" | "Low Stock";
  colorway?: string[];
  /** Explicit colourway -> image URL mapping, for when real per-swatch photography exists.
   * Deliberately NOT populated from a positional guess (images[i] <-> colorway[i]) anywhere in
   * the current mock catalog — most products have far fewer images than colourways, and the
   * existing images are undifferentiated placeholder graphics, not real per-colour photos. A
   * confident-looking wrong photo is worse than the gallery honestly not changing on colour
   * select. Populate this per-product once real photography exists. */
  colorwayImages?: Record<string, string>;
  shortDescription: string;
  description: string;
  specs: { label: string; value: string }[];
  warranty: string;
  /** @deprecated superseded by `compatibleDevices` (structured brand/series/model) — kept for backward compat with existing mock data until the free-text values are backfilled into device_models. */
  compatibility?: string[];
  /** Structured device compatibility — device model names this product fits. Drives both search and the "Shop by Device" filter. */
  compatibleDevices?: string[];
  tags?: string[];
  searchKeywords?: string[];
};

export type CartLine = {
  productId: string;
  quantity: number;
  colorway?: string;
};

export type Address = {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string;
  suburb?: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault?: boolean;
};

export type OrderStatus =
  | "pending"
  | "paid"
  | "packed"
  | "collected"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type OrderItem = {
  productId: string;
  title: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  colorway?: string;
  image: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  fulfilmentMethod: "delivery" | "collection";
  paymentMethod: "payfast" | "ozow" | "eft";
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  address?: Address;
  collectionStore?: string;
  trackingNumber?: string;
  placedAt: string;
};

// ---------- Admin (Phase 4) ----------

export type AdminRole =
  | "owner"
  | "administrator"
  | "inventory"
  | "sales"
  | "marketing"
  | "read_only";

export const ADMIN_ROLES: AdminRole[] = [
  "owner",
  "administrator",
  "inventory",
  "sales",
  "marketing",
  "read_only",
];

// Roles allowed to create/edit/delete/bulk-edit products.
export const PRODUCT_WRITE_ROLES: AdminRole[] = ["owner", "administrator", "inventory"];
// Roles allowed to view the admin area at all.
export const PRODUCT_READ_ROLES: AdminRole[] = [
  "owner",
  "administrator",
  "inventory",
  "sales",
  "marketing",
  "read_only",
];

export type AdminUser = {
  id: string;
  fullName: string;
  role: AdminRole;
  isActive: boolean;
};

export type ProductStatus = "draft" | "published" | "archived";

/**
 * Full admin-side product record. This is a superset of the public-facing
 * `Product` type above — every field in `Product` also exists here under
 * the same name where applicable, so the same product data can drive both
 * the storefront card/detail views and the admin form without translation.
 */
export type AdminProduct = Product & {
  status: ProductStatus;
  costPrice?: number;
  vatInclusive: boolean;
  weightKg?: number;
  dimensionsCm?: string;
  reservedStock: number;
  isFeatured: boolean;
  supplier?: string;
  features?: string[];
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string;
  subcategorySlug?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

export type AuditLogEntry = {
  id: string;
  actorId: string;
  actorRole: AdminRole;
  action: string;
  entityType: string;
  entityId?: string;
  before?: unknown;
  after?: unknown;
  createdAt: string;
};

export type DashboardStats = {
  revenueToday: number;
  revenue7d: number;
  revenue30d: number;
  ordersToday: number;
  pendingOrders: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  revenueSeries: { date: string; revenue: number }[];
  topCategories: { name: string; revenue: number }[];
  recentOrders: Order[];
  bestSellers: { productId: string; title: string; unitsSold: number }[];
};

// ---------- Device compatibility & search ----------

export type DeviceBrand = {
  id: string;
  name: string;
  slug: string;
};

export type DeviceSeries = {
  id: string;
  brandId: string;
  name: string;
  slug: string;
};

export type DeviceModel = {
  id: string;
  seriesId: string;
  brandId: string;
  name: string;
  slug: string;
};

export type SearchResult = {
  product: Product;
  matchType: "exact_sku_barcode" | "fulltext" | "trigram";
};

// ---------- Sprint 3: reviews (frontend framework only, no backend/submission yet) ----------

export type Review = {
  id: string;
  productId: string;
  authorName: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
  verifiedPurchase: boolean;
  /** Ready for photo reviews whenever real customer photos exist — deliberately empty in the
   * current mock data rather than filled with placeholder images passed off as real. */
  photos: string[];
};

export type ReviewSummary = {
  average: number;
  count: number;
  breakdown: { stars: 1 | 2 | 3 | 4 | 5; count: number }[];
};

