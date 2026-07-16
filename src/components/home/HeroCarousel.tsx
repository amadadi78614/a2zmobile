"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { HeroVisual } from "@/components/home/HeroVisual";

type Slide = {
  eyebrow: string;
  title: string[];
  subtitle: string;
  supportingText?: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  visual: "mobile-tech" | "vape" | "hookah";
  /** Relative autoplay weight — Mobile & Tech is the primary revenue pillar, so it holds the
   * stage roughly 60% of a rotation; Vape/Hookah split the rest. Floored at a readable minimum
   * (3.2s) rather than a literal 20% share, since an unreadable-fast slide isn't "premium." */
  durationMs: number;
};

const slides: Slide[] = [
  {
    eyebrow: "Mobile & Tech",
    title: ["Power your", "digital life."],
    subtitle:
      "Premium mobile accessories, chargers, power banks, speakers and computer accessories.",
    supportingText: "Anker · Baseus · JBL · Romoss · and more.",
    primaryCta: { label: "Shop Mobile & Tech", href: "/shop" },
    secondaryCta: { label: "Browse Accessories", href: "/shop?category=mobile-accessories" },
    visual: "mobile-tech",
    durationMs: 8000,
  },
  {
    eyebrow: "Coming Soon",
    title: ["Premium vaping", "collection."],
    subtitle: "Disposable vapes, pod systems, vape kits and accessories — landing soon.",
    supportingText: "Premium products. Latest flavours. Nationwide delivery.",
    primaryCta: { label: "Get notified on WhatsApp", href: "https://wa.me/27000000000?text=" + encodeURIComponent("Hi A2Z, please let me know when the vape range launches.") },
    secondaryCta: { label: "Shop What's Live Now", href: "/shop" },
    visual: "vape",
    durationMs: 3200,
  },
  {
    eyebrow: "New In · Hookah",
    title: ["The ultimate", "hookah experience."],
    subtitle: "Premium hookahs, flavours, charcoal and accessories.",
    supportingText: "Everything you need for the perfect session.",
    primaryCta: { label: "Shop Hookah", href: "/shop?category=hookah" },
    secondaryCta: { label: "Shop All", href: "/shop" },
    visual: "hookah",
    durationMs: 3200,
  },
];

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback((i: number) => {
    setIndex((i + slides.length) % slides.length);
  }, []);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (paused || reduceMotion) return;
    timerRef.current = setTimeout(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, slides[index].durationMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [paused, index]);

  return (
    <section
      className="relative overflow-hidden bg-ink"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false);
      }}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured product categories"
    >
      <div
        className="flex w-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((slide, i) => (
          <div key={slide.eyebrow} className="w-full shrink-0" aria-hidden={i !== index}>
            <div className="container-content grid min-h-[560px] grid-cols-1 items-center gap-10 py-16 md:min-h-[560px] md:grid-cols-2 md:py-0">
              <div className="max-w-lg">
                <span className="eyebrow text-primary">{slide.eyebrow}</span>
                <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.08] text-paper sm:text-5xl lg:text-[3.5rem]">
                  {slide.title[0]}
                  <br />
                  {slide.title[1]}
                </h1>
                <p className="mt-5 max-w-md text-base leading-relaxed text-paper/70">
                  {slide.subtitle}
                </p>
                {slide.supportingText && (
                  <p className="mt-3 text-sm leading-relaxed text-paper/45">{slide.supportingText}</p>
                )}
                <div className="mt-9 flex flex-wrap gap-4">
                  <Link
                    href={slide.primaryCta.href}
                    target={slide.primaryCta.href.startsWith("http") ? "_blank" : undefined}
                    rel={slide.primaryCta.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="btn-primary"
                  >
                    {slide.primaryCta.label}
                  </Link>
                  <Link
                    href={slide.secondaryCta.href}
                    className="border border-paper/30 px-7 py-3.5 text-sm font-medium tracking-wide text-paper transition-colors hover:border-paper hover:bg-paper hover:text-ink"
                  >
                    {slide.secondaryCta.label}
                  </Link>
                </div>
              </div>

              <HeroVisual variant={slide.visual} />
            </div>
          </div>
        ))}
      </div>

      {/* Arrows */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-paper/10 p-2.5 text-paper backdrop-blur transition-colors hover:bg-paper/20 sm:flex"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-paper/10 p-2.5 text-paper backdrop-blur transition-colors hover:bg-paper/20 sm:flex"
      >
        <ChevronRight size={20} />
      </button>

      {/* Progress-weighted dots — width reflects each slide's relative autoplay share */}
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((slide, i) => (
          <button
            key={slide.eyebrow}
            onClick={() => goTo(i)}
            aria-label={`Go to ${slide.eyebrow} slide`}
            aria-current={i === index}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === index ? "bg-primary" : "bg-paper/30 hover:bg-paper/50",
              i === index ? (slide.durationMs > 6000 ? "w-10" : "w-6") : "w-1.5"
            )}
          />
        ))}
      </div>
    </section>
  );
}
