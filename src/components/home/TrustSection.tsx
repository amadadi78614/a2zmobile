import { ShieldCheck, Truck, RotateCcw, Headphones } from "lucide-react";

const items = [
  {
    icon: ShieldCheck,
    title: "Genuine Products",
    body: "Every item sourced through authorised local distributors, never grey-market imports.",
  },
  {
    icon: Truck,
    title: "Fast Nationwide Delivery",
    body: "2–4 working day courier delivery across South Africa, with same-day delivery available in our local zone.",
  },
  {
    icon: RotateCcw,
    title: "7-Day Returns",
    body: "Change your mind within 7 days on unopened items, no questions asked.",
  },
  {
    icon: Headphones,
    title: "Real Support",
    body: "Speak to someone who actually knows the products — in-store or on WhatsApp.",
  },
];

export function TrustSection() {
  return (
    <section className="bg-mist py-16 md:py-20">
      <div className="container-content grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex flex-col gap-3">
            <Icon size={22} className="text-secondary" strokeWidth={1.75} />
            <h3 className="text-sm font-semibold">{title}</h3>
            <p className="text-sm leading-relaxed text-ink-400">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
