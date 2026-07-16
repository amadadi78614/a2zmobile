"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductPurchasePanel } from "@/components/product/ProductPurchasePanel";

export function ProductGalleryAndPanel({ product }: { product: Product }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
      <ProductGallery
        images={product.images}
        title={product.title}
        activeIndex={activeImageIndex}
        onActiveIndexChange={setActiveImageIndex}
      />
      <ProductPurchasePanel
        product={product}
        onColorwayChange={(index) => {
          if (index !== null) setActiveImageIndex(index);
        }}
      />
    </div>
  );
}
