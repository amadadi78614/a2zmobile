"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Slide = {
  eyebrow: string;
  title: string[];
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  image: string;
  alt: string;
};

const slides: Slide[] = [
  {
    eyebrow: "New In · Bluetooth Speakers",
    title: ["Sound that", "travels with you."],
    subtitle:
      "JBL Flip 6 and Go 3 — waterproof, portable, and in stock now at Mbombela's trusted accessories specialist.",
    primaryCta: { label: "Shop Speakers", href: "/shop?category=bluetooth-speakers" },
    secondaryCta: { label: "Shop All", href: "/shop" },
    image: "/images/hero-speakers.png",
    alt: "Bluetooth speaker lineup at A2Z",
  },
  {
    eyebrow: "Never Run Flat",
    title: ["Power banks &", "fast chargers."],
    subtitle:
      "Anker, Baseus, and Romoss — genuine stock with real capacity, not inflated mAh claims.",
    primaryCta: { label: "Shop Power", href: "/shop?category=chargers-cables" },
    secondaryCta: { label: "Shop All", href: "/shop" },
    image: "/images/hero-power.png",
    alt: "Power banks and chargers at A2Z",
  },
  {
    eyebrow: "Session Ready",
    title: ["Hookah sets,", "done right."],
    subtitle:
      "Glass hookah sets, washable hoses, and coconut shell charcoal — everything for a proper session.",
    primaryCta: { label: "Shop Hookah", href: "/shop?category=hookah" },
    secondaryCta: { label: "Shop All", href: "/shop" },
    image: "/images/hero-hookah.png",
    alt: "Hookah sets and accessories at A2Z",
  },
];

const AUTOPLAY_MS = 6000;

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((i: number) => {
    setIndex((i + slides.length) % slides.length);
  }, []);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (paused || reduceMotion) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, index]);

  return (
    <section
      className="relative overflow-hidden bg-ink"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured promotions"
    >
      <div
        className="flex w-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((slide, i) => (
          <div
            key={slide.eyebrow}
            className="w-full shrink-0"
            aria-hidden={i !== index}
          >
            <div className="container-content grid min-h-[560px] grid-cols-1 items-center gap-10 py-16 md:min-h-[520px] md:grid-cols-2 md:py-0">
            <div>
              <span className="eyebrow text-primary">{slide.eyebrow}</span>
              <h1 className="mt-4 max-w-lg font-display text-4xl font-semibold leading-[1.08] text-paper sm:text-5xl lg:text-6xl">
                {slide.title[0]}
                <br />
                {slide.title[1]}
              </h1>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-paper/60 sm:text-base">
                {slide.subtitle}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href={slide.primaryCta.href} className="btn-primary">
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

            <div className="relative mx-auto aspect-square w-full max-w-md">
              <div className="absolute -inset-6 rounded-full bg-primary/10 blur-3xl" />
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                priority={i === 0}
                className="relative object-contain drop-shadow-[0_40px_60px_rgba(0,0,0,0.5)]"
              />
            </div>
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

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((slide, i) => (
          <button
            key={slide.eyebrow}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === index ? "w-6 bg-primary" : "w-1.5 bg-paper/30 hover:bg-paper/50"
            )}
          />
        ))}
      </div>
    </section>
  );
}
