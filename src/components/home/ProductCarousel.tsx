"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/lib/types";
import { ProductCard } from "@/components/product/ProductCard";
import { cn } from "@/lib/utils";

export function ProductCarousel({
  eyebrow,
  title,
  products,
  viewAllHref = "/shop",
}: {
  eyebrow: string;
  title: string;
  products: Product[];
  viewAllHref?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  function updateEdges() {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }

  useEffect(() => {
    updateEdges();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateEdges, { passive: true });
    window.addEventListener("resize", updateEdges);
    return () => {
      el.removeEventListener("scroll", updateEdges);
      window.removeEventListener("resize", updateEdges);
    };
  }, []);

  function scrollByCards(direction: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-carousel-item]");
    const step = card ? card.offsetWidth + 20 : el.clientWidth * 0.8;
    el.scrollBy({ left: direction * step * 2, behavior: "smooth" });
  }

  return (
    <section className="py-16 md:py-20">
      <div className="container-content flex items-end justify-between">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">{title}</h2>
        </div>
        <div className="flex items-center gap-3">
          <Link href={viewAllHref} className="hidden text-sm font-medium underline-offset-4 hover:underline sm:block">
            View all
          </Link>
          <div className="hidden gap-2 sm:flex">
            <button
              onClick={() => scrollByCards(-1)}
              disabled={atStart}
              aria-label="Scroll left"
              className="flex h-9 w-9 items-center justify-center border border-line text-ink-500 transition-colors hover:border-ink hover:text-ink disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scrollByCards(1)}
              disabled={atEnd}
              aria-label="Scroll right"
              className="flex h-9 w-9 items-center justify-center border border-line text-ink-500 transition-colors hover:border-ink hover:text-ink disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={trackRef}
        className={cn(
          "mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2",
          "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
          "pl-5 md:pl-8 lg:pl-10"
        )}
      >
        {products.map((p) => (
          <div
            key={p.id}
            data-carousel-item
            className="w-[62vw] shrink-0 snap-start sm:w-[38vw] md:w-[27vw] lg:w-[22vw] xl:w-[19vw]"
          >
            <ProductCard product={p} />
          </div>
        ))}
        {/* trailing spacer so the last card can reach the left edge when scrolled fully */}
        <div className="w-px shrink-0" aria-hidden />
      </div>
    </section>
  );
}
