import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, MapPin, Users, Truck } from "lucide-react";

export const metadata: Metadata = {
  title: "About A2Z Mobile & Computer Services",
  description:
    "A2Z Mobile & Computer Services is a South African ecommerce brand specialising in genuine Bluetooth speakers, phone covers, chargers, power banks, fans, and hookah essentials, with fast nationwide delivery.",
};

const stats = [
  { icon: MapPin, label: "South African Owned", body: "Proudly South African, shipping nationwide with a local base in Mbombela, Mpumalanga." },
  { icon: ShieldCheck, label: "Genuine Products", body: "Every product is sourced through authorised local distributors — never grey-market imports." },
  { icon: Users, label: "Real people, real support", body: "Speak to someone who actually knows the products, in-store or on WhatsApp." },
  { icon: Truck, label: "Fast Nationwide Delivery", body: "2–4 working day courier delivery across South Africa, with same-day delivery in our local zone." },
];

export default function AboutPage() {
  return (
    <div className="container-content py-14 md:py-20">
      <div className="max-w-2xl">
        <span className="eyebrow">About Us</span>
        <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
          Mobile &amp; computer accessories, done properly.
        </h1>
        <p className="mt-6 text-sm leading-relaxed text-ink-500 sm:text-base">
          A2Z Mobile &amp; Computer Services started with a simple idea: sell the accessories
          people actually need — Bluetooth speakers, phone covers, chargers, power banks, fans,
          hookah essentials, and repair parts — as genuine stock at honest prices, backed by
          people who understand what they&apos;re selling.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-ink-500 sm:text-base">
          Today we&apos;re a South African ecommerce brand, shipping nationwide from our base in
          Mpumalanga. Every product listed here is stock we actually hold or can get quickly
          through authorised distributors — not drop-shipped, not grey-market, not guesswork. If
          we wouldn&apos;t sell it across our own counter, it doesn&apos;t go on the site.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ icon: Icon, label, body }) => (
          <div key={label} className="flex flex-col gap-3">
            <Icon size={22} className="text-secondary" strokeWidth={1.75} />
            <h3 className="text-sm font-semibold">{label}</h3>
            <p className="text-sm leading-relaxed text-ink-400">{body}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 border-t border-line pt-10">
        <h2 className="font-display text-xl font-semibold">What we sell</h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-500">
          Bluetooth speakers, phone covers &amp; cases, chargers, cables &amp; power banks, USB
          and electric fans, hookah pipes &amp; accessories, mobile accessories, and LCD
          screens/digitizers &amp; repair parts sold as components — we don&apos;t offer repair
          services online, only the genuine parts, for customers and repair technicians who want
          to do the work themselves.
        </p>
        <Link href="/shop" className="btn-primary mt-6 inline-flex w-fit">
          Browse the shop
        </Link>
      </div>

      <div className="mt-16 border-t border-line pt-10">
        <h2 className="font-display text-xl font-semibold">Get in touch</h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-500">
          Questions about stock, an order, or whether something is compatible with your device?
          Visit our{" "}
          <Link href="/contact" className="font-medium text-ink underline underline-offset-4">
            contact page
          </Link>{" "}
          for our address, phone number and WhatsApp link.
        </p>
      </div>
    </div>
  );
}
