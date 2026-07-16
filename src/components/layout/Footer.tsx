import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Truck, RotateCcw, MessageCircle } from "lucide-react";

const columns = [
  {
    title: "Shop",
    links: [
      { label: "Bluetooth Speakers", href: "/shop?category=bluetooth-speakers" },
      { label: "Phone Covers", href: "/shop?category=phone-covers" },
      { label: "Chargers & Cables", href: "/shop?category=chargers-cables" },
      { label: "Hookah", href: "/shop?category=hookah" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Track Order", href: "/track-order" },
      { label: "Returns Policy", href: "/returns" },
      { label: "Shipping Info", href: "/shipping" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About A2Z", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

const trustStrip = [
  { icon: ShieldCheck, label: "Genuine stock only" },
  { icon: Truck, label: "Fast Mbombela delivery" },
  { icon: RotateCcw, label: "7-day returns" },
  { icon: MessageCircle, label: "Real WhatsApp support" },
];

// Recognisable "logo-style" payment badges without reproducing any payment provider's actual
// trademarked artwork (not fetchable/licensed here) — plain text carries far less instant trust
// than this, and it upgrades cleanly to real logo assets whenever the business supplies them.
const paymentBadges = ["PayFast", "Ozow", "EFT", "Visa", "Mastercard"];

export function Footer() {
  return (
    <footer className="border-t border-line bg-ink text-paper">
      <div className="border-b border-paper/10">
        <div className="container-content grid grid-cols-2 gap-6 py-8 sm:grid-cols-4">
          {trustStrip.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3">
              <Icon size={18} className="shrink-0 text-primary" strokeWidth={1.75} />
              <span className="text-xs font-medium text-paper/80">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="container-content grid grid-cols-2 gap-10 py-16 md:grid-cols-6">
        <div className="col-span-2">
          <div className="flex items-center gap-2">
            <Image src="/images/a2z-logo.png" alt="A2Z" width={36} height={36} />
            <span className="font-display text-lg font-semibold">A2Z</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-paper/60">
            Mobile accessories, speakers, power banks, fans and hookah essentials
            in Mbombela, South Africa. Genuine stock, honest pricing, local support.
          </p>
          <a
            href="https://wa.me/27000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 border border-paper/20 px-4 py-2.5 text-xs font-medium text-paper transition-colors hover:border-primary hover:text-primary"
          >
            <MessageCircle size={14} />
            Chat with us on WhatsApp
          </a>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="eyebrow text-paper/50">{col.title}</h4>
            <ul className="mt-4 flex flex-col gap-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-paper/80 hover:text-primary">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-paper/10">
        <div className="container-content flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <span className="text-xs text-paper/50">
            &copy; {new Date().getFullYear()} A2Z Mobile &amp; Computer Services. All rights reserved.
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {paymentBadges.map((label) => (
              <span
                key={label}
                className="border border-paper/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-paper/70"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
