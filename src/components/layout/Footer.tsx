import Link from "next/link";
import Image from "next/image";

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
      { label: "Returns", href: "/returns" },
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

export function Footer() {
  return (
    <footer className="border-t border-line bg-ink text-paper">
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
        <div className="container-content flex flex-col items-center justify-between gap-3 py-6 text-xs text-paper/50 sm:flex-row">
          <span>&copy; {new Date().getFullYear()} A2Z Mobile & Computer Services. All rights reserved.</span>
          <span>PayFast &middot; Ozow &middot; EFT accepted</span>
        </div>
      </div>
    </footer>
  );
}
