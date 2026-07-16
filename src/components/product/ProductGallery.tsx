"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductImage } from "@/components/ui/ProductImage";

export function ProductGallery({
  images,
  title,
  activeIndex,
  onActiveIndexChange,
}: {
  images: string[];
  title: string;
  /** Optional controlled mode — the PDP passes this down so selecting a colourway can drive
   * which image is shown, instead of the gallery's active image being fully independent. */
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
}) {
  const [internalActive, setInternalActive] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const active = activeIndex ?? internalActive;
  const setActive = (i: number) => {
    setInternalActive(i);
    onActiveIndexChange?.(i);
  };

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!zoomOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [zoomOpen]);

  return (
    <div className="flex flex-col gap-4 sm:flex-row-reverse">
      <div className="relative aspect-square flex-1 overflow-hidden bg-mist">
        <button
          onClick={() => setZoomOpen(true)}
          className="group relative block h-full w-full cursor-zoom-in"
          aria-label="Zoom product image"
        >
          <ProductImage
            src={images[active]}
            alt={title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            containerClassName="h-full w-full"
            className="object-cover"
          />
          <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center bg-paper/90 text-ink opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
            <ZoomIn size={16} />
          </span>
        </button>
      </div>
      <div className="flex gap-3 sm:flex-col">
        {images.map((img, i) => (
          <button
            key={img}
            onClick={() => setActive(i)}
            className={cn(
              "relative h-20 w-20 shrink-0 overflow-hidden border bg-mist",
              active === i ? "border-ink" : "border-line"
            )}
          >
            <ProductImage
              src={img}
              alt={`${title} thumbnail ${i + 1}`}
              fill
              sizes="80px"
              containerClassName="h-full w-full"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {mounted &&
        zoomOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/95 p-6"
            onClick={() => setZoomOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label={`${title} — zoomed image`}
          >
            <button
              onClick={() => setZoomOpen(false)}
              aria-label="Close zoom"
              className="absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-full bg-paper/10 text-paper hover:bg-paper/20"
            >
              <X size={22} />
            </button>
            <div className="relative h-full max-h-[85vh] w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
              <Image src={images[active]} alt={title} fill sizes="90vw" className="object-contain" />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
