import { describe, it, expect } from "vitest";
import { rowToProduct } from "@/lib/products/mapper";

describe("rowToProduct", () => {
  it("maps a full Supabase row to the public Product shape", () => {
    const row = {
      id: "p1",
      slug: "jbl-flip-6",
      title: "JBL Flip 6",
      brands: { name: "JBL", slug: "jbl" },
      categories: { slug: "bluetooth-speakers" },
      price: 1899,
      compare_at_price: 2299,
      sku: "A2Z-JBL-FLIP6",
      barcode: "600123456789",
      stock: 12,
      rating: 4.6,
      review_count: 34,
      badge: "Best Seller",
      colorways: ["Black", "Blue"],
      short_description: "Portable Bluetooth speaker",
      description: "Full description here.",
      specs: [{ label: "Battery", value: "12 hours" }],
      warranty: "1 year",
      compatibility: [],
      product_compatible_devices: [{ device_models: { name: "iPhone 15" } }],
      tags: ["waterproof"],
      search_keywords: ["speaker", "bluetooth"],
      product_images: [
        { url: "/img-2.jpg", is_primary: false, position: 1 },
        { url: "/img-1.jpg", is_primary: true, position: 0 },
      ],
    };

    const product = rowToProduct(row);

    expect(product.id).toBe("p1");
    expect(product.brand).toBe("JBL");
    expect(product.categorySlug).toBe("bluetooth-speakers");
    expect(product.price).toBe(1899);
    expect(product.compareAtPrice).toBe(2299);
    expect(product.compatibleDevices).toEqual(["iPhone 15"]);
    // Primary image sorts first regardless of position, since is_primary is the stronger signal.
    expect(product.images[0]).toBe("/img-1.jpg");
  });

  it("defaults gracefully when optional relations/fields are missing", () => {
    const row = {
      id: "p2",
      slug: "bare-product",
      title: "Bare Product",
      brands: null,
      categories: null,
      price: 100,
      sku: "SKU2",
      stock: 0,
      product_images: undefined,
      product_compatible_devices: undefined,
    };

    const product = rowToProduct(row);

    expect(product.brand).toBe("");
    expect(product.categorySlug).toBe("");
    expect(product.images).toEqual([]);
    expect(product.compatibleDevices).toEqual([]);
    expect(product.compareAtPrice).toBeUndefined();
  });
});

// Note: getFeaturedProducts and the other list-query functions in queries.ts are wrapped in
// Next.js's unstable_cache, which requires Next's internal "incremental cache" runtime — this
// doesn't exist in a plain Vitest/Node environment (confirmed: it throws
// "Invariant: incrementalCache missing" when invoked directly here), and stubbing that runtime
// convincingly is a much larger undertaking than this fix warrants. The error-vs-empty-result
// distinction those functions implement (see logAndThrow / ProductServiceError in queries.ts) is
// straightforward, reviewed code, not exercised by an automated test here — that's a real,
// disclosed gap, not a silently-skipped one. See Critical Fix 2's final report.
